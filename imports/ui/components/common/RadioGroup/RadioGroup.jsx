// RadioGroup.jsx
import React, { createContext, useContext, forwardRef } from 'react';
import './RadioGroup.scss';

const RadioGroupContext = createContext();

export const RadioGroup = ({
  children,
  value,
  defaultValue,
  onChange,
  name,
  disabled = false,
  orientation = 'vertical',
  className = '',
  ...props
}) => {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (newValue) => {
    if (!disabled) {
      setSelectedValue(newValue);
      onChange?.(newValue);
    }
  };

  const contextValue = {
    selectedValue,
    handleChange,
    name: name || `radio-group-${React.useId()}`,
    disabled
  };

  const groupClasses = [
    'radio-group',
    `radio-group--${orientation}`,
    disabled && 'radio-group--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div role="radiogroup" className={groupClasses} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export const RadioGroupItem = forwardRef(({
  value,
  label,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const context = useContext(RadioGroupContext);

  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const { selectedValue, handleChange, name, disabled: groupDisabled } = context;
  const isChecked = selectedValue === value;
  const isDisabled = disabled || groupDisabled;

  const itemClasses = [
    'radio-item',
    isChecked && 'radio-item--checked',
    isDisabled && 'radio-item--disabled',
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!isDisabled && !isChecked) {
      handleChange(value);
    }
  };

  return (
    <label className={itemClasses}>
      <span className="radio-item__input-wrapper">
        <input
          ref={ref}
          type="radio"
          className="radio-item__input"
          name={name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleClick}
          {...props}
        />
        <span className="radio-item__control">
          <span className="radio-item__dot" />
        </span>
      </span>
      {label && <span className="radio-item__label">{label}</span>}
    </label>
  );
});

RadioGroupItem.displayName = 'RadioGroupItem';
