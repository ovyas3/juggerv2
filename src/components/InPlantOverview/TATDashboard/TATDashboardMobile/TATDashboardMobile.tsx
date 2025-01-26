"use client"

import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react"
import styles from "./TATDashboardMobile.module.css"

interface ShipmentData {
  materials: string
  noOfShipments: number
  [key: string]: any
}

const stagesWithLabels: any = {
  GI: "GI - TW",
  TW: "TW - GW",
  GW: "GW - PG",
  PG: "PG - TC",
  TC: "TC - IV",
  IV: "IV - EW",
  EW: "EW - GO",
  GO: "GI - GO",
}

const stagesWithArrows: any = {
  "GI-TW": "arrow_GITW",
  "TW-GW": "arrow_TWGW",
  "GW-PG": "arrow_GWPG",
  "PG-TC": "arrow_PGTC",
  "TC-IV": "arrow_TCIV",
  "IV-EW": "arrow_IVEW",
  "EW-GO": "arrow_EWGO",
  "GI-GO": "arrow_GIGO",
}

export default function TATDashboardMobile({ data }: { data: ShipmentData }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  }

  const getArrowDirection = (stage: string, item: any) => {
    console.log(stage, item, "stage, item");
    const arrowKey: any = Object.entries(stagesWithArrows).find(
        ([key]) => key.split("-")[0] === stage || key.split("-")[1] === stage,
    )?.[1]

    console.log(arrowKey, item[arrowKey], "arrowKey, item[arrowKey]");
    
    if (!arrowKey || !item[arrowKey]) return null

    const value = item[arrowKey]
    if (value === 0) return null

    return {
        direction: value > 0 ? "up" : "down",
        color: value > 0 ? "#ef4444" : "#22c55e",
    }
}

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>{data.materials}</h2>
          <p className={styles.subtitle}>No. of Shipments: {data.noOfShipments}</p>
        </div>
        {isExpanded ? <ChevronUpIcon className={styles.chevron} /> : <ChevronDownIcon className={styles.chevron} />}
      </div>

      <div className={`${styles.cardContent} ${isExpanded ? styles.expanded : ""}`}>
        <div className={styles.grid}>
          {Object.entries(stagesWithLabels).map(([stage, label]: [any, any]) => {
            const timeValue = formatTime(data[`${stage.toLowerCase()}Value`] || 0)
            const arrow = getArrowDirection(stage, data)
            const formattedTime = timeValue !== "00:00" ? timeValue : "00:00"

            return (
              <div key={stage} className={styles.gridItem}>
                <div className={styles.stageLabel}>{label}</div>
                <div className={styles.stageValue}>
                  {formattedTime !== "00:00" && arrow && (
                    <div className={styles.arrowWrapper}>
                      {arrow.direction === "up" ? (
                        <ArrowUpIcon className={styles.arrow} style={{ color: arrow.color }} />
                      ) : (
                        <ArrowDownIcon className={styles.arrow} style={{ color: arrow.color }} />
                      )}
                    </div>
                  )}
                  <span>{formattedTime}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

