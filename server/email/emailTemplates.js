export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - ChatForge</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%);">
  <div style="padding: 40px 20px 0;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 10px 30px rgba(79, 70, 229, 0.2);">
      <div style="display: inline-block; background: rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
        <span style="font-size: 24px;">⚡</span>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">ChatForge</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; font-weight: 500;">Verify Your Email Address</p>
    </div>

    <!-- Content -->
    <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 20px; font-weight: 500;">Hi there! 👋</p>
      <p style="font-size: 15px; color: #6b7280; margin: 0 0 30px; line-height: 1.8;">Thank you for joining <strong>ChatForge</strong>! We're excited to have you on board. To complete your registration, please verify your email address using the code below.</p>

      <!-- OTP Code Box -->
      <div style="background: linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%); border: 2px solid #e5e7eb; padding: 30px; border-radius: 12px; text-align: center; margin: 35px 0; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);">
        <p style="font-size: 12px; color: #9ca3af; margin: 0 0 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
        <span style="font-size: 44px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; font-family: 'Courier New', monospace;">{verificationCode}</span>
      </div>

      <!-- Instructions -->
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 20px;">Enter this code on the verification page to complete your registration.</p>

      <!-- Expiration Warning -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef08a 100%); border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin: 25px 0;">
        <p style="font-size: 13px; color: #92400e; margin: 0; font-weight: 500;">
          ⏱️ This code expires in <strong>15 minutes</strong>. Don't share it with anyone.
        </p>
      </div>

      <!-- Security Message -->
      <p style="font-size: 13px; color: #9ca3af; margin: 25px 0 0; line-height: 1.8;">
        If you didn't create an account with ChatForge, please ignore this email. If you believe this is a mistake, <a href="mailto:support@chatforge.io" style="color: #4f46e5; text-decoration: none; font-weight: 600;">contact our support team</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 30px 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0 0 8px;">Made with ❤️ by <strong style="color: #4f46e5;">ChatForge</strong></p>
      <p style="margin: 0; opacity: 0.7;">© 2026 ChatForge. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful - ChatForge</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%);">
  <div style="padding: 40px 20px 0;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);">
      <div style="display: inline-block; background: rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 24px;">✓</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">ChatForge</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; font-weight: 500;">Password Reset Successfully</p>
    </div>

    <!-- Content -->
    <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 20px; font-weight: 500;">Hi there! 👋</p>
      <p style="font-size: 15px; color: #6b7280; margin: 0 0 30px; line-height: 1.8;">Your password has been successfully reset. You can now log in to your ChatForge account with your new password.</p>

      <!-- Success Badge -->
      <div style="text-align: center; margin: 35px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #6ee7b7; padding: 20px; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);">
          <span style="font-size: 48px; color: #059669;">✓</span>
        </div>
      </div>

      <!-- Security Tips -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <p style="font-size: 14px; color: #15803d; margin: 0 0 15px; font-weight: 600;">🔐 Security Recommendations:</p>
        <ul style="color: #166534; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Use a strong password with mixed characters</li>
          <li>Don't reuse passwords across different sites</li>
          <li>Enable two-factor authentication if available</li>
          <li>Log out from other sessions if suspicious</li>
        </ul>
      </div>

      <!-- Alert -->
      <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin: 25px 0;">
        <p style="font-size: 13px; color: #991b1b; margin: 0; font-weight: 500;">
          ⚠️ If you didn't request this password reset, <a href="mailto:support@chatforge.io" style="color: #dc2626; text-decoration: underline; font-weight: 600;">contact support immediately</a>.
        </p>
      </div>

      <p style="font-size: 13px; color: #9ca3af; margin: 25px 0 0; line-height: 1.8;">
        You can now <a href="{loginURL}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">log in to your account</a> with your new password.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 30px 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0 0 8px;">Made with ❤️ by <strong style="color: #4f46e5;">ChatForge</strong></p>
      <p style="margin: 0; opacity: 0.7;">© 2026 ChatForge. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - ChatForge</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%);">
  <div style="padding: 40px 20px 0;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 10px 30px rgba(249, 115, 22, 0.2);">
      <div style="display: inline-block; background: rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 24px;">🔐</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">ChatForge</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; font-weight: 500;">Reset Your Password</p>
    </div>

    <!-- Content -->
    <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 20px; font-weight: 500;">Hi there! 👋</p>
      <p style="font-size: 15px; color: #6b7280; margin: 0 0 30px; line-height: 1.8;">We received a request to reset your password. Click the button below to create a new password.</p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="{resetURL}" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3); transition: transform 0.2s, box-shadow 0.2s;">Reset Password</a>
      </div>

      <!-- Link Fallback -->
      <p style="font-size: 13px; color: #6b7280; margin: 25px 0 10px; text-align: center;">Or copy and paste this link:</p>
      <div style="background: #f3f4f6; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; word-break: break-all; font-size: 12px; color: #4f46e5; font-family: 'Courier New', monospace; margin: 0 0 25px;">{resetURL}</div>

      <!-- Expiration & Security Info -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef08a 100%); border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin: 25px 0;">
        <p style="font-size: 13px; color: #92400e; margin: 0; font-weight: 500;">
          ⏱️ This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
        </p>
      </div>

      <!-- Security Notice -->
      <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px 20px; border-radius: 8px; margin: 15px 0;">
        <p style="font-size: 13px; color: #075985; margin: 0; line-height: 1.6;">
          💡 <strong>Tip:</strong> Create a strong password with a mix of uppercase, lowercase, numbers, and special characters for better security.
        </p>
      </div>

      <p style="font-size: 13px; color: #9ca3af; margin: 25px 0 0; line-height: 1.8;">
        Questions? <a href="mailto:support@chatforge.io" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Contact our support team</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 30px 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0 0 8px;">Made with ❤️ by <strong style="color: #4f46e5;">ChatForge</strong></p>
      <p style="margin: 0; opacity: 0.7;">© 2026 ChatForge. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_OTP_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🔐 TMS - Password Reset OTP</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #374151;">Hello Admin,</p>
    <p style="font-size: 16px; color: #374151;">We received a request to reset your admin password. Your One-Time Password (OTP) is:</p>
    <div style="text-align: center; margin: 35px 0; background: linear-gradient(135deg, #eef2ff 0%, #f3e8ff 50%, #fce7f3 100%); padding: 25px; border-radius: 10px; border: 2px solid #e0e7ff;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">{resetOTP}</span>
    </div>
    <p style="font-size: 15px; color: #374151;">Enter this OTP on the password reset page to create your new password.</p>
    <p style="font-size: 14px; color: #6b7280; background-color: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; border-radius: 5px; margin: 20px 0;">
      ⚠️ This OTP will expire in <strong>15 minutes</strong> for security reasons.
    </p>
    <p style="font-size: 14px; color: #6b7280; background-color: #fee2e2; padding: 12px; border-left: 4px solid #ef4444; border-radius: 5px; margin: 20px 0;">
      🚨 If you didn't request this password reset, please contact support immediately at <strong>backupid849@gmail.com</strong>
    </p>
    <p style="font-size: 16px; color: #374151; margin-top: 30px;">Best regards,<br><strong style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">TMS Admin Team</strong></p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
