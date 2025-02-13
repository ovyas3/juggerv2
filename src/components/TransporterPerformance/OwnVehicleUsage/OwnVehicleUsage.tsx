"use client"

import React, { useState, useRef, useEffect } from "react"
import styles from "./OwnVehicleUsage.module.css"
import { DateTime } from 'luxon'
import CustomDatePicker from '@/components/UI/CustomDatePicker/CustomDatePicker';
import { Box, Typography, IconButton } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackBar";
import { ThreeCircles } from "react-loader-spinner";
import service from "@/utils/timeService";
import Image from "next/image";
import { Select } from "antd";
import { Weight, Truck, Download, InfoIcon } from "lucide-react"
import { jsontocsv } from "@/utils/jsonToCsv";
import MobileOwnVehicleUsage from "./MobileOwnVehicleUsage/MobileOwnVehicleUsage";

interface OwnVsMarketData {
    name: string[]
    totalLoad: string
    market: string
    ownVehicle: string
    ownPercentage: number
    threshold: number
    totalVehicles: number
    ownVehicles: number
    marketVehicles: number
    ownVehiclesPercentage: number
}

const getColorClass = (percentage: number): string => {
    if (percentage >= 85 && percentage <= 100) {
        return styles.percentageGreen
    } else if (percentage >= 51 && percentage <= 84) {
        return styles.percentageOrange
    } else if (percentage < 50) {
        return styles.percentageRed
    }
    return ""
}

const getProgressBarClass = (percentage: number): string => {
    if (percentage >= 85 && percentage <= 100) {
        return styles.green
    } else if (percentage >= 51 && percentage <= 84) {
        return styles.orange
    } else if (percentage < 50) {
        return styles.red
    }
    return ""
}


export default function OwnVehicleUsage() {
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

    //Filter states
    const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
    const [selectedZone, setSelectedZone] = useState<string | null>(null);
    const [zonesWithStates, setZonesWithStates] = useState<any[]>([]);
    const [selectedStates, setSelectedStates] = useState<string[]>([]);
    const [carrierOptions, setCarrierOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [zoneOptions, setZoneOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [stateOptions, setStateOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [isLoadView, setIsLoadView] = useState(true)
    const [displayColumns, setDisplayColumns] = useState<string[]>([])

    //Data States
    const [ownVsMarketData, setOwnVsMarketData] = useState<OwnVsMarketData[]>([]);

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
    }

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
    }

    const getZonesData = async () => {
        try {
            const response = await httpsGet('zones/get/', 0, router);
            if (response?.statusCode === 200) {
                const { zones } = response.data;
                setZonesWithStates(zones);
                const zonesOpts = zones.map((zone: any) => ({
                    value: zone._id,
                    label: zone.zone,
                }));
                setZoneOptions(zonesOpts);
            }
        } catch (error) {
            console.error('Error fetching zones data:', error);
        }
    };

    const getCarriersData = async () => {
        try {
            const response = await httpsPost('stats/cr/getCarriers', {}, router, 1, false);
            if (response?.statusCode === 200) {
                const carriers = response.data;
                setCarrierOptions(carriers);
                const carriersOpts = carriers.map((carrier: any) => ({
                    value: carrier._id,
                    label: carrier.parent_name,
                }));
                setCarrierOptions(carriersOpts);
            }
        } catch (error) {
            console.error('Error fetching carriers data:', error);
        }
    };

    const handleSelectZone = (e: any) => {
        const id = e;
        setSelectedZone(e);
        const statesOpts = zonesWithStates.find((zone: any) => zone._id === id)?.lanes.map((lane: any) => ({
            value: lane._id,
            label: lane.name,
        }));
        setStateOptions(statesOpts);
        setSelectedStates([]);
    };

    const getOwnVehicleUsage = async (from: number, to: number) => {
        let payload: any = {
            from: from,
            to: to,
            state: []
        };

        if (selectedCarriers.length > 0) {
            payload.carriers = selectedCarriers;
        };

        if (selectedZone) {
            payload.zone = selectedZone;
            if (selectedStates.length === 0) {
                const stateNames = zonesWithStates.find((zone: any) => zone._id === selectedZone)?.lanes.map((lane: any) => lane.name);
                payload.state = stateNames;
            };
        };

        if (selectedStates.length > 0) {
            const stateNames = zonesWithStates.find((zone: any) => zone._id === selectedZone)?.lanes.filter((lane: any) => selectedStates.includes(lane._id)).map((lane: any) => lane.name);
            payload.state = stateNames;
        };

        try {
            setLoading(true);
            const response = await httpsPost('load/dashboard/ownvsmarket', payload, router, 1, false);
            if (response?.statusCode === 200) {
                const data = response.data.map((element: any) => ({
                    name: element.name,
                    totalLoad: element.total.toFixed(2),
                    market: element.market.toFixed(2),
                    ownVehicle: element.own.toFixed(2),
                    ownPercentage: Math.round((element.own / element.total) * 100),
                    totalVehicles: element.count,
                    ownVehicles: element.own_count,
                    marketVehicles: element.market_count,
                    ownVehiclesPercentage: Math.round((element.own_count / element.count) * 100),
                    shipments: element.shipments || '',
                    threshold: element.threshold || ''
                }));
                console.log(data, "data");
                setOwnVsMarketData(data);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error fetching material data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSelectedCarriers([]);
        setSelectedZone(null);
        setSelectedStates([]);
        setStartDate(oneWeekAgo);
        setEndDate(today);
    };

    const handleHitAPI = () => {
        if (startDate && endDate) {
            const newStartDate: any = service.millies(startDate);
            const newEndDate: any = service.millies(endDate);
            getOwnVehicleUsage(newStartDate, newEndDate);
        }
    };

    useEffect(() => {
        handleHitAPI();
    }, [startDate, endDate])

    useEffect(() => {
        getZonesData();
        getCarriersData();
    }, []);

    useEffect(() => {
        const columns = isLoadView
            ? ["Scorecard", "Carrier(s)", "Total Load (MT)", "Own Vehicle (MT)", "Market Vehicle (MT)", "Own Vehicle %"]
            : ["Scorecard", "Carrier(s)", "Total Vehicles", "Own Vehicles", "Market Vehicles", "Own Vehicles %"]
        setDisplayColumns(columns)
    }, [isLoadView])

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
            >
                {mobile && (
                    <h1 className={styles.title}>Own Vehicle Usage</h1>
                )}
                <div className={styles.header}>
                    <div className={styles.filterGroup}>
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
                        <Select
                            mode="multiple"
                            placeholder="Select Carriers"
                            value={selectedCarriers}
                            onChange={setSelectedCarriers}
                            options={carrierOptions}
                            className="w-full"
                            popupClassName="select-popup"
                            maxTagCount="responsive"
                            getPopupContainer={(trigger) => trigger.parentElement!}
                            size="large"
                        />
                        <Select
                            placeholder="Select Zone"
                            value={selectedZone}
                            onChange={(e: any) => {
                                handleSelectZone(e)
                            }}
                            options={zoneOptions}
                            className="w-full"
                            popupClassName="select-popup"
                            maxTagCount="responsive"
                            getPopupContainer={(trigger) => trigger.parentElement!}
                            size="large"
                        />
                        <Select
                            mode="multiple"
                            placeholder="Select States"
                            value={selectedStates}
                            onChange={setSelectedStates}
                            options={stateOptions}
                            className="w-full"
                            popupClassName="select-popup"
                            maxTagCount="responsive"
                            getPopupContainer={(trigger) => trigger.parentElement!}
                            size="large"
                        />
                    </div>
                    <div className={styles.buttonGroup}>
                        <div
                            className={styles.toggleWrapper}
                            onClick={() => setIsLoadView(!isLoadView)}
                            data-active={isLoadView ? "weight" : "truck"}
                        >
                            <div className={styles.toggleIcons}>
                                <Weight className={`${styles.icon} ${isLoadView ? styles.activeIcon : ""}`} />
                                <Truck className={`${styles.icon} ${!isLoadView ? styles.activeIcon : ""}`} />
                            </div>
                            <div className={`${styles.slider} ${!isLoadView ? styles.sliderRight : ""}`} />
                        </div>
                        <button className={styles.searchButton} onClick={() => {
                            handleHitAPI()
                        }}>
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
                                <path d="M10 2a8 8 0 1 0 5.29 14.71l4.38 4.38a1 1 0 0 0 1.42-1.42l-4.38-4.38A8 8 0 0 0 10 2z" />
                            </svg>
                            Search
                        </button>
                        {selectedCarriers.length > 0 || selectedZone || selectedStates.length > 0 ? (
                            <button className={styles.clearButton} onClick={handleClear}>
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
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        ) : <></>}
                    </div>
                </div>

                {mobile && (
                    <div className={styles.cardContainer}>
                        {ownVsMarketData.map((item, index) => (
                            <MobileOwnVehicleUsage key={index} data={item} isLoadView={isLoadView} />
                        ))}
                    </div>
                )}

                {!mobile && (
                    <div className={styles.contentWrapper}>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        {displayColumns.map((column) => (
                                            <th key={column} className={styles.th}>
                                                {column}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {ownVsMarketData.map((item, index) => {
                                        console.log(item.threshold, "item.threshold");
                                        return (
                                            <tr key={index}>
                                                <td className={styles.td}>
                                                    <div className={styles.progressContainer}>
                                                        <div
                                                            className={`${styles.progressBar} ${getProgressBarClass(isLoadView ? item.ownPercentage : item.ownVehiclesPercentage)}`}
                                                            style={{
                                                                width: `${isLoadView ? item.ownPercentage : item.ownVehiclesPercentage}%`,
                                                            }}
                                                        />
                                                        <div
                                                            className={styles.benchmark}
                                                            style={{
                                                                left: `${item.threshold}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className={styles.td}>{item.name[0]}</td>
                                                {isLoadView ? (
                                                    <>
                                                        <td className={styles.td}>{item.totalLoad}</td>
                                                        <td className={styles.td}>{item.ownVehicle}</td>
                                                        <td className={styles.td}>{item.market}</td>
                                                        <td className={styles.td}>
                                                            <span className={getColorClass(item.ownPercentage)}>{item.ownPercentage}%</span>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className={styles.td}>{item.totalVehicles}</td>
                                                        <td className={styles.td}>{item.ownVehicles}</td>
                                                        <td className={styles.td}>{item.marketVehicles}</td>
                                                        <td className={styles.td}>
                                                            <span className={getColorClass(item.ownVehiclesPercentage)}>{item.ownVehiclesPercentage}%</span>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/*  */}
                    </div>
                )}
            </div>
        </>
    );

};