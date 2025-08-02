import React from "react";
import styles from "./MetricCard.module.css";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

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
        </div>
    </div>
  
  );
};

export default MetricCard;
