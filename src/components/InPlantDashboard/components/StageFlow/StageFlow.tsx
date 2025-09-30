'use client';

import React from 'react';
import { ChevronRight, Clock, AlertTriangle, CheckCircle, Circle } from 'lucide-react';
import { StageInfo } from '../../InPlantDashboard';
import './StageFlow.css';

interface StageFlowProps {
  stages: StageInfo[];
  selectedStage: string | null;
  onStageSelect: (stageId: string) => void;
  loading?: boolean;
}

interface StageCardProps {
  stage: StageInfo;
  isSelected: boolean;
  isLast: boolean;
  onClick: () => void;
  loading?: boolean;
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  isSelected,
  isLast,
  onClick,
  loading = false
}) => {
  const getHealthIcon = () => {
    switch (stage.healthStatus) {
      case 'critical':
        return <AlertTriangle size={16} className="health-icon critical" />;
      case 'warning':
        return <AlertTriangle size={16} className="health-icon warning" />;
      case 'normal':
        return stage.vehicleCount > 0 ?
          <CheckCircle size={16} className="health-icon normal" /> :
          <Circle size={16} className="health-icon empty" />;
      default:
        return <Circle size={16} className="health-icon empty" />;
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getStatusColor = () => {
    switch (stage.healthStatus) {
      case 'critical': return 'var(--danger-red)';
      case 'warning': return 'var(--warning-amber)';
      case 'normal': return stage.vehicleCount > 0 ? 'var(--success-green)' : 'var(--neutral-gray)';
      default: return 'var(--neutral-gray)';
    }
  };

  return (
    <div className="stage-flow-item">
      <div
        className={`stage-card ${stage.healthStatus} ${isSelected ? 'selected' : ''} ${loading ? 'loading' : ''}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {/* Stage Header */}
        <div className="stage-header">
          <div className="stage-info">
            <h3 className="stage-name">{stage.stageName}</h3>
            <div className="stage-health">
              {getHealthIcon()}
            </div>
          </div>
          <div
            className="vehicle-count"
            style={{ color: getStatusColor() }}
          >
            {loading ? '...' : stage.vehicleCount}
          </div>
        </div>

        {/* Stage Metrics */}
        <div className="stage-metrics">
          <div className="metric-item">
            <Clock size={12} />
            <span className="metric-label">Avg Time:</span>
            <span className="metric-value">
              {loading ? '...' : formatTime(stage.averageTime)}
            </span>
          </div>

          {stage.vehicleCount > 0 && !loading && (
            <div className="metric-item">
              <span className="metric-label">SLA:</span>
              <span className={`sla-status ${stage.averageTime > stage.slaThreshold ? 'exceeded' : 'within'}`}>
                {stage.averageTime > stage.slaThreshold ? 'Exceeded' : 'Within'}
              </span>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {stage.vehicleCount > 0 && (
          <div className="stage-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min((stage.averageTime / stage.slaThreshold) * 100, 100)}%`,
                  backgroundColor: stage.averageTime > stage.slaThreshold ? 'var(--danger-red)' : 'var(--success-green)'
                }}
              />
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="stage-loading-overlay">
            <div className="loading-spinner" />
          </div>
        )}
      </div>

      {/* Arrow connector */}
      {!isLast && (
        <div className="stage-connector">
          <ChevronRight size={20} className="connector-arrow" />
        </div>
      )}
    </div>
  );
};

const StageFlow: React.FC<StageFlowProps> = ({
  stages,
  selectedStage,
  onStageSelect,
  loading = false
}) => {
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  const totalVehicles = stages.reduce((sum, stage) => sum + stage.vehicleCount, 0);
  const delayedStages = stages.filter(stage => stage.healthStatus === 'critical' || stage.healthStatus === 'warning').length;

  return (
    <div className="stage-flow">
      <div className="stage-flow-header">
        <div className="flow-title">
          <h2>Vehicle Flow</h2>
          <div className="flow-summary">
            <span className="total-vehicles">{totalVehicles} vehicles in plant</span>
            {delayedStages > 0 && (
              <span className="delayed-stages">
                {delayedStages} stage{delayedStages > 1 ? 's' : ''} delayed
              </span>
            )}
          </div>
        </div>

        {!loading && (
          <div className="flow-legend">
            <div className="legend-item">
              <CheckCircle size={14} className="legend-icon normal" />
              <span>Normal</span>
            </div>
            <div className="legend-item">
              <AlertTriangle size={14} className="legend-icon warning" />
              <span>At Risk</span>
            </div>
            <div className="legend-item">
              <AlertTriangle size={14} className="legend-icon critical" />
              <span>Delayed</span>
            </div>
            <div className="legend-item">
              <Circle size={14} className="legend-icon empty" />
              <span>Empty</span>
            </div>
          </div>
        )}
      </div>

      <div className="stage-flow-container">
        {sortedStages.map((stage, index) => (
          <StageCard
            key={stage.stageId}
            stage={stage}
            isSelected={selectedStage === stage.stageId}
            isLast={index === sortedStages.length - 1}
            onClick={() => onStageSelect(stage.stageId)}
            loading={loading}
          />
        ))}
      </div>

      {/* Stage selection info */}
      {selectedStage && !loading && (
        <div className="stage-selection-info">
          <span>
            Showing vehicles in: <strong>{stages.find(s => s.stageId === selectedStage)?.stageName}</strong>
          </span>
          <button
            onClick={() => onStageSelect('')}
            className="clear-selection"
          >
            Show All
          </button>
        </div>
      )}
    </div>
  );
};

export default StageFlow;