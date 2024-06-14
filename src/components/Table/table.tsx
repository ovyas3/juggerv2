'use client'

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Checkbox from '@mui/material/Checkbox';
import { useState, useEffect } from 'react'
import './table.css'
import service from '@/utils/timeService';
import Link from 'next/link';
import { Column, row } from '@/utils/interface';
import { useTranslations } from 'next-intl';



import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

import { Popper, } from '@mui/material';
import Button from '@mui/material/Button';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { httpsPost } from '@/utils/Communication';
import {UPDATE_RAKE_CAPTIVE_ID} from '@/utils/helper'

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'white',
    border: '1px solid #E9E9EB',
    boxShadow: 2,
    borderRadius: '4px',
    p: 2,
};

interface item {
    _id: string,
}

async function rake_update_id(payload : Object) {
    const response = await httpsPost(UPDATE_RAKE_CAPTIVE_ID, payload) 
    console.log("updating")
    console.log(response)
}

function Tags({ rakeCaptiveList , shipmentId, setOpen , setShowActionBox }:any) {

    const t = useTranslations('ORDERS');

    const [selectedItems, setSelectedItems] = useState<item>({
        _id: '',
    });
    const handleSubmit = () => {

        const updatedObject = {
            shipmentId: shipmentId,
            captiveId: selectedItems._id
        };
        console.log(updatedObject)
    
        if(selectedItems._id){
            rake_update_id(updatedObject)
        }

        setOpen(false)
        setShowActionBox(-1)
        setSelectedItems({_id: ''});
    };

    const CustomPopper = (props : any) => {
        return <Popper {...props} style={{ fontSize: '10px' }} placement="bottom-start" />;
    };

    const CustomPaper = (props:any) => {
        return <Paper {...props} style={{ fontSize: '10px' }} />;
    };

    // console.log(updateObject)

    return (
        <div >
            <Stack spacing={1} sx={{ border: 'none', paddingInline: '2px' }}>
                <Autocomplete
                    id="tags-standard"
                    options={rakeCaptiveList}
                    PopperComponent={CustomPopper}
                    PaperComponent={CustomPaper}
                    value={selectedItems}


                    getOptionLabel={(option : any) => option.rake_id || "Select one"}
                    isOptionEqualToValue={(option :any, value) => option.rake_id === value.rake_id}
                    renderOption={(props, option) => (
                        <li {...props} key={`Unnamed-Option-${Math.random()}`}>
                            {option.rake_id || "Unnamed Option"} - {option.name || "Unnamed Option"}
                        </li>
                    )}
                    onChange={(event, newValue) => {
                        setSelectedItems(newValue)
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            label="Shipments"

                            InputProps={{
                                ...params.InputProps,
                                style: { fontSize: '10px', border: 'none' }
                            }}
                            InputLabelProps={{
                                style: { fontSize: '10px', paddingLeft: '5px', border: 'none' }
                            }}
                            sx={{
                                '.mui-38raov-MuiButtonBase-root-MuiChip-root': {
                                    // fontSize:'10px',
                                    m: 0,
                                    p: 0,
                                    height: '22px',
                                    backgroundColor: 'transparent',
                                    mb: '0.5px',
                                    border: 'none'
                                },
                                '.mui-p1olib-MuiAutocomplete-endAdornment': {
                                    top: '-5%',
                                    border: 'none'
                                },
                                '.mui-953pxc-MuiInputBase-root-MuiInput-root::after': {
                                    border: 'none'
                                }
                            }}
                        />
                    )}
                />
            </Stack>
            <div style={{ textAlign: 'end', paddingTop: '8px' }}>
                <Button variant="contained" size='small' color="secondary" style={{ textTransform: 'none' }} onClick={handleSubmit}>{t('submit')}</Button>
            </div>
        </div>
    );
}





const convertArrayToFilteredArray = (inputArray: any) => {
    return inputArray.map((
        item: {
            is_fois_fetched?: any;
            edemand_no?: any;
            FNR?: any;
            delivery_location?: any;
            others?: any;
            remarks?: any;
            allFNRs: any;
            unique_code: string,
            _id: string
        }) => {
        const { edemand_no, FNR, allFNRs, delivery_location, others, remarks, unique_code } = item;
        return {
            _id: item._id,
            edemand: edemand_no,
            fnr: {
                primary: FNR,
                others: allFNRs || 'NA',
                unique_code,
            },
            destination: {
                name: delivery_location.name || 'NA',
                code: delivery_location.code || 'NA'
            },
            material: others.demandedCommodity || 'NA',
            pickupdate: {
                date: others.confirmationDate || 'NA',
            },
            status: {
                name:  'booked',
                code: item.is_fois_fetched || 'NA'
            },
            currentEta: 'NA',
            remarks: 'NA',
            handlingAgent: 'NA',
            action: null,
            iconheader: ''
        }
    });
};


// Main component
export default function TableData({ onSkipLimit, allShipments, rakeCaptiveList }: any) {

    //language controller
    const t = useTranslations("ORDERS")

    //pagination
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    //making edemand column toggle
    const [edemand, setEdemand] = React.useState(true);
    const [showEdemand, setShowEdemad] = React.useState(false);
    
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

    //table header variable
    const [columns, setColumns] = useState<Column[]>([]);

    //destination animation
    const [destinationIndex, setDestinationIndex] = useState(-1)

    // action box toggle
    const [showActionBox, setShowActionBox] = useState(-1)
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    //getting row id to pass it to tag element
    const [rowId, setRowID] = useState('')

    const response = convertArrayToFilteredArray(allShipments)
  

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    function clickActionBox(index: number, id: string) {
        setRowID(id)
        setShowActionBox(prevIndex => (prevIndex === index ? -1 : index));
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            const actionButton = target.closest('.action_icon'); // Check if clicked inside action button
    
            if (!actionButton) {
                setShowActionBox(-1); // Close action box if clicked outside
            }
        }
    
        if (showActionBox !== -1) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    
        return () => {
            document.removeEventListener('mousedown', handleClickOutside); // Clean up event listener on component unmount
        };
    }, [showActionBox]);

    useEffect(() => {
        const commonColumns: Column[] = [
            { id: 'fnr', label: 'FNR No.', class: 'fnr', innerClass: 'inner_fnr' },
            { id: 'destination', label: 'Destination', class: 'destination', innerClass: '' },
            { id: 'material', label: 'Material', class: 'material', innerClass: '' },
            { id: 'pickupdate', label: 'Pickup Date', class: 'pickupdate', innerClass: '' },
            { id: 'status', label: 'Status', class: 'status', innerClass: 'inner_status' },
            { id: 'currentEta', label: 'Current ETA', class: 'currentEta', innerClass: '' },
            { id: 'remarks', label: 'Remarks', class: 'remarks', innerClass: '' },
            { id: 'handlingAgent', label: 'Handling Agent', class: 'handlingAgent', innerClass: '' },
            { id: 'action', label: 'Action', class: 'action', innerClass: '' },
            { id: 'iconheader', label: <IconButton onClick={() => { setShowEdemad(!showEdemand) }}><MoreVertIcon /></IconButton>, class: 'iconheader', innerClass: 'inner_iconheader' },
        ];

        if (edemand) {
            commonColumns.unshift({ id: 'edemand', label: 'E Demand', class: 'edamand', innerClass: '' });
        }

        onSkipLimit(rowsPerPage, page * rowsPerPage)

        setColumns(commonColumns);
    }, [edemand, showEdemand, rowsPerPage, page]);

  

    return (
        <div className='target'>
            <Paper
                sx={{
                    width: '100%', overflow: 'hidden', boxShadow: 'none',
                    '.mui-78c6dr-MuiToolbar-root-MuiTablePagination-toolbar ': {
                        padding: '0 2 0 24',
                    },
                    '    .mui-78c6dr-MuiToolbar-root-MuiTablePagination-toolbar': {
                        minHeight: 40
                    },
                    '.mui-dmz9g-MuiTableContainer-root ': {
                        border: ' 1px solid #E9E9EB',
                        borderRadius: '8px'
                    },
                }}>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={response.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                <TableContainer sx={{ maxHeight: '530px', border: '1px solid #E9E9EB', borderRadius: '8px' }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead sx={{
                            '.mui-y8ay40-MuiTableCell-root ': { padding: 0 },
                            '.mui-78trlr-MuiButtonBase-root-MuiIconButton-root ': { width: '5px' }
                        }}>
                            <TableRow >
                                {columns.map((column) => {
                                    return (
                                        <TableCell
                                            key={column.id}
                                            style={{ fontSize: 12, fontWeight: 'bold', color: '#7C7E8C', paddingLeft: '10px' }}
                                            className={column.class}

                                        >
                                            <div className={column.innerClass}>
                                                <div>
                                                    {column.label}
                                                    {
                                                        column.id === 'edemand' && edemand ?
                                                            <div></div>
                                                            : <></>
                                                    }
                                                    {
                                                        column.id === 'iconheader' && showEdemand ?
                                                            <div className='inner_iconheader_before'>
                                                                <Checkbox {...label} size='small' checked={edemand}
                                                                    onClick={() => { setEdemand(edemand => !edemand) }}
                                                                />
                                                                <div style={{ color: 'black', fontWeight: 'normal' }}>{t('edemand')}</div>
                                                            </div>
                                                            : <></>
                                                    }
                                                </div>

                                            </div>

                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {response.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: row, firstindex: number) => {
                                return (
                                    <TableRow hover key={row.edemand}>

                                        {columns.map((item, index) => {
                                            // @ts-ignore
                                            const value: any = row[item.id];
                                            const columnClassNames: any = {
                                                edemand: 'body_edemand',
                                                fnr: 'body_fnr',
                                                destination: 'body_destination',
                                                material: 'body_material',
                                                pickupdate: 'body_pickupdate',
                                                ownedby: 'body_ownedby',
                                                status: 'body_status',
                                                initialETAL: 'body_initialETA',
                                                currentEta: 'body_currentEta',
                                                remarks: 'body_remarks',
                                                handlingAgent: 'body_handlingAgent',
                                                action: 'body_action',
                                                iconheader: 'body_iconheader'
                                            }

                                            return (
                                                <TableCell key={index} sx={{ fontSize: '12px', color: '#44475B', p: '16px 10px 16px 10px' }}
                                                    className={columnClassNames[item.id]} >
                                                    <div>
                                                        {(typeof value) === 'object' ? '' : value}
                                                        {item.id === 'action' ? (
                                                            <div className='action_icon'>
                                                                <MoreHorizIcon
                                                                    style={{ color: 'white', cursor: 'pointer' }}
                                                                    onClick={() => { clickActionBox(firstindex, row._id); }}
                                                                />
                                                                <div
                                                                    className={`action_button_target ${showActionBox === firstindex ? 'show' : ''}`}
                                                                >
                                                                    <Button variant="contained" size='small' color="secondary" style={{ textTransform: 'none' }} onClick={() => handleOpen()} >{t('attach')}</Button>

                                                                    <Modal
                                                                        open={open}
                                                                        onClose={handleClose}
                                                                        aria-labelledby="modal-modal-title"
                                                                        aria-describedby="modal-modal-description"
                                                                        BackdropProps={{
                                                                            sx: {
                                                                                opacity: 0.7,
                                                                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                                            },
                                                                        }}
                                                                    >
                                                                        <Box sx={style}>

                                                                            <Tags rakeCaptiveList={rakeCaptiveList}
                                                                                shipmentId={rowId}
                                                                                setOpen={setOpen}
                                                                                setShowActionBox={setShowActionBox}
                                                                            />
                                                                        </Box>
                                                                    </Modal>

                                                                </div>
                                                            </div>
                                                        ) : null}
                                                        {
                                                            item.id === 'fnr' ?
                                                                <div className='fnr_container'>
                                                                    <div className='fnr_inner_data'>
                                                                        <Link target="_blank"
                                                                            href={"/tracker?unique_code=" + value.unique_code}
                                                                        >
                                                                            {value.primary}
                                                                        </Link>
                                                                    </div>

                                                                    <div className='fnr_inner_inner_nachoes'>{value.allFNRs}</div>
                                                                </div>
                                                                : <></>
                                                        }
                                                        {
                                                            item.id === 'destination' ?
                                                                <div style={{ position: 'relative' }} >
                                                                    <div className=''
                                                                        onMouseOver={() => { setDestinationIndex(firstindex) }}
                                                                        onMouseLeave={() => { setDestinationIndex(-1) }}
                                                                    >{value.code}</div>
                                                                    <div
                                                                        style={{
                                                                            opacity: destinationIndex === firstindex ? 1 : 0, position: 'absolute',
                                                                            border: ' 1px solid #DFE3EB',
                                                                            scale: 0.8,
                                                                            padding: '2px 5px 2px 5px',
                                                                            top: -22,
                                                                            left: 15,
                                                                            backgroundColor: 'white',
                                                                            borderRadius: '8px'
                                                                        }}
                                                                    >{value.name}</div>
                                                                </div>
                                                                : <></>
                                                        }
                                                        {
                                                            item.id === 'pickupdate' ?

                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    {service.utcToist(value.date)}
                                                                </div>
                                                                : <></>
                                                        }
                                                        {/* {
                                                            item.id === 'currentEta' ?

                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <div>{formatDateTime(row.pickupdate).formattedDate}</div>
                                                                    <div>{formatDateTime(row.pickupdate).timeString}</div>
                                                                </div>
                                                                : <></>
                                                        } */}
                                                        {
                                                            item.id === 'status' ?
                                                            <div className='status_container'>
                                                                <div className='status_title'>{value.name}</div>
                                                                <div className='status_body'>{value.code}</div>
                                                            </div>
                                                            :<></>
                                                        }
                                                    </div>
                                                </TableCell>
                                            );
                                        })}

                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

        </div>
    );
}





