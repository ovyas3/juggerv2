'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Box, Typography, Grid, Paper, InputAdornment, IconButton } from '@mui/material';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector, ResponsiveContainer, Cell } from 'recharts'
import './commodityTable.css'
import { httpsGet } from '@/utils/Communication'
import { useRouter } from 'next/navigation'
import { ThreeCircles } from "react-loader-spinner";
import service from '@/utils/timeService';
import ScreenShotIcon from '@/assets/screenshot_icon.svg';
import { toPng } from 'html-to-image';
import Image from 'next/image';
import { styled } from '@mui/system';
import { useTranslations } from 'next-intl';
import CustomDatePicker from '@/components/UI/CustomDatePicker/CustomDatePicker';
import CustomSelect from '@/components/UI/CustomSelect/CustomSelect';
import CustomMultiSelect from '@/components/UI/CustomMultiSelect/CustomMultiSelect';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  width: '100%',
  borderRadius: '10px',
  padding: theme.spacing(3),
  borderBottom: '1px solid #E8E8E8',
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
          <IconButton onClick={handleScreenshot} style={{
            padding: 0
          }}>
            <Image src={ScreenShotIcon} alt='Screenshot' />
          </IconButton>
        </Box>
      </Box>
      <div className="commoditytable-filters">
        <CustomSelect
          value={direction}
          onValueChange={setDirection}
          placeholder="Select direction"
          options={[
            { value: "outward", label: "Outward" },
            { value: "inward", label: "Inward" },
          ]}
        />
        <CustomMultiSelect
          value={commodity}
          onValueChange={setCommodity}
          placeholder="Select commodity"
          options={commodityOptions}
        />
        <CustomMultiSelect
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

export default CommodityTable;