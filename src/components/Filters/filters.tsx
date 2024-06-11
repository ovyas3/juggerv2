'use client'

import './filters.css'
import * as React from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
// import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import Calendar from '@mui/icons-material/Event';
import { useState, useEffect } from 'react';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';




function Filters({onToFromChange} : any) {

   

    const today = new Date();
    const twentyDaysBefore = new Date();
    twentyDaysBefore.setDate(today.getDate() - 20);

    const [startDate, setStartDate] = useState(twentyDaysBefore);
    const [endDate, setEndDate] = useState(today);
    const [error, setError] = useState('');


    const formatDate = (date :any) => {
        
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
            // Add your form submission logic here
            onToFromChange(endDate, startDate);
            // console.log("Form submitted with Start Date:", startDate, "End Date:", endDate);
        }
    }, [startDate, endDate, error]);

    return (
        <div style={{ display: 'flex', gap: 20, overflowX: 'auto', position:'relative' }} >

            <div style={{display:'flex', gap:20,  }} >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker']}
                        sx={{ padding: 0, }}
                    >
                        <DatePicker
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
                        sx={{ padding: 0, }}
                    >
                        <DatePicker
                            slotProps={{ textField: { placeholder: formatDate(endDate) } }}
                         
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

            <div >
                <div className="custom-container">
                    <div className="custom-text">Status</div>
                    <ArrowDropDownIcon className="custom-icon" />
                </div>
            </div>

            <div>
                <div className="upload-container">
                    <CloudUploadIcon className="upload-icon" />
                    <div className="upload-text">Upload File</div>
                </div>
            </div>

            <div>
                <div className="filter-container">
                    <FilterAltIcon className="filter-icon" />
                </div>
            </div>
        </div>
    );
}

export default Filters;