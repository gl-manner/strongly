// Select.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './Select.scss';

export const Select = ({ children, value, onValueChange, placeholder = 'Select an option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  const childrenArray = React.Children.toArray(children);
  const selectedItem = childrenArray.find(child => child.props.value === selectedValue);

  return (
    <div ref={selectRef} className="select">
      <SelectContext.Provider value={{ selectedValue, handleSelect, isOpen }}>
        {childrenArray}
      </SelectContext.Provider>
    </div>
  );
};

export const SelectTrigger = ({ children, className = '' }) => {
  const { selectedValue, isOpen } = React.useContext(SelectContext);
  const selectRef = React.useContext(SelectRefContext);

  return (
    <button
      type="button"
      className={`select-trigger ${className}`}
      onClick={() => selectRef.current?.toggleOpen()}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      {children}
      <ChevronDown className={`select-icon ${isOpen ? 'select-icon--open' : ''}`} size={16} />
    </button>
  );
};

export const SelectValue = ({ placeholder }) => {
  const { selectedValue } = React.useContext(SelectContext);
  const items = React.useContext(SelectItemsContext);
  const selectedItem = items?.find(item => item.value === selectedValue);

  return (
    <span className="select-value">
      {selectedItem?.label || placeholder}
    </span>
  );
};

export const SelectContent = ({ children, className = '' }) => {
  const { isOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  const items = React.Children.toArray(children).map(child => ({
    value: child.props.value,
    label: child.props.children,
    disabled: child.props.disabled
  }));

  return (
    <SelectItemsContext.Provider value={items}>
      <div className={`select-content ${className}`} role="listbox">
        {children}
      </div>
    </SelectItemsContext.Provider>
  );
};

export const SelectItem = ({ value, children, disabled = false, className = '' }) => {
  const { selectedValue, handleSelect } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      disabled={disabled}
      className={`select-item ${isSelected ? 'select-item--selected' : ''} ${disabled ? 'select-item--disabled' : ''} ${className}`}
      onClick={() => !disabled && handleSelect(value)}
    >
      <span className="select-item__text">{children}</span>
      {isSelected && <Check className="select-item__check" size={16} />}
    </button>
  );
};

// Context
const SelectContext = React.createContext();
const SelectItemsContext = React.createContext();
const SelectRefContext = React.createContext();

// Enhanced Select component with proper context
export const EnhancedSelect = ({ children, value, onValueChange, placeholder = 'Select an option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  const contextValue = {
    selectedValue,
    handleSelect,
    isOpen,
    toggleOpen
  };

  return (
    <div ref={selectRef} className="select">
      <SelectContext.Provider value={contextValue}>
        <SelectRefContext.Provider value={{ current: { toggleOpen } }}>
          {React.Children.map(children, child => {
            if (child.type === SelectTrigger) {
              return React.cloneElement(child, {
                onClick: toggleOpen
              });
            }
            return child;
          })}
        </SelectRefContext.Provider>
      </SelectContext.Provider>
    </div>
  );
};
