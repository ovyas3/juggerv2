import React from "react";
import styles from "./MetricCard.module.css";

interface MetricCardSkeletonProps {
  count?: number;
}

export const MetricCardSkeleton: React.FC<MetricCardSkeletonProps> = ({ count = 4 }) => {
  return (
    <>
      {Array(count).fill(0).map((_, index) => (
        <div key={`summary-skeleton-${index}`} className={styles.skeletonCard}>
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonIcon}></div>
            <div className={styles.skeletonTitle}></div>
          </div>
          <div className={styles.skeletonValue}></div>
          <div className={styles.skeletonTrend}>
            <div className={styles.skeletonTrendDot}></div>
            <div className={styles.skeletonTrendText}></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default MetricCardSkeleton;