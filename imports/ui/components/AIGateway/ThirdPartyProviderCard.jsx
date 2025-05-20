import React from 'react';
import feather from 'feather-icons';

const ThirdPartyProviderCard = ({ provider, onSelect }) => {
  // Initialize feather icons
  React.useEffect(() => {
    feather.replace();
  }, []);

  return (
    <div className="card h-100 template-card">
      <div className="card-body text-center">
        <div className="provider-logo mb-3">
          {provider.logoUrl ? (
            <img src={provider.logoUrl} alt={provider.name} style={{ height: '60px' }} />
          ) : (
            <i data-feather="globe" style={{ width: '60px', height: '60px', strokeWidth: 1 }}></i>
          )}
        </div>
        <h6 className="card-title">{provider.name}</h6>
        <p className="card-text">{provider.description}</p>
      </div>
      <div className="card-footer bg-transparent">
        <button
          className="btn btn-outline-primary w-100"
          onClick={onSelect}
        >
          {provider.isCustom ? 'Configure Custom Provider' : `Configure ${provider.name}`}
        </button>
      </div>
    </div>
  );
};

export default ThirdPartyProviderCard;
