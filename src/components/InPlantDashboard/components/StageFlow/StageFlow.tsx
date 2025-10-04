'use client';

import React,{useState} from 'react';
import { ChevronRight, Clock, AlertTriangle, CheckCircle, Circle , ChevronDown, ChevronUp} from 'lucide-react';
import MetricCard from '@/components/UI/MetricCard';
import MetricCardSkeleton from '@/components/UI/MetricCardSkeleton';
import { StageInfo } from '../../InPlantDashboard';
import './StageFlow.css';

interface StageFlowProps {
  stages: any[];
  selectedStage: string | null;
  onStageSelect: (stageId: string) => void;
  loading?: boolean;
}

interface StageCardProps {
  stage: any;
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
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleCollapse = () => setIsExpanded(!isExpanded);
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
        <div className="stage-header1">
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
  const [isExpanded, setIsExpanded] = useState(true);

  if (loading) {
    return (
      <div className="stage-flow-container">
        {Array(6).fill(0).map((_, index) => (
          <div key={`skeleton-${index}`} className="stage-metric-card">
            <MetricCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stage-flow">
      <div className="stage-flow-header">
        <div 
          className="flow-title"
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            padding: '0.5rem 0',
            width: '100%',
            justifyContent: 'space-between'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ margin: 0, marginRight: '0.5rem' }}>Vehicle Flow</h2>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {isExpanded && (
            <div className="flow-summary">
              <span className="total-vehicles">{sortedStages.reduce((sum, stage) => sum + stage.vehicleCount, 0)} vehicles in plant</span>
              {sortedStages.filter(stage => stage.healthStatus === 'critical' || stage.healthStatus === 'warning').length > 0 && (
                <span className="delayed-stages">
                  {sortedStages.filter(stage => stage.healthStatus === 'critical' || stage.healthStatus === 'warning').length} stage{sortedStages.filter(stage => stage.healthStatus === 'critical' || stage.healthStatus === 'warning').length > 1 ? 's' : ''} delayed
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <>
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
         <div className="stage-flow-container">
          {loading ? (
            <MetricCardSkeleton count={sortedStages.length || 6} />
          ) : (
            sortedStages.map((stage, index) => (
              <div 
                key={stage.id} 
                // className={`stage-metric-card ${selectedStage === stage.stageId ? 'selected' : ''}`}
                onClick={() => onStageSelect(stage.stageId)}
              >
                <MetricCard
                  title={stage.title}
                  value={stage.value}
                  subText={stage.subtitle}
                  icon={stage.icon}
                  iconColor={stage.iconColor}
                  bgColor={stage.bgColor}
                  borderColor={stage.borderColor}
                  averageTime={stage.averageTime}
                  slaThreshold={stage.slaThreshold}
                  healthStatus={stage.healthStatus}
                />
              </div>
            ))
          )}
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
        </>
      )}
    </div>
  );
};

export default StageFlow;
