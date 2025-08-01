"use client"

import { useState } from "react"
import { CalendarDaysIcon, RotateCcwIcon, ChevronDown, FilterIcon } from "lucide-react"
import dayjs from "dayjs"
import { Box } from "@mui/material"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import styles from "./FilterBar.module.css"

interface FilterBarProps {
  onFilterClick: () => void
  onApplyFilters: (appliedFilters: any) => void
  hasActiveFilters: boolean
}

const FilterBar = ({ onFilterClick, onApplyFilters, hasActiveFilters }: FilterBarProps) => {
  const [localPeriod, setLocalPeriod] = useState("MTD")
  // const [localMode, setLocalMode] = useState("All Modes");
  // const [localRegion, setLocalRegion] = useState("All Regions");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  // const [showModeDropdown, setShowModeDropdown] = useState(false);
  // const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const [customStartDate, setCustomStartDate] = useState(dayjs().startOf("month"))
  const [customEndDate, setCustomEndDate] = useState(dayjs())

  const periodOptions = [
    { value: "MTD", label: "MTD (Month To Date)" },
    { value: "FYTD", label: "FYTD (Financial Year To Date)" },
    { value: "WTD", label: "WTD (Week To Date)" },
    { value: "Custom", label: "Custom (Select Date Range)" },
  ]
  // const modeOptions = ["All Modes", "Rail", "Road"];
  // const regionOptions = ["All Regions", "North", "South", "East", "West"];

  const formatDateRangeDisplay = () => {
    if (localPeriod === "Custom" || !customStartDate || !customEndDate) return null
    return `${customStartDate.format("MMM DD, YYYY")} - ${customEndDate.format("MMM DD, YYYY")}`
  }

  const handleResetAllFilters = () => {
    setLocalPeriod("Custom")
    const initialStart = dayjs().startOf("month")
    const initialEnd = dayjs()
    setCustomStartDate(initialStart)
    setCustomEndDate(initialEnd)
    setShowPeriodDropdown(false)

    onApplyFilters({
      period: "Custom",
      startDate: initialStart.toISOString(),
      endDate: initialEnd.toISOString(),
    })
  }

  const handlePeriodChange = (newPeriod: string) => {
    setLocalPeriod(newPeriod)
    setShowPeriodDropdown(false)

    const today = dayjs()
    let startDate = customStartDate
    let endDate = customEndDate

    if (newPeriod === "MTD") {
      startDate = today.startOf("month")
      endDate = today
    } else if (newPeriod === "FYTD") {
      const fyStart = today.month() < 3 ? today.year() - 1 : today.year()
      startDate = dayjs(new Date(fyStart, 3, 1))
      endDate = today
    } else if (newPeriod === "WTD") {
      startDate = today.startOf("week")
      endDate = today
    }

    setCustomStartDate(startDate)
    setCustomEndDate(endDate)

    onApplyFilters({
      period: newPeriod,
      // mode: localMode,
      // region: localRegion,
      startDate,
      endDate,
    })
  }

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.leftFilters}>
        {localPeriod !== "Custom" && formatDateRangeDisplay() && (
          <div className={styles.dateRangeDisplayPill}>
            <CalendarDaysIcon size={16} className={styles.datePillIcon} />
            <span>{formatDateRangeDisplay()}</span>
          </div>
        )}

        {localPeriod === "Custom" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 4 }}>
              <DatePicker
                label="From"
                value={customStartDate}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: "140px",
                      "& .MuiInputBase-root": {
                        borderRadius: "10px",
                        bgcolor: "rgba(249, 250, 251, 0.8)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(209, 213, 219, 0.5)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          borderColor: "rgba(59, 130, 246, 0.7)",
                          boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                        },
                        "&.Mui-focused": {
                          borderColor: "#2563eb",
                          boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.15)",
                        },
                      },
                      "& .MuiInputBase-input": {
                        py: 1.5,
                        fontSize: "0.9rem",
                        color: "#111827",
                      },
                      "& .MuiInputLabel-root": {
                        transform: "translate(14px, 12px) scale(1)",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        color: "#6b7280",
                        "&.Mui-focused, &.MuiFormLabel-filled": {
                          transform: "translate(14px, -9px) scale(0.85)",
                          bgcolor: "rgba(255, 255, 255, 0.8)",
                          px: 0.5,
                          color: "#2563eb",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                  },
                }}
                onChange={(date) => {
                  const safeDate = date ?? dayjs()
                  setCustomStartDate(safeDate)
                  onApplyFilters({
                    period: localPeriod,
                    startDate: safeDate.toISOString(),
                    endDate: customEndDate.toISOString(),
                  })
                }}
              />
              <DatePicker
                label="To"
                value={customEndDate}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: "140px",
                      "& .MuiInputBase-root": {
                        borderRadius: "10px",
                        bgcolor: "rgba(249, 250, 251, 0.8)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(209, 213, 219, 0.5)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          borderColor: "rgba(59, 130, 246, 0.7)",
                          boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                        },
                        "&.Mui-focused": {
                          borderColor: "#2563eb",
                          boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.15)",
                        },
                      },
                      "& .MuiInputBase-input": {
                        py: 1.5,
                        fontSize: "0.9rem",
                        color: "#111827",
                      },
                      "& .MuiInputLabel-root": {
                        transform: "translate(14px, 12px) scale(1)",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        color: "#6b7280",
                        "&.Mui-focused, &.MuiFormLabel-filled": {
                          transform: "translate(14px, -9px) scale(0.85)",
                          bgcolor: "rgba(255, 255, 255, 0.8)",
                          px: 0.5,
                          color: "#2563eb",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                  },
                }}
                onChange={(date) => {
                  const safeDate = date ?? dayjs()
                  setCustomEndDate(safeDate)
                  onApplyFilters({
                    period: localPeriod,
                    startDate: customStartDate.toISOString(),
                    endDate: safeDate.toISOString(),
                  })
                }}
              />
            </Box>
          </LocalizationProvider>
        )}
      </div>

      <div className={styles.dropdownsContainer}>
        <div className={styles.dropdownWrapper}>
          <button className={styles.dropdownButton} onClick={() => setShowPeriodDropdown((prev) => !prev)}>
            <span>{periodOptions.find((opt) => opt.value === localPeriod)?.label || localPeriod}</span>
            <ChevronDown size={16} />
          </button>
          {showPeriodDropdown && (
            <div className={styles.dropdownMenu}>
              {periodOptions.map((option) => (
                <div
                  key={option.value}
                  className={styles.dropdownMenuItem}
                  onClick={() => handlePeriodChange(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/*     

        <div className={styles.dropdownWrapper}>
          <button 
            className={styles.dropdownButton}
            onClick={() => setShowModeDropdown((prev) => !prev)}
          >
            <span>{localMode}</span>
            <ChevronDown size={16} />
          </button>
          {showModeDropdown && (
          <div className={styles.dropdownMenu}>
            {modeOptions.map(option => (
              <div
                key={option}
                className={styles.dropdownMenuItem}
                onClick={() => {
                  setLocalMode(option);
                  setShowModeDropdown(false);
                  onApplyFilters({
                    period: localPeriod,
                    mode: option,
                    region: localRegion,
                    startDate: customStartDate,
                    endDate: customEndDate,
                  });
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
        </div>

        <div className={styles.dropdownWrapper}>
          <button
             className={styles.dropdownButton}
             onClick={() => setShowRegionDropdown((prev) => !prev)}
          >
            <span>{localRegion}</span>
            <ChevronDown size={16} />
          </button>
          {showRegionDropdown && (
          <div className={styles.dropdownMenu}>
            {regionOptions.map(option => (
              <div
                key={option}
                className={styles.dropdownMenuItem}
                onClick={() => {
                  setLocalRegion(option);
                  setShowRegionDropdown(false);
                  onApplyFilters({
                    period: localPeriod,
                    mode: localMode,
                    region: option,
                    startDate: customStartDate,
                    endDate: customEndDate,
                  });
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
        </div> 
        
        */}

        <button className={styles.resetAllButton} title="Reset All Filters" onClick={handleResetAllFilters}>
          <RotateCcwIcon size={16} />
        </button>

        <div className={styles.filterActions}>
          <button
            className={`${styles.filterButton} ${hasActiveFilters ? styles.activeFilter : ""}`}
            onClick={onFilterClick}
            title="Advanced Filters"
          >
            <FilterIcon size={16} />
            {hasActiveFilters && <span className={styles.filterBadge}></span>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
