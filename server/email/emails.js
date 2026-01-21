import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_OTP_TEMPLATE } from "./emailTemplates.js";
import { transporter, sender } from "./email.config.js";

// Utility function to send emails
const sendEmail = async ({ to, subject, html, category, templateUuid, templateVariables }) => {
  const mailOptions = {
    from: `${sender.name} <${sender.email}>`,
    to: to,
    subject: subject,
    html: html,
  };

  // Log the mail options for debugging
  console.log("Sending email with the following options:", mailOptions);

  try {
    const response = await transporter.sendMail(mailOptions);
    console.log(`${category} email sent successfully`, response);
    return response;
  } catch (error) {
    console.error(`Error sending ${category} email:`, error);
    console.log("Error details:", error);
    throw new Error(`Error sending ${category} email: ${error.message}`);
  }
};

// Send verification email
export const sendVerificationEmail = async (email, verificationToken) => {
  console.log(`Sending verification email to ${email}...`);  // Debug log
  return sendEmail({
    to: email,
    subject: "Verify your email",
    html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
    category: "Email Verification",
  });
};

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  console.log(`Sending welcome email to ${email}...`);  // Debug log
  return sendEmail({
    to: email,
    subject: "Welcome to AI Companion Studio",
    html: `<h1>Welcome, ${name}!</h1><p>We're glad to have you with us.</p>`,
    category: "Welcome Email",
  });
};

// Send password reset request email
export const sendPasswordResetEmail = async (email, resetURL) => {
  // Debug log to verify email
  console.log(`Sending password reset request email to: ${email}`);

  // Debug log to verify the reset URL
  console.log(`Password reset URL: ${resetURL}`);

  // Send the email
  return sendEmail({
    to: email,
    subject: "Reset your password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    category: "Password Reset Request"
  });
};


// Send password reset success email
export const sendResetSuccessEmail = async (email) => {

  console.log(`Sending password reset success email to ${email}...`);  // Debug log
  return sendEmail({
    to: email,
    subject: "Password Reset Successful",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    category: "Password Reset Success",
  });
};

// Send password reset OTP email (for admin)
export const sendPasswordResetOTP = async (email, otp) => {
  console.log(`Sending password reset OTP email to ${email}...`);  // Debug log
  return sendEmail({
    to: email,
    subject: "Admin Password Reset OTP - AI Companion Studio",
    html: PASSWORD_RESET_OTP_TEMPLATE.replace("{resetOTP}", otp),
    category: "Password Reset OTP",
  });
};

// Send password reset OTP email (for regular users)
export const sendPasswordResetOTPEmail = async (email, otp) => {
  console.log(`Sending password reset OTP email to ${email}...`);  // Debug log
  return sendEmail({
    to: email,
    subject: "Password Reset OTP - AI Companion Studio",
    html: PASSWORD_RESET_OTP_TEMPLATE.replace("{resetOTP}", otp),
    category: "Password Reset OTP",
  });
};

