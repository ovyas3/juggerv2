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



function Filters({ onToFromChange, onChangeStatus }: any) {



    const MenuProps = {
        PaperProps: {
            style: {
                width: 128,
                marginTop: '3px',
            },
        },
    };

    const names = [
        'All',
        'In Transit',
        'Delivered',
        'In Plant'
    ];



    const [status, setStatus] = React.useState<string>('All');

    const handleChange = (event: SelectChangeEvent<string>) => {
        onChangeStatus(event.target.value as string)
        setStatus(event.target.value as string);
        // setStatusForShipment(event.target.value as string)
    };
    const today = new Date();
    const twentyDaysBefore = new Date();
    twentyDaysBefore.setDate(today.getDate() - 20);

    const [startDate, setStartDate] = useState(twentyDaysBefore);
    const [endDate, setEndDate] = useState(today);
    const [error, setError] = useState('');


    const formatDate = (date: any) => {

        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    const handleStartDateChange = (e: any) => {
        const newStartDate = e.$d;
        if (new Date(newStartDate) > new Date(endDate)) {
            setError('Start date cannot be after end date');
        } else {
            setError('');
        }
        setStartDate(newStartDate);
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

    useEffect(() => {
        if (startDate && endDate && !error) {
            onToFromChange(endDate, startDate);
        }
    }, [startDate, endDate, error]);



    return (
        <div style={{ display: 'flex', gap: 20, overflowX: 'auto', position: 'relative', overflowY: 'visible' }} >

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
                            slotProps={{ textField: { placeholder: formatDate(startDate) } }}

                            onChange={(newDate) => { handleStartDateChange(newDate) }}
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
                            slotProps={{ textField: { placeholder: formatDate(endDate) } }}
                            format="DD/MM/YYYY"
                            onChange={(newDate) => { handleEndDateChange(newDate) }}
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

            <div className='status_container'>
                <FormControl sx={{
                    width: 128, margin: 0, padding: 0,
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
                        onChange={handleChange}
                        input={<OutlinedInput
                            sx={{
                                width: '128px',
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
                        // renderValue={(selected) => selected.join(', ')}
                        renderValue={(selected) => selected}
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

            {/* <div>
                <div className="upload-container">
                    <CloudUploadIcon className="upload-icon" />
                    <div className="upload-text">Upload File</div>
                </div>
            </div> */}

            {/* <div>
                <div className="filter-container">
                    <FilterAltIcon className="filter-icon" />
                </div>
            </div> */}

            {/* <input type='date' placeholder='Dec 23, 3456' /> */}
        </div>
    );
}

export default Filters;