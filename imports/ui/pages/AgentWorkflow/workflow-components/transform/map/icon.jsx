// imports/ui/pages/AgentWorkflow/workflow-components/transform/map/icon.jsx

import React from 'react';

const MapIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 2L3 7V17L9 22L15 17L21 22V12L15 7L9 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 2V22"
      stroke={color}
      strokeWidth="2"
    />
    <path
      d="M15 7V17"
      stroke={color}
      strokeWidth="2"
    />
  </svg>
);

export default MapIcon;
