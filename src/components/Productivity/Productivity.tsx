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

type OpportunityMetric = "Percentage" | "Rupees" | "Tonnage"

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
    const [compareEnabled, setCompareEnabled] = useState(false)
    const [selectedMetric, setSelectedMetric] = useState<OpportunityMetric>("Percentage");
    const [overallStats, setOverallStats] = useState<OverallStats>(overallStatsObj);
    const [utilizationData, setUtilizationData] = useState<UtilizationData[]>(utilizationDataArr);

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
                        backgroundColor: '#ffffff', // Set background color using CSS
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                    },
                    filter,
                });

                // Create a download link and trigger the download
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'ETA Compliance.png';
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
            const response = await httpsPost('stats/productivity/vehicle_capacity_utilization', 1, router);
            if (response.statusCode === 200) {
                const data: any = response.data;
                console.log(data);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error:', err);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            getProductivityData();
        }
    }, [startDate, endDate]);

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
                                    checked={compareEnabled}
                                    onChange={(e) => setCompareEnabled(e.target.checked)}
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
                    </div>
                </header>

                <div className={styles.metricSelector}>
                    <p>Opportunity loss in :</p>
                    {(["Percentage", "Rupees", "Tonnage"] as const).map((metric) => (
                        <label key={metric} className={styles.radioGroup}>
                            <input
                                type="radio"
                                name="metric"
                                value={metric}
                                checked={selectedMetric === metric}
                                onChange={(e) => setSelectedMetric(e.target.value as OpportunityMetric)}
                                className={styles.radioInput}
                            />
                            {metric}
                        </label>
                    ))}
                </div>

                <div className={styles.mainContent}>
                    <div className={styles.chart}>
                        <div className={styles.bars}>
                            {utilizationData.map(({ facility, percentage, color }) => (
                                <div key={facility} className={styles.barContainer}>
                                    <div
                                        className={`${styles.bar} ${color === "danger" ? styles.danger : ""}`}
                                        style={{ height: `${percentage}%` }}
                                    />
                                    <span className={styles.barLabel}>{facility}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.statsContainer}>
                        <div className={styles.stats}>
                            <div className={styles.statsGrid}>
                                <div className={styles.statTitle}>
                                    Overall Statistics
                                </div>
                                <div className={styles.statItem}>
                                    <h3>{overallStats.utilizationPercentage}%</h3>
                                    <p>Avg vehicle capacity utilization</p>
                                </div>
                                <div className={styles.statItem}>
                                    <h3>₹{overallStats.opportunityLossRupees.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h3>
                                    <p>Opportunity Loss In Rupees</p>
                                </div>
                                <div className={styles.statItem}>
                                    <h3>{overallStats.opportunityLossTonnage} MT</h3>
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

