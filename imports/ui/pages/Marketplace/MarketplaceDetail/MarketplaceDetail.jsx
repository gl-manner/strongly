// /imports/ui/pages/Marketplace/MarketplaceDetail/MarketplaceDetail.jsx

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './MarketplaceDetail.scss';

// Simple SVG icon components
const Icons = {
  ArrowLeft: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12,19 5,12 12,5"></polyline>
    </svg>
  ),
  Star: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"></polygon>
    </svg>
  ),
  ExternalLink: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15,3 21,3 21,9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  ),
  Download: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7,10 12,15 17,10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  ),
  Shield: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
  Check: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  ),
  Play: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5,3 19,12 5,21 5,3"></polygon>
    </svg>
  )
};

// Mock detailed data for a marketplace item
const mockDetailData = {
  1: {
    id: 1,
    name: 'AI Financial Advisor Agent',
    vendor: 'FinTech Solutions Inc.',
    type: 'agent',
    vertical: 'finance',
    rating: 4.8,
    reviews: 124,
    price: '$2,500/month',
    description: 'Intelligent financial advisory agent that provides personalized investment recommendations and portfolio management using advanced machine learning algorithms.',
    longDescription: `Our AI Financial Advisor Agent revolutionizes personal and institutional investment management by leveraging cutting-edge machine learning algorithms and real-time market data analysis.

The agent continuously monitors market conditions, analyzes portfolio performance, and provides personalized investment recommendations based on individual risk tolerance, financial goals, and market opportunities.

Key capabilities include automated portfolio rebalancing, risk assessment, regulatory compliance monitoring, and integration with major financial data providers and trading platforms.`,
    tags: ['AI/ML', 'Financial Planning', 'Investment', 'Portfolio Management', 'Risk Assessment'],
    images: [
      '/api/placeholder/600/400',
      '/api/placeholder/600/400',
      '/api/placeholder/600/400'
    ],
    features: [
      'Real-time market analysis and alerts',
      'Automated portfolio rebalancing',
      'Personalized investment recommendations',
      'Risk assessment and management',
      'Regulatory compliance monitoring',
      'Integration with 50+ financial data sources',
      'Multi-asset class support',
      'White-label customization options'
    ],
    specifications: {
      'Deployment': 'Cloud-based SaaS',
      'API Integration': 'RESTful APIs, WebSocket',
      'Data Sources': '50+ financial data providers',
      'Compliance': 'SOC 2, ISO 27001, GDPR',
      'Support': '24/7 enterprise support',
      'SLA': '99.9% uptime guarantee'
    },
    vendor_info: {
      name: 'FinTech Solutions Inc.',
      founded: '2018',
      headquarters: 'New York, NY',
      employees: '150-200',
      description: 'Leading provider of AI-powered financial technology solutions for banks, investment firms, and fintech companies.',
      certifications: ['SOC 2 Type II', 'ISO 27001', 'PCI DSS'],
      website: 'https://fintechsolutions.com'
    },
    pricing_tiers: [
      {
        name: 'Starter',
        price: '$1,500/month',
        features: ['Up to 1,000 clients', 'Basic portfolio analysis', 'Email support'],
        popular: false
      },
      {
        name: 'Professional',
        price: '$2,500/month',
        features: ['Up to 5,000 clients', 'Advanced AI recommendations', 'Priority support', 'API access'],
        popular: true
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        features: ['Unlimited clients', 'White-label options', 'Dedicated support', 'Custom integrations'],
        popular: false
      }
    ],
    reviews_sample: [
      {
        author: 'Sarah M.',
        company: 'Metro Investment Group',
        rating: 5,
        date: '2024-01-15',
        title: 'Excellent AI-powered insights',
        content: 'The AI recommendations have significantly improved our portfolio performance. The integration was seamless and the support team is fantastic.'
      },
      {
        author: 'David L.',
        company: 'Capital Advisors LLC',
        rating: 4,
        date: '2024-01-10',
        title: 'Great tool for portfolio management',
        content: 'Very intuitive interface and powerful analytics. Would like to see more customization options for reporting.'
      }
    ]
  }
};

export const MarketplaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [item, setItem] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const itemData = mockDetailData[id];
    setItem(itemData);
  }, [id]);

  if (!item) {
    return (
      <div className="container py-5 text-center">
        <h4>Loading...</h4>
      </div>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icons.Star key={i} className="text-warning" />);
    }

    if (hasHalfStar) {
      stars.push(<Icons.Star key="half" className="text-warning opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icons.Star key={`empty-${i}`} className="text-muted opacity-25" />);
    }

    return stars;
  };

  return (
    <div className="marketplace-detail">
      {/* Header */}
      <div className="container py-4">
        <div className="d-flex align-items-center mb-4">
          <Link to="/marketplace" className="btn btn-outline-secondary me-3">
            <Icons.ArrowLeft className="me-2" /> Back to Marketplace
          </Link>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/marketplace">Marketplace</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={`/marketplace?vertical=${item.vertical}`}>
                  {item.vertical.charAt(0).toUpperCase() + item.vertical.slice(1)}
                </Link>
              </li>
              <li className="breadcrumb-item active">{item.name}</li>
            </ol>
          </nav>
        </div>

        {/* Product Header */}
        <div className="row mb-5">
          <div className="col-lg-8">
            <div className="product-images">
              <div className="main-image mb-3">
                <img
                  src={item.images[selectedImage]}
                  alt={item.name}
                  className="img-fluid rounded"
                  style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                />
              </div>
              <div className="thumbnail-images">
                <div className="row g-2">
                  {item.images.map((image, index) => (
                    <div key={index} className="col-4">
                      <img
                        src={image}
                        alt={`${item.name} ${index + 1}`}
                        className={`img-fluid rounded cursor-pointer ${selectedImage === index ? 'border border-primary' : ''}`}
                        style={{ height: '80px', objectFit: 'cover', width: '100%' }}
                        onClick={() => setSelectedImage(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="product-info">
              <div className="mb-3">
                <span className={`badge ${item.type === 'agent' ? 'bg-success' : 'bg-info'} mb-2`}>
                  {item.type === 'agent' ? 'AI Agent' : 'Application'}
                </span>
              </div>

              <h1 className="h2 mb-2">{item.name}</h1>
              <p className="text-muted mb-3">by {item.vendor}</p>

              <div className="rating-section mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="d-flex">
                    {renderStars(item.rating)}
                  </div>
                  <span className="fw-bold">{item.rating}</span>
                  <span className="text-muted">({item.reviews} reviews)</span>
                </div>
              </div>

              <div className="pricing mb-4">
                <div className="h4 text-primary mb-2">{item.price}</div>
                <p className="text-muted small">Starting price for Professional tier</p>
              </div>

              <div className="tags mb-4">
                {item.tags.map(tag => (
                  <span key={tag} className="badge bg-light text-dark me-2 mb-2">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="action-buttons d-grid gap-2">
                <button className="btn btn-primary btn-lg">
                  Start Free Trial
                </button>
                <button className="btn btn-outline-primary">
                  Contact Vendor
                </button>
                <button className="btn btn-outline-secondary">
                  <Icons.Download className="me-2" />
                  Download Resources
                </button>
              </div>

              <div className="security-badges mt-4">
                <div className="d-flex align-items-center text-muted small">
                  <Icons.Shield className="me-2" />
                  <span>Enterprise Security Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="product-tabs">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                Features
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setActiveTab('pricing')}
              >
                Pricing
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({item.reviews})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'vendor' ? 'active' : ''}`}
                onClick={() => setActiveTab('vendor')}
              >
                Vendor Info
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="row">
                <div className="col-lg-8">
                  <h3 className="mb-3">Product Description</h3>
                  <div className="mb-4">
                    {item.longDescription.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))}
                  </div>

                  <h4 className="mb-3">Key Features</h4>
                  <div className="row">
                    {item.features.slice(0, 6).map((feature, index) => (
                      <div key={index} className="col-md-6 mb-2">
                        <div className="d-flex align-items-start">
                          <Icons.Check className="text-success me-2 mt-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">Specifications</h5>
                    </div>
                    <div className="card-body">
                      {Object.entries(item.specifications).map(([key, value]) => (
                        <div key={key} className="mb-3">
                          <div className="fw-semibold small text-muted">{key}</div>
                          <div>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div>
                <h3 className="mb-4">Complete Features List</h3>
                <div className="row">
                  {item.features.map((feature, index) => (
                    <div key={index} className="col-lg-6 mb-3">
                      <div className="d-flex align-items-start">
                        <Icons.Check className="text-success me-3 mt-1 flex-shrink-0" />
                        <div>
                          <strong>{feature}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div>
                <h3 className="mb-4">Pricing Plans</h3>
                <div className="row">
                  {item.pricing_tiers.map((tier, index) => (
                    <div key={index} className="col-lg-4 mb-4">
                      <div className={`card h-100 ${tier.popular ? 'border-primary' : ''}`}>
                        {tier.popular && (
                          <div className="card-header bg-primary text-white text-center">
                            <strong>Most Popular</strong>
                          </div>
                        )}
                        <div className="card-body text-center">
                          <h4 className="card-title">{tier.name}</h4>
                          <div className="h3 text-primary mb-3">{tier.price}</div>
                          <ul className="list-unstyled">
                            {tier.features.map((feature, idx) => (
                              <li key={idx} className="mb-2">
                                <Icons.Check className="text-success me-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="card-footer">
                          <div className="d-grid">
                            <button className={`btn ${tier.popular ? 'btn-primary' : 'btn-outline-primary'}`}>
                              {tier.price === 'Custom' ? 'Contact Sales' : 'Start Trial'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3>Customer Reviews</h3>
                  <button className="btn btn-outline-primary">Write a Review</button>
                </div>

                <div className="reviews-summary mb-4">
                  <div className="row">
                    <div className="col-md-3 text-center">
                      <div className="h2 mb-2">{item.rating}</div>
                      <div className="d-flex justify-content-center mb-2">
                        {renderStars(item.rating)}
                      </div>
                      <div className="text-muted">{item.reviews} reviews</div>
                    </div>
                    <div className="col-md-9">
                      {/* Rating breakdown would go here */}
                    </div>
                  </div>
                </div>

                <div className="reviews-list">
                  {item.reviews_sample.map((review, index) => (
                    <div key={index} className="review-item border-bottom pb-4 mb-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <strong>{review.author}</strong>
                          <span className="text-muted ms-2">{review.company}</span>
                        </div>
                        <small className="text-muted">{review.date}</small>
                      </div>
                      <div className="d-flex mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <h6>{review.title}</h6>
                      <p className="text-muted">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'vendor' && (
              <div className="row">
                <div className="col-lg-8">
                  <h3 className="mb-3">About {item.vendor_info.name}</h3>
                  <p className="mb-4">{item.vendor_info.description}</p>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h5>Company Details</h5>
                      <ul className="list-unstyled">
                        <li><strong>Founded:</strong> {item.vendor_info.founded}</li>
                        <li><strong>Headquarters:</strong> {item.vendor_info.headquarters}</li>
                        <li><strong>Company Size:</strong> {item.vendor_info.employees} employees</li>
                        <li>
                          <strong>Website:</strong>
                          <a href={item.vendor_info.website} target="_blank" rel="noopener noreferrer" className="ms-2">
                            {item.vendor_info.website} <Icons.ExternalLink />
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h5>Certifications</h5>
                      <ul className="list-unstyled">
                        {item.vendor_info.certifications.map((cert, index) => (
                          <li key={index}>
                            <Icons.Shield className="text-success me-2" />
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">Contact Vendor</h5>
                    </div>
                    <div className="card-body">
                      <div className="d-grid gap-2">
                        <button className="btn btn-primary">Request Demo</button>
                        <button className="btn btn-outline-primary">Get Quote</button>
                        <button className="btn btn-outline-secondary">Contact Support</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
