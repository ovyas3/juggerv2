"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { parse, format, differenceInDays, startOfWeek, startOfMonth } from "date-fns"
import styles from "./dispatchTrend.module.css"
import { Select } from "antd";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Material {
    totalWeight: number
    material: {
        name: string
        date: string
    }
}

interface MaterialGraphProps {
    data: Material[]
}

type TimeScale = "day" | "week" | "month"

const MaterialGraph: React.FC<MaterialGraphProps> = ({ data }) => {
    const [selectedMaterial, setSelectedMaterial] = useState<string>("All")
    const [selectedTimeScale, setSelectedTimeScale] = useState<TimeScale>("day")

    const sortedData = useMemo(
        () =>
            [...data].sort(
                (a, b) =>
                    parse(a.material.date, "dd-MM-yyyy", new Date()).getTime() -
                    parse(b.material.date, "dd-MM-yyyy", new Date()).getTime(),
            ),
        [data],
    )

    const uniqueMaterials = useMemo(() => ["All", ...Array.from(new Set(data.map((item) => item.material.name)))], [data])

    const { timeScales, groupedData, xAxisLabels } = useMemo(() => {
        const dates = sortedData.map((item) => parse(item.material.date, "dd-MM-yyyy", new Date()))
        const minDate = dates[0]
        const maxDate = dates[dates.length - 1]
        const daysDiff = differenceInDays(maxDate, minDate)

        const timeScales: TimeScale[] = ["day"]
        if (daysDiff > 7) timeScales.push("week")
        if (daysDiff > 28) timeScales.push("month")

        const groupingFunctions = {
            day: (date: Date) => date,
            week: (date: Date) => startOfWeek(date),
            month: (date: Date) => startOfMonth(date),
        }

        const formatStrings = {
            day: "MMM d",
            week: "'Week of' MMM d",
            month: "MMM yyyy",
        }

        const groupedData = sortedData.reduce(
            (acc, item) => {
                const date = parse(item.material.date, "dd-MM-yyyy", new Date())
                timeScales.forEach((scale) => {
                    const groupKey = format(groupingFunctions[scale](date), formatStrings[scale])
                    if (!acc[scale]) acc[scale] = {}
                    if (!acc[scale][groupKey]) acc[scale][groupKey] = {}
                    if (!acc[scale][groupKey][item.material.name]) acc[scale][groupKey][item.material.name] = 0
                    acc[scale][groupKey][item.material.name] += item.totalWeight
                })
                return acc
            },
            {} as Record<TimeScale, Record<string, Record<string, number>>>,
        )

        const xAxisLabels = {
            day: Object.keys(groupedData.day || {}),
            week: Object.keys(groupedData.week || {}),
            month: Object.keys(groupedData.month || {}),
        }

        return { timeScales, groupedData, xAxisLabels }
    }, [sortedData])

    const datasets = useMemo(
        () =>
            uniqueMaterials
                .filter((material) => material === "All" || selectedMaterial === "All" || material === selectedMaterial)
                .map((material) => {
                    if (material === "All") {
                        return {
                            label: "All Materials",
                            data: xAxisLabels[selectedTimeScale].map((label) =>
                                Object.values(groupedData[selectedTimeScale][label]).reduce((sum, weight) => sum + weight, 0),
                            ),
                            borderColor: "#000000",
                            backgroundColor: "#000000",
                            pointBackgroundColor: "#000000",
                            pointBorderColor: "#fff",
                            pointHoverBackgroundColor: "#fff",
                            pointHoverBorderColor: "#000000",
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            tension: 0.3,
                            borderWidth: 3,
                        }
                    }
                    const color = getColorForMaterial(material)
                    return {
                        label: material,
                        data: xAxisLabels[selectedTimeScale].map(
                            (label) => groupedData[selectedTimeScale][label][material] || null,
                        ),
                        borderColor: color,
                        backgroundColor: color,
                        pointBackgroundColor: color,
                        pointBorderColor: "#fff",
                        pointHoverBackgroundColor: "#fff",
                        pointHoverBorderColor: color,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        tension: 0.3,
                        borderWidth: 3,
                    }
                }),
        [uniqueMaterials, selectedMaterial, xAxisLabels, groupedData, selectedTimeScale],
    )

    const chartData = {
        labels: xAxisLabels[selectedTimeScale],
        datasets,
    }

    const options: ChartOptions<"line"> = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    padding: 20,
                },
            },
            tooltip: {
                mode: "index",
                intersect: false,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 12,
                },
                padding: 20,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: getXAxisTitle(selectedTimeScale),
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                },
                grid: {
                    display: false,
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Total Weight (MT)",
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                },
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    callback: (value) => {
                        return value.toLocaleString() // Format large numbers with commas
                    },
                },
                suggestedMin: 0,
                suggestedMax: (context: any) => {
                    const max = context.chart.data.datasets.reduce((max: any, dataset: any) => {
                        const dataMax = Math.max(...dataset.data.filter((v: any) => v !== null))
                        return dataMax > max ? dataMax : max
                    }, 0)
                    return Math.ceil(max * 1.1) // Add 10% padding to the top
                },
            },
        },
        interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false,
        },
    }

    return (
        <>
            <div className={styles.materialSelect}>
                <Select
                    style={{
                        width: 300
                    }}
                    placeholder="Select Materials"
                    value={selectedMaterial}
                    onChange={setSelectedMaterial}
                    options={uniqueMaterials.map((material) => ({ label: material, value: material }))}
                    className="w-full"
                    popupClassName="select-popup"
                    size="large"
                />
                <div className={styles.controls}>
                    <div className={styles.timeScaleToggle}>
                        {timeScales.map((scale) => (
                            <button
                                key={scale}
                                className={`${styles.toggleButton} ${selectedTimeScale === scale ? styles.active : ""}`}
                                onClick={() => setSelectedTimeScale(scale)}
                                disabled={!timeScales.includes(scale)}
                            >
                                {scale.charAt(0).toUpperCase() + scale.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className={styles.chartContainer}>
                <Line data={chartData} options={options} style={{ height: 500 }} />
            </div>
        </>
    )
}

const colorMapping = new Map<string, string>()

function getColorForMaterial(material: string): string {
    const colorsArray = [
        "#8b5cf6",
        "#ef4444",
        "#3b82f6",
        "#22c55e",
        "#f59e0b",
        "#ec4899",
        "#f97316",
        "#a855f7",
        "#34d399",
        "#fbbf24",
    ]

    if (!colorMapping.has(material)) {
        const index = colorMapping.size % colorsArray.length
        colorMapping.set(material, colorsArray[index])
    }

    return colorMapping.get(material) || colorsArray[Math.floor(Math.random() * colorsArray.length)]
}

function getXAxisTitle(timeScale: TimeScale): string {
    switch (timeScale) {
        case "day":
            return "Date"
        case "week":
            return "Week"
        case "month":
            return "Month"
    }
}

export default MaterialGraph

