// /imports/api/marketplace/methods.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { MarketplaceCollection } from './MarketplaceCollection';

Meteor.methods({
  'marketplace.getItems'(filters = {}) {
    check(filters, Object);

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

    return MarketplaceCollection.find(query, {
      sort: { featured: -1, rating: -1, createdAt: -1 }
    }).fetch();
  },

  'marketplace.getItem'(itemId) {
    check(itemId, String);
    return MarketplaceCollection.findOne(itemId);
  },

  'marketplace.getVerticals'() {
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

    return MarketplaceCollection.aggregate(pipeline);
  }
});
