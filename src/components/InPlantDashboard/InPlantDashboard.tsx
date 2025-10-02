'use client';

import React, { useState, useCallback } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import MetricsBar from './components/MetricsBar/MetricsBar';
import StageFlow from './components/StageFlow/StageFlow';
import VehicleTable from './components/VehicleTable/VehicleTable';
import DetailPanel from './components/DetailPanel/DetailPanel';
import KeplerMapView from './components/KeplerMapView/KeplerMapView';
import './InPlantDashboard.css';
import {ChevronDown, ChevronUp  } from 'lucide-react';
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
  const mockMetrics: DashboardMetrics = {
    activeVehicles: 23,
    averageProcessingTime: 135,
    delayedVehicles: 5,
    completedToday: 142,
    trends: {
      activeVehiclesTrend: 3,
      avgTimeTrend: -15,
      delayedTrend: 2,
      completedTrend: 12
    }
  };

  const mockStages: StageInfo[] = [
    {
      stageId: 'EXT_PARKING',
      stageName: 'External Parking',
      vehicleCount: 8,
      averageTime: 80,
      healthStatus: 'normal',
      slaThreshold: 120,
      order: 1
    },
    {
      stageId: 'ENTRY_GATE',
      stageName: 'Entry Gate',
      vehicleCount: 4,
      averageTime: 15,
      healthStatus: 'normal',
      slaThreshold: 30,
      order: 2
    },
    {
      stageId: 'WEIGHING',
      stageName: 'Weighing',
      vehicleCount: 3,
      averageTime: 45,
      healthStatus: 'warning',
      slaThreshold: 60,
      order: 3
    },
    {
      stageId: 'LOADING',
      stageName: 'Loading',
      vehicleCount: 5,
      averageTime: 90,
      healthStatus: 'normal',
      slaThreshold: 120,
      order: 4
    },
    {
      stageId: 'WEIGHT_OUT',
      stageName: 'Weight Out',
      vehicleCount: 3,
      averageTime: 20,
      healthStatus: 'normal',
      slaThreshold: 30,
      order: 5
    },
    {
      stageId: 'GATE_OUT',
      stageName: 'Gate Out',
      vehicleCount: 0,
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
  const toggleCollapse = () => setIsExpanded(!isExpanded);
  return (
    <div className="inplant-dashboard">
      <div className="dashboard-container">
        {/* Metrics Bar */}
        <MetricsBar metrics={mockMetrics} />

        {/* Stage Flow Visualization */}
        {!isMobile && (
          <StageFlow
            stages={mockStages}
            selectedStage={selectedStage}
            onStageSelect={handleStageSelect}
          />
        )}

        {/* Main Content Area */}
        <div className="dashboard-main-content">
          {/* Header Section */}
          <button 
      className="collapse-toggle-btn" 
      onClick={toggleCollapse} 
      aria-expanded={isExpanded}
      aria-controls="metrics-container" // Assuming the metrics-bar is what is collapsed
    >
      {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
     
    </button>
    <div className={`collapsible-section ${!isExpanded ? 'collapsed' : ''}`}>
    {isExpanded && (
        <>
        <div>
          <DashboardHeader
            searchQuery={searchQuery}
            onSearch={handleSearch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={filters}
            onFiltersChange={handleFilterChange}
          />


          
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
          <div className="content-area">
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