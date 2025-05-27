// /server/email-config.js
import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

  if (!process.env.MAIL_URL) {
    console.warn('⚠️  MAIL_URL environment variable is not set. Email functionality will not work.');
    console.log('To set up email, export MAIL_URL with your SMTP configuration:');
    console.log('export MAIL_URL="smtps://support@strongly.ai:your_encoded_password@smtp.gmail.com:465"');
  } else {
    console.log('✅ Email configuration loaded successfully');
  }

  // Optional: Set default FROM address
  if (Meteor.isServer) {
    process.env.MAIL_FROM = process.env.MAIL_FROM || 'support@strongly.ai';
    console.log(`📧 Default FROM address: ${process.env.MAIL_FROM}`);
  }
});

// Email configuration validation helper
export const validateEmailConfig = () => {
  if (!process.env.MAIL_URL) {
    throw new Meteor.Error('email-not-configured',
      'Email service is not configured. Please contact support.');
  }
};

// Startup instructions for development
if (Meteor.isDevelopment) {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                           EMAIL CONFIGURATION                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  To enable email functionality, set the MAIL_URL environment variable:       ║
║                                                                              ║
║  For Gmail SMTP:                                                             ║
║  export MAIL_URL=""                                                          ║
║                                                                              ║
║  Note: Password is URL encoded (spaces = %20)                                ║
║                                                                              ║
║  Then restart your Meteor application:                                       ║
║  meteor run                                                                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `);
}
