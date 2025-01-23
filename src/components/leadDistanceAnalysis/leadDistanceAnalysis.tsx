'use client'

import { useState, useCallback } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { ScatterChart, Scatter, CartesianGrid, Tooltip } from 'recharts'
import styles from './leadDistanceAnalysis.module.css';
import { useMediaQuery, useTheme } from '@mui/material';

// Mock data for distance slabs
const distanceSlabData = [
    { slab: '0-25 km', orderCount: 150 },
    { slab: '25-50 km', orderCount: 100 },
    { slab: '50-75 km', orderCount: 80 },
    { slab: '75-100 km', orderCount: 50 },
    { slab: '100+ km', orderCount: 20 },
]

// Mock data for individual orders
const orderData = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    distance: Math.random() * 150,
    volume: Math.floor(Math.random() * 100) + 1,
}))

export default function LeadDistanceAnalysis() {
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedSlab, setSelectedSlab] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleBarClick = useCallback((data: any) => {
        setSelectedSlab(data)
        setIsModalOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        setIsModalOpen(false)
    }, [])

    // Custom tooltip formatter for better mobile display
    const tooltipFormatter = (value: number, name: string) => {
        if (name === 'orderCount') return [`${value} orders`, 'Orders']
        return [value, name]
    }

    return (
        <div 
            className={styles.container}
            style={{ margin: !mobile ? '56px 0 0 70px' : '0px' }}
        >
            {/* <h1 className={styles.title}>Lead (Distance) Analysis</h1> */}
            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Order Volume by Distance Slabs</h2>
                        <p className={styles.cardDescription}>Click on a bar to see detailed metrics</p>
                    </div>
                    <div className={styles.cardContent}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={distanceSlabData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                            >
                                <XAxis
                                    dataKey="slab"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={0}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    formatter={tooltipFormatter}
                                    cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }}
                                />
                                <Bar
                                    dataKey="orderCount"
                                    fill="#8884d8"
                                    onClick={handleBarClick}
                                    cursor="pointer"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Lead Distance vs. Order Volume</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <ResponsiveContainer width="100%" height={250}>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                    dataKey="distance"
                                    name="Distance"
                                    unit="km"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="volume"
                                    name="Volume"
                                    unit="units"
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{ fontSize: '12px' }}
                                />
                                <Scatter
                                    name="Orders"
                                    data={orderData}
                                    fill="#8884d8"
                                    shape="circle"
                                    strokeWidth={1}
                                />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {isModalOpen && selectedSlab && (
                <div
                    className={styles.modal}
                    onClick={closeModal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div
                        className={styles.modalContent}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle} id="modal-title">
                                Detailed Metrics for {selectedSlab.slab}
                            </h3>
                            <p className={styles.modalDescription}>
                                Here are the detailed metrics for the selected distance slab.
                            </p>
                        </div>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Total Orders</td>
                                    <td>{selectedSlab.orderCount}</td>
                                </tr>
                                <tr>
                                    <td>Average Order Value</td>
                                    <td>${(Math.random() * 100 + 50).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Conversion Rate</td>
                                    <td>{(Math.random() * 10 + 5).toFixed(2)}%</td>
                                </tr>
                            </tbody>
                        </table>
                        <button
                            className={styles.button}
                            onClick={closeModal}
                            aria-label="Close modal"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

