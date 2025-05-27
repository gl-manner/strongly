// /imports/ui/pages/faq/FaqPage/FaqPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import { FaqCollection } from '/imports/api/faq/collection';
import Breadcrumb from '/imports/ui/components/common/Breadcrumb/Breadcrumb';
import './FaqPage.scss';

/**
 * FAQ page component using NobleUI styling with real-time data from Meteor
 */
export const FaqPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimer, setSearchTimer] = useState(null);
  const [openItems, setOpenItems] = useState(new Set());
  const searchInputRef = useRef(null);

  // Load FAQ data from collection with search capability
  const { faqs, faqsLoading, categories } = useTracker(() => {
    let subscription;

    // If searching, use the search publication
    if (searchQuery && searchQuery.trim().length >= 2) {
      subscription = Meteor.subscribe('faq.search', searchQuery);
    } else {
      // Otherwise load all published FAQs
      subscription = Meteor.subscribe('faq.published');
    }

    // Get FAQs from collection
    const faqsData = FaqCollection.find({}, { sort: { category: 1, order: 1 } }).fetch();

    // Extract unique categories
    const uniqueCategories = [...new Set(faqsData.map(faq => faq.category || 'General'))];

    return {
      faqs: faqsData,
      faqsLoading: !subscription.ready(),
      categories: uniqueCategories
    };
  }, [searchQuery]);

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((groups, faq) => {
    const category = faq.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(faq);
    return groups;
  }, {});

  // Initialize feather icons when component mounts or updates
  useEffect(() => {
    feather.replace();
  }, [faqs, faqsLoading, openItems]);

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;

    // Clear any existing timer
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    // Set a new timer (300ms debounce)
    const timer = setTimeout(() => {
      setSearchQuery(query);
      // Clear open items when searching
      setOpenItems(new Set());
    }, 300);

    setSearchTimer(timer);
  };

  // Toggle FAQ answer visibility
  const toggleFaq = (id) => {
    setOpenItems(prev => {
      const newOpenItems = new Set(prev);
      if (newOpenItems.has(id)) {
        newOpenItems.delete(id);
      } else {
        newOpenItems.add(id);
      }
      return newOpenItems;
    });
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setOpenItems(new Set());
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  // Breadcrumb items - updated to match the correct path structure
  const breadcrumbItems = [
    { label: 'Main', link: '/' },
    { label: 'Support', link: '/support' },
    { label: 'FAQ', active: true }
  ];

  // Contact support
  const handleContactSupport = () => {
    // Implement contact support functionality
    window.location.href = 'mailto:support@example.com';
  };

  // Start live chat
  const handleLiveChat = () => {
    // Implement live chat functionality
    console.log('Starting live chat...');
    // You would typically open a chat widget or redirect to chat page
  };

  // Loading state
  if (faqsLoading) {
    return (
      <div className="page-content">
        <Breadcrumb items={breadcrumbItems} />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faq-page-container">
      <div className="container-fluid px-4">
        <Breadcrumb items={breadcrumbItems} />

        <div className="faq-wrapper">
        {/* Page Header */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="text-center mb-3">
              <h2 className="mb-2">Frequently Asked Questions</h2>
              <p className="text-muted fs-5">
                Find answers to the most commonly asked questions about our platform
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="faq-search">
              <div className="input-group">
                <span className="input-group-text bg-transparent">
                  <i data-feather="search"></i>
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="form-control"
                  placeholder="Search FAQs..."
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={clearSearch}
                  >
                    <i data-feather="x"></i>
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="search-info mt-2 text-center">
                  <small className="text-muted">
                    {faqs.length > 0
                      ? `Found ${faqs.length} result${faqs.length !== 1 ? 's' : ''} for "${searchQuery}"`
                      : `No results found for "${searchQuery}"`
                    }
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                {/* Show message when no results found */}
                {faqs.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i
                        data-feather="help-circle"
                        className="text-muted"
                        style={{ width: '64px', height: '64px' }}
                      ></i>
                    </div>
                    <h4 className="mb-3">No FAQs Found</h4>
                    <p className="text-muted mb-4">
                      {searchQuery
                        ? `No results found for "${searchQuery}". Try a different search term or browse all FAQs.`
                        : "There are no FAQs available at the moment. Please check back later."}
                    </p>
                    {searchQuery && (
                      <button
                        className="btn btn-primary"
                        onClick={clearSearch}
                      >
                        <i data-feather="refresh-cw" className="me-2"></i>
                        Show All FAQs
                      </button>
                    )}
                  </div>
                ) : (
                  /* FAQ categories and items */
                  Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                    <div key={category} className="faq-category mb-5">
                      <div className="faq-category-header mb-4">
                        <h3 className="faq-category-title d-flex align-items-center">
                          <i data-feather="folder" className="me-2 text-primary"></i>
                          {category}
                          <span className="badge bg-primary ms-2">{categoryFaqs.length}</span>
                        </h3>
                      </div>

                      <div className="faq-accordion">
                        {categoryFaqs.map((faq, index) => (
                          <div
                            key={faq._id}
                            className={`faq-item ${openItems.has(faq._id) ? 'open' : ''}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div
                              className="faq-header"
                              onClick={() => toggleFaq(faq._id)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleFaq(faq._id);
                                }
                              }}
                            >
                              <div className="faq-question-wrapper">
                                <div className="faq-number">
                                  {String(index + 1).padStart(2, '0')}
                                </div>
                                <h5 className="faq-question mb-0">
                                  {faq.question}
                                </h5>
                              </div>
                              <div className="faq-icon">
                                <i data-feather={openItems.has(faq._id) ? "minus" : "plus"}></i>
                              </div>
                            </div>

                            <div className="faq-answer">
                              <div className="faq-answer-content">
                                <div
                                  className="faq-answer-text"
                                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                                />
                                {faq.tags && faq.tags.length > 0 && (
                                  <div className="faq-tags mt-3">
                                    {faq.tags.map(tag => (
                                      <span key={tag} className="badge bg-light text-dark me-1 mb-1">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i
                    data-feather="headphones"
                    className="text-primary"
                    style={{ width: '48px', height: '48px' }}
                  ></i>
                </div>
                <h4 className="mb-3">Still Have Questions?</h4>
                <p className="text-muted mb-4 fs-5">
                  Can't find what you're looking for? Our support team is here to help you.
                </p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <button
                    className="btn btn-primary btn-lg px-4"
                    onClick={handleContactSupport}
                  >
                    <i data-feather="mail" className="me-2"></i>
                    Contact Support
                  </button>
                  <button
                    className="btn btn-outline-primary btn-lg px-4"
                    onClick={handleLiveChat}
                  >
                    <i data-feather="message-circle" className="me-2"></i>
                    Live Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
              </div>
      </div>
    </div>
  );
};
