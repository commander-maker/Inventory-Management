// Email service for sending emails
import nodemailer from 'nodemailer';

// Create a transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Add to .env
    pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Add to .env (use App Password for Gmail)
  }
});

export const sendPasswordEmail = async (userEmail, userName, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'AquaTrack Pro <noreply@aquatrack.com>',
    to: userEmail,
    subject: 'Welcome to AquaTrack Pro - Your Account Credentials',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #000; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .credentials { background-color: #fff; padding: 20px; margin: 20px 0; border-left: 4px solid #000; }
          .password { font-size: 24px; font-weight: bold; color: #000; letter-spacing: 2px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to AquaTrack Pro</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Your account has been successfully created by the administrator. Below are your login credentials:</p>
            
            <div class="credentials">
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Password:</strong></p>
              <p class="password">${password}</p>
            </div>
            
            <p><strong>⚠️ Important Security Notes:</strong></p>
            <ul>
              <li>Please change your password after your first login</li>
              <li>Keep your credentials secure and don't share them with anyone</li>
              <li>If you didn't expect this email, please contact the administrator immediately</li>
            </ul>
            
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login Now</a>
            </center>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AquaTrack Pro. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't throw error - just log it, so user creation still succeeds
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'AquaTrack Pro <noreply@aquatrack.com>',
    to: userEmail,
    subject: 'Password Reset Request - AquaTrack Pro',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};
