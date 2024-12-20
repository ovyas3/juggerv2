"use client"

import React, { useState, useEffect } from "react";
import './RakeFreeTimeSetting.css';
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

interface NoOfWagons {
    min: string;
    max: string;
}

interface RakeFreeTimeSettingDatas {
    commodity: string;
    no_of_wagons: NoOfWagons;
    free_time: string;
}

const RakeFreeTimeSetting = () => {
    const today: any = new Date();
    const oneMonthAgo: any = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const defaultMinimumDate = new Date('2022-09-13');
    
    const [startDate, setStartDate] = useState<any>(oneMonthAgo);
    const [endDate, setEndDate] = useState<any>(today);
    const [rakeFreeTimeSettingDatas, setRakeFreeTimeSettingDatas] = useState<RakeFreeTimeSettingDatas[]>([
        {
            commodity: '',
            no_of_wagons: {
                min: '',
                max: ''
            },
            free_time: '' 
        }
    ]);
    const [commodityTypes, setCommodityTypes] = useState<string[]>(['Coal', 'Iron', 'Steel']);

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
        console.log(rakeFreeTimeSettingDatas);
    }

    return (
        <div className="rake-free-time-setting">
            <div className="rake-free-time-setting-container">
                <div className="rake-free-time-setting-content">
                    <div className="rake-free-time-setting-content-header">
                        <p className="rake-free-time-setting-content-header-title">Rake Free Time</p>
                    </div>
                    <div className="rake-free-time-setting-content-body">
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
                                className="rake-free-time-setting-table-container"
                            >
                                <Table aria-label="simple table" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell rowSpan={2} className="table-columns" align="center" style={{
                                                borderRight: '1px solid #DFE3EB'
                                            }}>Commodity</TableCell>
                                            <TableCell colSpan={2} className="table-columns" align="center" style={{
                                                borderRight: '1px solid #DFE3EB'
                                            }}>No. of Wagons</TableCell>
                                            <TableCell rowSpan={2} className="table-columns" align="center" style={{
                                                borderRight: '1px solid #DFE3EB'
                                            }}>Free Time</TableCell>
                                            <TableCell rowSpan={2} className="table-columns" align="center">Actions</TableCell>
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
                                        {rakeFreeTimeSettingDatas.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No Data Available
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            rakeFreeTimeSettingDatas.map((data, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="table-rows" style={{
                                                        borderRight: '1px solid #DFE3EB'
                                                    }}>
                                                        <FormControl>
                                                            <Select
                                                                id="demo-customized-select"
                                                                value={data.commodity}
                                                                label=""
                                                                onChange={(e) => {
                                                                    const newData = [...rakeFreeTimeSettingDatas];
                                                                    newData[index].commodity = e.target.value;
                                                                    setRakeFreeTimeSettingDatas(newData);
                                                                }}
                                                            >
                                                                {commodityTypes.map((commodity, index) => (
                                                                    <MenuItem key={index} value={commodity}>
                                                                        {commodity}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </TableCell>
                                                    <TableCell className="table-rows" style={{
                                                        borderRight: '1px solid #DFE3EB'
                                                    }}>
                                                        <input
                                                            type="number"
                                                            className="table-rows-input"
                                                            value={data.no_of_wagons.min}
                                                            onChange={(e) => {
                                                                const newData = [...rakeFreeTimeSettingDatas];
                                                                newData[index].no_of_wagons.min = e.target.value;
                                                                setRakeFreeTimeSettingDatas(newData);
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="table-rows" style={{
                                                        borderRight: '1px solid #DFE3EB'
                                                    }}>
                                                        <input
                                                            type="number"
                                                            className="table-rows-input"
                                                            value={data.no_of_wagons.max}
                                                            onChange={(e) => {
                                                                const newData = [...rakeFreeTimeSettingDatas];
                                                                newData[index].no_of_wagons.max = e.target.value;
                                                                setRakeFreeTimeSettingDatas(newData);
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="table-rows" style={{
                                                        borderRight: '1px solid #DFE3EB'
                                                    }}>
                                                        <input
                                                            type="number"
                                                            className="table-rows-input"
                                                            value={data.free_time}
                                                            onChange={(e) => {
                                                                const newData = [...rakeFreeTimeSettingDatas];
                                                                newData[index].free_time = e.target.value;
                                                                setRakeFreeTimeSettingDatas(newData);
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="table-rows" align="center">
                                                        <span
                                                            onClick={() => {
                                                                const newData = [...rakeFreeTimeSettingDatas];
                                                                if (index > 0) newData.splice(index, 1); // Remove row if not the first index
                                                                setRakeFreeTimeSettingDatas(newData);
                                                            }}
                                                            style={{ cursor: index > 0 ? 'pointer' : 'not-allowed', color: index > 0 ? 'red' : 'gray' }}
                                                        >
                                                            {index > 0 ? (
                                                                <Image src={MinusIcon} alt="minus" />
                                                            ) : ''}
                                                        </span>
                                                        <span
                                                            onClick={() => {
                                                                const newData = [...rakeFreeTimeSettingDatas, { commodity: '', no_of_wagons: { min: '', max: '' }, free_time: '' }];
                                                                setRakeFreeTimeSettingDatas(newData);
                                                            }}
                                                            style={{ cursor: 'pointer', color: 'green', marginLeft: '10px' }}
                                                        >
                                                            <Image src={PlusIcon} alt="plus" />
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RakeFreeTimeSetting;