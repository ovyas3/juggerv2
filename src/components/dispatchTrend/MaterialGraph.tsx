"use client"

import type React from "react"
import { useState } from "react"
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
import { parse, format } from "date-fns"

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

const MaterialGraph: React.FC<MaterialGraphProps> = ({ data }) => {
    const sortedData = [...data].sort(
        (a, b) =>
            parse(a.material.date, "dd-MM-yyyy", new Date()).getTime() -
            parse(b.material.date, "dd-MM-yyyy", new Date()).getTime(),
    )

    const uniqueMaterials = Array.from(new Set(data.map((item) => item.material.name)))
    const uniqueDates = Array.from(new Set(sortedData.map((item) => item.material.date)))

    const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set(uniqueMaterials))

    const toggleMaterial = (material: string) => {
        setSelectedMaterials((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(material)) {
                newSet.delete(material)
            } else {
                newSet.add(material)
            }
            return newSet
        })
    }

    const toggleAll = () => {
        if (selectedMaterials.size === uniqueMaterials.length) {
            setSelectedMaterials(new Set())
        } else {
            setSelectedMaterials(new Set(uniqueMaterials))
        }
    }

    const datasets = uniqueMaterials
        .filter((material) => selectedMaterials.has(material))
        .map((material) => {
            const color = getColorForMaterial(material)
            return {
                label: material,
                data: uniqueDates.map((date) => {
                    const dataPoint = sortedData.find((item) => item.material.name === material && item.material.date === date)
                    return dataPoint ? dataPoint.totalWeight : null
                }),
                borderColor: color,
                backgroundColor: color,
                pointBackgroundColor: color,
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: color,
                pointRadius: 6,
                pointHoverRadius: 8,
                tension: 0.3,
            }
        })

    const chartData = {
        labels: uniqueDates.map((date) => format(parse(date, "dd-MM-yyyy", new Date()), "MMM d")),
        datasets,
    }
    const options: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
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
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Date",
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
        <div style={{ width: "100%", height: "500px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "20px" }}>
                <button
                    onClick={toggleAll}
                    style={{
                        padding: "5px 10px",
                        marginRight: "10px",
                        backgroundColor: selectedMaterials.size === uniqueMaterials.length ? "#4CAF50" : "#f1f1f1",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    {selectedMaterials.size == uniqueMaterials.length ? "Unselect All" : "Select All"}
                </button>
                {uniqueMaterials.map((material) => (
                    <button
                        key={material}
                        onClick={() => toggleMaterial(material)}
                        style={{
                            padding: "5px 10px",
                            marginRight: "5px",
                            backgroundColor: selectedMaterials.has(material) ? getColorForMaterial(material) : "#f1f1f1",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            color: selectedMaterials.has(material) ? "#ffffff" : "#000000",
                        }}
                    >
                        {material}
                    </button>
                ))}
            </div>
            <Line data={chartData} options={options} />
        </div>
    )
}

function getColorForMaterial(material: string): string {
    const colors = {
        "Bar Mill": "#8b5cf6",
        "Cold Roll F Mill": "#ef4444",
        "Hot Coil Mill": "#3b82f6",
        "Plate Mill": "#22c55e",
        "Semis-PQ Bay": "#f59e0b",
        "Prefabrication Plant": "#ec4899",
    }
    return colors[material as keyof typeof colors] || "#000000"
}

export default MaterialGraph
