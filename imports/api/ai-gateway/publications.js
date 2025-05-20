import { Meteor } from 'meteor/meteor';
import { LLMsCollection } from '/imports/api/ai-gateway/LLMsCollection';
import { OpenSourceLLMsCollection } from '/imports/api/ai-gateway/OpenSourceLLMsCollection';

Meteor.publish('allLLMs', function() {
  if (!this.userId) {
    return this.ready();
  }

  return LLMsCollection.find({});
});

Meteor.publish('llms', function() {
  if (!this.userId) {
    return this.ready();
  }

  return LLMsCollection.find({});
});

Meteor.publish('deployedLLMs', function(type) {
  if (!this.userId) {
    return this.ready();
  }

  if (type) {
    return LLMsCollection.find({ type });
  }

  return LLMsCollection.find({});
});

Meteor.publish('openSourceLLMs', function() {
  if (!this.userId) {
    return this.ready();
  }

  return OpenSourceLLMsCollection.find({});
});

Meteor.publish('modelDetail', function(modelId) {
  if (!this.userId) {
    return this.ready();
  }

  return LLMsCollection.find({ _id: modelId });
});
