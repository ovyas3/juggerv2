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
import { useState, useEffect, useRef } from 'react'
import './table.css'
import service from '@/utils/timeService';
import Link from 'next/link';
import { Column, row } from '@/utils/interface';
import { useTranslations } from 'next-intl';
import RRModal from '../RR Modal/RRModal';
import { Tooltip, } from '@mui/material';
import fileUpload from '@/assets/file-upload.svg'

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { httpsPost } from '@/utils/Communication';
import { UPDATE_RAKE_CAPTIVE_ID, REMARKS_UPDATE_ID, FETCH_TRACK_DETAILS, UPDATE_ELD, GET_HANDLING_AGENT_LIST } from '@/utils/helper'
import { statusBuilder } from '../MapView/StatusBuilder/StatusBuilder';
import GPIS from '@/assets/gps_icon.svg'

import attach_icon from '@/assets/attach_icon.svg'
import rrDocumentIcon from '@/assets/rr_document_icon.svg'
import CopyAllIcon from '@mui/icons-material/CopyAll';
import fetchTrackDetailsIcon from '@/assets/polylines_icon.svg'
import contactIcon from '@/assets/inactive_contact_dashboard+icon.svg'
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import './style.css'

import { sortArray, separateLatestObject, calculateDaysDifference, getColorCode, getUniqueValues, processETAs } from '@/utils/hooks';
import Popover from '@mui/material/Popover';
import { useSnackbar } from '@/hooks/snackBar';
import captiveRakeIndicator from '@/assets/captive_rakes.svg'
import wagonIcon from '@/assets/captive_rakes_no_wagons.svg'
import SendTimeExtensionTwoToneIcon from '@mui/icons-material/SendTimeExtensionTwoTone';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import RvHookupIcon from '@mui/icons-material/RvHookup';
import UploadAnnexure from '../uploadAnnexureModal/uploadAnnexureModal';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import UpdateIcon from '@mui/icons-material/Update';
import trash from '@/assets/trash_icon.png'
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { ActionItem, EditELD, HandlingAgentSelection, PastEta, RemarkComponent, Remarks, Tags,MarkPlacement,HandlingEdemand, UploadWagonSheet, HandlingETA, ContactModal, ViewContactModal} from './tableComp'
import SettingsIcon from '@mui/icons-material/Settings';
import { environment } from '@/environments/env.api';
import { useRouter } from 'next/navigation';
import { MarkComplete } from './tableComp';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import { useMediaQuery, useTheme } from '@mui/material';

import TrainIcon from '@mui/icons-material/Train';

const status_class_map: { [key: string]: string } = {
    'OB': 'status_title_In_Plant',
    'AVE': 'status_title_In_Plant',
    'RFD': 'status_title_rfd',
    'ITNS': 'status_title_In_Transit',
    'Delivered': 'status_title_Delivered',
    'INPL': 'status_title_INPL',
    "stabled": 'status_title_stabled',
    "CNCL": 'status_title_CNCL'
}

const convertArrayToFilteredArray = (inputArray: any, shipmentPayloads: any) => {
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
            demand_date: any,
            paid_by: string,
            commodity_desc: any,
            expected_loading_date: any,
            HA: any,
            rr_dates : any,
            placement_time:any,
            indent_no:any,
            drawnout_time:any,
            captive:any,
            fois_updated_at:any,
            materials?: any
        }) => {
        const { edemand_no,captive,fois_updated_at, FNR,placement_time,indent_no, drawnout_time, all_FNRs,rr_dates, delivery_location, trip_tracker, others, remarks, unique_code, status, pickup_date, captive_id, is_captive, eta, rr_document, polyline, past_etas, no_of_wagons, received_no_of_wagons, demand_date, paid_by, commodity_desc, expected_loading_date, HA, materials } = item;
        let newDemandDate = new Date(demand_date);
        newDemandDate.setHours(newDemandDate.getHours() - 5);
        newDemandDate.setMinutes(newDemandDate.getMinutes() - 30);
        let fois_updated_at_date = trip_tracker && trip_tracker[0]?.fois_updated_at ? trip_tracker[0]?.fois_updated_at : null;

        let newRRDate = new Date(rr_dates[0]);
        newRRDate.setHours(newRRDate.getHours() - 5);
        newRRDate.setMinutes(newRRDate.getMinutes() - 30);
        let statusName = trip_tracker && trip_tracker[0]?.fois_last_location 
            ? trip_tracker[0]?.fois_last_location.toLowerCase().includes("stabled") 
                ? "Stabled" 
                : statusBuilder(status) : statusBuilder(status);
        return {
           
            _id: item._id,
            from: shipmentPayloads.from,
            to: shipmentPayloads.to,
            edemand: {
                edemand_no: edemand_no || '--',
            },
            fnr: {
                primary: FNR,
                others: all_FNRs || '--',
                unique_code,
            },
            destination: {
                locationId: delivery_location?._id ?? '--',
                name: delivery_location?.name ?? '--',
                code: delivery_location?.code ?? '--'
            },
            material: {
                name: others?.demandedCommodity || '--',
            },
            materials: materials,
            pickupdate: {
                date: service.utcToist(pickup_date) || '--',
                pickupTime: service.utcToistTime(pickup_date) || '--'
            },
            status: {
                name: statusName,
                code: ( status === "OB" || status === "") ? null : (trip_tracker && trip_tracker[0]?.fois_last_location) || '',
                raw: statusName === 'Stabled' ? 'stabled' : status
            },
            currentEta: {
                date: service.utcToist(eta) || '--',
                etaTime: service.utcToistTime(eta) || '--'
            },
            remarks: remarks.length === 0 ? "--" : {
                latest: separateLatestObject(remarks).latest?.remark || "--",
                rest: separateLatestObject(remarks)?.rest || "--"
            },
            handlingAgent: HA ? HA : [],
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
            past_etas: past_etas ? processETAs(past_etas) : '--',
            received_no_of_wagons: received_no_of_wagons ? received_no_of_wagons : '--',
            no_of_wagons: no_of_wagons ? no_of_wagons : '--',
            is_captive: is_captive && is_captive,
            daysAging: calculateDaysDifference(demand_date),
            paid_by: paid_by ? paid_by : '--',
            commodity_desc: commodity_desc && commodity_desc,
            expected_loading_date:{
                ELDdate: service.utcToist(expected_loading_date, 'dd-MMM') || '--',
                ELDtime: service.utcToistTime(expected_loading_date) || '--'
            },
            placement_time: service.utcToist(placement_time, 'dd-MMM HH:mm')|| '--',
            oneRr_date: rr_dates && rr_dates.length > 0 && service.utcToist(newRRDate.toISOString(), 'dd-MMM HH:mm')|| '--',
            intent_no: indent_no && indent_no,
            demand_date:demand_date && service.utcToist(newDemandDate.toISOString(), 'dd-MMM HH:mm') || '--',
            drawnout_time: drawnout_time && service.utcToist(drawnout_time, 'dd-MMM HH:mm') || '--',
            captive: {
                name: captive?.name || '--',
            },
            fois_updated_at:{
                date: fois_updated_at_date ? service.utcToist(fois_updated_at_date, 'dd-MMM HH:mm') : '--',
            }
        }
    });
};




// Main component
export default function TableData({ onSkipLimit, allShipments, rakeCaptiveList, count, onFnrChange, reload, remarksList, setTriggerShipments, triggerShipments, getAllShipment, ShipmentsPayload, totalCount, query, setTotalCountrake }: any) {

    //language controller
    const t = useTranslations("ORDERS")
    const router = useRouter();
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    const handleOpen = (e: any) => { e.stopPropagation(); setOpen(true); setActionOptions(e.currentTarget.id); setAnchorEl(null); };
    const handleClose = (e: any) => { e.stopPropagation(); setOpen(false); }
    const [isRRModalOpen, setRRModalOpen] = useState<boolean>(false);
    const [openAnnexureModal, setOpenAnnexureModal] = useState<boolean>(false);
    const [isRRDoc, setIsRRDoc] = useState<boolean>(false);
    const [rrNumbers, setRRNumbers] = useState([]);
    const [fnr, setFnr] = useState('')
    const textRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const[openEtaModel,setOpenEtaModal] = useState<boolean>(false)
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [cancelShipID,setCancelShipId] = useState<any>('')
    const [cancel,setCancel] = React.useState(false);
    const handleCancel = (row:any) => {
        setCancelShipId(row);
        setCancel(true);
    }
    const handleCloseCancel = (e:any) =>{e.stopPropagation();setCancel(false)}
    //getting row id to pass it to tag element
    const [rowId, setRowID] = useState('')
    const [response, setResponse] = useState([])
    const [locationId, setLocationId] = useState('')

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
    const [uploadAnnexureShipID,setUploadAnnexureShipID] = useState('')
    const [uploadAnnexureFNR,setUploadAnnexureFNR] = useState('')
    const[updateEtaShipID,setUpdateEtaShipID] = useState('');
    const[differenceETA,setDifferenceETA] = useState<any>();
    //mark placement
    const [openMarkPlacement, setOpenMarkPlacement] = useState(false);
    const [markPlacementId, setMarkPlacementId] = useState({});
    const [downOut, setDownOut] = useState<string | null | undefined>(null);

    //upload wagon Sheet
    const [openUploadWagonSheet, setOpenUploadWagonSheet] = useState(false);
    const [openModifyStatus, setOpenModifyStatus] = useState(false);
    const [modifyStatusId, setModifyStatusId] = useState({});  
    const [uploadWagonSheetId, setUploadWagonSheetId] = useState({});

    //contact modal
    const [contactModal, setContactModal] = useState(false);
    const [contactData, setContactData] = useState({});

    // view Contact modal
    const [viewContactModal, setViewContactModal] = useState(false);
    const [viewContactData, setViewContactData] = useState({});

    const handleRRDoc = (id: any) => {  // for rr documents
        setRRModalOpen(true);
        const rrNums = allShipments.filter((shipment: any) => shipment._id === id)[0].all_FNRs;
        setRRNumbers(rrNums);
        const rrDocumnets = allShipments.filter((shipment: any) => shipment._id === id)[0].rr_document;
        const isRRDocument = rrDocumnets && rrDocumnets.length > 0;
        setIsRRDoc(isRRDocument);
    }

    const handleUploadAnnexureModal = (element:any)=> {
        setUploadAnnexureFNR(element.fnr.primary)
        setUploadAnnexureShipID(element._id)
        setOpenAnnexureModal(true);
    }
    const handleUpdateEta = (row:any) => {        
        const difference = allShipments.filter((shipment: any) => shipment._id === row._id)[0].preferred_difference_eta
        setDifferenceETA(difference);
        setUpdateEtaShipID(row)
        setOpenEtaModal(true);
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
                const resData = convertArrayToFilteredArray(allShipments, ShipmentsPayload)
                setResponse(resData)
            } else {
                const resData = convertArrayToFilteredArray(allShipments, ShipmentsPayload)
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

    function clickActionBox(e: React.MouseEvent<SVGSVGElement, MouseEvent>, index: number, id: string, locationId: string) {
        e.stopPropagation();
        setRowID(id);
        setShowActionBox(prevIndex => (prevIndex === index ? -1 : index));
        setLocationId(locationId);
    }

    const { showMessage } = useSnackbar();

    async function fetchTrackDetails(rake_id: any) {
        const payload = {
            rakeId: rake_id
        }
        httpsPost(FETCH_TRACK_DETAILS, payload, router).then((res) => {
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

    const markPlacementModal = (row : any) =>{
       setOpenMarkPlacement(true);
       setMarkPlacementId(row);
       setDownOut(undefined);
    }

    const drownOutDate = (row: any) => {
        setOpenMarkPlacement(true);
        setMarkPlacementId(row);
        setDownOut('downOut');
    }

    const releaseTimeDate = (row: any) => {
        setOpenMarkPlacement(true);
        setMarkPlacementId(row);
        setDownOut('releaseTime');
    }

    const uploadWagonSheet = (row: any) => {
        setOpenUploadWagonSheet(true);
        setUploadWagonSheetId(row);
    }

    const markComplete = (row: any) => {
        setOpenModifyStatus(true);
        setModifyStatusId(row);
    } 

    useEffect(() => {
        const etaResult = sortArray(allShipments, 'eta', currentETAsorting ? 'dec' : 'asc');
        const resData = convertArrayToFilteredArray(etaResult, ShipmentsPayload)
        setResponse(resData)
    }, [currentETAsorting])

    useEffect(() => {
        const pickupResult = sortArray(allShipments, 'pickup_date', pickupSorting ? 'dec' : 'asc');
        const etaResult = sortArray(allShipments, 'eta', currentETAsorting ? 'dec' : 'asc');
        const resData = convertArrayToFilteredArray(pickupResult, ShipmentsPayload)
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
            { id: 'fnr', label: '', subLabel: '', class: 'fnr', innerClass: 'inner_fnr' },
            // { id: 'destination', subLabel: 'Paid By', label: 'Destination', class: 'destination', innerClass: '' },
            { id: 'destination', subLabel: '', label: 'Destination', class: 'destination', innerClass: '' },
            { id: 'material', subLabel: '', label: 'Commodities', class: 'material', innerClass: '' },
            { id: 'eld', subLabel: 'Exp. Loading Date', label: 'Indent Date', class: 'eld', innerClass: '' },
            { id: 'pickupdate', subLabel: 'Drawn Out Time', label: 'RR Date', class: 'pickupdate', innerClass: 'inner_pickup' },
            { id: 'currentEta', subLabel: 'Current ETA', label: 'Initial ETA', class: 'currentEta', innerClass: 'inner_eta' },
            { id: 'status', subLabel: '', label: 'Status', class: 'status', innerClass: 'inner_status' },
            { id: 'remarks', subLabel: '', label: 'Remarks', class: 'remarks', innerClass: '' },
            { id: 'handlingAgent', subLabel: '', label: 'Handling Agent', class: 'handlingAgent', innerClass: '' },
            { id: 'action', subLabel: '', label: 'Action', class: 'action', innerClass: '' },
            { id: 'iconheader', subLabel: '', label: <IconButton onClick={() => { setShowEdemad(!showEdemand) }}><MoreVertIcon /></IconButton>, class: 'iconheader', innerClass: 'inner_iconheader' },
        ];

        if (edemand) {
            commonColumns.unshift({ id: 'edemand', subLabel: 'Indent', label: 'e-Demand', class: 'edemand', innerClass: '' });
        }
        setColumns(commonColumns);
    }, [edemand, showEdemand,])

    useEffect(() => {
        setSettingFnrChange('')
    }, [reload])

    useEffect(() => {
        const element = textRef.current;
        if (element) {
            const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
            const numberOfLines = element.scrollHeight / lineHeight;
            setIsOverflowing(numberOfLines > 5);
        }
    }, [textRef, response]);

    const generateTemplate = (rowData: any) => {
        const currentETA = service.utcToist(rowData.past_etas.currentETA , 'dd-MMM HH:mm') || '--';
        const initialETA = service.utcToist(rowData.past_etas.initialETA , 'dd-MMM HH:mm') || '--';
        return `*Shipment Details:*
        Indent #: ${rowData.intent_no}
        Rake: ${rowData.is_captive ? rowData.captive.name + '(Captive Rake)' : 'Indian Railway Rake'}
        Destination: ${rowData.destination.code} ${rowData.destination.name}
        Commodity: ${rowData.material.name}
        Indent Date: ${rowData.demand_date}
        ELD: ${rowData.expected_loading_date.ELDdate} ${rowData.expected_loading_date.ELDtime}
        Placement Date: ${rowData.placement_time}
        Pickup Date: ${rowData.pickupdate.date} ${rowData.pickupdate.pickupTime}
        RR Date: ${rowData.oneRr_date}
        Drawn Out Time: ${rowData.drawnout_time}
        Last FOIS Ping: ${rowData.fois_updated_at.date}
        Initial ETA: ${initialETA}
        Current ETA: ${currentETA}
        Status: ${rowData.status.name}
        Current Status Code: ${rowData.status.code}
        Triptracker URL: ${environment.PROD_BASE_URL}tracker?unique_code=${rowData.fnr.unique_code}
        Remarks: ${rowData.remarks}`;
    };

    // const shareViaWhatsApp = (rowData: any) => {
    //     const message = generateTemplate(rowData);
    //     const encodedMessage = encodeURIComponent(message);
    //     const whatsappURL = `https://wa.me/?text=${encodedMessage}`;
    //     window.open(whatsappURL, '_blank');
    // };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
          .then(() => {
            showMessage('Text copied to clipboard successfully!', 'success')
          })
          .catch((err) => {
            console.error("Could not copy text: ", err);
          });
    };

    const copyRowDataToClipboard = (rowData: any) => {
        const message = generateTemplate(rowData);
        copyToClipboard(message);
    };

    function extractTextInsideParentheses(input: string) {
        if(!input) return null
        const match = input.match(/\(([^)]+)\)/);
        return match ? match[1] : null;
      }

    return (
        <div 
        id='outBoundTableContainer'
        style={{
            width: "100%",
            height: !mobile ? "calc(100vh - 200px)" : "calc(100vh - 400px)",
            display: "flex",
            flexDirection: "column",
            paddingTop:'25px'
          }}
        >
            <Paper 
            sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: "none",
              }}
            >
                <TableContainer 
                sx={{
                    overflow: "auto",
                    borderRadius: "4px",
                    border: "1px solid #E9E9EB",
                  }}
                >
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => {
                                    return (
                                        <TableCell
                                            key={column.id}
                                            style={{ fontSize: 12, fontWeight: 'bold', color: '#484A57', padding: '4px 0px 4px 20px' }}
                                            className={column.class}
                                        >
                                            <div className={column.innerClass}>
                                                {column.subLabel && (column.subLabel as string).length ? <div>
                                                    {column.label}
                                                    <br />
                                                    {column.subLabel}
                                                </div> : column.label}
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
                                                {column.id === 'eld' && (
                                                    <div>Placement Date</div>
                                                )}
                                                {column.id === 'pickupdate' && (
                                                    <div>Last <span style={{color:'red'}}>FOIS</span> Ping</div>
                                                )}
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
                                                {/* {column.id === 'pickupdate' &&
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
                                                        />
                                                    </div>
                                                } */}
                                                {/* {column.id === 'currentEta' &&
                                                    <div style={{ position: 'absolute', top: 10, left: 90 }}>
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
                                                            />
                                                        </div>
                                                    </div>
                                                } */}

                                            </div>

                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {response.map((row: row, firstindex: number) => {
                                return (
                                    <TableRow hover key={firstindex}
                                        // onClick={(e: any) => { handleRRDoc(row._id) }}
                                        // sx={{ cursor: 'pointer' }}
                                    >
                                        {columns.map((item, index) => {
                                            // @ts-ignore
                                            const value: any = row[item.id];
                                            const columnClassNames: any = {
                                                edemand: 'body_edemand',
                                                fnr: 'body_fnr',
                                                destination: 'body_destination',
                                                material: 'body_material',
                                                aging: 'body_aging',
                                                pickupdate: 'body_pickupdate',
                                                ownedby: 'body_ownedby',
                                                status: 'body_status',
                                                initialETAL: 'body_initialETA',
                                                currentEta: 'body_currentEta',
                                                deliverDate: 'body_deliveryDate',
                                                remarks: 'body_remarks',
                                                handlingAgent: 'body_handlingAgent',
                                                action: 'body_action',
                                                iconheader: 'body_iconheader',
                                                eld: 'body_eld',
                                            }
                                            return (
                                                <TableCell key={index} sx={{ fontSize: '12px', color: '#44475B', p: '4px 0px 4px 20px' }}
                                                    className={columnClassNames[item.id]} >
                                                    <div>
                                                        {(typeof value) === 'object' ? '' : value}

                                                        {item.id === 'action' && (
                                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                                <div className='action_icon'>
                                                                    <MoreHorizIcon
                                                                        style={{ color: 'white', cursor: 'pointer', scale: '0.9' }}
                                                                        onClick={(e) => { clickActionBox(e, firstindex, row._id, row.destination.locationId); setAnchorEl(e.currentTarget as unknown as HTMLButtonElement); }}
                                                                    />
                                                                    <Popover
                                                                        open={showActionBox === firstindex ? true : false}
                                                                        onClose={handleClose}
                                                                        anchorOrigin={{
                                                                            vertical: 30,
                                                                            horizontal: -85,
                                                                        }}
                                                                        anchorEl={anchorEl}
                                                                    >
                                                                        <div className='action_button_options' onClick={(e) => e.stopPropagation()}>
                                                                            {row.status.name != 'Delivered' && row.validationForAttachRake && (
                                                                                <ActionItem
                                                                                    icon={<img src={attach_icon.src} alt='' height={"24px"} width={"24px"} />}
                                                                                    text={t('attach')}
                                                                                    onClick={handleOpen}
                                                                                    id='attach'
                                                                                    // style={{ gap: '5px' }}
                                                                                />
                                                                            )}
                                                                            <ActionItem
                                                                                icon={<CopyAllIcon style={{ width: '22px', height: '22px', color: '#3352FF' }} />}
                                                                                text={t('copyToClipboard')}
                                                                                onClick={() => {
                                                                                    copyRowDataToClipboard(row)
                                                                                }}
                                                                            />
                                                                            <ActionItem
                                                                                icon={<img src={contactIcon.src} alt='' style={{ objectFit: 'contain', height: '24px', width: '24px' }} />}
                                                                                text={t('contact')}
                                                                                onClick={() => { setContactModal(true); setContactData(row) }}
                                                                            />
                                                                             <ActionItem
                                                                                icon={<ImportContactsIcon style={{ width: "24px", height: '24px', color: '#FAB12F' }} />}
                                                                                text={t('viewAllContacts')}
                                                                                onClick={() => { setViewContactModal(true); setViewContactData(row) }}
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
                                                                            <ActionItem
                                                                                icon={<EditNoteOutlinedIcon style={{ width: "24px", height: '24px', color: '#658147' }} />}
                                                                                text={t('edit')}
                                                                                onClick={handleOpen}
                                                                                id="editELD"
                                                                            />
                                                                            <ActionItem
                                                                                icon={<RvHookupIcon style={{ width: "24px", height: '24px', color: '#E24D65' }} />}
                                                                                text={t('addHAndlingAgent')}
                                                                                onClick={handleOpen}
                                                                                id="addHAndlingAgent"

                                                                            />                                     
                                                                            <ActionItem
                                                                            icon={<img src={fileUpload.src} style={{ width: "24px", height: '24px'}} />}
                                                                            text={t('uploadAnnexure')}
                                                                            onClick={()=>{handleUploadAnnexureModal(row)}}
                                                                            id="uploadAnnexure"
                                                                            />
                                                                            {/* { (row.placement_time === '--' || !row?.intent_no) && */}
                                                                                 <ActionItem
                                                                                 icon={<PublishedWithChangesIcon style={{ width: "24px", height: '24px', color: '#008001' }} />}
                                                                                 text={t('markPlacement')}
                                                                                 onClick={()=>{markPlacementModal(row)}}
                                                                                 id="markPlacement"
                                                                             />
                                                                            {/* } */}
                                                                            {/* {row.status.raw === 'INPL' && row.rrDoc && ( */}
                                                                                 <ActionItem
                                                                                 icon={<UpdateIcon style={{ width: "24px", height: '24px', color: '#0367FF' }} />}
                                                                                 text={t('drownOut')}
                                                                                 onClick={()=>{drownOutDate(row)}}
                                                                                 id="drownOut"
                                                                             />
                                                                             <ActionItem
                                                                                 icon={<TrainIcon style={{ width: "24px", height: '24px', color: '#C72C41' }} />}
                                                                                 text={t('releaseTime')}
                                                                                 onClick={()=>{releaseTimeDate(row)}}
                                                                                 id="releaseTime"
                                                                             />
                                                                            {/* )} */}
                                                                                <ActionItem
                                                                                    icon={<DriveFolderUploadIcon style={{ width: "24px", height: '24px', color:'#185519'}} />}
                                                                                    text={t('uploadWagonSheet')}
                                                                                    onClick={()=>{uploadWagonSheet(row)}}
                                                                                    id='uploadWagonSheet'
                                                                                />
                                                                            {
                                                                                row.status.raw == 'ITNS' && (
                                                                                    <ActionItem
                                                                                        icon={<SendTimeExtensionTwoToneIcon style={{ width: "24px", height: '24px', color:'#800080'}} />}
                                                                                        text={t('markComplete')}
                                                                                        onClick={()=>{markComplete(row)}}
                                                                                        id='markComplete'
                                                                                    />
                                                                                )
                                                                            }
                                                                            {row.status.raw == 'AVE' && (
                                                                            <ActionItem
                                                                            icon={<img src={trash.src} style={{ width: "24px", height: '24px'}} />}
                                                                            text={t('cancel')}
                                                                            onClick={()=>{handleCancel(row)}}
                                                                             id="cancel"
                                                                            />
                                                                            )}
                                                                             <ActionItem
                                                                                icon={<SettingsIcon style={{ width: "24px", height: '24px'}} />}
                                                                                text={t('preferredEta')}
                                                                                onClick={()=>{handleUpdateEta(row)}}
                                                                                id="updateEta"
                                                                            />                                     
                                                                        </div>
                                                                    </Popover>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {item.id === 'fnr' &&
                                                            <div className='fnr_container'>
                                                                {/* <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    <div>Primary</div>
                                                                </div> */}
                                                                {/* <div className='status_container'>
                                                                    <div className={`status_resize ${status_class_map[row.status.raw]}`}>
                                                                        <div>{row.status.name}</div>
                                                                    </div>
                                                                <div>{row.status.code}</div>
                                                                </div> */}
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
                                                                        (<div className='rrDocIcon-ordersPage' style={{ height: 25, width: 25, cursor: 'pointer'}} onClick={(e: any) => { handleRRDoc(row._id) }}>
                                                                            <img
                                                                                src={row.rrDoc ? rrDocumentIcon.src : ''}
                                                                                style={{ height: '100%', width: '100%' }}
                                                                                alt=''
                                                                            />
                                                                            <div className='viewRRDoc'>{t('viewRRDoc')}</div>
                                                                        </div>)
                                                                    }
                                                                    {row.is_captive &&
                                                                        <div style={{ height: 25, width: 25 }} className='captiveIcon-orderspage'>
                                                                            <img
                                                                                src={row.is_captive ? captiveRakeIndicator.src : ''}
                                                                                style={{ height: '100%', width: '100%' }}
                                                                                alt=''
                                                                            />
                                                                            <div className='captiveName'>{row.captive.name}</div>
                                                                        </div>
                                                                    }
                                                                </div>
                                                            </div>
                                                        }
                                                        {item.id === 'destination' && (
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        position: 'relative',
                                                                        right: '0px',
                                                                        overflow: 'hidden',
                                                                        color: '#07004D'
                                                                    }}
                                                                >
                                                                    <Tooltip
                                                                        title={isOverflowing ? `(${value.code} ${value.name !== '--' ? value.name : value.code})` : ' '}
                                                                        disableHoverListener={!isOverflowing}
                                                                    >
                                                                        <div
                                                                            ref={textRef}
                                                                            style={{
                                                                                display: '-webkit-box',
                                                                                WebkitBoxOrient: 'vertical',
                                                                                WebkitLineClamp: 4,
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                                whiteSpace: 'pre-wrap',
                                                                                height: '100%',
                                                                                cursor: isOverflowing ? 'pointer' : 'default',
                                                                                fontSize: 12
                                                                            }}
                                                                        >
                                                                            <span style={{
                                                                                fontWeight: 'bold',
                                                                            }}>{value.code}</span> <br />
                                                                            <span style={{
                                                                                color: '#7C7E8C',
                                                                                fontSize: 11
                                                                            }}>
                                                                                {value.name !== '--' ? value.name : value.code}
                                                                            </span>
                                                                        </div>
                                                                    </Tooltip>
                                                                </div>
                                                                {/* <div style={{ marginTop: '6px', color: '#7C7E8C', fontSize: 10 }}>{row.paid_by}</div> */}
                                                            </div>
                                                        )}
                                                        {item.id === 'pickupdate' && (
                                                            row.oneRr_date === '--' && row.drawnout_time === '--' ? '--' : (
                                                            <div>
                                                                <div>{row?.oneRr_date}</div>
                                                                <div style={{marginBlock: '4px'}}>{row?.drawnout_time}</div>
                                                                <div>{row?.fois_updated_at.date}</div>
                                                            </div>
                                                            )
                                                        )}
                                                        {item.id === 'status' &&
                                                            <div className='status_container'>
                                                                <div className={`status_resize ${status_class_map[value.raw]}`}>
                                                                    <div>{value?.name}</div>
                                                                </div>
                                                                <div style={{textAlign:'center'}}>{extractTextInsideParentheses(value?.code)}</div>
                                                                {value.code ? <div className='status_code'>{value.code}</div> : <div className='status_code' style={{textAlign:'center'}}>Status will update soon</div>}
                                                            </div>
                                                        }
                                                        {item.id === 'edemand' &&
                                                            <div className='edemand_fois_gpis'>
                                                                <div style={{ color: row.status.raw === 'AVE' ? parseInt(row.daysAging) > 10 ? 'red' : 'green' : 'black' }}>{value.edemand_no}</div>
                                                                {(row?.intent_no || row?.captive.name !== '--') && <div style={{paddingTop: '6px', display:'flex', justifyContent:'space-between', paddingRight:12}}>
                                                                    { row?.intent_no && <div>{row?.intent_no}</div>}
                                                                    { row?.captive.name !== '--' && <div style={{ color: '#E91E63' }}>{row?.captive.name}</div>}
                                                                </div>}
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
                                                                {row.fois.is_gps && <div className='fois_gps_logo'>
                                                                    {row.fois.is_gps &&
                                                                        <img src={GPIS.src} style={{ display: 'block' }} alt='' />
                                                                    }
                                                                </div>}
                                                            </div>
                                                        }
                                                        {item.id === 'currentEta' && ( 
                                                            row.past_etas.initialETA === '--' && row.past_etas.currentETA === '--' ? '--' : (
                                                                <div>
                                                                    <div>{service.utcToist(row.past_etas.initialETA)}</div>
                                                                    <div style={{ marginTop: 12 }}>{service.utcToist(row.past_etas.currentETA)}</div>
                                                                </div>
                                                            )
                                                        )}
                                                        {item.id === 'remarks' && (
                                                            <RemarkComponent row={row} firstIndex={firstindex} />
                                                        )}
                                                        {item.id === 'material' && row.commodity_desc && (
                                                            <div>
                                                                <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize:10 }}>
                                                                    <div style={{ textWrap: 'nowrap' }}>{value.name}</div>
                                                                    {getUniqueValues(row.commodity_desc).length > 1 &&
                                                                        <div className='view_more_materials'>
                                                                            <div style={{ fontSize: 8 }}>+{getUniqueValues(row.commodity_desc).length - 1}</div>
                                                                            <div className='list_of_materials'>
                                                                                {getUniqueValues(row.commodity_desc).slice(1).map((item: any, index: number) => {
                                                                                    return (
                                                                                        <div className='material_item' key={index}>{item}</div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                <div className='material_items'>
                                                                    <div style={{ color: '#7C7E8C', marginTop: '4px', fontSize:10 }}>{row.commodity_desc[0]}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {item.id === 'eld' &&   (
                                                            row.expected_loading_date.ELDdate === '--' && row.placement_time === '--' ? '--' : (
                                                                <div>
                                                                    <div>{row.demand_date}</div>
                                                                    <div style={{marginBlock:4}}>{row.expected_loading_date.ELDdate} {row.expected_loading_date.ELDtime === '05:30' ? '23:59': row.expected_loading_date.ELDtime} </div>
                                                                    <div>{row.placement_time}</div>
                                                                </div>
                                                            )
                                                        )                             
                                                        }
                                                        {item.id === 'handlingAgent' && (
                                                            <div className='handlingAgentColume'>
                                                                <div>{row.handlingAgent[0] ? row.handlingAgent[0] : "--"}</div>
                                                                {/* {row.handlingAgent.length > 1 && <div className='view_more_agents'><div>+{row.handlingAgent.length - 1}</div></div>}
                                                                {row.handlingAgent.length > 1 &&
                                                                    <div className='list_of_agents'>
                                                                        {Array.isArray(row.handlingAgent) &&
                                                                            row.handlingAgent.map((item: any, index: number) => {
                                                                                return (
                                                                                    <div key={index} className='agent_item'>{item}</div>
                                                                                );
                                                                            })
                                                                        }
                                                                    </div>
                                                                } */}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            }
                            )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                {!response.length ? <div className='no_shipments_found'>No Shipments Found</div>
                    : <></>
                }
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    component="div"
                    count={count}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Shipments per page:"
                    sx={{ height: 40, overflowY: 'hidden', position: 'absolute', top: '-37px', right: '-9px' }}
                />
            </Paper>
            <RRModal isOpen={isRRModalOpen} isClose={() => setRRModalOpen(false)} rrNumbers={rrNumbers} isRRDoc={isRRDoc} />
            {openAnnexureModal && 
               <UploadAnnexure isOpen={openAnnexureModal} isClose={()=> setOpenAnnexureModal(false)} shipmentID={uploadAnnexureShipID} FNR_No={uploadAnnexureFNR}/>}
            {openMarkPlacement && <MarkPlacement isClose={setOpenMarkPlacement} shipment={markPlacementId} getAllShipment={getAllShipment} different={downOut} />}
            {openUploadWagonSheet && <UploadWagonSheet isClose={setOpenUploadWagonSheet} shipment={uploadWagonSheetId} />  }
            {openModifyStatus && <MarkComplete isClose={setOpenModifyStatus} shipment={modifyStatusId} getAllShipment={getAllShipment} totalCount={totalCount} query={query} setTotalCountrake={setTotalCountrake} />}
            {cancel && 
             <HandlingEdemand isOpen={cancel} isClose={()=> setCancel(false)} shipment={cancelShipID} getAllShipment={getAllShipment}/>}
             {openEtaModel && 
             <HandlingETA isOpen={openEtaModel} isClose={()=> setOpenEtaModal(false)} shipment={updateEtaShipID} getAllShipment={getAllShipment} difference={differenceETA} />}
             {contactModal && <ContactModal isClose={setContactModal} shipment={contactData} />}
             {viewContactModal && <ViewContactModal isClose={setViewContactModal} shipmentData={viewContactData} />}
            <Modal
                open={open}
                onClose={(e) => { handleClose(e) }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
            >
                <Box
                    onClick={(e) => { e.stopPropagation() }}
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '30vw',
                        minWidth: '320px',
                        height: '267px',
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
                    {actionOptions === 'editELD' && <EditELD
                        shipmentId={rowId}
                        setOpen={setOpen}
                        getAllShipment={getAllShipment}
                    />}
                    {actionOptions === 'addHAndlingAgent' && <HandlingAgentSelection
                        shipmentId={rowId}
                        setOpen={setOpen}
                        locationId={locationId}
                        getAllShipment={getAllShipment}
                    />}
                </Box>
            </Modal>
        </div>
    );
}



