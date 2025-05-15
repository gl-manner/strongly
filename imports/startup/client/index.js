// /imports/startup/client/index.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Configure client-side accounts package
Accounts.config({
  sendVerificationEmail: true,
  forbidClientAccountCreation: false
});

// Initialize NobleUI JavaScript
Meteor.startup(() => {
  // Load NobleUI JavaScript files if needed
  import('/public/assets/js/nobleui.js')
    .then(() => {
      console.log('NobleUI JavaScript loaded');
    })
    .catch((error) => {
      console.error('Error loading NobleUI JavaScript:', error);
    });

  // Initialize any global settings or client-side configurations
  console.log('Strongly.AI client initialized');
});
