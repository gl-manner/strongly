import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const OpenSourceLLMsCollection = new Mongo.Collection('openSourceLLMs');

// Define schema for open source LLMs that can be deployed
const OpenSourceLLMsSchema = new SimpleSchema({
  name: {
    type: String,
    max: 100
  },
  organization: {
    type: String,
    max: 100
  },
  description: {
    type: String,
    max: 500
  },
  parameters: {
    type: String
  },
  tags: {
    type: Array,
    optional: true
  },
  'tags.$': {
    type: String
  },
  repoUrl: {
    type: String
  },
  license: {
    type: String
  },
  framework: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date
  }
});

// Apply schema to collection
// OpenSourceLLMsCollection.attachSchema(OpenSourceLLMsSchema);
// getting error here. Jarrod will fix this soon - Sun
// Set up deny permissions (only allow changes through methods)
OpenSourceLLMsCollection.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

// Export the collection
export default OpenSourceLLMsCollection;
