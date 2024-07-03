'use client'

import './filters.css'
import * as React from 'react';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { useState, useEffect } from 'react';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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


function Filters({ onToFromChange, onChangeStatus, reload, shipmentsPayloadSetter }: any) {



    const MenuProps = {
        PaperProps: {
            style: {
                width: 128,
                marginTop: '3px',
            },
        },
    };

    const names = [
       
        'In Transit',
        'Delivered',
        'In Plant'
    ];



    const [status, setStatus] = useState(['In Transit','Delivered',]);
    const [openStartDatePicker,setOpenStartDatePicker] = useState(false);
    const [openEndDatePicker,setOpenEndDatePicker] = useState(false);

    // const handleChange = (event: SelectChangeEvent<string>) => {
    //     onChangeStatus(event.target.value as string)
    //     setStatus(event.target.value as string);
    //     // setStatusForShipment(event.target.value as string)
    // };

    const handleChange = (event : any) => {
        const {
          target: { value },
        } = event;
        setStatus(
          typeof value === 'string' ? value.split(',') : value,
        );
        onChangeStatus(typeof value === 'string' ? value.split(',') : value,)
      };

    const today = new Date();
    const twentyDaysBefore = new Date();
    twentyDaysBefore.setDate(today.getDate() - 20);

    const [startDate, setStartDate] = useState(twentyDaysBefore);
    const [endDate, setEndDate] = useState(today);
    const [error, setError] = useState('');
    const [openFilterModal,setOpenFilterModal] = useState(false)
    const [filterEDemand, setFilterEDemand] = useState('');
    const [filterDestination, setFilterDestination] = useState('');

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
    };

    const handleEndDateChange = (e: any) => {
        const newEndDate = e.$d;
        if (new Date(startDate) > new Date(newEndDate)) {
            setError("Start date cannot be after end date");
        } else {
            setError('');
        }
        setEndDate(newEndDate);
    };

    function clearFilter() {
        setFilterDestination('')
        setFilterEDemand('')
    }

    function shouldDisableStartDate(date: Date) {
        return date > new Date() || date > endDate
    }

    function shouldDisableEndDate(date: Date) {
        
        return date > new Date() ||  new Date(new Date(date).setHours(23, 59, 59, 999)) < startDate
    }

    function handleSubmit() {
      shipmentsPayloadSetter((prevState: any) => {
        const newState = { ...prevState };
        if (!filterEDemand) delete newState["eDemand"];
        else newState.eDemand = filterEDemand;
        if (!filterDestination) delete newState["destination"];
        else newState.destination = filterDestination;

        return newState;
      });
      clearFilter();
      setOpenFilterModal(false);
    }

    useEffect(() => {
        if (!reload)
        if (startDate && endDate && !error ) {
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

            if(startDate === twentyDaysBefore && endDate === today){
                onToFromChange(today, twentyDaysBefore);
            }
            
        }
    }, [reload]);

    function check(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        console.log(e)
    }



    return (
    <div>
        <div style={{ display: 'flex', gap: 20, overflowX: 'auto', position: 'relative' , overflowY:'visible'}} >

            <div style={{ display: 'flex', gap: 20, }}>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker']}
                        sx={{
                            padding: 0,
                            height: 'auto',
                            overflow: 'hidden',
                        }}
                    >
                        <DatePicker
                            format="DD/MM/YYYY"
                            open={openStartDatePicker}
                            onOpen={() => setOpenStartDatePicker(true)}
                            onClose={() => setOpenStartDatePicker(false)}
                            slotProps={{ textField: { placeholder: formatDate(startDate),onClick: ()=> setOpenStartDatePicker(!openStartDatePicker) },  }}
                            value={dayjs(startDate)}
                            onChange={(newDate) => { handleStartDateChange(newDate) }}
                            shouldDisableDate={shouldDisableStartDate}
                            sx={{
                                '& .MuiInputBase-input::placeholder': {
                                    fontSize: '14px',
                                },
                                '& .MuiInputBase-input': {
                                    fontSize: '14px',
                                    height: '36px',
                                    padding: '8px 14px',
                                    boxSizing: 'border-box',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#E9E9EB',
                                    },
                                },
                            }}
                        />
                    </DemoContainer>
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker']}
                        sx={{
                            padding: 0,
                            height: 'auto',
                            overflow: 'hidden',
                        }}
                    >
                        <DatePicker
                            open={openEndDatePicker}
                            onOpen={() => setOpenEndDatePicker(true)}
                            onClose={() => setOpenEndDatePicker(false)}
                            slotProps={{ textField: { placeholder: formatDate(endDate),onClick: ()=> setOpenEndDatePicker(!openEndDatePicker) } }}
                            format="DD/MM/YYYY"
                            onChange={(newDate) => { handleEndDateChange(newDate) }}
                            value={dayjs(endDate)}
                            shouldDisableDate={shouldDisableEndDate}
                            sx={{
                                '& .MuiInputBase-input::placeholder': {
                                    fontSize: '14px',
                                },
                                '& .MuiInputBase-input': {
                                    fontSize: '14px',
                                    height: '36px',
                                    padding: '8px 14px',
                                    boxSizing: 'border-box',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#E9E9EB',
                                    },
                                },
                            }}
                        />
                    </DemoContainer>
                </LocalizationProvider>

            </div>
            {error && <div className='error'>{error}</div>}

            <div className='status_container' style={{width:'170px'}}>
                <FormControl sx={{
                    width:'170px', margin: 0, padding: 0,
                    '.mui-kk1bwy-MuiButtonBase-root-MuiMenuItem-root': {
                        padding: 0,
                    },
                }}>
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
                        renderValue={(selected : any) => selected.join(', ')}
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
            
            <motion.div
                className="box"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={() => window.open('/shipment_map_view', '_blank')}
            >
                <Image src={MapViewIcon} alt="map view" width={16} height={16}/>
                <span className="map-view-btn-header">Map View</span>
            </motion.div>


            {/* <div>
                <div className="upload-container">
                    <CloudUploadIcon className="upload-icon" />
                    <div className="upload-text">Upload File</div>
                </div>
            </div> */}

            <div>
                <div className="filter-container" onClick={()=>setOpenFilterModal(true)}>
                    <FilterAltIcon className="filter-icon" />
                </div>
            </div>

            {/* <input type='date' placeholder='Dec 23, 3456' /> */}
        </div>
        {

        openFilterModal ?    
        <div>
         <div className='modal-wrapper'>
          <div className='modal-container'>
            <div className='modal-header'><span className='modal-filter-header'>Advanced Search</span><Image src={closeIcon} alt='' className='close-icon' onClick={()=>setOpenFilterModal(false)}/></div>
            <div className='filters-wrapper'>
            <input placeholder='e-Demand Number' onChange={(e)=>setFilterEDemand(e.target.value)} value={filterEDemand}/>
            <input placeholder='Destination' onChange={(e)=>setFilterDestination(e.target.value)} value={filterDestination}/>
            </div>
            <div className='filter-modal-footer'>
                <button onClick={()=>clearFilter()}>
                Clear Filter
                </button>
                <button onClick={handleSubmit}>
                  Search
                </button>

            </div>
           </div>
        </div>

        <div className='overlay-container'/>
        </div> : <></>
}
    
    </div>
    );
}

export default Filters;