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
  }, [faqs, faqsLoading]);

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
    }, 300);

    setSearchTimer(timer);
  };

  // Toggle FAQ answer visibility
  const toggleFaq = (id) => {
    const faqItem = document.getElementById(`faqItem-${id}`);
    if (faqItem) {
      // Close any other open items in the same category
      const category = faqItem.closest('.faq-category');
      if (category) {
        const openItems = category.querySelectorAll('.faq-item.open');
        openItems.forEach(item => {
          if (item.id !== `faqItem-${id}`) {
            item.classList.remove('open');
          }
        });
      }

      // Toggle the clicked item
      faqItem.classList.toggle('open');

      // Refresh feather icons
      feather.replace();
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
    <div className="page-content">
      <Breadcrumb items={breadcrumbItems} />

      <div className="faq-wrapper">
        <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
          <div>
            <h4 className="mb-3 mb-md-0">Frequently Asked Questions</h4>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <div className="faq-search mb-4">
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
                        onClick={() => {
                          setSearchQuery('');
                          if (searchInputRef.current) {
                            searchInputRef.current.value = '';
                          }
                        }}
                      >
                        <i data-feather="x"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Show message when no results found */}
                {faqs.length === 0 && (
                  <div className="text-center py-5">
                    <i data-feather="info" className="mb-3" style={{ width: '48px', height: '48px', color: '#c0c0c0' }}></i>
                    <h5>No FAQs Found</h5>
                    <p className="text-muted">
                      {searchQuery
                        ? `No results found for "${searchQuery}". Try a different search term.`
                        : "There are no FAQs available at the moment."}
                    </p>
                    {searchQuery && (
                      <button
                        className="btn btn-outline-primary mt-2"
                        onClick={() => {
                          setSearchQuery('');
                          if (searchInputRef.current) {
                            searchInputRef.current.value = '';
                          }
                        }}
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}

                {/* FAQ categories and items */}
                {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                  <div key={category} className="faq-category mb-4">
                    <h5 className="faq-category-title mb-3">
                      {category}
                      <span className="badge bg-primary ms-2">{categoryFaqs.length}</span>
                    </h5>
                    <div className="accordion faq-accordion">
                      {categoryFaqs.map(faq => (
                        <div key={faq._id} id={`faqItem-${faq._id}`} className="accordion-item faq-item">
                          <div
                            className="accordion-header faq-header"
                            onClick={() => toggleFaq(faq._id)}
                          >
                            <h6 className="accordion-title faq-question mb-0">
                              {faq.question}
                            </h6>
                            <div className="faq-icon">
                              <i data-feather="chevron-down"></i>
                            </div>
                          </div>
                          <div className="accordion-body faq-answer">
                            <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Still Have Questions?</h6>
                <p className="mb-4">If you couldn't find the answer to your question, please contact our support team.</p>
                <div className="text-center">
                  <button
                    className="btn btn-primary me-2"
                    onClick={handleContactSupport}
                  >
                    <i data-feather="mail" className="me-2"></i>
                    Contact Support
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleLiveChat}
                  >
                    <i data-feather="message-square" className="me-2"></i>
                    Live Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
