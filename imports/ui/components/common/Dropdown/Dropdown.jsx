// /imports/ui/components/common/Dropdown/Dropdown.jsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Dropdown.scss';

export const Dropdown = ({ open, toggle, trigger, items }) => {
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (open) {
          toggle();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, toggle]);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={toggle}>
        {trigger}
      </div>
      {open && (
        <div className="dropdown-menu dropdown-menu-end show">
          {/* Only render header if there's a header item */}
          {(items.some(item => item.header) || items.some(item => item.clearAll)) && (
            <div className="dropdown-header d-flex align-items-center justify-content-between">
              <p className="mb-0 font-weight-medium">
                {items.find(item => item.header)?.header || ''}
              </p>
              {items.find(item => item.clearAll) && (
                <a href="#" className="text-muted" onClick={(e) => {
                  e.preventDefault();
                  const clearAllItem = items.find(item => item.clearAll);
                  if (clearAllItem.onClick) {
                    clearAllItem.onClick();
                  }
                }}>Clear all</a>
              )}
            </div>
          )}

          {/* Simple list for user profile dropdown with no sections */}
          {!items.some(item => item.subtitle) && !items.some(item => item.header) && (
            <ul className="py-2 px-0 m-0 list-unstyled">
              {items.map((item, index) => {
                // Render divider
                if (item.type === 'divider') {
                  return <div key={index} className="dropdown-divider my-2"></div>;
                }

                // Render item with link
                if (item.to) {
                  return (
                    <li key={index}>
                      <Link
                        to={item.to}
                        className="dropdown-item d-flex align-items-center py-2 px-3"
                        onClick={toggle}
                      >
                        {item.icon && <i data-feather={item.icon} className="me-2 icon-md text-muted"></i>}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                }

                // Render item with click handler
                return (
                  <li key={index}>
                    <a
                      href="#"
                      className="dropdown-item d-flex align-items-center py-2 px-3"
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.onClick) {
                          item.onClick();
                        }
                        toggle();
                      }}
                    >
                      {item.icon && <i data-feather={item.icon} className="me-2 icon-md text-muted"></i>}
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Complex notifications style dropdown with sections */}
          {(items.some(item => item.subtitle) || items.some(item => item.header)) && (
            <>
              <div className="dropdown-body">
                {items.map((item, index) => {
                  // Skip header and clearAll items as they're handled separately
                  if (item.header || item.clearAll || item.footerLabel) {
                    return null;
                  }

                  // Render divider
                  if (item.type === 'divider') {
                    return <div key={index} className="dropdown-divider"></div>;
                  }

                  // Render notification-style item with icon and subtitle
                  if (item.subtitle) {
                    return (
                      <a
                        href="#"
                        className="dropdown-item"
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          if (item.onClick) {
                            item.onClick();
                          }
                          toggle();
                        }}
                      >
                        {item.icon && (
                          <div className="icon">
                            <i data-feather={item.icon}></i>
                          </div>
                        )}
                        <div className="content">
                          <p>{item.label}</p>
                          <p className="sub-text text-muted">{item.subtitle}</p>
                        </div>
                      </a>
                    );
                  }

                  return null;
                })}
              </div>

              {items.some(item => item.footerLabel) && (
                <div className="dropdown-footer d-flex align-items-center justify-content-center">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const footerItem = items.find(item => item.footerLabel);
                      if (footerItem && footerItem.onClick) {
                        footerItem.onClick();
                      }
                      toggle();
                    }}
                  >
                    {items.find(item => item.footerLabel)?.footerLabel}
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
