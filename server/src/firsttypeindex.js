
// Import mongoose library for MongoDB database operations
import mongoose from "mongoose";
// Import express framework for creating web server
import express from "express"

// Create an Express application instance
const app = express()

// IIFE (Immediately Invoked Function Expression) - runs as soon as it's defined
// This is an async function that executes immediately when the file is loaded
( async () => {
    try {
        // Attempt to connect to MongoDB database
        // Uses environment variable MONGODB_URI combined with DB_NAME
        // Note: DB_NAME needs to be imported or defined for this to work
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        
        // Set up error event listener for the Express app
        // This catches any errors that occur during app operation
        // Note: There's a typo here - "errror" should be "error"
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        // Start the Express server on the port specified in environment variables
        // The server will listen for incoming HTTP requests on this port
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        // If any error occurs during database connection or server startup
        // Log the error and re-throw it to crash the application
        console.error("ERROR: ", error)
        // Note: 'err' is not defined, should be 'error'
        throw err
    }
})()