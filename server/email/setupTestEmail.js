import nodemailer from "nodemailer";

// Create a test account using Ethereal Email (for development only)
export const createTestEmailConfig = async () => {
  console.log("📧 Creating test email account...");
  
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    console.log("✅ Test email account created!");
    console.log("\n📋 Add these to your .env file:\n");
    console.log(`EMAIL_USER=${testAccount.user}`);
    console.log(`EMAIL_PASS=${testAccount.pass}`);
    console.log(`EMAIL_HOST=smtp.ethereal.email`);
    console.log(`EMAIL_PORT=587`);
    console.log("\n");

    // Create transporter for testing
    const transporter = nodemailer.createTransporter({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Send a test email
    console.log("📨 Sending test email...");
    const info = await transporter.sendMail({
      from: '"TMS Application" <noreply@tms.com>',
      to: testAccount.user,
      subject: "Test Email - Forgot Password",
      html: `
        <h1>Test Email Works!</h1>
        <p>Your forgot password feature is configured correctly.</p>
        <p>This is a test email service - emails won't actually be delivered.</p>
      `,
    });

    console.log("✅ Test email sent!");
    console.log("\n📧 View your email here:");
    console.log(nodemailer.getTestMessageUrl(info));
    console.log("\n");

  } catch (error) {
    console.error("❌ Error creating test account:", error.message);
  }
};

createTestEmailConfig();