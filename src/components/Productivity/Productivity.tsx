"use client"

import React, { useState, useRef, useEffect } from "react"
import styles from "./Productivity.module.css"
import { DateTime } from 'luxon'
import CustomDatePicker from '@/components/UI/CustomDatePicker/CustomDatePicker';
import { Box, Typography, IconButton } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackBar";
import { ThreeCircles } from "react-loader-spinner";
import service from "@/utils/timeService";
import { getCookie } from '@/utils/storageService';
import ScreenShotIcon from '@/assets/screenshot_icon.svg';
import { toPng } from 'html-to-image';
import Image from "next/image";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

interface UtilizationData {
    facility: string
    percentage: number
    color: "success" | "danger"
}

interface OverallStats {
    utilizationPercentage: number
    opportunityLossRupees: number
    opportunityLossTonnage: number
}

type OpportunityMetric = "percentage" | "rupees" | "tonnage"

const utilizationDataArr: UtilizationData[] = [
    { facility: "SPM", percentage: 95, color: "success" },
    { facility: "Plate Mill", percentage: 92, color: "success" },
    { facility: "Semis", percentage: 98, color: "success" },
    { facility: "SSD Raigarh", percentage: 52, color: "danger" },
    { facility: "Rail Mill", percentage: 96, color: "success" },
]

const overallStatsObj: OverallStats = {
    utilizationPercentage: 0,
    opportunityLossRupees: 0,
    opportunityLossTonnage: 0,
}

export default function Productivity() {
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
    const componentRef = useRef<HTMLDivElement>(null);

    // Data States
    const [xAxis, setXAxis] = useState<any[]>([]);
    const [series, setSeries] = useState<any[]>([]);
    const [pastSeries, setPastSeries] = useState<any[]>([]);
    const [utilizationData, setUtilizationData] = useState<any[]>([]);
    const [yAxisName, setYAxisName] = useState('Avg Capacity Utilization %');
    const [overallStats, setOverallStats] = useState<any>({});
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [compare, setCompare] = useState(false);
    const [pastUtilizationData, setPastUtilizationData] = useState<any[]>([]);
    const [oppurtunityType, setOppurtunityType] = useState('');
    const [currentData, setCurrentData] = useState<any[]>([]);
    const [pastData, setPastData] = useState<any[]>([]);

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
    }

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
    }

    const handleScreenshot = async () => {
        if (componentRef.current) {
            try {
                await document.fonts.load('12px "Plus Jakarta Sans"');

                const filter = (node: HTMLElement) => {
                    if (node.tagName === 'LINK' && node.getAttribute('href')?.includes('fonts.googleapis.com')) {
                        return false;
                    }
                    if (node.tagName === 'STYLE' && node.innerHTML.includes('@import url("https://fonts.googleapis.com')) {
                        return false;
                    }
                    return true;
                };

                const dataUrl = await toPng(componentRef.current, {
                    quality: 1,
                    style: {
                        backgroundColor: '#ffffff',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                    },
                    filter,
                });

                // Create a download link and trigger the download
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'vehicle_capacity_utilization.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Error taking screenshot:', error);
            }
        }
    };

    const getProductivityData = async () => {
        const payload: any = {
            from: DateTime.fromJSDate(startDate).startOf('day').toUTC(),
            to: DateTime.fromJSDate(endDate).endOf('day').toUTC(),
        };

        const a = payload.from;
        const b = payload.to;
        const diffInDays = Math.round(b.diff(a, 'days').toObject().days ?? 0);
        const past_from_date = a.minus({ days: diffInDays }).toJSDate();
        const new_past_from_date = DateTime.fromJSDate(past_from_date).endOf('day').toUTC();

        payload.past_from = new_past_from_date;
        payload.past_to = DateTime.fromJSDate(endDate).endOf('day').toUTC();

        try {
            setLoading(true);
            const response = await httpsPost('stats/productivity/vehicle_capacity_utilization', payload, router, 1, false);
            if (response.statusCode === 200) {
                console.log(response.data);
                const { currentData, pastData } = response.data[0];
                console.log(currentData, pastData);
                setCurrentData(currentData);
                setPastData(pastData);
                setUtilizationData(currentData);
                setPastUtilizationData(pastData);

                const xAxisData = currentData.map((r: any) => r._id).sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));
                setXAxis(xAxisData);

                const seriesData = currentData.map((r: any) => r.total_utilization_percentage);
                setSeries(seriesData);

                const pastSeriesData = pastData.map((r: any) => r.total_utilization_percentage);
                setPastSeries(pastSeriesData);

                const overallStats = calculateOverallStats(currentData);
                setOverallStats(overallStats);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error:', err);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const calculateOverallStats = (data: any[]) => {
        let vehicleCapUtilization = 0;
        let lossRupees = 0;
        let lossTonnage = 0;
        let noOfVeh = 0;

        data.forEach((r: any) => {
            vehicleCapUtilization += r.total_utilization_percentage * r.no_of_veh;
            lossRupees += r.total_rupees_loss;
            lossTonnage += r.total_tonnage_loss;
            noOfVeh += r.no_of_veh;
        });

        return {
            vehCapUtilization: vehicleCapUtilization / noOfVeh,
            lossRupees,
            lossTonnage,
        };
    };

    const downloadReport = () => {
        const records = utilizationData.map((u: any) => {
            if (yAxisName === 'Avg Capacity Utilization %') {
                return {
                    Plant: u._id,
                    'Avg Capacity Utilization %': u.total_utilization_percentage,
                };
            } else if (yAxisName === 'Oppurtunity Loss in Rupees ₹') {
                return {
                    Plant: u._id,
                    'Oppurtunity Loss in Rupees ₹': u.total_rupees_loss,
                };
            } else if (yAxisName === 'Oppurtunity Loss in Tonnage (MT)') {
                return {
                    Plant: u._id,
                    'Oppurtunity Loss in Tonnage (MT)': u.total_tonnage_loss,
                };
            } else if (yAxisName === 'Oppurtunity Loss in Percentage') {
                return {
                    Plant: u._id,
                    'Oppurtunity Loss in Percentage': u.total_loss_percentage,
                };
            }
            return null;
        });

        const headers = Object.keys(records[0] || {});
        const csvContent = [
            headers.join(','),
            ...records.map((r: any) => headers.map((h) => r[h]).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `VehicleCapacityUtilization - ${yAxisName} - ${DateTime.fromJSDate(startDate).toFormat('yyyy-MM-dd')} - ${DateTime.fromJSDate(endDate).toFormat('yyyy-MM-dd')}.csv`;
        link.click();
    };

    const loadOppurtunityLoss = (value: string) => {
        setOppurtunityType(value);
        setYAxisName(
            value === 'percentage'
                ? 'Opportunity loss in percentage %'
                : value === 'rupees'
                    ? 'Opportunity loss in rupees (₹)'
                    : 'Opportunity loss in tonnage (MT)'
        );

        // Rest of the logic remains the same
        const newSeries = currentData.map((u: any) => {
            if (value === 'percentage') return u.total_loss_percentage;
            if (value === 'rupees') return u.total_rupees_loss;
            if (value === 'tonnage') return u.total_tonnage_loss;
            return 0;
        });

        setSeries(newSeries);

        const updatedUtilizationData = currentData.map((u: any) => ({
            ...u,
            total_utilization_percentage: value === 'percentage' ? u.total_loss_percentage :
                value === 'rupees' ? u.total_rupees_loss :
                    value === 'tonnage' ? u.total_tonnage_loss : u.total_utilization_percentage,
        }));

        setUtilizationData(updatedUtilizationData);

        if (compare) {
            const pastSeriesData = pastData.map((u: any) => {
                if (value === 'percentage') return u.total_loss_percentage;
                if (value === 'rupees') return u.total_rupees_loss;
                if (value === 'tonnage') return u.total_tonnage_loss;
                return 0;
            });
            setPastSeries(pastSeriesData);

            const updatedPastUtilizationData = pastData.map((u: any) => ({
                ...u,
                total_utilization_percentage: value === 'percentage' ? u.total_loss_percentage :
                    value === 'rupees' ? u.total_rupees_loss :
                        value === 'tonnage' ? u.total_tonnage_loss : u.total_utilization_percentage,
            }));

            setPastUtilizationData(updatedPastUtilizationData);
        }
    };

    const clear = () => {
        setCompare(false); // Disable compare
        setOppurtunityType(''); // Clear opportunity type
        setSelectedValue(null); // Clear selected value
        setYAxisName('Avg Capacity Utilization %'); // Reset Y-axis name
        setSeries(currentData.map((r: any) => r.total_utilization_percentage)); // Reset series to initial data
        setUtilizationData(currentData); // Reset utilizationData to initial data
    };

    const toggleChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isCompareEnabled = event.target.checked;
        setCompare(isCompareEnabled);

        if (oppurtunityType) {
            loadOppurtunityLoss(oppurtunityType);
        } else {
            const currentSeries = currentData.map((r: any) => r.total_utilization_percentage);
            setSeries(currentSeries);

            if (isCompareEnabled) {
                const pastSeriesData = pastData.map((r: any) => r.total_utilization_percentage);
                setPastSeries(pastSeriesData);
            } else {
                setPastSeries([]); // Clear past series if compare is disabled
            }
        }
    };

    const getShortLabel = (label: string) => {
        if (label === 'Opportunity loss in rupees (₹)') return 'Opp. Loss in ₹';
        if (label === 'Opportunity loss in percentage %') return 'Opp. Loss in %';
        if (label === 'Opportunity loss in tonnage (MT)') return 'Opp. Loss in MT';
        return label;
    };

    useEffect(() => {
        if (compare) {
            const mergedData = currentData.map((current, index) => ({
                ...current,
                past_total_utilization_percentage: pastData[index]?.total_utilization_percentage || 0,
            }));
            setUtilizationData(mergedData);
        } else {
            setUtilizationData(currentData); // Revert to current data only
        }
    }, [compare, currentData, pastData]);

    useEffect(() => {
        if (startDate && endDate) {
            getProductivityData();
        }
    }, [startDate, endDate]);

    const handleRefresh = () => {
        setStartDate(oneWeekAgo);
        setEndDate(today);
        setCompare(false);
        setOppurtunityType('');
        setSelectedValue(null);
        setYAxisName('Avg Capacity Utilization %');
        setSeries(currentData.map((r: any) => r.total_utilization_percentage));
        setPastSeries([]);
    }

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
                style={{ margin: !mobile ? '56px 0 0 70px' : '0px' }}
                ref={componentRef}
            >
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Vehicle Capacity Utilization</h1>
                        <div className={styles.dateContainer}>
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
                        </div>
                    </div>

                    <div className={styles.actionContainer}>
                        <div className={styles.compareToggle}>
                            <label className={styles.toggleSwitch}>
                                <input
                                    type="checkbox"
                                    checked={compare}
                                    onChange={(e) => toggleChanged(e)}
                                    className={styles.toggleInput}
                                />
                                <span className={styles.slider}></span>
                            </label>
                            <span>Compare with previous period</span>
                        </div>
                        <IconButton onClick={handleScreenshot} style={{
                            padding: 0
                        }}>
                            <Image src={ScreenShotIcon} alt='Screenshot' />
                        </IconButton>
                        <div className={styles.buttonGroup}>
                            <button className={styles.downloadButton} onClick={downloadReport}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                            </button>
                            <button className={styles.refreshButton} onClick={handleRefresh}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                <div className={styles.metricSelector}>
                    <p>Opportunity loss in :</p>
                    {(["percentage", "rupees", "tonnage"] as const).map((metric) => (
                        <label key={metric} className={styles.radioGroup}>
                            <input
                                type="radio"
                                name={metric}
                                value={metric}
                                checked={selectedValue === metric}
                                onChange={(e) => {
                                    setSelectedValue(e.target.value as OpportunityMetric);
                                    loadOppurtunityLoss(e.target.value as OpportunityMetric);
                                }}
                                className={styles.radioInput}
                            />
                            {metric}
                        </label>
                    ))}
                    {selectedValue && (
                        <div className="label" style={{ color: '#ff0000', cursor: 'pointer' }} onClick={clear}>
                            Clear
                        </div>
                    )}
                </div>

                <div className={styles.mainContent}>
                    <div className={styles.chart}>
                        <ResponsiveContainer width="100%" height={500}>
                            <BarChart
                                data={utilizationData}
                                margin={{ left: 20, right: 20, top: 20, bottom: 30 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="_id"
                                    interval={0}
                                    angle={mobile ? -45 : 0}
                                    height={70}
                                    tick={{ fontSize: mobile ? 10 : 11 }}
                                />
                                <YAxis
                                    name={yAxisName}
                                    label={{
                                        value: getShortLabel(yAxisName),
                                        angle: -90,
                                        position: 'outsideLeft',
                                        offset: 40,
                                        style: { fill: '#42454E', fontSize: 12, fontWeight: 'bold' },
                                    }}
                                    tickFormatter={(value) => {
                                        if (yAxisName === 'Opportunity loss in rupees (₹)' && value >= 100000) {
                                            return `${(value / 100000).toFixed(1)}L`;
                                        }
                                        return value;
                                    }}
                                />
                                <Tooltip
                                    formatter={(value) => {
                                        if (yAxisName === 'Opportunity loss in rupees (₹)') {
                                            return `₹${value.toLocaleString('en-IN')}`;
                                        }
                                        return value;
                                    }}
                                />
                                <Bar dataKey="total_utilization_percentage" fill="#8884d8" name="Current" />
                                {compare && (
                                    <Bar dataKey="past_total_utilization_percentage" fill="#82ca9d" name="Past" />
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={styles.statsContainer}>
                        <div className={styles.stats}>
                            <div className={styles.statsGrid}>
                                <div className={styles.statTitle}>
                                    Overall Statistics
                                </div>
                                <div className={styles.statItem}>
                                    <h3>{overallStats.vehCapUtilization?.toFixed(2) || 0}%</h3>
                                    <p>Avg vehicle capacity utilization</p>
                                </div>
                                <div className={styles.statItem}>
                                    <h3>₹{overallStats.lossRupees?.toLocaleString() || 0}</h3>
                                    <p>Opportunity Loss In Rupees</p>
                                </div>
                                <div className={styles.statItem}>
                                    <h3>{overallStats.lossTonnage?.toFixed(2) || 0} MT</h3>
                                    <p>Opportunity Loss In Tonnage</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
