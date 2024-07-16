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
import { useState, useEffect, useRef, useCallback } from 'react'
import './table.css'
import service from '@/utils/timeService';
import Link from 'next/link';
import { Column, row, tagItem } from '@/utils/interface';
import { useTranslations } from 'next-intl';
import RRModal from '../RR Modal/RRModal';
// import { useSnackbar } from '@/hooks/snackBar';


import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

import { Popper, } from '@mui/material';
import Button from '@mui/material/Button';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { httpsPost } from '@/utils/Communication';
import { UPDATE_RAKE_CAPTIVE_ID, REMARKS_UPDATE_ID, FETCH_TRACK_DETAILS } from '@/utils/helper'
import { statusBuilder } from '../MapView/StatusBuilder/StatusBuilder';

import FOIS from '@/assets/fois_icon.png'
import GPIS from '@/assets/gps_icon.svg'
import RRDOC from '@/assets/Doc-icon.svg'
import attach_icon from '@/assets/attach_icon.svg'
import rrDocumentIcon from '@/assets/rr_document_icon.svg'
import ShareIcon from '@mui/icons-material/Share';
import fetchTrackDetailsIcon from '@/assets/polylines_icon.svg'
import contactIcon from '@/assets/inactive_contact_dashboard+icon.svg'
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, MenuItem } from '@mui/material';
import './style.css'
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import { sortArray, separateLatestObject ,calculateDaysDifference} from '@/utils/hooks';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Popover from '@mui/material/Popover';
import { Typography, } from '@mui/material';
import { useSnackbar } from '@/hooks/snackBar';
import captiveRakeIndicator from '@/assets/captive_rakes.svg'
import wagonIcon from '@/assets/captive_rakes_no_wagons.svg'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import dividerLine from '@/assets/divider_line.svg'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';



async function rake_update_id(payload: Object) {
    return await httpsPost(UPDATE_RAKE_CAPTIVE_ID, payload);
}

async function remake_update_By_Id(payload: object) {
    const response = await httpsPost(REMARKS_UPDATE_ID, payload);
    return response;
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
            eta: string,
            all_FNRs: any;
            unique_code: string,
            _id: string,
            status: string,
            pickup_date: any,
            fois: any,
            rr_document: any,
            captive_id: string,
            is_captive: Boolean,
            trip_tracker: any,
            etaTime: any,
            polyline: any,
            past_etas: any,
            no_of_wagons: number,
            received_no_of_wagons: number,
            demand_date:any,
            paid_by:string,
        }) => {
        const { edemand_no, FNR, all_FNRs, delivery_location, trip_tracker, others, remarks, unique_code, status, pickup_date, captive_id, is_captive, eta, rr_document, polyline, past_etas, no_of_wagons, received_no_of_wagons, demand_date,paid_by } = item;
        return {
            _id: item._id,
            edemand: edemand_no,
            fnr: {
                primary: FNR,
                others: all_FNRs || 'NA',
                unique_code,
            },
            destination: {
                name: delivery_location?.name ?? 'NA',
                code: delivery_location?.code ?? 'NA'
            },
            material: others.demandedCommodity || 'NA',
            pickupdate: {
                date: service.utcToist(pickup_date) || 'NA',
                pickupTime: service.utcToistTime(pickup_date) || 'NA'
            },
            status: {
                name: statusBuilder(status),
                code: (status === "Delivered" || status === "OB") ? null : ((trip_tracker && trip_tracker.fois_last_location) || '')
            },
            currentEta: {
                date: service.utcToist(eta) || 'NA',
                etaTime: service.utcToistTime(eta) || 'NA'
            },
            remarks: remarks.length === 0 ? "NA" : {
                latest: separateLatestObject(remarks).latest?.remark || "NA",
                rest: separateLatestObject(remarks)?.rest || "NA"
            },
            handlingAgent: 'NA',
            action: null,
            iconheader: '',
            fois: {
                is_fois: trip_tracker && trip_tracker.fois_last_location ? true : false,
                is_gps: trip_tracker && trip_tracker.gps_last_location ? true : false,
            },
            validationForAttachRake: !captive_id && is_captive,
            polyline: polyline,
            eta: eta,
            pickup_date: pickup_date,
            rrDoc: rr_document && rr_document.length > 0 ? true : false,
            past_etas: past_etas ? past_etas : 'NA',
            // deliverDate: 'NA',
            received_no_of_wagons : received_no_of_wagons ?  received_no_of_wagons : 'NA',
            no_of_wagons : no_of_wagons ?  no_of_wagons : 'NA',
            is_captive: is_captive && is_captive,
            daysAging : calculateDaysDifference(demand_date,pickup_date),
            paid_by:paid_by ? paid_by : 'NA',
        }
    });
};




// Main component
export default function TableData({ onSkipLimit, allShipments, rakeCaptiveList, count, onFnrChange, reload, remarksList, setTriggerShipments, triggerShipments, getAllShipment }: any) {

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
    const handleOpen = (e: any) => { e.stopPropagation(); setOpen(true); setActionOptions(e.currentTarget.id) };
    const handleClose = (e: any) => { e.stopPropagation(); setOpen(false); }
    const [isRRModalOpen, setRRModalOpen] = useState<boolean>(false);
    const [isRRDoc, setIsRRDoc] = useState<boolean>(false);
    const [rrNumbers, setRRNumbers] = useState([]);
    const [fnr, setFnr] = useState('')

    //getting row id to pass it to tag element
    const [rowId, setRowID] = useState('')
    const [response, setResponse] = useState([])

    //search fnr 
    const [settingFnrChange, setSettingFnrChange] = useState('');

    // all Fnr Show toggle
    const [showAllFnr, setShowAllFnr] = useState(-1)

    //trigger action options
    const [actionOptions, setActionOptions] = useState('')

    // pickup sorting filter
    const [pickupSorting, setPickupSorting] = useState(false)

    //currentETA sorting filter
    const [currentETAsorting, setCurrentETAsorting] = useState(false)


    const handleRRDoc = (id: any) => {  // for rr documents
        setRRModalOpen(true);
        const rrNums = allShipments.filter((shipment: any) => shipment._id === id)[0].all_FNRs;
        setRRNumbers(rrNums);
        const rrDocumnets = allShipments.filter((shipment: any) => shipment._id === id)[0].rr_document;
        const isRRDocument = rrDocumnets && rrDocumnets.length > 0;
        setIsRRDoc(isRRDocument);
    }

    const handleChangeByFnr = (changeFnr: string) => {
        if (changeFnr.length === 11) {
            setSettingFnrChange(changeFnr)
            onFnrChange(changeFnr)
            setPage(0);
        } else {
            if (!changeFnr) onFnrChange(changeFnr);
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
    }
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
        setSettingFnrChange(settingFnrChange);
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

    const { showMessage } = useSnackbar();

    async function fetchTrackDetails(rake_id: any) {
        const payload = {
            rakeId: rake_id
        }
        httpsPost(FETCH_TRACK_DETAILS, payload).then((res) => {
            if (res && res.statusCode == 200) {
                showMessage('Track Details Fetched Successfully.', 'success')
                setTriggerShipments(!triggerShipments)
            } else {
                showMessage('Error Fetching Track Details.', 'error')
            }

        }).catch((err) => {
            showMessage('Error Fetching Track Details.', 'error')
        })

    }


    useEffect(() => {
        const etaResult = sortArray(allShipments, 'eta', currentETAsorting ? 'dec' : 'asc');
        const resData = convertArrayToFilteredArray(etaResult)
        setResponse(resData)
    }, [currentETAsorting])

    useEffect(() => {
        const pickupResult = sortArray(allShipments, 'pickup_date', pickupSorting ? 'dec' : 'asc');
        const etaResult = sortArray(allShipments, 'eta', currentETAsorting ? 'dec' : 'asc');
        const resData = convertArrayToFilteredArray(pickupResult)
        setResponse(resData)
        if (settingFnrChange.length) {
            setSettingFnrChange(settingFnrChange)
        } else { setSettingFnrChange('') }
    }, [allShipments, pickupSorting])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            event.stopPropagation();
            const target = event.target as HTMLElement;
            const actionButton = target.closest('.action_icon');
            if (!actionButton && showActionBox !== -1) {
                event.stopPropagation();
                setShowActionBox(-1); // Close action box if clicked outside
            }
            event.stopPropagation();
        }
        if (showActionBox !== -1) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActionBox]);

    useEffect(() => {
        onSkipLimit(rowsPerPage, page * rowsPerPage)
    }, [rowsPerPage, page]);

    useEffect(() => {
        const commonColumns: Column[] = [
            { id: 'fnr', label: '', class: 'fnr', innerClass: 'inner_fnr' },
            { id: 'destination', label: 'Destination/Paid By', class: 'destination', innerClass: '' },
            { id: 'material', label: 'Material/Commodities', class: 'material', innerClass: '' },
            { id: 'aging', label: 'Aging', class: 'aging', innerClass: '' },
            { id: 'pickupdate', label: 'Invoiced Date', class: 'pickupdate', innerClass: 'inner_pickup' },
            { id: 'status', label: 'Status', class: 'status', innerClass: 'inner_status' },
            { id: 'currentEta', label: 'Current ETA', class: 'currentEta', innerClass: 'inner_eta' },
            { id: 'deliverDate', label: 'Delivered Date', class: 'deliverDate', innerClass: '' },
            { id: 'remarks', label: 'Remarks', class: 'remarks', innerClass: '' },
            { id: 'handlingAgent', label: 'Handling Agent', class: 'handlingAgent', innerClass: '' },
            { id: 'action', label: 'Action', class: 'action', innerClass: '' },
            { id: 'iconheader', label: <IconButton onClick={() => { setShowEdemad(!showEdemand) }}><MoreVertIcon /></IconButton>, class: 'iconheader', innerClass: 'inner_iconheader' },
        ];

        if (edemand) {
            commonColumns.unshift({ id: 'edemand', label: 'e-Demand', class: 'edemand', innerClass: '' });
        }
        setColumns(commonColumns);
    }, [edemand, showEdemand,])

    useEffect(() => {
        setSettingFnrChange('')
    }, [reload])

    return (
        <div className='target' >
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
                        borderRadius: '8px',

                    },
                    '.mui-1briqcb-MuiTableCell-root': {
                        fontFamily: 'inherit'
                    },
                    '.mui-1ncgey5-MuiTableContainer-root': {

                    }
                }}>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    component="div"
                    count={count}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Shipments per page:"
                />
                <TableContainer sx={{
                    border: '1px solid #E9E9EB', borderRadius: '8px', maxHeight: 'calc(90vh - 100px)',
                    overflowY: 'scroll',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                    scrollbarWidth: 'none',
                    '-ms-overflow-style': 'none',

                }}>
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
                                                {column.label}
                                                {/* {
                                                    column.id === 'edemand' && edemand ?
                                                        <div></div>
                                                        : <></>
                                                } */}
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
                                                                className="custom-placeholder"
                                                            />
                                                        </div>
                                                        : <></>
                                                }
                                                {
                                                    column.id === 'pickupdate' ?
                                                        <div style={{
                                                            transform: pickupSorting ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transformOrigin: 'center center',
                                                            transition: 'transform 0.3s ease-in-out',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                            onClick={() => { setPickupSorting(!pickupSorting) }}
                                                        ><ArrowDownwardIcon
                                                                fontSize='small'
                                                                style={{ color: 'darkgrey' }}
                                                            /></div>
                                                        : <></>
                                                }
                                                {
                                                    column.id === 'currentEta' ?
                                                        <div style={{
                                                            transform: currentETAsorting ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transformOrigin: 'center center',
                                                            transition: 'transform 0.3s ease-in-out',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                            onClick={() => { setCurrentETAsorting(!currentETAsorting) }}
                                                        ><ArrowDownwardIcon
                                                                fontSize='small'
                                                                style={{ color: 'darkgrey' }}
                                                            /></div>
                                                        : <></>
                                                }

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
                                        onClick={(e) => { handleRRDoc(row._id) }}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        {columns.map((item, index) => {
                                            // @ts-ignore
                                            const value: any = row[item.id];
                                            const columnClassNames: any = {
                                                edemand: 'body_edemand',
                                                fnr: 'body_fnr',
                                                destination: 'body_destination',
                                                material: 'body_material',
                                                aging:'body_aging',
                                                pickupdate: 'body_pickupdate',
                                                ownedby: 'body_ownedby',
                                                status: 'body_status',
                                                initialETAL: 'body_initialETA',
                                                currentEta: 'body_currentEta',
                                                deliverDate:'body_deliveryDate',
                                                remarks: 'body_remarks',
                                                handlingAgent: 'body_handlingAgent',
                                                action: 'body_action',
                                                iconheader: 'body_iconheader'
                                            }
                                            return (
                                                <TableCell key={index} sx={{ fontSize: '12px', color: '#44475B', p: '16px 10px 24px 10px' }}
                                                    className={columnClassNames[item.id]} >
                                                    <div>
                                                        {(typeof value) === 'object' ? '' : value}

                                                        {item.id === 'action' && (
                                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                                <div className='action_icon'>
                                                                    <MoreHorizIcon
                                                                        style={{ color: 'white', cursor: 'pointer', scale: '0.9' }}
                                                                        onClick={(e) => clickActionBox(e, firstindex, row._id)}
                                                                    />
                                                                    <div className={`action_button_target ${showActionBox === firstindex ? 'show' : ''}`}
                                                                    >
                                                                        <div className='action_button_options' onClick={(e) => e.stopPropagation()}>
                                                                            {row.validationForAttachRake && (
                                                                                <ActionItem
                                                                                    icon={<img src={attach_icon.src} alt='' height={"24px"} width={"24px"} />}
                                                                                    text={t('attach')}
                                                                                    onClick={handleOpen}
                                                                                    id='attach'
                                                                                    style={{ gap: '5px' }}
                                                                                />
                                                                            )}
                                                                            <ActionItem
                                                                                icon={<ShareIcon style={{ width: '24px', height: '24px', color: '#3352FF' }} />}
                                                                                text={t('share')}
                                                                                style={{ gap: '7px' }}
                                                                            />
                                                                            <ActionItem
                                                                                icon={<img src={contactIcon.src} alt='' style={{ objectFit: 'contain', height: '24px', width: '24px' }} />}
                                                                                text={t('contact')}
                                                                            />
                                                                            <ActionItem
                                                                                icon={<BookmarkAddOutlinedIcon style={{ width: "24px", height: '24px', color: '#658147' }} />}
                                                                                text={t('addremarks')}
                                                                                onClick={handleOpen}
                                                                                id='remarks'
                                                                            />
                                                                            {!row.polyline &&
                                                                                <ActionItem
                                                                                    icon={<img src={fetchTrackDetailsIcon.src} alt='' style={{ objectFit: 'contain', height: '24px', width: '24px' }} />}
                                                                                    text={t('fetchtrackdetails')}
                                                                                    onClick={() => fetchTrackDetails(row._id)}
                                                                                    id='fetch track details'
                                                                                />
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {item.id === 'fnr' &&
                                                            <div className='fnr_container'>
                                                                <div>Primary</div>
                                                                <div className='fnr_inner_data'>
                                                                    <Link target="_blank"
                                                                        href={"/tracker?unique_code=" + value.unique_code}
                                                                        onClick={(e) => { e.stopPropagation() }}
                                                                    >
                                                                        {value.primary}
                                                                    </Link>
                                                                    <div className={`${value.others.length > 1 && 'all_Pnr_count'}`}
                                                                        onMouseOver={() => { setShowAllFnr(firstindex) }}
                                                                        onMouseLeave={() => { setShowAllFnr(-1) }}
                                                                    >
                                                                        {value.others.length > 1 &&
                                                                            <>
                                                                                <div style={{ cursor: 'pointer' }} >+{value.others.length - 1}</div>
                                                                                <div className='show_Allfnr'
                                                                                    style={{ display: showAllFnr === firstindex ? 'block' : 'none' }}
                                                                                >
                                                                                    <div className='contain_fnr'>
                                                                                        {value.others
                                                                                            .filter((item: string) => item !== value.primary)
                                                                                            .map((item: string, index: number) => {
                                                                                                return <div key={index}>{item}</div>;
                                                                                            })
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className='fnr_logos'>
                                                                    {row.rrDoc &&
                                                                        <div style={{ height: 25, width: 25 }}>
                                                                            <img
                                                                                src={row.rrDoc ? rrDocumentIcon.src : ''}
                                                                                style={{ height: '100%', width: '100%' }}
                                                                                alt=''
                                                                            />
                                                                        </div>
                                                                    }
                                                                    {row.is_captive &&
                                                                        <div style={{ height: 25, width: 25 }}>
                                                                            <img
                                                                                src={row.is_captive ? captiveRakeIndicator.src : ''}
                                                                                style={{ height: '100%', width: '100%' }}
                                                                                alt=''
                                                                            />
                                                                        </div>
                                                                    }
                                                                </div>
                                                            </div>
                                                        }
                                                        {item.id === 'destination' && (
                                                            <div style={{ position: 'relative' }}>
                                                                <div>{value.name !== 'NA' ? value.name : value.code} ({value.code})</div>
                                                                <div>{row.paid_by}</div>
                                                            </div>
                                                        )}
                                                        {item.id === 'pickupdate' && (
                                                            <div>
                                                                {row.pickup_date ? (
                                                                    <>
                                                                        <div>{value.date}</div>
                                                                        <div>{value.pickupTime}</div>
                                                                    </>
                                                                ) : 'NA'}
                                                            </div>
                                                        )}
                                                        {item.id === 'status' &&
                                                            <div className='status_container'>
                                                                <div className={` ${value.name === t('intransit') ? 'status_title_In_Transit' : value.name === t('delivered') ? 'status_title_Delivered' : 'status_title_In_Plant'}`}>
                                                                    <div>{value.name}</div>
                                                                </div>
                                                                <div className='status_body'>{value.code}</div>
                                                            </div>
                                                        }
                                                        {item.id === 'edemand' &&
                                                            <div className='edemand_fois_gpis'>
                                                                <div className='no_of_wagons'>
                                                                    <div className='request_wagons'>
                                                                        <div className='request_wagons_logo'>
                                                                            <img src={wagonIcon.src} alt='' className='request_image' />
                                                                            <ArrowUpwardIcon className='ArrowUpwardIcon' style={{ fontSize: '11px' }} />
                                                                        </div>
                                                                        <div>{row.no_of_wagons}</div>
                                                                        <div className='hover_req'>Wagons requested</div>
                                                                    </div>
                                                                    <div className='divider_wagons'>
                                                                    </div>
                                                                    <div className='received_wagons'>
                                                                        <div className='request_wagons_logo'>
                                                                            <img src={wagonIcon.src} alt='' className='request_image' />
                                                                            <ArrowDownwardIcon className='ArrowDownwardIcon' style={{ fontSize: '11px' }} />
                                                                        </div>
                                                                        <div>{row.received_no_of_wagons}</div>
                                                                        <div className='hover_rece'>Wagons received</div>
                                                                    </div>
                                                                </div>
                                                                <div className='fois_gps_logo'>
                                                                    {row.fois.is_gps &&
                                                                        <img src={GPIS.src} style={{ display: 'block' }} alt='' />
                                                                    }
                                                                </div>
                                                            </div>
                                                        }
                                                        {item.id === 'currentEta' && (
                                                            <div>
                                                                {row.eta ? (
                                                                    <>
                                                                        <div>{value.date}</div>
                                                                        <div>{value.etaTime}</div>
                                                                    </>
                                                                ) : (
                                                                    'NA'
                                                                )}
                                                            </div>
                                                        )}
                                                        {item.id === 'remarks' && (
                                                            <RemarkComponent row={row} firstIndex={firstindex} />
                                                        )}
                                                        {item.id === 'aging' && row.daysAging !== "NA" && (
                                                            <span>{row.daysAging} Days</span>
                                                        )}
                                                        {item.id ==='deliverDate' && (
                                                            <div>
                                                            {row.eta && row.status.name === 'Delivered' ? (
                                                                <>
                                                                    <div>{service.utcToist(row.eta)}</div>
                                                                    <div>{service.utcToistTime(row.eta)}</div>
                                                                </>
                                                            ) : (
                                                                'NA'
                                                            )}
                                                            </div>
                                                        )}
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
            <RRModal isOpen={isRRModalOpen} isClose={() => setRRModalOpen(false)} rrNumbers={rrNumbers} isRRDoc={isRRDoc} />
            <Modal
                open={open}
                onClose={(e) => { handleClose(e) }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100000
                }}
            >
                <Box
                    onClick={(e) => { e.stopPropagation() }}
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '30vw',
                        maxHeight: '90vh',
                        position: 'relative',
                        outline: 'none'
                    }}>
                    {actionOptions === 'attach' && <Tags rakeCaptiveList={rakeCaptiveList}
                        shipmentId={rowId}
                        setOpen={setOpen}
                        setShowActionBox={setShowActionBox}
                    />}
                    {actionOptions === 'remarks' && <Remarks
                        shipmentId={rowId}
                        setOpen={setOpen}
                        remarksList={remarksList}
                        getAllShipment={getAllShipment}
                    />}
                </Box>
            </Modal>
        </div>
    );
}

const ActionItem = ({ icon, text, onClick, id, style }: any) => (
    <div className={`action_items `} onClick={onClick} id={id} style={style}>
        <div>{icon}</div>
        <div>{text}</div>
    </div>
);
function Remarks({ shipmentId, setOpen, remarksList, getAllShipment }: any) {
    const [others, setOthers] = useState('')
    const t = useTranslations('ORDERS');
    const placeholder = 'Enter Your Remarks'
    const [remarks, setRemarks] = useState(placeholder);
    const inputRef = useRef<HTMLInputElement>(null);
    const [openRemarks, setOpenRemarks] = useState(false);
    const [inputEnabled, setInputEnabled] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const predefinedRemarks = [
        'Great job!',
        'Needs improvement',
        'Well done',
        'Please revise',
        'Excellent work',
        'Others :',
    ];
    const { showMessage } = useSnackbar();

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    const handlePreDefineRemarks = (remark: string) => {
        setRemarks(remark);
        setOpenRemarks(false)
    };

    function handleothers(e: string) {
        setOthers(e)
    }

    function handleSubmit(e: any) {
        setOpen(false)
        setInputEnabled(true);
        setOpenRemarks(false);
        setRemarks('')
        e.stopPropagation();
        if (remarks.trim() === '') return;
        const remarkObject = {
            id: shipmentId,
            remarks: [
                {
                    date: service.getEpoch(new Date()),
                    remark: remarks === 'Others :' ? others : remarks,
                }
            ]
        }
        if (remarkObject.remarks[0].remark !== placeholder) {
            const response = remake_update_By_Id(remarkObject);
            response.then((res: any) => {
                if (res.statusCode === 200) {
                    showMessage('Remark Updated', 'success');
                    getAllShipment();
                }
            }).catch((err) => {
                console.log(err)
            })
        } else {
            showMessage('select remark', 'error');
        }
        setRemarks('');
    }

    return (
        <div onClick={(e) => { e.stopPropagation(); setOpenRemarks(false) }}>

            <div style={{
                width: '100%',
                backgroundColor: '#3351FF',
                color: 'white',
                borderRadius: '8px 8px 0 0',
                padding: '4px',
                fontSize: '20px',
                paddingLeft: '8px'
            }}>Remarks</div>

            <div style={{ padding: '12px', position: 'relative' }}>
                <div
                    className='remarks_update'
                    onClick={(e) => { e.stopPropagation(); setOpenRemarks(!openRemarks); }}
                >{remarks}{
                        remarks === 'Others :' ?
                            <input
                                onClick={(e) => { e.stopPropagation(); }}
                                onChange={(e) => { handleothers(e.target.value) }}
                                style={{
                                    outline: 'none',
                                    borderTop: '1px solid #E9E9EB',
                                    borderLeft: '1px solid #E9E9EB',
                                    borderRight: '1px solid #E9E9EB',
                                    marginInline: '5px',
                                    backgroundColor: '#E9E9EB',
                                    borderBottom: '1px solid black',
                                    height: '24px'
                                }}
                            /> : <></>
                    }
                </div>
                <ArrowDropDownIcon
                    onClick={() => { setOpenRemarks(!openRemarks) }}
                    className='arrow_down_icon'
                />
                <div className='remarks_dropDown_list' style={{ display: openRemarks ? 'block' : 'none' }}>
                    {predefinedRemarks.map((remark: string, index: number) => (
                        <div
                            key={index}
                            onClick={() => handlePreDefineRemarks(remark)}
                            className='remarks_dropDown_list_item'
                        >{remark}</div>
                    ))}
                </div>
                <div style={{ textAlign: 'end', paddingTop: '8px' }}>
                    <Button variant="contained" size='small' color="secondary" style={{ textTransform: 'none', backgroundColor: '#3351FF' }} onClick={(e) => { handleSubmit(e) }}>{t('submit')}</Button>
                </div>
            </div>
            <div
                style={{
                    height: '32px',
                    width: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: -40,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    zIndex: 999,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.5s ease-in-out',
                    transform: `rotate(${isHovered ? 90 : 0}deg)`
                }}
                onClick={(e) => { e.stopPropagation() }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <CloseIcon
                    onClick={(e) => { e.stopPropagation(); setOpen(false) }}
                />
            </div>
        </div>
    )
}
function Tags({ rakeCaptiveList, shipmentId, setOpen, setShowActionBox }: any) {

    const placeHolder = 'Select One';
    const [item, setItem] = useState(placeHolder)
    const [itemId, setItemID] = useState(null)
    const t = useTranslations('ORDERS');
    const [openCaptiveItems, setOpenCaptiveItems] = useState(false)

    const [isHovered, setIsHovered] = useState(false);
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredList, setFilteredList] = useState(rakeCaptiveList);

    const handleSearch = (e: any) => {
        setSearchTerm(e.target.value);
        setItem(e.target.value);
        setOpenCaptiveItems(true);
    };

    useEffect(() => {
        const filtered = rakeCaptiveList.filter((remark: any) =>
            remark.rake_id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredList(filtered);
    }, [searchTerm, rakeCaptiveList]);

    const handleSubmit = (e: any) => {
        e.stopPropagation();
        const updatedObject = {
            shipmentId: shipmentId,
            captiveId: itemId
        };
        if (updatedObject.captiveId) {
            rake_update_id(updatedObject)
        }

        setOpen(false)

    };

    return (
        <div >
            <div style={{
                width: '100%',
                backgroundColor: '#3351FF',
                color: 'white',
                borderRadius: '8px 8px 0 0',
                padding: '4px',
                fontSize: '20px'
            }}>Captive Rakes</div>
            <div style={{ padding: 16, position: 'relative' }} onClick={(e) => { e.stopPropagation(); setOpenCaptiveItems(false) }}>
                <div className='captiveInput' onClick={(e) => { e.stopPropagation(); setOpenCaptiveItems(!openCaptiveItems) }}>
                    <input
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="select one"
                        style={{
                            width: '100%',
                            backgroundColor: '#E9E9EB',
                            outline: 'none',
                            borderTop: '1px solid #E9E9EB',
                            borderLeft: '1px solid #E9E9EB',
                            borderRight: '1px solid #E9E9EB',
                            padding: '4px',
                            height: '24px'
                        }}
                    />
                </div>
                <ArrowDropDownIcon
                    onClick={() => { }}
                    className='arrow_down_icon_captive'
                />
                <div
                    className='captive_list_box'
                    style={{ display: openCaptiveItems ? 'block' : 'none' }} >
                    {filteredList.map((remark: any, index: number) => (
                        <div
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                setItem(remark.rake_id ?? remark.name);
                                setSearchTerm(remark.rake_id ?? remark.name);
                                setOpenCaptiveItems(false);
                                setItemID(remark._id);
                            }}
                            className='captive_list_item'
                        >
                            <div style={{ width: '136px' }}>{remark.rake_id}</div>
                            <div style={{ paddingInline: '4px' }}>-</div>
                            <div>{remark.name}</div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'end', paddingTop: '8px' }}>
                    <Button variant="contained" size='small' style={{ textTransform: 'none', backgroundColor: '#3351FF' }} onClick={(e) => { handleSubmit(e) }}>{t('submit')}</Button>
                </div>
            </div>
            <div
                style={{
                    height: '32px',
                    width: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: -40,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    zIndex: 999,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.5s ease-in-out',
                    transform: `rotate(${isHovered ? 90 : 0}deg)`
                }}
                onClick={(e) => { e.stopPropagation() }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <CloseIcon
                    onClick={(e) => { e.stopPropagation(); setOpen(false) }}
                />
            </div>
        </div>
    );
}
const RemarkComponent = ({ row, firstIndex }: any) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverOpen = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <Box>
            <Typography
                aria-owns={true ? `mouse-over-popover-${firstIndex}` : undefined}
                aria-haspopup="true"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                sx={{ fontSize: '12px', fontFamily: '"Inter", sans-serif !important', }}
            >
                {row.remarks.latest}
            </Typography>
            {row.remarks.rest && row.remarks.rest.length > 0 && (
                <Popover
                    id={`mouse-over-popover-${firstIndex}`}
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={open}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={handlePopoverClose}
                    disableRestoreFocus
                >
                    <Box sx={{}}>
                        {row.remarks.rest?.map((item: any, remarkListIndex: number) => (
                            <Typography key={remarkListIndex} sx={{ fontSize: '12px', paddingInline: '4px' }}>
                                {item.remark}
                            </Typography>
                        ))}
                    </Box>
                </Popover>
            )}
        </Box>
    );
};




