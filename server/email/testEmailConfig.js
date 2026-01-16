import { transporter, sender } from "./email.config.js";
import dotenv from "dotenv";

dotenv.config();

const testEmail = async () => {
  console.log("🧪 Testing Email Configuration...\n");
  
  // Check if environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL_USER or EMAIL_PASS not found in .env file!");
    console.log("Please update your .env file with Gmail credentials.");
    process.exit(1);
  }

  console.log("📧 Email User:", process.env.EMAIL_USER);
  console.log("🔑 Email Password:", "****" + (process.env.EMAIL_PASS?.slice(-4) || "Not set"));
  console.log("\n");

  try {
    // Verify connection
    console.log("🔗 Verifying connection to Gmail SMTP server...");
    await transporter.verify();
    console.log("✅ Connection successful!\n");

    // Send test email
    console.log("📨 Sending test email...");
    const testEmailAddress = process.env.EMAIL_USER; // Send to yourself
    
    const info = await transporter.sendMail({
      from: `${sender.name} <${sender.email}>`,
      to: testEmailAddress,
      subject: "✅ TMS - Email Configuration Test",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .success { background-color: #4CAF50; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Email Configuration Test</h1>
            </div>
            <div class="content">
              <h2>Congratulations!</h2>
              <p>Your TMS application email configuration is working perfectly!</p>
              
              <div class="success">
                <strong>✓ Email Sending is Configured Correctly</strong>
              </div>
              
              <p><strong>What this means:</strong></p>
              <ul>
                <li>✅ Users can now receive verification emails</li>
                <li>✅ Password reset emails will be sent successfully</li>
                <li>✅ Welcome emails will be delivered to new users</li>
              </ul>
              
              <p><strong>Configuration Details:</strong></p>
              <ul>
                <li><strong>Email Service:</strong> Gmail SMTP</li>
                <li><strong>From Address:</strong> ${sender.email}</li>
                <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              
              <p style="margin-top: 30px; padding: 15px; background-color: #e8f5e9; border-left: 4px solid #4CAF50;">
                <strong>🎉 Your Forgot Password feature is now ready to use!</strong>
              </p>
              
              <p style="margin-top: 30px; color: #888; font-size: 0.9em;">
                This is an automated test email from your TMS Teacher Management System.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("📬 Message ID:", info.messageId);
    console.log("📧 Email sent to:", testEmailAddress);
    console.log("\n✨ Check your inbox (and spam folder) for the test email!\n");
    console.log("🎉 Your forgot password feature is ready to use!");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Email test failed!");
    console.error("Error:", error.message);
    
    if (error.message.includes("Invalid login")) {
      console.log("\n💡 Troubleshooting Tips:");
      console.log("1. Make sure you're using an App Password, not your regular Gmail password");
      console.log("2. Enable 2-Step Verification in your Google Account");
      console.log("3. Generate a new App Password for 'Mail' application");
      console.log("4. Remove all spaces from the app password in .env file");
    }
    
    process.exit(1);
  }
};

testEmail();