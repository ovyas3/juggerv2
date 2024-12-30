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
    route?: {
        _id?: string | undefined;
        name: string;
        from: string;
        to: string;
        via: string[];
        shipper: string;
    };
}

const CaptiveRakeListView = () => {
    const router = useRouter();
    const [activeRakeFilter, setActiveRakeFilter] = useState<string>("GPWIS");
    const [rakeList, setRakeList] = useState<RakeData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const { showMessage } = useSnackbar();

    const [linkConfirmationOpen, setLinkConfirmationOpen] = useState(false);
    const [selectedRakeForLink, setSelectedRakeForLink] = useState<RakeData | null>(null);
    const [removeConfirmationOpen, setRemoveConfirmationOpen] = useState(false);
    const [selectedRakeForRemove, setSelectedRakeForRemove] = useState<RakeData | null>(null);

    const handleLinkButtonClick = (rake: RakeData) => {
        setSelectedRakeForLink(rake);
        setLinkConfirmationOpen(true);
    };

    const handleLinkConfirmation = () => {
        if (selectedRakeForLink) {
            handleLinkRoute(selectedRakeForLink);
        }
        setLinkConfirmationOpen(false);
        setSelectedRakeForLink(null);
    };

    const handleLinkCancel = () => {
        setLinkConfirmationOpen(false);
        setSelectedRakeForLink(null);
    };

    const handleRemoveButtonClick = (rake: RakeData) => {
        setSelectedRakeForRemove(rake);
        setRemoveConfirmationOpen(true);
    };
    
    const handleRemoveConfirmation = () => {
        if (selectedRakeForRemove) {
            handleRemoveRoute(selectedRakeForRemove.route?._id || '');
        }
        setRemoveConfirmationOpen(false);
        setSelectedRakeForRemove(null);
    };
    
    const handleRemoveCancel = () => {
        setRemoveConfirmationOpen(false);
        setSelectedRakeForRemove(null);
    };
    

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

    const getFilterChipStyle = (filter: string, isActive: boolean) => {
        if (!isActive) {
            return {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                color: 'rgba(0, 0, 0, 0.87)',
                fontWeight: 'normal'
            };
        }

        switch (filter) {
            case 'SFTO':
                return {
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    fontWeight: 'bold'
                };
            case 'BFNV':
                return {
                    backgroundColor: '#FF9800',
                    color: 'white',
                    fontWeight: 'bold'
                };
            case 'GPWIS':
                return {
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    fontWeight: 'bold'
                };
        }
    };

    const paginatedRakeList = rakeList.slice(
        page * rowsPerPage, 
        page * rowsPerPage + rowsPerPage
    );

    const handleLinkRoute = async (rake: RakeData) => {
        try {
            if (!rake.route || !rake.route._id) {
                showMessage('No route information available', 'warning');
                return;
            }
    
            const routeId = rake.route._id;
    
            const response = await httpsPost('cr_rakes/linkRoute', {
                rake: rake.route._id,
                route: rake.route.via[0]
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

    return (
        <div className="wrapper">
            <div className="filter-container">
                <div className="filter-buttons">
                    {['SFTO', 'BFNV', 'GPWIS'].map((filter) => (
                        <Chip 
                            key={filter}
                            label={filter === 'GPWIS' ? 'GPWIS' : `SFTO-${filter}`}
                            onClick={() => handleRakeFilterClick(filter)}
                            style={getFilterChipStyle(filter, activeRakeFilter === filter)}
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
                        rowsPerPageOptions={[5, 10, 25, 100]}
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
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={8}></TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Remaining KM</TableCell>
                                    <TableCell colSpan={4}></TableCell>
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
                                                <span>{timeService.utcToist(rake.bpc.exp, 'dd-MM-yyyy HH:mm')}</span>
                                        </TableCell>
                                        <TableCell>
                                                <span>{(rake.bpc.rem_km) || 'N/A'}</span>
                                        </TableCell>
                                        <TableCell>{rake.fois_date}</TableCell>
                                        <TableCell>{rake.updated_at}</TableCell>
                                        <TableCell>{rake.route ? rake.route.name : 'N/A'}</TableCell>
                                        <TableCell>
                                        <Grid container spacing={1} alignItems="center">
                                            <Grid item>
                                                <Dialog
                                                    open={linkConfirmationOpen}
                                                    onClose={handleLinkCancel}
                                                    maxWidth="md"
                                                    BackdropProps={{
                                                        style: {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                                                        }
                                                    }}
                                                >
                                                    <DialogTitle>
                                                        Confirm Route Linking
                                                    </DialogTitle>
                                                    <DialogContent>
                                                        <DialogContentText>
                                                            Are you sure you want to link this route to the rake?
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={handleLinkCancel} color="secondary">
                                                            No
                                                        </Button>
                                                        <Button onClick={handleLinkConfirmation} color="primary" autoFocus>
                                                            Yes
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
                                                <Button 
                                                    variant="outlined" 
                                                    color="primary" 
                                                    size="small"
                                                    onClick={() => handleLinkButtonClick(rake)}
                                                >
                                                    Link
                                                </Button>
                                                </Grid>
                                                    <Grid item>
                                                    <Dialog
                                                    open={removeConfirmationOpen}
                                                    onClose={handleRemoveCancel}
                                                    maxWidth="md"
                                                    BackdropProps={{
                                                        style: {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                                                        }
                                                    }}
                                                >
                                                    <DialogTitle>
                                                        Confirm Route Removal
                                                    </DialogTitle>
                                                    <DialogContent>
                                                        <DialogContentText>
                                                            Are you sure you want to remove the route from this rake?
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={handleRemoveCancel} color="secondary">
                                                            No
                                                        </Button>
                                                        <Button onClick={handleRemoveConfirmation} color="primary" autoFocus>
                                                            Yes
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
                                                    <Button 
                                                    variant="outlined" 
                                                    color="secondary" 
                                                    size="small"
                                                    onClick={() => handleRemoveButtonClick(rake)}
                                                >
                                                    Remove
                                                </Button>
                                                </Grid>
                                            </Grid>
                                        </TableCell>
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