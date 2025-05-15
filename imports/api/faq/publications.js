// /imports/api/faq/publications.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { FaqCollection } from './collection';

/**
 * Publish all published FAQ items (public)
 */
Meteor.publish('faq.published', async function() {
  // Get a cursor for all published FAQs
  const faqCursor = FaqCollection.find(
    { isPublished: true },
    {
      sort: { category: 1, order: 1 },
      fields: {
        question: 1,
        answer: 1,
        category: 1,
        order: 1,
        createdAt: 1
      }
    }
  );

  // Use for await...of to iterate the cursor asynchronously
  for await (const faq of faqCursor) {
    this.added('faqs', faq._id, faq);
  }

  this.ready();
});

/**
 * Publish all FAQ items (admin only)
 */
Meteor.publish('faq.all', async function() {
  if (!this.userId) {
    return this.ready();
  }

  // Check if the current user is an admin
  if (!await Roles.userIsInRoleAsync(this.userId, 'admin')) {
    return this.ready();
  }

  // Get a cursor for all FAQs
  const faqCursor = FaqCollection.find(
    {},
    { sort: { category: 1, order: 1 } }
  );

  // Use for await...of to iterate the cursor asynchronously
  for await (const faq of faqCursor) {
    this.added('faqs', faq._id, faq);
  }

  this.ready();
});

/**
 * Publish FAQ items by category
 */
Meteor.publish('faq.byCategory', async function(category) {
  check(category, String);

  const isAdmin = this.userId && await Roles.userIsInRoleAsync(this.userId, 'admin');

  // Build query based on user role
  const query = { category };
  if (!isAdmin) {
    query.isPublished = true;
  }

  // Define projection based on user role
  const projection = {
    sort: { order: 1 }
  };

  if (!isAdmin) {
    projection.fields = {
      question: 1,
      answer: 1,
      category: 1,
      order: 1,
      createdAt: 1
    };
  }

  // Get a cursor for category FAQs
  const faqCursor = FaqCollection.find(query, projection);

  // Use for await...of to iterate the cursor asynchronously
  for await (const faq of faqCursor) {
    this.added('faqs', faq._id, faq);
  }

  this.ready();
});

/**
 * Publish a single FAQ item
 */
Meteor.publish('faq.single', async function(faqId) {
  check(faqId, String);

  const isAdmin = this.userId && await Roles.userIsInRoleAsync(this.userId, 'admin');

  // Build query based on user role
  const query = { _id: faqId };
  if (!isAdmin) {
    query.isPublished = true;
  }

  // Define projection based on user role
  const projection = {};
  if (!isAdmin) {
    projection.fields = {
      question: 1,
      answer: 1,
      category: 1,
      order: 1,
      createdAt: 1
    };
  }

  // Find the FAQ
  const faq = await FaqCollection.findOneAsync(query, projection);

  if (faq) {
    this.added('faqs', faq._id, faq);
  }

  this.ready();
});

/**
 * Publish FAQ search results
 */
Meteor.publish('faq.search', async function(searchQuery) {
  check(searchQuery, String);

  if (!searchQuery || searchQuery.trim().length < 2) {
    return this.ready();
  }

  const isAdmin = this.userId && await Roles.userIsInRoleAsync(this.userId, 'admin');

  // Prepare text search query
  const query = {
    $text: { $search: searchQuery }
  };

  // If not admin, only show published items
  if (!isAdmin) {
    query.isPublished = true;
  }

  // Define fields projection
  const projection = {
    fields: {
      score: { $meta: 'textScore' }, // Add text search score
      question: 1,
      answer: 1,
      category: 1,
      order: 1,
      isPublished: 1,
      createdAt: 1
    },
    sort: { score: { $meta: 'textScore' } }, // Sort by relevance
    limit: 20 // Limit results
  };

  // Get a cursor for search results
  const faqCursor = FaqCollection.find(query, projection);

  // Use for await...of to iterate the cursor asynchronously
  for await (const faq of faqCursor) {
    this.added('faqs', faq._id, faq);
  }

  this.ready();
});
