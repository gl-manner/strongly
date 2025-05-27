import React from 'react';

const WebhookIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 6H7C5.89543 6 5 6.89543 5 8V17C5 18.1046 5.89543 19 7 19H16C17.1046 19 18 18.1046 18 17V14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M17 10C18.6569 10 20 8.65685 20 7C20 5.34315 18.6569 4 17 4C15.3431 4 14 5.34315 14 7C14 8.65685 15.3431 10 17 10Z"
      stroke={color}
      strokeWidth="2"
    />
    <path
      d="M11 12L14 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default WebhookIcon;
