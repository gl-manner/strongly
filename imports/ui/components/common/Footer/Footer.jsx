// /imports/ui/components/common/Footer/Footer.jsx
import React from 'react';
import './Footer.scss';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer d-flex flex-row align-items-center justify-content-between px-4 py-3 border-top small">
      <p className="text-secondary mb-1 mb-md-0">
        Copyright © {currentYear} <a href="https://strongly.ai" target="_blank" rel="noopener noreferrer">StronglyAI, Inc.</a>.
      </p>
    </footer>
  );
};

export default Footer;
