'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, RefreshCw, Download, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import './DashboardHeader.css';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  dateRange: 'today' | 'yesterday' | 'week' | 'custom';
  onDateRangeChange: (range: 'today' | 'yesterday' | 'week' | 'custom') => void;
  onCustomDateRangeChange?: (range: { startDate: string; endDate: string }) => void;
  filters: {
    status: string;
    stage: string;
    duration: string;
    quickFilter: string;
  };
  onFiltersChange: (filters: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearch,
  dateRange,
  onDateRangeChange,
  onCustomDateRangeChange,
  filters,
  onFiltersChange,
  isExpanded,
  onToggleExpand
}) => {
  const [showDateRangePickers, setShowDateRangePickers] = useState(false);
  const [startDate, setStartDate] = useState<dayjs.Dayjs>(dayjs().subtract(7, 'day').startOf('day'));
  const [endDate, setEndDate] = useState<dayjs.Dayjs>(dayjs().endOf('day'));
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (dateRange === 'custom') {
      setStartDate(dayjs().subtract(7, 'day').startOf('day'));
      setEndDate(dayjs().endOf('day'));
      setShowDateRangePickers(true);
    } else {
      setShowDateRangePickers(false);
    }
  }, [dateRange]);

  const handleStartDateChange = (date: any) => {
    if (date) {
      setStartDate(date.startOf('day'));
      if (onCustomDateRangeChange) {
        onCustomDateRangeChange({
          startDate: date.startOf('day').toISOString(),
          endDate: endDate.toISOString()
        });
      }
    }
  };

  const handleEndDateChange = (date: any) => {
    if (date) {
      setEndDate(date.endOf('day'));
      if (onCustomDateRangeChange) {
        onCustomDateRangeChange({
          startDate: startDate.toISOString(),
          endDate: date.endOf('day').toISOString()
        });
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onFiltersChange({ 
      status: 'all',
      stage: 'all',
      duration: 'all',
      quickFilter: 'all'
    });
    if (onDateRangeChange) {
      onDateRangeChange('today');
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting data...');
  };

  const quickFilters = [
    { key: 'all', label: 'All', count: 23 },
    { key: 'active', label: 'Active', count: 18 },
    { key: 'delayed', label: 'Delayed', count: 5 },
    { key: 'gate-out', label: 'Gate Out', count: 142 }
  ];

  const dateRangeOptions = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'week', label: 'Last 7 days' },
    { key: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className={`dashboard-header ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="header-top">
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="dashboard-title">
              InPlant Dashboard
            </h1>
            <div 
              onClick={onToggleExpand}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                marginLeft: '0.5rem',
                color: '#4B5563'
              }}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="header-center">
              <div className="date-range-container">
                <Select 
                  value={dateRange} 
                  onValueChange={(value: 'today' | 'yesterday' | 'week' | 'custom') => {
                    onDateRangeChange(value);
                  }}
                >
                  <SelectTrigger className="select">
                    <SelectValue className="selectValue" />
                  </SelectTrigger>
                  <SelectContent 
                    className="selectContent1"
                    position="popper"
                    side="bottom"
                    align="start"
                  >
                    {dateRangeOptions.map(option => (
                      <SelectItem key={option.key} value={option.key} className='selectItem'>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {showDateRangePickers && (
                  <div className="date-pickers-container">
                    <div className="date-picker-group">
                      <span className="date-picker-label">From</span>
                      <DatePicker
                        value={startDate}
                        onChange={handleStartDateChange}
                        format="DD/MM/YYYY"
                        className="date-picker"
                        popupClassName="ant-picker-dropdown"
                        allowClear={false}
                      />
                    </div>
                    <div className="date-picker-group">
                      <span className="date-picker-label">To</span>
                      <DatePicker
                        value={endDate}
                        onChange={handleEndDateChange}
                        format="DD/MM/YYYY"
                        className="date-picker"
                        popupClassName="ant-picker-dropdown"
                        allowClear={false}
                        disabledDate={(current) => {
                          return current && current < startDate.startOf('day');
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="header-right">
              <div className="search-container">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Search shipments..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`action-btn ${isRefreshing ? 'refreshing' : ''}`}
              >
                <RefreshCw className={isRefreshing ? 'spin' : ''} size={16} />
              </button>

              <button onClick={handleExport} className="action-btn">
                <Download size={16} />
              </button>

              {/* <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="action-btn"
              >
                <Settings size={16} />
              </button> */}
            </div>
          </>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="header-filters">
            <div className="quick-filters">
              {quickFilters.map(filter => (
                <button
                  key={filter.key}
                  onClick={() => onFiltersChange({ ...filters, quickFilter: filter.key })}
                  className={`filter-chip ${filters.quickFilter === filter.key ? 'active' : ''}`}
                >
                  <span>{filter.label}</span>
                  <span className="filter-count">{filter.count}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="advanced-filters-toggle"
            >
              <Filter size={14} />
              <span>Advanced Filters</span>
              <ChevronDown 
                size={14} 
                className={showAdvancedFilters ? 'rotated' : ''} 
              />
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="advanced-filters-panel">
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Stage</label>
                  <Select 
                    value={filters.stage} 
                    onValueChange={(value) => onFiltersChange({ ...filters, stage: value })}
                  >
                    <SelectTrigger className="select">
                      <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent 
                      className="selectContent"
                      position="popper"
                      side="bottom"
                      align="start"
                    >
                      <SelectItem className="selectItem" value="all">All Stages</SelectItem>
                      <SelectItem className="selectItem" value="external-parking">External Parking</SelectItem>
                      <SelectItem className="selectItem" value="entry-gate">Entry Gate</SelectItem>
                      <SelectItem className="selectItem" value="weighing">Weighing</SelectItem>
                      <SelectItem className="selectItem" value="loading">Loading</SelectItem>
                      <SelectItem className="selectItem" value="weight-out">Weight Out</SelectItem>
                      <SelectItem value="gate-out">Gate Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="filter-group">
                  <label>Duration</label>
                  <Select 
                    value={filters.duration} 
                    onValueChange={(value) => onFiltersChange({ ...filters, duration: value })}
                  >
                    <SelectTrigger className="select">
                      <SelectValue placeholder="All Durations" className='selectValue' />
                    </SelectTrigger>
                    <SelectContent 
                      className="selectContent"
                      position="popper"
                      side="bottom"
                      align="start"
                    >
                      <SelectItem className='selectItem' value="all">All Durations</SelectItem>
                      <SelectItem className='selectItem' value="under-1h">Under 1 hour</SelectItem>
                      <SelectItem className='selectItem' value="1-2h">1-2 hours</SelectItem>
                      <SelectItem className='selectItem' value="2-4h">2-4 hours</SelectItem>
                      <SelectItem className='selectItem' value="over-4h">Over 4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="filter-actions">
                  <button
                    onClick={() => onFiltersChange({ 
                      ...filters, 
                      stage: 'all',
                      duration: 'all'
                    })}
                    className="reset-filters-btn"
                  >
                    Reset
                  </button>
                  {/* <button className="apply-filters-btn">
                    Apply Filters
                  </button> */}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardHeader;
