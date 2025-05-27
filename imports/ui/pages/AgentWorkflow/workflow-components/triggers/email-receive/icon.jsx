import React from 'react';

const EmailReceiveIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M22 6L12 13L2 6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="18" cy="18" r="3" fill={color}/>
    <path d="M18 16V20M16 18H20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default EmailReceiveIcon;
