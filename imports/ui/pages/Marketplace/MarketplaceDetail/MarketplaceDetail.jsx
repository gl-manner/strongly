// /imports/ui/pages/Marketplace/MarketplaceDetail/MarketplaceDetail.jsx

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { MarketplaceCollection } from '/imports/api/marketplace/MarketplaceCollection';
import './MarketplaceDetail.scss';

// Simple SVG icon components (same as before)
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

const verticalInfo = {
  finance: { name: 'Financial Services', color: '#10B981' },
  healthcare: { name: 'Healthcare & Life Sciences', color: '#3B82F6' },
  automotive: { name: 'Automotive', color: '#EF4444' },
  insurance: { name: 'Insurance', color: '#8B5CF6' },
  'public-sector': { name: 'Public Sector', color: '#F59E0B' },
  retail: { name: 'Retail & E-commerce', color: '#EC4899' },
  technology: { name: 'Technology & Software', color: '#6366F1' }
};

export const MarketplaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);

  // Debug logging
  console.log('MarketplaceDetail - Route ID:', id);
  console.log('MarketplaceDetail - Component mounting');

  // Get item data from MongoDB
  const { item, isLoading } = useTracker(() => {
    console.log('Subscribing to marketplace item:', id);
    const handle = Meteor.subscribe('marketplace.item', id);
    const item = MarketplaceCollection.findOne(id);

    console.log('Subscription ready:', handle.ready());
    console.log('Found item:', item ? item.name : 'No item found');

    return {
      item,
      isLoading: !handle.ready()
    };
  }, [id]);

  // Add some debug info at the top of the component during development
  if (Meteor.isDevelopment) {
    console.log('MarketplaceDetail render - ID:', id, 'Loading:', isLoading, 'Item:', item?.name);
  }

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-5 text-center">
        <h4>Solution not found</h4>
        <p className="text-muted mb-4">The solution you're looking for doesn't exist or has been removed.</p>
        <Link to="/marketplace" className="btn btn-primary">
          Back to Marketplace
        </Link>
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/marketplace">Marketplace</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={`/marketplace/all?vertical=${item.vertical}`}>
                  {verticalInfo[item.vertical]?.name || item.vertical}
                </Link>
              </li>
              <li className="breadcrumb-item active">{item.name}</li>
            </ol>
          </nav>
          <Link to="/marketplace" className="btn btn-outline-secondary">
            <Icons.ArrowLeft className="me-2" /> Back to Marketplace
          </Link>
        </div>

        {/* Product Header */}
        <div className="row mb-5">
          <div className="col-lg-8">
            <div className="product-images">
              <div className="main-image mb-3">
                <img
                  src={item.images?.[selectedImage] || item.image}
                  alt={item.name}
                  className="img-fluid rounded"
                  style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                />
              </div>
              {item.images && item.images.length > 1 && (
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
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="product-info">
              <div className="mb-3">
                <span className={`badge ${item.type === 'agent' ? 'bg-success' : 'bg-info'} mb-2`}>
                  {item.type === 'agent' ? 'AI Agent' : 'Application'}
                </span>
                <span className="badge bg-light text-dark ms-2">
                  {verticalInfo[item.vertical]?.name || item.vertical}
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
                <p className="text-muted small">Starting price</p>
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
                className={`nav-link ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
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
                    {item.longDescription ? (
                      item.longDescription.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-3">{paragraph}</p>
                      ))
                    ) : (
                      <p className="mb-3">{item.description}</p>
                    )}
                  </div>

                  {item.features && (
                    <>
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
                    </>
                  )}
                </div>

                <div className="col-lg-4">
                  {item.specifications && (
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
                  )}
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div>
                <h3 className="mb-4">Complete Features List</h3>
                {item.features ? (
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
                ) : (
                  <p className="text-muted">Feature list not available for this solution.</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="mb-4">Technical Specifications</h3>
                {item.specifications ? (
                  <div className="row">
                    <div className="col-lg-8">
                      <table className="table table-striped">
                        <tbody>
                          {Object.entries(item.specifications).map(([key, value]) => (
                            <tr key={key}>
                              <td className="fw-semibold">{key}</td>
                              <td>{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted">Technical specifications not available for this solution.</p>
                )}
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
                      <p className="text-muted">Review details would be loaded from the database here.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vendor' && (
              <div className="row">
                <div className="col-lg-8">
                  <h3 className="mb-3">About {item.vendor}</h3>
                  <p className="mb-4">
                    Learn more about the vendor and their other solutions in the marketplace.
                  </p>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h5>Company Details</h5>
                      <ul className="list-unstyled">
                        <li><strong>Vendor:</strong> {item.vendor}</li>
                        <li><strong>Type:</strong> {item.type === 'agent' ? 'AI Agent Provider' : 'Application Provider'}</li>
                        <li><strong>Industry Focus:</strong> {verticalInfo[item.vertical]?.name || item.vertical}</li>
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
