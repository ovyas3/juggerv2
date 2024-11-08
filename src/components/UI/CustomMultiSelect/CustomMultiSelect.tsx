'use client'

import React, { useState, useRef, useEffect } from 'react';
import './CustomMultiSelect.css';

interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}

const CustomMultiSelect: React.FC<MultiSelectProps> = ({ value, onValueChange, placeholder, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectItem = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onValueChange(value.filter((v) => v !== selectedValue));
    } else {
      onValueChange([...value, selectedValue]);
    }
  };

  return (
    <div className="select-container" ref={selectRef}>
      <div className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="selected-values">
          {value.length > 0
            ? value.map(v => options.find(option => option.value === v)?.label).join(', ')
            : placeholder}
        </span>
        <svg className={`arrow ${isOpen ? 'open' : ''}`} width="24" height="24">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {isOpen && (
        <div className="select-content">
          {options.map((option) => (
            <div
              key={option.value}
              className={`select-item ${value.includes(option.value) ? 'selected' : ''}`}
              onClick={() => handleSelectItem(option.value)}
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => handleSelectItem(option.value)}
              />
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomMultiSelect;
