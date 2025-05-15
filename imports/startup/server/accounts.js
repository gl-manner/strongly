// /imports/api/auth/server/accounts.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

// Import email template helpers if they exist
try {
  import './email-templates';
} catch (e) {
  console.log('Email templates not found or error loading:', e.message);
}

// Import custom user creation hook
try {
  import '../hooks/onCreateUser';
} catch (e) {
  console.log('onCreateUser hook not found or error loading:', e.message);
}

// Configure account services
Meteor.startup(async () => {
  // Configure account services
  Accounts.config({
    sendVerificationEmail: true,
    forbidClientAccountCreation: false, // Allow client-side account creation
    loginExpirationInDays: 30
  });

  // Configure password reset token expiration (3 days)
  Accounts.emailTemplates.resetPassword.expirationDays = 3;

  // Configure email verification token expiration (7 days)
  Accounts.emailTemplates.verifyEmail.expirationDays = 7;

  // Set up rate limiting for Accounts methods
  // This approach is compatible with Meteor 3.x
  const accountMethodNames = [
    'changePassword',
    'forgotPassword',
    'resetPassword',
    'verifyEmail',
    'createUser',
  ];

  // Rate limit Accounts methods
  DDPRateLimiter.addRule({
    type: 'method',
    name(name) {
      return name.startsWith('login') || accountMethodNames.includes(name);
    },
    connectionId() { return true; }
  }, 5, 10000); // 5 requests per 10 seconds

  console.log('Accounts configuration completed');
});
