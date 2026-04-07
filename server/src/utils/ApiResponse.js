// Standardized API response class for consistent response structure
class ApiResponse {
    constructor(
        statusCode,                  
        data, 
        message = "Success"
    ) {
        // Fixed: Consistent camelCase property naming
        this.statusCode = statusCode;
        
        // Store the response data (user info, API results, etc.)
        this.data = data;
        
        // Store the response message
        this.message = message;
        
        // Automatically determine success based on HTTP status code
        // 200-399: Success, 400+: Error
        this.success = statusCode < 400;
    }
}

export { ApiResponse }