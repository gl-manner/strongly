// /imports/ui/pages/admin/FaqAdmin/FaqAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaqCollection } from '/imports/api/faq/collection';
import Breadcrumb from '/imports/ui/components/common/Breadcrumb/Breadcrumb';
import './FaqAdmin.scss';

/**
 * FAQ Admin panel component for managing FAQs
 */
const FaqAdmin = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    isPublished: true,
    order: 0
  });

  // Load FAQ data from collection
  const { faqs, faqsLoading, categories } = useTracker(() => {
    const subscription = Meteor.subscribe('faq.all');

    // Get all FAQs from collection
    let query = {};
    if (selectedCategory !== 'all') {
      query.category = selectedCategory;
    }

    const faqsData = FaqCollection.find(query, { sort: { category: 1, order: 1 } }).fetch();

    // Extract unique categories
    const allFaqs = FaqCollection.find({}, { fields: { category: 1 } }).fetch();
    const uniqueCategories = [...new Set(allFaqs.map(faq => faq.category || 'General'))];

    return {
      faqs: faqsData,
      faqsLoading: !subscription.ready(),
      categories: uniqueCategories
    };
  }, [selectedCategory]);

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((groups, faq) => {
    const category = faq.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(faq);
    return groups;
  }, {});

  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, [faqs, faqsLoading, showForm]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingFaq) {
      // Update existing FAQ
      Meteor.call('faq.update', editingFaq._id, formData, (error) => {
        if (error) {
          toast.error(`Error updating FAQ: ${error.reason}`);
        } else {
          toast.success('FAQ updated successfully');
          resetForm();
        }
      });
    } else {
      // Create new FAQ
      Meteor.call('faq.create', formData, (error) => {
        if (error) {
          toast.error(`Error creating FAQ: ${error.reason}`);
        } else {
          toast.success('FAQ created successfully');
          resetForm();
        }
      });
    }
  };

  // Reset form and hide it
  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      isPublished: true,
      order: 0
    });
    setEditingFaq(null);
    setShowForm(false);
  };

  // Edit an existing FAQ
  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      isPublished: faq.isPublished !== false,
      order: faq.order || 0
    });
    setShowForm(true);

    // Scroll to form
    setTimeout(() => {
      document.getElementById('faqForm').scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Delete an FAQ
  const handleDelete = (faqId) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      Meteor.call('faq.delete', faqId, (error) => {
        if (error) {
          toast.error(`Error deleting FAQ: ${error.reason}`);
        } else {
          toast.success('FAQ deleted successfully');
        }
      });
    }
  };

  // Toggle FAQ published status
  const togglePublished = (faq) => {
    Meteor.call('faq.update', faq._id, { isPublished: !faq.isPublished }, (error) => {
      if (error) {
        toast.error(`Error updating FAQ: ${error.reason}`);
      } else {
        toast.success(`FAQ ${faq.isPublished ? 'unpublished' : 'published'} successfully`);
      }
    });
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Drop outside the list or no movement
    if (!destination ||
        (destination.droppableId === source.droppableId &&
         destination.index === source.index)) {
      return;
    }

    // Get the category
    const category = source.droppableId;
    const items = [...groupedFaqs[category]];

    // Reorder the items
    const [removed] = items.splice(source.index, 1);
    items.splice(destination.index, 0, removed);

    // Create the updated order data
    const orderedItems = items.map((item, index) => ({
      id: item._id,
      order: index
    }));

    // Update the order in the database
    Meteor.call('faq.reorder', orderedItems, (error) => {
      if (error) {
        toast.error(`Error reordering FAQs: ${error.reason}`);
      }
    });
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Admin', link: '/admin' },
    { label: 'FAQ Management', active: true }
  ];

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

      <div className="faq-admin-wrapper">
        <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
          <div>
            <h4 className="mb-3 mb-md-0">FAQ Management</h4>
          </div>
          <div className="d-flex align-items-center flex-wrap text-nowrap">
            <button
              className="btn btn-primary btn-icon-text mb-2 mb-md-0"
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
            >
              <i data-feather={showForm ? "x" : "plus"} className="btn-icon-prepend"></i>
              {showForm ? 'Cancel' : 'Add New FAQ'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="row mb-4" id="faqForm">
            <div className="col-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</h6>
                  <form className="forms-sample" onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                      <label htmlFor="question">Question</label>
                      <input
                        type="text"
                        className="form-control"
                        id="question"
                        name="question"
                        placeholder="Enter FAQ question"
                        value={formData.question}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group mb-3">
                      <label htmlFor="answer">Answer</label>
                      <textarea
                        className="form-control"
                        id="answer"
                        name="answer"
                        rows="6"
                        placeholder="Enter FAQ answer (HTML allowed)"
                        value={formData.answer}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                      <small className="form-text text-muted">
                        You can use HTML tags for formatting: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;
                      </small>
                    </div>
                    <div className="form-group mb-3">
                      <label htmlFor="category">Category</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="category"
                          name="category"
                          placeholder="Enter category or select existing"
                          value={formData.category}
                          onChange={handleInputChange}
                          list="categories"
                        />
                        <datalist id="categories">
                          {categories.map((category, index) => (
                            <option key={index} value={category} />
                          ))}
                        </datalist>
                        <button
                          className="btn btn-outline-secondary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          Select
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          {categories.map((category, index) => (
                            <li key={index}>
                              <a
                                className="dropdown-item"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFormData({...formData, category});
                                }}
                              >
                                {category}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isPublished"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="isPublished">
                        Published
                      </label>
                    </div>
                    <button type="submit" className="btn btn-primary me-2">
                      {editingFaq ? 'Update FAQ' : 'Create FAQ'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title mb-3">FAQ List</h6>

                <div className="mb-4">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setSelectedCategory('all')}
                    >
                      All Categories
                    </button>
                    {categories.map((category, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {Object.keys(groupedFaqs).length === 0 ? (
                  <div className="text-center py-5">
                    <i data-feather="info" className="mb-3" style={{ width: '48px', height: '48px', color: '#c0c0c0' }}></i>
                    <h5>No FAQs Found</h5>
                    <p className="text-muted">
                      {selectedCategory !== 'all'
                        ? `No FAQs in the "${selectedCategory}" category.`
                        : "There are no FAQs available yet."}
                    </p>
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => {
                        resetForm();
                        setShowForm(true);
                      }}
                    >
                      Create Your First FAQ
                    </button>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                      <div key={category} className="faq-category mb-4">
                        <h5 className="faq-category-title mb-3">
                          {category}
                          <span className="badge bg-primary ms-2">{categoryFaqs.length}</span>
                        </h5>
                        <Droppable droppableId={category}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="faq-list"
                            >
                              {categoryFaqs.map((faq, index) => (
                                <Draggable
                                  key={faq._id}
                                  draggableId={faq._id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`faq-item-admin ${!faq.isPublished ? 'unpublished' : ''}`}
                                    >
                                      <div className="faq-item-content">
                                        <div {...provided.dragHandleProps} className="drag-handle">
                                          <i data-feather="menu"></i>
                                        </div>
                                        <div className="faq-item-details">
                                          <h6 className="faq-item-question">{faq.question}</h6>
                                          <div className="faq-item-meta">
                                            <span className="badge bg-light text-dark me-2">
                                              {faq.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                            <small className="text-muted">
                                              Last updated: {new Date(faq.updatedAt || faq.createdAt).toLocaleDateString()}
                                            </small>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="faq-item-actions">
                                        <button
                                          className="btn btn-sm btn-icon btn-light"
                                          title={faq.isPublished ? "Unpublish" : "Publish"}
                                          onClick={() => togglePublished(faq)}
                                        >
                                          <i data-feather={faq.isPublished ? "eye-off" : "eye"}></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-icon btn-primary"
                                          title="Edit"
                                          onClick={() => handleEdit(faq)}
                                        >
                                          <i data-feather="edit-2"></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-icon btn-danger"
                                          title="Delete"
                                          onClick={() => handleDelete(faq._id)}
                                        >
                                          <i data-feather="trash-2"></i>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    ))}
                  </DragDropContext>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">View FAQ Page</h6>
                <p>Preview how your FAQ page appears to users.</p>
                <div className="text-center">
                  <Link to="/faq" className="btn btn-outline-primary" target="_blank">
                    <i data-feather="external-link" className="me-2"></i>
                    Open FAQ Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqAdmin;
