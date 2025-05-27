// imports/ui/components/common/Tabs/Tabs.jsx

import React, { useState, createContext, useContext } from 'react';
import './Tabs.scss';

// Context for sharing state between Tabs components
const TabsContext = createContext();

export const Tabs = ({ defaultValue, value, onValueChange, className = '', children }) => {
  const [selectedTab, setSelectedTab] = useState(value || defaultValue || '');

  const contextValue = {
    selectedTab: value !== undefined ? value : selectedTab,
    setSelectedTab: (newValue) => {
      if (value === undefined) {
        setSelectedTab(newValue);
      }
      onValueChange?.(newValue);
    }
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={`tabs ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className = '', children }) => {
  return (
    <div className={`tabs-list ${className}`} role="tablist">
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, disabled = false, className = '', children }) => {
  const { selectedTab, setSelectedTab } = useContext(TabsContext);
  const isActive = selectedTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={`tabs-trigger ${isActive ? 'tabs-trigger-active' : ''} ${disabled ? 'tabs-trigger-disabled' : ''} ${className}`}
      onClick={() => !disabled && setSelectedTab(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, className = '', children }) => {
  const { selectedTab } = useContext(TabsContext);

  if (selectedTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={`tabs-content ${className}`}
      data-state={selectedTab === value ? 'active' : 'inactive'}
    >
      {children}
    </div>
  );
};
