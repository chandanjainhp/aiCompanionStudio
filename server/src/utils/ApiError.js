// Custom error class that extends JavaScript's built-in Error class
// This creates a standardized way to handle API errors with consistent structure
class ApiError extends Error {
    constructor (
        statusCode,                           // Required: HTTP status code (400, 404, 500, etc.)
        message = "Something went wrong",     // Optional: Error message with default fallback
        errors = [],                          // Optional: Array for detailed error information  
        stack = ""                           // Optional: Custom stack trace string
    ){
        // Call the parent Error class constructor with the message
        // This sets up the base Error object with .message and .name properties
        super(message)
        
        // Store the HTTP status code for API responses
        // This allows middleware to send appropriate HTTP status codes
        // Examples: 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
        this.statusCode = statusCode
        
        // Initialize data property as null
        // Can be used to attach additional context or debugging information
        this.data = null   
        
        // REDUNDANT: Remove this line since super(message) already sets this.message
        // The parent Error constructor already assigns the message property
        this.message = message            
        
        // Mark this as a failed operation
        // Used to distinguish between successful API responses and error responses
        this.success = false
        
        // BUG FIX: This should be 'errors' not 'this.errors'
        // Currently assigns the property to itself (doesn't set the value)
        this.errors = errors  // Fixed: was 'this.errors = this.errors'
        
        // Handle stack trace configuration
        if (stack) {
            // If a custom stack trace is provided, use it
            // Useful when rethrowing errors or creating errors from other contexts
            this.stack = stack
        } else {
            // Generate a proper stack trace excluding this constructor
            // Error.captureStackTrace creates a clean stack trace that shows
            // where the error was thrown, not where this constructor was called
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }