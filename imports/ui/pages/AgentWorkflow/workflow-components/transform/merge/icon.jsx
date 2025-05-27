// imports/ui/pages/AgentWorkflow/workflow-components/transform/merge/icon.jsx

import React from 'react';

const MergeIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 4L18 13C18 14.1046 17.1046 15 16 15L8 15C6.89543 15 6 15.8954 6 17L6 20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6 4L6 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="6"
      cy="4"
      r="2"
      stroke={color}
      strokeWidth="2"
    />
    <circle
      cx="18"
      cy="4"
      r="2"
      stroke={color}
      strokeWidth="2"
    />
    <circle
      cx="6"
      cy="20"
      r="2"
      stroke={color}
      strokeWidth="2"
    />
  </svg>
);

export default MergeIcon;
