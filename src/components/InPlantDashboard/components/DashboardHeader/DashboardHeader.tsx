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
    { key: 'completed', label: 'Completed', count: 142 }
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
          <h2 className="dashboard-title">InPlant Dashboard</h2>
          <span className="plant-name">Mumbai Distribution Center</span>
        </div>

        {/* Center Section - Date Range */}
        <div className="header-center">
          <div className="date-selector">
            <Calendar className="date-icon" size={16} />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as any)}
              className="date-select"
            >
              {dateRangeOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="header-right">
          {/* Search */}
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search vehicle, driver..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleRefresh}
            className={`action-btn ${isRefreshing ? 'refreshing' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
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
              {filter.label}
              <span className="filter-count">{filter.count}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="advanced-filters-toggle"
        >
          <Filter size={14} />
          Advanced Filters
          <ChevronDown size={14} className={showAdvancedFilters ? 'rotated' : ''} />
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="advanced-filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => onFiltersChange({ ...filters, stage: e.target.value })}
              >
                <option value="all">All Stages</option>
                <option value="EXT_PARKING">External Parking</option>
                <option value="ENTRY_GATE">Entry Gate</option>
                <option value="WEIGHING">Weighing</option>
                <option value="LOADING">Loading</option>
                <option value="WEIGHT_OUT">Weight Out</option>
                <option value="GATE_OUT">Gate Out</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Duration</label>
              <select
                value={filters.timeRange}
                onChange={(e) => onFiltersChange({ ...filters, timeRange: e.target.value })}
              >
                <option value="all">All Durations</option>
                <option value="under_1h">Under 1 hour</option>
                <option value="1h_2h">1-2 hours</option>
                <option value="2h_4h">2-4 hours</option>
                <option value="over_4h">Over 4 hours</option>
              </select>
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

      {/* Auto-refresh indicator */}
      {/* <div className="refresh-indicator">
        <div className="refresh-dot"></div>
        <span>Auto-refresh: ON (30s)</span>
        <span className="last-updated">Last updated: {new Date().toLocaleTimeString()}</span>
      </div> */}
    </div>
  );
};

export default DashboardHeader;