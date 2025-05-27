// /imports/startup/server/fixtures/marketplaceData.js

import { MarketplaceCollection } from '/imports/api/marketplace/MarketplaceCollection';

export const marketplaceFixtures = [
  {
    _id: 'ai-financial-advisor-agent',
    name: 'AI Financial Advisor Agent',
    vendor: 'StronglyAI, Inc.',
    type: 'agent',
    vertical: 'finance',
    rating: 4.9,
    reviews: 3,
    price: '$2,500/month',
    priceNumeric: 2500,
    description: 'Intelligent financial advisory agent that provides search, summary and analytics functionality across financial docs.',
    longDescription: 'Our AI Financial Advisor Agent revolutionizes personal and institutional investment management by leveraging cutting-edge machine learning algorithms and real-time market data analysis. The agent continuously monitors market conditions, analyzes portfolio performance, and provides personalized investment recommendations based on individual risk tolerance, financial goals, and market opportunities.',
    tags: ['AI/ML', 'Financial Planning', 'Investment'],
    image: '/assets/images/marketplace/ai-financial-advisor-agent.png',
    images: [
      '/assets/images/marketplace/ai-financial-advisor-agent.png',
      '/assets/images/marketplace/ai-financial-advisor-agent-2.png',
      '/assets/images/marketplace/ai-financial-advisor-agent-3.png'
    ],
    featured: true,
    features: [
      'Real-time market analysis and alerts',
      'Automated portfolio rebalancing',
      'Personalized investment recommendations',
      'Risk assessment and management',
      'Regulatory compliance monitoring',
      'Integration with 50+ financial data sources'
    ],
    specifications: {
      'Deployment': 'Cloud-based SaaS',
      'API Integration': 'RESTful APIs, WebSocket',
      'Data Sources': '50+ financial data providers',
      'Compliance': 'SOC 2, ISO 27001, GDPR'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'insurance-claims-processing-agent',
    name: 'Insurance Claims Processing Agent',
    vendor: 'StronglyAI, Inc.',
    type: 'agent',
    vertical: 'insurance',
    rating: 5.0,
    reviews: 2,
    price: '$3,200/month',
    priceNumeric: 3200,
    description: 'AI-powered agent that automates insurance claims processing and arbitration.',
    longDescription: 'Streamline your insurance operations with our intelligent claims processing agent that can handle complex claim evaluations, document analysis, and automated decision-making while maintaining compliance with industry regulations.',
    tags: ['AI/ML', 'Claims Processing', 'Arbitration'],
    image: '/assets/images/marketplace/insurance-claims-processing-agent.png',
    images: [
      '/assets/images/marketplace/insurance-claims-processing-agent.png'
    ],
    featured: true,
    features: [
      'Automated claim evaluation',
      'Document analysis and extraction',
      'Fraud detection algorithms',
      'Regulatory compliance checks',
      'Integration with policy management systems'
    ],
    specifications: {
      'Processing Time': 'Under 60 seconds per claim',
      'Accuracy Rate': '97.8%',
      'Integration': 'REST API, SOAP',
      'Compliance': 'SOX, HIPAA, State regulations'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'entity-extraction-financial-docs',
    name: 'Entity Extraction From Financial Documents',
    vendor: 'StronglyAI, Inc.',
    type: 'app',
    vertical: 'finance',
    rating: 5.0,
    reviews: 6,
    price: '$650/month',
    priceNumeric: 650,
    description: 'Advanced AI-powered platform for extracting entities from financial documents with custom model training and annotation capabilities.',
    longDescription: 'Transform your document processing workflow with our advanced entity extraction platform specifically designed for financial documents. Extract key information from contracts, reports, statements, and regulatory filings with industry-leading accuracy.',
    tags: ['Document Processing', 'Entity Extraction', 'AI/ML', 'Financial Documents'],
    image: '/assets/images/marketplace/entity-extraction-from-financial-documents.png',
    images: [
      '/assets/images/marketplace/entity-extraction-from-financial-documents.png'
    ],
    featured: true,
    features: [
      'Custom entity type configuration',
      'Batch document processing',
      'Training data annotation tools',
      'API integration capabilities',
      'Export to multiple formats'
    ],
    specifications: {
      'Supported Formats': 'PDF, DOC, DOCX, TXT',
      'Processing Speed': '1000+ docs/hour',
      'Accuracy': '94.2% entity recognition',
      'Languages': 'English, Spanish, French'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'customer-support-chatbot',
    name: 'Customer Support Chatbot',
    vendor: 'StronglyAI, Inc.',
    type: 'agent',
    vertical: 'retail',
    rating: 4.8,
    reviews: 12,
    price: '$450/month',
    priceNumeric: 450,
    description: 'Intelligent AI chatbot agent that provides 24/7 customer support for e-commerce websites with product recommendations and order assistance.',
    longDescription: 'Enhance your customer service experience with our intelligent chatbot that handles customer inquiries, provides product recommendations, and assists with order management around the clock.',
    tags: ['AI/ML', 'Customer Support', 'Chatbot', 'E-commerce'],
    image: '/assets/images/marketplace/customer-support-chatbot.png',
    images: [
      '/assets/images/marketplace/customer-support-chatbot.png'
    ],
    featured: true,
    features: [
      '24/7 automated support',
      'Product recommendation engine',
      'Order tracking integration',
      'Multi-language support',
      'Escalation to human agents'
    ],
    specifications: {
      'Response Time': 'Under 2 seconds',
      'Languages': '12 supported languages',
      'Integration': 'Shopify, WooCommerce, Magento',
      'Uptime': '99.9% SLA'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'document-annotation-studio',
    name: 'Document Annotation Studio',
    vendor: 'StronglyAI, Inc.',
    type: 'app',
    vertical: 'technology',
    rating: 4.8,
    reviews: 23,
    price: '$295/month',
    priceNumeric: 295,
    description: 'Intuitive drag-and-drop document annotation platform for labeling and training custom AI models on financial documents.',
    longDescription: 'Streamline your AI model training process with our comprehensive document annotation platform. Features an intuitive interface for labeling documents, managing annotation teams, and preparing training datasets.',
    tags: ['Document Labeling', 'Annotation', 'AI Training', 'Drag & Drop'],
    image: '/assets/images/marketplace/document-annotation-studio.png',
    images: [
      '/assets/images/marketplace/document-annotation-studio.png'
    ],
    featured: true,
    features: [
      'Drag-and-drop annotation interface',
      'Team collaboration tools',
      'Quality control workflows',
      'Export to ML formats',
      'Progress tracking and analytics'
    ],
    specifications: {
      'Team Size': 'Up to 50 annotators',
      'File Formats': 'PDF, Image, Text',
      'Export': 'JSON, CSV, COCO, YOLO',
      'Storage': '100GB included'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'ecommerce-personalization-engine',
    name: 'E-commerce Personalization Engine',
    vendor: 'StronglyAI, Inc.',
    type: 'agent',
    vertical: 'retail',
    rating: 4.8,
    reviews: 32,
    price: '$2,800/month',
    priceNumeric: 2800,
    description: 'AI agent that personalizes shopping experiences and product recommendations for e-commerce platforms.',
    longDescription: `Transform your e-commerce platform with our advanced AI-powered personalization engine that delivers truly individualized shopping experiences to every customer.

Our sophisticated machine learning algorithms analyze customer behavior patterns, purchase history, browsing data, and contextual signals to create dynamic, real-time personalizations that drive engagement and boost conversions.

The engine continuously learns from customer interactions, adapting recommendations and experiences to maximize relevance and revenue. With seamless integration capabilities and enterprise-grade scalability, you can deploy personalized experiences across web, mobile, and in-store touchpoints.

Built for modern e-commerce platforms, our personalization engine includes advanced features like cross-selling optimization, seasonal trend analysis, inventory-aware recommendations, and multi-variate testing to ensure maximum impact on your bottom line.`,
    tags: ['AI/ML', 'Personalization', 'E-commerce', 'Machine Learning', 'Customer Experience', 'Conversion Optimization'],
    image: '/assets/images/marketplace/e-commerce-personalization-engine.png',
    images: [
      '/assets/images/marketplace/e-commerce-personalization-engine.png',
      '/assets/images/marketplace/e-commerce-personalization-engine-dashboard.png',
      '/assets/images/marketplace/e-commerce-personalization-engine-analytics.png',
      '/assets/images/marketplace/e-commerce-personalization-engine-integration.png'
    ],
    featured: true,
    features: [
      'Real-time behavioral analysis and personalization',
      'Dynamic product recommendations with 35%+ conversion lift',
      'Advanced customer segmentation and targeting',
      'Cross-selling and upselling optimization',
      'A/B testing framework with statistical significance',
      'Multi-channel personalization (web, mobile, email)',
      'Inventory-aware recommendation engine',
      'Seasonal and trending product analysis',
      'Customer lifetime value prediction',
      'Real-time content personalization',
      'Advanced analytics and performance reporting',
      'GDPR and privacy-compliant data handling',
      'Easy integration with major e-commerce platforms',
      'Custom API for bespoke implementations',
      'Machine learning model continuous optimization'
    ],
    specifications: {
      'Performance Impact': 'Up to 35% conversion rate increase',
      'Response Time': 'Under 100ms API response',
      'Scale': 'Millions of concurrent users supported',
      'Data Processing': '10M+ events per minute',
      'Integration Methods': 'REST API, JavaScript SDK, Webhooks',
      'Platform Support': 'Shopify, WooCommerce, Magento, BigCommerce, Custom',
      'Deployment': 'Cloud SaaS, Private Cloud, On-Premise',
      'Security': 'SOC 2 Type II, GDPR Compliant, End-to-End Encryption',
      'Uptime SLA': '99.9% guaranteed uptime',
      'Support': '24/7 technical support and account management',
      'Data Retention': 'Configurable (30 days to 2 years)',
      'Machine Learning': 'Deep learning, collaborative filtering, content-based filtering'
    },
    pricingTiers: [
      {
        name: 'Starter',
        price: '$1,200/month',
        priceNumeric: 1200,
        features: [
          'Up to 100K monthly sessions',
          'Basic product recommendations',
          'Email support',
          'Standard integrations',
          'Basic analytics dashboard'
        ],
        popular: false
      },
      {
        name: 'Professional',
        price: '$2,800/month',
        priceNumeric: 2800,
        features: [
          'Up to 500K monthly sessions',
          'Advanced personalization engine',
          'A/B testing framework',
          'Priority support',
          'Advanced analytics and reporting',
          'Custom API access',
          'Multi-channel personalization'
        ],
        popular: true
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        priceNumeric: 5000,
        features: [
          'Unlimited monthly sessions',
          'White-label solution',
          'Dedicated account manager',
          'Custom integrations',
          'On-premise deployment options',
          'Advanced machine learning models',
          'Real-time data streaming',
          'Custom SLA agreements'
        ],
        popular: false
      }
    ],
    vendorInfo: {
      name: 'StronglyAI, Inc.',
      founded: '2021',
      headquarters: 'San Francisco, CA',
      employees: '50-100',
      description: 'StronglyAI is a leading provider of enterprise AI solutions specializing in personalization, recommendation systems, and customer experience optimization. Our team of ML engineers and data scientists has built personalization systems for Fortune 500 companies across retail, media, and finance.',
      certifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR Compliant'],
      website: 'https://strongly.ai',
      supportEmail: 'support@strongly.ai',
      salesEmail: 'sales@strongly.ai'
    },
    useCases: [
      {
        title: 'Product Recommendations',
        description: 'Increase average order value with intelligent product suggestions based on browsing behavior and purchase history.'
      },
      {
        title: 'Content Personalization',
        description: 'Deliver personalized homepage experiences, category pages, and search results tailored to individual preferences.'
      },
      {
        title: 'Email Campaign Optimization',
        description: 'Personalize email content and product recommendations to boost open rates and click-through rates.'
      },
      {
        title: 'Cross-Selling & Upselling',
        description: 'Identify optimal opportunities for cross-selling and upselling based on customer behavior patterns.'
      },
      {
        title: 'Customer Segmentation',
        description: 'Automatically segment customers based on behavior, preferences, and value for targeted marketing campaigns.'
      }
    ],
    integrations: [
      'Shopify', 'WooCommerce', 'Magento', 'BigCommerce', 'Salesforce Commerce Cloud',
      'Adobe Commerce', 'PrestaShop', 'OpenCart', 'Custom E-commerce Platforms',
      'Google Analytics', 'Facebook Pixel', 'Klaviyo', 'Mailchimp', 'HubSpot',
      'Segment', 'Amplitude', 'Mixpanel', 'Zapier'
    ],
    technicalRequirements: {
      'Minimum Traffic': '1,000 monthly visitors',
      'Data Requirements': 'At least 30 days of historical data',
      'Integration Time': '2-4 weeks typical implementation',
      'Technical Skills': 'Basic web development knowledge required',
      'Browser Support': 'All modern browsers (Chrome, Firefox, Safari, Edge)',
      'Mobile Support': 'iOS and Android native apps via SDK'
    },
    roi: {
      'Average Conversion Lift': '25-35%',
      'Average Order Value Increase': '15-20%',
      'Customer Retention Improvement': '10-15%',
      'Implementation ROI': 'Typically 300-500% within 6 months',
      'Payback Period': '2-4 months average'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Healthcare
  {
    _id: 'medical-image-analyzer',
    name: 'Medical Image Analysis AI',
    vendor: 'HealthTech Solutions',
    type: 'agent',
    vertical: 'healthcare',
    rating: 4.7,
    reviews: 18,
    price: '$4,500/month',
    priceNumeric: 4500,
    description: 'AI-powered medical image analysis for radiology and diagnostic imaging with FDA compliance.',
    longDescription: 'Advanced medical imaging AI that assists radiologists and healthcare professionals in analyzing X-rays, MRIs, CT scans, and other medical images with high accuracy and regulatory compliance.',
    tags: ['Medical Imaging', 'AI/ML', 'Radiology', 'FDA Approved'],
    image: '/assets/images/marketplace/medical-image-analyzer.png',
    images: [
      '/assets/images/marketplace/medical-image-analyzer.png'
    ],
    featured: false,
    features: [
      'Multi-modality support',
      'FDA 510(k) cleared',
      'HIPAA compliant',
      'Integration with PACS',
      'Real-time analysis'
    ],
    specifications: {
      'Accuracy': '96.5% diagnostic accuracy',
      'Modalities': 'X-ray, CT, MRI, Ultrasound',
      'Processing': 'Under 30 seconds per image',
      'Compliance': 'FDA 510(k), HIPAA, HL7'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Public Sector
  {
    _id: 'citizen-service-portal',
    name: 'Citizen Services Portal',
    vendor: 'GovTech Solutions',
    type: 'app',
    vertical: 'public-sector',
    rating: 4.5,
    reviews: 8,
    price: '$4,500/month',
    priceNumeric: 4500,
    description: 'Comprehensive digital platform for citizen services, permit applications, and government interactions.',
    longDescription: 'Modernize your government services with our comprehensive citizen portal that streamlines applications, permits, payments, and citizen-government interactions through a user-friendly digital platform.',
    tags: ['Government', 'Citizen Services', 'Digital Platform', 'Public Sector'],
    image: '/assets/images/marketplace/citizen-service-portal.png',
    images: [
      '/assets/images/marketplace/citizen-service-portal.png'
    ],
    featured: false,
    features: [
      'Online permit applications',
      'Payment processing',
      'Document upload and management',
      'Status tracking',
      'Multi-language support'
    ],
    specifications: {
      'Security': 'FedRAMP authorized',
      'Accessibility': 'WCAG 2.1 AA compliant',
      'Integration': 'Legacy system connectors',
      'Uptime': '99.9% availability'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'stronglygpt-llm-interface',
    name: 'StronglyGPT',
    vendor: 'StronglyAI, Inc.',
    type: 'app',
    vertical: 'technology',
    rating: 4.9,
    reviews: 47,
    price: '$250/month',
    priceNumeric: 250,
    description: 'Multi-model LLM interface that lets you switch between GPT-4, Claude, Gemini, and other leading language models in a single unified platform.',
    longDescription: `StronglyGPT revolutionizes how you interact with large language models by providing a single, intuitive interface to access multiple AI providers. No more juggling between different platforms - switch seamlessly between OpenAI's GPT-4, Anthropic's Claude, Google's Gemini, and other leading models with just a click.

  Our platform delivers all the features you expect from modern LLM interfaces: file uploads for document analysis, image understanding capabilities, code interpretation, and extended context windows. What sets StronglyGPT apart is the freedom to choose the best model for each task - use GPT-4 for creative writing, Claude for detailed analysis, or Gemini for multimodal tasks, all within the same conversation thread.

  Built for both individual power users and teams, StronglyGPT maintains conversation history across all models, allowing you to compare responses and leverage the unique strengths of each AI. Our clean, responsive interface works flawlessly on desktop and mobile devices, ensuring you have access to cutting-edge AI wherever you work.

  With transparent pricing and no hidden API costs, StronglyGPT provides enterprise-grade security and privacy while keeping your conversations and uploaded files completely confidential. Experience the future of AI interaction where you're not locked into a single provider but have the entire ecosystem at your fingertips.`,
    tags: ['AI/ML', 'LLM', 'Chat Interface', 'Multi-Model', 'GPT-4', 'Claude'],
    image: '/assets/images/marketplace/strongly-gpt.png',
    images: [
      '/assets/images/marketplace/strongly-gpt.png'
    ],
    featured: true,
    features: [
      'Access to multiple LLMs (GPT-4, Claude 3, Gemini Pro, etc.)',
      'Seamless model switching mid-conversation',
      'File upload support (PDF, DOCX, TXT, CSV, images)',
      'Image generation with DALL-E 3 and Midjourney',
      'Code execution and interpretation',
      'Extended context windows (up to 200k tokens)',
      'Conversation history and search',
      'Export chats in multiple formats',
      'Side-by-side model comparison',
      'Custom system prompts and templates',
      'Team workspaces and sharing',
      'Dark mode and customizable themes',
      'Mobile-responsive design',
      'Markdown and LaTeX rendering',
      'Voice input and text-to-speech'
    ],
    specifications: {
      'Supported Models': 'GPT-4, GPT-4 Turbo, Claude 3 (Opus/Sonnet/Haiku), Gemini Pro, Llama 2, Mistral',
      'File Upload': 'Up to 50MB per file, multiple files per message',
      'File Types': 'PDF, DOCX, TXT, CSV, XLSX, JPG, PNG, GIF, Code files',
      'Context Length': 'Up to 200k tokens (model dependent)',
      'Response Time': 'Direct pass-through to provider APIs',
      'Storage': 'Unlimited conversation history',
      'Export Formats': 'Markdown, PDF, JSON, TXT',
      'Platform': 'Web-based, PWA for mobile',
      'Security': 'End-to-end encryption, no training on user data',
      'Compliance': 'SOC 2, GDPR compliant',
      'Availability': '99.9% uptime SLA',
      'Support': 'Email and chat support'
    },
    pricingTiers: [
      {
        name: 'Individual',
        price: '$250/month',
        priceNumeric: 250,
        features: [
          'Unlimited conversations',
          'All available models',
          'File uploads (50MB limit)',
          'Conversation history',
          'Priority support',
          'Export functionality'
        ],
        popular: true
      },
      {
        name: 'Team',
        price: '$200/user/month',
        priceNumeric: 200,
        features: [
          'Everything in Individual',
          'Team workspaces',
          'Shared conversations',
          'Admin controls',
          'Centralized billing',
          'SSO authentication'
        ],
        popular: false
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        priceNumeric: 5000,
        features: [
          'Everything in Team',
          'Custom model integration',
          'On-premise deployment',
          'Advanced security controls',
          'Dedicated support',
          'Custom SLA'
        ],
        popular: false
      }
    ],
    vendorInfo: {
      name: 'StronglyAI, Inc.',
      founded: '2021',
      headquarters: 'San Francisco, CA',
      employees: '50-100',
      description: 'StronglyAI is a leading provider of enterprise AI solutions. With StronglyGPT, we\'re democratizing access to the world\'s best language models through a unified, user-friendly interface.',
      certifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR Compliant'],
      website: 'https://strongly.ai',
      supportEmail: 'support@strongly.ai',
      salesEmail: 'sales@strongly.ai'
    },
    useCases: [
      {
        title: 'Model Comparison',
        description: 'Compare responses from different LLMs side-by-side to get the best answer for your specific use case.'
      },
      {
        title: 'Document Analysis',
        description: 'Upload PDFs, spreadsheets, and documents for analysis using the most capable model for your task.'
      },
      {
        title: 'Creative Projects',
        description: 'Switch between models optimized for different creative tasks - storytelling, copywriting, or brainstorming.'
      },
      {
        title: 'Technical Work',
        description: 'Use specialized models for coding, debugging, and technical documentation with full code execution capabilities.'
      },
      {
        title: 'Research & Analysis',
        description: 'Leverage different models\' strengths for comprehensive research, data analysis, and report generation.'
      }
    ],
    integrations: [],
    technicalRequirements: {
      'Browser Support': 'Chrome 90+, Firefox 88+, Safari 14+, Edge 90+',
      'Internet': 'Stable broadband connection recommended',
      'Screen Resolution': 'Minimum 1024x768, optimized for 1920x1080+',
      'Mobile': 'iOS 14+ and Android 10+ for PWA',
      'JavaScript': 'Required for full functionality',
      'Cookies': 'Required for authentication'
    },
    roi: {
      'Model Access Cost Savings': '70% vs individual subscriptions',
      'Productivity Increase': '3x faster with model switching',
      'Time to Best Answer': '50% reduction',
      'Learning Curve': 'Same as ChatGPT/Claude',
      'ROI Period': 'Immediate with first month usage'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Startup logic to seed data
export async function seedMarketplaceData() {
  console.log('Checking marketplace data...');

  const existingItems = await MarketplaceCollection.find().countAsync();
  console.log(`Found ${existingItems} existing marketplace items`);

  if (existingItems === 0) {
    console.log('Seeding marketplace data...');
    for (const item of marketplaceFixtures) {
      await MarketplaceCollection.insertAsync(item);
    }
    console.log(`Inserted ${marketplaceFixtures.length} marketplace items`);
  } else {
    // Check for missing items and add them
    const missingItems = [];
    for (const item of marketplaceFixtures) {
      const existing = await MarketplaceCollection.findOneAsync(item._id);
      if (!existing) {
        missingItems.push(item);
      }
    }

    if (missingItems.length > 0) {
      console.log(`Adding ${missingItems.length} missing marketplace items...`);
      for (const item of missingItems) {
        await MarketplaceCollection.insertAsync(item);
      }
    }
  }

  console.log('Marketplace data check complete');
}
