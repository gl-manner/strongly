// /imports/ui/pages/Marketplace/MarketplaceViewAll/MarketplaceViewAll.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { MarketplaceCollection } from '/imports/api/marketplace/MarketplaceCollection';
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
  )
};

const verticalInfo = {
  finance: { name: 'Financial Services', color: '#10B981' },
  healthcare: { name: 'Healthcare & Life Sciences', color: '#3B82F6' },
  automotive: { name: 'Automotive', color: '#EF4444' },
  insurance: { name: 'Insurance', color: '#8B5CF6' },
  'public-sector': { name: 'Public Sector', color: '#F59E0B' },
  retail: { name: 'Retail & E-commerce', color: '#EC4899' },
  technology: { name: 'Technology & Software', color: '#6366F1' }
};

export const MarketplaceViewAll = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedVertical, setSelectedVertical] = useState(searchParams.get('vertical') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'rating-desc');
  const [viewMode, setViewMode] = useState('grid');

  // Reactive data from MongoDB
  const { items, isLoading, verticals } = useTracker(() => {
    const handle = Meteor.subscribe('marketplace.items', {
      search: searchQuery,
      vertical: selectedVertical,
      type: selectedType,
      limit: 100
    });

    const query = {};

    // Build query based on filters
    if (selectedVertical) {
      query.vertical = selectedVertical;
    }
    if (selectedType) {
      query.type = selectedType;
    }
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { vendor: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    // Get items with sorting
    let sortOptions = { rating: -1, reviews: -1 };
    switch (selectedSort) {
      case 'name-asc':
        sortOptions = { name: 1 };
        break;
      case 'name-desc':
        sortOptions = { name: -1 };
        break;
      case 'price-asc':
        sortOptions = { priceNumeric: 1 };
        break;
      case 'price-desc':
        sortOptions = { priceNumeric: -1 };
        break;
      case 'rating-desc':
      default:
        sortOptions = { rating: -1, reviews: -1 };
        break;
    }

    const items = MarketplaceCollection.find(query, { sort: sortOptions }).fetch();

    // Get unique verticals with counts
    const allItems = MarketplaceCollection.find().fetch();
    const verticalCounts = {};
    allItems.forEach(item => {
      verticalCounts[item.vertical] = (verticalCounts[item.vertical] || 0) + 1;
    });

    const verticals = Object.keys(verticalCounts).map(vertical => ({
      id: vertical,
      name: verticalInfo[vertical]?.name || vertical,
      count: verticalCounts[vertical]
    }));

    return {
      items,
      isLoading: !handle.ready(),
      verticals
    };
  }, [searchQuery, selectedVertical, selectedType, selectedSort]);

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedVertical) params.set('vertical', selectedVertical);
    if (selectedType) params.set('type', selectedType);
    if (selectedSort !== 'rating-desc') params.set('sort', selectedSort);

    setSearchParams(params);
  }, [searchQuery, selectedVertical, selectedType, selectedSort, setSearchParams]);

  const handleItemClick = (itemId) => {
    navigate(`/marketplace/item/${itemId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedVertical('');
    setSelectedType('');
    setSelectedSort('rating-desc');
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

  const renderGridView = () => (
    <div className="row g-4">
      {items.map(item => (
        <div key={item._id} className="col-lg-4 col-md-6">
          <div
            className="solution-card card h-100"
            onClick={() => handleItemClick(item._id)}
            style={{ cursor: 'pointer' }}
          >
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
                <span className="badge bg-light text-dark ms-2" style={{
                  color: verticalInfo[item.vertical]?.color || '#666'
                }}>
                  {verticalInfo[item.vertical]?.name || item.vertical}
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
                  <button className="btn btn-primary btn-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="solution-list">
      {items.map(item => (
        <div
          key={item._id}
          className="solution-list-item card mb-3"
          onClick={() => handleItemClick(item._id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="img-fluid rounded"
                  style={{ height: '80px', objectFit: 'cover', width: '100%' }}
                />
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-2">
                  <span className={`badge ${item.type === 'agent' ? 'bg-success' : 'bg-info'} me-2`}>
                    {item.type === 'agent' ? 'AI Agent' : 'App'}
                  </span>
                  <span className="badge bg-light text-dark">
                    {verticalInfo[item.vertical]?.name || item.vertical}
                  </span>
                </div>
                <h5 className="mb-1">{item.name}</h5>
                <p className="text-muted mb-1">by {item.vendor}</p>
                <p className="text-muted small mb-0">{item.description}</p>
              </div>
              <div className="col-md-2 text-center">
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                  <div className="d-flex">
                    {renderStars(item.rating)}
                  </div>
                  <span className="small">{item.rating}</span>
                </div>
                <small className="text-muted">({item.reviews} reviews)</small>
              </div>
              <div className="col-md-2 text-end">
                <div className="h5 text-primary mb-2">{item.price}</div>
                <button className="btn btn-primary btn-sm">
                  View Details
                </button>
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
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="mb-1">Apps & AI Agents</h2>
            <p className="text-muted mb-0">
              Discover and deploy applications and AI agents across all industries
            </p>
          </div>
          <Link to="/marketplace" className="btn btn-outline-secondary">
            <Icons.ArrowLeft className="me-2" /> Back to Marketplace
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">
                <Icons.Search />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search apps and agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={selectedVertical}
              onChange={(e) => setSelectedVertical(e.target.value)}
            >
              <option value="">All Industries</option>
              {verticals.map(vertical => (
                <option key={vertical.id} value={vertical.id}>
                  {vertical.name} ({vertical.count})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="app">Applications</option>
              <option value="agent">AI Agents</option>
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              <option value="rating-desc">Highest Rated</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low to High</option>
              <option value="price-desc">Price High to Low</option>
            </select>
          </div>
          <div className="col-md-2">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('grid')}
              >
                <Icons.Grid />
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('list')}
              >
                <Icons.List />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedVertical || selectedType) && (
          <div className="active-filters mb-4">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <span className="text-muted me-2">Active filters:</span>
              {searchQuery && (
                <span className="badge bg-primary">
                  Search: "{searchQuery}"
                  <button
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '0.65em' }}
                    onClick={() => setSearchQuery('')}
                  ></button>
                </span>
              )}
              {selectedVertical && (
                <span className="badge bg-primary">
                  Industry: {verticalInfo[selectedVertical]?.name || selectedVertical}
                  <button
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '0.65em' }}
                    onClick={() => setSelectedVertical('')}
                  ></button>
                </span>
              )}
              {selectedType && (
                <span className="badge bg-primary">
                  Type: {selectedType === 'agent' ? 'AI Agents' : 'Applications'}
                  <button
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '0.65em' }}
                    onClick={() => setSelectedType('')}
                  ></button>
                </span>
              )}
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={clearFilters}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="results-summary mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted">
                {isLoading ? 'Loading...' : `Showing ${items.length} solutions`}
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted">No solutions found</h4>
            <p className="text-muted">Try adjusting your search criteria or browse different categories.</p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? renderGridView() : renderListView()}
          </>
        )}

        {/* Call to Action */}
        <section className="cta-section bg-light rounded p-4 mt-5 text-center">
          <h4 className="mb-3">Don't see what you need?</h4>
          <p className="text-muted mb-4">
            We're constantly adding new solutions. Let us know what you're looking for.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button className="btn btn-primary">
              Request Solution
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
