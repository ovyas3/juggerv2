'use client';

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';
import {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    LineController,
} from 'chart.js';
import { format } from 'date-fns';

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend
);

interface LineChartProps {
    data: Array<{
        name: string;
        res: Array<{
            date: string;
            total_weight: number;
        }>;
    }>;
}

export function LineChart({ data }: LineChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (!chartRef.current || !data?.length) return;

        // Destroy existing chart instance
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const xAxisLineData = data[0].res.map(e => format(new Date(e.date), 'MMM dd, yyyy'));

        const datasets = data.map((item, index) => ({
            label: Array.isArray(item.name) ? item.name.join(', ') : item.name,
            data: item.res.map(e => Math.round(e.total_weight)),
            borderColor: `hsl(${index * 137.5}, 70%, 50%)`,
            backgroundColor: `hsla(${index * 137.5}, 70%, 50%, 0.5)`,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
        }));

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xAxisLineData,
                datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 6,
                        },
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ${value.toLocaleString()} MT`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `${value} MT`,
                        },
                    },
                },
            },
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data]);

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
            <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}
