// /imports/api/marketplace/publications.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { MarketplaceCollection } from './MarketplaceCollection';

Meteor.publish('marketplace.items', function(filters = {}) {
  console.log('Publishing marketplace.items with filters:', filters);

  if (!this.userId) {
    console.log('No user ID, returning empty publication');
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
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { vendor: { $regex: filters.search, $options: 'i' } },
      { tags: { $in: [new RegExp(filters.search, 'i')] } }
    ];
  }

  console.log('Final query:', query);

  const cursor = MarketplaceCollection.find(query, {
    sort: { featured: -1, rating: -1 },
    limit: filters.limit || 50
  });

  console.log('Publishing cursor with query');

  return cursor;
});

Meteor.publish('marketplace.item', function(itemId) {
  check(itemId, String);
  console.log('Publishing single marketplace item:', itemId);

  if (!this.userId) {
    console.log('No user ID for single item publication');
    return this.ready();
  }

  // Simply return the cursor - don't use findOne() on server
  const cursor = MarketplaceCollection.find({ _id: itemId });
  console.log('Publishing cursor for item:', itemId);

  return cursor;
});
