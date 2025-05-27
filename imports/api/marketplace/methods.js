// /imports/api/marketplace/methods.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { MarketplaceCollection } from './MarketplaceCollection';

Meteor.methods({
  async 'marketplace.getItems'(filters = {}) {
    check(filters, Object);
    console.log('Method marketplace.getItems called with filters:', filters);

    const query = {};
    if (filters.vertical) {
      query.vertical = filters.vertical;
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { vendor: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } }
      ];
    }

    const items = await MarketplaceCollection.find(query, {
      sort: { featured: -1, rating: -1, createdAt: -1 }
    }).fetchAsync();

    console.log('Method returning items count:', items.length);
    return items;
  },

  async 'marketplace.getItem'(itemId) {
    check(itemId, String);
    console.log('Method marketplace.getItem called for:', itemId);

    const item = await MarketplaceCollection.findOneAsync(itemId);
    console.log('Method found item:', item ? item.name : 'Not found');

    return item;
  },

  async 'marketplace.getVerticals'() {
    console.log('Method marketplace.getVerticals called');

    // Return aggregated data for verticals with counts
    const pipeline = [
      {
        $group: {
          _id: '$vertical',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ];

    const verticals = await MarketplaceCollection.aggregateAsync(pipeline);
    console.log('Method returning verticals:', verticals);

    return verticals;
  }
});
