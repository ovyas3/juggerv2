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
import VehicleStagingLiveShipmentDetails from "./VehicleStagingLiveShipmentDetails/VehicleStagingLiveShipmentDetails";
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

// Define types for the data structure
interface Stage {
    count: number;
}

interface MaterialEntry {
    [materialName: string]: {
        [stage: string]: Stage;
    };
}

const stages: MaterialKey[] = ['DC', 'PO', 'GI', 'TW', 'GW', 'PG', 'TC', 'IV', 'EW', 'GO'];

type MaterialKey = 'DC' | 'PO' | 'GI' | 'TW' | 'GW' | 'PG' | 'TC' | 'IV' | 'EW' | 'GO';

const stageWithName: Record<MaterialKey, string> = {
    DC: 'DO - PO',
    PO: 'PO - GI',
    GI: 'GI - TW',
    TW: 'TW - GW',
    GW: 'GW - PG',
    PG: 'PG - TC',
    TC: 'TC - IV',
    IV: 'IV - EW',
    EW: 'EW - GO',
    GO: 'GI - GO'
}

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
    const [driverIds, setDriverIds] = useState<string[]>([]);
    const [title, setTitle] = useState<string>('');
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)

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

    const handleDriverIDs = (data: any, stage: MaterialKey, material: string) => {
        const driverIds = data && data?.driverData && data?.driverData?.length > 0 ? data?.driverData : [];
        if (driverIds && driverIds?.length > 0) {
            setDriverIds(driverIds);
            setTitle(`${material} - ${stage}`);
            setIsPopupOpen(true);
        } else {
            showMessage(`No driver data available for ${material} - ${stage}`, "error");
        }
    }

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();
        
        const headers = ['Materials', ...Object.values(stageWithName)];

        const data = 
            sortedMaterials && 
            sortedMaterials.length > 0 && 
            sortedMaterials?.map(([material, data]) => {
                return [
                    material,
                    ...stages.map(stage => data[stage]?.count || 0)
                ];
            }) || [];

        const wsData = [headers, ...data];
        const worksheet = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Staging Live');
        XLSX.writeFile(workbook, 'vehicle_staging_live.xlsx');
    };

    return (
        <>
            {/* Loader */}
            {loading && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    position: 'absolute',
                    width: '100vw',
                    background: 'white',
                    zIndex: 1000,
                    opacity: 1
                }}>
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
            )}
            <div className={styles.main} style={{ margin: !mobile ? '56px 0 0 70px' : '0px' }}>
                <div className={styles.container}>
                    {mobile && (
                        <h1 className={styles.title}>Vehicle Staging Live</h1>
                    )}
                    <div className={styles.dateContainer}>
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
                        <button className={styles.exportButton} onClick={exportToExcel}>
                            <Download className={styles.exportButtonIcon} />
                            Export
                        </button>
                    </div>
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
                                        {stages.map((stage) => {
                                            const stageName = stageWithName[stage]
                                            return (
                                                <th key={stage} onClick={() => handleSort(stage)}>
                                                    {stageName}
                                                </th>
                                            )
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedMaterials && sortedMaterials.length > 0 && sortedMaterials.map(([material, data], index) => {
                                        return (
                                            <tr key={material} className={index === sortedMaterials.length - 1 ? styles.totalRow : ''}>
                                                <td>{material}</td>
                                                {stages.map((stage) => (
                                                    <td key={stage} onClick={() => handleDriverIDs(data[stage], stage, material)}>{data[stage]?.count || 0}</td>
                                                ))}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <VehicleStagingLiveShipmentDetails
                        isOpen={isPopupOpen}
                        onClose={() => setIsPopupOpen(false)}
                        title={title}
                        data={driverIds}
                    />
                </div>
            </div>
        </>
    )
}