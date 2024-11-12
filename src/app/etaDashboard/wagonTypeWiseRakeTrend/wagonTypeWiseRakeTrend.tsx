'use client'

import React, { useRef, useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, IconButton } from '@mui/material'
import ScreenShotIcon from '@/assets/screenshot_icon.svg';
import { Tooltip as RechartsTooltip } from "recharts";
import { toPng } from 'html-to-image';
import CustomDatePicker from '@/components/UI/CustomDatePicker/CustomDatePicker';
import { useTranslations } from 'next-intl'
import service from '@/utils/timeService'
import Image from 'next/image'
import { httpsGet } from '@/utils/Communication';
import { useRouter } from 'next/navigation';
import { ThreeCircles } from "react-loader-spinner";
import * as XLSX from 'xlsx';
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import { styled } from '@mui/system';
import DownloadIcon from '@mui/icons-material/Download';

// Define types
type WagonTypeData = {
  wagonType: string
  departureCount: number
}

type MonthData = {
  _id: string
  wagonTypeData: WagonTypeData[]
}

type ResponseData = {
  data: MonthData[]
  msg: string
  statusCode: number
}

interface StyledTooltipProps extends TooltipProps {
  className?: string;
}

const CustomDownloadTooltip = styled(({ className, ...props }: StyledTooltipProps) => (
  <Tooltip 
    {...props} 
    classes={{ popper: className }} 
    PopperProps={{
      popperOptions: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [14, -10], 
            },
          },
        ],
      },
    }}
  />
))({
  '& .MuiTooltip-tooltip': {
    backgroundColor: '#000',
    color: '#fff',
    width: '100px',
    height: '24px',
    boxShadow: '0px 0px 2px rgba(0,0,0,0.1)',
    fontSize: '8px',
    fontFamily: '"Inter", sans-serif',
  },
  '& .MuiTooltip-arrow': {
    color: '#000',
  },
});

const WagonDataVisualization: React.FC = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  const today: any = new Date();
  const oneMonthAgo: any = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [loading, setLoading] = useState(false);
  const text = useTranslations("ETADASHBOARD");
  const router = useRouter();

  const [startDate, setStartDate] = useState<any>(oneMonthAgo);
  const [endDate, setEndDate] = useState<any>(today);

  const [chartData, setChartData] = useState<any>([]);
  const [allWagonTypes, setAllWagonTypes] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [months, setMonths] = useState<any>([]);

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    handleDateChange(date, 'start');
  }

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    handleDateChange(date, 'end');
  }
  
  const handleDateChange = (date: any, type: 'start' | 'end') => {
    if (date) {
      const epochTime = service.millies(date);
      const newStartDate: any = service.millies(startDate);
      const newEndDate: any = service.millies(endDate);
      if (type === 'start') {
        setStartDate(date);
        getWagonTypeWiseRakeDepartureTrend(epochTime, newEndDate || 0);

      } else {
        setEndDate(date);
        getWagonTypeWiseRakeDepartureTrend(newStartDate || 0, epochTime);
      }
    } else {
      if (type === 'start') {
        setStartDate(null);
      } else {
        setEndDate(null);
      }
    }
  };

  const getWagonTypeWiseRakeDepartureTrend = async (from: number, to: number) => {
    try {
      setLoading(true);
      const response = await httpsGet(`dashboard/wagonType?from=${from}&to=${to}`, 0, router);
      if (response.statusCode === 200) {
        setLoading(false);
        const data = response?.data;
        const filteredData = data.filter((monthData: MonthData) => monthData._id !== null);
  
        const chartData = filteredData.map((monthData: any) => {
          const monthObj: { [key: string]: string | number } = { month: monthData._id };
          monthData.wagonTypeData.forEach((wagonData: any) => {
            monthObj[wagonData.wagonType] = wagonData.departureCount;
          });
          return monthObj;
        });
  
        const allWagonTypes = Array.from(new Set(filteredData.flatMap((monthData: any) => 
          monthData.wagonTypeData.map((wagonData: any) => wagonData.wagonType)
        )));
  
        const tableData = allWagonTypes.map((wagonType: any) => {
          const row: { [key: string]: string | number } = { wagonType };
          filteredData.forEach((monthData: any) => {
            const wagonData = monthData.wagonTypeData.find((w: any) => w.wagonType === wagonType);
            row[monthData._id] = wagonData ? wagonData.departureCount : 0;
          });
          return row;
        });

        const months = filteredData.map((monthData: any) => monthData._id);
  
        setChartData(chartData);
        setAllWagonTypes(allWagonTypes);
        setTableData(tableData);
        setMonths(months);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const startDate = service.millies(oneMonthAgo);
    const endDate = service.millies(today);
    getWagonTypeWiseRakeDepartureTrend(startDate, endDate);
  }, [])

  const handleScreenshot = async () => {
    if (componentRef.current) {
      try {
        await document.fonts.load('12px "Plus Jakarta Sans"');
        
        const filter = (node: HTMLElement) => {
          if (node.tagName === 'LINK' && node.getAttribute('href')?.includes('fonts.googleapis.com')) {
            return false;
          }
          if (node.tagName === 'STYLE' && node.innerHTML.includes('@import url("https://fonts.googleapis.com')) {
            return false;
          }
          return true;
        };

        const dataUrl = await toPng(componentRef.current, {
          quality: 1,
          style: {
            backgroundColor: '#ffffff', 
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          },
          filter,
        });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'wagon-type-wise-rake-departure-trend.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error taking screenshot:', error);
      }
    }
  };

  const formatMonth = (value: string) => {
    const date = new Date(value);
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const year = date.getFullYear() % 100;
    return `${month} ${year}`;
  };

  const downloadExcel = () => {
    const worksheetData = [
      ['Wagon Type', ...months.map((month: any) => formatMonth(month))],
      ...tableData.map((row: any) => [
        row.wagonType,
        ...months.map((month: any) => row[month])
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Wagon Type Wise Rake');
    XLSX.writeFile(workbook, 'wagon-type-wise-rake-departure-trend.xlsx');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#20114d"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

  return (
    <div ref={componentRef}>
      <Box sx={{ maxWidth: '100%', margin: 'auto', padding: 2 }}>
        <Box className="wagon-type-wise-rake-trend-header"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              fontSize: '1.25rem',
              color: '#2E2D32',
              marginBottom: '20px',
              letterSpacing: '1.54px',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              textTransform: 'uppercase',
            }}>
            Wagon Type Wise Rake Departure Trend
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2
          }}>
            <CustomDatePicker
              label="From"
              value={startDate}
              onChange={handleStartDateChange}
              maxDate={endDate}
              defaultDate={oneMonthAgo}
              maxSelectableDate={today}
            />
            <CustomDatePicker
              label="To"
              value={endDate}
              onChange={handleEndDateChange}
              minDate={startDate}
              defaultDate={today}
              minSelectableDate={startDate}
            />
            <IconButton onClick={handleScreenshot} sx={{
              padding: 0
            }}>
              <Image src={ScreenShotIcon} alt='Screenshot' />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ height: 500, marginBottom: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={formatMonth} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {allWagonTypes.map((wagonType: any, index: number) => (
                <Bar 
                  key={wagonType} 
                  dataKey={wagonType} 
                  name={wagonType} 
                  fill={`hsl(${index * 25}, 70%, 50%)`} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="wagon type data table">
            <TableHead>
              <TableRow>
                <TableCell>Wagon Type</TableCell>
                {months.map((month: string) => (
                  <TableCell key={month} align="right">{formatMonth(month)}</TableCell>
                ))}
                <TableCell style={{
                  width: '30px',
                }}>
                <CustomDownloadTooltip 
                  arrow 
                  title={
                    <div 
                      style={{
                        display: 'flex', 
                        width: '100%',
                        flexDirection: 'row', 
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                        paddingTop: '2px',
                        gap: '2px'
                    }}>
                      {text('downloadExcel')}
                    </div>}>
                      <DownloadIcon style={{ 
                        color: '#2a1a6e', 
                        cursor: 'pointer',
                      }} onClick={downloadExcel}
                      />
                </CustomDownloadTooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row: any) => (
                <TableRow key={row.wagonType as string}>
                  <TableCell component="th" scope="row">
                    {row.wagonType}
                  </TableCell>
                  {months.map((month: any) => (
                    <TableCell key={month} align="right">{row[month]}</TableCell>
                  ))}
                  <TableCell>
                    <span style={{ visibility: 'hidden' }}>{text('hidden')}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  )
}

export default WagonDataVisualization