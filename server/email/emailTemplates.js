export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">TMS - Verify Your Email</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #374151;">Hello,</p>
    <p style="font-size: 16px; color: #374151;">Thank you for signing up with TMS! Your verification code is:</p>
    <div style="text-align: center; margin: 35px 0; background: linear-gradient(135deg, #eef2ff 0%, #f3e8ff 50%, #fce7f3 100%); padding: 25px; border-radius: 10px; border: 2px solid #e0e7ff;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">{verificationCode}</span>
    </div>
    <p style="font-size: 15px; color: #374151;">Enter this code on the verification page to complete your registration.</p>
    <p style="font-size: 14px; color: #6b7280; background-color: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; border-radius: 5px; margin: 20px 0;">
      ⚠️ This code will expire in <strong>15 minutes</strong> for security reasons.
    </p>
    <p style="font-size: 14px; color: #6b7280;">If you didn't create an account with us, please ignore this email.</p>
    <p style="font-size: 16px; color: #374151; margin-top: 30px;">Best regards,<br><strong style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">TMS Team</strong></p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
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
  <title>Password Reset Successful</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">TMS - Password Reset Successful</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #374151;">Hello,</p>
    <p style="font-size: 16px; color: #374151;">We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 35px 0;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); color: white; width: 70px; height: 70px; line-height: 70px; border-radius: 50%; display: inline-block; font-size: 40px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);">
        ✓
      </div>
    </div>
    <p style="font-size: 14px; color: #6b7280; background-color: #fee2e2; padding: 12px; border-left: 4px solid #ef4444; border-radius: 5px; margin: 20px 0;">
      ⚠️ If you did not initiate this password reset, please contact our support team immediately.
    </p>
    <p style="font-size: 16px; color: #374151; margin-top: 20px;">For security reasons, we recommend that you:</p>
    <ul style="color: #4b5563; font-size: 15px; line-height: 1.8;">
      <li>Use a strong, unique password with uppercase, lowercase, numbers, and symbols</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
      <li>Never share your password with anyone</li>
    </ul>
    <p style="font-size: 15px; color: #374151;">Thank you for helping us keep your account secure.</p>
    <p style="font-size: 16px; color: #374151; margin-top: 30px;">Best regards,<br><strong style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">TMS Team</strong></p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
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
  <title>Reset Your Password</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">TMS - Password Reset</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #374151;">Hello,</p>
    <p style="font-size: 16px; color: #374151;">We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p style="font-size: 15px; color: #374151; margin-top: 20px;">To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 35px 0;">
      <a href="{resetURL}" style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); transition: transform 0.2s;">Reset Password</a>
    </div>
    <p style="font-size: 14px; color: #6b7280; margin-top: 25px;">Or copy and paste this link into your browser:</p>
    <p style="background: linear-gradient(135deg, #eef2ff 0%, #f3e8ff 50%, #fce7f3 100%); padding: 12px; border-radius: 8px; word-break: break-all; font-size: 13px; color: #4f46e5; border: 1px solid #e0e7ff;">{resetURL}</p>
    <p style="font-size: 14px; color: #6b7280; background-color: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; border-radius: 5px; margin: 20px 0;">
      ⚠️ This link will expire in <strong>1 hour</strong> for security reasons.
    </p>
    <p style="font-size: 16px; color: #374151; margin-top: 30px;">Best regards,<br><strong style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">TMS Team</strong></p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
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
