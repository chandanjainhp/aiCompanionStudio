// src/config/email.js
import nodemailer from 'nodemailer';
import { config } from './env.js';

let transporter = null;

export const initializeEmailTransporter = () => {
  transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: config.emailPort === 465, // true for 465, false for other ports
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });

  // Log email configuration (without password)
  console.log(`📧 [Email Config] Initialized with:`);
  console.log(`   Host: ${config.emailHost}`);
  console.log(`   Port: ${config.emailPort}`);
  console.log(`   Secure: ${config.emailPort === 465}`);
  console.log(`   User: ${config.emailUser}`);

  return transporter;
};

export const getEmailTransporter = () => {
  if (!transporter) {
    return initializeEmailTransporter();
  }
  return transporter;
};

/**
 * Send email with individual parameters
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content (optional)
 */
export const sendEmail = async (to, subject, html, text) => {
  try {
    if (!to) {
      throw new Error('No recipients defined');
    }

    const emailTransporter = getEmailTransporter();
    
    const info = await emailTransporter.sendMail({
      from: config.emailFrom,
      to,
      subject,
      text: text || subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send email with options object
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
export const sendEmailWithOptions = async (options) => {
  const { to, subject, html, text } = options;
  return sendEmail(to, subject, html, text);
};
