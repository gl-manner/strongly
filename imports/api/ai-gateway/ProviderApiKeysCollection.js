// /imports/api/ai-gateway/ProviderApiKeysCollection.js

import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const ProviderApiKeysCollection = new Mongo.Collection('provider_api_keys');

// Define the schema
ProviderApiKeysCollection.schema = {
  name: String,              // User-friendly name for the API key
  provider: String,          // Provider name (openai, anthropic, etc.)
  apiKey: String,           // The actual API key (should be encrypted in production)
  description: String,       // Optional description
  organization: String,      // Optional organization ID
  additionalHeaders: Object, // Optional additional headers
  owner: String,            // User ID who owns this key
  isActive: Boolean,        // Whether the key is active
  createdAt: Date,          // When the key was created
  updatedAt: Date,          // When the key was last updated
  lastUsedAt: Date,         // When the key was last used
  lastTestedAt: Date,       // When the key was last tested
  testResult: Object        // Result of the last test
};

if (Meteor.isServer) {
  // Publications
  Meteor.publish('providerApiKeys', function() {
    if (!this.userId) {
      return this.ready();
    }

    return ProviderApiKeysCollection.find(
      { owner: this.userId },
      {
        fields: {
          // Never publish the actual API key
          apiKey: 0
        }
      }
    );
  });

  // Indexes for performance
  Meteor.startup(() => {
    try {
      ProviderApiKeysCollection.createIndex({ owner: 1 });
      ProviderApiKeysCollection.createIndex({ provider: 1, owner: 1 });
      ProviderApiKeysCollection.createIndex({ isActive: 1, owner: 1 });
    } catch (error) {
      console.log('Indexes may already exist:', error.message);
    }
  });
}
