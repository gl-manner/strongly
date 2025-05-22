// /imports/api/ai-gateway/index.js

// Import collections (these need to be imported to register them)
import './LLMsCollection';
import './OpenSourceLLMsCollection';

// Import publications (these register the publications)
import './publications';

// Import methods (these register the Meteor methods)
import './methods';

// Optional: Export anything you want to make available for direct import
export { LLMsCollection } from './LLMsCollection';
export { OpenSourceLLMsCollection } from './OpenSourceLLMsCollection';

// You can also add any initialization logic here if needed
console.log('AI Gateway API modules loaded');
