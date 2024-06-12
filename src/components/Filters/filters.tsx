'use client'

import './filters.css'
import * as React from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


function Filters() {

    return (
        <div style={{ display: 'flex', gap: 20,overflowX:'auto' }} >
            <div>
                <div className="date-range-container">
                    <DateRangeIcon className="date-icon" />
                    <div className="date-text">Dec 5, 2023 - Dec 5, 2024</div>
                </div>
            </div>

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