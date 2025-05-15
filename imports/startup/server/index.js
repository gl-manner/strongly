// /imports/startup/server/index.js
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { WebApp } from 'meteor/webapp';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

// Import server configurations
try {
  import './accounts';
} catch (e) {
  console.error('Error importing accounts configuration:', e);
}

// Import fixtures if they exist
try {
  import './fixtures';
} catch (e) {
  console.log('No fixtures found or error loading fixtures:', e.message);
}

// Import FAQ fixtures
try {
  import './faq-fixtures';
} catch (e) {
  console.log('No FAQ fixtures found or error loading FAQ fixtures:', e.message);
}

// Import API publications and methods
try {
  import '/imports/api/faq/publications';
  import '/imports/api/faq/methods';
} catch (e) {
  console.log('Error importing FAQ API files:', e.message);
}

Meteor.startup(async () => {
  try {
    // Initialize roles if they don't exist
    // Use countAsync() instead of count() in Meteor 3
    const roleCount = await Roles.getAllRoles().countAsync();
    if (roleCount === 0) {
      console.log('Creating default roles...');
      // Use createRoleAsync if available, otherwise fall back to createRole
      if (typeof Roles.createRoleAsync === 'function') {
        await Roles.createRoleAsync('admin');
        await Roles.createRoleAsync('user');
      } else {
        console.log('Using synchronous createRole (not recommended)');
        Roles.createRole('admin');
        Roles.createRole('user');
      }
    }

    // Set up rate limiting for methods using DDPRateLimiter (Meteor 3.x approach)
    try {
      // Rate limit login attempts
      DDPRateLimiter.addRule({
        type: 'method',
        name: 'login',
        connectionId() { return true; }
      }, 5, 60000); // 5 requests per minute

      // Rate limit registration
      DDPRateLimiter.addRule({
        type: 'method',
        name: 'auth.register',
        connectionId() { return true; }
      }, 3, 60000); // 3 requests per minute

      // Rate limit password reset
      DDPRateLimiter.addRule({
        type: 'method',
        name: 'auth.forgotPassword',
        connectionId() { return true; }
      }, 3, 60000); // 3 requests per minute

      console.log('Rate limiting configured successfully');
    } catch (e) {
      console.error('Error setting up rate limiter:', e);
    }

    // Add rate limiting to WebApp if needed
    try {
      WebApp.connectHandlers.use('/api/', (req, res, next) => {
        // Add rate limiting for API endpoints if needed
        next();
      });
    } catch (e) {
      console.error('Error setting up WebApp rate limiting:', e);
    }

    // Log that the server has started
    console.log('Strongly.AI server started');
  } catch (e) {
    console.error('Error in server startup:', e);
  }
});
