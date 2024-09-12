import { useEffect, useState } from "react";
import React from "react";


import Paper from '@mui/material/Paper';

import Checkbox from '@mui/material/Checkbox';
import { useCallback } from 'react'
import './table.css'
import service from '@/utils/timeService';


import { useTranslations } from 'next-intl';



import TextField from '@mui/material/TextField';


import { ClickAwayListener, Popper, Tooltip, } from '@mui/material';
import Button from '@mui/material/Button';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { httpsPost, httpsGet } from '@/utils/Communication';
import { UPDATE_RAKE_CAPTIVE_ID, REMARKS_UPDATE_ID, FETCH_TRACK_DETAILS, UPDATE_ELD, GET_HANDLING_AGENT_LIST } from '@/utils/helper'
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

async function rake_update_id(payload: Object) {
    return await httpsPost(UPDATE_RAKE_CAPTIVE_ID, payload);
}

async function remake_update_By_Id(payload: object) {
    const response = await httpsPost(REMARKS_UPDATE_ID, payload);
    return response;
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

        const response = remake_update_By_Id(remarkObject);
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
            rake_update_id(updatedObject).then((res: any) => {
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
    console.log(row.past_etas, 'row.past_etas')
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

    const t = useTranslations('ORDERS');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const { showMessage } = useSnackbar();
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [selectDate, setSelectDate] = useState(new Date());

    const handleDatePickerToggle = () => {
        setOpenDatePicker((prev) => !prev);
    };

    const handleDateSubmit = async () => {
        const dateObject = new Date(selectDate);
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
            const res = await httpsPost(UPDATE_ELD, payload)
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

            <div style={{ marginTop: '24px' }}>
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
            </div>

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
    const t = useTranslations('ORDERS');
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    const [allListOfHAids, setAllListOfHAids] = useState<{ _id: string, parent_name: string }[]>([]);
    const [selectedHAids, setSelectedHAids] = useState(new Set());
    const [originalSelectedHAids, setOriginalSelectedHAids] = useState<Set<any>>(new Set());
    const [newIds, setNewIds] = useState<string[]>([]);
    const [removeIds, setRemoveIds] = useState<string[]>([]);
    const [toggleForShowAllHA, setToggleForShowAllHA] = useState(true);

    const { showMessage } = useSnackbar();
    const getLocationList = async () => {
        try {
            const res = await httpsGet(`${GET_HANDLING_AGENT_LIST}?delivery_locations=${locationId}`);
            if (res.statusCode === 200) {
                setAllListOfHAids(res?.data);
            }
        } catch (error) {
            console.error("Error fetching location list:", error);
        }
    };

    const getRakeShipmentHA = async () => {
        try {
            const res = await httpsGet(`handling_agent/get_rake_shipment_ha?id=${shipmentId}`);
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
            const res = await httpsPost(`rake_shipment/assign_edit_ha`, { id: shipmentId, addIds: newIds, removeIds: removeIds });
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
            const res = toggleForShowAllHA ? await httpsGet(`${GET_HANDLING_AGENT_LIST}?delivery_locations=${locationId}&isAllHA=${toggleForShowAllHA}`) : await httpsGet(`${GET_HANDLING_AGENT_LIST}?delivery_locations=${locationId}`);
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
                                    <ListItemText primary={item.parent_name} primaryTypographyProps={{ padding: 0, fontSize: '14px', fontFamily: 'Inter, sans-serif' }} />
                                </div>
                                <div style={{ marginLeft: 42, fontSize: 12,  color: '#7C7E8C'}}>
                                    {item?.location?.map((location: any, locationIndex: any) => (
                                        <div key={locationIndex}>{location.parent_name}</div>
                                    ))}
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
export const MarkPlacement = ({isClose ,shipment, getAllShipment, different = 'markplacement'}: any) =>{
    const t = useTranslations("ORDERS");
   
    const [currentDate, setCurrentDate] = useState(new Date());
    const { showMessage } = useSnackbar();
    const [avetoInplant, setAvetoInplant] = useState(false);
    const [eIndent, setEIndent] = useState('');
    const [warraning, setWarraning] = useState(false);

    const handlePlacementDate = async() => {
        if(!currentDate) {
            showMessage('Please Select Date', 'error');
            return;
        }
        if(!avetoInplant){
            showMessage('Please Allow The Condition', 'error');
            return
        }

        const payloadWitheident = {
            id: shipment._id,
            placement_time : currentDate,
            intent_no : eIndent
        }

        const payload = {
            id: shipment._id,
            placement_time : currentDate,
        }

        const payloadWithdrownDate = {
            id: shipment._id,
            drawnout_time: currentDate
        }
       
      try {
        const response = await httpsPost(different === 'downOut'?'rake_shipment/mark_drawnout':'rake_shipment/mark_placement', different === 'downOut' ?(payloadWithdrownDate):(eIndent?payloadWitheident: payload))
        if(response.statusCode === 200) {
            isClose(false);
            getAllShipment();
            showMessage('Placement Marked Successfully', 'success');
        }
      } catch (error) {
        console.log(error)
      }
       
    }

    return (
        <div style={{width:'100vw', height:'100vh', position:'fixed', top:0, left:0 ,zIndex:300, backgroundColor:'rgba(0, 0, 0, 0.5)'}} onClick={(e)=>{e.stopPropagation(); isClose(false);}}>
            <div style={{width:800, height:500, backgroundColor:'white', position:'relative', top:'50%', left:'50%', transform:'translate(-50%,-50%)', borderRadius:20, padding:25}} onClick={(e)=>{e.stopPropagation()}}>
             
                    <div style={{display:'flex', justifyContent:'space-between',}}>
                        <header style={{fontSize:20, color:'#131722', fontWeight:600}}>{different==='downOut'?'Drown Out Time':'Mark Placement'}</header>
                    </div>

                    <div className="status_edemand_fnr">
                        <div>
                            <header style={{fontSize:12, color:'#42454E', marginBottom:8}}>{t('status')}</header>
                            <text style={{fontSize:16, color:"#42454E", fontWeight:600}}>{shipment.status.name}</text>
                        </div>
                        <div>
                            <header style={{fontSize:12, color:'#42454E', marginBottom:8}}>{t('FNRno')}</header>
                            <text style={{fontSize:16, color:"#42454E", fontWeight:600}}>{shipment.fnr.primary}</text>
                        </div>
                        <div>
                            <header style={{fontSize:12, color:'#42454E', marginBottom:8}}>{t('edemandno')}</header>
                            <text style={{fontSize:16, color:"#42454E", fontWeight:600}}>{shipment.edemand.edemand_no}</text>
                        </div>
                    </div>

                    <div style={{marginTop:24}}>
                        <header style={{ marginBottom:8, fontSize:12, color:'#42454E'}}>{different === 'downOut'?'Enter Downout Time':'Enter Placement Time'}</header>
                        <div style={{border:'1px solid #E9E9EB', borderRadius:6, }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                value={dayjs(currentDate)}
                                sx={{
                                    width: '100%',
                                    '.MuiInputBase-input': {
                                        padding:'10px',
                                        paddingLeft:'40px',
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
                        different !== 'downOut' && (
                            <div style={{marginTop:24}}>
                            <header style={{ marginBottom:8, fontSize:12, color:'#42454E'}}>{t('IndentNo')}</header>
                            <div style={{border:'1px solid #E9E9EB', borderRadius:6,height:40.12, display:'flex', alignItems:'center', paddingLeft:12 }}>
                                <input onChange={(e)=>{setEIndent(e.target.value)}} type="text" placeholder='Enter Indent No.' style={{fontWeight:600, fontSize:14, color:'#42454E', border:'none',outline:'none', width:'100%'}} />
                            </div>
                            </div>
                        )
                    }
                   

                    <div style={{marginTop:24 , display:'flex', alignItems:'center', gap:6}}>
                        <div><input type="checkbox" style={{width:16, height:16}} onChange={()=>{setAvetoInplant(!avetoInplant)}} /></div>
                        {different === 'downOut' && (
                            <text>change status from <span style={{color:'#134D67',fontWeight:600}}>{t('In Plant')}</span> to <span style={{color:'#FF9800',fontWeight:600}}>{t('In Transit')}</span> </text>
                        )}
                        {different !== 'downOut' && (
                            <text style={{color:'#EB1F52', fontWeight:'300'}}>Changing the Placement Date will update the previous date.</text>
                        )}
                    </div>
                    
                    

                    <div className="buttonContaioner">
                        <Button className="buttonMarkPlacement" onClick={(e)=>{ e.stopPropagation();  isClose(false); }} style={{color:'#2862FF', border:'1px solid #2862FF', width:110, cursor:'pointer', fontWeight:'bold', transition:'all 0.5s ease-in-out'}}>{t('Cancel')}</Button>
                        <Button className="buttonMarkPlacement" onClick={(e)=>{e.stopPropagation();  handlePlacementDate(); }} style={{color:'white', backgroundColor:'#2862FF',width:110, border:'1px solid #2862FF', cursor:'pointer', fontWeight:'bold',transition:'all 0.5s ease-in-out' }}>{different==='downOut'?'Update':'Placement'}</Button>
                    </div>

                    <div className="closeContaioner">
                    <CloseIcon onClick={(e) => { e.stopPropagation(); isClose(false) }}/>
                    </div>
            </div>
        </div>
    );
}