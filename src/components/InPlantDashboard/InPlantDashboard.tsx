'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import { httpsGet, httpsPost } from '@/utils/Communication';
import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import { MetricCard } from '../UI/MetricCard/MetricCard';
import { MetricCardSkeleton } from '../UI/MetricCard/MetricCardSkeleton';
import StageFlow from './components/StageFlow/StageFlow';
import VehicleStagingLive from '../InPlantOverview/VehicleStagingLive/VehicleStagingLive';
import VehicleTable from './components/VehicleTable/VehicleTable';
import DetailPanel from './components/DetailPanel/DetailPanel';
import KeplerMapView from './components/KeplerMapView/KeplerMapView';
import './InPlantDashboard.css';
import {AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Clock, Truck, DoorOpen, Scale, Package, LogOut, CheckCircle, ArrowDownToLine, ArrowUpFromLine, Weight, PackageCheck, FileCheck, FileText  } from 'lucide-react';
import { useSnackbar } from '@/hooks/snackBar';
import dayjs from "dayjs";
import { iconMap } from '@/components/UI/iconMap';
import * as XLSX from 'xlsx';

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
    id:string;
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
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showMessage } = useSnackbar();

  // State management
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week' | 'custom'>('today');
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: dayjs().subtract(7, 'day').startOf('day').toISOString(),
    endDate: dayjs().endOf('day').toISOString()
  });
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [filters, setFilters] = useState({
    status: 'all',
    stage: 'all',
    duration: 'all',
    quickFilter: 'all',
    timeRange: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [stages, setStages] = useState<StageInfo[]>([]);
  const [isStagesLoading, setIsStagesLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(true);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const paginatedVehicles = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return vehicles.slice(startIndex, startIndex + pageSize);
  }, [vehicles, currentPage, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedStage, filters]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const response = await httpsPost('InplantDashboard/KPIcards', {}, {}, 1,);
        if (response?.statusCode === 200) {
          setMetrics(response.data);
        } else {
          console.error('Failed to fetch metrics:', response?.message || 'Unknown error');
          showMessage('Failed to fetch metrics', 'error');
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        showMessage('Error fetching metrics', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [router]);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setIsStagesLoading(true);
        const response = await httpsPost('InplantDashboard/vehicleflow', {}, {}, 1);
        if (response?.statusCode === 200) {
          const formattedStages = response.data.map((stage: any) => {
            const IconComponent = stage.icon ? iconMap[stage.icon] : iconMap.default;
            return {
              stageId: stage.id || '',
              stageName: stage.title || '',
              title: stage.title || '',
              value: stage.value || '0',
              subtitle: stage.subtitle || '',
              icon: IconComponent ? <IconComponent size={20} /> : null,
              iconColor: stage.iconColor || '#333333',
              bgColor: stage.bgColor || 'white',
              borderColor: stage.borderColor || '#E5E7EB',
              vehicleCount: parseInt(stage.value) || 0,
              averageTime: stage.averageTime || 0,
              healthStatus: stage.healthStatus?.toLowerCase() || 'normal',
              slaThreshold: stage.slaThreshold || 0,
              order: stage.order || 0,
              trend: stage.trend || 'neutral',
              trendValue: stage.trendValue || 0,
              trendLabel: stage.trendLabel || ''
            };
          });
          setStages(formattedStages);
        } else {
          console.error('Failed to fetch stages:', response?.message || 'Unknown error');
          showMessage('Failed to fetch stages data', 'error');
        }
      } catch (error) {
        console.error('Error fetching stages:', error);
        showMessage('Error fetching stages data', 'error');
      } finally {
        setIsStagesLoading(false);
      }
    };

    fetchStages();
  }, []);

  useEffect(() => {
    if (isSearchActive) return;
    
    const fetchVehicles = async () => {
      try {
        setIsVehiclesLoading(true);
        const getDateRange = () => {
          const now = new Date();
          const start = new Date(now);
          if (dateRange === 'custom') {
            return {
              startDate: customDateRange.startDate,
              endDate: customDateRange.endDate
            };
          }
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
        const payload = {
          stage: filters.stage,
          duration: filters.duration,
          dateRange: {
            key: dateRange,
            startDate: dateRangeObj.startDate,
            endDate: dateRangeObj.endDate
          },
          quickFilter: filters.quickFilter,
          skip: currentPage * pageSize,
          limit: pageSize
        };
        
        const response = await httpsPost('InplantDashboard/Table', payload, {}, 1);
        
        if (response?.statusCode === 200) {
          const formattedVehicles = response.data.data.map((vehicle: any) => ({
            id: vehicle.id || '',
            vehicleNumber: vehicle.vehicleNumber || '',
            currentStage: {
              stageId: vehicle.currentStage?.stageId || '',
              stageName: vehicle.currentStage?.stageName || '',
              location: vehicle.currentStage?.location || '',
              arrivedAt: vehicle.currentStage?.arrivedAt || new Date().toISOString(),
              duration: vehicle.currentStage?.duration || 0,
              expectedDuration: vehicle.currentStage?.expectedDuration || 0,
              status: vehicle.currentStage?.status || 'on_time'
            },
            entryTime: vehicle.entryTime || new Date().toISOString(),
            totalDuration: vehicle.totalDuration || 0,
            overallStatus: vehicle.overallStatus || 'on_track',
            progress: vehicle.progress || 0,
            completedStages: vehicle.completedStages || [],
            shipper: { id: vehicle.shipper?.id || '', name: vehicle.shipper?.name || 'Unknown' },
            carrier: { id: vehicle.carrier?.id || '', name: vehicle.carrier?.name || 'Unknown' },
            driver: { name: vehicle.driver?.name || 'Unknown', phone: vehicle.driver?.phone || '',id: vehicle.driver?.id },
            shipmentId: vehicle.sin || '',
            orderReference: vehicle.orderReference || ''
          }));
          
          setVehicles(formattedVehicles);
          
          if (response.data.pagination) {
            setTotalCount(response.data.pagination.total || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        showMessage('Error fetching vehicles data', 'error');
      } finally {
        setIsVehiclesLoading(false);
      }
    };
    
    fetchVehicles();
  }, [dateRange, filters, customDateRange, currentPage, pageSize, isSearchActive]);

  const handleSearchResults = useCallback(async (results: any[], paginationData?: any) => {
    if (!results || results.length === 0) {
      setSearchQuery('');
      setIsSearchActive(false);
      return;
    }

    try {
      setIsVehiclesLoading(true);
      setIsSearchActive(true);
      
      const formattedVehicles = results.map((vehicle: any) => ({
        id: vehicle.id || '',
        vehicleNumber: vehicle.vehicleNumber || '',
        currentStage: {
          stageId: vehicle.currentStage?.stageId || '',
          stageName: vehicle.currentStage?.stageName || '',
          location: vehicle.currentStage?.location || '',
          arrivedAt: vehicle.currentStage?.arrivedAt || new Date().toISOString(),
          duration: vehicle.currentStage?.duration || 0,
          expectedDuration: vehicle.currentStage?.expectedDuration || 0,
          status: vehicle.currentStage?.status || 'on_time'
        },
        entryTime: vehicle.entryTime || new Date().toISOString(),
        totalDuration: vehicle.totalDuration || 0,
        overallStatus: vehicle.overallStatus || 'on_track',
        progress: vehicle.progress || 0,
        completedStages: vehicle.completedStages || [],
        shipper: { id: vehicle.shipper?.id || '', name: vehicle.shipper?.name || 'Unknown' },
        carrier: { id: vehicle.carrier?.id || '', name: vehicle.carrier?.name || 'Unknown' },
        driver: { name: vehicle.driver?.name || 'Unknown', phone: vehicle.driver?.phone || '' },
        shipmentId: vehicle.sin || '',
        orderReference: vehicle.orderReference || ''
      }));
      
      setVehicles(formattedVehicles);
      setCurrentPage(0);
      
      // **NEW: Update total count from search pagination**
      if (paginationData) {
        setTotalCount(paginationData.total || 0);
      }
      
    } catch (error) {
      console.error('Error formatting search results:', error);
      showMessage('Error processing search results', 'error');
    } finally {
      setIsVehiclesLoading(false);
    }
  }, [showMessage]);
  
  

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
      icon: 'Truck',
      iconColor: '#3B82F6', 
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.2)' 
    },
    {
      id: 'averageProcessingTime',
      title: 'Avg. Processing Time',
      value: formatTime(135),
      icon: 'Clock',
      iconColor: '#06B6D4', 
      bgColor: 'rgba(6, 182, 212, 0.1)',
      borderColor: 'rgba(6, 182, 212, 0.2)'
    },
    {
      id: 'delayedVehicles',
      title: 'Delayed Vehicles',
      value: '5',
      icon: 'AlertTriangle',
      iconColor: '#EF4444', 
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.2)'
    },
    {
      id: 'completedToday',
      title: 'Gate Out Today',
      value: '142',
      icon: 'CheckCircle2',
      iconColor: '#10B981',   
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.2)'
    }
  ];

  const mockStages = [
    {
      id: 'EXT_PARKING',
      title: 'External Parking',
      value: '8',
      subtitle: 'Vehicles',
      icon: 'Truck',
      iconColor: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.2)',
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
      icon: 'DoorOpen',
      iconColor: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 0.2)',
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
      icon: 'Scale',
      iconColor: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
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
      icon: 'Package',
      iconColor: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
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
      icon: 'Scale',
      iconColor: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 0.2)',
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
      icon: 'LogOut',
      iconColor: '#6B7280',
      bgColor: 'rgba(107, 114, 128, 0.1)',
      borderColor: 'rgba(107, 114, 128, 0.2)',
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

  const displayMetrics = metrics || mockMetrics;

  const getStageIcon = (stageId: string) => {
    switch(stageId) {
      case 'EXT_PARKING':
        return <Truck size={20} />;
      case 'ENTRY_GATE':
        return <DoorOpen size={20} />;
      case 'WEIGHING':
        return <Scale size={20} />;
      case 'LOADING':
        return <Package size={20} />;
      case 'EXIT_GATE':
        return <LogOut size={20} />;
      default:
        return <Truck size={20} />;
    }
  };

  const getStageColor = (stageId: string) => {
  const colors = {
    'EXT_PARKING': '#3B82F6',
    'ENTRY_GATE': '#8B5CF6',
    'WEIGHING': '#F59E0B',
    'LOADING': '#10B981',
    'EXIT_GATE': '#EC4899',
  };
  return colors[stageId as keyof typeof colors] || '#6B7280';
};

  const displayStages = stages.length > 0 ? stages.map(stage => ({
    id: stage.stageId,
    title: stage.stageName,
    value: stage.vehicleCount.toString(),
    icon: getStageIcon(stage.stageId),
    iconColor: getStageColor(stage.stageId),
    bgColor: 'white',
    borderColor: '#E5E7EB',
    stageId: stage.stageId,
    averageTime: stage.averageTime,
    healthStatus: stage.healthStatus,
    slaThreshold: stage.slaThreshold,
    order: stage.order
  })) : [];

  const displayVehicles = vehicles.length > 0 ? vehicles : [];

  // Event handlers
  const handleVehicleSelect = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

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
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(true);
  const [isSectionExpanded, setIsSectionExpanded] = useState(true);
  const toggleMetricsExpand = useCallback(
    () => setIsMetricsExpanded(prev => !prev),
    []
  );
  
  const toggleSectionExpand = useCallback(
    () => setIsSectionExpanded(prev => !prev),
    []
  );

  const handleCustomDateRangeChange = (range: { startDate: string; endDate: string }) => {
    setCustomDateRange(range);
  };

  const handleExport = async () => {
    try {
      const getDateRange = () => {
        const now = new Date();
        const start = new Date(now);
        if (dateRange === 'custom') {
          return {
            startDate: customDateRange.startDate,
            endDate: customDateRange.endDate
          };
        }
        
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
      const payload = {
        stage: filters.stage,
        duration: filters.duration,
        dateRange: {
          key: dateRange,
          startDate: dateRangeObj.startDate,
          endDate: dateRangeObj.endDate
        },
        quickFilter: filters.quickFilter,
        skip: 0,
        limit: 100,
        report: true
      };
  
      const response = await httpsPost(
        'InplantDashboard/Table',
        payload,
        {},
        1
      );
  
      if (response?.statusCode === 200 && response.data?.link) {
        const csvResponse = await fetch(response.data.link);
        const csvText = await csvResponse.text();
        
        const workbook = XLSX.read(csvText, { type: 'string' });
        
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        worksheet['!cols'] = [
          { wch: 15 },
          { wch: 15 },
          { wch: 20 },
          { wch: 12 },
          { wch: 10 },
          { wch: 20 },
          { wch: 12 },
          { wch: 12 },
          { wch: 10 },
          { wch: 30 },
          { wch: 25 },
          { wch: 20 },
          { wch: 15 },
          { wch: 30 },
          { wch: 15 }
        ];
        
        const timestamp = dayjs().format('YYYY-MM-DD_HHmm');
        const filename = `inplant_dashboard_${timestamp}.xlsx`;
        
        XLSX.writeFile(workbook, filename);
        
        showMessage('Export completed successfully', 'success');
      } else {
        console.error('Failed to export data:', response?.message || 'No data available');
        showMessage('Failed to export data', 'error');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showMessage('Error exporting data', 'error');
    }
  };
  

  return (
    <div className="inplant-dashboard">
      {/* <div className="dashboard-container"> */}
      <div className={`dashboard-container ${isExpanded ? '' : 'collapsed'}`}>
        {/* Metrics Bar */}
        {/* <div className="dashboard-content"> */}
        <div className={`dashboard-content ${isMetricsExpanded ? 'expanded' : 'collapsed'}`}>
          <div 
            className="metrics-header" 
            onClick={toggleMetricsExpand}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginBottom: isMetricsExpanded ? '1rem' : 0,
              padding: '0.5rem 0',
              userSelect: 'none'
            }}
          >
            <h3 style={{ margin: 0, marginRight: '0.5rem' }}>Key Metrics</h3>
            {isMetricsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
           
           
          {isMetricsExpanded && (
            <div className="metrics-grid">
              {isLoading ? (
               <MetricCardSkeleton count={4} />
              ) : (
                displayMetrics.map((metric) => {
                  const IconComponent = iconMap[metric.icon] || iconMap.default;
                  return (
                    <MetricCard
                      key={metric.id}
                      title={metric.title}
                      value={metric.value}
                      icon={<IconComponent size={20} />}
                      iconColor={metric.iconColor}
                      bgColor={metric.bgColor}
                      borderColor={metric.borderColor}
                    />
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Stage Flow Visualization */}
        {!isMobile && (
          <StageFlow
            stages={stages}
            selectedStage={selectedStage}
            loading={isStagesLoading}
          />
        )}

        <div style={{
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
          padding: '0px 24px',
          boxShadow: '0 0 0 1px rgb(118 16 255 / 20%)',
          backgroundColor: '#f9f9ff',
          minHeight: '100px',
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
        <section className={`inplant-section ${isSectionExpanded ? 'expanded' : 'collapsed'}`}>
          {/* Header Section */}
          <DashboardHeader 
            searchQuery={searchQuery}
            onSearch={handleSearch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onCustomDateRangeChange={handleCustomDateRangeChange}
            filters={filters}
            onFiltersChange={handleFilterChange}
            isExpanded={isSectionExpanded}
            onToggleExpand={toggleSectionExpand}
            onExport={handleExport}
          />

          {isSectionExpanded && (
            <>
            <div>
          <div className="content-tabs">
            <div>
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
          <div className="stage-legends">
            <div className="legend-items stages-list">
              <div className="legend-item">
                <DoorOpen size={14} className="stage-icon" />
                <span className="legend-label">Entry Gate</span>
              </div>
              <div className="legend-item">
                <Scale size={14} className="stage-icon" />
                <span className="legend-label">Weighing In</span>
              </div>
              <div className="legend-item">
                <ArrowDownToLine size={14} className="stage-icon" />
                <span className="legend-label">Loading In</span>
              </div>
              <div className="legend-item">
                <ArrowUpFromLine size={14} className="stage-icon" />
                <span className="legend-label">Loading Out</span>
              </div>
              <div className="legend-item">
                <Weight size={14} className="stage-icon" />
                <span className="legend-label">Weighing Out</span>
              </div>
              <div className="legend-item">
                <PackageCheck size={14} className="stage-icon" />
                <span className="legend-label">Post Goods</span>
              </div>
              <div className="legend-item">
                <FileCheck size={14} className="stage-icon" />
                <span className="legend-label">Test Cert</span>
              </div>
              <div className="legend-item">
                <FileText size={14} className="stage-icon" />
                <span className="legend-label">Invoice</span>
              </div>
              <div className="legend-item">
                <LogOut size={14} className="stage-icon" />
                <span className="legend-label">Gate Out</span>
              </div>
            </div>
          </div>
          </div>



              {/* Content Area */}
              <div className={`content-area ${viewMode === 'map' ? 'map-view-container' : ''}`}>
                {viewMode === 'table' ? (
                  <VehicleTable
                    vehicles={vehicles}
                    selectedVehicle={selectedVehicle}
                    onVehicleSelect={handleVehicleSelect}
                    searchQuery={searchQuery}
                    selectedStage={selectedStage}
                    filters={{
                      status: filters.status,
                      stage: filters.stage,
                      timeRange: filters.timeRange
                    }}
                    loading={isVehiclesLoading}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    totalItems={totalCount}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                  />
                ) : (
                  <KeplerMapView
                    // vehicles={displayVehicles}
                    // selectedVehicle={selectedVehicle}
                    // onVehicleSelect={handleVehicleSelect}
                    // stages={displayStages}
                  />
                )}
              </div>
            </div>
          </>)}
          </section>
        </div>

        {/* Detail Panel */}
        <div className={`detail-panel-container ${selectedVehicle ? 'open' : ''}`}>
          {selectedVehicle && (
            <DetailPanel
              vehicle={selectedVehicle}
              onClose={handleClosePanelDetail}
              isOpen={!!selectedVehicle}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InPlantDashboard;