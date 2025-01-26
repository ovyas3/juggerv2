"use client"

import React, { useState, useEffect, useMemo } from "react"
import styles from './TATTrends.module.css'
import { DateTime } from 'luxon'
import CustomDatePicker from '@/components/UI/CustomDatePicker/CustomDatePicker';
import Box from '@mui/material/Box';
import { useMediaQuery, useTheme } from '@mui/material';
import { httpsGet } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackBar";
import { ThreeCircles } from "react-loader-spinner";
import service from "@/utils/timeService";
import { getCookie } from '@/utils/storageService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"
import { formatTime, getDateRange, aggregateData, getAggregatedLabels } from "./TATTrendsUtils"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

type ChartType = "line" | "bar"
type FilterPeriod = "day" | "week" | "month"

interface StageData {
    stage: string;
    res: Array<{
        date: string;
        average_duration: number;
    }>;
}

interface SeriesData {
    lineStyle: {
        width: number;
        color?: string;
    };
    type: string;
    smooth: boolean;
    name: string;
    data: number[];
    order?: number;
}

interface Payload {
    from_date: DateTime<true> | DateTime<false>;
    to_date: DateTime<true> | DateTime<false>;
}

export default function TATDashboard() {
    // Date States
    const today: any = new Date();
    const oneWeekAgo: any = new Date();
    oneWeekAgo.setDate(today.getDate() - 10);
    const [startDate, setStartDate] = useState<any>(oneWeekAgo);
    const [endDate, setEndDate] = useState<any>(today);
    const { convertMsToHM } = service;

    //Common States
    const router = useRouter();
    const { showMessage } = useSnackbar();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Data States
    const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
    const [xAxisLineData, setXAxisLineData] = useState<Date[]>([]);
    const [isJSPLRaigarh, setIsJSPLRaigarh] = useState<boolean>(true);

    // Graph States
    const [chartType, setChartType] = useState<ChartType>("line")
    const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("day")
    const [showWeekFilter, setShowWeekFilter] = useState<boolean>(false)
    const [showMonthFilter, setShowMonthFilter] = useState<boolean>(false)
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        const selectedShipper = getCookie("shipper_id");
        if (selectedShipper === "623c963e33526eee0419a399") {
            setIsJSPLRaigarh(false);
        } else {
            setIsJSPLRaigarh(true);
        }
    }, []);

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
    }

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
    }

    const loadInPlantTatGraph = async () => {
        const payload: Payload = {
            from_date: DateTime.fromJSDate(startDate).startOf('day').toUTC(),
            to_date: DateTime.fromJSDate(endDate).endOf('day').toUTC(),
        };

        try {
            setLoading(true);
            const response = await httpsGet(`stats/inPlantTAT/Graph?from_date=${payload.from_date}&to_date=${payload.to_date}`, 1, router);
            if (response.statusCode === 200) {
                const data: StageData[] = response.data;
                let localSeriesData: SeriesData[] = [];
                if (data.length) {
                    const sortedData = data.map(obj => ({
                        stage: obj.stage,
                        res: obj.res.sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
                    }));

                    const largestResArray = sortedData.reduce((max: any, obj: any) => obj.res.length > max.res.length ? obj : max, { res: [] });
                    const largestResArrayIndex = sortedData.findIndex(obj => obj.stage === largestResArray.stage);
                    const xAxisLineData = data[largestResArrayIndex].res.map(e => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime());
                    setXAxisLineData(xAxisLineData);

                    sortedData.forEach(e => {
                        const temp: SeriesData = {
                            lineStyle: { width: 3 },
                            type: 'line',
                            smooth: true,
                            name: e.stage,
                            data: e.res.map(ele => ele.average_duration),
                        };

                        switch (e.stage) {
                            case 'PO-GI': temp.lineStyle.color = '#ff4080'; temp.order = 1; break;
                            case 'GI-TW': temp.lineStyle.color = '#6280ff'; temp.order = 2; break;
                            case 'TW-GW': temp.lineStyle.color = '#57ca9e'; temp.order = 3; break;
                            case 'GW-PG': temp.lineStyle.color = '#ffa826'; temp.order = 4; break;
                            case 'PG-TC': temp.lineStyle.color = '#cf6780'; temp.order = 5; break;
                            case 'TC-IV': temp.lineStyle.color = '#7361c6'; temp.order = 6; break;
                            case 'IV-EW': temp.lineStyle.color = '#feea3f'; temp.order = 7; break;
                            case 'EW-GO': temp.lineStyle.color = '#26c5da'; temp.order = 8; break;
                            case 'GI-GO': temp.lineStyle.color = '#e75d7a'; temp.order = 9; break;
                        }

                        if (!isJSPLRaigarh || e.stage !== 'PO-GI') {
                            localSeriesData.push(temp);
                        }
                    });
                    setSeriesData(localSeriesData);
                }
            }
            setLoading(false);
        } catch (err) {
            console.error('Error:', err);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const options: ChartOptions<ChartType> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
        plugins: {
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    title: (context) => {
                        return context[0].label
                    },
                    label: (context) => {
                        return `${context.dataset.label}: ${formatTime(context.parsed.y)}`
                    },
                },
            },
            legend: {
                position: "top" as const,
                labels: {
                    boxWidth: 12,
                    padding: 10,
                },
            },
        },
        scales: {
            x: {
                type: "category",
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    autoSkip: false,
                    font: {
                        size: 10,
                    },
                },
                stacked: true,
            },
            y: {
                type: "linear",
                title: {
                    display: true,
                    text: "HH:MM",
                },
                ticks: {
                    callback: (value) => formatTime(value as number),
                    font: {
                        size: 10,
                    },
                },
                stacked: true,
            },
        },
    };

    useEffect(() => {
        if (startDate && endDate) {
            loadInPlantTatGraph();
        }
    }, [startDate, endDate]);

    useEffect(() => {
        if (xAxisLineData && xAxisLineData.length > 0 && seriesData && seriesData.length > 0) {
            const chartData: any = () => {
                const labels = xAxisLineData.map((date: any) => {
                    const isoDate = date instanceof Date ? date.toISOString() : date;
                    return DateTime.fromISO(isoDate).toFormat("MMM d, yyyy");
                });
                return {
                    labels,
                    datasets: seriesData.map((series) => ({
                        label: series.name,
                        data: series.data,
                        borderColor: series.lineStyle.color,
                        backgroundColor: series.lineStyle.color,
                        borderWidth: series.lineStyle.width,
                        tension: 0.4,
                    })),
                };
            };

            // const labels = getAggregatedLabels(filterPeriod)
            // return {
            //   labels,
            //   datasets: seriesData.map((series) => ({
            //     label: series.name,
            //     data: aggregateData(series.data, filterPeriod),
            //     borderColor: series.lineStyle.color,
            //     backgroundColor: series.lineStyle.color,
            //     borderWidth: series.lineStyle.width,
            //     tension: 0.4,
            //   })),
            // }

            const chartDataArr = chartData();
            setChartData(chartDataArr);

            const { daysDiff } = getDateRange(xAxisLineData)
            console.log(daysDiff, "daysDiff");
            setShowWeekFilter(daysDiff > 14)
            setShowMonthFilter(daysDiff > 49)
        } else {
            setChartData(null);
            setShowWeekFilter(false)
            setShowMonthFilter(false)
        }
    }, [xAxisLineData, seriesData, filterPeriod]);

    useEffect(() => {
        console.log(showMonthFilter, "showMonthFilter");
        console.log(showWeekFilter, "showWeekFilter");
    }, [showMonthFilter, showWeekFilter])

    return (
        <>
            {/* Loader */}
            {loading && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', position: 'absolute', width: '100vw', background: 'white', zIndex: 100, opacity: 0.5 }}>
                <ThreeCircles
                    visible={true}
                    height="100"
                    width="100"
                    color="#20114d"
                    ariaLabel="three-circles-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                />
            </div>}
            <div
                className={styles.container}
                style={{ margin: !mobile ? '56px 0 0 70px' : '0px' }}>
                {mobile && (
                    <h1 className={styles.title}>TAT Dashboard</h1>
                )}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 2,
                    width: !mobile ? '30%' : '100%',
                }}>
                    <CustomDatePicker
                        label="From"
                        value={startDate}
                        onChange={handleStartDateChange}
                        maxDate={endDate}
                        defaultDate={oneWeekAgo}
                        maxSelectableDate={today}
                    />
                    <CustomDatePicker
                        label="To"
                        value={endDate}
                        onChange={handleEndDateChange}
                        minDate={startDate}
                        defaultDate={today}
                        minSelectableDate={startDate}
                    />
                </Box>

                <div className={styles.chartContainer}>
                    <div className={styles.controls}>
                        <div className={styles.chartTypeToggle}>
                            <button
                                className={`${styles.toggleButton} ${chartType === "line" ? styles.active : ""}`}
                                onClick={() => setChartType("line")}
                            >
                                Line
                            </button>
                            <button
                                className={`${styles.toggleButton} ${chartType === "bar" ? styles.active : ""}`}
                                onClick={() => setChartType("bar")}
                            >
                                Bar
                            </button>
                        </div>
                        <div className={styles.filterToggle}>
                            <button
                                className={`${styles.toggleButton} ${filterPeriod === "day" ? styles.active : ""}`}
                                onClick={() => setFilterPeriod("day")}
                            >
                                Day
                            </button>
                            {showWeekFilter && (
                                <button
                                    className={`${styles.toggleButton} ${filterPeriod === "week" ? styles.active : ""}`}
                                    onClick={() => setFilterPeriod("week")}
                                >
                                    Week
                                </button>
                            )}
                            {showMonthFilter && (
                                <button
                                    className={`${styles.toggleButton} ${filterPeriod === "month" ? styles.active : ""}`}
                                    onClick={() => setFilterPeriod("month")}
                                >
                                    Month
                                </button>
                            )}
                        </div>
                    </div>
                    <div className={styles.chartWrapper}>
                        {chartData ? (
                            chartType === "line" ? (
                                <Line options={options} data={chartData} />
                            ) : (
                                <Bar options={options} data={chartData} />
                            )
                        ) : (
                            <p>No data available for the chart.</p>
                        )}
                    </div>
                </div>
            </div>

        </>
    )
}