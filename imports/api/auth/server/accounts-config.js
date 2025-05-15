// /imports/api/auth/server/accounts-config.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Import email template helpers
import './email-templates';

// Import custom user creation hook
import '../hooks/onCreateUser';

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

// Configure login attempt rate limiting
Accounts.loginRateLimiter.options.limitToIP = true;
Accounts.loginRateLimiter.options.numTests = 3;
Accounts.loginRateLimiter.options.timeInterval = 1000; // 1 second
