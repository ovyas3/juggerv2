'use client'

import React, { useEffect, useState, useRef } from 'react';
import { Box, Card, Container, Typography, useTheme, InputAdornment, IconButton } from '@mui/material';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,Legend, ResponsiveContainer } from 'recharts';
import { httpsGet } from '@/utils/Communication';
import { useRouter } from 'next/navigation';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import service from '@/utils/timeService';
import ScreenShotIcon from '@/assets/screenshot_icon.svg';
import { toPng } from 'html-to-image';
import Image from 'next/image';
import { ThreeCircles } from "react-loader-spinner";
import './realTimeGateTracking.css';
import { useTranslations } from "next-intl";


interface MetricCardProps {
  title: string
  value: number
  change: string
  changeLabel: string
  unit?: string
}

const MetricCard = ({ title, value, change, changeLabel, unit = 'minutes' }: MetricCardProps) => (
  <Card sx={{ p: 3, flex: 1 }}>
    <Typography color="text.secondary" variant="body2">
      {title}
    </Typography>
    <Typography variant="h3" sx={{ my: 1, fontWeight: 'bold', fontSize: '2rem' }}>
      {value}
    </Typography>
    <Typography color="text.secondary" variant="body2">
      {change}% {changeLabel}
    </Typography>
  </Card>
)

const dateTimePickerStyles = (disabled: boolean) => ({
  width: "80%",
  ".MuiInputBase-input": {
    padding: "6px 8px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px ",
    color: "#42454E",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "default",
  },
  ".MuiInputBase-root": {
    padding: 0,
    // border: "none",
    // "& fieldset": { border: "none" },
  },
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": {
      // border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "1px solid #90caf9",
    },
  },
  "& .MuiIconButton-root": {
    padding: 0,
    marginRight: '8px',
  },
})


interface CustomDateTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  open: boolean;
  onToggle: () => void;
  disabled: boolean;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({ 
  label, 
  value, 
  onChange, 
  open, 
  onToggle, 
  disabled 
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', marginRight: '16px' }}>
    <Typography variant="caption">{label}</Typography>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        open={open}
        onClose={onToggle}
        value={value ? dayjs(value) : null}
        sx={dateTimePickerStyles(disabled)}
        disabled={disabled}
        slotProps={{
          textField: {
            onClick: onToggle,
            fullWidth: true,
            placeholder: value ? undefined : "Pick a date",
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={onToggle} disabled={disabled}>
                    <CalendarTodayIcon sx={{fontSize: 18}} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          },
        }}
        onChange={(newDate) => {
          if (newDate) {
            onChange(newDate.toDate())
          } else {
            onChange(null)
          }
        }}
        format="DD-MM-YYYY"
      />
    </LocalizationProvider>
  </div>
);

export default function RealTimeGateTracking() {
  const theme = useTheme()
  const today: any = new Date();
  const oneMonthAgo: any = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const text = useTranslations("ETADASHBOARD");

  const [startDate, setStartDate] = useState<any>(oneMonthAgo);
  const [endDate, setEndDate] = useState<any>(today);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false)
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false)
  const router = useRouter();

  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [barChartData, setBarChartData] = useState<any[]>([]);

  const [yAxisDomainLine, setYAxisDomainLine] = useState([0, 3000]);
  const [yAxisTicksLine, setYAxisTicksLine] = useState([0, 500, 1000, 1500, 2000, 2500, 3000]);

  const [yAxisDomainBar, setYAxisDomainBar] = useState([0, 20]);
  const [yAxisTicksBar, setYAxisTicksBar] = useState([0, 5, 10, 15, 20]);

  const [dashboardMetrics, setDashboardMetrics] = useState<any>({});

  const componentRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);

  const handleDateChange = (date: any, type: 'start' | 'end') => {
    if (date) {
      const epochTime = service.millies(date);
      const newStartDate: any = service.millies(startDate);
      const newEndDate: any = service.millies(endDate);
      if (type === 'start') {
        setStartDate(date);
        getAverageTimePerRake(epochTime, newEndDate || 0);
        getDailyTotalRakesProcessed(epochTime, newEndDate || 0);

      } else {
        setEndDate(date);
        getAverageTimePerRake(newStartDate || 0, epochTime);
        getDailyTotalRakesProcessed(newStartDate || 0, epochTime);
      }
    } else {
      if (type === 'start') {
        setStartDate(null);
      } else {
        setEndDate(null);
      }
    }
  };

  const getDashboardMetrics = async () => {
    try {
      setLoading(true);
      const response = await httpsGet('dashboard/getDashboardMetrics', 0, router);
      if (response.statusCode === 200) {
        setLoading(false);
        const data = response.data;
        setDashboardMetrics(data);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }
  
  const getAverageTimePerRake = async (from: number, to: number) => {
    try {
      setLoading(true);
      const response = await httpsGet(`dashboard/averageTimePerRake?from=${from}&to=${to}`, 0, router);
      if (response.statusCode === 200) {
        const data = response.data;
        let chartData = data && data.map((item: any) => {
          const [hours, minutes] = item.avgTime.split(':').map(Number);
          const value = hours + minutes / 60;
          return {
            date: item.day,
            value,
          };
        });
        chartData = chartData.filter((item: any) => !isNaN(item.value));
        calculateLineChartDomainTicks(chartData);
        setLineChartData(chartData);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }
  const getDailyTotalRakesProcessed = async (from: number, to: number) => {
    try {
      setLoading(true);
      const response = await httpsGet(`dashboard/dailyTotalRakesProcessed?from=${from}&to=${to}`, 0, router);
      if (response.statusCode === 200) {
        const data = response.data;
        const chartData = data && data.map((item: any) => ({
          date: item.day,
          value: item.totalRakes,
          captive:item.captiveRakes,
          indianRakes:item?.iRakes,
        }));
        calculateBarChartDomainTicks(chartData);
        setBarChartData(chartData);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    const startDate = service.millies(oneMonthAgo);
    const endDate = service.millies(today);
    getAverageTimePerRake(startDate, endDate);
    getDailyTotalRakesProcessed(startDate, endDate);
    getDashboardMetrics();
  }, [])

  const calculateLineChartDomainTicks = (data: any[]) => {
    const values = data.map((item) => item.value);
    console.log(values);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const diff = max - min;
    const domain = [Math.floor(min - diff * 0.1), Math.ceil(max + diff * 0.1)];
  
    // Calculate step size for 5 ticks
    let stepSize = Math.ceil(max / 5);
  
    // Round step size to the nearest 10 or 20
    if (stepSize <= 10) {
      stepSize = Math.ceil(stepSize / 10) * 10;
    } else {
      stepSize = Math.ceil(stepSize / 20) * 20;
    }
  
    // Generate ticks based on the rounded step size
    const ticks = [];
    for (let i = 0; i <= Math.ceil(max / stepSize) * stepSize; i += stepSize) {
      ticks.push(i);
    }
  
    setYAxisDomainLine(domain);
    setYAxisTicksLine(ticks);
  }

  const calculateBarChartDomainTicks = (data: any[]) => {
    const values = data.map((item) => item.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const diff = max - min;
    const domain = [min - diff * 0.1, max + diff * 0.1];
    const ticks = [0, Math.ceil(max / 2), max];
    setYAxisDomainBar(domain);
    setYAxisTicksBar(ticks);
  }

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
            backgroundColor: '#ffffff', // Set background color using CSS
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          },
          filter,
        });

        // Create a download link and trigger the download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'real-time-gate-in-and-gate-out-tracking.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error taking screenshot:', error);
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }:any) => {
    if (!active || !payload || !payload.length) return null;
    const date = new Date(label);
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const year = date.getFullYear() % 100;
    const formattedDate = `${date.getDate()}-${month}-${year}`;

    const tooltipStyle: React.CSSProperties = {
      backgroundColor: '#E8F4FF',
      border: '1px solid #A9D3FF',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#333',
      maxWidth: '300px'
    };

    const colorIndicatorStyle: React.CSSProperties = {
      display: 'inline-block',
      width: '12px',
      height: '12px',
      marginRight: '8px',
      borderRadius: '2px'
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontWeight: 'bold',
      marginBottom: '8px'
    };

    const dataRowStyle: React.CSSProperties = {
      marginBottom: '4px'
    };

    return (
      <div>
        <div style={tooltipStyle}>
          <p style={sectionTitleStyle}>{formattedDate}</p>
          <div style={dataRowStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#CDC1FF' }}></span>
            {`Indian Rakes: ${payload[0]?.payload?.indianRakes}`}
          </div>
          <div style={dataRowStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#BFECFF' }}></span>
            {`Captive Rakes: ${payload[0]?.payload?.captive}`}
          </div>
          <div style={dataRowStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#E8F4FF' }}></span>
            {`Total Rakes: ${payload[0]?.payload?.value}`}
          </div>
        </div>
      </div>
    );
  };

  const formatTime = (decimalHours: number) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours} hrs ${minutes} mins`;
  };

  const CustomToolTipLineChart = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const date = new Date(label);
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const year = date.getFullYear() % 100;
    const formattedDate = `${date.getDate()}-${month}-${year}`;
  
    const tooltipStyle: React.CSSProperties = {
      backgroundColor: '#E8F4FF',
      border: '1px solid #A9D3FF',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#333',
      maxWidth: '300px'
    };
  
    const sectionTitleStyle: React.CSSProperties = {
      fontWeight: 'bold',
      marginBottom: '8px'
    };
  
    const dataRowStyle: React.CSSProperties = {
      marginBottom: '4px'
    };
  
    return (
      <div>
        <div style={tooltipStyle}>
          <p style={sectionTitleStyle}>{formattedDate}</p>
          <div style={dataRowStyle}>
            Average Time per Rake: <b>{formatTime(payload[0]?.value)}</b>
          </div>
        </div>
      </div>
    );
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
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#fff' }} ref={componentRef}>
      <Box 
        className="real-time-gate-tracking-header"
      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}
      >
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
          {text('PTDT_tracking')}
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <CustomDateTimePicker
            label="From"
            value={startDate}
            onChange={(date) => handleDateChange(date, 'start')}
            open={startDatePickerOpen}
            onToggle={() => setStartDatePickerOpen(!startDatePickerOpen)}
            disabled={false}
          />
          <CustomDateTimePicker
            label="To"
            value={endDate}
            onChange={(date) => handleDateChange(date, 'end')}
            open={endDatePickerOpen}
            onToggle={() => setEndDatePickerOpen(!endDatePickerOpen)}
            disabled={false}
          />
          <IconButton onClick={handleScreenshot} style={{
            paddingTop: '12px',
          }}>
            <Image src={ScreenShotIcon} alt='Screenshot' />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <MetricCard
          title="Daily Average Time (minutes)"
          value={dashboardMetrics.dailyAverageTime || 0} 
          change={dashboardMetrics.dailyTrend || 0}
          changeLabel="from yesterday"
        />
        <MetricCard
          title="Weekly Average Time (minutes)"
          value={dashboardMetrics.weeklyAverageTime || 0}
          change={dashboardMetrics.weeklyTrend || 0}
          changeLabel="from last week"
        />
        <MetricCard
          title="Monthly Total Rakes"
          value={dashboardMetrics.monthlyTotalRakes || 0}
          change={dashboardMetrics.monthlyTrend || 0}
          changeLabel="from last month"
          unit="rakes"
        />
      </Box>

      <Box 
        className="real-time-gate-tracking-body"
        sx={{ display: 'flex', gap: 2 }}
      >
        <Card sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6">Average Time per Rake</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            {text('trendOverSelectedDateRange')}
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                style={{ fontSize: '12px' }}
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  const day = date.getDate();
                  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
                  return `${day}/${month}`;
                }}
              />
              <YAxis 
                domain={yAxisDomainLine}
                ticks={yAxisTicksLine}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip content={<CustomToolTipLineChart />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                dot={{ fill: '#fff', stroke: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6">Daily Total Rakes Processed</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            {text('comparisonOvertheselectedDateRange')}
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={barChartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barGap={0}
              barSize={28}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                style={{ fontSize: '12px' }}
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  const day = date.getDate();
                  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
                  const year = date.getFullYear() % 100;
                  return `${day}/${month}`;
                }}
              />
              <YAxis 
                domain={yAxisDomainBar}
                ticks={yAxisTicksBar}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="square"
                iconSize={12}
                formatter={(value) => <span style={{ color: '#666', fontSize: 14, textAlign: 'center', marginRight: '32px' }}>{value}</span>}
              />
              <Bar
                dataKey='captive'
                fill="#BFECFF"
                name='Captive Rakes'
                stackId="a"
              />
              <Bar
                dataKey='indianRakes'
                fill="#CDC1FF"
                name='Indian Rakes'
                stackId="a"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Box>
    </Container>
  )
}