// /imports/api/auth/server/email-templates.js
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

// Configure email templates for authentication emails
const appName = 'Strongly.AI';
const emailFrom = 'noreply@strongly.ai';
const emailFooter = `<div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
  <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
  <p>This is an automated email, please do not reply.</p>
</div>`;

// Common email styles
const emailStyles = `
  body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; }
  .email-container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .email-header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
  .email-header h1 { margin: 0; font-size: 24px; }
  .email-content { background-color: white; padding: 20px; border-radius: 0 0 4px 4px; border: 1px solid #eee; border-top: none; }
  .button { display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 4px; }
  .button:hover { background-color: #3c328d; }
`;

// Configure email templates
Accounts.emailTemplates.siteName = appName;
Accounts.emailTemplates.from = `${appName} <${emailFrom}>`;

// Reset Password Email
Accounts.emailTemplates.resetPassword = {
  subject() {
    return `Reset Your ${appName} Password`;
  },
  html(user, url) {
    // Replace '#/' with '' in the reset URL (Meteor default has #/)
    const resetUrl = url.replace('#/', '');

    return `
      <style>${emailStyles}</style>
      <div class="email-container">
        <div class="email-header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="email-content">
          <p>Hello,</p>
          <p>You've requested to reset your password for your ${appName} account.</p>
          <p>Click the button below to create a new password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>If you didn't request this, you can safely ignore this email and your password will remain unchanged.</p>
          <p>This link will expire in 3 days.</p>
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        ${emailFooter}
      </div>
    `;
  }
};

// Verify Email
Accounts.emailTemplates.verifyEmail = {
  subject() {
    return `Verify Your Email Address for ${appName}`;
  },
  html(user, url) {
    // Replace '#/' with '' in the verification URL (Meteor default has #/)
    const verificationUrl = url.replace('#/', '');

    return `
      <style>${emailStyles}</style>
      <div class="email-container">
        <div class="email-header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="email-content">
          <p>Hello,</p>
          <p>Thank you for registering with ${appName}. Please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email</a>
          </p>
          <p>If you didn't create an account with us, you can safely ignore this email.</p>
          <p>Please note that after verification, your account will need approval from an administrator before you can access all features.</p>
          <p>This link will expire in 7 days.</p>
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        ${emailFooter}
      </div>
    `;
  }
};

// Custom email for account approval
export const sendApprovalEmail = (user) => {
  if (!user || !user.emails || !user.emails[0]) {
    return;
  }

  const email = user.emails[0].address;
  const name = user.profile.name || 'there';

  Email.send({
    to: email,
    from: `${appName} <${emailFrom}>`,
    subject: `Your ${appName} Account Has Been Approved`,
    html: `
      <style>${emailStyles}</style>
      <div class="email-container">
        <div class="email-header">
          <h1>Account Approved</h1>
        </div>
        <div class="email-content">
          <p>Hello ${name},</p>
          <p>Great news! Your ${appName} account has been approved by an administrator.</p>
          <p>You can now log in and access all features of our platform.</p>
          <p style="text-align: center;">
            <a href="${Meteor.absoluteUrl('login')}" class="button">Log In Now</a>
          </p>
          <p>If you have any questions or need assistance, please contact our support team.</p>
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        ${emailFooter}
      </div>
    `
  });
};
