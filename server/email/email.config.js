import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from the appropriate .env file
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

// Check environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("Missing environment variables: EMAIL_USER or EMAIL_PASS");
} else if (process.env.NODE_ENV !== 'production') {
  console.log("Email environment variables loaded successfully");
}

// Configure Nodemailer transporter
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL for secure connection
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your app-specific password
  },
  // Only enable debugging in development
  debug: process.env.NODE_ENV !== 'production',
  logger: process.env.NODE_ENV !== 'production'
});

// Log email user only in development mode
if (process.env.NODE_ENV !== 'production') {
  console.log("Email User:", process.env.EMAIL_USER);
}

// Default sender information
export const sender = {
  email: process.env.EMAIL_USER,
  name: "TMS",
};
