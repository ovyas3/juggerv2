"use client"

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";
import { httpsGet } from "@/utils/Communication";
import './inPlantWagons.css';
import timeService from "@/utils/timeService";
import ScreenShotIcon from '@/assets/screenshot_icon.svg';
import { toPng } from 'html-to-image';
import { Box, Typography, IconButton } from '@mui/material';
import CustomDatePicker from '@/components/UI/CustomDatePicker/CustomDatePicker';
import Image from "next/image";

interface WagonData {
    _id: string
    indent: string
    edemand: string
    commodity: string
    wagonCount: number
    placement: string
    remainingFreeTime: string
    dcSlab: string
    timeElapsed: string
    dcCharges: number
}

const InPlantWagons = () => {
    const today: any = new Date();
    const oneDayAgo: any = new Date();
    oneDayAgo.setDate(today.getDate() - 1);
    const [startDate, setStartDate] = useState<any>(oneDayAgo);
    const [endDate, setEndDate] = useState<any>(today);

    const [loading, setLoading] = useState(true);
    const t = useTranslations("Dashboard");
    const router = useRouter();
    const [wagonData, setWagonData] = useState<WagonData[]>([]);
    const componentRef = useRef<HTMLDivElement>(null);

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
        handleDateChange(date, 'start');
    }

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
        handleDateChange(date, 'end');
    }

    const handleDateChange = (date: any, type: 'start' | 'end') => {
        if (date) {
            // Create a new Date object and set time to the start of the day
            const updatedDate = new Date(date);
            updatedDate.setHours(0, 0, 0, 0); // Set to 12:00 AM

            const updatedDateString = updatedDate.toISOString();
    
            const epochTime = timeService.millies(updatedDateString);
            const newStartDate: any = timeService.millies(startDate);
            const newEndDate: any = timeService.millies(endDate);
            
            if (type === 'start') {
                setStartDate(updatedDate);
                if (newEndDate >= epochTime) {
                    fetchWagonTableData(epochTime, newEndDate);
                }
            } else {
                setEndDate(updatedDate);
                if (newStartDate <= epochTime) {
                    fetchWagonTableData(newStartDate, epochTime);
                }
            }
        } else {
            if (type === 'start') {
                setStartDate(null);
            } else {
                setEndDate(null);
            }
        }
    };

    const fetchWagonTableData = async (from: number, to: number) => {
        try {
            setLoading(true);
            const response = await httpsGet(`dccharge/get?from=${from}&to=${to}`, 0, router);
            // const response = await httpsGet(`dccharge/get`, 0, router);
            if (response.statusCode === 200) {
                const data = response.data;
                const wagonDataArr = data && data.length > 0 && data.map((item: any) => {
                    let remainingFreeTime = '';
                    if (item.timeElapsed) {
                        const hours = Math.floor(item.elapsed_time / 60);
                        const minutes = item.elapsed_time % 60;
                        remainingFreeTime = `${hours.toString().padStart(2, '0')}: ${minutes.toString().padStart(2, '0')}`;
                    } else {
                        remainingFreeTime = '';
                    }

                    return {
                        _id: item._id,
                        indent: item.indent || '',
                        edemand: item.edemand || '',
                        commodity: item.commodity || '',
                        wagonCount: item.wagonCount || 0,
                        placement: item.placement || '',
                        remainingFreeTime: remainingFreeTime,
                        dcSlab: item.slab || '',
                        timeElapsed: item.timeElapsed || '',
                        dcCharges: item.dc_charges || 0
                    }
                });
                setWagonData(wagonDataArr);
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            const newStartDate = new Date(startDate);
            newStartDate.setHours(0, 0, 0, 0);

            const newEndDate = new Date(endDate);
            newEndDate.setHours(0, 0, 0, 0);

            const startDateString = newStartDate.toISOString();
            const endDateString = newEndDate.toISOString();

            const epochStartDate: any = timeService.millies(startDateString);
            const epochEndDate: any = timeService.millies(endDateString);

            console.log(epochStartDate, epochEndDate, "newStartDate, newEndDate");
            fetchWagonTableData(epochStartDate, epochEndDate);
        }
    }, [startDate, endDate]);

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

                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'In-Plant-Wagons.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Error taking screenshot:', error);
            }
        }
    };

    if (loading) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <ThreeCircles
              visible={true}
              height="100"
              width="100"
              color="#20114d"
              ariaLabel="three-circles-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        );
      }

    return (
        <main className="in-plant-wagons-main" ref={componentRef}>
            <Box
                className="commoditytable-header"
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}
            >
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                        color: '#2E2D32',
                        marginBottom: '16px',
                        letterSpacing: '1.54px',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        textTransform: 'uppercase',
                    }}>
                    In Plant Wagons
                </Typography>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <CustomDatePicker
                        label="From"
                        value={startDate}
                        onChange={handleStartDateChange}
                        maxDate={endDate}
                        defaultDate={oneDayAgo}
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
                    <IconButton onClick={handleScreenshot} style={{
                        padding: 0
                    }}>
                        <Image src={ScreenShotIcon} alt='Screenshot' />
                    </IconButton>
                </Box>
            </Box>

            <div className="in-plant-wagons-stats-grid">
                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">Yesterday</span>
                    <div className="in-plant-wagons-amount">
                        Rs.12L
                        <span className="in-plant-wagons-trend" data-trend="up">↑</span>
                    </div>
                </div>

                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">Today</span>
                    <div className="in-plant-wagons-amount">
                        Rs.3L
                        <span className="in-plant-wagons-trend" data-trend="up">↑</span>
                    </div>
                </div>

                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">Last month</span>
                    <div className="in-plant-wagons-amount">
                        Rs.15L
                        <span className="in-plant-wagons-trend" data-trend="down">↓</span>
                    </div>
                </div>

                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">This month</span>
                    <div className="in-plant-wagons-amount">
                        Rs.15L
                        <span className="in-plant-wagons-trend" data-trend="up">↑</span>
                    </div>
                </div>

                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">Last month This time</span>
                    <div className="in-plant-wagons-amount">
                        Rs.3L
                        <span className="in-plant-wagons-trend" data-trend="down">↓</span>
                    </div>
                </div>

                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">YTD</span>
                    <div className="in-plant-wagons-amount">
                        Rs.250L
                        <span className="in-plant-wagons-trend" data-trend="up">↑</span>
                    </div>
                </div>
            </div>

            <div className="in-plant-wagons-tableContainer">
                <table className="in-plant-wagons-table">
                    <thead>
                        <tr>
                            <th className="in-plant-wagons-id-column" style={{
                                width: '50px',
                            }}>#</th>
                            <th className="in-plant-wagons-id-column">
                                <span className="in-plant-wagons-id-column" style={{
                                    display: 'inline-block',
                                    paddingBottom: '4px'
                                }}>Indent #</span> <br />
                                <span className="in-plant-wagons-id-column">eDemand</span>
                            </th>
                            <th className="in-plant-wagons-id-column">
                                <span className="in-plant-wagons-id-column" style={{
                                    display: 'inline-block',
                                    paddingBottom: '4px'
                                }}>Commodity</span> <br />
                                <span className="in-plant-wagons-id-column">No. of Wagons</span>
                            </th>
                            <th className="in-plant-wagons-id-column">Placement Date Time</th>
                            <th className="in-plant-wagons-id-column">Remaining Free Time</th>
                            <th className="in-plant-wagons-id-column">DC Slab</th>
                            <th className="in-plant-wagons-id-column">Time elapsed beyond free time</th>
                            <th className="in-plant-wagons-id-column">DC Charges RS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wagonData && wagonData.length > 0 ?
                            wagonData.map((row: any, index: number) => (
                                <tr key={row._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block',
                                            paddingBottom: '4px'
                                        }}>{row.indent}</span> <br />
                                        <span>{row.edemand}</span>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block',
                                            paddingBottom: '4px'
                                        }}>{row.commodity}</span> <br />
                                        <span>{row.wagonCount || 0}</span>
                                    </td>
                                    <td>
                                        <span>{timeService.utcToist(row.placement, 'dd-MM-yyyy') || 'N/A'}</span> <br />
                                        <span>{timeService.utcToistTime(row.placement, 'HH:mm') || 'N/A'}</span>
                                    </td>
                                    <td>
                                        {row.remainingFreeTime}
                                    </td>
                                    <td>{row.dcSlab}</td>
                                    <td>{row.timeElapsed}</td>
                                    <td className={row.remainingFreeTime === '00:00' ? 'in-plant-wagons-charges' : ''}>{row.dcCharges.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center' }}>
                                        <div className="no-data-found">
                                            No data found
                                        </div>
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>
            </div>
        </main>
    );
};

export default InPlantWagons;