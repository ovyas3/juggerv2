"use client"

import { useState, useEffect } from "react"
import styles from "./dispatchTrend.module.css"
import MaterialGraph from "./MaterialGraph"
import { useMediaQuery, useTheme } from '@mui/material';
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { jsontocsv } from "@/utils/jsonToCsv";
import {
    CalendarOutlined,
} from "@ant-design/icons";
import { DatePicker, Select } from "antd";
import { useSnackbar } from "@/hooks/snackBar";
import { ThreeCircles } from "react-loader-spinner";

const { RangePicker } = DatePicker;

const defaultDateRange: [Date | null, Date | null] = [
    new Date(new Date().setDate(new Date().getDate() - 7)),
    new Date(),
];
export default function DispatchTrend() {
    const router = useRouter();
    const { showMessage } = useSnackbar();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [dispatchData, setDispatchData] = useState([]);

    // Filter states
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(defaultDateRange);
    const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [selectedZone, setSelectedZone] = useState<string | null>(null);
    const [zonesWithStates, setZonesWithStates] = useState<any[]>([]);
    const [selectedStates, setSelectedStates] = useState<string[]>([]);
    const [carrierOptions, setCarrierOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [customerOptions, setCustomerOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [zoneOptions, setZoneOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [stateOptions, setStateOptions] = useState<   
        { value: string; label: string }[]    
    >([]);
    const [downloadData, setDownloadData] = useState<any>(null);

    // Count states
    const [dispatchCount, setDispatchCount] = useState({
        totalInvoicingOty: 0,
        totalCountOfGateEntry: 0,
        avergaeInvoicingPerDay: 0,
        avergaeGateEntryPerDay: 0,
    });

    const getMaterialData = async () => {
        setLoading(true);
        let payload: any = {
            from: dateRange[0],
            to: dateRange[1],
        };
        if (selectedCarriers.length > 0) {
            payload.transporters = selectedCarriers;
        };
        if (selectedCustomers.length > 0) {
            payload.customers = selectedCustomers;
        };
        if(selectedZone) {
            payload.zone = selectedZone;
            if(selectedStates.length === 0) {
                const states = zonesWithStates.find((zone: any) => zone._id === selectedZone)?.lanes.map((lane: any) => lane._id);
                payload.states = states;
            };
        };
        if(selectedStates.length > 0) {
            payload.states = selectedStates;
        };
        
        try {
            const response = await httpsPost('invoice/dispatchTrend', payload, router, 1, false);
            if (response?.statusCode === 200) {
                const { carriers, dispatchTrend, locations, shipments } = response.data;
                // Carrier Options
                if (carriers && carriers.length > 0) {
                    setCarrierOptions(carriers.map((carrier: any) => ({
                        value: carrier._id,
                        label: carrier.parent_name,
                    })));
                };
                // Customer Options
                if (locations && locations.length > 0) {
                    setCustomerOptions(locations.map((location: any) => ({
                        value: location._id,
                        label: location.name,
                    })));
                };
                // Dispatch Trend Data
                if (dispatchTrend && dispatchTrend.length > 0 && shipments > 0) {
                    setDispatchData(dispatchTrend);
                    const materials = Array.from(new Set(dispatchTrend.map((item: any) => item.material.name)));
                    const totalInvoicingOty = Math.round(dispatchTrend.reduce((acc: any, item: any) => acc + item.totalWeight, 0));
                    let uniqueDates = Array.from(new Set(dispatchTrend.map((item: any) => item.material.date)));
                    let numberOfDays = uniqueDates.length;
                    const shipmentsCount: number = shipments;
                    const avergaeInvoicingPerDay = Math.round(totalInvoicingOty / numberOfDays);
                    const avergaeGateEntryPerDay = Math.round(shipmentsCount / numberOfDays);
                    setDispatchCount({
                        totalInvoicingOty: totalInvoicingOty,
                        totalCountOfGateEntry: shipmentsCount,
                        avergaeInvoicingPerDay: avergaeInvoicingPerDay,
                        avergaeGateEntryPerDay: avergaeGateEntryPerDay,
                    });

                    const downloadData = dispatchTrend.map((series: any) => ({
                        name: Array.isArray(series.material.name)
                            ? series.material.name.join(", ")
                            : series.material.name,
                        [new Date(series.material.date).toLocaleDateString()]: series.total_weight,
                    }));

                    setDownloadData(downloadData);
                };
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error fetching material data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getZonesData = async () => {
        try {
            setLoading(true);
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
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error fetching zones data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getZonesData();
    }, []);

    useEffect(() => {
        getMaterialData();
    }, [dateRange]);

    const handleRefresh = () => {
        getMaterialData();
    };

    const handleDownload = () => {
        if (downloadData) {
            jsontocsv(
                downloadData,
                `dispatchTrendChartData${new Date().toLocaleString()}`,
                [
                    "name",
                    ...Object.keys(downloadData[0]).filter((key) => key !== "name"),
                ]
            );
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

    const handleClear = () => {
        setSelectedCarriers([]);
        setSelectedCustomers([]);
        setSelectedZone(null);
        setSelectedStates([]);
        setDateRange(defaultDateRange);
        getMaterialData();
    };

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
                    <h1 className={styles.title}>Trends</h1>
                )}
                <div className={styles.header}>
                    <div className={styles.filterGroup}>
                        <RangePicker
                            value={
                                dateRange.map((date) => (date ? dayjs(date) : null)) as [
                                    dayjs.Dayjs,
                                    dayjs.Dayjs
                                ]
                            }
                            onChange={(dates) => {
                                if (dates && dates[0] && dates[1]) {
                                    setDateRange([dates[0].toDate(), dates[1].toDate()]);
                                } else {
                                    setDateRange([null, null]);
                                }
                            }}
                            className="w-full"
                            suffixIcon={<CalendarOutlined />}
                            popupClassName="date-picker-popup"
                            getPopupContainer={(trigger) => trigger.parentElement!}
                            size="middle"
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
                            size="middle"
                        />
                        <Select
                            mode="multiple"
                            placeholder="Select Customers"
                            value={selectedCustomers}
                            onChange={setSelectedCustomers}
                            options={customerOptions}
                            className="w-full"
                            popupClassName="select-popup"
                            maxTagCount="responsive"
                            getPopupContainer={(trigger) => trigger.parentElement!}
                            size="middle"
                        />
                        {/* <Select
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
                            size="middle"
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
                            size="middle"
                        /> */}
                    </div>
                    <div className={styles.buttonGroup}>
                        <button className={styles.searchButton} onClick={() => {
                            getMaterialData();
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
                        {/* <button className={styles.downloadButton} disabled={!downloadData} onClick={handleDownload}>
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
                            Download
                        </button> */}
                        {selectedCarriers.length > 0 || selectedCustomers.length > 0 ||
                            dateRange[0]?.getTime() !== defaultDateRange[0]?.getTime() || dateRange[1]?.getTime() !== defaultDateRange[1]?.getTime() ? (
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
                        ) : null}
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

                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Invoicing Qty. (MT)</div>
                        <div className={styles.statValue}>
                            {dispatchCount.totalInvoicingOty}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Count of Gate Entry</div>
                        <div className={styles.statValue}>
                            {dispatchCount.totalCountOfGateEntry}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Average Invoicing / Day (MT)</div>
                        <div className={styles.statValue}>
                            {dispatchCount.avergaeInvoicingPerDay}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Average Gate Entry / Day</div>
                        <div className={styles.statValue}>
                            {dispatchCount.avergaeGateEntryPerDay}
                        </div>
                    </div>
                </div>

                <div className={styles.graphContainer}>
                    <MaterialGraph data={dispatchData} />
                </div>
            </div>
        </>
    )
}

