"use client"

import React, { useState, useEffect } from "react";
import './RakeDCCalculator.css';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import PlusIcon from "@/assets/plus.svg";
import MinusIcon from "@/assets/minus.svg";
import Image from "next/image";
import CustomDatePicker from '@/components/UI/CustomDatePicker/CustomDatePicker';
import { Box, Typography} from '@mui/material';
import service from '@/utils/timeService';

interface TimeSlab {
    min: string;
    max: string;
}

interface RakeDCCalculator {
    timeSlabs: TimeSlab;
    costPerHour: string;
}

const RakeDCCalculatorData: RakeDCCalculator[] = [
    {
        timeSlabs: {
            min: '0',
            max: '6'
        },
        costPerHour: ''
    },
    {
        timeSlabs: {
            min: '6',
            max: '12'
        },
        costPerHour: ''
    },
    {
        timeSlabs: {
            min: '12',
            max: '24'
        },
        costPerHour: ''
    },
    {
        timeSlabs: {
            min: '24',
            max: '48'
        },
        costPerHour: ''
    },
    {
        timeSlabs: {
            min: '48',
            max: '72'
        },
        costPerHour: '' 
    },
    {
        timeSlabs: {
            min: '72',
            max: '∞'
        },
        costPerHour: ''
    }
];

const RakeDCCalculator = () => {
    const today: any = new Date();
    const oneMonthAgo: any = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const defaultMinimumDate = new Date('2022-09-13');
    
    const [startDate, setStartDate] = useState<any>(oneMonthAgo);
    const [endDate, setEndDate] = useState<any>(today);
    const [rakeDCCalculatorDatas, setRakeDCCalculatorDatas] = useState<RakeDCCalculator[]>(RakeDCCalculatorData);

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
        handleDateChange(date, 'start');
    };
    
    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
        handleDateChange(date, 'end');
    };

    const handleDateChange = (date: any, type: 'start' | 'end') => {
        if (date) {
          const epochTime = service.millies(date);
          const newStartDate: any = service.millies(startDate);
          const newEndDate: any = service.millies(endDate);
          if (type === 'start') {
            setStartDate(date);
            if (newEndDate >= epochTime) {
                getRakeFreeTimeSetting(epochTime, newEndDate);
            }
          } else {
            setEndDate(date);
            if (newStartDate <= epochTime) {
                getRakeFreeTimeSetting(newStartDate, epochTime);
            }
          }
        } else {
          if (type === 'start') {
            setStartDate(null);
          } else {
            setEndDate(null);
          }
        }
    };

    const getRakeFreeTimeSetting = (startDate: number, endDate: number) => {
        console.log(startDate, endDate);
    }

    const postFreeTimeSetting = () => {
        const epochStartDate: any = service.millies(startDate);
        const epochEndDate: any = service.millies(endDate);
        console.log(rakeDCCalculatorDatas, "epochStartDate", epochStartDate, "epochEndDate", epochEndDate);
    }

    return (
        <div className="rake-dc-calculator">
            <div className="rake-dc-calculator-container">
                <div className="rake-dc-calculator-content">
                    <div className="rake-dc-calculator-content-header">
                        <p className="rake-dc-calculator-content-header-title">Rake DC Calculator</p>
                    </div>
                    <div className="rake-dc-calculator-content-body">
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: 2,
                            width: '30%',
                            height: '42px',
                            marginBottom: '24px',
                        }}>
                            <CustomDatePicker
                                label="From"
                                value={startDate}
                                onChange={handleStartDateChange}
                                maxDate={endDate}
                                minDate={defaultMinimumDate}
                                minSelectableDate={defaultMinimumDate}
                                defaultDate={oneMonthAgo}
                            />
                            <CustomDatePicker
                                label="To"
                                value={endDate}
                                onChange={handleEndDateChange}
                                minDate={startDate}
                                defaultDate={today}
                                minSelectableDate={startDate}
                            />
                        </Box>
                        <Paper sx={{
                            border: 'none !important',
                            overflowX: 'auto !important',
                            boxShadow: 'none !important'
                        }}>
                            <TableContainer
                                component={Paper}
                                className="rake-dc-calculator-table-container"
                            >
                                <Table aria-label="simple table" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={2} className="table-columns" align="center" style={{
                                                borderRight: '1px solid #DFE3EB'
                                            }}>
                                                Time Slab
                                            </TableCell>
                                            <TableCell rowSpan={2} className="table-columns" align="center" style={{
                                                width: '250px'
                                            }}>
                                                Cost Per Hour
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="table-columns" align="center" style={{
                                                borderRight: '1px solid #DFE3EB'
                                            }}>Min</TableCell>
                                            <TableCell className="table-columns" align="center" style={{
                                                borderRight: '1px solid #DFE3EB'
                                            }}>Max</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rakeDCCalculatorDatas.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No Data Available
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            rakeDCCalculatorDatas.map((data, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="table-rows" style={{
                                                        borderRight: '1px solid #DFE3EB'
                                                    }}>
                                                        {data?.timeSlabs?.min || ''}
                                                    </TableCell>
                                                    <TableCell className="table-rows" style={{
                                                        borderRight: '1px solid #DFE3EB'
                                                    }}>
                                                        {data?.timeSlabs?.max || ''}
                                                    </TableCell>
                                                    <TableCell className="table-rows" style={{
                                                        borderRight: '1px solid #DFE3EB'
                                                    }}>
                                                        <input
                                                            type="number"
                                                            className="table-rows-input"
                                                            value={data?.costPerHour || ''}
                                                            onChange={(e) => {
                                                                const updatedData = [...rakeDCCalculatorDatas];
                                                                updatedData[index].costPerHour = e.target.value;
                                                                setRakeDCCalculatorDatas(updatedData);
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                        <div className="rake-dc-calculator-content-footer">
                            <button
                                className="rake-dc-calculator-content-footer-button"
                                onClick={postFreeTimeSetting}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RakeDCCalculator;