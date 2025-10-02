'use client';

import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Vehicle, StageInfo } from '../../InPlantDashboard';
import './MapView.css';

interface MapViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onVehicleSelect: (vehicle: Vehicle) => void;
  stages: StageInfo[];
}

interface PlantLocation {
  id: string;
  name: string;
  x: number; // percentage
  y: number; // percentage
  type: 'stage' | 'parking' | 'building';
  stageId?: string;
}

const MapView: React.FC<MapViewProps> = ({
  vehicles,
  selectedVehicle,
  onVehicleSelect,
  stages
}) => {
  const [hoveredVehicle, setHoveredVehicle] = useState<string | null>(null);

  // Mock plant layout - in real app this would come from API
  const plantLocations: PlantLocation[] = [
    { id: 'ext-parking', name: 'External Parking', x: 15, y: 20, type: 'parking', stageId: 'EXT_PARKING' },
    { id: 'entry-gate', name: 'Entry Gate', x: 30, y: 35, type: 'stage', stageId: 'ENTRY_GATE' },
    { id: 'weighbridge', name: 'Weighbridge', x: 45, y: 50, type: 'stage', stageId: 'WEIGHING' },
    { id: 'loading-bay-1', name: 'Loading Bay 1', x: 60, y: 30, type: 'stage', stageId: 'LOADING' },
    { id: 'loading-bay-2', name: 'Loading Bay 2', x: 65, y: 40, type: 'stage', stageId: 'LOADING' },
    { id: 'loading-bay-3', name: 'Loading Bay 3', x: 70, y: 50, type: 'stage', stageId: 'LOADING' },
    { id: 'weight-out', name: 'Weight Out', x: 80, y: 45, type: 'stage', stageId: 'WEIGHT_OUT' },
    { id: 'gate-out', name: 'Gate Out', x: 90, y: 60, type: 'stage', stageId: 'GATE_OUT' },
    { id: 'warehouse', name: 'Warehouse', x: 50, y: 70, type: 'building' },
    { id: 'office', name: 'Office Building', x: 20, y: 60, type: 'building' }
  ];

  const getVehiclePosition = (vehicle: Vehicle): { x: number; y: number } => {
    // Find the location based on current stage
    const location = plantLocations.find(loc => loc.stageId === vehicle.currentStage.stageId);
    if (location) {
      // Add some randomness for vehicles at the same stage
      const offset = parseInt(vehicle.id.slice(-1)) * 2;
      return {
        x: location.x + (offset % 5),
        y: location.y + (offset % 3)
      };
    }
    // Default position if stage not found
    return { x: 50, y: 50 };
  };

  const getVehicleStatusColor = (status: Vehicle['overallStatus']): string => {
    switch (status) {
      case 'on_track': return '#10B981';
      case 'at_risk': return '#F59E0B';
      case 'delayed': return '#DC2626';
      case 'completed': return '#6B7280';
      case 'on_hold': return '#111827';
      default: return '#3B82F6';
    }
  };

  const getStageColor = (stageId: string): string => {
    const stage = stages.find(s => s.stageId === stageId);
    if (!stage) return '#E5E7EB';

    switch (stage.healthStatus) {
      case 'normal': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#DC2626';
      default: return '#E5E7EB';
    }
  };

  return (
    <div className="map-view">
      <div className="map-header">
        <h3>Plant Layout - Live Vehicle Tracking</h3>
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#10B981' }}></div>
            <span>On Track</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#F59E0B' }}></div>
            <span>At Risk</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#DC2626' }}></div>
            <span>Delayed</span>
          </div>
        </div>
      </div>

      <div className="plant-map">
        {/* Plant Layout Background */}
        <div className="plant-background">
          <div className="road-network">
            {/* Main entry road */}
            <div className="road horizontal" style={{ top: '32%', left: '25%', width: '20%' }}></div>
            {/* Internal roads */}
            <div className="road vertical" style={{ left: '45%', top: '30%', height: '40%' }}></div>
            <div className="road horizontal" style={{ top: '47%', left: '45%', width: '40%' }}></div>
            {/* Exit road */}
            <div className="road horizontal" style={{ top: '57%', left: '80%', width: '15%' }}></div>
          </div>
        </div>

        {/* Plant Locations */}
        {plantLocations.map((location) => (
          <div
            key={location.id}
            className={`plant-location ${location.type}`}
            style={{
              left: `${location.x}%`,
              top: `${location.y}%`,
              borderColor: location.stageId ? getStageColor(location.stageId) : '#E5E7EB'
            }}
          >
            <div className="location-icon">
              {location.type === 'stage' ? <MapPin size={16} /> : <div className="building-icon" />}
            </div>
            <div className="location-label">{location.name}</div>
            {location.stageId && (
              <div className="location-count">
                {stages.find(s => s.stageId === location.stageId)?.vehicleCount || 0}
              </div>
            )}
          </div>
        ))}

        {/* Vehicles */}
        {vehicles.map((vehicle) => {
          const position = getVehiclePosition(vehicle);
          const isSelected = selectedVehicle?.id === vehicle.id;
          const isHovered = hoveredVehicle === vehicle.id;

          return (
            <div
              key={vehicle.id}
              className={`vehicle-marker ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                borderColor: getVehicleStatusColor(vehicle.overallStatus),
                backgroundColor: getVehicleStatusColor(vehicle.overallStatus)
              }}
              onClick={() => onVehicleSelect(vehicle)}
              onMouseEnter={() => setHoveredVehicle(vehicle.id)}
              onMouseLeave={() => setHoveredVehicle(null)}
            >
              <Truck size={14} color="white" />

              {/* Vehicle Tooltip */}
              {(isHovered || isSelected) && (
                <div className="vehicle-tooltip">
                  <div className="tooltip-header">
                    <span className="vehicle-number">{vehicle.vehicleNumber}</span>
                    <div className={`status-indicator ${vehicle.overallStatus}`}>
                      {vehicle.overallStatus === 'delayed' && <AlertTriangle size={12} />}
                      {vehicle.overallStatus.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <div className="tooltip-content">
                    <div className="tooltip-row">
                      <MapPin size={12} />
                      <span>{vehicle.currentStage.stageName}</span>
                    </div>
                    <div className="tooltip-row">
                      <Clock size={12} />
                      <span>
                        {Math.floor(vehicle.currentStage.duration / 60)}h {vehicle.currentStage.duration % 60}m
                        {vehicle.currentStage.duration > vehicle.currentStage.expectedDuration && (
                          <span className="delayed-text"> (Over expected)</span>
                        )}
                      </span>
                    </div>
                    <div className="tooltip-row">
                      <Truck size={12} />
                      <span>{vehicle.driver.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Vehicle Paths/Routes */}
        <svg className="path-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
          {vehicles.map((vehicle) => {
            const currentPos = getVehiclePosition(vehicle);
            const nextStageIndex = stages.findIndex(s => s.stageId === vehicle.currentStage.stageId) + 1;

            if (nextStageIndex < stages.length) {
              const nextStage = stages[nextStageIndex];
              const nextLocation = plantLocations.find(loc => loc.stageId === nextStage.stageId);

              if (nextLocation) {
                return (
                  <line
                    key={`path-${vehicle.id}`}
                    x1={currentPos.x}
                    y1={currentPos.y}
                    x2={nextLocation.x}
                    y2={nextLocation.y}
                    stroke={getVehicleStatusColor(vehicle.overallStatus)}
                    strokeWidth="0.2"
                    strokeDasharray="1,1"
                    opacity="0.6"
                  />
                );
              }
            }
            return null;
          })}
        </svg>
      </div>

      {/* Map Stats */}
      <div className="map-stats">
        <div className="stat-item">
          <span className="stat-label">Active Vehicles:</span>
          <span className="stat-value">{vehicles.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Delayed:</span>
          <span className="stat-value delayed">
            {vehicles.filter(v => v.overallStatus === 'delayed').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">On Track:</span>
          <span className="stat-value success">
            {vehicles.filter(v => v.overallStatus === 'on_track').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapView;