'use client';

import React, { useState, useCallback } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import { MetricCard } from '../UI/MetricCard/MetricCard';
import { MetricCardSkeleton } from '../UI/MetricCard/MetricCardSkeleton';
import StageFlow from './components/StageFlow/StageFlow';
import VehicleStagingLive from '../InPlantOverview/VehicleStagingLive/VehicleStagingLive';
import VehicleTable from './components/VehicleTable/VehicleTable';
import DetailPanel from './components/DetailPanel/DetailPanel';
import KeplerMapView from './components/KeplerMapView/KeplerMapView';
import './InPlantDashboard.css';
import {AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Clock, Truck, DoorOpen, Scale, Package, LogOut  } from 'lucide-react';
export interface Vehicle {
  id: string;
  vehicleNumber: string;
  currentStage: {
    stageId: string;
    stageName: string;
    location: string;
    arrivedAt: string;
    duration: number;
    expectedDuration: number;
    status: 'on_time' | 'at_risk' | 'delayed';
  };
  entryTime: string;
  totalDuration: number;
  overallStatus: 'on_track' | 'at_risk' | 'delayed' | 'completed' | 'on_hold';
  progress: number;
  completedStages: string[];
  shipper: {
    id: string;
    name: string;
  };
  carrier: {
    id: string;
    name: string;
  };
  driver: {
    name: string;
    phone: string;
  };
  shipmentId: string;
  orderReference: string;
}

export interface DashboardMetrics {
  activeVehicles: number;
  averageProcessingTime: number;
  delayedVehicles: number;
  completedToday: number;
  trends: {
    activeVehiclesTrend: number;
    avgTimeTrend: number;
    delayedTrend: number;
    completedTrend: number;
  };
}

export interface StageInfo {
  stageId: string;
  stageName: string;
  vehicleCount: number;
  averageTime: number;
  healthStatus: 'normal' | 'warning' | 'critical';
  slaThreshold: number;
  order: number;
}

const InPlantDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week' | 'custom'>('today');
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [filters, setFilters] = useState({
    status: 'all',
    stage: 'all',
    timeRange: 'all'
  });

  // Mock data - this will be replaced with API calls
  const [isLoading, setIsLoading] = useState(false); 
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const mockMetrics = [
    {
      id: 'activeVehicles',
      title: 'Active Vehicles',
      value: '23',
      icon: <Truck size={20} />,
      iconColor: '#3B82F6', 
      bgColor: 'white',
      borderColor: '#E5E7EB' 
    },
    {
      id: 'averageProcessingTime',
      title: 'Avg. Processing Time',
      value: formatTime(135),
      icon: <Clock size={20} />,
      iconColor: '#06B6D4', 
      bgColor: 'white',
      borderColor: '#E5E7EB'
    },
    {
      id: 'delayedVehicles',
      title: 'Delayed Vehicles',
      value: '5',
      icon: <AlertTriangle size={20} />,
      iconColor: '#EF4444', 
      bgColor: 'white',
      borderColor: '#E5E7EB'
    },
    {
      id: 'completedToday',
      title: 'Completed Today',
      value: '142',
      icon: <CheckCircle2 size={20} />,
      iconColor: '#10B981',   
      bgColor: 'white',
      borderColor: '#E5E7EB'
    }
  ];


  const mockStages = [
    {
      id: 'EXT_PARKING',
      title: 'External Parking',
      value: '8',
      subtitle: 'Vehicles',
      icon: <Truck size={20} />,
      iconColor: '#3B82F6',
      bgColor: 'white',
      borderColor: '#E5E7EB',
      stageId: 'EXT_PARKING',
      averageTime: 80,
      healthStatus: 'normal',
      slaThreshold: 120,
      order: 1
    },
    {
      id: 'ENTRY_GATE',
      title: 'Entry Gate',
      value: '4',
      subtitle: 'Vehicles',
      icon: <DoorOpen size={20} />,
      iconColor: '#8B5CF6',
      bgColor: 'white',
      borderColor: '#E5E7EB',
      stageId: 'ENTRY_GATE',
      averageTime: 15,
      healthStatus: 'normal',
      slaThreshold: 30,
      order: 2
    },
    {
      id: 'WEIGHING',
      title: 'Weighing',
      value: '3',
      subtitle: 'Vehicles',
      icon: <Scale size={20} />,
      iconColor: '#F59E0B',
      bgColor: 'white',
      borderColor: '#E5E7EB',
      stageId: 'WEIGHING',
      averageTime: 45,
      healthStatus: 'warning',
      slaThreshold: 60,
      order: 3
    },
    {
      id: 'LOADING',
      title: 'Loading',
      value: '5',
      subtitle: 'Vehicles',
      icon: <Package size={20} />,
      iconColor: '#10B981',
      bgColor: 'white',
      borderColor: '#E5E7EB',
      stageId: 'LOADING',
      averageTime: 90,
      healthStatus: 'normal',
      slaThreshold: 120,
      order: 4
    },
    {
      id: 'WEIGHT_OUT',
      title: 'Weight Out',
      value: '3',
      subtitle: 'Vehicles',
      icon: <Scale size={20} className="rotate-180" />,
      iconColor: '#8B5CF6',
      bgColor: 'white',
      borderColor: '#E5E7EB',
      stageId: 'WEIGHT_OUT',
      averageTime: 20,
      healthStatus: 'normal',
      slaThreshold: 30,
      order: 5
    },
    {
      id: 'GATE_OUT',
      title: 'Gate Out',
      value: '0',
      subtitle: 'Vehicles',
      icon: <LogOut size={20} />,
      iconColor: '#6B7280',
      bgColor: 'white',
      borderColor: '#E5E7EB',
      stageId: 'GATE_OUT',
      averageTime: 10,
      healthStatus: 'normal',
      slaThreshold: 15,
      order: 6
    }
  ];

  const mockVehicles: Vehicle[] = [
    {
      id: 'VEH-001',
      vehicleNumber: 'MH12AB1234',
      currentStage: {
        stageId: 'LOADING',
        stageName: 'Loading Bay 3',
        location: 'Bay 3',
        arrivedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        duration: 90,
        expectedDuration: 45,
        status: 'delayed'
      },
      entryTime: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      totalDuration: 150,
      overallStatus: 'delayed',
      progress: 60,
      completedStages: ['EXT_PARKING', 'ENTRY_GATE', 'WEIGHING'],
      shipper: { id: 'SHP-001', name: 'XYZ Industries' },
      carrier: { id: 'CAR-001', name: 'ABC Logistics' },
      driver: { name: 'John Doe', phone: '+919876543210' },
      shipmentId: 'SHP-2024-001',
      orderReference: 'ORD-12345'
    },
    {
      id: 'VEH-002',
      vehicleNumber: 'KA05CD5678',
      currentStage: {
        stageId: 'WEIGHING',
        stageName: 'Weight In',
        location: 'Weighbridge 1',
        arrivedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        duration: 30,
        expectedDuration: 20,
        status: 'at_risk'
      },
      entryTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      totalDuration: 60,
      overallStatus: 'at_risk',
      progress: 40,
      completedStages: ['EXT_PARKING', 'ENTRY_GATE'],
      shipper: { id: 'SHP-002', name: 'ABC Manufacturing' },
      carrier: { id: 'CAR-002', name: 'Express Transport' },
      driver: { name: 'Rahul Kumar', phone: '+919876543211' },
      shipmentId: 'SHP-2024-002',
      orderReference: 'ORD-12346'
    },
    {
      id: 'VEH-003',
      vehicleNumber: 'TN43EF9012',
      currentStage: {
        stageId: 'ENTRY_GATE',
        stageName: 'Entry Gate',
        location: 'Gate 1',
        arrivedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        duration: 10,
        expectedDuration: 15,
        status: 'on_time'
      },
      entryTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      totalDuration: 10,
      overallStatus: 'on_track',
      progress: 20,
      completedStages: ['EXT_PARKING'],
      shipper: { id: 'SHP-003', name: 'Steel Corp' },
      carrier: { id: 'CAR-003', name: 'Rapid Logistics' },
      driver: { name: 'Suresh Patil', phone: '+919876543212' },
      shipmentId: 'SHP-2024-003',
      orderReference: 'ORD-12347'
    }
  ];

  // Event handlers
  const handleVehicleSelect = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

  const handleStageSelect = useCallback((stageId: string) => {
    setSelectedStage(selectedStage === stageId ? null : stageId);
  }, [selectedStage]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const handleClosePanelDetail = useCallback(() => {
    setSelectedVehicle(null);
  }, []);
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleExpand = useCallback(() => setIsExpanded(prev => !prev), []);

  return (
    <div className="inplant-dashboard">
      <div className="dashboard-container">
        {/* Metrics Bar */}
        <div className="dashboard-content">
          <div 
            className="metrics-header" 
            onClick={toggleExpand}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginBottom: isExpanded ? '1rem' : 0,
              padding: '0.5rem 0',
              userSelect: 'none'
            }}
          >
            <h3 style={{ margin: 0, marginRight: '0.5rem' }}>Key Metrics</h3>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {isExpanded && (
            <div className="metrics-grid">
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <MetricCardSkeleton key={`skeleton-${index}`} />
                ))
              ) : (
                mockMetrics.map((metric) => (
                  <MetricCard
                    key={metric.id}
                    title={metric.title}
                    value={metric.value}
                    icon={metric.icon}
                    iconColor={metric.iconColor}
                    bgColor={metric.bgColor}
                    borderColor={metric.borderColor}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Stage Flow Visualization */}
        {!isMobile && (
          <StageFlow
            stages={mockStages}
            selectedStage={selectedStage}
            onStageSelect={handleStageSelect}
          />
        )}

        <div style={{
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
          padding: 'var(--spacing-lg)',
          boxShadow: '0 0 0 1px rgb(118 16 255 / 20%)',
          backgroundColor: '#f9f9ff',
          minHeight: '200px',
          position: 'relative'
        }}>
          <VehicleStagingLive 
            noLeftMargin={true} 
            isInDashboard={true} 
            useLoader2={true} 
          />
        </div>

        {/* Main Content Area */}
        <div className="dashboard-main-content1">
          {/* Header Section */}
          <DashboardHeader 
            searchQuery={searchQuery}
            onSearch={handleSearch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={filters}
            onFiltersChange={handleFilterChange}
            isExpanded={isExpanded}
            onToggleExpand={toggleExpand}
          />

          {isExpanded && (
            <>
            <div>
              {/* Content Tabs */}
              <div className="content-tabs">
                <button
                  className={`tab-button ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  Table View
                </button>
                <button
                  className={`tab-button ${viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setViewMode('map')}
                >
                  Map View
                </button>
              </div>

              {/* Content Area */}
              <div className={`content-area ${viewMode === 'map' ? 'map-view-container' : ''}`}>
                {viewMode === 'table' ? (
                  <VehicleTable
                    vehicles={mockVehicles}
                    selectedVehicle={selectedVehicle}
                    onVehicleSelect={handleVehicleSelect}
                    searchQuery={searchQuery}
                    selectedStage={selectedStage}
                    filters={filters}
                  />
                ) : (
                  <KeplerMapView
                    vehicles={mockVehicles}
                    selectedVehicle={selectedVehicle}
                    onVehicleSelect={handleVehicleSelect}
                    stages={mockStages}
                  />
                )}
              </div>
            </div>
          </>)}
        </div>

        {/* Detail Panel */}
        {selectedVehicle && (
          <DetailPanel
            vehicle={selectedVehicle}
            onClose={handleClosePanelDetail}
            isOpen={!!selectedVehicle}
          />
        )}
      </div>
    </div>
  );
};

export default InPlantDashboard;