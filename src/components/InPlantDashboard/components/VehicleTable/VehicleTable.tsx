'use client';

import React, { useMemo,useState,useRef,useEffect } from 'react';
import { ChevronRight, Clock, AlertCircle, CheckCircle, Truck, User, Building, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Vehicle } from '../../InPlantDashboard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../UI/select';
import './VehicleTable.css';
import AddRemarkModal from './AddRemarkModal';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';
interface VehicleTableProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onVehicleSelect: (vehicle: Vehicle) => void;
  searchQuery: string;
  selectedStage: string | null;
  filters: {
    status: string;
    stage: string;
    timeRange: string;
  };
  loading?: boolean;
  pageSize: number;
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

interface VehicleRowProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  onRemarkAdd: (vehicle: Vehicle) => void;
}

const VehicleRow: React.FC<VehicleRowProps> = ({ vehicle, isSelected, onSelect, index,onRemarkAdd  }) => {
  const getStatusIcon = () => {
    switch (vehicle.overallStatus) {
      case 'on_track':
        return <CheckCircle size={16} className="status-icon on-track" />;
      case 'at_risk':
        return <AlertCircle size={16} className="status-icon at-risk" />;
      case 'delayed':
        return <AlertCircle size={16} className="status-icon delayed" />;
      case 'completed':
        return <CheckCircle size={16} className="status-icon completed" />;
      case 'on_hold':
        return <AlertCircle size={16} className="status-icon on-hold" />;
      default:
        return <Clock size={16} className="status-icon default" />;
    }
  };
  const [showPopup, setShowPopup] = useState(false); 
 ;
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Check if the click occurred outside the popup and outside the action button
      if (
        actionButtonRef.current && 
        !actionButtonRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.action-popup') // Check if click is on the popup itself
      ) {
        setShowPopup(false);
      }
    };

    // Attach listener when the popup is open
    if (showPopup) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showPopup]);
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getProgressStages = () => {
    const allStages = ['EXT_PARKING', 'ENTRY_GATE', 'WEIGHING', 'LOADING', 'WEIGHT_OUT', 'GATE_OUT'];
    const currentIndex = allStages.indexOf(vehicle.currentStage.stageId);

    return allStages.map((stage, index) => ({
      id: stage,
      name: stage.replace('_', ' '),
      completed: vehicle.completedStages.includes(stage),
      current: stage === vehicle.currentStage.stageId,
      pending: index > currentIndex
    }));
  };

  const progressStages = getProgressStages();

  return (
    <tr
      className={`vehicle-row ${isSelected ? 'selected' : ''} ${vehicle.overallStatus}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* S.No */}
      <td className="sno-cell">{index}</td>

      {/* Status Indicator */}
      <td className="status-cell">
        {getStatusIcon()}
      </td>

      <td className="shipment-cell">
        <div className="shipment-info">
          <div className="shipment-meta">
            <span>{vehicle.shipmentId}</span>
          </div>
        </div>
      </td>

      {/* Vehicle Number */}
      <td className="vehicle-cell">
        <div className="vehicle-info">
          <div className="vehicle-number">{vehicle.vehicleNumber}</div>
        </div>
      </td>

      {/* Current Stage */}
      <td className="stage-cell">
        <div className="stage-info">
          <div className="stage-name">{vehicle.currentStage.stageName}</div>
          <div className="stage-location">{vehicle.currentStage.location}</div>
        </div>
      </td>

      {/* Entry Time */}
      <td className="time-cell">
        <div className="time-info">
          <div className="entry-time">{formatTime(vehicle.entryTime)}</div>
        </div>
      </td>

      {/* Duration */}
      <td className="duration-cell">
        <div className="duration-info">
          <div className={`duration-value ${vehicle.overallStatus}`}>
            {formatDuration(vehicle.totalDuration)}
          </div>
          <div className="duration-stage">
            Stage: {formatDuration(vehicle.currentStage.duration)}
          </div>
        </div>
      </td>

      {/* Progress */}
      <td className="progress-cell">
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${vehicle.progress}%`,
                backgroundColor: vehicle.overallStatus === 'delayed' ? 'var(--danger-red)' :
                               vehicle.overallStatus === 'at_risk' ? 'var(--warning-amber)' :
                               'var(--success-green)'
              }}
            />
          </div>
          <div className="progress-stages">
            {progressStages.map((stage, index) => (
              <div
                key={stage.id}
                className={`progress-stage ${stage.completed ? 'completed' : ''} ${stage.current ? 'current' : ''}`}
                title={stage.name}
              >
                {stage.completed ? '✓' : stage.current ? '→' : '○'}
              </div>
            ))}
          </div>
        </div>
      </td>

      {/* Shipper/Carrier */}
      <td className="company-cell">
        <div className="company-info">
          <div className="shipper">
            <Building size={12} />
            <span>{vehicle.shipper.name}</span>
          </div>
          <div className="carrier">
            <User size={12} />
            <span>{vehicle.carrier.name}</span>
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="actions-cell">
        <button className="action-btn" onClick={(e) => { e.stopPropagation();
             setShowPopup(!showPopup);  /* Add action logic */ }}>
          ⋮
        </button>
        {showPopup && (
            <div className="action-popup">
              <div 
                className="popup-item"
                onClick={(e) => {
                  e.stopPropagation();
                  // Logic for "Add Remark" goes here
                  onRemarkAdd(vehicle); 
                  setShowPopup(false); // Close after action
                }}
              >
                Add Remark
              </div>
            </div>
          )}
      </td>

      {/* Expand */}
      <td className="expand-cell">
        <ChevronRight size={16} className={`expand-icon ${isSelected ? 'expanded' : ''}`} />
      </td>
    </tr>
  );
};

const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  selectedVehicle,
  onVehicleSelect,
  searchQuery,
  selectedStage,
  filters,
  loading = false,
  pageSize,
  currentPage,
  totalItems,
  onPageChange,
  onPageSizeChange
}) => {
  const [remarkVehicle, setRemarkVehicle] = useState<Vehicle | null>(null);
  const handleOpenRemarkModal = (vehicle: Vehicle) => {
    setRemarkVehicle(vehicle);
  };

  const handleCloseRemarkModal = () => {
    setRemarkVehicle(null);
  }
  const filteredVehicles = useMemo(() => {
    let filtered = [...vehicles];
   
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        vehicle =>
          vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vehicle.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
          vehicle.shipmentId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Stage filter
    if (selectedStage) {
      filtered = filtered.filter(vehicle => vehicle.currentStage.stageId === selectedStage);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(vehicle => {
        switch (filters.status) {
          case 'active':
            return ['on_track', 'at_risk', 'delayed'].includes(vehicle.overallStatus);
          case 'delayed':
            return vehicle.overallStatus === 'delayed';
          case 'completed':
            return vehicle.overallStatus === 'completed';
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [vehicles, searchQuery, selectedStage, filters]);

  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = totalItems > 0 ? currentPage * pageSize + 1 : 0;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  const handlePageSizeChange = (size: number) => {
    // Reset to first page when changing page size
    onPageSizeChange(size);
    onPageChange(0);
  };

  if (loading) {
    return (
      <div className="vehicle-table-container">
        <div className="table-header">
          <h3>Vehicles</h3>
          <div className="table-count">Loading...</div>
        </div>
        <div className="loading-skeleton">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  if (filteredVehicles.length === 0) {
    return (
      <div className="vehicle-table-container">
        <div className="table-header">
          <h3>Vehicles</h3>
          <div className="table-count">0 vehicles</div>
        </div>
        <div className="empty-state">
          <Truck size={48} className="empty-icon" />
          <h4>No vehicles found</h4>
          <p>
            {searchQuery
              ? `No vehicles match "${searchQuery}"`
              : selectedStage
              ? 'No vehicles at selected stage'
              : 'No vehicles match the current filters'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-table-container">
      <div className="pagination-controls">
        <div className="pagination-left">
          <span className="results-count">
            Showing {startItem}-{endItem} of {totalItems} vehicles
          </span>
        </div>
        
        <div className="pagination-right">
          <div className="pagination-rows-per-page">
            <span className="rows-label">Rows per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="page-size-select">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent className="page-size-content">
                <SelectItem value="10" className="page-size-item">10</SelectItem>
                <SelectItem value="25" className="page-size-item">25</SelectItem>
                <SelectItem value="50" className="page-size-item">50</SelectItem>
                <SelectItem value="100" className="page-size-item">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pagination-buttons">
            <button
              className={`pagination-button ${currentPage === 0 ? 'disabled' : ''}`}
              onClick={() => onPageChange(0)}
              disabled={currentPage === 0}
              title="First page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              className={`pagination-button ${currentPage === 0 ? 'disabled' : ''}`}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="page-info">
              Page {currentPage + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              className={`pagination-button ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              className={`pagination-button ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}
              onClick={() => onPageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              title="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="vehicle-table">
          <thead>
            <tr>
              <th className="sno-header">S.No</th>
              <th className="status-header">Status</th>
              <th className="shipment-header">SIN</th>
              <th className="vehicle-header">Vehicle</th>
              <th className="stage-header">Current Stage</th>
              <th className="time-header">Gate In</th>
              <th className="duration-header">Duration</th>
              <th className="progress-header">Progress</th>
              <th className="company-header">Customer</th>
              <th className="actions-header">Actions</th>
              <th className="expand-header"></th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle, index) => (
              <VehicleRow
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedVehicle?.id === vehicle.id}
                onSelect={() => onVehicleSelect(vehicle)}
                index={startItem + index - 1}
                onRemarkAdd={handleOpenRemarkModal} 
              />
            ))}
         
          </tbody>
          {remarkVehicle && (
        <AddRemarkModal
          title="Add Remark"
          shipmentId={remarkVehicle.shipmentId}
          onClose={handleCloseRemarkModal}
        />
      )}
        </table>
      </div>
    </div>
  );
};

export default VehicleTable;