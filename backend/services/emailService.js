const nodemailer = require("nodemailer");

// Validate required email environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const PLACEHOLDER_USER = "your-gmail-address@gmail.com";
const PLACEHOLDER_PASS = "your-app-specific-password";

const userMissing = !EMAIL_USER || EMAIL_USER === PLACEHOLDER_USER;
const passMissing = !EMAIL_PASSWORD || EMAIL_PASSWORD === PLACEHOLDER_PASS;
const credentialsMissing = userMissing || passMissing;

if (userMissing) {
  console.warn(
    "⚠️  EMAIL_USER is not configured. Set a real Gmail address in backend/.env"
  );
}
if (passMissing) {
  console.warn(
    "⚠️  EMAIL_PASSWORD is not configured. Set a Gmail App Password in backend/.env\n" +
    "   To generate one: Google Account → Security → 2-Step Verification → App passwords"
  );
}

// Configure Gmail SMTP transporter (created only when credentials are present)
let transporter = null;
if (!credentialsMissing) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
}

// Function to send OTP email
const sendOTPEmail = async (email, otp, userName) => {
  // Guard: return a clear error if credentials are not configured
  if (credentialsMissing) {
    console.error(
      "❌ Email credentials are not configured. " +
      "Set EMAIL_USER and EMAIL_PASSWORD (Gmail App Password) in backend/.env"
    );
    return {
      success: false,
      message:
        "Email service is not configured. Please contact the administrator.",
    };
  }

  // Gmail SMTP requires the authenticated address as the sender.
  // Using a different domain (e.g. noreply@...) as "from" causes auth errors.
  const mailOptions = {
    from: `"E-Learning Platform" <${EMAIL_USER}>`,
    to: email,
    subject: "Password Reset - Verify Your Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2C3E50; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">📚 E-Learning Platform</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Password Reset Request</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 40px 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Hello ${userName || "User"},
          </p>

          <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your password. Use the code below to verify your email address.
          </p>

          <!-- OTP Display -->
          <div style="background-color: white; border: 2px solid #1899A3; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
            <p style="font-size: 12px; color: #666; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
            <div style="font-size: 36px; font-weight: bold; color: #2C3E50; letter-spacing: 4px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>

          <div style="background-color: #FFF3CD; border-left: 4px solid #E67E22; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
            <p style="margin: 0; color: #856404; font-size: 13px;">
              ⏱️ <strong>This code expires in 15 minutes.</strong> Do not share this code with anyone.
            </p>
          </div>

          <p style="font-size: 13px; color: #666; margin-bottom: 30px;">
            If you didn't request this password reset, please ignore this email and your account will remain secure.
          </p>

          <div style="border-top: 1px solid #ddd; padding-top: 20px;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              © 2026 E-Learning Platform. All rights reserved.<br>
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Email sending error:", error);

    let friendlyMessage = "Failed to send OTP email, please try again";
    if (error.code === "EAUTH" || error.responseCode === 535) {
      friendlyMessage =
        "Email authentication failed. Ensure EMAIL_USER and EMAIL_PASSWORD " +
        "(Gmail App Password) are correctly set in backend/.env";
    } else if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      friendlyMessage = "Could not connect to email server. Check your network connection.";
    }

    return {
      success: false,
      message: friendlyMessage,
      error: error.message,
    };
  }
};

module.exports = { sendOTPEmail };
