'use client';

import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Settings,
  ChevronDown
} from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";

import './DashboardHeader.css';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  dateRange: 'today' | 'yesterday' | 'week' | 'custom';
  onDateRangeChange: (range: 'today' | 'yesterday' | 'week' | 'custom') => void;
  filters: {
    status: string;
    stage: string;
    timeRange: string;
  };
  onFiltersChange: (filters: any) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearch,
  dateRange,
  onDateRangeChange,
  filters,
  onFiltersChange
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
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
    <div className="dashboard-header">
      <div className="header-top">
        {/* Left Section - Title */}
        <div className="header-left">
          <h1 className="dashboard-title">
            InPlant Dashboard
            <span className="plant-name">Mumbai Distribution Center</span>
          </h1>
        </div>

        {/* Center Section - Date Range */}
        <div className="header-center">
          {/* <div className="date-selector">
            <Calendar className="date-icon" size={16} /> */}
            <Select 
              value={dateRange} 
              onValueChange={(value) => onDateRangeChange(value as any)}
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
          {/* </div> */}
        </div>

        {/* Right Section - Actions */}
        <div className="header-right">
          {/* Search */}
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

          {/* Action Buttons */}
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

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="action-btn"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="header-filters">
        <div className="quick-filters">
          {quickFilters.map(filter => (
            <button
              key={filter.key}
              onClick={() => onFiltersChange({ ...filters, status: filter.key })}
              className={`filter-chip ${filters.status === filter.key ? 'active' : ''}`}
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

      {/* Advanced Filters Panel */}
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
                value={filters.timeRange} 
                onValueChange={(value) => onFiltersChange({ ...filters, timeRange: value })}
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
                onClick={() => onFiltersChange({ status: 'all', stage: 'all', timeRange: 'all' })}
                className="reset-filters-btn"
              >
                Reset
              </button>
              <button className="apply-filters-btn">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
