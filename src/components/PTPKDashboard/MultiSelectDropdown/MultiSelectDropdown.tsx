"use client"

import { useState, useEffect, useRef } from "react"
import styles from "./MultiSelectDropdown.module.css"
import React from "react"
import { CheckIcon, ChevronDown, SearchIcon } from "lucide-react"


interface FilterOption {
  id: string
  label: string
  selected: boolean
}

export function MultiSelectDropdown({
  options,
  onChange,
  label,
  colors,
}: {
  options: FilterOption[]
  onChange: (updatedOptions: FilterOption[]) => void
  label: string
  colors?: { [key: string]: string };
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsOpen(false)
          }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
          document.removeEventListener("mousedown", handleClickOutside)
      }
  }, [])

  useEffect(() => {
      if (isOpen && searchInputRef.current) {
          searchInputRef.current.focus()
      }
  }, [isOpen])

  useEffect(() => {
      if (!isOpen) {
          setSearchTerm("")
      }
  }, [isOpen])

  const selectedOptions = options.filter((option) => option.selected)
  const selectedCount = selectedOptions.length

  const toggleOption = (id: string) => {
      const updatedOptions = options.map((option) =>
          option.id === id ? { ...option, selected: !option.selected } : option,
      )
      onChange(updatedOptions)
  }

  const selectAll = () => {
      const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
      const allFilteredSelected = filteredOptions.every((option) => option.selected)

      const updatedOptions = options.map((option) => {
          if (option.label.toLowerCase().includes(searchTerm.toLowerCase())) {
              return { ...option, selected: !allFilteredSelected }
          }
          return option
      })

      onChange(updatedOptions)
  }

  const getButtonLabel = () => {
      if (selectedCount === 0) {
          return label
      }
      if (selectedCount === 1) {
          return selectedOptions[0].label
      }
      return `${selectedOptions[0].label} (+${selectedCount - 1} more)`
  }

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
      <div className={styles.multiSelectContainer} ref={dropdownRef}>
          <button className={`${styles.multiSelectButton} ${isOpen ? styles.dropdownButtonActive : ""}`} onClick={() => setIsOpen(!isOpen)} title={selectedOptions.map(opt => opt.label).join(', ')}>
              <span className={styles.buttonLabelText}>{getButtonLabel()}</span>
              <ChevronDown size={16} className={`${styles.dropdownArrow} ${isOpen ? styles.dropdownArrowOpen : ""}`} />
          </button>

          {isOpen && (
              <div 
                  className={styles.multiSelectDropdown} 
                  style={{ zIndex: 1050 }} 
              >
                  <div className={styles.searchContainer}>
                      <SearchIcon className={styles.multiSelectSearchIcon} size={16} />
                      <input
                          ref={searchInputRef}
                          type="text"
                          className={styles.searchInput}
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                      />
                  </div>

                  <div className={styles.multiSelectHeader}>
                      <button className={styles.selectAllButton} onClick={selectAll} disabled={filteredOptions.length === 0}>
                          {filteredOptions.every((option) => option.selected) ? "Deselect All" : "Select All"}
                      </button>
                  </div>

                  <div className={styles.multiSelectOptions}>
                      {filteredOptions.length > 0 ? (
                          filteredOptions.map((option) => (
                              <div key={option.id} className={styles.multiSelectOption} onClick={() => toggleOption(option.id)}>
                                  <div className={`${styles.checkbox} ${option.selected ? styles.checked : ""}`}>
                                      {option.selected && <CheckIcon size={12} />}
                                  </div>
                                  <span style={{
                                      color: colors && colors[option.id] ? colors[option.id] : 'inherit',
                                      fontWeight: colors && colors[option.id] ? 500 : 'normal',
                                  }}>{option.label}</span>
                              </div>
                          ))
                      ) : (
                          <div className={styles.noResults}>No results found</div>
                      )}
                  </div>
              </div>
          )}
      </div>
  )
}
