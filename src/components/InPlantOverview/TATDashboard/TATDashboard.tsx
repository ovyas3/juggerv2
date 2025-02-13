"use client"

import React, { useState, useEffect } from "react"
import styles from './TATDashboard.module.css'
import { DateTime } from 'luxon'
import CustomDatePicker from '@/components/UI/CustomDatePicker/CustomDatePicker';
import Box from '@mui/material/Box';
import { useMediaQuery, useTheme } from '@mui/material';
import { httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackBar";
import { ThreeCircles } from "react-loader-spinner";
import service from "@/utils/timeService";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { getCookie } from '@/utils/storageService';
import TATDashboardMobile from "./TATDashboardMobile/TATDashboardMobile";

interface InPlantTatData {
    materials: string;
    noOfShipments: number;
    PO: string;
    GI: string;
    TW: string;
    GW: string;
    PG: string;
    TC: string;
    IV: string;
    EW: string;
    GO: string;
    poValue: number;
    giValue: number;
    twValue: number;
    gwValue: number;
    pgValue: number;
    tcValue: number;
    ivValue: number;
    ewValue: number;
    goValue: number;
    ids: string[];
    threshhold_value: any[];
    arrowUporDown: any[];
    arrow_GIGO?: number;
    arrow_TWGW?: number;
    arrow_GITW?: number;
    arrow_IVEW?: number;
    arrow_TCIV?: number;
    arrow_PGTC?: number;
    arrow_POGI?: number;
    arrow_GWPG?: number;
    arrow_EWGO?: number;
}

interface Payload {
    is_gate_out: boolean;
    current_from_date: DateTime<true> | DateTime<false>;
    current_to_date: DateTime<true> | DateTime<false>;
    past_from_date?: DateTime<true> | DateTime<false>;
    past_to_date?: DateTime<true> | DateTime<false>;
}

const stagesWithLabels: any = {
    Materials: "Materials",
    No: "No. of Shipments",
    PO: "PO - GI",
    GI: "GI - TW",
    TW: "TW - GW",
    GW: "GW - PG",
    PG: "PG - TC",
    TC: "TC - IV",
    IV: "IV - EW",
    EW: "EW - GO",
    GO: "GI - GO"
}

const stagesWithArrows = {
    "PO-GI": "arrow_POGI",
    "GI-GO": "arrow_GIGO",
    "TW-GW": "arrow_TWGW",
    "GI-TW": "arrow_GITW",
    "IV-EW": "arrow_IVEW",
    "TC-IV": "arrow_TCIV",
    "PG-TC": "arrow_PGTC",
    "GW-PG": "arrow_GWPG",
    "EW-GO": "arrow_EWGO",
}

export default function TATDashboard() {
    // Date States
    const today: any = new Date();
    const oneWeekAgo: any = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const [startDate, setStartDate] = useState<any>(oneWeekAgo);
    const [endDate, setEndDate] = useState<any>(today);
    const { convertMsToHM } = service;

    //Common States
    const router = useRouter();
    const { showMessage } = useSnackbar();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [inPlantTatData, setInPlantTatData] = useState<InPlantTatData[]>([]);
    const [averageInPlantTatData, setAverageInPlantTatData] = useState<InPlantTatData[]>([]);
    const [isGateOut, setIsGateOut] = useState<boolean>(false);

    const selectedShipper = getCookie("shipper_id");
    let displayColumns = ['Materials', 'No', 'GI', 'TW', 'GW', 'PG', 'TC', 'IV', 'EW', 'GO'];
    // Angul Shipper
    if (selectedShipper === "623c963e33526eee0419a399") {
        displayColumns = ['Materials', 'No', 'PO', 'GI', 'TW', 'GW', 'PG', 'TC', 'IV', 'EW', 'GO'];
    }

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
    }

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
    }

    const getArrowDirection = (stage: string, item: any) => {
        const arrowKey = Object.entries(stagesWithArrows).find(
            ([key]) => key.split("-")[0] === stage || key.split("-")[1] === stage,
        )?.[1]

        if (!arrowKey || !item[arrowKey]) return null

        const value = item[arrowKey]
        if (value === 0) return null

        return {
            direction: value > 0 ? "up" : "down",
            color: value > 0 ? "#ef4444" : "#22c55e",
        }
    }

    const formatTime = (milliseconds: number): string => {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60))
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    };

    const loadInPlantTat = async (stageFromDate: any, stageToDate: any) => {
        const payload: Payload = {
            is_gate_out: isGateOut,
            current_from_date: DateTime.fromJSDate(stageFromDate).startOf('day').toUTC(),
            current_to_date: DateTime.fromJSDate(stageToDate).endOf('day').toUTC(),
        };

        const a = payload.current_from_date;
        const b = payload.current_to_date;
        const diffInDays = Math.round(b.diff(a, 'days').toObject().days ?? 0);
        const past_from_date = a.minus({ days: diffInDays }).toJSDate();
        const new_past_from_date = DateTime.fromJSDate(past_from_date).endOf('day').toUTC();

        payload.past_from_date = new_past_from_date;
        payload.past_to_date = DateTime.fromJSDate(stageToDate).endOf('day').toUTC();

        try {
            setLoading(true);
            const response = await httpsPost('stats/inPlantTAT/table_new', payload, router, 2, false);
            if (response.statusCode === 200) {
                const data = response.data;
                console.log(data, "data");
                const statusData: InPlantTatData[] = [];

                data.forEach((e: any) => {
                    const temp: InPlantTatData = {
                        materials: e._id.material,
                        noOfShipments: Math.round(e.avg_trip_count),
                        PO: convertMsToHM(e.res.filter((d: any) => d.stage === 'PO-GI')[0]?.avg_duration * 1000 || 0),
                        poValue: e.res.filter((d: any) => d.stage === 'PO-GI')[0]?.avg_duration * 1000 || 0,
                        threshhold_value: [], // Assuming this is populated elsewhere
                        arrowUporDown: e.res.filter((d: any) => e._id.material.toLowerCase() === d.material.toLowerCase()),
                        GI: convertMsToHM(e.res.filter((d: any) => d.stage === 'GI-TW')[0]?.avg_duration * 1000 || 0),
                        giValue: e.res.filter((d: any) => d.stage === 'GI-TW')[0]?.avg_duration * 1000 || 0,
                        TW: convertMsToHM(e.res.filter((d: any) => d.stage === 'TW-GW')[0]?.avg_duration * 1000 || 0),
                        twValue: e.res.filter((d: any) => d.stage === 'TW-GW')[0]?.avg_duration * 1000 || 0,
                        GW: convertMsToHM(e.res.filter((d: any) => d.stage === 'GW-PG')[0]?.avg_duration * 1000 || 0),
                        gwValue: e.res.filter((d: any) => d.stage === 'GW-PG')[0]?.avg_duration * 1000 || 0,
                        PG: convertMsToHM(e.res.filter((d: any) => d.stage === 'PG-TC')[0]?.avg_duration * 1000 || 0),
                        pgValue: e.res.filter((d: any) => d.stage === 'PG-TC')[0]?.avg_duration * 1000 || 0,
                        TC: convertMsToHM(e.res.filter((d: any) => d.stage === 'TC-IV')[0]?.avg_duration * 1000 || 0),
                        tcValue: e.res.filter((d: any) => d.stage === 'TC-IV')[0]?.avg_duration * 1000 || 0,
                        IV: convertMsToHM(e.res.filter((d: any) => d.stage === 'IV-EW')[0]?.avg_duration * 1000 || 0),
                        ivValue: e.res.filter((d: any) => d.stage === 'IV-EW')[0]?.avg_duration * 1000 || 0,
                        EW: convertMsToHM(e.res.filter((d: any) => d.stage === 'EW-GO')[0]?.avg_duration * 1000 || 0),
                        ewValue: e.res.filter((d: any) => d.stage === 'EW-GO')[0]?.avg_duration * 1000 || 0,
                        GO: convertMsToHM(e.res.filter((d: any) => d.stage === 'GI-GO')[0]?.avg_duration * 1000 || 0),
                        goValue: e.res.filter((d: any) => d.stage === 'GI-GO')[0]?.avg_duration * 1000 || 0,
                        ids: e.shipments,
                    };

                    if (temp.arrowUporDown && temp.arrowUporDown.length) {
                        const GIGO = temp.arrowUporDown.filter((item: any) => item.stage === 'GI-GO');
                        if (GIGO && GIGO.length) {
                            temp.arrow_GIGO = GIGO[0].avg_duration_growth;
                        }
                        const TWGW = temp.arrowUporDown.filter((item: any) => item.stage === 'TW-GW');
                        if (TWGW && TWGW.length) {
                            temp.arrow_TWGW = TWGW[0].avg_duration_growth;
                        }
                        const GITW = temp.arrowUporDown.filter((item: any) => item.stage === 'GI-TW');
                        if (GITW && GITW.length) {
                            temp.arrow_GITW = GITW[0].avg_duration_growth;
                        }
                        const IVEW = temp.arrowUporDown.filter((item: any) => item.stage === 'IV-EW');
                        if (IVEW && IVEW.length) {
                            temp.arrow_IVEW = IVEW[0].avg_duration_growth;
                        }
                        const TCIV = temp.arrowUporDown.filter((item: any) => item.stage === 'TC-IV');
                        if (TCIV && TCIV.length) {
                            temp.arrow_TCIV = TCIV[0].avg_duration_growth;
                        }
                        const PGTC = temp.arrowUporDown.filter((item: any) => item.stage === 'PG-TC');
                        if (PGTC && PGTC.length) {
                            temp.arrow_PGTC = PGTC[0].avg_duration_growth;
                        }
                        const POGI = temp.arrowUporDown.filter((item: any) => item.stage === 'PO-GI');
                        if (POGI && POGI.length) {
                            temp.arrow_POGI = POGI[0].avg_duration_growth;
                        }
                        const GWPG = temp.arrowUporDown.filter((item: any) => item.stage === 'GW-PG');
                        if (GWPG && GWPG.length) {
                            temp.arrow_GWPG = GWPG[0].avg_duration_growth;
                        }
                        const EWGO = temp.arrowUporDown.filter((item: any) => item.stage === 'EW-GO');
                        if (EWGO && EWGO.length) {
                            temp.arrow_EWGO = EWGO[0].avg_duration_growth;
                        }
                    }

                    statusData.push(temp);
                });

                const materialsInPlantTat = statusData.map(e => e.materials !== '' && e.materials).filter((val: any) => val)
                const selectedMaterialsInPlant = materialsInPlantTat.filter((val: any) => !val?.includes(','))
                const filteredData = statusData.filter((item: any) => selectedMaterialsInPlant.some((c: any) => item.materials === c));
                const _sumOfShipments = Math.round(filteredData.reduce((a: any, b: any) => a + b.noOfShipments, 0));

                const averageData = [];

                averageData.push({
                    materials: 'Average',
                    PO: convertMsToHM(filteredData.reduce((a, b) => a + b.poValue * b.noOfShipments, 0) / _sumOfShipments),
                    GI: convertMsToHM(filteredData.reduce((a, b) => a + b.giValue * b.noOfShipments, 0) / _sumOfShipments),
                    TW: convertMsToHM(filteredData.reduce((a, b) => a + b.twValue * b.noOfShipments, 0) / _sumOfShipments),
                    GW: convertMsToHM(filteredData.reduce((a, b) => a + b.gwValue * b.noOfShipments, 0) / _sumOfShipments),
                    PG: convertMsToHM(filteredData.reduce((a, b) => a + b.pgValue * b.noOfShipments, 0) / _sumOfShipments),
                    TC: convertMsToHM(filteredData.reduce((a, b) => a + b.tcValue * b.noOfShipments, 0) / _sumOfShipments),
                    IV: convertMsToHM(filteredData.reduce((a, b) => a + b.ivValue * b.noOfShipments, 0) / _sumOfShipments),
                    EW: convertMsToHM(filteredData.reduce((a, b) => a + b.ewValue * b.noOfShipments, 0) / _sumOfShipments),
                    GO: convertMsToHM(filteredData.reduce((a, b) => a + b.goValue * b.noOfShipments, 0) / _sumOfShipments),
                    noOfShipments: _sumOfShipments,
                    poValue: 0,
                    giValue: 0,
                    twValue: 0,
                    gwValue: 0,
                    pgValue: 0,
                    tcValue: 0,
                    ivValue: 0,
                    ewValue: 0,
                    goValue: 0,
                    ids: [],
                    threshhold_value: [],
                    arrowUporDown: [],
                });

                console.log(filteredData, "filteredData");
                setAverageInPlantTatData(averageData);
                setInPlantTatData(filteredData);
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
            loadInPlantTat(startDate, endDate);
        }
    }, [startDate, endDate, isGateOut]);

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
                    <div className={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            id="gateOutCheckbox"
                            checked={isGateOut}
                            onChange={(e) => {
                                setIsGateOut(e.target.checked);
                            }}
                        />
                        <label htmlFor="gateOutCheckbox" className={`${styles.checkboxCustom} ${isGateOut ? styles.checked : ''}`}></label>
                        <span className={styles.checkboxLabel}>Gate Out</span>
                    </div>
                </Box>
                {mobile && (
                    <>
                        <div className={styles.mobileContainer}>
                            {inPlantTatData.map((item, index) => (
                                <TATDashboardMobile key={index} data={item} />
                            ))}
                        </div>
                    </>
                )}
                {!mobile && (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    {displayColumns.map((col, index) => (
                                        <th key={col} className={index === 0 ? styles.leftAlign : styles.centerAlign}>
                                            {stagesWithLabels[col]}
                                            {index > 1 && <div className={styles.subHeader}>HH:MM</div>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {inPlantTatData.map((item: any, rowIndex: number) => (
                                    <tr key={rowIndex}>
                                        <td className={styles.leftAlign}>{item.materials}</td>
                                        <td className={styles.centerAlign}>{item.noOfShipments}</td>
                                        {displayColumns.slice(2).map((col) => {
                                            const timeValue = item[col]
                                            const arrow = getArrowDirection(col, item)

                                            return (
                                                <td key={col} className={styles.centerAlign}>
                                                    <div className={styles.cellContent}>
                                                        {timeValue !== "00:00" &&
                                                            arrow &&
                                                            (arrow.direction === "up" ? (
                                                                <ArrowUpIcon className={styles.arrow} style={{ color: arrow.color }} />
                                                            ) : (
                                                                <ArrowDownIcon className={styles.arrow} style={{ color: arrow.color }} />
                                                            ))}
                                                        {formatTime(item[`${col.toLowerCase()}Value`] || 0)}
                                                    </div>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                                {averageInPlantTatData.map((item: any, rowIndex: number) => (
                                    <tr key={rowIndex} className={styles.totalRow}>
                                        <td className={styles.leftAlign}>{item.materials}</td>
                                        <td className={styles.centerAlign}>{item.noOfShipments}</td>
                                        {displayColumns.slice(2).map((col) => {
                                            const timeValue = item[col];

                                            return (
                                                <td key={col} className={styles.centerAlign}>
                                                    <div className={styles.cellContent}>
                                                        {timeValue}
                                                    </div>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}