'use client';

import React, { useMemo } from 'react';
import { ChevronRight, Clock, AlertCircle, CheckCircle, Truck, User, Building } from 'lucide-react';
import { Vehicle } from '../../InPlantDashboard';
import './VehicleTable.css';

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
}

interface VehicleRowProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
}

const VehicleRow: React.FC<VehicleRowProps> = ({ vehicle, isSelected, onSelect }) => {
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
      {/* Status Indicator */}
      <td className="status-cell">
        {getStatusIcon()}
      </td>

      {/* Vehicle Number */}
      <td className="vehicle-cell">
        <div className="vehicle-info">
          <div className="vehicle-number">{vehicle.vehicleNumber}</div>
          <div className="vehicle-meta">
            <Truck size={12} />
            <span>{vehicle.shipmentId}</span>
          </div>
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
          <div className="time-label">Entry</div>
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
        <button className="action-btn" onClick={(e) => { e.stopPropagation(); /* Add action logic */ }}>
          ⋮
        </button>
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
  loading = false
}) => {
  const filteredVehicles = useMemo(() => {
    let filtered = [...vehicles];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(vehicle =>
        vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div className="table-header">
        <h3>Vehicles</h3>
        <div className="table-count">
          {filteredVehicles.length} of {vehicles.length} vehicles
        </div>
      </div>

      <div className="table-wrapper">
        <table className="vehicle-table">
          <thead>
            <tr>
              <th className="status-header">Status</th>
              <th className="vehicle-header">Vehicle</th>
              <th className="stage-header">Current Stage</th>
              <th className="time-header">Entry Time</th>
              <th className="duration-header">Duration</th>
              <th className="progress-header">Progress</th>
              <th className="company-header">Companies</th>
              <th className="actions-header">Actions</th>
              <th className="expand-header"></th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => (
              <VehicleRow
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedVehicle?.id === vehicle.id}
                onSelect={() => onVehicleSelect(vehicle)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="pagination-info">
          Showing {filteredVehicles.length} vehicles
        </div>
        <div className="auto-refresh-info">
          Auto-refresh: ON • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default VehicleTable;