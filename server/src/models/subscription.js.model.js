// Import mongoose and Schema from the mongoose library
// mongoose: Object Document Mapper (ODM) for MongoDB and Node.js
// Schema: Used to define the structure and rules for MongoDB documents
import mongoose, { Schema } from "mongoose";

// Define the subscription schema to model user-to-user subscriptions
// This creates a many-to-many relationship between users (like YouTube subscriptions)
// Example: User A subscribes to User B's channel
const subcriptionSchema = new Schema({
    // subscriber: The user who is subscribing to another user's channel
    // This field stores the ObjectId of the user who clicked "subscribe"
    // Example: If John subscribes to Jane's videos, John's _id goes here
    subscriber : {
        type: Schema.type.ObjectiD, // Note: This has a typo - should be Schema.Types.ObjectId
        ref: "User" // Creates a reference to the User model for population
    }
    ,
    // channel: The user whose content is being subscribed to
    // This represents the "channel owner" or "content creator"
    // Both subscriber and channel reference the User model since any user can be both
    channel: {
        type:Schema.type.ObjectId,// one to whom 'subscriber' is subscribing
        ref: "User", // References the User model to identify the channel owner
    }

},{timeseries:true}) // Note: This should be "timestamps:true" to add createdAt/updatedAt fields

// Create and export the Subscription model
// Note: There are several typos in the model name and parameter structure
// This should be: mongoose.model("Subscription", subcriptionSchema)
export const Subscrtiption = mongoose.model({"Subsciption",subcriptionSchema})