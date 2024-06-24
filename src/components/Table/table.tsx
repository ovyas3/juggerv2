/* eslint-disable @next/next/no-img-element */
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
import { UPDATE_RAKE_CAPTIVE_ID } from '@/utils/helper'
import { statusBuilder } from '../MapView/StatusBuilder/StatusBuilder';

import FOIS from '@/assets/fois_icon.png'
import GPIS from '@/assets/gps_icon.svg'
import attach_icon from '@/assets/attach_icon.svg'
import ShareIcon from '@mui/icons-material/Share';
import contactIcon from '@/assets/inactive_contact_dashboard+icon.svg'

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

async function rake_update_id(payload: Object) {
    const response = await httpsPost(UPDATE_RAKE_CAPTIVE_ID, payload)
    console.log("updating")
    console.log(response)
}

function Tags({ rakeCaptiveList, shipmentId, setOpen, setShowActionBox }: any) {

    const t = useTranslations('ORDERS');

    const [selectedItems, setSelectedItems] = useState<item>({
        _id: '',
    });
    const handleSubmit = (e: any) => {
        e.stopPropagation();

        const updatedObject = {
            shipmentId: shipmentId,
            captiveId: selectedItems._id
        };
        console.log(updatedObject)

        if (selectedItems._id) {
            rake_update_id(updatedObject)
        }

        setOpen(false)
        setShowActionBox(-1)
        setSelectedItems({ _id: '' });
    };

    const CustomPopper = (props: any) => {
        return <Popper {...props} style={{ fontSize: '10px' }} placement="bottom-start" />;
    };

    const CustomPaper = (props: any) => {
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


                    getOptionLabel={(option: any) => option.rake_id || "Select one"}
                    isOptionEqualToValue={(option: any, value) => option.rake_id === value.rake_id}
                    renderOption={(props, option) => (
                        <li {...props} key={`Unnamed-Option-${Math.random()}`}>
                            {option.rake_id || "Unnamed Option"} - {option.name || "Unnamed Option"}
                        </li>
                    )}
                    onChange={(event, newValue) => {
                        event.stopPropagation();
                        console.log('this is triggering')
                        setSelectedItems(newValue)
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            label="Captive Rakes"

                            InputProps={{
                                ...params.InputProps,
                                style: { fontSize: '12px', border: 'none' }
                            }}
                            InputLabelProps={{
                                style: { fontSize: '12px', paddingLeft: '5px', border: 'none' }
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
                <Button variant="contained" size='small' color="secondary" style={{ textTransform: 'none' }} onClick={(e) => { handleSubmit(e) }}>{t('submit')}</Button>
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
            _id: string,
            status: string,
            pickup_date: any,
            fois: any,
            // validationForAttachRake:Boolean,
            captive_id: string,
            is_captive: Boolean,
            trip_tracker: any,
        }) => {
        const { edemand_no, FNR, allFNRs, delivery_location, trip_tracker, others, remarks, unique_code, status, pickup_date, captive_id, is_captive } = item;
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
                date: pickup_date || 'NA',
            },
            status: {
                name: statusBuilder(status),
                code: status || ''
            },
            currentEta: 'NA',
            remarks: 'NA',
            handlingAgent: 'NA',
            action: null,
            iconheader: '',
            fois: {
                is_fois: trip_tracker && trip_tracker.fois_last_location ? true : false,
                is_gps: trip_tracker && trip_tracker.gps_last_location ? true : false,
            },


            validationForAttachRake: !captive_id && is_captive

        }
    });
};




// Main component
export default function TableData({ onSkipLimit, allShipments, rakeCaptiveList, count, statusForShipment }: any) {

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
    const handleOpen = (e: any) => { e.stopPropagation(); setOpen(true); };
    const handleClose = (e: any) => { e.stopPropagation(); setOpen(false); }
    const [fnr, setFnr] = useState('')

    //getting row id to pass it to tag element
    const [rowId, setRowID] = useState('')
    const [response, setResponse] = useState([])

    //search fnr 
    const [settingFnrChange, setSettingFnrChange] = useState('');


    const handleRRDoc = (id: string) => {  // for rr documents
        console.log('working:', id)
    }

    const handleChangeByFnr = (changeFnr: string) => {
        setSettingFnrChange(changeFnr)
        if (changeFnr === '') {
            const resData = convertArrayToFilteredArray(allShipments)
            setResponse(resData)
        } else {
            const resData = convertArrayToFilteredArray(allShipments)
            const filteredData = resData.filter((item: { fnr: { primary: string | string[]; }; }) => item.fnr.primary.includes(changeFnr));
            setResponse(filteredData)
        }
    }
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
        setSettingFnrChange('')
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    function clickActionBox(e: React.MouseEvent<SVGSVGElement, MouseEvent>, index: number, id: string) {
        e.stopPropagation();
        setRowID(id);
        setShowActionBox(prevIndex => (prevIndex === index ? -1 : index));
    }

    useEffect(() => {
        const resData = convertArrayToFilteredArray(allShipments)
        console.log(statusForShipment)
        if (statusForShipment === 'All') {
            setResponse(resData)
        } else {
            const filteredData = resData.filter(shipment => shipment.status.name === statusForShipment);
            console.log(filteredData)
            setResponse(filteredData)
        }

        setSettingFnrChange('')
    }, [allShipments, page, statusForShipment])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // if (showActionBox !== -1) {
            //     event.stopPropagation();
            // }
            event.stopPropagation();
            const target = event.target as HTMLElement;
            const actionButton = target.closest('.action_icon'); // Check if clicked inside action button

            if (!actionButton && showActionBox !== -1) {
                event.stopPropagation();
                console.log('this is triggering ')
                console.log(event)
                setShowActionBox(-1); // Close action box if clicked outside
            }
            event.stopPropagation();
        }

        console.log('this is hrfhefgvhfghd')

        if (showActionBox !== -1) {
            document.addEventListener('mousedown', handleClickOutside);

        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            console.log('this is triggerdfhghfssdsd');
            document.removeEventListener('mousedown', handleClickOutside); // Clean up event listener on component unmount
        };
    }, [showActionBox]);

    useEffect(() => {
        onSkipLimit(rowsPerPage, page * rowsPerPage)
    }, [rowsPerPage, page]);

    useEffect(() => {
        const commonColumns: Column[] = [
            { id: 'fnr', label: '', class: 'fnr', innerClass: 'inner_fnr' },
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
            commonColumns.unshift({ id: 'edemand', label: 'e-Demand', class: 'edamand', innerClass: '' });
        }
        setColumns(commonColumns);
    }, [edemand, showEdemand,])

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
                    '.mui-1briqcb-MuiTableCell-root': {
                        fontFamily: 'inherit'
                    }
                }}>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={count}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Shipments per page:"
                />
                <TableContainer sx={{ maxHeight: '594px', border: '1px solid #E9E9EB', borderRadius: '8px' }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead sx={{
                            '.mui-y8ay40-MuiTableCell-root ': { padding: 0 },
                            '.mui-78trlr-MuiButtonBase-root-MuiIconButton-root ': { width: '5px' },
                            '.mui-y8ay40-MuiTableCell-root': { fontFamily: 'inherit' }
                        }}>
                            <TableRow >
                                {columns.map((column) => {
                                    return (
                                        <TableCell
                                            key={column.id}
                                            style={{ fontSize: 12, fontWeight: 'bold', color: '#484A57', paddingLeft: '10px' }}
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
                                                    {
                                                        column.id === 'fnr' ?
                                                            <div>
                                                                <input type='text'
                                                                    onChange={(e) => {
                                                                        handleChangeByFnr(e.target.value)
                                                                    }}
                                                                    value={settingFnrChange}
                                                                    placeholder='FNR No.'
                                                                    style={{
                                                                        width: '82px',
                                                                        height: '22px',
                                                                        border: 'none',
                                                                        textAlign: 'center',
                                                                        fontSize: '12px',
                                                                        color: '#484A57',
                                                                        fontWeight: 'bold',
                                                                        outline: 'none',
                                                                    }}
                                                                    className="custom-placeholder"
                                                                />

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
                            {response.map((row: row, firstindex: number) => {
                                return (
                                    <TableRow hover key={row.edemand}
                                        onClick={() => { handleRRDoc(row._id) }}
                                    >

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
                                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                                <div className='action_icon'>
                                                                    <MoreHorizIcon
                                                                        style={{ color: 'white', cursor: 'pointer', scale: '0.9' }}
                                                                        onClick={(e) => { clickActionBox(e, firstindex, row._id); }}
                                                                    />
                                                                    <div
                                                                        className={`action_button_target ${showActionBox === firstindex ? 'show' : ''}`}
                                                                    >
                                                                        <div className='action_button_options'>
                                                                            <div className='action_items' onClick={(e) => handleOpen(e)}

                                                                                style={{ display: row.validationForAttachRake ? '' : 'none' }}
                                                                            >
                                                                                <div >
                                                                                    <img src={attach_icon.src} alt=''
                                                                                        style={{ display: 'block' }} />
                                                                                </div>
                                                                                <div style={{ paddingTop: '3px' }}>{t('attach')}</div>
                                                                            </div>
                                                                            <div className='action_items' style={{ gap: '10px' }}>
                                                                                <div>
                                                                                    <ShareIcon style={{ fontSize: '15px', color: '#3352FF' }} />
                                                                                </div>
                                                                                <div>{t('share')}</div>
                                                                            </div>
                                                                            <div className='action_items'>
                                                                                <div style={{ width: '20px', height: '20px' }}><img src={contactIcon.src} alt='' style={{ objectFit: 'contain', height: '100%', width: '100%' }} /></div>
                                                                                <div>{t('contact')}</div>
                                                                            </div>
                                                                        </div>

                                                                        <Modal
                                                                            open={open}
                                                                            onClose={(e) => { handleClose(e) }}
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
                                                                            opacity: destinationIndex === firstindex ? 1 : 0,
                                                                            position: 'absolute',
                                                                            border: ' 1px solid #DFE3EB',
                                                                            scale: 0.8,
                                                                            padding: '2px 5px 2px 5px',
                                                                            top: -22,
                                                                            left: 15,
                                                                            backgroundColor: 'white',
                                                                            borderRadius: '4px',
                                                                            transition: 'all 0.2s ease-in-out',
                                                                            boxShadow: ' 0px 4px 8px grey',
                                                                            fontWeight: '600'
                                                                        }}
                                                                    >{value.name}</div>
                                                                </div>
                                                                : <></>
                                                        }
                                                        {
                                                            item.id === 'pickupdate' ?

                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <div>{service.utcToist(value.date)}</div>
                                                                    <div>{service.utcToistTime(value.date)}</div>
                                                                </div>
                                                                : <></>
                                                        }
                                                        {
                                                            item.id === 'status' ?
                                                                <div className='status_container'>
                                                                    <div className={` ${value.name === t('intransit') ? 'status_title_In_Transit' : value.name === t('delivered') ? 'status_title_Delivered' : 'status_title_In_Plant'}`}>
                                                                        <div>{value.name}</div>
                                                                    </div>
                                                                    <div className='status_body'>{value.code}</div>
                                                                </div>
                                                                : <></>
                                                        }
                                                        {
                                                            item.id === 'edemand' ?
                                                                <div className='edemand_fois_gpis' style={{ marginBottom: '5px' }}>
                                                                    <img
                                                                        src={row.fois.is_gps && GPIS.src} style={{ display: 'block' }}
                                                                        alt=''
                                                                    /><img
                                                                        src={row.fois.is_fois && FOIS.src}
                                                                        style={{ display: 'block' }}
                                                                        alt=''
                                                                    />
                                                                </div>
                                                                : <></>
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





