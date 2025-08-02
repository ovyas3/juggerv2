import React from "react";
import styles from "./MetricCardSkeleton.module.css";
import { Card, CardContent } from "./card";

export function MetricCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <Card
            key={`summary-skeleton-${index}`}
            className={styles.skeletonCard}
          >
            <CardContent className={styles.skeletonContent}>
              <div className={styles.skeletonHeader}>
                <div className={styles.skeletonCircle}></div>
                <div className={styles.skeletonBar}></div>
              </div>
              <div className={styles.skeletonMainBar}></div>
              <div className={styles.skeletonFooter}>
                <div className={styles.skeletonDot}></div>
                <div className={`${styles.skeletonSmallBar} ${styles.bar25}`}></div>
                <div className={`${styles.skeletonSmallBar} ${styles.bar33}`}></div>
              </div>
            </CardContent>
          </Card>
        ))}
    </>
  );
}

export default MetricCardSkeleton;
