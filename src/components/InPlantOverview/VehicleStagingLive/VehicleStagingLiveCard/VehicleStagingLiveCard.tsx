import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import styles from "./VehicleStagingLiveCard.module.css"

interface VehicleStagingLiveCardProps {
  material: string
  data: {
    [key: string]: { count: number }
  }
}

export default function VehicleStagingLiveCard({ material, data }: VehicleStagingLiveCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => setIsExpanded(!isExpanded)

  const totalValue = Object.values(data).reduce((sum, { count }) => sum + count, 0)

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader} onClick={toggleExpand}>
        <div className={styles.materialInfo}>
          <h2 className={styles.cardTitle}>{material}</h2>
          <span className={styles.totalValue}>Total: {totalValue}</span>
        </div>
        {isExpanded ? <ChevronUp className={styles.expandIcon} /> : <ChevronDown className={styles.expandIcon} />}
      </div>
      {isExpanded && (
        <div className={styles.cardContent}>
          {Object.entries(data).map(([stage, { count }]) => (
            <div key={stage} className={styles.dataRow}>
              <span className={styles.dataLabel}>{stage}</span>
              <span className={styles.dataValue}>{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

