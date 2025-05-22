// /imports/ui/pages/Marketplace/Marketplace.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './Marketplace.scss';

// Simple SVG icon components
const Icons = {
  Search: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="M21 21l-4.35-4.35"></path>
    </svg>
  ),
  Filter: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"></polygon>
    </svg>
  ),
  Star: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"></polygon>
    </svg>
  ),
  ArrowRight: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12,5 19,12 12,19"></polyline>
    </svg>
  ),
  ExternalLink: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15,3 21,3 21,9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  )
};

// Mock data for marketplace items
const mockMarketplaceData = {
  verticals: [
    {
      id: 'finance',
      name: 'Financial Services',
      description: 'Banking, payments, trading, and fintech solutions',
      icon: '💰',
      itemCount: 234
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Life Sciences',
      description: 'Medical devices, pharmaceuticals, and health tech',
      icon: '🏥',
      itemCount: 189
    },
    {
      id: 'automotive',
      name: 'Automotive',
      description: 'Connected vehicles, manufacturing, and mobility',
      icon: '🚗',
      itemCount: 156
    },
    {
      id: 'insurance',
      name: 'Insurance',
      description: 'Risk management, claims processing, and insurtech',
      icon: '🛡️',
      itemCount: 143
    },
    {
      id: 'public-sector',
      name: 'Public Sector',
      description: 'Government services, civic tech, and compliance',
      icon: '🏛️',
      itemCount: 127
    },
    {
      id: 'retail',
      name: 'Retail & E-commerce',
      description: 'Point of sale, inventory, and customer experience',
      icon: '🛒',
      itemCount: 198
    }
  ],
  featuredItems: [
    {
      id: 1,
      name: 'AI Financial Advisor Agent',
      vendor: 'FinTech Solutions Inc.',
      type: 'agent',
      vertical: 'finance',
      rating: 4.8,
      reviews: 124,
      price: '$2,500/month',
      description: 'Intelligent financial advisory agent that provides personalized investment recommendations and portfolio management.',
      tags: ['AI/ML', 'Financial Planning', 'Investment'],
      image: '/api/placeholder/280/160'
    },
    {
      id: 2,
      name: 'Healthcare Data Analytics Platform',
      vendor: 'MedTech Analytics',
      type: 'app',
      vertical: 'healthcare',
      rating: 4.6,
      reviews: 89,
      price: '$5,000/month',
      description: 'Comprehensive analytics platform for healthcare providers to track patient outcomes and optimize operations.',
      tags: ['Analytics', 'Healthcare', 'Data Science'],
      image: '/api/placeholder/280/160'
    },
    {
      id: 3,
      name: 'Smart Vehicle Fleet Manager',
      vendor: 'AutoTech Systems',
      type: 'app',
      vertical: 'automotive',
      rating: 4.7,
      reviews: 156,
      price: '$1,800/month',
      description: 'IoT-enabled fleet management solution for tracking, maintenance, and optimization of vehicle fleets.',
      tags: ['IoT', 'Fleet Management', 'Automotive'],
      image: '/api/placeholder/280/160'
    },
    {
      id: 4,
      name: 'Insurance Claims Processing Agent',
      vendor: 'InsureTech AI',
      type: 'agent',
      vertical: 'insurance',
      rating: 4.9,
      reviews: 203,
      price: '$3,200/month',
      description: 'AI-powered agent that automates insurance claims processing and fraud detection.',
      tags: ['AI/ML', 'Claims Processing', 'Fraud Detection'],
      image: '/api/placeholder/280/160'
    },
    {
      id: 5,
      name: 'Citizen Services Portal',
      vendor: 'GovTech Solutions',
      type: 'app',
      vertical: 'public-sector',
      rating: 4.5,
      reviews: 67,
      price: '$4,500/month',
      description: 'Digital platform for citizens to access government services and submit applications online.',
      tags: ['Government', 'Digital Services', 'Citizen Engagement'],
      image: '/api/placeholder/280/160'
    },
    {
      id: 6,
      name: 'E-commerce Personalization Engine',
      vendor: 'Retail AI Corp',
      type: 'agent',
      vertical: 'retail',
      rating: 4.8,
      reviews: 312,
      price: '$2,800/month',
      description: 'AI agent that personalizes shopping experiences and product recommendations for e-commerce platforms.',
      tags: ['AI/ML', 'Personalization', 'E-commerce'],
      image: '/api/placeholder/280/160'
    }
  ]
};

export const Marketplace = () => {
  const navigate = useNavigate();
  const { vertical, type } = useParams(); // Get URL parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVertical, setSelectedVertical] = useState(vertical || '');
  const [selectedType, setSelectedType] = useState(type || '');
  const [filteredItems, setFilteredItems] = useState(mockMarketplaceData.featuredItems);

  // Update filters when URL parameters change
  useEffect(() => {
    setSelectedVertical(vertical || '');
    setSelectedType(type || '');
  }, [vertical, type]);

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = mockMarketplaceData.featuredItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedVertical) {
      filtered = filtered.filter(item => item.vertical === selectedVertical);
    }

    if (selectedType) {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedVertical, selectedType]);

  const handleVerticalClick = (verticalId) => {
    setSelectedVertical(verticalId);
  };

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
    <div className="marketplace">
      {/* Hero Section */}
      <div className="hero-section bg-primary text-white py-5 mb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">
                Marketplace
              </h1>
              <p className="lead mb-4">
                Discover and deploy industry-specific applications and AI agents from trusted vendors.
                Find solutions tailored to your vertical that integrate seamlessly with your infrastructure.
              </p>
              <div className="d-flex gap-3">
                <span className="badge bg-light text-primary px-3 py-2">1,200+ Solutions</span>
                <span className="badge bg-light text-primary px-3 py-2">Trusted Vendors</span>
                <span className="badge bg-light text-primary px-3 py-2">Enterprise Ready</span>
              </div>
            </div>
            <div className="col-lg-4 text-center">
              <div className="hero-stats">
                <div className="stat-item mb-3">
                  <h3 className="fw-bold">1,200+</h3>
                  <p className="mb-0">Apps & Agents</p>
                </div>
                <div className="stat-item mb-3">
                  <h3 className="fw-bold">50+</h3>
                  <p className="mb-0">Trusted Vendors</p>
                </div>
                <div className="stat-item">
                  <h3 className="fw-bold">15</h3>
                  <p className="mb-0">Industry Verticals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Search and Filters */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="search-filters-section">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group input-group-lg">
                    <span className="input-group-text">
                      <Icons.Search />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search apps, agents, or vendors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select form-select-lg"
                    value={selectedVertical}
                    onChange={(e) => setSelectedVertical(e.target.value)}
                  >
                    <option value="">All Industries</option>
                    {mockMarketplaceData.verticals.map(vertical => (
                      <option key={vertical.id} value={vertical.id}>
                        {vertical.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select form-select-lg"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="app">Applications</option>
                    <option value="agent">AI Agents</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Industry Verticals */}
        <section className="verticals-section mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title">Browse by Industry</h2>
            <Link to="/marketplace/all" className="btn btn-outline-primary">
              View All <Icons.ArrowRight className="ms-1" />
            </Link>
          </div>

          <div className="row g-4">
            {mockMarketplaceData.verticals.map(vertical => (
              <div key={vertical.id} className="col-lg-4 col-md-6">
                <div
                  className={`vertical-card card h-100 ${selectedVertical === vertical.id ? 'border-primary' : ''}`}
                  onClick={() => handleVerticalClick(vertical.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body text-center">
                    <div className="vertical-icon mb-3" style={{ fontSize: '3rem' }}>
                      {vertical.icon}
                    </div>
                    <h5 className="card-title">{vertical.name}</h5>
                    <p className="text-muted mb-3">{vertical.description}</p>
                    <span className="badge bg-primary">{vertical.itemCount} solutions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Solutions */}
        <section className="featured-section">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title">
              {selectedVertical || selectedType || searchQuery ? 'Filtered Results' : 'Featured Solutions'}
            </h2>
            <div className="text-muted">
              {filteredItems.length} solution{filteredItems.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="text-muted">No solutions found</h4>
              <p className="text-muted">Try adjusting your search criteria or browse different categories.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedVertical('');
                  setSelectedType('');
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filteredItems.map(item => (
                <div key={item.id} className="col-lg-4 col-md-6">
                  <div className="solution-card card h-100">
                    <img
                      src={item.image}
                      className="card-img-top"
                      alt={item.name}
                      style={{ height: '160px', objectFit: 'cover' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <div className="mb-2">
                        <span className={`badge ${item.type === 'agent' ? 'bg-success' : 'bg-info'} mb-2`}>
                          {item.type === 'agent' ? 'AI Agent' : 'Application'}
                        </span>
                      </div>

                      <h5 className="card-title">{item.name}</h5>
                      <p className="text-muted mb-2">by {item.vendor}</p>

                      <div className="rating-section mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="d-flex">
                            {renderStars(item.rating)}
                          </div>
                          <span className="text-muted small">
                            {item.rating} ({item.reviews} reviews)
                          </span>
                        </div>
                      </div>

                      <p className="card-text text-muted small mb-3">
                        {item.description}
                      </p>

                      <div className="tags mb-3">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="badge bg-light text-dark me-1 mb-1">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="price">
                            <strong className="text-primary">{item.price}</strong>
                          </div>
                          <Link
                            to={`/marketplace/${item.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Call to Action */}
        <section className="cta-section bg-light rounded p-5 mt-5 text-center">
          <h3 className="mb-3">Can't find what you're looking for?</h3>
          <p className="text-muted mb-4">
            Our marketplace is constantly growing. Contact our team to discuss custom solutions
            or request specific integrations for your industry.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button className="btn btn-primary">
              Request Custom Solution
            </button>
            <button className="btn btn-outline-primary">
              Contact Sales
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
