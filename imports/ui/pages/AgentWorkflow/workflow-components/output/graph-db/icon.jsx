// imports/ui/pages/AgentWorkflow/workflow-components/output/graph-db/icon.jsx

import React from 'react';

const GraphDBIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Graph network structure */}
    {/* Center node */}
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />

    {/* Connected nodes */}
    <circle cx="5" cy="5" r="2" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="19" cy="5" r="2" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="5" cy="19" r="2" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="19" cy="19" r="2" stroke={color} strokeWidth="2" fill="none" />

    {/* Connections */}
    <path d="M10 10L7 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M14 10L17 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M10 14L7 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M14 14L17 17" stroke={color} strokeWidth="2" strokeLinecap="round" />

    {/* Additional connections between outer nodes */}
    <path d="M7 5L17 5" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M5 7L5 17" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M19 7L19 17" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M7 19L17 19" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
  </svg>
);

export default GraphDBIcon;
