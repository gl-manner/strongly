// /imports/api/marketplace/publications.js
import { Meteor } from 'meteor/meteor';
import { MarketplaceCollection } from './MarketplaceCollection';

Meteor.publish('marketplace.items', function(filters = {}) {
  if (!this.userId) {
    return this.ready();
  }

  const query = {};

  // Apply filters
  if (filters.vertical) {
    query.vertical = filters.vertical;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.featured) {
    query.featured = true;
  }

  return MarketplaceCollection.find(query, {
    sort: { featured: -1, rating: -1 },
    limit: filters.limit || 50
  });
});

Meteor.publish('marketplace.item', function(itemId) {
  check(itemId, String);

  if (!this.userId) {
    return this.ready();
  }

  return MarketplaceCollection.find(itemId);
});
