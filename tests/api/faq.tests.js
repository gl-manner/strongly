// /tests/api/faq.tests.js
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { FaqCollection } from '/imports/api/faq/collection';

if (Meteor.isServer) {
  describe('FAQ API', function() {
    let userId;
    let adminId;
    let faqId;

    beforeEach(function() {
      // Reset database before each test
      resetDatabase();

      // Create a test user
      userId = Accounts.createUser({
        email: 'test@example.com',
        password: 'password123',
        profile: {
          name: 'Test User',
          approved: true,
          active: true
        }
      });

      // Create an admin user
      adminId = Accounts.createUser({
        email: 'admin@example.com',
        password: 'password123',
        profile: {
          name: 'Admin User',
          approved: true,
          active: true
        }
      });

      // Add admin role to admin user
      Roles.addUsersToRoles(adminId, ['admin']);

      // Add user role to test user
      Roles.addUsersToRoles(userId, ['user']);

      // Create a test FAQ
      faqId = FaqCollection.insert({
        question: 'Test Question',
        answer: 'Test Answer',
        category: 'general',
        order: 0,
        isPublished: true,
        createdBy: adminId,
        createdAt: new Date()
      });
    });

    describe('faq.create', function() {
      it('should not allow a regular user to create an FAQ', function() {
        // Set up method arguments
        const faqData = {
          question: 'New Question',
          answer: 'New Answer',
          category: 'general',
          order: 1,
          isPublished: true
        };

        // Call the method as a regular user
        const createFaq = Meteor.server.method_handlers['faq.create'];
        const invocation = { userId };

        // Should throw an error
        assert.throws(
          () => {
            createFaq.apply(invocation, [faqData]);
          },
          Meteor.Error,
          'not-authorized'
        );
      });

      it('should allow an admin to create an FAQ', function() {
        // Set up method arguments
        const faqData = {
          question: 'New Question',
          answer: 'New Answer',
          category: 'general',
          order: 1,
          isPublished: true
        };

        // Call the method as the admin user
        const createFaq = Meteor.server.method_handlers['faq.create'];
        const invocation = { userId: adminId };

        const newFaqId = createFaq.apply(invocation, [faqData]);

        // Verify that the FAQ was created
        const faq = FaqCollection.findOne(newFaqId);
        assert.equal(faq.question, 'New Question');
        assert.equal(faq.answer, 'New Answer');
        assert.equal(faq.category, 'general');
        assert.equal(faq.order, 1);
        assert.isTrue(faq.isPublished);
        assert.equal(faq.createdBy, adminId);
        assert.instanceOf(faq.createdAt, Date);
      });
    });

    describe('faq.update', function() {
      it('should not allow a regular user to update an FAQ', function() {
        // Set up method arguments
        const updates = {
          question: 'Updated Question',
          answer: 'Updated Answer'
        };

        // Call the method as a regular user
        const updateFaq = Meteor.server.method_handlers['faq.update'];
        const invocation = { userId };

        // Should throw an error
        assert.throws(
          () => {
            updateFaq.apply(invocation, [faqId, updates]);
          },
          Meteor.Error,
          'not-authorized'
        );
      });

      it('should allow an admin to update an FAQ', function() {
        // Set up method arguments
        const updates = {
          question: 'Updated Question',
          answer: 'Updated Answer',
          category: 'technical',
          isPublished: false
        };

        // Call the method as the admin user
        const updateFaq = Meteor.server.method_handlers['faq.update'];
        const invocation = { userId: adminId };

        updateFaq.apply(invocation, [faqId, updates]);

        // Verify that the FAQ was updated
        const faq = FaqCollection.findOne(faqId);
        assert.equal(faq.question, 'Updated Question');
        assert.equal(faq.answer, 'Updated Answer');
        assert.equal(faq.category, 'technical');
        assert.isFalse(faq.isPublished);
        assert.equal(faq.updatedBy, adminId);
        assert.instanceOf(faq.updatedAt, Date);
      });
    });

    describe('faq.delete', function() {
      it('should not allow a regular user to delete an FAQ', function() {
        // Call the method as a regular user
        const deleteFaq = Meteor.server.method_handlers['faq.delete'];
        const invocation = { userId };

        // Should throw an error
        assert.throws(
          () => {
            deleteFaq.apply(invocation, [faqId]);
          },
          Meteor.Error,
          'not-authorized'
        );
      });

      it('should allow an admin to delete an FAQ', function() {
        // Call the method as the admin user
        const deleteFaq = Meteor.server.method_handlers['faq.delete'];
        const invocation = { userId: adminId };

        deleteFaq.apply(invocation, [faqId]);

        // Verify that the FAQ was deleted
        const faq = FaqCollection.findOne(faqId);
        assert.isUndefined(faq);
      });
    });

    describe('faq.reorder', function() {
      it('should not allow a regular user to reorder FAQs', function() {
        // Create additional FAQs for reordering
        const faqId2 = FaqCollection.insert({
          question: 'Test Question 2',
          answer: 'Test Answer 2',
          category: 'general',
          order: 1,
          isPublished: true,
          createdBy: adminId,
          createdAt: new Date()
        });

        // Set up method arguments
        const orderedItems = [
          { id: faqId, order: 1 },
          { id: faqId2, order: 0 }
        ];

        // Call the method as a regular user
        const reorderFaq = Meteor.server.method_handlers['faq.reorder'];
        const invocation = { userId };

        // Should throw an error
        assert.throws(
          () => {
            reorderFaq.apply(invocation, [orderedItems]);
          },
          Meteor.Error,
          'not-authorized'
        );
      });

      it('should allow an admin to reorder FAQs', function() {
        // Create additional FAQs for reordering
        const faqId2 = FaqCollection.insert({
          question: 'Test Question 2',
          answer: 'Test Answer 2',
          category: 'general',
          order: 1,
          isPublished: true,
          createdBy: adminId,
          createdAt: new Date()
        });

        // Set up method arguments
        const orderedItems = [
          { id: faqId, order: 1 },
          { id: faqId2, order: 0 }
        ];

        // Call the method as the admin user
        const reorderFaq = Meteor.server.method_handlers['faq.reorder'];
        const invocation = { userId: adminId };

        reorderFaq.apply(invocation, [orderedItems]);

        // Verify that the FAQs were reordered
        const faq1 = FaqCollection.findOne(faqId);
        const faq2 = FaqCollection.findOne(faqId2);

        assert.equal(faq1.order, 1);
        assert.equal(faq2.order, 0);
        assert.equal(faq1.updatedBy, adminId);
        assert.instanceOf(faq1.updatedAt, Date);
        assert.equal(faq2.updatedBy, adminId);
        assert.instanceOf(faq2.updatedAt, Date);
      });
    });

    describe('FAQ publications', function() {
      it('faq.published should return only published FAQs', function() {
        // Create an unpublished FAQ
        const unpublishedFaqId = FaqCollection.insert({
          question: 'Unpublished Question',
          answer: 'Unpublished Answer',
          category: 'general',
          order: 2,
          isPublished: false,
          createdBy: adminId,
          createdAt: new Date()
        });

        // Execute the publication as a regular user
        const collector = new PublicationCollector({ userId });
        let publishedItems;

        collector.collect('faq.published', (collections) => {
          publishedItems = collections.faqs;
        });

        // Should return only the published FAQ
        assert.equal(publishedItems.length, 1);
        assert.equal(publishedItems[0]._id, faqId);
      });

      it('faq.all should return all FAQs for admin', function() {
        // Create an unpublished FAQ
        const unpublishedFaqId = FaqCollection.insert({
          question: 'Unpublished Question',
          answer: 'Unpublished Answer',
          category: 'general',
          order: 2,
          isPublished: false,
          createdBy: adminId,
          createdAt: new Date()
        });

        // Execute the publication as an admin user
        const collector = new PublicationCollector({ userId: adminId });
        let allItems;

        collector.collect('faq.all', (collections) => {
          allItems = collections.faqs;
        });

        // Should return all FAQs
        assert.equal(allItems.length, 2);
      });

      it('faq.all should not return any FAQs for regular users', function() {
        // Execute the publication as a regular user
        const collector = new PublicationCollector({ userId });
        let allItems;

        collector.collect('faq.all', (collections) => {
          allItems = collections.faqs || [];
        });

        // Should not return any FAQs
        assert.equal(allItems.length, 0);
      });
    });
  });
}
