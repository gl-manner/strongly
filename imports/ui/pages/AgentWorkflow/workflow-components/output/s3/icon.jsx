// imports/ui/pages/AgentWorkflow/workflow-components/output/s3/icon.jsx

import React from 'react';

const S3OutputIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Cloud with upload arrow */}
    <path
      d="M20.6633 11.6633C20.1658 9.51891 18.933 7.61736 17.1769 6.28392C15.4208 4.95048 13.249 4.26569 11.0306 4.34455C8.81211 4.42342 6.68913 5.26095 5.01896 6.71462C3.34879 8.16829 2.23426 10.1498 1.86327 12.3265C0.741391 12.5825 -0.246478 13.2163 -0.918665 14.107C-1.59085 14.9977 -1.90344 16.0834 -1.80328 17.1724C-1.70312 18.2615 -1.19652 19.2787 -0.373831 20.0288C0.448855 20.779 1.50294 21.2118 2.60204 21.2551H7.34694"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.6531 21.2551H20.6633C21.8584 21.2551 23.0046 20.7802 23.8523 19.9325C24.7 19.0847 25.1749 17.9385 25.1749 16.7434C25.1749 15.5483 24.7 14.4021 23.8523 13.5544C23.0046 12.7066 21.8584 12.2317 20.6633 12.2317C20.6633 12.1034 20.6633 11.9683 20.6633 11.8332"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Upload arrow */}
    <path
      d="M12 16V8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 10L12 7L15 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default S3OutputIcon;
