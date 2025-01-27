"use client"

import React, { useState, useRef, useEffect } from "react"
import styles from "./LoadDetails.module.css"
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
import LoadDetailsGaugeChart from "./LoadDetailsGauge";

const finalDataObj = {
    allocated: {
        bottomLabel: "0 MT",
        needleValue: 100,
        threshold: 100,
    },
    acceptance: {
        bottomLabel: "0 MT",
        needleValue: 0,
        threshold: 0,
    },
    registered: {
        bottomLabel: "0 MT",
        needleValue: 0,
        threshold: 0,
    },
    fulfilled: {
        bottomLabel: "0 MT",
        needleValue: 0,
        threshold: 0,
    },
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
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [zonesWithStates, setZonesWithStates] = useState<any[]>([]);
    const [carrierOptions, setCarrierOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [zoneOptions, setZoneOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [stateOptions, setStateOptions] = useState<
        { value: string; label: string }[]
    >([]);


    //Data States
    const [finalData, setFinalData] = useState<any>(finalDataObj);

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
                    value: zone.zone,
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

    const getOwnVehicleUsage = async (from: number, to: number) => {
        let payload: any = {
            from: from,
            to: to
        };

        if (selectedCarriers.length > 0) {
            payload.carriers = selectedCarriers;
        };

        if (selectedZone) {
            payload.zone = selectedZone;
        };

        if (selectedState) {
            payload.state = selectedState;
        };

        try {
            setLoading(true);
            const response = await httpsPost('load/dashboard/performance', payload, router, 1, false);
            if (response?.statusCode === 200) {
                const res = response.data;
                if (res && res.length > 0) {
                    const data = res[0];
                    //Allocated Data
                    const allocatedData = data?.dashboard1 && data?.dashboard1.length > 0 && data?.dashboard1[0]?.allocated || 0;
                    const allocatedPercentage = Math.round((allocatedData / allocatedData) * 100);
                    const allocatedValue = parseFloat(allocatedData.toFixed(2));

                    // Acceptance Data
                    const acceptedData = data?.dashboard1 && data?.dashboard1.length > 0 && data?.dashboard1[0]?.accepted || 0;
                    const acceptancePercentage = Math.round((acceptedData / allocatedData) * 100);
                    const acceptanceValue = parseFloat(acceptedData.toFixed(2));

                    // Rejected Data
                    const rejectedPercentage = parseFloat(data.rejectedPercentage?.toString() || '0');
                    const rejectedValue = parseFloat(data.rejectedActualValue?.toString() || '0');

                    // Registered Data
                    const registeredData = data?.dashboard1 && data?.dashboard1.length > 0 && data?.dashboard1[0]?.registered || 0;
                    const registeredPercentage = Math.round((registeredData / allocatedData) * 100);
                    const registeredValue = parseFloat(registeredData.toFixed(2));

                    // Fulfilled Data
                    const fulfilledData = data?.dashboard2 && data?.dashboard2.length > 0 && data?.dashboard2[0]?.load || 0;
                    const fulfilledPercentage = Math.round((fulfilledData / allocatedData) * 100);
                    const fulfilledValue = parseFloat(fulfilledData.toFixed(2));

                    const finalDataObj = {
                        allocated: {
                            bottomLabel: `${allocatedValue} MT | ${allocatedPercentage}%`,
                            needleValue: allocatedPercentage,
                            threshold: 100,
                        },
                        acceptance: {
                            bottomLabel: `${acceptanceValue} MT | ${acceptancePercentage}%`,
                            needleValue: acceptancePercentage,
                            threshold: data.threshold?.acceptance || 0,
                        },
                        registered: {
                            bottomLabel: `${registeredValue} MT | ${registeredPercentage}%`,
                            needleValue: registeredPercentage,
                            threshold: data.threshold?.registered || 0,
                        },
                        fulfilled: {
                            bottomLabel: `${fulfilledValue} MT | ${fulfilledPercentage}%`,
                            needleValue: fulfilledPercentage,
                            threshold: data.threshold?.fulfilled || 0,
                        },
                    };

                    setFinalData(finalDataObj);
                }
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error fetching material data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectZone = (e: any) => {
        const zone = e;
        setSelectedZone(e);
        const statesOpts = zonesWithStates.find((item: any) => item.zone === zone)?.lanes.map((lane: any) => ({
            value: lane._id,
            label: lane.name,
        }));
        setStateOptions(statesOpts);
    };

    const handleClear = () => {
        setSelectedCarriers([]);
        setSelectedZone(null);
        setSelectedState(null);
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
                    <h1 className={styles.containeTitle}>Load Details</h1>
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
                            onChange={(e) => {
                                handleSelectZone(e)
                            }}
                            options={zoneOptions}
                            className="w-full"
                            popupClassName="select-popup"
                            getPopupContainer={(trigger) => trigger.parentElement!}
                            size="large"
                        />
                        <Select
                            placeholder="Select State"
                            value={selectedState}
                            onChange={setSelectedState}
                            options={stateOptions}
                            className="w-full"
                            popupClassName="select-popup"
                            getPopupContainer={(trigger) => trigger.parentElement!}
                            size="large"
                        />
                    </div>
                    <div className={styles.buttonGroup}>
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
                        {selectedCarriers.length > 0 || selectedZone || selectedState ? (
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

                <div className={styles.containerGridGauge}>
                    <div className={styles.grid}>
                        <LoadDetailsGaugeChart
                            value={finalData.allocated.needleValue}
                            total={finalData.allocated.bottomLabel}
                            percentage={finalData.allocated.needleValue}
                            title="Allocated"
                            threshold={finalData.allocated.threshold}
                            isAllocated={true}
                        />
                        <LoadDetailsGaugeChart
                            value={finalData.acceptance.needleValue}
                            total={finalData.acceptance.bottomLabel}
                            percentage={finalData.acceptance.needleValue}
                            title="Acceptance"
                            threshold={finalData.acceptance.threshold}
                        />
                        <LoadDetailsGaugeChart
                            value={finalData.registered.needleValue}
                            total={finalData.registered.bottomLabel}
                            percentage={finalData.registered.needleValue}
                            title="Registered"
                            threshold={finalData.registered.threshold}
                        />
                        <LoadDetailsGaugeChart
                            value={finalData.fulfilled.needleValue}
                            total={finalData.fulfilled.bottomLabel}
                            percentage={finalData.fulfilled.needleValue}
                            title="Fulfilled"
                            threshold={finalData.fulfilled.threshold}
                        />
                    </div>
                </div>
            </div>
        </>
    );

};