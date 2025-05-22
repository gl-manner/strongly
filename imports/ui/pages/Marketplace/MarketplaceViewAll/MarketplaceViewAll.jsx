// /imports/ui/pages/Marketplace/MarketplaceViewAll/MarketplaceViewAll.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MarketplaceViewAll.scss';

// Simple SVG icon components
const Icons = {
  ArrowLeft: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12,19 5,12 12,5"></polyline>
    </svg>
  ),
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
  Grid: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  List: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  ),
  ArrowRight: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12,5 19,12 12,19"></polyline>
    </svg>
  ),
  TrendingUp: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
      <polyline points="17,6 23,6 23,12"></polyline>
    </svg>
  )
};

// Extended mock data for all verticals
const mockVerticalData = {
  finance: {
    id: 'finance',
    name: 'Financial Services',
    description: 'Banking, payments, trading, and fintech solutions',
    icon: '💰',
    color: '#10B981',
    totalSolutions: 234,
    popularSolutions: [
      { id: 1, name: 'AI Financial Advisor Agent', vendor: 'FinTech Solutions Inc.', type: 'agent', rating: 4.8, price: '$2,500/month' },
      { id: 7, name: 'Banking Core System', vendor: 'CoreBank Systems', type: 'app', rating: 4.6, price: '$15,000/month' },
      { id: 8, name: 'Payment Gateway API', vendor: 'PayFlow Technologies', type: 'app', rating: 4.7, price: '$500/month' },
      { id: 9, name: 'Risk Assessment AI', vendor: 'RiskTech Analytics', type: 'agent', rating: 4.9, price: '$3,800/month' }
    ],
    subcategories: ['Banking', 'Investment Management', 'Payment Processing', 'Risk Management', 'Fraud Detection', 'Regulatory Compliance']
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    description: 'Medical devices, pharmaceuticals, and health tech',
    icon: '🏥',
    color: '#3B82F6',
    totalSolutions: 189,
    popularSolutions: [
      { id: 2, name: 'Healthcare Data Analytics Platform', vendor: 'MedTech Analytics', type: 'app', rating: 4.6, price: '$5,000/month' },
      { id: 10, name: 'Patient Management System', vendor: 'HealthCare Solutions', type: 'app', rating: 4.5, price: '$2,200/month' },
      { id: 11, name: 'Drug Discovery AI', vendor: 'PharmaAI Research', type: 'agent', rating: 4.8, price: '$12,000/month' },
      { id: 12, name: 'Telemedicine Platform', vendor: 'TeleMed Connect', type: 'app', rating: 4.4, price: '$1,800/month' }
    ],
    subcategories: ['Electronic Health Records', 'Medical Imaging', 'Drug Discovery', 'Telemedicine', 'Patient Monitoring', 'Clinical Trials']
  },
  automotive: {
    id: 'automotive',
    name: 'Automotive',
    description: 'Connected vehicles, manufacturing, and mobility',
    icon: '🚗',
    color: '#EF4444',
    totalSolutions: 156,
    popularSolutions: [
      { id: 3, name: 'Smart Vehicle Fleet Manager', vendor: 'AutoTech Systems', type: 'app', rating: 4.7, price: '$1,800/month' },
      { id: 13, name: 'Autonomous Driving AI', vendor: 'DriveAI Technologies', type: 'agent', rating: 4.9, price: '$25,000/month' },
      { id: 14, name: 'Vehicle Diagnostics Platform', vendor: 'AutoDiag Solutions', type: 'app', rating: 4.3, price: '$800/month' },
      { id: 15, name: 'Supply Chain Optimizer', vendor: 'AutoSupply Systems', type: 'agent', rating: 4.6, price: '$4,500/month' }
    ],
    subcategories: ['Fleet Management', 'Autonomous Vehicles', 'Connected Cars', 'Manufacturing', 'Supply Chain', 'Predictive Maintenance']
  },
  insurance: {
    id: 'insurance',
    name: 'Insurance',
    description: 'Risk management, claims processing, and insurtech',
    icon: '🛡️',
    color: '#8B5CF6',
    totalSolutions: 143,
    popularSolutions: [
      { id: 4, name: 'Insurance Claims Processing Agent', vendor: 'InsureTech AI', type: 'agent', rating: 4.9, price: '$3,200/month' },
      { id: 16, name: 'Policy Management System', vendor: 'InsureCore Solutions', type: 'app', rating: 4.4, price: '$2,800/month' },
      { id: 17, name: 'Fraud Detection Engine', vendor: 'FraudWatch Systems', type: 'agent', rating: 4.7, price: '$5,500/month' },
      { id: 18, name: 'Risk Calculator Platform', vendor: 'RiskCalc Technologies', type: 'app', rating: 4.5, price: '$1,200/month' }
    ],
    subcategories: ['Claims Processing', 'Underwriting', 'Policy Management', 'Fraud Detection', 'Risk Assessment', 'Customer Service']
  },
  'public-sector': {
    id: 'public-sector',
    name: 'Public Sector',
    description: 'Government services, civic tech, and compliance',
    icon: '🏛️',
    color: '#F59E0B',
    totalSolutions: 127,
    popularSolutions: [
      { id: 5, name: 'Citizen Services Portal', vendor: 'GovTech Solutions', type: 'app', rating: 4.5, price: '$4,500/month' },
      { id: 19, name: 'Document Processing AI', vendor: 'GovAI Systems', type: 'agent', rating: 4.6, price: '$6,800/month' },
      { id: 20, name: 'Emergency Response System', vendor: 'EmergencyTech Solutions', type: 'app', rating: 4.7, price: '$8,200/month' },
      { id: 21, name: 'Budget Management Platform', vendor: 'PublicFinance Systems', type: 'app', rating: 4.3, price: '$3,500/month' }
    ],
    subcategories: ['Citizen Services', 'Emergency Management', 'Document Processing', 'Budget Management', 'Compliance Monitoring', 'Public Safety']
  },
  retail: {
    id: 'retail',
    name: 'Retail & E-commerce',
    description: 'Point of sale, inventory, and customer experience',
    icon: '🛒',
    color: '#EC4899',
    totalSolutions: 198,
    popularSolutions: [
      { id: 6, name: 'E-commerce Personalization Engine', vendor: 'Retail AI Corp', type: 'agent', rating: 4.8, price: '$2,800/month' },
      { id: 22, name: 'Inventory Management System', vendor: 'RetailTech Solutions', type: 'app', rating: 4.5, price: '$1,500/month' },
      { id: 23, name: 'Customer Analytics Platform', vendor: 'ShopperInsights Inc.', type: 'app', rating: 4.6, price: '$2,200/month' },
      { id: 24, name: 'Price Optimization AI', vendor: 'PriceOptimal Systems', type: 'agent', rating: 4.7, price: '$3,800/month' }
    ],
    subcategories: ['E-commerce Platforms', 'Inventory Management', 'Customer Analytics', 'Price Optimization', 'Supply Chain', 'Point of Sale']
  }
};

export const MarketplaceViewAll = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('solutions-desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filteredVerticals, setFilteredVerticals] = useState(Object.values(mockVerticalData));

  // Filter and sort verticals
  useEffect(() => {
    let filtered = Object.values(mockVerticalData);

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(vertical =>
        vertical.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vertical.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vertical.subcategories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting
    switch (selectedSort) {
      case 'solutions-desc':
        filtered.sort((a, b) => b.totalSolutions - a.totalSolutions);
        break;
      case 'solutions-asc':
        filtered.sort((a, b) => a.totalSolutions - b.totalSolutions);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredVerticals(filtered);
  }, [searchQuery, selectedSort]);

  const handleVerticalClick = (verticalId) => {
    navigate(`/marketplace/vertical/${verticalId}`);
  };

  const renderGridView = () => (
    <div className="row g-4">
      {filteredVerticals.map(vertical => (
        <div key={vertical.id} className="col-lg-6 col-xl-4">
          <div
            className="vertical-card-detailed card h-100"
            onClick={() => handleVerticalClick(vertical.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="vertical-icon-large me-3"
                  style={{
                    fontSize: '2.5rem',
                    backgroundColor: `${vertical.color}15`,
                    color: vertical.color,
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {vertical.icon}
                </div>
                <div className="flex-grow-1">
                  <h5 className="card-title mb-1">{vertical.name}</h5>
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-2">{vertical.totalSolutions} solutions</span>
                    <Icons.TrendingUp className="text-success" />
                  </div>
                </div>
              </div>

              <p className="text-muted mb-3">{vertical.description}</p>

              <div className="subcategories mb-3">
                <h6 className="small text-muted mb-2">POPULAR CATEGORIES</h6>
                <div className="d-flex flex-wrap gap-1">
                  {vertical.subcategories.slice(0, 4).map((cat, index) => (
                    <span key={index} className="badge bg-light text-dark small">
                      {cat}
                    </span>
                  ))}
                  {vertical.subcategories.length > 4 && (
                    <span className="badge bg-light text-muted small">
                      +{vertical.subcategories.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="popular-solutions">
                <h6 className="small text-muted mb-2">TOP SOLUTIONS</h6>
                <div className="solution-previews">
                  {vertical.popularSolutions.slice(0, 3).map((solution, index) => (
                    <div key={solution.id} className="solution-preview d-flex align-items-center mb-2">
                      <span className={`badge ${solution.type === 'agent' ? 'bg-success' : 'bg-info'} me-2`} style={{ fontSize: '0.65rem' }}>
                        {solution.type === 'agent' ? 'AI' : 'APP'}
                      </span>
                      <div className="flex-grow-1">
                        <div className="small fw-medium">{solution.name}</div>
                        <div className="small text-muted">{solution.vendor}</div>
                      </div>
                      <div className="text-primary small fw-medium">{solution.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">Explore {vertical.name}</span>
                <Icons.ArrowRight className="text-primary" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="vertical-list">
      {filteredVerticals.map(vertical => (
        <div
          key={vertical.id}
          className="vertical-list-item card mb-3"
          onClick={() => handleVerticalClick(vertical.id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <div
                    className="vertical-icon-medium me-3"
                    style={{
                      fontSize: '2rem',
                      backgroundColor: `${vertical.color}15`,
                      color: vertical.color,
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {vertical.icon}
                  </div>
                  <div>
                    <h5 className="mb-1">{vertical.name}</h5>
                    <p className="text-muted mb-0">{vertical.description}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h5 mb-1 text-primary">{vertical.totalSolutions}</div>
                  <small className="text-muted">Solutions Available</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex flex-wrap gap-1">
                  {vertical.subcategories.slice(0, 3).map((cat, index) => (
                    <span key={index} className="badge bg-light text-dark small">
                      {cat}
                    </span>
                  ))}
                  {vertical.subcategories.length > 3 && (
                    <span className="badge bg-light text-muted small">
                      +{vertical.subcategories.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="marketplace-view-all">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <Link to="/marketplace" className="btn btn-outline-secondary me-3">
            <Icons.ArrowLeft className="me-2" /> Back to Marketplace
          </Link>
          <div>
            <h2 className="mb-1">All Industry Verticals</h2>
            <p className="text-muted mb-0">Browse solutions across all industries and use cases</p>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <Icons.Search />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search industries, categories, or solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              <option value="solutions-desc">Most Solutions</option>
              <option value="solutions-asc">Fewest Solutions</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
          <div className="col-md-3">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('grid')}
              >
                <Icons.Grid className="me-1" /> Grid
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('list')}
              >
                <Icons.List className="me-1" /> List
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted">
                Showing {filteredVerticals.length} of {Object.keys(mockVerticalData).length} industries
              </span>
            </div>
            <div>
              <span className="text-muted">
                Total: {filteredVerticals.reduce((sum, v) => sum + v.totalSolutions, 0)} solutions
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredVerticals.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted">No industries found</h4>
            <p className="text-muted">Try adjusting your search criteria.</p>
            <button
              className="btn btn-primary"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? renderGridView() : renderListView()}
          </>
        )}

        {/* Call to Action */}
        <section className="cta-section bg-light rounded p-4 mt-5 text-center">
          <h4 className="mb-3">Don't see your industry?</h4>
          <p className="text-muted mb-4">
            We're constantly adding new verticals and solutions. Let us know what you're looking for.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button className="btn btn-primary">
              Request New Vertical
            </button>
            <button className="btn btn-outline-primary">
              Suggest Solution
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
