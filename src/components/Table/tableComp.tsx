import { useEffect, useState, useRef } from "react";
import React from "react";



import Checkbox from '@mui/material/Checkbox';
import { useCallback } from 'react'
import './table.css'
import service from '@/utils/timeService';
import trash from '@/assets/trash_icon.png'

import { useTranslations } from 'next-intl';



import TextField from '@mui/material/TextField';


import { ClickAwayListener, Popper, Tooltip, } from '@mui/material';
import Button from '@mui/material/Button';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { httpsPost, httpsGet } from '@/utils/Communication';
import { UPDATE_RAKE_CAPTIVE_ID, REMARKS_UPDATE_ID, FETCH_TRACK_DETAILS, UPDATE_ELD, GET_HANDLING_AGENT_LIST, UPDATE_DELIVER_STATUS_WITH_REMARK } from '@/utils/helper'
import CloseIcon from '@mui/icons-material/Close';
import { MenuItem } from '@mui/material';
import './style.css'

import { sortArray, separateLatestObject, calculateDaysDifference, getColorCode, getUniqueValues } from '@/utils/hooks';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Popover from '@mui/material/Popover';
import { Typography, } from '@mui/material';
import { useSnackbar } from '@/hooks/snackBar';
import ListSubheader from '@mui/material/ListSubheader';
import FormControl from '@mui/material/FormControl';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import RvHookupIcon from '@mui/icons-material/RvHookup';
import Autocomplete from '@mui/material/Autocomplete';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useRouter } from "next/navigation";
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import CircularProgress from '@mui/material/CircularProgress';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';

import CustomMultiSelect from "../UI/CustomMultiSelect/CustomMultiSelect";
import CustomDateTimePicker from '../UI/CustomDateTimePicker/CustomDateTimePicker';

import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
  } from "@mui/material";

async function rake_update_id(payload: Object, router: any) {
    return await httpsPost(UPDATE_RAKE_CAPTIVE_ID, payload, router);
}

async function remake_update_By_Id(payload: object, router: any) {
    const response = await httpsPost(REMARKS_UPDATE_ID, payload, router);
    return response;
}

async function updateDeliverStatusWithRemark(payload: object, router: any) {
    return await httpsPost(UPDATE_DELIVER_STATUS_WITH_REMARK, payload, router);
}

const status_class_map: { [key: string]: string } = {
    'OB': 'status_title_In_Plant',
    'AVE': 'status_title_In_Plant',
    'RFD': 'status_title_rfd',
    'ITNS': 'status_title_In_Transit',
    'Delivered': 'status_title_Delivered'
}




interface RemarksListType {
    [category: string]: string[];
}

interface RemarksProps {
    shipmentId: any;
    setOpen: (open: boolean) => void;
    remarksList: RemarksListType;
    getAllShipment: () => void;
}

export const ActionItem = ({ icon, text, onClick, id, style }: any) => (
    <div className={`action_items `} onClick={onClick} id={id} style={style} >
        <div>{icon}</div>
        <div style={{ fontSize: 12 }}>{text}</div>
    </div>
);
export function Remarks({ shipmentId, setOpen, remarksList, getAllShipment }: RemarksProps) {
    const router = useRouter();
    const [others, setOthers] = useState('');
    const t = useTranslations('ORDERS');
    const placeholder = 'Select a remark';
    const [remarks, setRemarks] = useState(placeholder);
    const [openRemarks, setOpenRemarks] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { showMessage } = useSnackbar();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    const handleRemarkSelect = (remark: string) => {
        setRemarks(remark);
        setOpenRemarks(false);
    };

    function handleOthers(e: React.ChangeEvent<HTMLInputElement>) {
        setOthers(e.target.value);
    }

    function handleSubmit(e: React.MouseEvent) {
        e.stopPropagation();
        setOpen(false);
        setOpenRemarks(false);

        if (remarks === placeholder) {
            showMessage('Please select a remark', 'error');
            return;
        }

        const remarkObject = {
            id: shipmentId,
            remarks: [
                {
                    date: service.getEpoch(new Date()),
                    remark: remarks === 'Others' ? others : remarks,
                }
            ]
        };

        const response = remake_update_By_Id(remarkObject, router);
        response.then((res: any) => {
            if (res.statusCode === 200) {
                showMessage('Remark Updated', 'success');
                getAllShipment();
            }
        }).catch((err) => {
            console.log(err);
        });

        setRemarks(placeholder);
        setOthers('');
    }
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setOpenRemarks(true);
    };

    const handleClose = (e: any) => {
        e.stopPropagation();
        setOpenRemarks(false);
    };

    return (
        <div
            style={{ padding: 24 }}
            onClick={(e) => { e.stopPropagation(); setOpenRemarks(false) }}
        >
            <div style={{ color: '#131722', fontSize: 20, fontWeight: 500, marginBottom: '36px' }}>Remarks</div>
            <div style={{ color: '#42454E', fontSize: 12 }}>Select Remarks</div>


            <div style={{ position: 'relative' }}>
                <FormControl fullWidth >
                    <Select
                        labelId="remarks-select-label"
                        id="remarks-select"
                        value={remarks}
                        onClick={(e) => handleClick(e)}
                        open={false}
                        sx={{
                            height: 36,
                            fontSize: 14,
                            outline: 'none'
                        }}
                    >
                        <MenuItem value={remarks}>
                            {remarks}
                        </MenuItem>
                    </Select>
                </FormControl>

                <Popper
                    open={openRemarks}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    style={{ zIndex: 1300, width: 'calc(30vw - 48px)', minWidth: '272px' }}
                >
                    <ClickAwayListener onClickAway={(e) => handleClose(e)}>
                        <Paper style={{ maxHeight: 300, overflow: 'auto' }}>
                            {remarksList && Object.entries(remarksList)?.map(([category, options]) => [
                                <ListSubheader key={category}>{category}</ListSubheader>,
                                ...options?.map((option: string, index: number) => (
                                    <MenuItem
                                        key={`${category}-${index}`}
                                        onClick={(e) => { handleRemarkSelect(option); handleClose(e); }}
                                    >
                                        {option}
                                    </MenuItem>
                                ))
                            ])}
                        </Paper>
                    </ClickAwayListener>
                </Popper>

                {remarks === 'Others' && (
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Other Reason"
                        variant="outlined"
                        value={others}
                        onChange={handleOthers}
                    />
                )}

                <div style={{ marginTop: 64, display: 'flex', justifyContent: 'end' }}>
                    <Button
                        variant="contained"
                        size='small'
                        color="secondary"
                        style={{ textTransform: 'none', backgroundColor: '#3351FF' }}
                        onClick={handleSubmit}
                    >
                        {t('submit')}
                    </Button>
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
export function Tags({ rakeCaptiveList, shipmentId, setOpen, setShowActionBox }: any) {
    const router = useRouter();
    const placeHolder = 'Select One';
    const [item, setItem] = useState(placeHolder)
    const [itemId, setItemID] = useState(null)
    const t = useTranslations('ORDERS');
    const [selectedRake, setSelectedRake] = useState<{ _id: string } | null>(null);
    const { showMessage } = useSnackbar();




    const [isHovered, setIsHovered] = useState(false);
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredList, setFilteredList] = useState(rakeCaptiveList);

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
            captiveId: selectedRake?._id
        };

        if (updatedObject.captiveId) {
            rake_update_id(updatedObject, router).then((res: any) => {
                if (res === null) showMessage('Captive Rake Updated Successfully.', 'success');
                setOpen(false);
            }).catch((err: any) => {
                console.log(err);
            })
        } else {
            showMessage('Please select captive rake.', 'error');
        }
    };

    return (
        <div style={{ position: 'relative', padding: 24 }} >

            <div style={{ fontSize: 20, color: '#131722', marginBottom: 36 }}>Captive Rakes</div>
            <div >
                <label style={{ color: '#42454E', fontSize: 12 }}>Select captive rake</label>
                <Autocomplete
                    disablePortal
                    options={rakeCaptiveList}
                    getOptionLabel={(option: any) => `${option.rake_id} (${option.name || 'No Rake ID'})`}
                    renderInput={(params) => <TextField {...params} />}
                    onChange={(event, newValue) => {
                        setSelectedRake(newValue);
                    }}
                    sx={{
                        '.MuiOutlinedInput-root ': {
                            padding: 0, height: 36, boxShadow: 'none', border: 'none'
                        },
                        '.MuiAutocomplete-input, .MuiAutocomplete-option': {
                            fontSize: '14px',
                        },
                    }}
                />
            </div>
            <div style={{ marginTop: 64, display: 'flex', justifyContent: 'end' }}>
                <Button
                    variant="contained"
                    size='small'
                    color="secondary"
                    style={{ textTransform: 'none', backgroundColor: '#3351FF' }}
                    onClick={handleSubmit}
                >
                    {t('submit')}
                </Button>
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
export const RemarkComponent = ({ row, firstIndex }: any) => {
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
export const PastEta = ({ row, firstIndex }: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
                <div>
                    {row.past_etas && row.past_etas.length > 0 &&
                        <div>
                            <div>{service.utcToist(row.past_etas[0])}</div>
                            <div>{service.utcToistTime(row.past_etas[0])}</div>
                        </div>
                    }
                </div>
            </Typography>
            {row.past_etas && row.past_etas.length > 0 && (
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
                    <Box sx={{ paddingBlock: '4px' }}>
                        {row.past_etas?.map((item: any, remarkListIndex: number) => (
                            <Typography key={remarkListIndex} sx={{ fontSize: '12px', paddingInline: '8px' }}>
                                {service.utcToist(item)} - {service.utcToistTime(item)}
                            </Typography>
                        ))}
                    </Box>
                </Popover>
            )}
        </Box>
    );
};
export const EditELD = ({ shipmentId, setOpen, getAllShipment }: any) => {
    const router = useRouter();
    const t = useTranslations('ORDERS');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const { showMessage } = useSnackbar();
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [selectDate, setSelectDate] = useState(new Date());
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());


    const handleDatePickerToggle = () => {
        setOpenDatePicker((prev) => !prev);
    };

    const handleDateSubmit = async () => {
        const dateObject = new Date(currentDate);
        const epochTimestamp = dateObject.getTime();
        const payload = {
            id: shipmentId,
            date: epochTimestamp
        }
        if (!epochTimestamp) {
            showMessage('Please select a date.', 'error');
            return;
        }
        try {
            const res = await httpsPost(UPDATE_ELD, payload, router)
            if (res.statusCode === 200) {
                showMessage('Expected Loading Date Updated Successfully.', 'success');
                setOpen(false);
                getAllShipment();
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div style={{ position: 'relative', padding: 24 }}>
            <div>Add Expected Loading Date</div>

            {/* <div style={{ marginTop: '24px' }}>
                <div style={{ fontSize: 10, color: '#7C7E8C', paddingBottom: '4px' }}>Select Expected Loading Date</div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        format='DD/MM/YYYY'
                        open={openDatePicker}
                        onClose={() => setOpenDatePicker(false)}
                        slots={{
                            openPickerIcon: () => null,
                        }}
                        slotProps={{
                            textField: {
                                onClick: handleDatePickerToggle,
                            },
                        }}
                        sx={{
                            padding: 0,
                            width: '100%',
                            '.MuiInputBase-input': {
                                padding: '6px !important',
                                fontSize: '14px !important',
                            },
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    // border: 'none',
                                },
                                '&.Mui-focused fieldset': {
                                    border: '1px solid #7C7E8C',
                                },
                            },
                        }}
                        onChange={(newDate) => {
                            if (newDate) {
                                setSelectDate(newDate.toDate());
                            }
                        }}
                        value={dayjs(selectDate)}
                    />
                </LocalizationProvider>
            </div> */}
            <div style={{marginTop:24}}>
                        <header style={{ marginBottom:8, fontSize:12, color:'#42454E'}}>Select Expected Loading Date</header>
                        <div style={{border:'1px solid #E9E9EB', borderRadius:6, }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                open={openStartDatePicker}
                                onClose={() => {setOpenStartDatePicker(false)}}
                                value={dayjs(currentDate)}
                                sx={{
                                    width: '100%',
                                    '.MuiInputBase-input': {
                                        padding:'10px',
                                        paddingLeft:'10px',
                                        fontSize: '14px ',
                                        color:'#42454E',
                                        fontWeight:600
                                    },
                                    '.MuiInputBase-root': {

                                        padding: 0,
                                        border: 'none',
                                        '& fieldset': { border: 'none' },
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: 'none',
                                        },
                                    },
                                    '& .MuiIconButton-root': {
                                        left: -720,
                                        position:'relative',

                                    },
                                }}
                                ampm={false}
                                slotProps={{
                                    textField: {
                                        onClick: () =>{console.log(); setOpenStartDatePicker(!openStartDatePicker)},
                                        fullWidth: true,
                                        InputProps: {
                                            endAdornment: null,
                                        },
                                    },
                                }}
                                viewRenderers={{
                                    hours: renderTimeViewClock,
                                    minutes: renderTimeViewClock,
                                    seconds: renderTimeViewClock,
                                }}
                                onChange={(newDate) => { 
                                    if (newDate) {
                                        
                                        setCurrentDate(newDate.toDate());
                                    }
                                }}
                                format="DD/MM/YYYY  HH:mm"
                                
                                />
                            </LocalizationProvider>
                        </div>
                    </div>
            <div style={{display:'flex',justifyContent:'end'}}>
                <div style={{ marginTop: 64 }}>
                        <Button
                            variant="contained"
                            size='small'
                            color="secondary"
                            style={{ textTransform: 'none', backgroundColor: '#3351FF' }}
                            onClick={handleDateSubmit}
                        >
                            {t('submit')}
                        </Button>
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
export const HandlingAgentSelection = ({ shipmentId, setOpen, locationId, getAllShipment }: any) => {
    const router = useRouter();
    const t = useTranslations('ORDERS');
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    const [allListOfHAids, setAllListOfHAids] = useState<{ _id: string, parent_name: string, name: string }[]>([]);
    const [selectedHAids, setSelectedHAids] = useState(new Set());
    const [originalSelectedHAids, setOriginalSelectedHAids] = useState<Set<any>>(new Set());
    const [newIds, setNewIds] = useState<string[]>([]);
    const [removeIds, setRemoveIds] = useState<string[]>([]);
    const [toggleForShowAllHA, setToggleForShowAllHA] = useState(true);

    const { showMessage } = useSnackbar();
    const getLocationList = async () => {
        try {
            const res = await httpsGet(`${GET_HANDLING_AGENT_LIST}?delivery_locations=${locationId}`, 0, router);
            if (res.statusCode === 200) {
                setAllListOfHAids(res?.data);
            }
        } catch (error) {
            console.error("Error fetching location list:", error);
        }
    };

    const getRakeShipmentHA = async () => {
        try {
            const res = await httpsGet(`handling_agent/get_rake_shipment_ha?id=${shipmentId}`, 0, router);
            if (res.statusCode === 200) {
                const initialSelectedIds = new Set(res?.data[0]?.HA?.map((ha: any) => ha._id));
                setSelectedHAids(initialSelectedIds);
                setOriginalSelectedHAids(initialSelectedIds);
            }
        } catch (error) {
            console.error("Error fetching rake shipment HA:", error);
        }
    };

    useEffect(() => {
        if (locationId) {
            getLocationList();
            getRakeShipmentHA();
        }

    }, [locationId]);

    const handleChange = (event: any) => {
        const { value } = event.target;
        const newSelectedIds = new Set(value);

        // Update newIds and removeIds
        value.forEach((id: any) => {
            if (!originalSelectedHAids.has(id) && !newIds.includes(id)) {
                setNewIds((prev) => [...prev, id]);
            }
        });

        originalSelectedHAids.forEach((id: any) => {
            if (!newSelectedIds.has(id) && !removeIds.includes(id)) {
                setRemoveIds((prev) => [...prev, id]);
            }
        });

        // Remove from newIds if deselected
        newIds.forEach(id => {
            if (!newSelectedIds.has(id)) {
                setNewIds(prev => prev.filter(newId => newId !== id));
            }
        });

        // Remove from removeIds if reselected
        removeIds.forEach(id => {
            if (newSelectedIds.has(id)) {
                setRemoveIds(prev => prev.filter(removeId => removeId !== id));
            }
        });
        setSelectedHAids(newSelectedIds);
    };

    const getSelectedItemNames = (selected: any) => {
        return selected.map((id: any) =>
            allListOfHAids.find((item:any) => item.parent === id)?.parent_name
        ).filter(Boolean).join(', ');
    };

    const handleSubmit = async () => {
        if (newIds.length === 0) { showMessage('Please select HA.', 'success'); }
        try {
            const res = await httpsPost(`rake_shipment/assign_edit_ha`, { id: shipmentId, addIds: newIds, removeIds: removeIds }, router);
            if (res.statusCode === 200) {
                if(newIds.length === 0) {
                    showMessage('Handling Agent removed successfully.', 'success');
                }else{showMessage('Handling Agent successfully.', 'success');}
                getAllShipment();
                setOpen(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const ITEM_HEIGHT = 30;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {},
        },
    };

    async function bringAllHandlingAgent(){
        try {
            const res = toggleForShowAllHA ? await httpsGet(`${GET_HANDLING_AGENT_LIST}?delivery_locations=${locationId}&isAllHA=${toggleForShowAllHA}`, 0, router) : await httpsGet(`${GET_HANDLING_AGENT_LIST}?delivery_locations=${locationId}`, 0, router);
            if (res.statusCode === 200) {
                setAllListOfHAids(res?.data);
            }
        } catch (error) {
            console.error("Error fetching location list:", error);
        }
    }

    return (
        <div style={{ position: 'relative', padding: 24 }}>
            <div style={{ fontSize: 20, color: '#131722', fontWeight: 500 }}>Assign Handling Agent</div>

            <div>
                <FormControl sx={{ width: '100%', marginTop: '36px', position:'relative' }}>
                    <InputLabel id="demo-multiple-checkbox-label">Handling Agent</InputLabel>
                    <Select
                        labelId="demo-multiple-checkbox-label"
                        id="demo-multiple-checkbox"
                        multiple
                        value={Array.from(selectedHAids)}
                        onChange={handleChange}
                        input={<OutlinedInput label="handling agent" />}
                        renderValue={(selected) => getSelectedItemNames(selected)}
                        MenuProps={MenuProps}
                    >
                        {allListOfHAids?.map((item: any, index) => (
                            <MenuItem key={index} value={item.parent} sx={{ padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingRight: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
                                    <Checkbox checked={selectedHAids.has(item.parent)} sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }} />
                                    <ListItemText primary={item.parent_name + ' - ' + item.name} primaryTypographyProps={{ padding: 0, fontSize: '14px', fontFamily: 'Inter, sans-serif' }} />
                                </div>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            <div style={{ display: 'flex', justifyContent: 'end', marginTop: 12, gap:5, alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#7C7E8C' }}>Show All Handling Agents</div>
                <div style={{backgroundColor:toggleForShowAllHA ? 'GrayText' : '#E34031', width:'30px', height:'18px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:toggleForShowAllHA?'start':'end'}}>
                    <div onClick={(e)=>{e.stopPropagation(); setToggleForShowAllHA(pre => !pre); bringAllHandlingAgent(); }} style={{backgroundColor:'white', width:'14px', height:'14px', borderRadius:'50%', marginInline:'2px', cursor:'pointer'}}></div>
                </div>
            </div>

            <div style={{ marginTop: 50, textAlign: 'right' }}>
                <Button
                    variant="contained"
                    size='small'
                    color="secondary"
                    style={{ textTransform: 'none', backgroundColor: '#3351FF' }}
                    onClick={handleSubmit}
                >
                    {t('submit')}
                </Button>
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
};

// const material = [
//     "Plate Mill",
//     "Bar Mill",
//     "Rail Mill",
//     "Semis",
//     "SPM"
// ];

// const materialOptions = material.map(option => ({
//     value: option,
//     label: option
// }));

export const MarkPlacement = ({isClose ,shipment, getAllShipment, different = 'markplacement'}: any) =>{
    console.log(shipment, "shipment");
    const t = useTranslations("ORDERS");
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const { showMessage } = useSnackbar();
    const [avetoInplant, setAvetoInplant] = useState(false);
    const [eIndent, setEIndent] = useState('');
    const [warraning, setWarraning] = useState(false);
    const [materials, setMaterials] = useState<string[]>([]);
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
    const [materialDropdownItems, setMaterialDropdownItems] = useState([]);


    async function getMills() {
        const response = await httpsGet(`shipper_constants/get_mills`, 0, router);
        if (response.statusCode === 200) {
            const materialOptions = response.data?.map((option:any) => ({
                value: option.name,
                label: option.name
            }));
          setMaterialDropdownItems(materialOptions);
        }
    }

    useEffect(() => {
      getMills();
      if (shipment.intent_no) {
        setEIndent(shipment.intent_no);
      }
    }, []);

    const handlePlacementDate = async() => {
        if(!currentDate) {
            showMessage('Please Select Date', 'error');
            return;
        }
        if(!avetoInplant){
            showMessage('Please Allow The Condition', 'error');
            return
        }

        const data = new Date(currentDate);
        let payloadMarkPlacement: any = {
            id: shipment._id,
            placement_time: new Date(data.toUTCString()),
        };
        
        if (materials && materials.length > 0) {
            payloadMarkPlacement.materials = materials;
        }

        if (eIndent && eIndent.length > 0) {
            payloadMarkPlacement.indent_no = eIndent;
        }

        const payload = {
            id: shipment._id,
            placement_time : new Date (data.toUTCString()),
        }

        const payloadWithdrownDate = {
            id: shipment._id,
            drawnout_time: new Date (data.toUTCString()),
        }

        const payloadWithReleaseTime = {
            id: shipment._id,
            release_time : new Date (data.toUTCString()),
        }
       
      try {
        const response = await httpsPost(
            different === 'downOut' ? 'rake_shipment/mark_drawnout' : different === 'markplacement' ? 'rake_shipment/mark_placement' : 'rake_shipment/mark_release', 
            different === 'downOut' ? (payloadWithdrownDate) : different === 'markplacement' ? (eIndent ? payloadMarkPlacement : payload) : payloadWithReleaseTime, router)
        if(response.statusCode === 200) {
            let message = different === 'downOut' ? 'Drawn Out Marked Successfully' : different === 'markplacement' ? 'Placement Marked Successfully' : 'Release Time Marked Successfully';
            isClose(false);
            getAllShipment();
            showMessage(message, 'success');
        }
      } catch (error) {
        console.log(error)
      }
       
    }

    return (
        <div style={{width:'100vw', height:'100vh', position:'fixed', top:0, left:0 ,zIndex:300, backgroundColor:'rgba(0, 0, 0, 0.5)'}} onClick={(e)=>{e.stopPropagation(); isClose(false);}}>
            <div style={{width:800, height: different === 'markplacement' ?  580 : 500, backgroundColor:'white', position:'relative', top:'50%', left:'50%', transform:'translate(-50%,-50%)', borderRadius:20, padding:25}} onClick={(e)=>{e.stopPropagation()}}>
             
                    <div style={{display:'flex', justifyContent:'space-between',}}>
                        <header style={{fontSize:20, color:'#131722', fontWeight:600}}>{different==='downOut'? 'Drawn Out Time': different === 'markplacement' ? 'Mark Placement' : 'Release Time'}</header>
                    </div>

                    <div className="status_edemand_fnr">
                        <div>
                            <header style={{fontSize:12, color:'#42454E', marginBottom:8}}>{t('edemandno')}</header>
                            <text style={{fontSize:16, color:"#42454E", fontWeight:600}}>{shipment?.edemand?.edemand_no}</text>
                        </div>
                        
                        <div>
                            <header style={{fontSize:12, color:'#42454E', marginBottom:8}}>{t('destination')}</header>
                            <text style={{fontSize:16, color:"#42454E", fontWeight:600}}>{shipment?.destination?.code}</text>
                        </div>
                        
                        <div>
                            <header style={{fontSize:12, color:'#42454E', marginBottom:8}}>{t('indentNo')}</header>
                            <text style={{fontSize:16, color:"#42454E", fontWeight:600}}>{shipment?.intent_no}</text>
                        </div>
                        <div>
                            <header style={{fontSize:12, color:'#42454E', marginBottom:8}}>{t('status')}</header>
                            <text style={{fontSize:16, color:"#42454E", fontWeight:600}}>{shipment?.status?.name}</text>
                        </div>
                    </div>

                    <div style={{marginTop:24}}>
                        <header style={{ marginBottom:8, fontSize:12, color:'#42454E'}}>{different === 'downOut'? 'Enter Drawn Out Time': different === 'markplacement' ? 'Enter Mark Placement Time' : 'Enter Release Time'}</header>
                        <div style={{border:'1px solid #E9E9EB', borderRadius:6, }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                open={openStartDatePicker}
                                onClose={() => {setOpenStartDatePicker(false)}}
                                value={dayjs(currentDate)}
                                sx={{
                                    width: '100%',
                                    '.MuiInputBase-input': {
                                        padding:'10px',
                                        paddingLeft:'10px',
                                        fontSize: '14px ',
                                        color:'#42454E',
                                        fontWeight:600
                                    },
                                    '.MuiInputBase-root': {

                                        padding: 0,
                                        border: 'none',
                                        '& fieldset': { border: 'none' },
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: 'none',
                                        },
                                    },
                                    '& .MuiIconButton-root': {
                                        left: -720,
                                        position:'relative',

                                    },
                                }}
                                ampm={false}
                                slotProps={{
                                    textField: {
                                        onClick: () =>{setOpenStartDatePicker(!openStartDatePicker)},
                                        fullWidth: true,
                                        InputProps: {
                                            endAdornment: null,
                                        },
                                    },
                                }}
                                viewRenderers={{
                                    hours: renderTimeViewClock,
                                    minutes: renderTimeViewClock,
                                    seconds: renderTimeViewClock,
                                }}
                                onChange={(newDate) => { 
                                    if (newDate) {
                                        setWarraning(true);
                                        setCurrentDate(newDate.toDate());
                                    }
                                }}
                                format="DD/MM/YYYY  HH:mm"
                                />
                            </LocalizationProvider>
                        </div>
                    </div>

                    {
                        different !== 'downOut' && different === 'markplacement' && (
                            <>
                                <div style={{marginTop:24}}>
                                    <header style={{ marginBottom:8, fontSize:12, color:'#42454E'}}>{t('IndentNo')}</header>
                                    <div style={{border:'1px solid #E9E9EB', borderRadius:6,height:40.12, display:'flex', alignItems:'center', paddingLeft:12 }}>
                                        <input onChange={(e)=>{setEIndent(e.target.value)}} value={eIndent} type="text" placeholder='Enter Indent No.' style={{fontWeight:600, fontSize:14, color:'#42454E', border:'none',outline:'none', width:'100%'}} />
                                    </div>
                                </div>
                                <div style={{marginTop:24,display:'flex',columnGap:'52px'}}>
                                    <div>
                                    <header style={{ marginBottom:8, fontSize:12, color:'#42454E'}}>{t('material')}</header>
                                    <CustomMultiSelect
                                      value={materials}
                                      onValueChange={setMaterials}
                                      placeholder="Select Materials"
                                      options={materialDropdownItems}
                                    />
                                    </div>
                                    <div>
                                     <header style={{ marginBottom:8, fontSize:12, color:'#42454E'}}>{"Materials Selection Saved Previously"}</header>
                                     <div style={{fontSize:'14px',marginTop:'4px'}}>{shipment.materials?.join(', ')}</div>
                                    </div>
                                </div>
                            </>
                        )
                    }
                   

                    <div style={{marginTop:24 , display:'flex', alignItems:'center', gap:6}}>
                        {different !== 'releaseTime' && <div><input type="checkbox" style={{width:16, height:16}} onChange={()=>{setAvetoInplant(!avetoInplant)}} /></div>}
                        {different === 'downOut' && different !== 'markplacement' &&  (
                            <text>Change status from <span style={{color:'#134D67',fontWeight:600}}>{t('In Plant')}</span> to <span style={{color:'#FF9800',fontWeight:600}}>{t('In Transit')}</span> </text>
                        )}
                        {different !== 'downOut' && different === 'markplacement' && (
                            <text style={{color:'#EB1F52', fontWeight:'300'}}>Changing the Placement Date will update the previous date.</text>
                        )}
                    </div>

                    <div className="buttonContaioner">
                        <Button className="buttonMarkPlacement" onClick={(e)=>{ e.stopPropagation();  isClose(false); }} style={{color:'#2862FF', border:'1px solid #2862FF', width:110, cursor:'pointer', fontWeight:'bold', transition:'all 0.5s ease-in-out'}}>{t('Cancel')}</Button>
                        <Button className="buttonMarkPlacement" onClick={(e)=>{e.stopPropagation();  handlePlacementDate(); }} style={{color:'white', backgroundColor:'#2862FF',width:110, border:'1px solid #2862FF', cursor:'pointer', fontWeight:'bold',transition:'all 0.5s ease-in-out' }}>{different === 'downOut' ? 'Update' : different === 'markplacement' ? 'Placement' : 'Release' }</Button>
                    </div>

                    <div className="closeContaioner">
                    <CloseIcon onClick={(e) => { e.stopPropagation(); isClose(false) }}/>
                    </div>
            </div>
        </div>
    );
}

export const HandlingEdemand = ({ isClose, isOpen, getAllShipment, shipment }: any) => {
    const router = useRouter();
    const { showMessage } = useSnackbar();
        const payload = {
            rake: shipment._id,
        }
        const handleYes = async () => {
            try {
              const response = await httpsPost(`rake_shipment/cancel`, payload, router);
              if (response?.statusCode === 200) {
                isClose(false);
                getAllShipment();
                showMessage('Removed successfully', 'success');
              } else {
                showMessage('Failed to remove', 'error');
              }
            } catch (error) {
              console.log('Error while cancelling:', error);
              showMessage('An error occurred, please try again', 'error');
            }
          };
    return (
        <Modal
        open={isOpen}
        onClose={() => isClose(false)} 
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <Box
          onClick={(e) => {
            e.stopPropagation();
          }}
          sx={{
            backgroundColor: 'white',
            borderRadius: '12px',
            minWidth: '325px',
            height: '286px',
            position: 'relative',
            outline: 'none',
            padding: '32px',
            textAlign: 'center', 
          }}
        >
          <div>
            <div className="closeContaioner">
                        <CloseIcon
                            onClick={(e) => {
                                e.stopPropagation();
                                isClose(false);
                            }}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
      
            <div
              style={{
                fontSize: 20,
                color: '#131722',
                fontWeight: "SemiBold",
                textAlign: 'left',
                marginBottom: '16px',
                fontFamily:'Plus Jakarta Sans',
              }}
            >
              Cancel e-Demand
            </div>
      
            <div>
              <img
                src={trash.src}
                alt="recycle"
                style={{
                  width: '64px',
                  height: '64px',
                  marginBottom: '16px',
                  padding:10
                }}
              />
            </div>
      
            <div
              style={{
                fontSize: 12,
                color: '#3C4852',
                textAlign: 'left',
                marginBottom: '24px',
                fontWeight:'600'
              }}
            >
              Are you sure you want to cancel the e-Demand number?
            </div>
      
            <div style={{ display: 'flex',alignItems:'left',gap:'50px',paddingTop:30 }}>
              <Button
                variant="contained"
                style={{
                  backgroundColor: '#2C4BFF', 
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  width: '150px',
                  height: '40px',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding:10
                }}
                onClick={() => {
                  handleYes();
                  isClose(false);
                }}
              >
                Yes
              </Button>
              <Button
                variant="outlined"
                style={{
                  borderColor: '#2C4BFF',
                  color: '#2C4BFF',
                  borderRadius: '8px',
                  width: '150px',
                  height: '40px',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
                onClick={() => {
                  isClose(false);
                }}
              >
                No
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
      
    );
};
export const UploadWagonSheet = ({getWagonDetails,isClose, shipment, setOpenUploadFile, ordersUpload='wagonSheet'}:any) => {
    const router = useRouter();
    const t = useTranslations('ORDERS');
    const [fileName, setFileName] = useState('Drag and Drop to upload the file here');
    const [uploadFile, setUploadFile] = useState<any>({});
    const { showMessage } = useSnackbar();

    const handleDragOver = (e:any) => {
        e.preventDefault();
        e.stopPropagation();
      };
    
      const handleDrop = (e :any) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if(e.dataTransfer.files[0].name.split('.').pop() !== 'csv') {
                showMessage('Please upload only csv file', 'error');
                setUploadFile({});
                setFileName('Drag and Drop to upload the file here');
                return;
            }
            setUploadFile(e.dataTransfer.files[0]);
            setFileName(e.dataTransfer.files[0].name);
            e.dataTransfer.clearData();
        }
      };

    const uploadWagonSheet = async () => {
        if(ordersUpload === 'wagonSheet') {
            if(fileName === 'Drag and Drop to upload the file here') {
                showMessage('Please upload the wagon sheet', 'error');
                return;
            }
        }else{
            if(fileName === 'Drag and Drop to upload the file here') {
                showMessage('Please upload the bulk shipment sheet', 'error');
                return;
            }
        }
        
        let payload = {};
        if(ordersUpload === 'wagonSheet') {
            payload = {
                _id: shipment._id || shipment.id,
                edemand_no: shipment.edemand.edemand_no,
                file:uploadFile
            }
        }else{
            payload = {
                file:uploadFile
            }
        }
        
        
        if(ordersUpload === 'wagonSheet') {
            await httpsPost('wagon_sheet/upload', payload, router, 0, true).then((response: any) => {
                if(response.statusCode === 200) {
                    isClose(false); 
                    setFileName('Drag and Drop to upload the file here');
                    setUploadFile({});
                    showMessage('File Uploaded Succcessfully', 'success');
                    getWagonDetails();
                }
                else showMessage(response.message, 'error')
            }).catch((err)=> {
                console.log(err); showMessage(err.message, 'error')
            }) 
        }else{
            await httpsPost('shipment/bulkUpload', payload, router, 0, true).then((response: any) => {
                if(response.statusCode === 200) {
                    setOpenUploadFile(false);
                    setFileName('Drag and Drop to upload the file here');
                    setUploadFile({});
                    showMessage('File Uploaded Succcessfully', 'success');
                }
            }).catch((err) => {
                console.log(err); showMessage(err.message, 'error')
            })
        }
           
    }

    return (
    <div style={{width:'100vw', height:'100vh', position:'fixed', top:0, left:0 ,zIndex:300, backgroundColor:'rgba(0, 0, 0, 0.5)'}} onClick={(e)=>{e.stopPropagation(); ordersUpload === 'wagonSheet' ? isClose(false) : setOpenUploadFile(false);}}>
        <div className="upload-wagon-sheet-modal-main" onClick={(e)=>{e.stopPropagation()}}>

            <div style={{display:'flex', justifyContent:'space-between',}}>
                <header style={{fontSize:20, color:'#131722', fontWeight:600}}>{ ordersUpload === 'wagonSheet' ? t('uploadWagonSheet') : t('bulkUoploadShipmnent')  }</header>
            </div>

            <div className="status_edemand_fnr" style={{display:ordersUpload === 'ordersUpload' ? 'none' : 'flex' }}>
                <div>
                    <header style={{fontSize:12, color:'#42454E', marginBottom:8}}>{t('status')}</header>
                    <text style={{fontSize:16, color:"#42454E", fontWeight:600}}>{shipment?.status?.name || shipment?.status?.statusLabel}</text>
                </div>
                <div>
                    <header style={{fontSize:12, color:'#42454E', marginBottom:8}}>{t('FNRno')}</header>
                    <text style={{fontSize:16, color:"#42454E", fontWeight:600}}>{shipment?.fnr?.primary || shipment?.fnr}</text>
                </div>
                <div>
                    <header style={{fontSize:12, color:'#42454E', marginBottom:8}}>{t('edemandno')}</header>
                    <text style={{fontSize:16, color:"#42454E", fontWeight:600}}>{shipment?.edemand?.edemand_no || shipment?.edemand?.edemand}</text>
                </div>
            </div>

            <div 
                style={{
                    marginTop:ordersUpload === 'ordersUpload' ? 20  : '',
                    height:ordersUpload === 'ordersUpload' ? 300 : '',    
                }}
                className="fileUploadContainer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <label htmlFor="input-file" className="fileUpload">
                <input type="file" accept=".csv" id="input-file" hidden onChange={(e)=>{  if (e.target.files) {setFileName(e.target.files[0].name); setUploadFile(e.target.files[0]) }}} />
                    <div className="fileUploadContent">
                        <div style={{textAlign:'center'}}><CloudUploadIcon style={{width:30, height:30, color:'#5481FF'}}  /></div>
                        <header style={{color:'#71747A', fontSize:12, marginBottom:10,textAlign:'center'}}>{fileName}</header>
                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', marginBottom:8}}><div style={{width:135, height:36 , borderRadius:4, backgroundColor:'#42454E', color:'white', textAlign:'center', alignContent:'center', fontSize:12}}>Browse and Upload</div></div>
                        <p style={{color:'#71747A', fontSize:12,textAlign:'center'}}>Only <span style={{color:'#131722', fontWeight:600}}>CSV</span> file format will be accepted</p>
                    </div>
                </label>
            </div>
            <div>
                { ordersUpload === 'ordersUpload' ? 
                    <p className="sampleFile" onClick={(e)=>{e.stopPropagation();  window.open('https://docs.google.com/spreadsheets/d/19siPbQBvrt7F2dKyC-Am2Ief6XO3fPHvc9QPQvuKtm0/edit?usp=sharing', '_blank'); } } >Download Sample File</p>
                    :<p className="sampleFile" onClick={(e)=>{e.stopPropagation();  window.open('https://docs.google.com/spreadsheets/d/1QbtGG8hlv3gwaoOdabrJ_jm7Pg95th5dGj0MdyT637Y/edit?usp=sharing', '_blank'); } } >Download Sample File</p>
                }
            </div>


            <div className="buttonContaioner">
                <Button className="buttonMarkPlacement" onClick={(e)=>{ e.stopPropagation(); setUploadFile({}); setFileName('Drag and Drop to upload the file here'); }} style={{color:'#2862FF', border:'1px solid #2862FF', width:110, cursor:'pointer', fontWeight:'bold', transition:'all 0.5s ease-in-out'}}>{t('clear')}</Button>
                <Button className="buttonMarkPlacement" onClick={(e)=>{e.stopPropagation(); uploadWagonSheet(); }} style={{color:'white', backgroundColor:'#2862FF',width:110, border:'1px solid #2862FF', cursor:'pointer', fontWeight:'bold',transition:'all 0.5s ease-in-out' }}>{t('upload')}</Button>
            </div>    
            <div className="closeContaioner"><CloseIcon onClick={(e) => { e.stopPropagation(); ordersUpload === 'ordersUpload' ? setOpenUploadFile(false) : isClose(false) }}/></div>
        </div>
    </div>
    )
}

export const UploadDailyRakeHandlingSheet = ({ getWagonDetails, isClose, shipment }:any) => {
    const router = useRouter();
    const text = useTranslations('WAGONTALLYSHEET');
    const [fileName, setFileName] = useState('Drag and Drop to upload the file here');
    const [uploadFile, setUploadFile] = useState<any>({});
    const { showMessage } = useSnackbar();

    const handleDragOver = (e:any) => {
        e.preventDefault();
        e.stopPropagation();
      };
    
      const handleDrop = (e :any) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // if(e.dataTransfer.files[0].name.split('.').pop() !== 'csv') {
            //     showMessage('Please upload only csv file', 'error');
            //     setUploadFile({});
            //     setFileName('Drag and Drop to upload the file here');
            //     return;
            // }
            setUploadFile(e.dataTransfer.files[0]);
            setFileName(e.dataTransfer.files[0].name);
            e.dataTransfer.clearData();
        }
      };

    const uploadWagonSheet = async () => {
        if(fileName === 'Drag and Drop to upload the file here') {
            showMessage('Please upload the Daily Rake Handling Sheet', 'error');
            return;
        }

        const payload = {
            file: uploadFile
        }

        await httpsPost('daily_rake_sheet/upload', payload, router, 0, true).then((response: any) => {
            if(response.statusCode === 200) {
                isClose(false); 
                setFileName('Drag and Drop to upload the file here');
                setUploadFile({});
                showMessage('File Uploaded Succcessfully', 'success');
                getWagonDetails();
            }
            else showMessage(response.message, 'error')
        }).catch((err)=> {
            console.log(err); 
            showMessage('Failed to upload the file', 'error')
        }) 
           
    }

    return (
    <div style={{width:'100vw', height:'100vh', position:'fixed', top:0, left:0 ,zIndex:300, backgroundColor:'rgba(0, 0, 0, 0.5)'}} onClick={(e)=>{e.stopPropagation(); isClose(false)}}>
        <div className="upload-wagon-sheet-modal-main" style={{height:'52vh'}} onClick={(e)=>{e.stopPropagation()}}>

            <div style={{display:'flex', justifyContent:'space-between',}}>
                <header style={{fontSize:20, color:'#131722', fontWeight:600}}>{text("uploadDailyRakeHandlingSheet")}</header>
            </div>

            <div 
                className="fileUploadContainer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <label htmlFor="input-file" className="fileUpload">
                <input type="file"
                 accept=".xlsx"
                  id="input-file" hidden onChange={(e)=>{  if (e.target.files) {setFileName(e.target.files[0].name); setUploadFile(e.target.files[0]) }}} />
                    <div className="fileUploadContent">
                        <div style={{textAlign:'center'}}><CloudUploadIcon style={{width:30, height:30, color:'#5481FF'}}  /></div>
                        <header style={{color:'#71747A', fontSize:12, marginBottom:10,textAlign:'center'}}>{fileName}</header>
                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', marginBottom:8}}><div style={{width:135, height:36 , borderRadius:4, backgroundColor:'#42454E', color:'white', textAlign:'center', alignContent:'center', fontSize:12}}>Browse and Upload</div></div>
                        <p style={{color:'#71747A', fontSize:12,textAlign:'center'}}>Only <span style={{color:'#131722', fontWeight:600}}>XLSX</span> file format will be accepted</p>
                    </div>
                </label>
            </div>
            <div>
                <p className="sampleFile" onClick={(e)=>{e.stopPropagation();  window.open('https://docs.google.com/spreadsheets/d/1-MYaaTcWG7HSDQssjD--W_nrsELi_kLUpq7a5FsVkHI/edit?usp=sharing', '_blank'); } } >Download Sample File</p>
            </div>


            <div className="buttonContaioner">
                <Button className="buttonMarkPlacement" onClick={(e)=>{ e.stopPropagation(); setUploadFile({}); setFileName('Drag and Drop to upload the file here'); }} style={{color:'#2862FF', border:'1px solid #2862FF', width:110, cursor:'pointer', fontWeight:'bold', transition:'all 0.5s ease-in-out'}}>{text('clear')}</Button>
                <Button className="buttonMarkPlacement" onClick={(e)=>{e.stopPropagation(); uploadWagonSheet(); }} style={{color:'white', backgroundColor:'#2862FF',width:110, border:'1px solid #2862FF', cursor:'pointer', fontWeight:'bold',transition:'all 0.5s ease-in-out' }}>{text('upload')}</Button>
            </div>    
            <div className="closeContaioner"><CloseIcon onClick={(e) => { e.stopPropagation(); isClose(false) }}/></div>
        </div>
    </div>
    )
}

export const MarkComplete = ({isClose, shipment, getAllShipment, query, totalCount, setTotalCountrake}:any) => {
    const t = useTranslations('ORDERS');
    const router = useRouter();
    const [remark, setRemark] = useState('');
    const id = shipment?._id;
    const { showMessage } = useSnackbar();
    const postDeliverStatusWithRemark = async () => {
        if(remark === '') {
            showMessage('Please enter remark', 'error');
            return;
        } 

        const payload = {
            id: id,
            remarks: [
                {
                    date: service.getEpoch(new Date()),
                    remark: remark,
                }
            ]
        }

        try {
            const response = await updateDeliverStatusWithRemark(payload, router);
            if (response.statusCode === 200) {
                showMessage('Status Updated Successfully', 'success');
                isClose(false);
                getAllShipment();
                if (query.from && query.to) {
                    totalCount(query.from, query.to).then((res: any) => {
                      if (res && res.statusCode == 200) {
                        setTotalCountrake(res.data);
                      }
                    }).catch((err: any) => {
                      console.log(err);
                    });
                }
            }
        } catch (error) {
            console.log('Error:', error);
            showMessage('An error occurred, please try again', 'error');
        }
        
    };

    return (
    <div style={{width:'100vw', height:'100vh', position:'fixed', top:0, left:0 ,zIndex:300, backgroundColor:'rgba(0, 0, 0, 0.5)'}} onClick={(e)=>{e.stopPropagation(); isClose(false)}}>
        <div className="modify-status-modal-main" onClick={(e)=>{e.stopPropagation()}}>

            <div style={{display:'flex', justifyContent:'space-between',}}>
                <header style={{fontSize:20, color:'#131722', fontWeight:600}}>{t('markComplete')}</header>
            </div>

            <div className="modify-status-remark">
                <header style={{ fontSize:14, color:'#42454E', fontWeight: 600}}>{t('remark')}</header>
                <input className="modify-status-remark-input" type="text" placeholder="Enter Remark" value={remark} onChange={
                    (e) => {
                        setRemark(e.target.value);
                    }
                }/>
            </div>

            <div className="buttonContaioner">
                <Button className="buttonMarkPlacement" onClick={(e)=>{ 
                    e.stopPropagation();  
                    setRemark('');
                }} style={{color:'#2862FF', border:'1px solid #2862FF', width:110, cursor:'pointer', fontWeight:'bold', transition:'all 0.5s ease-in-out'}}>{t('clear')}</Button>
                <Button className="buttonMarkPlacement" onClick={(e)=>{e.stopPropagation(); postDeliverStatusWithRemark(); }} style={{color:'white', backgroundColor:'#2862FF',width:110, border:'1px solid #2862FF', cursor:'pointer', fontWeight:'bold',transition:'all 0.5s ease-in-out' }}>{t('submit')}</Button>
            </div>    
            <div className="closeContaioner"><CloseIcon onClick={(e) => { e.stopPropagation(); isClose(false) }}/></div>
        </div>
    </div>
    )
}

export const HandlingETA = ({ isClose, isOpen, shipment, getAllShipment, difference}: any) => {
    const router = useRouter();
    const { showMessage } = useSnackbar();
    const [time, setTime] = React.useState('');
    
    useEffect(() => {
        if (difference) {
            setTime(difference || '');
        }
    }, [difference]);



    const handleChange = (event: SelectChangeEvent) => {
        setTime(event.target.value);
    };
    const payload = {
        id:shipment._id,
        preferred_eta: time
    }
    
   const handleSubmit = async()=>{
    try {
        const response = await httpsPost(`rake_shipment/preferred_difference_eta`, payload, router);
        if (response?.statusCode === 200) {
            showMessage(' Updated Successfully',"success");
          isClose(false);
          getAllShipment();
        }
      } catch (error) {
        console.log('Error:', error);
        showMessage('An error occurred, please try again', 'error');
      }
    };
    return (
        <div>
        <Modal
          open={isOpen}
          onClose={() => isClose(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Box
            onClick={(e) => {
              e.stopPropagation();
            }}
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              minWidth: '340px',
              maxWidth: '400px',
              padding: '25px',
              position: 'relative',
              outline: 'none',
              textAlign: 'left',
              height:'320px'
            }}
          >
            <div className="closeContaioner">
                        <CloseIcon
                            onClick={(e) => {
                                e.stopPropagation();
                                isClose(false);
                            }}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ color: '#131722', fontSize: '20px', fontWeight: 500, marginBottom: '24px' }}>
                            Update ETA
                        </div>
                        <div style={{marginBottom:'18px'}} >
                            <span>Shipment FNR: <span style={{fontWeight:500}}>{shipment.fnr.primary}</span></span>
                        </div>
                       
                    </div>

                    <div style={{ color: '#42454E', fontSize: '14px' }}>
                        <span>Preferred Difference in ETA</span>
                       </div>
            
            <FormControl fullWidth>
              <Select
                value={time}
                onChange={handleChange}
                displayEmpty
                sx={{
                  borderRadius: '4px',
                  height: '36px',
                  backgroundColor: '#ffff',
                  marginTop: '10px',
                  border:'1px solid #E9E9EB',
                }}
              >
                <MenuItem value={15}>15 min</MenuItem>
                <MenuItem value={30}>30 min</MenuItem>
                <MenuItem value={45}>45 min</MenuItem>
                <MenuItem value={60}>1 hr</MenuItem>
              </Select>
            </FormControl>
            
            <div style={{ marginTop: '77px' }}>
              <button
                style={{
                  background: '#3351FF',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  width: '100%',
                  height: '40px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
                onClick={handleSubmit}
              >
                UPDATE
              </button>
            </div>
          </Box>
        </Modal>
      </div>
      
    )
};
  
  const reasons = [
    { value: "missing-wagons", label: "Missing Wagons" },
    { value: "delay", label: "Delay" },
    { value: "status-update", label: "Status update" },
    { value: "recovery", label: "Recovery of missing wagon" },
    { value: "others", label: "Others" },
  ]
  
  const contactPersons = [
    { value: "controller", label: "Controller" },
    { value: "station-master", label: "Station Master" },
    { value: "liaison-manager", label: "Liaison Manager"}
    // { value: "others", label: "Others" },
  ]

export const ContactModal = ({isClose, shipment}:any) => {

    const text = useTranslations('ORDERS');
    const [stationName, setStationName] = useState('');
    const [reason, setReason] = useState('Select Reason');
    const [contactPerson, setContactPerson] = useState('Select Contact Person');
    const [contactNumber, setContactNumber] = useState<null | number>(null);
    const [name, setName] = useState('');
    const [rating, setRating] = useState(0); 
    const [stationList, setStationList] = useState<any>([]);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const [loadder, setLoadder] = useState(false);
    const [comment, setComment] = useState('');
    const { showMessage } = useSnackbar();
    const [toggleBtn, setToggleBtn] = useState('newContact');
    const [openStationDropDown, setOpenStationDropDown] = useState(false);
    const [openReasonDropDown, setOpenReasonDropDown] = useState(false);
    const [opencontactpersonDropDown, setOpencontactpersonDropDown] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [stationId, setStationId] = useState('');
    const [stationCode, setStationCode] = useState('');
    const [otherReasons, setOtherReasons] = useState<String | null>(null);

    const [contactNumberListDropDown, setContactNumberListDropDown] = useState(false);
    const [stationNameCopy, setStationNameCopy] = useState([]);

    const [stationNameDropDown, setStationNameDropDown] = useState(false);
    const [oldContactDetailsList, setOldContactDetailsList] = useState<any>([]);

    function changeStationName(value:any) {
        setStationName(value);
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        if (value === '') {
            setLoadder(false);
            setStationList([]);
        } else {
            setLoadder(true);
            debounceTimer.current = setTimeout(async () => {
                try {
                    const response = await httpsGet(`get/stationNames?stationName=${value}`);
                    if (response.data.length > 0) {
                        setStationList(response.data);
                        setStationNameCopy(response.data)
                        setLoadder(false);
                    } else {
                        setStationList([{name:'No Data Found'}]);
                        setLoadder(false);
                    }
                } catch (error) {
                    console.log(error);
                }
            }, 1500);
        }
    }

    async function submitContact() {
        let payload = {
            id:shipment._id,
            stationName,
            reason:otherReasons || reason,
            contactPerson,
            contactPersonMobile:contactNumber,
            name,
            rating,
            comment,
            contactTime: new Date (currentDate).toISOString(),
            stationCode,
            stationId,
            
        }
        if(stationName === '' || stationName === 'No Data Found' || !stationNameCopy.some((item:any) => item.name === stationName) ) {
            return showMessage('Please Select Station Name From List', 'error');
        }
        if(contactNumber === null) return showMessage('Please Enter Contact Number', 'error');
        const phoneNumberPattern = /^[0-9]{10}$/;
        if (!phoneNumberPattern.test(contactNumber.toString())) {
            return showMessage('Please Enter a Valid 10-Digit Contact Number', 'error');
        }
        if(reason === 'Select Reason') return showMessage('Please Select Reason', 'error');
        if(reason === 'Others' && otherReasons === null){
            return showMessage('Please Enter Other Reason', 'error');
        }
        if(contactPerson === 'Select Contact Person') return showMessage('Please Select Contact Person', 'error');
        if(name === '') return showMessage('Please Enter Name', 'error');
        if(comment === '') return showMessage('Please Enter Comment', 'error');
        if(rating === 0) return showMessage('Please Enter Rating', 'error');
        
        try {
            const response = await httpsPost('rake_shipment/updateContactDeta', payload);
            if (response.statusCode === 200) {
                isClose(false);
                setStationName('');
                setReason('select reason');
                setContactPerson('select contact person');
                setContactNumber(null);

                setName('');
                setRating(0);
                setComment('');

                setStationList([]);
                setOpenStationDropDown(false);
                setOpenReasonDropDown(false);
                showMessage('Contact Updated Successfully', 'success');
            }
        } catch (error) {
            console.log(error);
        }
    } 

    const getContactDetailsByStationName = async () => {
        try {
           const response = await httpsGet(`rake_shipment/getAllContactList?id=${shipment._id}&stnID=${stationId}`);
           if(response.statusCode === 200) {
                setOldContactDetailsList(response.data);
           }
        }catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        if(stationName !== '' && stationName !== 'No Data Found' && stationNameCopy.some((item:any) => item.name === stationName)) {
            getContactDetailsByStationName();
        }
    },[stationName])

    return(
        <div style={{width:'100vw', height:'100vh', position:'fixed', top:0, left:0 ,zIndex:300, backgroundColor:'rgba(0, 0, 0, 0.5)'}} onClick={(e)=>{e.stopPropagation(); isClose(false)}}>
        <div className="contactModal" onClick={(e)=>{e.stopPropagation(); setOpenStationDropDown(false); setStationList([]); setOpenReasonDropDown(false); setOpencontactpersonDropDown(false); setContactNumberListDropDown(false); setStationNameDropDown(false);}}>
            <div className="closeContaioner"><CloseIcon onClick={(e) => { e.stopPropagation(); isClose(false) }}/></div>
        
            <div style={{display:toggleBtn === 'newContact'?'block':'none', position:'relative', height:'100%'}}>
                <header id="contactModalHeader">{text('contactModalHeader')} - #{shipment?.fnr?.primary}</header>
                <div id='formContainer'>

                <div id='stationName'>
                    <label id='labelName' >{text('stationName')}</label>
                    <div id='stationNameInput' onClick={(e)=>{e.stopPropagation(); }}><input value={stationName} type="text" placeholder="Enter Name" style={{border:'none', outline:'none'}} onChange={(e)=>{changeStationName(e.target.value);}} /></div>
                    {stationList.length > 0 && <div id='stationDropDown'>
                        {stationList?.map((item: any, index: number) => (
                            <div id='stationNameItem' key={index} onClick={() => {setStationName(item.name); setStationList([]); setStationCode(item.code); setStationId(item._id)}}>{item.name} { item?.code && <span style={{fontWeight:'bold'}}>({item.code})</span>}</div>
                        ))}
                    </div>}
                    {loadder && <div id='loaderForStationName'><CircularProgress size={15} /></div>}
                </div>

                <div id='stationName'>
                    <label id='labelName' >{text('name')}</label>
                    <div id='stationNameInput' onClick={(e)=>{e.stopPropagation(); setStationNameDropDown(!stationNameDropDown) }}><input value={name} onChange={(e)=>{setName(e.target.value)}} type="text" placeholder="Enter Name" style={{border:'none', outline:'none'}} /></div>
                    {stationNameDropDown && <div id='stationDropDown'>
                        {oldContactDetailsList?.map((item: any, index: number) => (
                            <div id='stationNameItem' key={index} onClick={() => {setContactNumberListDropDown(false); setName(item.name); setContactNumber(item.ph_no); setContactPerson(item.role); setStationNameDropDown(false); }}>{item.name}</div>
                        ))}
                    </div>}
                </div>

                <div id='stationName'>
                    <label id='labelName' >{text('contactNo')}</label>
                    <div id='stationNameInput' onClick={(e)=>{ e.stopPropagation();}} ><input value={contactNumber ?? ''} onChange={(e)=>{setContactNumber(parseInt(e.target.value)||null);}} type="number" placeholder="Enter Contact Number" style={{border:'none', outline:'none'}} onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {e.preventDefault();}
                }}/></div>
                </div>

                <div id='stationName'>
                    <label id='labelName' >{text('contactPerson')}</label>
                    <div id='stationNameInput' style={{color:'black', fontSize:'13px'}} onClick={(e)=>{e.stopPropagation(); setOpencontactpersonDropDown(!opencontactpersonDropDown) }} >{contactPerson}</div>
                    {opencontactpersonDropDown && <div id='stationDropDown'>
                        {contactPersons?.map((item: any, index: number) => (
                            <div id='stationNameItem' key={index} onClick={() => {setContactPerson(item.label); setOpencontactpersonDropDown(false);}}>{item.label}</div>
                        ))}
                    </div>}
                </div>
                
                <div id='stationName'>
                    <label id='labelName' >{text('reasons')}</label>
                    <div id='stationNameInput' style={{color:'black', fontSize:'13px'}} onClick={(e)=>{e.stopPropagation(); setOpenReasonDropDown(!openReasonDropDown) }}>{reason}</div>
                    {openReasonDropDown && <div id='stationDropDown'>
                        {reasons?.map((item: any, index: number) => (
                            <div id='stationNameItem' key={index} onClick={() => {setReason(item.label); setOtherReasons(null); setOpenReasonDropDown(false);}}>{item.label}</div>
                        ))}
                    </div>}
                </div>
             
                {(reason === 'Others' )&& (
                    <div id='stationName'>
                    <label id='labelName' >{text('otherReason')}</label>
                    <div id='stationNameInput'><input onChange={(e)=>{setOtherReasons(e.target.value)}} value={(otherReasons|| "").toString()} type="text" placeholder="Enter your reason" style={{border:'none', outline:'none'}} /></div>
                    </div>
                )}
                
                <div id='stationName'>
                    <label id='labelName' >{text('currentTime')}</label>
                    <div id="datePickerContainer" style={{ fontSize:'13px', }}>
                    <CustomDateTimePicker value={currentDate} onChange={(date:any) => {setCurrentDate(date);}} label={null} />
                    </div>
                </div>

            </div>

            <div id='commentContainer'>
                <div><label id='labelName' >{text('comment')}</label></div>
                <div style={{width:'100%', border:"1px solid #E9E9EB", borderRadius:'4px'}}><textarea value={comment} id='commentInput' placeholder={text('commentPlaceholder')} onChange={(e)=>{setComment(e.target.value)}} ></textarea></div>
            </div>

            <div id='rateContainer'>
                <div><label id='labelName' >{text('rate')}</label></div>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <StarRateRoundedIcon
                            key={value}
                            onClick={() => setRating(value)}
                            className={`star ${value <= rating ? 'selected' : ''}`}
                            fontSize="medium"
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </div>
            </div>

            <div id='btnContainer'>
                <div id='submit-btn' onClick={()=>{submitContact()}} >{text('submit')}</div>
            </div>
            </div> 

        </div>
    </div>
    );
}

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

export const ViewContactModal = ({isClose, shipmentData}:any) => {
    const text = useTranslations('ORDERS');
    const [viewContactsList, setViewContactsList] = useState([]);

    const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [showActionBox, setShowActionBox] = React.useState(-1);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  function clickActionBox(
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    index: number,
    id: string,
    locationId: string
  ) {
    e.stopPropagation();
    setShowActionBox((prevIndex: any) => (prevIndex === index ? -1 : index));
  }

  const handleCloseAction = () => {
    setAnchorEl(null);
    setShowActionBox(-1);
  };

    const viewAllContactsDetails = async () => {
        try {
            const response = await httpsGet(`rake_shipment/viewContactDetails?id=${shipmentData._id}`);
            if (response.statusCode === 200) {
                setViewContactsList(response.data);
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        viewAllContactsDetails();
    }, [])

    interface Column {
        id: string;
        label: string;
        style: string;
      }

    const columns: readonly Column[] = [
        { id: "sno", label: "SI No", style: "header_sno" },
        { id: "stationName", label: "Station Name", style: "header_stationName" },
        { id: "fnr", label: "FNR No", style: "header_fnr" },
        {
          id: "contactPersonRole",
          label: "Contact Person Role",
          style: "header_contactPersonRole",
        },
        { id: "name", label: "Name", style: "header_name" },
        { id: "contact", label: "Contact No.", style: "header_contact_no" },
        { id: "reason", label: "Reason", style: "header_reason" },
        { id: "comment", label: "Comment", style: "header_comment" },
        // { id: "action", label: "Action", style: "header_action" },
      ];
      
      function contructingData(shipment: any) {
        return shipment.map(
          (shipment: {
            _id: string;
            rakeShipment: {
                FNR:string
            };
            stnName: {
                name:string
            };
            reason: string;
            role: string;
            name: string;
            mobile: string;
            comment: string;
            rating: number;
            created_at: string;
            contactTime:any;
          }) => {
            return {
              id: shipment?._id ? shipment._id : '--',
              stationName: shipment?.stnName?.name
                ? shipment?.stnName?.name
                : "--",
              fnr: shipment?.rakeShipment?.FNR ? shipment?.rakeShipment?.FNR : "--",
              contactPersonRole: shipment?.role
                ? shipment?.role
                : "--",
              contactPersonName: {
                contactPersonName: shipment?.name
                  ? shipment?.name
                  : "--",
              },
              contact: shipment?.mobile
                ? shipment?.mobile
                : "--",
              reason: shipment?.reason ? shipment?.reason : "--",
              comment: shipment?.comment ? shipment?.comment : "--",
              rating: shipment?.rating ? shipment?.rating : 0,
              created_at: shipment?.created_at ? shipment?.created_at : "--",
              contactTime:shipment?.contactTime ? shipment?.contactTime : '--',
            };
          }
        );
      }
    return (
        <div style={{width:'100vw', height:'100vh', position:'fixed', top:0, left:0 ,zIndex:300, backgroundColor:'rgba(0, 0, 0, 0.5)'}} onClick={(e)=>{e.stopPropagation(); isClose(false)}}>
        <div id="viewContactModal" onClick={(e)=>{e.stopPropagation();}}>
            <div className="closeContaioner"><CloseIcon onClick={(e) => { e.stopPropagation(); isClose(false) }}/></div>
            <header id="contactModalHeader">{text('contactModalHeader')} - #{shipmentData?.fnr?.primary}</header>
            <div
      style={{
        width: "100%",
        height: "90%",
        display: "flex",
        flexDirection: "column",
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
        {/* <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={viewContactsList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Contacts per page:"
          sx={{ position: "absolute", top: -40, zIndex: 100, right: -10 }}
        /> */}
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
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={column.style}
                    style={{
                      textAlign: "center",
                      padding: "8px 10px 8px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#484A57",
                      whiteSpace: "nowrap",
                      paddingInline: 10,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {contructingData(viewContactsList).map(
                (row: any, rowIndex: any) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={rowIndex}
                    >
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell
                            key={column.id}
                            sx={{
                              textAlign: "center",
                              padding: "8px 10px 8px 10px",
                              fontSize: 10,
                            }}
                          >
                            {typeof value !== "object" && value}
                            {column.id === "sno" && (
                              <div style={{ fontSize: 12 }}>
                                {rowIndex + 1 + page * rowsPerPage}.
                              </div>
                            )}
                            {column.id === "name" && (
                              <div style={{ textAlign: "left", paddingLeft:10 }}>
                                <div>
                                  {row.contactPersonName.contactPersonName}
                                </div>
                                <div
                                  style={{
                                    color: "gold",
                                    display: "flex",
                                    gap: 3,
                                    marginTop: 2,
                                    fontSize: 10,
                                  }}
                                >
                                  {Array.from(
                                    { length: row.rating },
                                    (_, i) => (
                                      <span key={i}>★</span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            {column.id === 'stationName' && (
                                <div>{service.utcToist(row.contactTime, 'dd-MMM-yy HH:mm')}</div>
                            )}
                            {column.id === "action" && (
                              <div id="actionIconContaioner">
                                <div
                                  id="actionIcon"
                                  onClick={(e: any) => {
                                    clickActionBox(e, rowIndex, "", "");
                                    setAnchorEl(
                                      e.currentTarget as unknown as HTMLButtonElement
                                    );
                                  }}
                                >
                                  <MoreHorizIcon
                                    style={{ color: "white", fontSize: 16 }}
                                  />
                                </div>
                                <Popover
                                  open={
                                    showActionBox === rowIndex ? true : false
                                  }
                                  anchorEl={anchorEl}
                                  onClose={handleCloseAction}
                                  anchorOrigin={{
                                    vertical: 30,
                                    horizontal: -120,
                                  }}
                                >
                                  <div
                                    className="action-popover-wagon"
                                    onClick={(e) => {}}
                                  >
                                    Rate Again
                                  </div>
                                  {/* <div
                                    className="action-popover-wagon"
                                    onClick={(e) => {}}
                                  >
                                    Delete Contact
                                  </div> */}
                                </Popover>
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
        </div>
    </div>
    )
}
