import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const LLMsCollection = new Mongo.Collection('llms');

// Define schema for LLMs
const LLMsSchema = new SimpleSchema({
  name: {
    type: String,
    max: 100
  },
  type: {
    type: String,
    allowedValues: ['self-hosted', 'third-party']
  },
  provider: {
    type: String,
    max: 50
  },
  modelName: {
    type: String,
    optional: true
  },
  modelId: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    allowedValues: ['active', 'inactive', 'deploying', 'failed', 'deleted']
  },
  parameters: {
    type: SimpleSchema.oneOf(String, Number),
    optional: true
  },
  hardwareTier: {
    type: String,
    optional: true
  },
  capabilities: {
    type: Array,
    optional: true
  },
  'capabilities.$': {
    type: String
  },
  lastUsed: {
    type: Date,
    optional: true
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date,
    optional: true
  },
  owner: {
    type: String
  },
  gatewayId: {
    type: String,
    optional: true
  },
  error: {
    type: String,
    optional: true
  },
  lastChecked: {
    type: Date,
    optional: true
  }
});

// Apply schema to collection
// getting error here. Jarrod will fix this soon - Sun
// LLMsCollection.attachSchema(LLMsSchema);

// Set up deny permissions
LLMsCollection.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

// Export the collection
export default LLMsCollection;
