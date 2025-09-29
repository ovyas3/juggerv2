"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  minWidth?: number;
}

const dropdownStyles: React.CSSProperties = {
  position: "relative",
  minWidth: 200,
  display: "inline-block",
};

const dropdownButtonStyles: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0.5rem 0.75rem",
  textAlign: "left",
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  outline: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 14,
  cursor: "pointer",
};

const dropdownButtonFocusStyles: React.CSSProperties = {
  boxShadow: "0 0 0 2px #20114d33",
  borderColor: "#20114d",
};

const dropdownListStyles: React.CSSProperties = {
  position: "absolute",
  zIndex: 20,
  width: "100%",
  marginTop: 4,
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  maxHeight: 240,
  overflow: "auto",
};

const dropdownOptionStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  textAlign: "left",
  fontSize: 14,
  background: "none",
  border: "none",
  cursor: "pointer",
};

const dropdownOptionHoverStyles: React.CSSProperties = {
  background: "#f3f4f6",
};

const dropdownBackdropStyles: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10,
};

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select option",
  className = "",
  minWidth = 200,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonFocused, setButtonFocused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={className} style={{ ...dropdownStyles, minWidth }}>
      <button
        type="button"
        style={{
          ...dropdownButtonStyles,
          ...(buttonFocused ? dropdownButtonFocusStyles : {}),
        }}
        onClick={() => setIsOpen(!isOpen)}
        onFocus={() => setButtonFocused(true)}
        onBlur={() => setButtonFocused(false)}
      >
        <span style={{ color: selectedOption ? "#111827" : "#6b7280" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          style={{
            height: 16,
            width: 16,
            color: "#9ca3af",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      {isOpen && (
        <>
          <div
            style={dropdownBackdropStyles}
            onClick={() => setIsOpen(false)}
          />
          <div style={dropdownListStyles}>
            {options.map((option, idx) => (
              <button
                key={option.value}
                type="button"
                style={{
                  ...dropdownOptionStyles,
                  ...(hoveredIndex === idx ? dropdownOptionHoverStyles : {}),
                }}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
