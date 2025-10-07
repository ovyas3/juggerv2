'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, RefreshCw, Download, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { httpsPost } from '@/utils/Communication';
import './DashboardHeader.css';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onSearchResults?: (results: any[]) => void;
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
  onExport: () => Promise<void>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearch,
  onSearchResults,
  dateRange,
  onDateRangeChange,
  onCustomDateRangeChange,
  filters,
  onFiltersChange,
  isExpanded,
  onToggleExpand,
  onExport
}) => {
  const [showDateRangePickers, setShowDateRangePickers] = useState(false);
  const [startDate, setStartDate] = useState<dayjs.Dayjs>(dayjs().subtract(7, 'day').startOf('day'));
  const [endDate, setEndDate] = useState<dayjs.Dayjs>(dayjs().endOf('day'));
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchType, setSearchType] = useState('SIN');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const getSearchField = (type: string): string => {
    const fieldMap: { [key: string]: string } = {
      'SIN': 'sin',
      'Vehicle': 'vehicle_no',
      'Shipper': 'shipper_name',
      'Carrier': 'carrier_name'
    };
    return fieldMap[type] || 'sin';
  };
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      onSearch('');
      if (onSearchResults) {
        onSearchResults([]);
      }
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
  
    try {
      setIsSearching(true);
      
      const getDateRange = () => {
        const now = new Date();
        const start = new Date(now);
        
        switch (dateRange) {
          case 'yesterday':
            start.setDate(now.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            return {
              startDate: start.toISOString(),
              endDate: new Date(start.setHours(23, 59, 59, 999)).toISOString()
            };
          case 'week':
            start.setDate(now.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            return {
              startDate: start.toISOString(),
              endDate: new Date().toISOString()
            };
          case 'custom':
            return {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            };
          case 'today':
          default:
            start.setHours(0, 0, 0, 0);
            return {
              startDate: start.toISOString(),
              endDate: new Date(start.setHours(23, 59, 59, 999)).toISOString()
            };
        }
      };
  
      const dateRangeObj = getDateRange();
      
      const searchFieldMap: { [key: string]: string } = {
        'SIN': 'SIN',
        'Vehicle': 'vehicle_no',
        'Shipper': 'shipper',
        'Carrier': 'carrier'
      };
      
      const searchField = searchFieldMap[searchType];
      
      const payload: any = {
        dateRange: {
          key: dateRange,
          startDate: dateRangeObj.startDate,
          endDate: dateRangeObj.endDate
        },
        limit: 20,
        skip: 0,
        report: false
      };
  
      if (filters.stage && filters.stage !== 'all') {
        payload.stage = filters.stage;
      }
      
      if (filters.duration && filters.duration !== 'all') {
        payload.duration = filters.duration;
      }
      
      if (filters.quickFilter && filters.quickFilter !== 'all') {
        payload.quickFilter = filters.quickFilter;
      }
      
      if (searchField && searchValue.trim()) {
        payload[searchField] = searchValue.trim();
      }
  
      console.log('Search Payload:', JSON.stringify(payload, null, 2));
      console.log('Search Payload:', JSON.stringify(payload, null, 2));
  
      const response = await httpsPost('InplantDashboard/Table', payload, {}, 1);
      
      console.log('Search Response:', response);
      
      if (response?.statusCode === 200) {
        onSearch(`${searchType}:${searchValue.trim()}`);
        if (onSearchResults) {
          onSearchResults(response.data.data || []);
        }
        setShowSuggestions(false);
      } else {
        console.error('Search failed:', response?.message || 'Unknown error');
        if (onSearchResults) {
          onSearchResults([]);
        }
      }
      
    } catch (error) {
      console.error('Error during search:', error);
      if (onSearchResults) {
        onSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSuggestionClick = async (suggestion: string) => {
    setSearchValue(suggestion);
    setShowSuggestions(false);
    
    try {
      setIsSearching(true);
      
      const getDateRange = () => {
        const now = new Date();
        const start = new Date(now);
        
        switch (dateRange) {
          case 'yesterday':
            start.setDate(now.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            return {
              startDate: start.toISOString(),
              endDate: new Date(start.setHours(23, 59, 59, 999)).toISOString()
            };
          case 'week':
            start.setDate(now.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            return {
              startDate: start.toISOString(),
              endDate: new Date().toISOString()
            };
          case 'custom':
            return {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            };
          case 'today':
          default:
            start.setHours(0, 0, 0, 0);
            return {
              startDate: start.toISOString(),
              endDate: new Date(start.setHours(23, 59, 59, 999)).toISOString()
            };
        }
      };
  
      const dateRangeObj = getDateRange();
      
      const searchFieldMap: { [key: string]: string } = {
        'SIN': 'SIN',
        'Vehicle': 'vehicle_no',
        'Shipper': 'shipper',
        'Carrier': 'carrier'
      };
      
      const searchField = searchFieldMap[searchType];
      
      const payload: any = {
        dateRange: {
          key: dateRange,
          startDate: dateRangeObj.startDate,
          endDate: dateRangeObj.endDate
        },
        limit: 20,
        skip: 0,
        report: false
      };
  
      if (filters.stage && filters.stage !== 'all') {
        payload.stage = filters.stage;
      }
      
      if (filters.duration && filters.duration !== 'all') {
        payload.duration = filters.duration;
      }
      
      if (filters.quickFilter && filters.quickFilter !== 'all') {
        payload.quickFilter = filters.quickFilter;
      }
      
      if (searchField && suggestion.trim()) {
        payload[searchField] = suggestion.trim();
      }
  
      console.log('Suggestion Click - Search Payload:', JSON.stringify(payload, null, 2));
  
      const response = await httpsPost('InplantDashboard/Table', payload, {}, 1);
      
      console.log('Suggestion Click - Search Response:', response);
      
      if (response?.statusCode === 200) {
        onSearch(`${searchType}:${suggestion.trim()}`);
        if (onSearchResults) {
          onSearchResults(response.data.data || []);
        }
      } else {
        console.error('Search failed:', response?.message || 'Unknown error');
        if (onSearchResults) {
          onSearchResults([]);
        }
      }
      
    } catch (error) {
      console.error('Error during suggestion search:', error);
      if (onSearchResults) {
        onSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };
  
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (value.trim() === '') {
      onSearch('');
      if (onSearchResults) {
        onSearchResults([]);
      }
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Trigger autocomplete when user types (debounce can be added here)
    if (value.trim().length >= 3) {
      fetchSuggestions(value.trim());
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = async (searchTerm: string) => {
    try {
      const field = getSearchField(searchType);
      
      const payload = {
        search_term: searchTerm,
        field: field,
        limit: 50
      };

      const response = await httpsPost(
        'InplantDashboard/searchIndex',
        payload,
        {},
        1
      );

      if (response?.statusCode === 200) {
        if (response.data && Array.isArray(response.data)) {
          setSearchSuggestions(response.data);
          setShowSuggestions(response.data.length > 0);
        }
      } else {
        console.error('Search failed:', response?.message || 'Unknown error');
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    setSearchValue('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
    if (onSearchResults) {
      onSearchResults([]);
    }
    
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
  

  const handleExportClick = async () => {
    try {
      setIsExporting(true);
      await onExport();
    } catch (error) {
      console.error('Error in export handler:', error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (dateRange === 'custom') {
      setStartDate(dayjs().subtract(7, 'day').startOf('day'));
      setEndDate(dayjs().endOf('day'));
      setShowDateRangePickers(true);
    } else {
      setShowDateRangePickers(false);
    }
  }, [dateRange]);

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

  const hasActiveAdvancedFilters = () => {
    return (
      (filters.stage && filters.stage !== 'all') ||
      (filters.duration && filters.duration !== 'all')
    );
  };

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
              <div className="searchInputContainer" style={{ position: 'relative' }}>
                <Select 
                  value={searchType}
                  onValueChange={setSearchType}
                >
                  <SelectTrigger className='perPageSelect'>
                    <SelectValue placeholder="SIN" />
                  </SelectTrigger>
                  <SelectContent className='perPageContent'>
                    <SelectItem className='perPageItem' value="SIN">SIN</SelectItem>
                    <SelectItem className='perPageItem' value="Vehicle">Vehicle</SelectItem>
                    <SelectItem className='perPageItem' value="Shipper">Shipper</SelectItem>
                    <SelectItem className='perPageItem' value="Carrier">Carrier</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="text"
                  placeholder={`Search by ${searchType}...`}
                  value={searchValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="inputSearch"
                  onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                />
                <Search 
                  className="searchIcon" 
                  onClick={handleSearch}
                />
                
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="search-suggestions">
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`action-btn ${isRefreshing ? 'refreshing' : ''}`}
              >
                <RefreshCw className={isRefreshing ? 'spin' : ''} size={16} />
              </button>

              <button 
                onClick={handleExportClick} 
                className={`action-btn ${isExporting ? 'exporting' : ''}`}
                disabled={isExporting}
              >
                <Download size={16} />
              </button>
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
              {hasActiveAdvancedFilters() && (
                <span className="filter-active-indicator" />
              )}
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
                      <SelectValue placeholder="All Stages" className="selectValue" />
                    </SelectTrigger>
                    <SelectContent 
                       className="selectContent2"
                       position="popper"
                       side="bottom"
                       align="start">
                      <SelectItem className="selectItem" value="all">All Stages</SelectItem>
                      <SelectItem className="selectItem" value="external-parking">External Parking</SelectItem>
                      <SelectItem className="selectItem" value="entry-gate">Entry Gate</SelectItem>
                      <SelectItem className="selectItem" value="weighing">Weighing</SelectItem>
                      <SelectItem className="selectItem" value="loading">Loading</SelectItem>
                      <SelectItem className="selectItem" value="weight-out">Weight Out</SelectItem>
                      <SelectItem className="selectItem" value="gate-out">Gate Out</SelectItem>
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
                        className="selectContent2"
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
