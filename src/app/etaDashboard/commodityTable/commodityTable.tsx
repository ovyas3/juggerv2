'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Box, Typography, Grid, Paper, InputAdornment, IconButton } from '@mui/material';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector, ResponsiveContainer, Cell } from 'recharts'
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import './commodityTable.css'
import { httpsGet } from '@/utils/Communication'
import { useRouter } from 'next/navigation'
import { ThreeCircles } from "react-loader-spinner";
import service from '@/utils/timeService';
import ScreenShotIcon from '@/assets/screenshot_icon.svg';
import { toPng } from 'html-to-image';
import Image from 'next/image';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { styled } from '@mui/system';
import { useTranslations } from 'next-intl';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  width: '100%',
  borderRadius: '10px',
  padding: theme.spacing(3),
}));
interface CommodityData {
  id: number
  commodity: string
  withinETA: {
    count: number
    percentage: number
  }
  beyondETA: {
    count: number
    percentage: number
  }
  total: number
}


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

const commodities = [
  "IS (IRON & STEEL)",
  "CEMT (CEMENT)",
  "COAL (COAL)",
  "IMCL (IMPORTED COAL)",
  "IMOR (IMPORTED IRON ORE)",
  "MIXD (MIXED)",
  "ORES (ORES)",
  "RMSP (RAW MATERIAL FOR STEEL PLANT)"
];

// Colors for different commodities
const COLORS = ['#FF7062', '#FD8D8C', '#ffc658', '#ff7300', '#0088FE', '#18BF89', '#FBA1FB', '#3A32FF']

const commodityColors = commodities.reduce((acc: any, commodity, index) => {
  acc[commodity] = COLORS[index];
  return acc;
}, {});

// Mock data based on the API response structure
const mockData = [
  {
    commodity: "IS (IRON & STEEL)",
    withinETA: { count: 85, percentage: 45 },
    beyondETA: { count: 65, percentage: 55 }
  },
  {
    commodity: "CEMT (CEMENT)",
    withinETA: { count: 45, percentage: 30 },
    beyondETA: { count: 55, percentage: 70 }
  },
  {
    commodity: "COAL (COAL)",
    withinETA: { count: 95, percentage: 65 },
    beyondETA: { count: 35, percentage: 35 }
  },
  {
    commodity: "IMCL (IMPORTED COAL)",
    withinETA: { count: 75, percentage: 50 },
    beyondETA: { count: 45, percentage: 50 }
  },
  {
    commodity: "IMOR (IMPORTED IRON ORE)",
    withinETA: { count: 60, percentage: 40 },
    beyondETA: { count: 90, percentage: 60 }
  },
  {
    commodity: "MIXD (MIXED)",
    withinETA: { count: 40, percentage: 35 },
    beyondETA: { count: 75, percentage: 65 }
  },
  {
    commodity: "ORES (ORES)",
    withinETA: { count: 90, percentage: 75 },
    beyondETA: { count: 30, percentage: 25 }
  },
  {
    commodity: "RMSP (RAW MATERIAL FOR STEEL PLANT)",
    withinETA: { count: 70, percentage: 60 },
    beyondETA: { count: 50, percentage: 40 }
  }
]

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
};

const dataRowStyle: React.CSSProperties = {
  marginBottom: '4px'
};

const colorIndicatorStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '12px',
  height: '12px',
  marginRight: '8px',
  borderRadius: '2px'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  marginBottom: '8px'
};

const CommodityTable: React.FC = () => {
  const today: any = new Date();
  const oneMonthAgo: any = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const text = useTranslations('ETADASHBOARD');

  const [startDate, setStartDate] = useState<any>(oneMonthAgo);
  const [endDate, setEndDate] = useState<any>(today);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false)
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false)
  const [direction, setDirection] = useState("outward")
  const [commodity, setCommodity] = useState<string[]>(["IS (IRON & STEEL)"]);
  const [type, setType] = useState<string[]>([])
  const componentRef = useRef<HTMLDivElement>(null);

  const [commodityData, setCommodityData] = useState<CommodityData[]>([])

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [subTotalWithinETA, setSubTotalWithinETA] = useState(0);
  const [subTotalBeyondETA, setSubTotalBeyondETA] = useState(0);
  const [subTotalTotal, setSubTotalTotal] = useState(0);
  
  const [withinTrendData, setWithinTrendData] = useState<any[]>([]);
  const [beyondTrendData, setBeyondTrendData] = useState<any[]>([]);

  // Prepare data for trend lines
  const trendData = [
    { date: 'Oct 1', ...mockData.reduce((acc, item) => ({ ...acc, [item.commodity]: item.withinETA.count }), {}) },
    { date: 'Oct 15', ...mockData.reduce((acc, item) => ({ ...acc, [item.commodity]: item.withinETA.count * 0.8 }), {}) },
    { date: 'Oct 31', ...mockData.reduce((acc, item) => ({ ...acc, [item.commodity]: item.withinETA.count * 0.9 }), {}) },
  ]

  const beyondTrendDataA = [
    { date: 'Oct 1', ...mockData.reduce((acc, item) => ({ ...acc, [item.commodity]: item.beyondETA.count }), {}) },
    { date: 'Oct 15', ...mockData.reduce((acc, item) => ({ ...acc, [item.commodity]: item.beyondETA.count * 1.2 }), {}) },
    { date: 'Oct 31', ...mockData.reduce((acc, item) => ({ ...acc, [item.commodity]: item.beyondETA.count * 0.95 }), {}) },
  ]

  const handleDateChange = (date: any, type: 'start' | 'end') => {
    if (date) {
      const epochTime = service.millies(date);
      const newStartDate: any = service.millies(startDate);
      const newEndDate: any = service.millies(endDate);
      if (type === 'start') {
        setStartDate(date);
        if (newEndDate >= epochTime) {
          getCommodityData(epochTime, newEndDate);
          getETADailyData(epochTime, newEndDate);
        }
      } else {
        setEndDate(date);
        if (newStartDate <= epochTime) {
          getCommodityData(newStartDate, epochTime);
          getETADailyData(newStartDate, epochTime);
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

  const getCommodityData = async (from: number, to: number) => {
    try {
      setLoading(true);
      
      const IR = type.includes('ir') && type.includes('captive')
      ? 0
      : type.includes('ir')
      ? 1
      : type.includes('captive')
      ? 2
      : 0;

      const outward = direction === 'outward' ? 1 : direction === 'inward' ? 2 : 0;
      const validCommodities = [
        "IS (IRON & STEEL)",
        "CEMT (CEMENT)",
        "COAL (COAL)",
        "IMCL (IMPORTED COAL)",
        "IMOR (IMPORTED IRON ORE)",
        "MIXD (MIXED)",
        "ORES (ORES)",
        "RMSP (RAW MATERIAL FOR STEEL PLANT)"
      ];
  
      const filteredCommodities = commodity.filter(c => validCommodities.includes(c));
  
      const params = new URLSearchParams({
        from: from.toString(),
        to: to.toString(),
        outward: outward.toString()
      });

      if (IR !== 0) {
        params.append('IR', IR.toString());
      }
      
      filteredCommodities.forEach(c => params.append('commodity', c));
  
      const response = await httpsGet(
        `dashboard/eta?${params.toString()}`,
        0,
        router
      );
      if(response.statusCode === 200){
        const data = response.data;
        const commodityDataArr = data && data.map((item: any) => {
          return {
            id: item.sno || 0,
            commodity: item.commodity || '',
            withinETA: {
              count: item.withinEtaCount || 0,
              percentage: item.withinEtaPercentage || 0
            },
            beyondETA: {
              count: item.beyondEtaCount || 0,
              percentage: item.beyondEtaPercentage || 0
            },
            total: item.total || 0
          }
        });
        const subTotalWithinETA = commodityDataArr && commodityDataArr.length ? commodityDataArr.reduce((acc: any, item: any) => acc + item.withinETA.count, 0) : 0;
        const subTotalBeyondETA = commodityDataArr && commodityDataArr.length ? commodityDataArr.reduce((acc: any, item: any) => acc + item.beyondETA.count, 0) : 0;
        const subTotalTotal = commodityDataArr && commodityDataArr.length ? commodityDataArr.reduce((acc: any, item: any) => acc + item.total, 0) : 0;
        setCommodityData(commodityDataArr);
        setSubTotalWithinETA(subTotalWithinETA);
        setSubTotalBeyondETA(subTotalBeyondETA);
        setSubTotalTotal(subTotalTotal);
      }
    } catch (error) {
      setLoading(false);
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  const getETADailyData = async (from: number, to: number) => {
    try {
      setLoading(true);
      
      const IR = type.includes('ir') && type.includes('captive')
      ? 0
      : type.includes('ir')
      ? 1
      : type.includes('captive')
      ? 2
      : 0;

      const outward = direction === 'outward' ? 1 : direction === 'inward' ? 2 : 0;
      const validCommodities = [
        "IS (IRON & STEEL)",
        "CEMT (CEMENT)",
        "COAL (COAL)",
        "IMCL (IMPORTED COAL)",
        "IMOR (IMPORTED IRON ORE)",
        "MIXD (MIXED)",
        "ORES (ORES)",
        "RMSP (RAW MATERIAL FOR STEEL PLANT)"
      ];
  
      const filteredCommodities = commodity.filter(c => validCommodities.includes(c));
  
      const params = new URLSearchParams({
        from: from.toString(),
        to: to.toString(),
        outward: outward.toString()
      });

      if (IR !== 0) {
        params.append('IR', IR.toString());
      }
      
      filteredCommodities.forEach(c => params.append('commodity', c));
  
      const response = await httpsGet(
        `dashboard/etaDaily?${params.toString()}`,
        0,
        router
      );
      if(response.statusCode === 200){
        const data = response.data;
        let withinData = data && data.length ? data.map((item: any) => ({
          date: item.day,
          commodity: item.commodity,
          count: item.withinEtaCount,
          percentage: item.withinEtaPercentage
        })) : [];
    
        let beyondData = data && data.length ? data.map((item: any) => ({
          date: item.day,
          commodity: item.commodity,
          count: item.beyondEtaCount,
          percentage: item.beyondEtaPercentage
        })) : [];

        withinData = withinData.filter((item: any) => item.date);
        beyondData = beyondData.filter((item: any) => item.date);
        setWithinTrendData(withinData);
        setBeyondTrendData(beyondData);
      }
    } catch (error) {
      setLoading(false);
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      const newStartDate: any = service.millies(startDate);
      const newEndDate: any = service.millies(endDate);
      getCommodityData(newStartDate, newEndDate);
      getETADailyData(newStartDate, newEndDate);
    }
  }, [startDate, endDate, direction, type, commodity])

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
        link.download = 'ETA Compliance.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error taking screenshot:', error);
      }
    }
  };

  const commodityOptions = commodities.map(commodity => ({
    value: commodity,
    label: commodity
  }));

  
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;

    return (
      <div style={tooltipStyle}>
        <div style={headerStyle}>
          <span style={{ ...colorIndicatorStyle, backgroundColor: commodityColors[data.commodity] || '#000' }}></span>
          <div style={sectionTitleStyle}>{data.commodity}</div>
        </div>
        <div style={dataRowStyle}>
          {text('count')}: <b>{data.withinETA.count}</b>
        </div>
        <div style={dataRowStyle}>
          {text('percentage')}: <b>{data.withinETA.percentage}%</b>
        </div>
      </div>
    );
  };

  const CustomTooltipTrendLine = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const formattedDate = new Date(label).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
  
      return (
        <div style={tooltipStyle}>
          <div style={headerStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: commodityColors[data.commodity] || '#000' }}></span>
            <div style={sectionTitleStyle}>{data.commodity}</div>
          </div>
          <div style={dataRowStyle}>
            {text('date')}: <b>{formattedDate}</b>
          </div>
          <div style={dataRowStyle}>
            {text('count')}: <b>{data.count}</b>
          </div>
          <div style={dataRowStyle}>
            {text('percentage')}: <b>{data.percentage}%</b>
          </div>
        </div>
      );
    }
  
    return null;
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
    <StyledBox ref={componentRef} >
      <Box 
        className="commoditytable-header"
      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}
      >
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: '1.25rem',
            color: '#2E2D32',
            marginBottom: '16px',
            letterSpacing: '1.54px',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            textTransform: 'uppercase',
          }}>
           {text('etaCompliance')}
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
      <div className="commoditytable-filters">
        <Select
          value={direction}
          onValueChange={setDirection}
          placeholder="Select direction"
          options={[
            { value: "outward", label: "Outward" },
            { value: "inward", label: "Inward" },
          ]}
        />
        <MultiSelect
          value={commodity}
          onValueChange={setCommodity}
          placeholder="Select commodity"
          options={commodityOptions}
        />
        <MultiSelect
          value={type}
          onValueChange={setType}
          placeholder="Select type"
          options={[
            { value: "ir", label: "IR" },
            { value: "captive", label: "Captive" },
          ]}
        />
      </div>

      <div className='commoditytable-body'>
      <div className="commoditytable-table-wrapper">
        <table className="commoditytable-table">
        <thead>
          <tr>
              <th className="commoditytable-id-colum commoditytable-th-first-header">{text('sNo')}</th>
              <th className="commoditytable-th-first-header">{text('commodity')}</th>
              <th colSpan={2} className="commoditytable-center-align commoditytable-th-first-header">{text('withinETA')}</th>
              <th colSpan={2} className="commoditytable-center-align commoditytable-th-first-header">{text('beyondETA')}</th>
              <th className="commoditytable-left-align commoditytable-th-first-header">{text('total')}</th>
          </tr>
          <tr>
              <th className="commoditytable-th-second-header"></th>
              <th className="commoditytable-th-second-header"></th>
              <th className="commoditytable-th-second-header commoditytable-th-subs">{text('count')}</th>
              <th className="commoditytable-th-second-header commoditytable-th-subs">%</th>
              <th className="commoditytable-th-second-header commoditytable-th-subs">{text('count')}</th>
              <th className="commoditytable-th-second-header commoditytable-th-subs">%</th>
              <th className='commoditytable-th-second-header'></th>
          </tr>
        </thead>
          <tbody>
            {commodityData && commodityData.length ? 
            commodityData.map((row) => (
              <tr key={row.id} id='commoditytable-tr'>
                <td>{row.id}</td>
                <td className="commoditytable-font-medium">{row.commodity}</td>
                <td className="commoditytable-left-align">{row.withinETA.count}</td>
                <td className="commoditytable-left-align">{row.withinETA.percentage}%</td>
                <td className="commoditytable-left-align">{row.beyondETA.count}</td>
                <td className="commoditytable-left-align">{row.beyondETA.percentage}%</td>
                <td className="commoditytable-left-align">{row.total}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center' }}>{text('noDataFound')}</td>
              </tr>
            )
          }
          {/* <tr className="subtotal-row">
              <td colSpan={2}>Sub Total Steel</td>
              <td>{subTotalWithinETA}</td>
              <td></td>
              <td>{subTotalBeyondETA}</td>
              <td></td>
              <td>{subTotalTotal}</td>
            </tr> */}
          </tbody>
        </table>
      </div>

      <div className='commoditytable-piechart-wrapper'>
      <div className='commoditytable-piechart-content-box'>
        <div className='commoditytable-piechart-content-inner-box'>
          <div>
            <Typography variant="h6" gutterBottom
            sx={{
              color: '#44475B',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.01px',
            }}>
              {text('withinETACountAndPercentage')}
            </Typography>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={commodityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="withinETA.count"
                >
                  {commodityData.map((data, index) => (
                    <Cell key={`cell-${index}`} fill={commodityColors[data.commodity]} />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pie-chart-center-text"
                >
                  {subTotalWithinETA}
                </text>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='commoditytable-piechart-content-inner-box'>
          <div>
            <Typography variant="h6" gutterBottom
              sx={{
                color: '#44475B',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.01px',
              }}>
              {text('beyondETACountAndPercentage')}
            </Typography>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={commodityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="beyondETA.count"
                >
                  {commodityData.map((data, index) => (
                    <Cell key={`cell-${index}`} fill={commodityColors[data.commodity]} />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pie-chart-center-text"
                >
                  {subTotalBeyondETA}
                </text>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>

      <div className='commoditytable-trend-line-wrapper'>
      <div className='commoditytable-trend-line-content-inner-box'>
          <div>
          <Typography variant="h6" gutterBottom
              sx={{
                color: '#44475B',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.01px',
              }}>
              {text('withinETATrendLine')}
            </Typography>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={withinTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fontWeight: 'normal' }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    const day = date.getDate();
                    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
                    const year = date.getFullYear() % 100;
                    return `${month} ${day}`
                  }}/>
                <YAxis 
                  tick={{ fontSize: 12, fontWeight: 'normal' }} 
                  label={{ 
                    value: 'ETA Count', 
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: 10,
                    dx: -4,
                    dy: 0, 
                    style: {
                      fontSize: '9px',
                      letterSpacing: '0.5px',
                      color: '#71747A',
                      fontWeight: '500',
                      fontFamily: '"Inter", sans-serif',
                      textAnchor: 'middle' 
                    }
                  }}
                />
                <Tooltip content={<CustomTooltipTrendLine />}/>
                {/* <Legend /> */}
                {withinTrendData && withinTrendData.length > 0 && withinTrendData.map((commodity, index) => (
                  <Line
                    key={commodity}
                    type="monotone"
                    dataKey="count"
                    stroke={commodityColors[commodity?.commodity]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className='commoditytable-trend-line-content-inner-box'>
          <div>
          <Typography variant="h6" gutterBottom
              sx={{
                color: '#44475B',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.01px',
              }}>
              {text('beyondETATrendLine')}
            </Typography>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={beyondTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fontWeight: 'normal' }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    const day = date.getDate();
                    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
                    const year = date.getFullYear() % 100;
                    return `${month} ${day}`
                  }}/>
                <YAxis 
                  tick={{ fontSize: 12, fontWeight: 'normal' }}
                  label={{ 
                    value: 'ETA Count', 
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: 10,
                    dx: -4,
                    dy: 0, 
                    style: {
                      fontSize: '9px',
                      letterSpacing: '0.5px',
                      color: '#71747A',
                      fontWeight: '500',
                      fontFamily: '"Inter", sans-serif',
                      textAnchor: 'middle' 
                    }
                  }}
                />
                <Tooltip content={<CustomTooltipTrendLine />}/>
                {/* <Legend /> */}
                {beyondTrendData.length > 0 && beyondTrendData.map((commodity, index) => {
                  return (
                    <Line
                      key={commodity}
                      type="monotone"
                      dataKey="count"
                      stroke={commodityColors[commodity.commodity]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  );
                })}
                </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>

    </StyledBox>
  )
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, placeholder, options }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="select-container" ref={selectRef}>
      <div className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span>{value ? options.find(option => option.value === value)?.label : placeholder}</span>
        <svg
          className={`arrow ${isOpen ? 'open' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      {isOpen && (
        <div className="select-content">
          {options.map((option) => (
            <div
              key={option.value}
              className="select-item"
              onClick={() => {
                onValueChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .select-container {
          position: relative;
          width: 180px;
        }
        .select-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .select-trigger:hover {
          border-color: #cbd5e0;
        }
        .arrow {
          transition: transform 0.2s ease-in-out;
        }
        .arrow.open {
          transform: rotate(180deg);
        }
        .select-content {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          max-height: 200px;
          overflow-y: auto;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 0.375rem 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          z-index: 10;
        }
        .select-item {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          cursor: pointer;
          transition: background-color 0.2s ease-in-out;
        }
        .select-item:hover {
          background-color: #f7fafc;
        }
      `}</style>
    </div>
  )
}

interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}

const MultiSelect: React.FC<MultiSelectProps> = ({ value, onValueChange, placeholder, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectItem = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onValueChange(value.filter((v) => v !== selectedValue));
    } else {
      onValueChange([...value, selectedValue]);
    }
  };

  return (
    <div className="select-container" ref={selectRef}>
      <div className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="selected-values">
          {value.length > 0 ? value.map(v => options.find(option => option.value === v)?.label).join(', ') : placeholder}
        </span>
        <svg
          className={`arrow ${isOpen ? 'open' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      {isOpen && (
        <div className="select-content">
          {options.map((option) => (
            <div
              key={option.value}
              className={`select-item ${value.includes(option.value) ? 'selected' : ''}`}
              onClick={() => handleSelectItem(option.value)}
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => handleSelectItem(option.value)}
              />
              {option.label}
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .select-container {
          position: relative;
          width: 180px;
        }
        .select-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .select-trigger:hover {
          border-color: #cbd5e0;
        }
        .selected-values {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }
        .arrow {
          transition: transform 0.2s ease-in-out;
        }
        .arrow.open {
          transform: rotate(180deg);
        }
        .select-content {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          max-height: 200px;
          overflow-y: auto;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 0.375rem 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          z-index: 10;
        }
        .select-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          cursor: pointer;
          transition: background-color 0.2s ease-in-out;
        }
        .select-item:hover {
          background-color: #f7fafc;
        }
        .select-item.selected {
          background-color: #e2e8f0;
        }
        .select-item input {
          margin-right: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default CommodityTable;