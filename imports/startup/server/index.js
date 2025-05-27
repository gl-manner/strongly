// /imports/startup/server/index.js
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { WebApp } from 'meteor/webapp';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

// Import data seeders
import { seedMarketplaceData } from './fixtures/marketplaceData';
import { seedFaqData } from './fixtures/faqData';

// Import server configurations
try {
  import './accounts';
} catch (e) {
  console.error('Error importing accounts configuration:', e);
}


Meteor.startup(async () => {
  try {
    console.log('Strongly.AI server starting up...');

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
      console.log('Default roles created successfully');
    }

    // Seed data
    console.log('Initializing data seeders...');

    try {
      // Seed marketplace data
      await seedMarketplaceData();
    } catch (e) {
      console.error('Error seeding marketplace data:', e);
    }

    try {
      // Seed FAQ data
      await seedFaqData();
    } catch (e) {
      console.error('Error seeding FAQ data:', e);
    }

    // Set up rate limiting for methods using DDPRateLimiter (Meteor 3.x approach)
    try {
      console.log('Configuring rate limiting...');

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

      // Rate limit marketplace methods
      DDPRateLimiter.addRule({
        type: 'method',
        name: 'marketplace.getItems',
        connectionId() { return true; }
      }, 30, 60000); // 30 requests per minute

      DDPRateLimiter.addRule({
        type: 'method',
        name: 'marketplace.getItem',
        connectionId() { return true; }
      }, 60, 60000); // 60 requests per minute

      // Rate limit FAQ methods
      DDPRateLimiter.addRule({
        type: 'method',
        name: 'faq.search',
        connectionId() { return true; }
      }, 30, 60000); // 30 requests per minute

      console.log('Rate limiting configured successfully');
    } catch (e) {
      console.error('Error setting up rate limiter:', e);
    }

    // Add rate limiting to WebApp if needed
    try {
      WebApp.connectHandlers.use('/api/', (req, res, next) => {
        // Add rate limiting for API endpoints if needed
        // You can add custom rate limiting logic here
        next();
      });
      console.log('WebApp middleware configured successfully');
    } catch (e) {
      console.error('Error setting up WebApp rate limiting:', e);
    }

    // Create indexes for better performance
    try {
      console.log('Creating database indexes...');

      // Marketplace indexes will be created by the seeder
      // FAQ indexes will be created by the seeder

      console.log('Database indexes configured');
    } catch (e) {
      console.error('Error creating database indexes:', e);
    }

    // Log that the server has started
    console.log('✅ Strongly.AI server started successfully');

  } catch (e) {
    console.error('❌ Error in server startup:', e);
  }
});
