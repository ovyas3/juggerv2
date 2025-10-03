import React from "react";
import styles from "./MetricCard.module.css";
import { ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, CheckCircle, Clock } from "lucide-react";

type HealthStatus = 'normal' | 'warning' | 'critical';

type MetricCardProps = {
  title: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
  icon: React.ReactNode;
  subText?: string;
  iconColor?: string;
  bgColor?: string;
  borderColor?: string;
  averageTime?: number;
  slaThreshold?: number;
  healthStatus?: HealthStatus;
};

const getStatusIcon = (status: HealthStatus) => {
  switch (status) {
    case 'normal':
      return <CheckCircle size={16} className={styles.statusIconNormal} />;
    case 'warning':
      return <AlertTriangle size={16} className={styles.statusIconWarning} />;
    case 'critical':
      return <AlertTriangle size={16} className={styles.statusIconCritical} />;
    default:
      return null;
  }
};

const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend = "neutral",
  trendValue = 0,
  icon,
  subText = "",
  iconColor,
  bgColor,
  borderColor,
  averageTime,
  slaThreshold,
  healthStatus = 'normal'
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className={styles.trendIconUp} />;
      case "down":
        return <ArrowDownRight className={styles.trendIconDown} />;
      default:
        return <Minus className={styles.trendIconNeutral} />;
    }
  };

  return (
    <div
        className={styles.metricCard}
        style={{
        backgroundColor: bgColor,
        // borderLeft: `4px solid ${borderColor}`,
        // borderRight: `1px solid ${borderColor}`,
        // borderTop: `1px solid ${borderColor}`,
        // borderBottom: `1px solid ${borderColor}`,
        border: `1px solid ${borderColor}`,
        }}
    >
        <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
            <div className={styles.icon} style={{ color: iconColor }}>
            {icon}
            </div>
            <span style={{ color: iconColor }} className={styles.title}>{title}</span>
            {healthStatus && (
            <div className={styles.statusIcon}>
              {getStatusIcon(healthStatus)}
            </div>
            )}
        </div>
        <div style={{ color: iconColor }} className={styles.value}>{value}</div>
        {/* <div  className={styles.trendRow}>
            {getTrendIcon()}
            <span
            className={`${styles.trendValue} ${
                trend === "up"
                ? styles.trendUp
                : trend === "down"
                ? styles.trendDown
                : styles.trendNeutral
            }`}
            style={{ color: iconColor }}
            >
            {trendValue}%
            </span>
            {subText && <span style={{ color: iconColor }} className={styles.subText}>{subText}</span>}
        </div> */}
          {averageTime !== undefined && slaThreshold !== undefined && (
            <div className={styles.timeInfo}>
              <div className={styles.timeRow}>
                <Clock size={14} className={styles.timeIcon} />
                <span className={styles.timeText}>
                  {formatTime(averageTime)} / {formatTime(slaThreshold)}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${styles[`progress${healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}`]}`}
                  style={{
                    width: `${Math.min(100, (averageTime / slaThreshold) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
          
          {subText && (
            <div style={{ color: iconColor }} className={styles.subText}>
              {subText}
            </div>
          )}
        </div>
    </div>
  
  );
};

export default MetricCard;
