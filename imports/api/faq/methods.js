// /imports/api/faq/methods.js
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { FaqCollection } from './collection';

Meteor.methods({
  /**
   * Create a new FAQ item (admin only)
   * @param {Object} faqData - FAQ data
   * @returns {String} faqId - ID of the created FAQ
   */
  'faq.create': async function(faqData) {
    check(faqData, {
      question: String,
      answer: String,
      category: String,
      order: Match.Maybe(Number),
      isPublished: Match.Maybe(Boolean)
    });

    // Check if user is logged in and is admin
    if (!this.userId) {
      throw new Meteor.Error('not-authenticated', 'You must be logged in to create FAQ items');
    }

    if (!await Roles.userIsInRoleAsync(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'Only admins can create FAQ items');
    }

    // Set default values if not provided
    const order = faqData.order !== undefined ? faqData.order : 0;
    const isPublished = faqData.isPublished !== undefined ? faqData.isPublished : true;

    // Create the FAQ item
    const faqId = await FaqCollection.insertAsync({
      ...faqData,
      order,
      isPublished,
      createdBy: this.userId,
      createdAt: new Date()
    });

    return faqId;
  },

  /**
   * Update an FAQ item (admin only)
   * @param {String} faqId - FAQ ID
   * @param {Object} updates - Updated FAQ data
   */
  'faq.update': async function(faqId, updates) {
    check(faqId, String);
    check(updates, {
      question: Match.Maybe(String),
      answer: Match.Maybe(String),
      category: Match.Maybe(String),
      order: Match.Maybe(Number),
      isPublished: Match.Maybe(Boolean)
    });

    // Check if user is logged in and is admin
    if (!this.userId) {
      throw new Meteor.Error('not-authenticated', 'You must be logged in to update FAQ items');
    }

    if (!await Roles.userIsInRoleAsync(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'Only admins can update FAQ items');
    }

    // Find the FAQ item
    const faq = await FaqCollection.findOneAsync(faqId);
    if (!faq) {
      throw new Meteor.Error('not-found', 'FAQ item not found');
    }

    // Update the FAQ item
    await FaqCollection.updateAsync(
      { _id: faqId },
      {
        $set: {
          ...updates,
          updatedBy: this.userId,
          updatedAt: new Date()
        }
      }
    );
  },

  /**
   * Delete an FAQ item (admin only)
   * @param {String} faqId - FAQ ID
   */
  'faq.delete': async function(faqId) {
    check(faqId, String);

    // Check if user is logged in and is admin
    if (!this.userId) {
      throw new Meteor.Error('not-authenticated', 'You must be logged in to delete FAQ items');
    }

    if (!await Roles.userIsInRoleAsync(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'Only admins can delete FAQ items');
    }

    // Find the FAQ item
    const faq = await FaqCollection.findOneAsync(faqId);
    if (!faq) {
      throw new Meteor.Error('not-found', 'FAQ item not found');
    }

    // Delete the FAQ item
    await FaqCollection.removeAsync({ _id: faqId });
  },

  /**
   * Reorder FAQ items (admin only)
   * @param {Array} orderedItems - Array of {id, order} objects
   */
  'faq.reorder': async function(orderedItems) {
    check(orderedItems, [
      Match.ObjectIncluding({
        id: String,
        order: Number
      })
    ]);

    // Check if user is logged in and is admin
    if (!this.userId) {
      throw new Meteor.Error('not-authenticated', 'You must be logged in to reorder FAQ items');
    }

    if (!await Roles.userIsInRoleAsync(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'Only admins can reorder FAQ items');
    }

    // In Meteor 3, bulk operations might be handled differently
    // Update each item individually
    for (const item of orderedItems) {
      await FaqCollection.updateAsync(
        { _id: item.id },
        {
          $set: {
            order: item.order,
            updatedBy: this.userId,
            updatedAt: new Date()
          }
        }
      );
    }
  }
});
