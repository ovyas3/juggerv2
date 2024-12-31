"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    TablePagination,
    Dialog,
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

interface RouteData {
    _id?: string | undefined;
    name: string;
    from: string[];
    to: string[];
    via: string[];
    shipper: string;
}
interface RakeData {
    _id: string;
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
    route?: Array<RouteData>;
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

    const [selectedRake, setSelectedRake] = useState<any | null>();

    const inputRefRakeName = useRef<any>(null);
    const [searchRakeName, setSearchRakeName] = useState('');

    const inputRefFrom = useRef<any>(null);
    const [searchFrom, setSearchFrom] = useState('');

    const inputRefTo = useRef<any>(null);
    const [searchTo, setSearchTo] = useState('');

    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const [routeOpen, setRouteOpen] = useState(false);
    const [routeData, setRouteData] = useState<RouteData[]>([]);
    const [filteredRouteData, setFilteredRouteData] = useState<RouteData[]>([]);

    const [selectedRoute, setSelectedRoute] = useState<any | null>(null);

    const inputRefRouteName = useRef<any>(null);
    const [searchRouteName, setSearchRouteName] = useState('');

    const [selectedRemoveRake, setSelectedRemoveRake] = useState<any | null>(null);
    const [confirmRemoveRakeOpen, setConfirmRemoveRakeOpen] = useState(false);

    const handleLinkButtonClick = (rake: RakeData) => {
        console.log(rake, "rake");
        setRouteOpen(true);
        setSelectedRake(rake);
        fetchRoutes(searchRouteName);
    };

    const handleRemoveButtonClick = (rake: RakeData) => {
        setSelectedRemoveRake(rake);
        setConfirmRemoveRakeOpen(true);
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
                // throw new Error('Failed to fetch rake list');
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
            const matchesStatus = !selectedStatus || item.status === selectedStatus || selectedStatus === 'ALL';
            return matchesRakeName && matchesFrom && matchesTo && matchesStatus;
        });

        console.log(filteredList, "filteredList");

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
        setSelectedRake(null);
        setSelectedRoute(null);
        setRouteOpen(false);
    };

    const handleSearchRouteName = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchRouteName = event.target.value;
        setSearchRouteName(newSearchRouteName);
        fetchRoutes(newSearchRouteName);
    };

    const fetchRoutes = async (routeName: string) => {
        try {
            const response = await httpsGet(`get/crRoute?name=${routeName}`, 0, router);
            if (response.data) {
                const routesDataArray = response.data.map((route: any) => ({
                    _id: route._id,
                    name: route.name ? route.name : '',
                    via: route.via && route.via.length > 0 ? route.via.map((via: any) => `${via.code} - ${via.name}`) : [],
                    from: route.from && route.from.length > 0 ? route.from.map((from: any) => `${from.code} - ${from.name}`) : [],
                    to: route.to && route.to.length > 0 ? route.to.map((to: any) => `${to.code} - ${to.name}`) : [],
                    shipper: route.shipper ? route.shipper : '',
                }));
                setRouteData(routesDataArray);
                setFilteredRouteData(routesDataArray);
                console.log(routesDataArray, "routesDataArray");
            }
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    };

    const handleSelectRoute = (route: any) => {
        setSelectedRoute(route);
        console.log(route, "route");
    };

    const handleAddRoute = async () => {
        if (!selectedRoute) {
            showMessage('Please select a route', 'error');
            return;
        }
        try {
            const payload = {
                route: selectedRoute._id,
                rake: selectedRake.rake
            };
            const response = await httpsPost('cr_rakes/linkRoute', payload);

            if (response.statusCode === 200) {
                showMessage('Route added successfully', 'success');
                setRouteOpen(false);
                await fetchRakeList(activeRakeFilter);
            } else {
                showMessage(response.msg || 'Failed to add route', 'error');
            }
        } catch (error) {
            console.error('Error adding route:', error);
            showMessage('An error occurred while adding route', 'error');
        }
    };

    const handleRemoveRoute = async (rake: any) => {
        if (!rake || !rake._id) {
            showMessage('Please select a rake', 'error');
            return;
        };
        const rakeId = rake?._id;
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

    const handleRemoveRouteClose = () => {
        setSelectedRemoveRake(null);
        setConfirmRemoveRakeOpen(false);
    };

    return (
        <>
            <div className="list-view-wrapper">
                <div className="list-view-filter-container">
                    <div className="list-view-filter-buttons">
                        {['SFTO', 'BFNV', 'GPWIS'].map((filter) => (
                            <Chip
                                key={filter}
                                label={filter === 'GPWIS' ? 'GPWIS' : filter === 'SFTO' ? 'SFTO-BRN' : `SFTO-${filter}`}
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
                                        {paginatedRakeList && paginatedRakeList.length > 0 ?
                                            paginatedRakeList.sort((a, b) => {
                                                const nameA = a.name.split('-');
                                                const nameB = b.name.split('-');

                                                if (nameA[0] === nameB[0]) {
                                                    return parseInt(nameA[1], 10) - parseInt(nameB[1], 10);
                                                }
                                                return nameA[0].localeCompare(nameB[0]);
                                            }).map((rake, index) => (
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
                                            )) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={16}
                                                        align="center"
                                                        style={{
                                                            padding: '20px',
                                                            fontSize: '12px',
                                                            color: '#42454E',
                                                            fontWeight: '600',
                                                            fontFamily: '"Inter", sans-serif',
                                                        }}
                                                    >
                                                        No data found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TableContainer>
                    </div>
                )}
            </div>

            {/* Add Routes Dialog */}
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

                    <div className="list-view-routes-dialog-body">
                        <div className="list-view-routes-dialog-title">Add Route ({selectedRake?.name})</div>
                        <div className="list-view-routes-dialog-table">
                            <Table size="small" aria-label="rake list table" className="list-view-table">
                                <TableHead className="list-view-table-head">
                                    <TableRow>
                                        <TableCell align="left" className="table-columns">#</TableCell>
                                        <TableCell align="left" className="table-columns">

                                            <CustomTextField
                                                inputRef={inputRefRouteName}
                                                label="Route Name"
                                                value={searchRouteName}
                                                onChange={handleSearchRouteName}
                                            />
                                        </TableCell>
                                        <TableCell align="left" className="table-columns">
                                            From Station
                                        </TableCell>
                                        <TableCell align="left" className="table-columns">
                                            To Station
                                        </TableCell>
                                        <TableCell align="left" className="table-columns">
                                            Via Station
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredRouteData && filteredRouteData.length > 0 ?
                                        filteredRouteData.map((route, index) => (
                                            <TableRow
                                                key={route.name}
                                                hover
                                                className="table-row"
                                                onClick={() => handleSelectRoute(route)}
                                                style={{
                                                    backgroundColor: selectedRoute?._id === route._id ? '#e0e7ff' : '',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <TableCell align="left" className="table-rows">{index + 1}.</TableCell>
                                                <TableCell align="left" className="table-rows">{route.name}</TableCell>
                                                <TableCell align="left" className="table-rows">
                                                    {route.from.map((item: string) => {
                                                        const [code, name] = item.split(' - ');
                                                        return (
                                                            <div key={code}>
                                                                <span style={{ fontWeight: 'bold' }}>{code}</span>
                                                                <br />
                                                                <span>{name}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </TableCell>
                                                <TableCell align="left" className="table-rows">
                                                    {route.to.map((item: string) => {
                                                        const [code, name] = item.split(' - ');
                                                        return (
                                                            <div key={code}>
                                                                <span style={{ fontWeight: 'bold' }}>{code}</span>
                                                                <br />
                                                                <span>{name}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </TableCell>
                                                <TableCell align="left" className="table-rows">
                                                    {route.via.map((item: string, index: number) => {
                                                        const [code, name] = item.split(' - ');
                                                        return (
                                                            <div key={index}>
                                                                <span style={{ fontWeight: 'bold' }}>{code}</span>
                                                                {' - '}
                                                                <span>{name}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    align="center"
                                                    style={{
                                                        padding: '20px',
                                                        fontSize: '12px',
                                                        color: '#42454E',
                                                        fontWeight: '600',
                                                        fontFamily: '"Inter", sans-serif',
                                                    }}
                                                >
                                                    No data found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="list-view-routes-dialog-footer">
                            <button
                                className={!selectedRoute || !selectedRake ?
                                    'list-view-routes-dialog-footer-button-disabled' : 'list-view-routes-dialog-footer-button'
                                }
                                onClick={handleAddRoute}
                                disabled={!selectedRoute || !selectedRake}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </BootstrapDialog>

            {/* Remove Routes Dialog */}
            <BootstrapDialog
                onClose={handleRemoveRouteClose}
                className="list-view-routes-confirm-dialog-styles"
                aria-labelledby="customized-dialog-title"
                open={confirmRemoveRakeOpen}
            >
                <div className="list-view-routes-confirm-dialog-container">
                    <div
                        aria-label="close"
                        onClick={handleRemoveRouteClose}
                        className="list-view-routes-confirm-dialog-close-icon"
                    >
                        <Image src={CloseButtonIcon} alt="close" />
                    </div>
                    <div className="list-view-routes-confirm-dialog-title">Remove Route</div>
                    <div className="list-view-routes-confirm-dialog-body">
                        <div className="list-view-routes-confirm-dialog-text">
                            Are you sure want to remove route {selectedRoute?.name} from {selectedRemoveRake?.name}?
                        </div>
                    </div>
                    <div className="list-view-routes-confirm-dialog-footer">
                        <button className="list-view-routes-confirm-dialog-footer-confirm-button" onClick={() =>
                            handleRemoveRoute(selectedRemoveRake)}
                        >
                            Yes
                        </button>
                        <button className="list-view-routes-confirm-dialog-footer-cancel-button" onClick={handleRemoveRouteClose}>
                            No
                        </button>
                    </div>
                </div>
            </BootstrapDialog>
        </>
    );
};

export default CaptiveRakeListView;