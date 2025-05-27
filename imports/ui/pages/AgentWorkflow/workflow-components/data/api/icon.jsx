// imports/ui/pages/AgentWorkflow/workflow-components/data/api/icon.jsx

import React from 'react';

const ApiIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 7L4 17M20 7L20 17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 12L15 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 12L5 10M7 12L5 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 12L19 10M17 12L19 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ApiIcon;
