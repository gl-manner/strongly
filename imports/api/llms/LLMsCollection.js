// /imports/api/llms/LLMsCollection.js
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

export const LLMsCollection = new Mongo.Collection('llms');

if (Meteor.isServer) {
  // Publish all LLMs
  Meteor.publish('llms', function() {
    if (!this.userId) {
      return this.ready();
    }

    return LLMsCollection.find({});
  });

  // Publish LLMs by type
  Meteor.publish('deployedLLMs', function(type) {
    check(type, String);

    if (!this.userId) {
      return this.ready();
    }

    return LLMsCollection.find({ type });
  });

  Meteor.methods({
    'addThirdPartyLLM'(llmData) {
      check(llmData, {
        name: String,
        provider: String,
        apiEndpoint: String,
        apiVersion: String,
        apiKey: String,
        modelName: String,
        maxTokens: Number,
        organization: String,
        additionalHeaders: String,
        type: String
      });

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You need to be logged in to add a model');
      }

      const timestamp = new Date();

      // Process additional headers if provided
      let additionalHeadersObj = {};
      if (llmData.additionalHeaders) {
        try {
          additionalHeadersObj = JSON.parse(llmData.additionalHeaders);
        } catch (e) {
          throw new Meteor.Error('invalid-json', 'Additional headers must be valid JSON');
        }
      }

      // Insert the new LLM
      const llmId = LLMsCollection.insert({
        ...llmData,
        additionalHeaders: additionalHeadersObj,
        createdAt: timestamp,
        createdBy: this.userId,
        status: 'active',
        lastUsed: null
      });

      return llmId;
    },

    'deployLLM'(deploymentData) {
      check(deploymentData, Object);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You need to be logged in to deploy a model');
      }

      const timestamp = new Date();

      // Process custom parameters if provided
      let customParamsObj = {};
      if (deploymentData.customParameters) {
        try {
          customParamsObj = JSON.parse(deploymentData.customParameters);
        } catch (e) {
          throw new Meteor.Error('invalid-json', 'Custom parameters must be valid JSON');
        }
      }

      // Insert the deployment record
      const deploymentId = LLMsCollection.insert({
        name: deploymentData.modelName,
        type: 'self-hosted',
        status: 'deploying',
        parameters: deploymentData.parameters || 'Unknown',
        hardwareTier: deploymentData.hardwareTier,
        replicas: deploymentData.replicas,
        maxTokens: deploymentData.maxTokens,
        allowedUsers: deploymentData.allowedUsers,
        customParameters: customParamsObj,
        sourceModelId: deploymentData.modelId,
        sourceUrl: deploymentData.modelUrl,
        createdAt: timestamp,
        createdBy: this.userId,
        lastUsed: null
      });

      // Here you would call your backend service to actually deploy the model
      // This is just a placeholder for the actual Kubernetes deployment logic
      Meteor.setTimeout(() => {
        LLMsCollection.update(deploymentId, {
          $set: { status: 'active' }
        });
      }, 30000); // Simulate deployment taking 30 seconds

      return deploymentId;
    },

    'testLLMConnection'(connectionData) {
      check(connectionData, Object);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You need to be logged in to test a connection');
      }

      // This is where you would implement the actual connection testing logic
      // For now, we'll just simulate a successful test
      return {
        status: 'success',
        modelInfo: {
          name: connectionData.modelName,
          provider: connectionData.provider,
          maxTokens: connectionData.maxTokens
        }
      };
    },

    'deleteLLM'(llmId) {
      check(llmId, String);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You need to be logged in to delete a model');
      }

      const llm = LLMsCollection.findOne(llmId);

      if (!llm) {
        throw new Meteor.Error('not-found', 'Model not found');
      }

      // If it's a self-hosted model, you might need to clean up Kubernetes resources
      if (llm.type === 'self-hosted' && llm.status === 'active') {
        // This is where you would add logic to terminate the Kubernetes deployment
        console.log(`Terminating Kubernetes deployment for LLM: ${llmId}`);
      }

      return LLMsCollection.remove(llmId);
    }
  });
}
