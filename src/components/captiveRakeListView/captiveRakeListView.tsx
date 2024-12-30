"use client";

import React, { useState, useEffect, useRef } from "react";
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
    TablePagination,
    Grid,
    Button,
    DialogTitle,
    DialogContent,
    Dialog,
    DialogContentText,
    DialogActions
} from "@mui/material";
import { useRouter } from "next/navigation";
import { httpsGet } from "@/utils/Communication";
import { httpsPost } from "@/utils/Communication";
import "./captiveRakeListView.css";
import timeService from "@/utils/timeService";
import { useSnackbar } from '@/hooks/snackBar';
import { styled as muiStyled } from '@mui/material/styles';
import TextField from "@mui/material/TextField";
import Minus from '@/assets/minus.svg';
import Plus from '@/assets/plus.svg';
import Image from "next/image";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { SelectChangeEvent } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import CloseButtonIcon from "@/assets/close_icon.svg";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1),
    },
}));


const CustomTextField = muiStyled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root': {
        height: '26px !important',
    },
    '& .MuiInputLabel-root': {
        transition: 'transform 0.2s ease-out, color 0.2s ease-out',
        fontSize: '12px !important',
        color: '#42454E !important',
        fontWeight: '600 !important',
        fontFamily: '"Inter", sans-serif !important',
        position: 'absolute !important',
        left: '0px !important',
        top: '-11px !important',
    },
    '& .MuiInputLabel-root.Mui-focused': {
        transform: 'translateY(5px) !important',
        fontSize: '10px !important',
        color: '#454545 !important',
        position: 'absolute !important',
        left: '14px !important',
        lineHeight: '1em !important',
        letterSpacing: '0.00938em !important',
    },
    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
        transform: 'translateY(5px) !important',
        fontSize: '10px !important',
        color: '#454545 !important',
        position: 'absolute !important',
        left: '14px !important',
        lineHeight: '1em !important',
        letterSpacing: '0.00938em !important',
    }
}));

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
    status: string;
    remaining_distance: number;
    eta: string;
    updated_at: string;
    fois_date: string;
    route?: Array<{
        _id?: string | undefined;
        name: string;
        from: string;
        to: string;
        via: string[];
        shipper: string;
    }>;
}

const status = [
    {
        name: 'Empty',
        value: 'E'
    },
    {
        name: 'Loaded',
        value: 'L'
    }
]

const CaptiveRakeListView = () => {
    const router = useRouter();
    const [activeRakeFilter, setActiveRakeFilter] = useState<string>("GPWIS");
    const [rakeList, setRakeList] = useState<RakeData[]>([]);
    const [filteredRakeList, setFilteredRakeList] = useState<RakeData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const { showMessage } = useSnackbar();

    const [selectedRakeForLink, setSelectedRakeForLink] = useState<RakeData | null>(null);
    const [selectedRakeForRemove, setSelectedRakeForRemove] = useState<RakeData | null>(null);

    const inputRefRakeName = useRef<any>(null);
    const [searchRakeName, setSearchRakeName] = useState('');

    const inputRefFrom = useRef<any>(null);
    const [searchFrom, setSearchFrom] = useState('');

    const inputRefTo = useRef<any>(null);
    const [searchTo, setSearchTo] = useState('');

    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const [routeOpen, setRouteOpen] = useState(false);

    const handleLinkButtonClick = (rake: RakeData) => {
        setSelectedRakeForLink(rake);
    };

    const handleRemoveButtonClick = (rake: RakeData) => {
        setSelectedRakeForRemove(rake);
    };

    const fetchRakeList = async (scheme: string) => {
        try {
            setLoading(true);
            const response = await httpsGet(`get/crList?scheme=${scheme}`, 0, router);

            if (response && response.data) {
                setRakeList(response.data);
                setFilteredRakeList(response.data);
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

    const getFilterChipStyle = (filter: string, isActive: boolean) => {
        if (!isActive) {
            return {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                color: 'rgba(0, 0, 0, 0.87)',
                fontWeight: 'normal',
            };
        }

        switch (filter) {
            case 'SFTO':
                return {
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    fontWeight: 'bold',
                };
            case 'BFNV':
                return {
                    backgroundColor: '#FF9800',
                    color: 'white',
                    fontWeight: 'bold',
                };
            case 'GPWIS':
                return {
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    fontWeight: 'bold',
                };
        }
    };

    const paginatedRakeList = filteredRakeList.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleLinkRoute = async (rake: RakeData) => {
        try {
            if (!rake.route || !rake.route[0]._id) {
                showMessage('No route information available', 'warning');
                return;
            }

            const response = await httpsPost('cr_rakes/linkRoute', {
                rake: rake.route[0]._id,
                route: rake.route[0].via[0]
            });

            if (response.statusCode === 200) {
                showMessage('Route linked successfully', 'success');

                await fetchRakeList(activeRakeFilter);
            } else {
                showMessage(response.msg || 'Failed to link route', 'error');
            }
        } catch (error) {
            console.error('Error linking route:', error);
            showMessage('An error occurred while linking route', 'error');
        }
    };

    const handleRemoveRoute = async (rakeId: string) => {
        try {
            const response = await httpsPost('cr_rakes/removeRoute', {
                rake: rakeId
            });

            if (response.statusCode === 200) {
                showMessage('Route removed successfully', 'success');

                await fetchRakeList(activeRakeFilter);
            } else {
                showMessage(response.msg || 'Failed to remove route', 'error');
            }
        } catch (error) {
            console.error('Error removing route:', error);
            showMessage('An error occurred while removing route', 'error');
        }
    };

    const handleSearchRakeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchRakename = event.target.value;
        setSearchRakeName(newSearchRakename);
        handleFilterChange(newSearchRakename, searchFrom, searchTo);
    };

    const handleSearchFrom = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchFrom = event.target.value;
        setSearchFrom(newSearchFrom);
        handleFilterChange(searchRakeName, newSearchFrom, searchTo, selectedStatus);
    };

    const handleSearchTo = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTo = event.target.value;
        setSearchTo(newSearchTo);
        handleFilterChange(searchRakeName, searchFrom, newSearchTo, selectedStatus);
    };

    const handleSelectStatusChange = (event: SelectChangeEvent<string | null>) => {
        const selectedStatus = event.target.value as string;
        console.log(selectedStatus, "selectedStatus");
        setSelectedStatus(selectedStatus);
        handleFilterChange(searchRakeName, searchFrom, searchTo, selectedStatus);
    };

    const handleFilterChange = (searchRakeName: string, searchFrom: string = '', searchTo: string = '', selectedStatus: string | null = null) => {
        const filteredList = rakeList.filter((item: any) => {
            const matchesRakeName = searchRakeName ? item.name.toLowerCase().includes(searchRakeName.toLowerCase()) : true;
            const matchesFrom = searchFrom ? item.from[0].toLowerCase().includes(searchFrom.toLowerCase()) : true;
            const matchesTo = searchTo ? item.to[0].toLowerCase().includes(searchTo.toLowerCase()) : true;
            const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
            return matchesRakeName && matchesFrom && matchesTo && matchesStatus;
        });

        setFilteredRakeList(filteredList);
    };

    useEffect(() => {
        if (inputRefRakeName.current && searchRakeName !== '') {
            inputRefRakeName.current.focus();
        }
    }, [searchRakeName]);

    useEffect(() => {
        if (inputRefFrom.current && searchFrom !== '') {
            inputRefFrom.current.focus();
        }
    }, [searchFrom]);

    useEffect(() => {
        if (inputRefTo.current && searchTo !== '') {
            inputRefTo.current.focus();
        }
    }, [searchTo]);

    const handleRouteClose = () => {
        setRouteOpen(false);
    };

    return (
        <>
            <div className="list-view-wrapper">
                <div className="list-view-filter-container">
                    <div className="list-view-filter-buttons">
                        {['BRN', 'BFNV', 'GPWIS'].map((filter) => (
                            <Chip
                                key={filter}
                                label={filter === 'GPWIS' ? 'GPWIS' : `SFTO-${filter}`}
                                onClick={() => handleRakeFilterClick(filter)}
                                style={getFilterChipStyle(filter, activeRakeFilter === filter)}
                                variant={activeRakeFilter === filter ? 'filled' : 'outlined'}
                                className="list-view-filter-chip"
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
                    <div className="list-view-table-wrapper">
                        <TablePagination
                            component="div"
                            count={rakeList.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 20, 50]}
                            className="list-view-table-pagination"
                            labelRowsPerPage="Rakes per page:"
                        />
                        <TableContainer>
                            <div className="list-view-table-container">
                                <Table size="small" aria-label="rake list table" className="list-view-table">
                                    <TableHead className="list-view-table-head">
                                        <TableRow>
                                            <TableCell align="left" className="table-columns">#</TableCell>
                                            <TableCell align="left" className="table-columns">
                                                <CustomTextField
                                                    inputRef={inputRefRakeName}
                                                    label="Rake Name"
                                                    value={searchRakeName}
                                                    onChange={handleSearchRakeName}
                                                />
                                            </TableCell>
                                            <TableCell align="left" className="table-columns">
                                                <CustomTextField
                                                    inputRef={inputRefFrom}
                                                    label="From"
                                                    value={searchFrom}
                                                    onChange={handleSearchFrom}
                                                />
                                            </TableCell>
                                            <TableCell align="left" className="table-columns">
                                                <CustomTextField
                                                    inputRef={inputRefTo}
                                                    label="To"
                                                    value={searchTo}
                                                    onChange={handleSearchTo}
                                                /></TableCell>
                                            <TableCell align="left" className="table-columns">Current Location</TableCell>
                                            <TableCell align="left" className="table-columns">
                                                <div className="select-container">
                                                    <FormControl>
                                                        <InputLabel id="demo-simple-select-label"
                                                            sx={{
                                                                fontSize: '12px !important',
                                                                color: '#42454E !important',
                                                                fontWeight: '600 !important',
                                                                fontFamily: '"Inter", sans-serif !important',
                                                                position: 'absolute !important',
                                                                left: '0px !important',
                                                                top: '-11px !important',
                                                                transition: 'transform 0.2s ease-out, color 0.2s ease-out !important',
                                                                '&.Mui-focused': {
                                                                    transform: 'translateY(5px) !important',
                                                                    fontSize: '10px !important',
                                                                    color: '#454545 !important',
                                                                    lineHeight: '1em !important',
                                                                    letterSpacing: '0.00938em !important',
                                                                    position: 'absolute !important',
                                                                    left: '14px !important',
                                                                },
                                                                '&.MuiInputLabel-shrink': {
                                                                    transform: 'translateY(5px) !important',
                                                                    fontSize: '10px !important',
                                                                    color: '#454545 !important',
                                                                    lineHeight: '1em !important',
                                                                    letterSpacing: '0.00938em !important',
                                                                    position: 'absolute !important',
                                                                    left: '14px !important',
                                                                }
                                                            }}>Status</InputLabel>
                                                        <Select
                                                            labelId="demo-simple-select-label"
                                                            id="demo-simple-select"
                                                            value={selectedStatus}
                                                            label="Status"
                                                            onChange={handleSelectStatusChange}
                                                        >
                                                            {
                                                                status.map((item: any, index: number) => (
                                                                    <MenuItem key={index} value={item.value}>{item.name}</MenuItem>
                                                                ))
                                                            }
                                                            <MenuItem value={"ALL"}>All</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </div>
                                            </TableCell>
                                            <TableCell align="left" className="table-columns">ETA</TableCell>
                                            <TableCell align="left" className="table-columns">Remaining
                                                <br />Distance (Kms)</TableCell>
                                            <TableCell align="center" className="table-columns">BPC
                                                <br />Expiry Date</TableCell>
                                            <TableCell align="center" className="table-columns">BPC
                                                <br />Remaining (Kms)</TableCell>
                                            <TableCell align="left" className="table-columns">FOIS (Fetch) At</TableCell>
                                            <TableCell align="left" className="table-columns">FOIS (Updated) At</TableCell>
                                            <TableCell align="left" className="table-columns">Route</TableCell>
                                            <TableCell align="left" className="table-columns">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedRakeList.map((rake, index) => (
                                            <TableRow
                                                key={rake.name}
                                                hover
                                                className="table-row"
                                            >
                                                <TableCell align="left" className="table-rows">{page * rowsPerPage + index + 1}</TableCell>
                                                <TableCell align="left" className="table-rows">{rake.name || 'N/A'}</TableCell>
                                                <TableCell align="left" className="table-rows">{rake.from.join(', ') || 'N/A'}</TableCell>
                                                <TableCell align="left" className="table-rows">{rake.to.join(', ') || 'N/A'}</TableCell>
                                                <TableCell align="left" className="table-rows">{rake.location.join(', ') || 'N/A'}</TableCell>
                                                <TableCell align="left" className="table-rows">
                                                    {rake.status === 'E' ?
                                                        <span style={{ color: '#FF2A1F' }}>Empty</span> :
                                                        <span style={{ color: '#1ab836' }}>Loaded</span>
                                                    }
                                                </TableCell>
                                                <TableCell align="left" className="table-rows">
                                                    {rake.eta ? (
                                                        <>
                                                            <span>{rake.eta.split(' ')[0]}</span> {/* Date */}
                                                            <br />
                                                            <span>{rake.eta.split(' ')[1]}</span> {/* Time */}
                                                        </>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </TableCell>
                                                <TableCell align="left" className="table-rows">{rake.remaining_distance || 'N/A'}</TableCell>
                                                <TableCell align="left" className="table-rows">
                                                    <span>{timeService.utcToist(rake.bpc.exp, 'dd-MM-yyyy') || 'N/A'}</span> <br />
                                                    <span>{timeService.utcToistTime(rake.bpc.exp, 'HH:mm') || 'N/A'}</span>
                                                </TableCell>
                                                <TableCell align="left" className="table-rows">
                                                    <span>{(rake.bpc.rem_km) || 'N/A'}</span>
                                                </TableCell>
                                                <TableCell align="left" className="table-rows">
                                                    {rake.fois_date ? (
                                                        <>
                                                            <span>{rake.fois_date.split(' ')[0]}</span> {/* Date */}
                                                            <br />
                                                            <span>{rake.fois_date.split(' ')[1]}</span> {/* Time */}
                                                        </>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </TableCell>
                                                <TableCell align="left" className="table-rows">
                                                    {rake.updated_at ? (
                                                        <>
                                                            <span>{rake.updated_at.split(' ')[0]}</span> {/* Date */}
                                                            <br />
                                                            <span>{rake.updated_at.split(' ')[1]}</span> {/* Time */}
                                                        </>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </TableCell>
                                                <TableCell align="left" className="table-rows">{rake.route ? rake.route[0]?.name : 'N/A'}</TableCell>
                                                <TableCell align="left" className="table-rows">
                                                    {
                                                        rake.route ? (
                                                            <Image src={Plus} alt="Plus" onClick={() => handleLinkButtonClick(rake)} style={{
                                                                cursor: 'pointer'
                                                            }} />
                                                        ) : (
                                                            <Image src={Minus} alt="Minus" onClick={() => handleRemoveButtonClick(rake)} style={{
                                                                cursor: 'pointer'
                                                            }} />
                                                        )
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TableContainer>
                    </div>
                )}
            </div>
            <BootstrapDialog
                onClose={handleRouteClose}
                className="list-view-routes-dialog-styles"
                aria-labelledby="customized-dialog-title"
                open={routeOpen}
            >
                <div className="list-view-routes-dialog-container">
                    <div
                        aria-label="close"
                        onClick={handleRouteClose}
                        className="list-view-routes-dialog-close-icon"
                    >
                        <Image src={CloseButtonIcon} alt="close" />
                    </div>
                </div>
            </BootstrapDialog>
        </>

    );
};

export default CaptiveRakeListView;