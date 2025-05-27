// /imports/ui/pages/Marketplace/Marketplace.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { MarketplaceCollection } from '/imports/api/marketplace/MarketplaceCollection';
import './Marketplace.scss';

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
  ),
  // Vertical Industry Icons
  Finance: ({ className = "", color = "#10B981" }) => (
    <svg className={className} width="64" height="64" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="financeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="1"/>
        </linearGradient>
      </defs>
      {/* Bank building base */}
      <rect x="8" y="20" width="48" height="36" fill="url(#financeGrad)" rx="2"/>
      {/* Columns */}
      <rect x="12" y="16" width="4" height="24" fill={color} opacity="0.9"/>
      <rect x="20" y="16" width="4" height="24" fill={color} opacity="0.9"/>
      <rect x="28" y="16" width="4" height="24" fill={color} opacity="0.9"/>
      <rect x="36" y="16" width="4" height="24" fill={color} opacity="0.9"/>
      <rect x="44" y="16" width="4" height="24" fill={color} opacity="0.9"/>
      {/* Roof/Top */}
      <polygon points="32,8 56,16 8,16" fill={color}/>
      {/* Door */}
      <rect x="28" y="40" width="8" height="16" fill="white" opacity="0.9"/>
      {/* Dollar sign overlay */}
      <circle cx="48" cy="16" r="8" fill="white" opacity="0.95"/>
      <text x="48" y="21" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>$</text>
    </svg>
  ),
  Healthcare: ({ className = "", color = "#3B82F6" }) => (
    <svg className={className} width="64" height="64" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="healthAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.6"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.8"/>
        </linearGradient>
      </defs>

      {/* Hospital building base */}
      <rect x="12" y="20" width="40" height="36" fill="url(#healthGrad)" rx="4"/>

      {/* Hospital cross - centered and prominent */}
      <rect x="28" y="12" width="8" height="24" fill="white" rx="2"/>
      <rect x="20" y="20" width="24" height="8" fill="white" rx="2"/>

      {/* Windows pattern */}
      <rect x="16" y="40" width="4" height="4" fill="white" opacity="0.8" rx="1"/>
      <rect x="24" y="40" width="4" height="4" fill="white" opacity="0.8" rx="1"/>
      <rect x="36" y="40" width="4" height="4" fill="white" opacity="0.8" rx="1"/>
      <rect x="44" y="40" width="4" height="4" fill="white" opacity="0.8" rx="1"/>

      <rect x="16" y="48" width="4" height="4" fill="white" opacity="0.8" rx="1"/>
      <rect x="24" y="48" width="4" height="4" fill="white" opacity="0.8" rx="1"/>
      <rect x="36" y="48" width="4" height="4" fill="white" opacity="0.8" rx="1"/>
      <rect x="44" y="48" width="4" height="4" fill="white" opacity="0.8" rx="1"/>

      {/* Medical symbol accent - stethoscope */}
      <circle cx="48" cy="12" r="6" fill="url(#healthAccent)"/>
      <circle cx="48" cy="12" r="3" fill="white" opacity="0.9"/>
      <path d="M45 15 Q48 18 51 15" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Heartbeat line - simplified and cleaner */}
      <path d="M8 58 L12 58 L14 54 L16 62 L18 50 L20 58 L56 58"
            stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  Automotive: ({ className = "", color = "#EF4444" }) => (
    <svg className={className} width="64" height="64" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="autoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="1"/>
        </linearGradient>
      </defs>
      {/* Car body */}
      <ellipse cx="32" cy="36" rx="26" ry="12" fill="url(#autoGrad)"/>
      <rect x="10" y="30" width="44" height="12" fill="url(#autoGrad)" rx="6"/>
      {/* Car roof */}
      <path d="M18 30 Q32 16 46 30" fill={color} opacity="0.9"/>
      {/* Windows */}
      <ellipse cx="28" cy="26" rx="8" ry="4" fill="white" opacity="0.8"/>
      <ellipse cx="36" cy="26" rx="8" ry="4" fill="white" opacity="0.8"/>
      {/* Wheels */}
      <circle cx="20" cy="44" r="6" fill="#333"/>
      <circle cx="44" cy="44" r="6" fill="#333"/>
      <circle cx="20" cy="44" r="3" fill="#666"/>
      <circle cx="44" cy="44" r="3" fill="#666"/>
      {/* Technology indicators */}
      <circle cx="48" cy="20" r="2" fill={color} opacity="0.7"/>
      <circle cx="52" cy="16" r="1.5" fill={color} opacity="0.5"/>
      <circle cx="44" cy="16" r="1.5" fill={color} opacity="0.5"/>
      <path d="M44 16 L48 20 L52 16" stroke={color} strokeWidth="1" opacity="0.6"/>
    </svg>
  ),
  Insurance: ({ className = "", color = "#8B5CF6" }) => (
    <svg className={className} width="64" height="64" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="insuranceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="1"/>
        </linearGradient>
      </defs>
      {/* Shield main body */}
      <path d="M32 8 L48 16 L48 36 Q48 48 32 56 Q16 48 16 36 L16 16 Z" fill="url(#insuranceGrad)"/>
      {/* Shield inner highlight */}
      <path d="M32 12 L44 18 L44 34 Q44 44 32 50 Q20 44 20 34 L20 18 Z" fill="white" opacity="0.1"/>
      {/* Checkmark */}
      <path d="M26 32 L31 37 L40 26" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Protective circles */}
      <circle cx="48" cy="48" r="6" fill={color} opacity="0.3"/>
      <circle cx="16" cy="48" r="4" fill={color} opacity="0.3"/>
      <circle cx="56" cy="32" r="3" fill={color} opacity="0.4"/>
      <circle cx="8" cy="28" r="3" fill={color} opacity="0.4"/>
    </svg>
  ),
  PublicSector: ({ className = "", color = "#F59E0B" }) => (
    <svg className={className} width="64" height="64" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="govGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="1"/>
        </linearGradient>
      </defs>
      {/* Government building base */}
      <rect x="8" y="24" width="48" height="32" fill="url(#govGrad)" rx="2"/>
      {/* Columns */}
      <rect x="12" y="20" width="4" height="28" fill="white" opacity="0.9"/>
      <rect x="18" y="20" width="4" height="28" fill="white" opacity="0.9"/>
      <rect x="24" y="20" width="4" height="28" fill="white" opacity="0.9"/>
      <rect x="36" y="20" width="4" height="28" fill="white" opacity="0.9"/>
      <rect x="42" y="20" width="4" height="28" fill="white" opacity="0.9"/>
      <rect x="48" y="20" width="4" height="28" fill="white" opacity="0.9"/>
      {/* Dome/Capitol roof */}
      <ellipse cx="32" cy="20" rx="16" ry="8" fill={color}/>
      <ellipse cx="32" cy="16" rx="12" ry="6" fill={color} opacity="0.9"/>
      <rect x="30" y="8" width="4" height="12" fill={color}/>
      <circle cx="32" cy="8" r="3" fill={color}/>
      {/* Flag */}
      <rect x="48" y="12" width="8" height="6" fill="#DC2626"/>
      <rect x="48" y="12" width="2" height="16" fill="#374151"/>
      {/* Steps */}
      <rect x="4" y="52" width="56" height="4" fill={color} opacity="0.7"/>
      <rect x="6" y="48" width="52" height="4" fill={color} opacity="0.5"/>
    </svg>
  ),
  Retail: ({ className = "", color = "#EC4899" }) => (
    <svg className={className} width="64" height="64" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="retailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="1"/>
        </linearGradient>
      </defs>
      {/* Shopping bag main body */}
      <path d="M16 24 L48 24 L46 52 L18 52 Z" fill="url(#retailGrad)" rx="2"/>
      {/* Bag handles */}
      <path d="M24 24 L24 18 Q24 12 32 12 Q40 12 40 18 L40 24"
            stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Store front accent */}
      <rect x="12" y="16" width="40" height="8" fill="white" opacity="0.2" rx="4"/>
      {/* Shopping cart icon overlay */}
      <circle cx="48" cy="16" r="8" fill="white" opacity="0.95"/>
      {/* Cart body */}
      <rect x="44" y="14" width="6" height="4" fill={color} rx="1"/>
      <path d="M44 14 L42 12 L41 12" stroke={color} strokeWidth="1" fill="none"/>
      {/* Cart wheels */}
      <circle cx="45" cy="19" r="1" fill={color}/>
      <circle cx="49" cy="19" r="1" fill={color}/>
      {/* Digital elements */}
      <circle cx="12" cy="36" r="2" fill="white" opacity="0.6"/>
      <circle cx="52" cy="40" r="2" fill="white" opacity="0.6"/>
      <circle cx="8" cy="44" r="1.5" fill="white" opacity="0.4"/>
      <path d="M8 44 L12 36 L52 40" stroke="white" strokeWidth="1" opacity="0.3"/>
    </svg>
  ),
  Technology: ({ className = "", color = "#6366F1" }) => (
   <svg className={className} width="64" height="64" viewBox="0 0 64 64" fill="none">
     <defs>
       <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
         <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
         <stop offset="100%" stopColor={color} stopOpacity="1"/>
       </linearGradient>
     </defs>
     {/* Main monitor/screen */}
     <rect x="12" y="16" width="40" height="28" fill="url(#techGrad)" rx="3"/>
     {/* Screen content/code lines */}
     <rect x="16" y="20" width="32" height="2" fill="white" opacity="0.8" rx="1"/>
     <rect x="16" y="24" width="24" height="2" fill="white" opacity="0.6" rx="1"/>
     <rect x="16" y="28" width="28" height="2" fill="white" opacity="0.8" rx="1"/>
     <rect x="16" y="32" width="20" height="2" fill="white" opacity="0.6" rx="1"/>
     <rect x="16" y="36" width="30" height="2" fill="white" opacity="0.8" rx="1"/>
     {/* Monitor stand */}
     <rect x="28" y="44" width="8" height="8" fill={color} opacity="0.9"/>
     <rect x="20" y="52" width="24" height="4" fill={color} opacity="0.8" rx="2"/>
     {/* Code brackets accent */}
     <circle cx="48" cy="12" r="8" fill="white" opacity="0.95"/>
     <text x="48" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>{"<>"}</text>
     {/* Network nodes */}
     <circle cx="8" cy="32" r="3" fill={color} opacity="0.7"/>
     <circle cx="56" cy="28" r="3" fill={color} opacity="0.7"/>
     <circle cx="6" cy="48" r="2" fill={color} opacity="0.5"/>
     <circle cx="58" cy="44" r="2" fill={color} opacity="0.5"/>
     {/* Connection lines */}
     <path d="M8 32 L12 28 M56 28 L52 32 M6 48 L12 44"
           stroke={color} strokeWidth="1.5" opacity="0.4"/>
   </svg>
  )
};

const verticalInfo = {
  finance: {
    id: 'finance',
    name: 'Financial Services',
    description: 'Banking, payments, trading, and fintech solutions',
    icon: 'Finance',
    color: '#10B981'
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    description: 'Medical devices, pharmaceuticals, and health tech',
    icon: 'Healthcare',
    color: '#3B82F6'
  },
  insurance: {
    id: 'insurance',
    name: 'Insurance',
    description: 'Risk management, claims processing, and insurtech',
    icon: 'Insurance',
    color: '#8B5CF6'
  },
  'public-sector': {
    id: 'public-sector',
    name: 'Public Sector',
    description: 'Government services, civic tech, and compliance',
    icon: 'PublicSector',
    color: '#F59E0B'
  },
  retail: {
    id: 'retail',
    name: 'Retail & E-commerce',
    description: 'Point of sale, inventory, and customer experience',
    icon: 'Retail',
    color: '#EC4899'
  },
  technology: {
    id: 'technology',
    name: 'Technology & Software',
    description: 'Developer tools, APIs, cloud services, and enterprise software',
    icon: 'Technology',
    color: '#6366F1'
  }
};

export const Marketplace = () => {
  const navigate = useNavigate();
  const { vertical, type } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVertical, setSelectedVertical] = useState(vertical || '');
  const [selectedType, setSelectedType] = useState(type || '');

  // Get data from MongoDB
  const { featuredItems, verticals, isLoading } = useTracker(() => {
    const featuredHandle = Meteor.subscribe('marketplace.items', { featured: true, limit: 6 });

    const query = {};
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { vendor: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }
    if (selectedVertical) {
      query.vertical = selectedVertical;
    }
    if (selectedType) {
      query.type = selectedType;
    }

    const featuredItems = MarketplaceCollection.find(
      { ...query, featured: true },
      { sort: { rating: -1, reviews: -1 }, limit: 6 }
    ).fetch();

    // Get vertical counts
    const allItems = MarketplaceCollection.find().fetch();
    const verticalCounts = {};
    allItems.forEach(item => {
      verticalCounts[item.vertical] = (verticalCounts[item.vertical] || 0) + 1;
    });

    const verticals = Object.keys(verticalInfo).map(verticalId => ({
      ...verticalInfo[verticalId],
      itemCount: verticalCounts[verticalId] || 0
    }));

    return {
      featuredItems,
      verticals,
      isLoading: !featuredHandle.ready()
    };
  }, [searchQuery, selectedVertical, selectedType]);

  const handleVerticalClick = (verticalId) => {
    navigate(`/marketplace/all?vertical=${verticalId}`);
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

  const renderVerticalIcon = (vertical) => {
    const IconComponent = Icons[vertical.icon];
    return IconComponent ? <IconComponent color={vertical.color} /> : null;
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
                    {verticals.map(vertical => (
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
              View All Apps & Agents <Icons.ArrowRight className="ms-1" />
            </Link>
          </div>

          <div className="row g-4">
            {verticals.map(vertical => (
              <div key={vertical.id} className="col-lg-4 col-md-6">
                <div
                  className={`vertical-card card h-100 ${selectedVertical === vertical.id ? 'border-primary' : ''}`}
                  onClick={() => handleVerticalClick(vertical.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body text-center">
                    <div className="vertical-icon mb-3">
                      {renderVerticalIcon(vertical)}
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
              {isLoading ? 'Loading...' : `${featuredItems.length} solution${featuredItems.length !== 1 ? 's' : ''} found`}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : featuredItems.length === 0 ? (
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
              {featuredItems.map(item => (
                <div key={item._id} className="col-lg-4 col-md-6">
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
                            to={`/marketplace/item/${item._id}`}
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
