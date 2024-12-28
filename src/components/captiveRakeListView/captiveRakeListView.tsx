"use client";

import React, { useState, useEffect } from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Chip, 
    Box, 
    CircularProgress,
    Alert,
    Tooltip,
    TablePagination
} from "@mui/material";
import { useRouter } from "next/navigation";
import { httpsGet } from "@/utils/Communication";
import "./captiveRakeListView.css";
import timeService from "@/utils/timeService";

interface RakeData {
    name: string;
    from: string[];
    to: string[];
    location: string[];
    bpc: {
        number: number;
        type: string;
        km?: number;
        rem_km?: any;
        valid_days?: number;
        rem_days?: number;
        done?: string;
        exp?: any;
        exp_grace?: string;
    };
    statue: string;
    remaining_distance: number;
    eta: string;
    updated_at: string;
    fois_date: string;
}

const CaptiveRakeListView = () => {
    const router = useRouter();
    const [activeRakeFilter, setActiveRakeFilter] = useState<string>("GPWIS");
    const [rakeList, setRakeList] = useState<RakeData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchRakeList = async (scheme: string) => {
        try {
            setLoading(true);
            const response = await httpsGet(`get/crList?scheme=${scheme}`, 0, router);
            
            if (response && response.data) {
                setRakeList(response.data);
                setLoading(false);
            } else {
                throw new Error('Failed to fetch rake list');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRakeList(activeRakeFilter);
    }, [activeRakeFilter]);

    const handleRakeFilterClick = (filterType: string) => {
        setActiveRakeFilter(filterType);
        setPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedRakeList = rakeList.slice(
        page * rowsPerPage, 
        page * rowsPerPage + rowsPerPage
    );

    return (
        <div className="wrapper">
            <div className="filter-container">
                <div className="filter-buttons">
                    {['SFTO', 'BFNV', 'GPWIS'].map((filter) => (
                        <Chip 
                            key={filter}
                            label={filter === 'GPWIS' ? 'GPWIS' : `SFTO-${filter}`}
                            onClick={() => handleRakeFilterClick(filter)}
                            color={activeRakeFilter === filter ? 'primary' : 'default'}
                            variant={activeRakeFilter === filter ? 'filled' : 'outlined'}
                            className="filter-chip"
                        />
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <CircularProgress />
                </div>
            ) : error ? (
                <Alert severity="error" className="error-alert">{error}</Alert>
            ) : (
                <div className="table-wrapper">
                    <TablePagination
                        component="div"
                        count={rakeList.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="table-pagination"
                    />
                    <TableContainer>
                        <Table size="small" aria-label="rake list table">
                            <TableHead className="table-head">
                                <TableRow>
                                    <TableCell>S.No</TableCell>
                                    <TableCell>Rake Name</TableCell>
                                    <TableCell>From</TableCell>
                                    <TableCell>To</TableCell>
                                    <TableCell>Current Location</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>ETA</TableCell>
                                    <TableCell>Remaining Distance (Kms)</TableCell>
                                    <TableCell colSpan={2} align="center">BPC</TableCell>
                                    <TableCell>FOIS (Fetch) At</TableCell>
                                    <TableCell>FOIS (Updated) At</TableCell>
                                    <TableCell>Route</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={8}></TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Remaining KM</TableCell>
                                    <TableCell colSpan={3}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedRakeList.map((rake, index) => (
                                    <TableRow 
                                        key={rake.name}
                                        hover
                                        className="table-row"
                                    >
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{rake.name}</TableCell>
                                        <TableCell>{rake.from.join(', ')}</TableCell>
                                        <TableCell>{rake.to.join(', ')}</TableCell>
                                        <TableCell>{rake.location.join(', ')}</TableCell>
                                        <TableCell>{rake.statue}</TableCell>
                                        <TableCell>{rake.eta}</TableCell>
                                        <TableCell>{rake.remaining_distance}</TableCell>
                                        <TableCell>
                                            <Tooltip title={`BPC Type: ${rake.bpc.exp}`}>
                                                <span>{timeService.utcToist(rake.bpc.exp, 'dd-MM-yyyy HH:mm')}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={`Expiry: ${rake.bpc.rem_km || 'N/A'}`}>
                                                <span>{(rake.bpc.rem_km) || 'N/A'}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{rake.fois_date}</TableCell>
                                        <TableCell>{rake.updated_at}</TableCell>
                                        <TableCell> -- </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}
        </div>
    );
};

export default CaptiveRakeListView;