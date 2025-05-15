// /imports/ui/components/common/Breadcrumb/Breadcrumb.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Breadcrumb.scss';

/**
 * Reusable breadcrumb component
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of breadcrumb items
 */
const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="page-breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${item.active ? 'active' : ''}`}
            {...(item.active ? { 'aria-current': 'page' } : {})}
          >
            {item.active ? (
              item.label
            ) : (
              <Link to={item.link}>{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      link: PropTypes.string,
      active: PropTypes.bool
    })
  ).isRequired
};

export default Breadcrumb;
