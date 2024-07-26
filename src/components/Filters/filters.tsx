'use client'

import './filters.css'
import * as React from 'react';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useState, useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import closeIcon from '../../assets/close_icon.svg'
import dayjs from 'dayjs';
import service from '@/utils/timeService';
import { motion } from 'framer-motion';
import Image from 'next/image';
import MapViewIcon from "@/assets/map_view.svg";
import calenderIcon from '@/assets/calender_icon_filters.svg'
import filter_icon from '@/assets/filter_icon.svg'


function Filters({ onToFromChange, onChangeStatus, onChangeRakeTypes, reload, shipmentsPayloadSetter }: any) {



    const MenuProps = {
        PaperProps: {
            style: {
                width: 128,
                marginTop: '3px',
            },
        },
    };

    const names = [
        'Available eIndent',
        'Ready for Departure',
        'In Transit',
        'Delivered At Hub',
        'Delivered At Customer',
        'In Plant'
    ];


    const rakeTypes = [
        'Captive Rakes',
        'Indian Railway Rakes'
    ];

    const [status, setStatus] = useState(['In Transit', 'Delivered At Hub', 'Delivered At Customer']);
    const [rakeType, setRakeType] = useState(['Captive Rakes', 'Indian Railway Rakes'])
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
    const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

    const handleChange = (event: any) => {
        const {
            target: { value },
        } = event;
        setStatus(
            typeof value === 'string' ? value.split(',') : value,
        );
        onChangeStatus(typeof value === 'string' ? value.split(',') : value,)
    };

    const handleChangeRakeType = (event: any) => {
        const {
            target: { value },
        } = event;
        setRakeType(
            typeof value === 'string' ? value.split(',') : value,
        );
        onChangeRakeTypes(typeof value === 'string' ? value.split(',') : value,)
    };



    const today = new Date();
    const twentyDaysBefore = new Date();
    twentyDaysBefore.setDate(today.getDate() - 20);

    const [startDate, setStartDate] = useState(twentyDaysBefore);
    const [endDate, setEndDate] = useState(today);
    const [error, setError] = useState('');
    const [openFilterModal, setOpenFilterModal] = useState(false)
    const [filterEDemand, setFilterEDemand] = useState('');
    const [filterDestination, setFilterDestination] = useState('');
    const [disableStartDate, setDisableStartDate] = useState(false);
    const [disableEndDate, setDisableEndDate] = useState(false);
    const [filterMaterial, setFilterMaterial] = useState('');


    const formatDate = (date: any) => {
        const t = service.getLocalTime(new Date(date));
        return t;
    };

    const handleStartDateChange = (e: any) => {
        const newStartDate = e.$d
        if (new Date(newStartDate) > new Date(endDate)) {
            setError('Start date cannot be after end date');
        } else {
            setError('');
        }
        setStartDate(newStartDate.setHours(0, 0, 0, 0));
        shouldDisableStartDate(newStartDate.setHours(0, 0, 0, 0));
    };

    const handleEndDateChange = (e: any) => {
        const newEndDate = e.$d;
        if (new Date(startDate) > new Date(newEndDate)) {
            setError("Start date cannot be after end date");
        } else {
            setError('');
        }
        setEndDate(newEndDate);
        shouldDisableEndDate(newEndDate);
    };

    function clearFilter() {
        setFilterMaterial('')
        setFilterDestination('')
        setFilterEDemand('')
        shipmentsPayloadSetter((prevState: any) => {
            const newState = { ...prevState };
            delete newState["eDemand"];
            delete newState["destination"];
            delete newState["material"];

            return newState;
        });
    }

    function shouldDisableStartDate(date: Date): boolean | undefined {
        const disable = (date > new Date()) || (date > endDate);
        return disable
    }

    function shouldDisableEndDate(date: Date): boolean | undefined {
        const disable = (date > new Date()) || (new Date(new Date(date).setHours(23, 59, 59, 999)) < startDate);
        return disable
    }

    function handleSubmit() {
        shipmentsPayloadSetter((prevState: any) => {
            const newState = { ...prevState };
            if (!filterEDemand) delete newState["eDemand"];
            else newState.eDemand = filterEDemand;
            if (!filterDestination) delete newState["destination"];
            else newState.destination = filterDestination;
            if (!filterMaterial) delete newState["material"]
            else newState.material = filterMaterial

            return newState;
        });
        setOpenFilterModal(false);
    }

    useEffect(() => {
        if (!reload)
            if (startDate && endDate && !error) {
                onToFromChange(endDate, startDate);
            }

    }, [startDate, endDate, error]);

    useEffect(() => {
        if (reload) {
            const today = new Date();
            const twentyDaysBefore = new Date(today);
            twentyDaysBefore.setDate(today.getDate() - 20);

            setStartDate(twentyDaysBefore);
            setEndDate(today);

            if (startDate === twentyDaysBefore && endDate === today) {
                onToFromChange(today, twentyDaysBefore);
            }
            setStatus(['In Transit', 'Delivered']);
        }
    }, [reload]);

    return (
        <div>
            <div style={{ display: 'flex', gap: 20, position: 'relative', overflowY: 'hidden' }} >

                <div style={{ display: 'flex', gap: 20}}>
                    <div style={{ height: 36, width: 132, border: '1px solid #E9E9EB', borderRadius: '6px', display: 'flex', alignItems: 'center', paddingLeft: 8 }} >
                        <div style={{ height: 16, width: 16, marginBottom: 4 }}><img src={calenderIcon.src} alt='' /></div>
                        <div style={{ flex: 1, marginTop: 6, marginLeft: 10 }}>
                            <div style={{ fontSize: 10, color: '#44475B' }}>From</div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    open={openStartDatePicker}
                                    onOpen={() => setOpenStartDatePicker(true)}
                                    onClose={() => setOpenStartDatePicker(false)}
                                    slotProps={{
                                        textField: {
                                            placeholder: formatDate(startDate),
                                            onClick: () => setOpenStartDatePicker(!openStartDatePicker),
                                            fullWidth: true,
                                            InputProps: {
                                                endAdornment: null,
                                            },
                                        },
                                    }}
                                    sx={{

                                        '.MuiInputBase-input': {
                                            padding: '0 !important',
                                            fontSize: '12px !important',
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
                                    }}
                                    value={dayjs(startDate)}
                                    onChange={(newDate) => { handleStartDateChange(newDate) }}
                                    disabled={disableStartDate}
                                />
                            </LocalizationProvider>
                        </div>
                    </div>

                    <div style={{ height: 36, width: 132, border: '1px solid #E9E9EB', borderRadius: '6px', display: 'flex', alignItems: 'center', paddingLeft: 8 }} >
                        <div style={{ height: 16, width: 16, marginBottom: 4 }}><img src={calenderIcon.src} alt='' /></div>
                        <div style={{ flex: 1, marginTop: 6, marginLeft: 10 }}>
                            <div style={{ fontSize: 10, color: '#44475B' }}>To</div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    open={openEndDatePicker}
                                    onOpen={() => setOpenEndDatePicker(true)}
                                    onClose={() => setOpenEndDatePicker(false)}
                                    slotProps={{
                                        textField: {
                                            placeholder: formatDate(endDate),
                                            onClick: () => setOpenEndDatePicker(!openEndDatePicker),
                                            fullWidth: true,
                                            InputProps: {
                                                endAdornment: null,
                                            },
                                        }
                                    }}
                                    sx={{

                                        '.MuiInputBase-input': {
                                            padding: '0 !important',
                                            fontSize: '12px !important',
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
                                    }}
                                    value={dayjs(endDate)}
                                    onChange={(newDate) => { handleEndDateChange(newDate) }}
                                    disableFuture={true}
                                    disabled={disableStartDate}
                                />
                            </LocalizationProvider>
                        </div>
                    </div>
                </div>

                <div className='status_container' style={{marginRight: 40 }}>
                    <FormControl sx={{  margin: 0, padding: 0 }}>
                        <InputLabel id="demo-multiple-checkbox-label" sx={{
                            padding: 0, fontSize: 14, marginTop: '-8px',
                        }}>Status</InputLabel>
                        <Select

                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            value={status}
                            multiple
                            onChange={handleChange}
                            input={<OutlinedInput
                                sx={{
                                    width: '170px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid #E9E9EB'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid #E9E9EB'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid #E9E9EB'
                                    },
                                }}
                            />}
                            renderValue={(selected: any) => selected.join(', ')}
                            // renderValue={(selected) => selected}
                            MenuProps={MenuProps}
                        >
                            {names.map((name) => (
                                <MenuItem key={name} value={name} sx={{ padding: 0 }} >
                                    <Checkbox checked={status.indexOf(name) > -1} sx={{ paddingLeft: '8px', padding: '4px', '& .MuiSvgIcon-root': { fontSize: 15 } }} />
                                    <ListItemText primary={name} primaryTypographyProps={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>


                <div className='status_container' style={{ marginRight:30 }}>
                    <FormControl sx={{
                        width: '180px', margin: 0, padding: 0,
                        '.mui-kk1bwy-MuiButtonBase-root-MuiMenuItem-root': {
                            padding: 0,
                        },
                    }}>
                        <InputLabel id="demo-multiple-checkbox-label" sx={{
                            padding: 0, fontSize: 14, marginTop: '-8px',
                        }}>Rake Type</InputLabel>
                        <Select
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            value={rakeType}
                            multiple
                            className='status_select'
                            onChange={handleChangeRakeType}
                            input={<OutlinedInput
                                sx={{
                                    width: '180px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid #E9E9EB'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid #E9E9EB'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid #E9E9EB'
                                    },
                                }}
                            />}
                            renderValue={(selected: any) => selected.join(', ')}
                            // renderValue={(selected) => selected}
                            MenuProps={MenuProps}
                        >
                            {rakeTypes.map((name) => (
                                <MenuItem key={name} value={name} sx={{ padding: 0 }} >
                                    <Checkbox checked={rakeType.indexOf(name) > -1} sx={{ paddingLeft: '8px', padding: '4px', '& .MuiSvgIcon-root': { fontSize: 15 } }} />
                                    <ListItemText primary={name} primaryTypographyProps={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                <div>
                    <motion.div
                        className="box"
                        whileHover={{ scale: 0.95 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        onClick={() => window.open('/shipment_map_view', '_blank')}
                    >
                        <Image src={MapViewIcon} alt="map view" width={16} height={16} />
                        <span className="map-view-btn-header">Map View</span>
                    </motion.div>
                </div>

                <div style={{backgroundColor:'yellow'}}>
                    <div className="filter-container" onClick={() => setOpenFilterModal(true)}>
                        {/* <FilterAltIcon className="filter-icon" /> */}
                        <img src={filter_icon.src} alt='' />
                    </div>
                </div>

            </div>

            {openFilterModal ?
                <div>
                    <div className='modal-wrapper'>
                        <div className='modal-container'>
                            <div className='modal-header'><span className='modal-filter-header'>Advanced Search</span><Image src={closeIcon} alt='' className='close-icon' onClick={() => setOpenFilterModal(false)} /></div>
                            <div className='filters-wrapper'>
                                <input placeholder='e-Demand Number' onChange={(e) => setFilterEDemand(e.target.value)} value={filterEDemand} />
                                <input placeholder='Destination' onChange={(e) => setFilterDestination(e.target.value)} value={filterDestination} />
                                <input placeholder='Material' onChange={(e) => setFilterMaterial(e.target.value)} value={filterMaterial} />
                            </div>
                            <div className='filter-modal-footer'>
                                <button onClick={() => clearFilter()}>
                                    Clear Filter
                                </button>
                                <button onClick={handleSubmit}>
                                    Search
                                </button>

                            </div>
                        </div>
                    </div>

                    <div className='overlay-container' onClick={() => setOpenFilterModal(false)} />
                </div> : <></>
            }

        </div>
    );
}

export default Filters;