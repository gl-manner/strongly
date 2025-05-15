// /imports/startup/server/fixtures.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

// Check if FaqCollection is available, if not, don't worry about it
let FaqCollection;
try {
  FaqCollection = require('/imports/api/faq/collection').FaqCollection;
} catch (e) {
  console.log('FaqCollection not found:', e.message);
}

// Insert initial data for development and testing
Meteor.startup(async () => {
  // Create default admin user if no users exist
  try {
    const userCount = await Meteor.users.countDocuments();

    if (userCount === 0) {
      console.log('Creating default admin user...');

      // Get admin credentials from settings or use defaults
      const adminEmail = Meteor.settings?.admin?.email || 'admin@strongly.ai';
      const adminPassword = Meteor.settings?.admin?.password || 'password123';

      try {
        // Create admin user
        const adminId = await Accounts.createUserAsync({
          email: adminEmail,
          password: adminPassword,
          profile: {
            name: 'Admin User',
            approved: true,
            active: true,
            createdAt: new Date()
          }
        });

        // Add admin role
        Roles.addUsersToRoles(adminId, ['admin', 'user']);

        // Mark email as verified
        await Meteor.users.updateAsync({ _id: adminId }, {
          $set: {
            'emails.0.verified': true
          }
        });

        console.log(`Default admin user created with email: ${adminEmail}`);

        // Create test user
        const testUserId = await Accounts.createUserAsync({
          email: 'user@strongly.ai',
          password: 'password123',
          profile: {
            name: 'Test User',
            approved: true,
            active: true,
            createdAt: new Date()
          }
        });

        // Add user role
        Roles.addUsersToRoles(testUserId, ['user']);

        // Mark email as verified
        await Meteor.users.updateAsync({ _id: testUserId }, {
          $set: {
            'emails.0.verified': true
          }
        });

        console.log('Test user created with email: user@strongly.ai');
      } catch (error) {
        console.error('Error creating default users:', error);
      }
    }

    // Only create FAQs if the collection exists
    if (FaqCollection) {
      // Create default FAQs if none exist
      const faqCount = await FaqCollection.countDocuments();

      if (faqCount === 0) {
        console.log('Creating default FAQ items...');

        const adminUser = await Meteor.users.findOneAsync({ 'emails.address': 'admin@strongly.ai' });
        const userId = adminUser ? adminUser._id : null;

        if (!userId) {
          console.warn('Could not find admin user to create FAQs');
          return;
        }

        // Initial FAQ items
        const faqItems = [
          {
            question: 'What is Strongly.AI?',
            answer: 'Strongly.AI is a powerful platform that helps organizations leverage artificial intelligence and machine learning technologies to solve complex problems.',
            category: 'general',
            order: 1,
            isPublished: true
          },
          {
            question: 'How do I get started with Strongly.AI?',
            answer: 'To get started, create an account and wait for admin approval. Once approved, you\'ll be able to access all features of the platform. Check out our documentation for detailed guides on how to use Strongly.AI effectively.',
            category: 'general',
            order: 2,
            isPublished: true
          },
          {
            question: 'Why do I need admin approval for my account?',
            answer: 'Admin approval is required to ensure that only authorized individuals can access the platform. This helps us maintain security and provide a better experience for all users.',
            category: 'account',
            order: 1,
            isPublished: true
          },
          {
            question: 'How can I change my password?',
            answer: 'You can change your password by going to your profile page and clicking on the "Change Password" button. You\'ll need to enter your current password and then your new password twice to confirm the change.',
            category: 'account',
            order: 2,
            isPublished: true
          },
          {
            question: 'What features does Strongly.AI offer?',
            answer: 'Strongly.AI offers a wide range of features including data analysis, machine learning model training, predictive analytics, natural language processing, and more. The specific features available to you depend on your access level and subscription.',
            category: 'features',
            order: 1,
            isPublished: true
          },
          {
            question: 'Is my data secure with Strongly.AI?',
            answer: 'Yes, we take data security very seriously. All data is encrypted both in transit and at rest, and we implement strict access controls to ensure that your data is protected. We also comply with industry standards and regulations regarding data protection.',
            category: 'technical',
            order: 1,
            isPublished: true
          },
          {
            question: 'What browsers are supported?',
            answer: 'Strongly.AI works best with modern browsers like Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari. We recommend keeping your browser updated to the latest version for the best experience.',
            category: 'technical',
            order: 2,
            isPublished: true
          },
          {
            question: 'How can I contact support?',
            answer: 'You can contact our support team by emailing support@strongly.ai. Our support team is available Monday to Friday, 9am to 5pm Eastern Time.',
            category: 'general',
            order: 3,
            isPublished: true
          }
        ];

        // Insert FAQ items
        for (const faq of faqItems) {
          try {
            await FaqCollection.insertAsync({
              ...faq,
              createdBy: userId,
              createdAt: new Date()
            });
          } catch (error) {
            console.error(`Error creating FAQ item "${faq.question}":`, error);
          }
        }

        console.log(`Created ${faqItems.length} FAQ items`);
      }
    }
  } catch (error) {
    console.error('Error in fixtures:', error);
  }
});
