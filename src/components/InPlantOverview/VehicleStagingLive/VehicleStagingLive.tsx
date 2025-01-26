"use client"

import React, { useState, useEffect } from "react"
import styles from './VehicleStagingLive.module.css'
import CustomDatePicker from '@/components/UI/CustomDatePicker/CustomDatePicker';
import Box from '@mui/material/Box';
import { useMediaQuery, useTheme } from '@mui/material';
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackBar";
import { ThreeCircles } from "react-loader-spinner";
import VehicleStagingLiveCard from "./VehicleStagingLiveCard/VehicleStagingLiveCard";

// Define types for the data structure
interface Stage {
    count: number;
}

interface MaterialEntry {
    [materialName: string]: {
        [stage: string]: Stage;
    };
}

const stages: MaterialKey[] = ['TW', 'GO', 'TC', 'PO', 'CNCL', 'GI', 'EW', 'EP', 'DC', 'PG'];

type MaterialKey = 'TW' | 'GO' | 'TC' | 'PO' | 'CNCL' | 'GI' | 'EW' | 'EP' | 'DC' | 'PG';

export default function VehicleStagingLive() {
    // Date States
    const today: any = new Date();
    const oneWeekAgo: any = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const [startDate, setStartDate] = useState<any>(oneWeekAgo);
    const [endDate, setEndDate] = useState<any>(today);

    //Common States
    const router = useRouter();
    const { showMessage } = useSnackbar();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Vehicle Staging Live States
    const [vehicleStagingLiveData, setVehicleStagingLiveData] = useState<MaterialEntry[]>([]);
    const [sortColumn, setSortColumn] = useState<MaterialKey>("TW");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
    }

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
    }

    const fetchVehicleStagingLive = async () => {
        try {
            setLoading(true);
            const response = await httpsGet(`stats/vehicleStagingtableData?from_date=${startDate}&to_date=${endDate}`, 1, router);
            if (response?.statusCode === 200) {
                console.log(response.data);
                setVehicleStagingLiveData(response.data);
            }
        } catch (error) {

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (startDate && endDate) {
            fetchVehicleStagingLive();
        }
    }, [startDate, endDate]);

    const handleSort = (column: MaterialKey) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    }

    const sortedMaterials = vehicleStagingLiveData && vehicleStagingLiveData?.length > 0 && Object?.entries(vehicleStagingLiveData[0]).sort(([aKey, aValue], [bKey, bValue]) => {
        const aCount = aValue[sortColumn]?.count || 0;
        const bCount = bValue[sortColumn]?.count || 0;
        return sortDirection === "asc" ? aCount - bCount : bCount - aCount;
    });

    const calculateTotal = (stage: string) => {
        return vehicleStagingLiveData && vehicleStagingLiveData?.length > 0 && Object.values(vehicleStagingLiveData[0]).reduce((sum, material) => sum + (material[stage]?.count || 0), 0)
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
                style={{ margin: !mobile ? '56px 0 0 70px' : '0px' }}>
                {mobile && (
                    <h1 className={styles.title}>Vehicle Staging Live</h1>
                )}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 2,
                    width: !mobile ? '20%' : '100%',
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
                {mobile && (
                    <div className={styles.cardContainer}>
                        {sortedMaterials && sortedMaterials.length > 0 && sortedMaterials.map(([material, data]) => (
                            <VehicleStagingLiveCard key={material} material={material} data={data} />
                        ))}
                    </div>
                )}
                {!mobile && (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort("TW")}>Materials</th>
                                    {stages.map((stage) => (
                                        <th key={stage} onClick={() => handleSort(stage)}>
                                            {stage}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMaterials && sortedMaterials.length > 0 && sortedMaterials.map(([material, data], index) => (
                                    <tr key={material} className={index === sortedMaterials.length - 1 ? styles.totalRow : ''}>
                                        <td>{material}</td>
                                        {stages.map((stage) => (
                                            <td key={stage}>{data[stage]?.count || 0}</td>
                                        ))}
                                    </tr>
                                ))}
                                {/* <tr className={styles.totalRow}>
                                <td>TOTAL</td>
                                {stages.map((stage) => (
                                    <td key={stage}>{calculateTotal(stage)}</td>
                                ))}
                            </tr> */}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}