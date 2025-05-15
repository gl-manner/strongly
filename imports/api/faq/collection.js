// /imports/api/faq/collection.js
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

// Create the FAQ collection
export const FaqCollection = new Mongo.Collection('faqs');

// Define the schema
export const FaqSchema = new SimpleSchema({
  question: {
    type: String,
    max: 500
  },
  answer: {
    type: String,
    max: 10000 // Allow for substantial formatted answers with HTML
  },
  category: {
    type: String,
    max: 100,
    optional: true,
    defaultValue: 'General'
  },
  order: {
    type: Number,
    defaultValue: 0
  },
  isPublished: {
    type: Boolean,
    defaultValue: true
  },
  createdBy: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset();
      }
    }
  },
  updatedBy: {
    type: String,
    optional: true
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    optional: true
  }
});

// Attach schema if collection2 is available
if (typeof FaqCollection.attachSchema === 'function') {
  FaqCollection.attachSchema(FaqSchema);
}

// Add helpers if available
if (typeof FaqCollection.helpers === 'function') {
  FaqCollection.helpers({
    formattedDate() {
      return this.createdAt.toLocaleDateString();
    },
    isNew() {
      const daysSinceCreation = (new Date() - this.createdAt) / (1000 * 60 * 60 * 24);
      return daysSinceCreation < 7; // Consider "new" if less than 7 days old
    },
    excerpt(length = 100) {
      // Strip HTML tags for plain text excerpt
      const plainText = this.answer.replace(/<[^>]*>?/gm, '');
      if (plainText.length <= length) return plainText;
      return plainText.substring(0, length) + '...';
    }
  });
}

// Create indexes directly in the collection file, but only on the server
if (Meteor.isServer) {
  Meteor.startup(async () => {
    try {
      // Create basic index for sorting
      await FaqCollection.createIndexAsync({ category: 1, order: 1 });

      // Create text search index
      await FaqCollection.createIndexAsync({
        question: 'text',
        answer: 'text',
        category: 'text'
      }, {
        name: 'faq_text_search',
        weights: {
          question: 10,  // Higher weight for question
          answer: 5,     // Medium weight for answer
          category: 3    // Lower weight for category
        }
      });

      console.log('FAQ collection indexes created successfully');
    } catch (error) {
      console.error('Error creating FAQ collection indexes:', error);
    }
  });
}

export default FaqCollection;
