'use client';

import React,{useState} from 'react';
import { TrendingUp, TrendingDown, Minus , ChevronDown, ChevronUp} from 'lucide-react';
import { DashboardMetrics } from '../../InPlantDashboard';
import './MetricsBar.css';

interface MetricsBarProps {
  metrics: DashboardMetrics;
  loading?: boolean;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  status?: StatusType;
  loading?: boolean;
}

type StatusType = 'normal' | 'warning' | 'critical' | 'success';

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  trend = 0,
  trendLabel = '',
  status = 'normal',
  loading = false
}) => {
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp size={14} />;
    if (trend < 0) return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getTrendClass = () => {
    if (trend > 0) return 'trend-up';
    if (trend < 0) return 'trend-down';
    return 'trend-neutral';
  };

  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toString();
    }
    return val;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const displayValue = title.toLowerCase().includes('time') && typeof value === 'number'
    ? formatDuration(value)
    : `${formatValue(value)}${unit}`;

  return (
    <div className={`metric-card ${status} ${loading ? 'loading' : ''}`}>
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        {!loading && trend !== 0 && (
          <div className={`metric-trend ${getTrendClass()}`}>
            {getTrendIcon()}
            <span className="trend-value">
              {Math.abs(trend)}
              {trendLabel}
            </span>
          </div>
        )}
      </div>

      <div className="metric-value">
        {loading ? (
          <div className="metric-skeleton" />
        ) : (
          <span className="value-text">{displayValue}</span>
        )}
      </div>

      {!loading && (
        <div className="metric-footer">
          <span className="metric-subtitle">
            {trend > 0 ? 'Increase from yesterday' :
             trend < 0 ? 'Decrease from yesterday' :
             'No change from yesterday'}
          </span>
        </div>
      )}
    </div>
  );
};

const MetricsBar: React.FC<MetricsBarProps> = ({ metrics, loading = false }) => {
  const metricConfigs = [
    {
      title: 'Active Vehicles',
      value: metrics.activeVehicles,
      trend: metrics.trends.activeVehiclesTrend,
      status: (metrics.activeVehicles > 30 ? 'warning' : 'normal') as StatusType
    },
    {
      title: 'Average Time in Plant',
      value: metrics.averageProcessingTime,
      trend: metrics.trends.avgTimeTrend,
      trendLabel: 'm',
      status: (metrics.averageProcessingTime > 180 ? 'critical' :
              metrics.averageProcessingTime > 120 ? 'warning' : 'success') as StatusType
    },
    {
      title: 'Delayed Vehicles',
      value: metrics.delayedVehicles,
      trend: metrics.trends.delayedTrend,
      status: (metrics.delayedVehicles > 10 ? 'critical' :
              metrics.delayedVehicles > 5 ? 'warning' : 'normal') as StatusType
    },
    {
      title: 'Completed Today',
      value: metrics.completedToday,
      trend: metrics.trends.completedTrend,
      status: 'success' as StatusType
    }
  ];
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleCollapse = () => setIsExpanded(!isExpanded);
  return (
    <div className="metrics-bar">
   <button 
      className="collapse-toggle-btn" 
      onClick={toggleCollapse} 
      aria-expanded={isExpanded}
      aria-controls="metrics-container" // Assuming the metrics-bar is what is collapsed
    >
      {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
     
    </button>
    {isExpanded && (
      <>
      <div className="metrics-container">
        {metricConfigs.map((config, index) => (
          <MetricCard
            key={index}
            title={config.title}
            value={config.value}
            trend={config.trend}
            trendLabel={config.trendLabel}
            status={config.status}
            loading={loading}
          />
        ))}
      </div>

      {/* Live Update Indicator */}
      {!loading && (
        <div className="metrics-status">
          <div className="live-indicator">
            <div className="live-dot"></div>
            <span>Live</span>
          </div>
          <span className="last-update">
            Updated {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}
      </>)}
    </div>
  );
};

export default MetricsBar;
