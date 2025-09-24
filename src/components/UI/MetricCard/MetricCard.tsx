import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import styles from "./MetricCard.module.css";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
  icon: React.ReactNode;
  bgColor?: string;
  borderColor?: string;
  tooltip?: string;
  iconColor?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend = "neutral",
  trendValue = 0,
  icon,
  iconColor,
  bgColor = "white",
  borderColor = "#e5e7eb",
  onClick,
}) => {
  const handleClick = () => {
    console.log(`MetricCard clicked - Title: ${title}`);
    console.log("onClick prop type:", typeof onClick);
    if (onClick) {
      console.log("Calling onClick handler");
      onClick();
    } else {
      console.log("No onClick handler provided");
    }
  };

  const getTrend = () => {
    if (trend === "neutral") {
      return (
        <span className={`${styles.trend} ${styles.trendNeutral}`}>
          -- {trendValue}%
        </span>
      );
    }
    const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
    const trendClass = trend === "up" ? styles.trendUp : styles.trendDown;

    return (
      <span className={`${styles.trend} ${trendClass}`}>
        <TrendIcon size={16} />
        {trendValue}%
      </span>
    );
  };

  console.log("MetricCard Props:", {
    title,
    value,
    trend,
    trendValue,
    icon,
    iconColor,
    bgColor,
    borderColor,
    onClick,
  });

  return (
    <div
      className={styles.card}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={handleClick}
    >
      <div className={styles.header}>
        <p className={styles.title}>{title}</p>
        <div className={styles.iconContainer} style={{ color: iconColor }}>
          {icon}
        </div>
      </div>
      <p className={styles.value}>{value}</p>
      {/* Uncomment if you want to show trend */}
      {/* <div>{getTrend()}</div> */}
    </div>
  );
};

export default MetricCard;
