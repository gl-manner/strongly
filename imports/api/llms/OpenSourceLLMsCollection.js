// /imports/api/llms/OpenSourceLLMsCollection.js
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const OpenSourceLLMsCollection = new Mongo.Collection('openSourceLLMs');

if (Meteor.isServer) {
  // Publish all open source LLMs
  Meteor.publish('openSourceLLMs', function() {
    if (!this.userId) {
      return this.ready();
    }

    return OpenSourceLLMsCollection.find({});
  });

  // If the collection is empty, seed it with some sample models
  Meteor.startup(() => {
    if (OpenSourceLLMsCollection.find().countAsync() === 0) {
      const models = [
        {
          name: 'Llama 3 70B',
          organization: 'Meta',
          description: 'A state-of-the-art large language model trained with 70 billion parameters.',
          parameters: '70B',
          repoUrl: 'https://huggingface.co/meta-llama/Llama-3-70b',
          license: 'Meta License',
          tags: ['Large', 'General Purpose', 'Chat'],
          createdAt: new Date()
        },
        {
          name: 'Mistral 7B Instruct',
          organization: 'Mistral AI',
          description: 'A 7.3B parameter model optimized for instruction following with a 16k context length.',
          parameters: '7B',
          repoUrl: 'https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2',
          license: 'Apache 2.0',
          tags: ['Medium', 'Instruction-tuned', 'Efficient'],
          createdAt: new Date()
        },
        {
          name: 'Llama 3 8B',
          organization: 'Meta',
          description: 'A compact yet powerful language model with 8 billion parameters.',
          parameters: '8B',
          repoUrl: 'https://huggingface.co/meta-llama/Llama-3-8b',
          license: 'Meta License',
          tags: ['Small', 'General Purpose', 'Efficient'],
          createdAt: new Date()
        },
        {
          name: 'Falcon 40B Instruct',
          organization: 'TII',
          description: 'A 40B parameter large language model optimized for instruction following.',
          parameters: '40B',
          repoUrl: 'https://huggingface.co/tiiuae/falcon-40b-instruct',
          license: 'TII Falcon License',
          tags: ['Large', 'Instruction-tuned', 'Arabic'],
          createdAt: new Date()
        },
        {
          name: 'CodeLlama 34B',
          organization: 'Meta',
          description: 'A 34B parameter code-specialized language model derived from Llama.',
          parameters: '34B',
          repoUrl: 'https://huggingface.co/codellama/CodeLlama-34b-Instruct',
          license: 'Meta License',
          tags: ['Large', 'Code', 'Programming'],
          createdAt: new Date()
        },
        {
          name: 'BLOOM',
          organization: 'BigScience',
          description: 'A 176B parameter multilingual language model supporting 46+ languages.',
          parameters: '176B',
          repoUrl: 'https://huggingface.co/bigscience/bloom',
          license: 'BigScience RAIL License',
          tags: ['Huge', 'Multilingual', 'Research'],
          createdAt: new Date()
        },
        {
          name: 'Pythia 12B',
          organization: 'EleutherAI',
          description: 'A 12B parameter language model designed for research interpretability.',
          parameters: '12B',
          repoUrl: 'https://huggingface.co/EleutherAI/pythia-12b',
          license: 'Apache 2.0',
          tags: ['Medium', 'Research', 'Interpretable'],
          createdAt: new Date()
        },
        {
          name: 'MPT-7B-Instruct',
          organization: 'MosaicML',
          description: 'A 7B parameter instruction-tuned model with an 8k context length.',
          parameters: '7B',
          repoUrl: 'https://huggingface.co/mosaicml/mpt-7b-instruct',
          license: 'Apache 2.0',
          tags: ['Medium', 'Instruction-tuned', 'Long Context'],
          createdAt: new Date()
        },
        {
          name: 'Gemma 7B',
          organization: 'Google',
          description: 'A lightweight model with strong performance on reasoning and language tasks.',
          parameters: '7B',
          repoUrl: 'https://huggingface.co/google/gemma-7b',
          license: 'Gemma License',
          tags: ['Medium', 'General Purpose', 'Efficient'],
          createdAt: new Date()
        }
      ];

      models.forEach(model => {
        OpenSourceLLMsCollection.insert(model);
      });
    }
  });
}
