// imports/methods/server/huggingface-methods.js

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import fetch from 'node-fetch'; // Make sure to npm install node-fetch

Meteor.methods({
  async 'searchHuggingFaceModels'(query) {
    check(query, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You need to be logged in to search models');
    }

    console.log(`Searching Hugging Face for: ${query}`);

    // In a real implementation, you would use the Hugging Face API
    // This is a simplified example
    try {
      // You'd need to obtain a Hugging Face API token for production use
      // const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

      // API endpoint (for the real implementation)
      // const url = `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=30`;
      // const response = await fetch(url, {
      //   headers: {
      //     'Authorization': `Bearer ${HF_TOKEN}`
      //   }
      // });
      // const data = await response.json();

      // For now, let's simulate a response with mock data
      // We'll use a delay to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate some mock data based on the query
      const mockModels = generateMockHuggingFaceResults(query);

      return mockModels;
    } catch (error) {
      console.error('Error searching Hugging Face models:', error);
      throw new Meteor.Error('huggingface-api-error', 'Error connecting to Hugging Face API');
    }
  }
});

// Helper function to generate mock data
function generateMockHuggingFaceResults(query) {
  const baseModels = [
    {
      id: 'hf1',
      name: 'Llama-3-70b-chat',
      organization: 'Meta',
      description: 'Chat model with 70B parameters trained on trillions of tokens.',
      parameters: '70B',
      tags: ['Chat', 'Large', 'General Purpose'],
      repoUrl: 'https://huggingface.co/meta-llama/Llama-3-70b-chat'
    },
    {
      id: 'hf2',
      name: 'Mixtral-8x7B-v0.1',
      organization: 'Mistral AI',
      description: 'A high-quality sparse mixture of experts model with 8x7B parameters.',
      parameters: '56B',
      tags: ['MoE', 'Large', 'Generalist'],
      repoUrl: 'https://huggingface.co/mistralai/Mixtral-8x7B-v0.1'
    },
    {
      id: 'hf3',
      name: 'Gemma-7b-it',
      organization: 'Google',
      description: 'An instruction-tuned version of the Gemma 7B model for chat.',
      parameters: '7B',
      tags: ['Chat', 'Medium', 'Instruction-tuned'],
      repoUrl: 'https://huggingface.co/google/gemma-7b-it'
    },
    {
      id: 'hf4',
      name: 'CLIP-ViT-L-14',
      organization: 'OpenAI',
      description: 'Multimodal model that connects images and text.',
      parameters: '428M',
      tags: ['Multimodal', 'Vision', 'Embeddings'],
      repoUrl: 'https://huggingface.co/openai/clip-vit-large-patch14'
    },
    {
      id: 'hf5',
      name: 'Stable Diffusion XL',
      organization: 'Stability AI',
      description: 'State-of-the-art text-to-image generation model.',
      parameters: '2.6B',
      tags: ['Image Generation', 'Diffusion', 'Multimodal'],
      repoUrl: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0'
    },
    {
      id: 'hf6',
      name: 'Falcon-180B',
      organization: 'TII',
      description: 'One of the largest open-source language models available.',
      parameters: '180B',
      tags: ['Large', 'Generalist', 'Multilingual'],
      repoUrl: 'https://huggingface.co/tiiuae/falcon-180B'
    },
    {
      id: 'hf7',
      name: 'CodeLlama-34B-Instruct',
      organization: 'Meta',
      description: 'Code-focused model with 34B parameters optimized for instruction following.',
      parameters: '34B',
      tags: ['Code', 'Programming', 'Instruction-tuned'],
      repoUrl: 'https://huggingface.co/codellama/CodeLlama-34b-Instruct'
    },
    {
      id: 'hf8',
      name: 'Whisper Large V3',
      organization: 'OpenAI',
      description: 'Advanced speech recognition model supporting multiple languages.',
      parameters: '1.5B',
      tags: ['Audio', 'ASR', 'Multilingual'],
      repoUrl: 'https://huggingface.co/openai/whisper-large-v3'
    }
  ];

  if (!query) {
    return baseModels.slice(0, 3); // Return first 3 if no query
  }

  const lowerQuery = query.toLowerCase();

  // Filter based on query matching name, org, description or tags
  const filtered = baseModels.filter(model =>
    model.name.toLowerCase().includes(lowerQuery) ||
    model.organization.toLowerCase().includes(lowerQuery) ||
    model.description.toLowerCase().includes(lowerQuery) ||
    model.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );

  return filtered;
}
