import type React from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
import styles from "./MobileOwnVehicleUsage.module.css"

interface VehicleData {
  name: string[]
  totalLoad: string
  market: string
  ownVehicle: string
  ownPercentage: number
  threshold: number
  totalVehicles: number
  ownVehicles: number
  marketVehicles: number
  ownVehiclesPercentage: number
}

interface VehicleUsageCardProps {
  data: VehicleData
  isLoadView: boolean
}

const getColorClass = (percentage: number): string => {
  if (percentage >= 85 && percentage <= 100) {
    return styles.green
  } else if (percentage >= 51 && percentage <= 84) {
    return styles.orange
  } else if (percentage < 50) {
    return styles.red
  }
  return ""
}

const MobileOwnVehicleUsage: React.FC<VehicleUsageCardProps> = ({ data, isLoadView }) => {
  const percentage = isLoadView ? data.ownPercentage : data.ownVehiclesPercentage
  const colorClass = getColorClass(percentage)

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{data.name[0]}</h2>
        <div className={`${styles.badge} ${colorClass}`}>
          {percentage}%
          {percentage >= data.threshold ? (
            <ArrowUp size={16} className={styles.icon} />
          ) : (
            <ArrowDown size={16} className={styles.icon} />
          )}
        </div>
      </div>
      <div className={styles.scorecard}>
        <div className={styles.progressContainer}>
          <div
            className={`${styles.progressBar} ${colorClass}`}
            style={{
              width: `${percentage}%`,
            }}
          />
          <div className={styles.benchmark} style={{ left: `${data.threshold}%` }} />
        </div>
      </div>
      <div className={styles.content}>
        {isLoadView ? (
          <>
            <div className={styles.row}>
              <span className={styles.label}>Total Load (MT)</span>
              <span className={styles.value}>{data.totalLoad}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Own Vehicle (MT)</span>
              <span className={styles.value}>{data.ownVehicle}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Market Vehicle (MT)</span>
              <span className={styles.value}>{data.market}</span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.row}>
              <span className={styles.label}>Total Vehicles</span>
              <span className={styles.value}>{data.totalVehicles}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Own Vehicles</span>
              <span className={styles.value}>{data.ownVehicles}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Market Vehicles</span>
              <span className={styles.value}>{data.marketVehicles}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MobileOwnVehicleUsage

