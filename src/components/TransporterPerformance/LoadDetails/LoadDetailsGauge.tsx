"use client"

import { PieChart, Pie, Cell } from "recharts"
import styles from "./LoadDetails.module.css"

interface GaugeChartProps {
  value: number
  total: string
  percentage: number
  title: string
  threshold: number
  isAllocated?: boolean
}

export default function GaugeChart({
  value,
  total,
  percentage,
  title,
  threshold,
  isAllocated = false,
}: GaugeChartProps) {
  const data = [
    { name: "below", value: threshold },
    { name: "above", value: 100 - threshold },
  ]

  const needleRotation = -90 + percentage * 1.8

  const getColors = () => {
    if (isAllocated) {
      return ["#4169E1", "#4169E1"]
    }
    return ["#ef4444", "#22c55e"]
  }

  return (
    <div className={styles.card}>
      <div className={styles.gaugeContainer}>
        <div className={styles.gaugeChart}>
          <PieChart width={192} height={96}>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={40}
              outerRadius={60}
              paddingAngle={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColors()[index]} />
              ))}
            </Pie>
          </PieChart>
        </div>

        <div className={styles.needle}>
          <div
            style={{
              transform: `rotate(${needleRotation}deg)`,
              transformOrigin: "center 100%",
              transition: "transform 0.5s ease-out",
            }}
          >
            <div className={styles.needleBase} />
            <div className={styles.needleBody}>
              <div className={styles.needleShape} />
              <div className={styles.needlePoint} />
            </div>
          </div>
        </div>

        <div className={styles.scale}>
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <div className={styles.labels}>
        <p className={styles.value}>{`${total}`}</p>
        <p className={styles.title}>{title}</p>
      </div>
    </div>
  )
}

