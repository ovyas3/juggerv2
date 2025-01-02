"use client"
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { styled } from '@mui/system';
import './wagonsDashboard.css';
import Header from "@/components/Header/header";
import SideDrawer from "@/components/Drawer/Drawer";
import Image from 'next/image';
import ScreenShotIcon from '@/assets/screenshot_icon.svg';
import DownloadIcon from '@/assets/download_icon.svg';
import { useRouter } from 'next/navigation';
import { httpsGet } from '@/utils/Communication';
import { ThreeCircles } from "react-loader-spinner";
import { toPng } from 'html-to-image';
import { useTranslations } from 'next-intl';

// Custom styled components
const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: theme.spacing(3),
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  height: '36px',
  marginLeft: theme.spacing(2),
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: '#757575',
}));

interface DataPoint {
  month: string;
  totalOrdered: number;
  fullyUtilized: number;
  partiallyUtilized: number;
  opportunityLossPercentage: number;
  opportunityLossRupees: number;
  opportunityLossTonnage: number;
  lossPercentage: number;
  actualPercentage: number;
  lossFrieghtAmount: number;
  actualFrieghtAmount: number;
  lossTonnage: number;
  actualTonnage: number;
}

const CustomTooltip = ({ active, payload, label, isPercentage, isRupees, isTonnage }: TooltipProps<number, string> & { isPercentage: boolean, isRupees: boolean, isTonnage: boolean }) => {
  const text = useTranslations("ETADASHBOARD");
  if (active && payload && payload.length) {

    // Constant Values
    const dataPoint = payload[0].payload as DataPoint
    const totalOrdered = Math.round(dataPoint.totalOrdered);
    const fullyUtilized = Math.round(dataPoint.fullyUtilized);
    const partiallyUtilized = Math.round(dataPoint.partiallyUtilized);
    const fullyUtilizedPercentage = ((fullyUtilized / totalOrdered) * 100).toFixed(2)
    const partiallyUtilizedPercentage = ((partiallyUtilized / totalOrdered) * 100).toFixed(2)
    const lossPercentage = dataPoint.lossPercentage 
    const actualPercentage = dataPoint.actualPercentage;
    const lossFrieghtAmount = `₹${(dataPoint?.lossFrieghtAmount).toFixed(2)} Cr` || '₹0.00 Cr';
    const actualFrieghtAmount = `₹${(dataPoint?.actualFrieghtAmount).toFixed(2)} Cr` || '₹0.00 Cr';
    const lossTonnage = dataPoint?.lossTonnage?.toLocaleString('en-IN') + ' MT' || '0.00 MT'
    const actualTonnage = dataPoint?.actualTonnage?.toLocaleString('en-IN') + ' MT' || '0.00 MT'

    const tooltipStyle: React.CSSProperties = {
      backgroundColor: '#E8F4FF',
      border: '1px solid #334FFC',
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

    const opportunityLossStyle: React.CSSProperties = {
      borderTop: '1px solid #A9D3FF',
      paddingTop: '8px',
      marginTop: '8px'
    };

    return (
      isPercentage ? (
        <div>
          <div style={tooltipStyle}>
          <div style={sectionTitleStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#596CFF' }}></span>
            {text('actualPercentage')} : {actualPercentage}%
          </div>
          <div style={dataRowStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#A4ABFF' }}></span>
            {text('lossPercentage')} : {lossPercentage}%
          </div>
        </div>
        </div>
      ) : isRupees ? (
        <div>
         <div style={tooltipStyle}>
         <div style={sectionTitleStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#596CFF' }}></span>
            {text('actualFreightAmount')} : {actualFrieghtAmount}
          </div>
          <div style={dataRowStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#A4ABFF' }}></span>
            {text('lossFreightAmount')} : {lossFrieghtAmount}
          </div>
        </div>
        </div>
      ) : isTonnage ? (
        <div>
          <div style={tooltipStyle}>
          <div style={sectionTitleStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#596CFF' }}></span>
            {text('actualTonnage')} : {actualTonnage}
          </div>
          <div style={dataRowStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#A4ABFF' }}></span>
            {text('lossTonnage')} : {lossTonnage}
          </div>
        </div>
        </div>
      ) : (
        <div style={tooltipStyle}>
          <div style={sectionTitleStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#596CFF' }}></span>
            {text('totalWagons')} : {totalOrdered}
          </div>
          <div style={dataRowStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#A4ABFF' }}></span>
            {text('fullyUtilized')} : {fullyUtilized} ({fullyUtilizedPercentage}%)
          </div>
          <div style={dataRowStyle}>
            <span style={{ ...colorIndicatorStyle, backgroundColor: '#EAEBFF' }}></span>
            {text('partiallyUtilized')} : {partiallyUtilized} ({partiallyUtilizedPercentage}%)
          </div>
        </div>
      )
    );
  }
  return null;
};

export default function WagonsDashboard() {
  const router = useRouter();
  const text = useTranslations("ETADASHBOARD");
  const [loading, setLoading] = useState(true);
  const [opportunityLossType, setOpportunityLossType] = useState('Wagon');
  const [data, setData] = useState([]);
  const [avgWagonsCapacityUtilization, setAvgWagonsCapacityUtilization] = useState('0.00');
  const [formattedOpportunityLossRupees, setFormattedOpportunityLossRupees] = useState('0.00 Cr');
  const [formattedOpportunityLossTonnage, setFormattedOpportunityLossTonnage] = useState('0.00 MT');
  const [yAxisDomain, setYAxisDomain] = useState([0, 3000]);
  const [yAxisTicks, setYAxisTicks] = useState([0, 500, 1000, 1500, 2000, 2500, 3000]);
  const componentRef = useRef<HTMLDivElement>(null);
  const [isPercentage, setIsPercentage] = useState(false);
  const [isRupees, setIsRupees] = useState(false);
  const [isTonnage, setIsTonnage] = useState(false);
  const [yAxisLabel, setYAxisLabel] = useState('No. of Wagons');
  const [barDataKeys, setBarDataKeys] = useState<any>({});
  const [chartType, setChartType] = useState('bar');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpportunityLossChange = (event: any) => {
    const value = event.target.value;
    setOpportunityLossType(value);
    if(value === 'Percentage'){
      setIsPercentage(true);
      setIsRupees(false);
      setIsTonnage(false);
      setYAxisLabel('Opportunity Loss in Percentage (%)');
      setBarDataKeys({
        actualPercentage: 'actualPercentage',
        lossPercentage: 'lossPercentage',
      });
    } else if(value === 'Rupees'){
      setIsPercentage(false);
      setIsRupees(true);
      setIsTonnage(false);
      setYAxisLabel('Opportunity Loss in Rupees (₹)');
      setBarDataKeys({
        lossFrieghtAmount : 'lossFrieghtAmount',
        actualFrieghtAmount: 'actualFrieghtAmount',
      });
    } else if(value === 'Tonnage'){
      setIsPercentage(false);
      setIsRupees(false);
      setIsTonnage(true);
      setYAxisLabel('Opportunity Loss in Tonnage (MT)');
      setBarDataKeys({
        lossTonnage : 'lossTonnage',
        actualTonnage: 'actualTonnage',
      });
    } else {
      setIsPercentage(false);
      setIsRupees(false);
      setIsTonnage(false);
      setYAxisLabel('No. of Wagons');
      setBarDataKeys({
        totalOrdered: 'totalOrdered',
        fullyUtilized: 'fullyUtilized',
        partiallyUtilized: 'partiallyUtilized'
      });
    }
  };

  const handleDownload = () => {
    console.log('Download clicked');
  };

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
        link.download = 'wagons-capacity-utilization.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error taking screenshot:', error);
      }
    }
  };

  const getWagonsCapacityUtilization = async () => {
    try{
      setLoading(true)
      const response = await httpsGet('get/wagonsCapacityUtilization', 0, router);
      const data = response?.data;
      const monthMap: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11
      };
      
      const wagonData = data && data.map((item: any) => {
        const totalOrdered = item.total_wagon;
        const fullyUtilized = item.fullyUtilizedWagons;
        const partiallyUtilized = item.partiallyUtilizedWagons;
        const opportunityLossPercentage = item.utilizationPercentage;
        const opportunityLossRupees = item.opportunityLossRupees;
        const opportunityLossTonnage = item.opportunityLossTonnage;
        const actualWeight = item.totalActualWeight;
        const chargeableWeight = item.totalChargeableWeight;
        const actualFreightAmountTot = item.totalAFreight;
      
        // Calculate opportunity loss percentages
        const actualPercentage = Math.round(opportunityLossPercentage);
        const lossPercentage =  Math.round(((chargeableWeight - actualWeight) / chargeableWeight) * 100);
      
        // Calculate opportunity loss rupees
        const actualFrieghtAmount = actualFreightAmountTot / 10000000;
        const lossFrieghtAmount = opportunityLossRupees / 10000000;
      
        // Calculate opportunity loss tonnage
        const actualTonnage = actualWeight;
        const lossTonnage = opportunityLossTonnage;
      
        return {
          month: new Date(item._id).toLocaleString('default', { month: 'short' }),
          totalOrdered,
          fullyUtilized,
          partiallyUtilized,
          opportunityLossPercentage,
          opportunityLossRupees,
          opportunityLossTonnage,
          lossPercentage,
          actualPercentage,
          actualFrieghtAmount,
          lossFrieghtAmount,
          lossTonnage,
          actualTonnage
        };
      }).sort((a: any, b: any) => monthMap[a.month] - monthMap[b.month]);

      const totalEntries = wagonData && wagonData.length ? wagonData.length : 0;
      const totalOpportunityLossPercentage = wagonData && wagonData.length ? wagonData.reduce((sum: any, item: any) => sum + item.opportunityLossPercentage, 0) : 0;
      const totalOpportunityLossRupees = wagonData && wagonData.length ? wagonData.reduce((sum: any, item: any) => sum + item.opportunityLossRupees, 0) : 0;
      const totalOpportunityLossTonnage = wagonData && wagonData.length ? wagonData.reduce((sum: any, item: any) => sum + item.opportunityLossTonnage, 0) : 0;

      let avgWagonsCapacityUtilization = (totalOpportunityLossPercentage / totalEntries).toFixed(2) || '0.00';
      avgWagonsCapacityUtilization = isNaN(parseFloat(avgWagonsCapacityUtilization)) ? '0.00' : avgWagonsCapacityUtilization;
      const formattedOpportunityLossRupees = (totalOpportunityLossRupees / 10000000).toFixed(2) + ' Cr' || '0.00 Cr';
      const formattedOpportunityLossTonnage = totalOpportunityLossTonnage.toLocaleString('en-IN') + ' MT' || '0.00 MT';

      setAvgWagonsCapacityUtilization(avgWagonsCapacityUtilization);
      setFormattedOpportunityLossRupees(formattedOpportunityLossRupees);
      setFormattedOpportunityLossTonnage(formattedOpportunityLossTonnage);
      
      setData(wagonData);
      setLoading(false);
      setBarDataKeys({
        totalOrdered: 'totalOrdered',
        fullyUtilized: 'fullyUtilized',
        partiallyUtilized: 'partiallyUtilized'
      });
    } catch (error) {
      setLoading(false)
      console.log(error)
    } finally {
      setLoading(false)
    }
  };

  const calculateYAxis = (data: any, isPercentage: boolean, isRupees: boolean, isTonnage: boolean) => {
    let maxTotalValue = 0;
    let domain = [0, 0];
    let ticks: number[] = [];
  
    if (isPercentage) {
      maxTotalValue = data && data.length ? Math.max(...data.map((item: any) => item.lossPercentage + item.actualPercentage)) : 0;
      domain = [0, Math.ceil(maxTotalValue / 10) * 10]; 
      ticks = Array.from({ length: Math.ceil(domain[1] / 10) + 1 }, (_, i) => i * 10); 
    } else if (isRupees) {
      const maxTotalValue = data && data.length ? Math.max(...data.map((item: any) => item.lossFrieghtAmount + item.actualFrieghtAmount)) : 0;
      domain = [0, Math.ceil(maxTotalValue)];

      const stepSize = Math.ceil(maxTotalValue / 5) * 1;
      
      ticks = Array.from({ length: Math.ceil(maxTotalValue / (stepSize)) + 1 }, (_, i) => i * stepSize);
    } else if (isTonnage) {
      const maxTotalValue = data && data.length ? Math.max(...data.map((item: any) => item.lossTonnage + item.actualTonnage)) : 0;
      
      const numberOfTicks = 5;
      const interval = Math.ceil(maxTotalValue / numberOfTicks / 10000) * 10000;
    
      domain = [0, interval * numberOfTicks];
      ticks = Array.from({ length: numberOfTicks + 1 }, (_, i) => i * interval);
    }else {
      maxTotalValue = data && data.length ? Math.max(...data.map((item: any) => item.totalOrdered + item.fullyUtilized + item.partiallyUtilized)) : 0;
      domain = [0, Math.ceil(maxTotalValue / 1000) * 1000]; 
      ticks = Array.from({ length: Math.ceil(domain[1] / 1000) + 1 }, (_, i) => i * 1000); 
    }
  
    return { domain, ticks };
  };

  useEffect(() => {
    getWagonsCapacityUtilization();
  }, []);

  useEffect(() => {
    const { domain, ticks } = calculateYAxis(data, isPercentage, isRupees, isTonnage);
    setYAxisDomain(domain);
    setYAxisTicks(ticks);
  }, [data, isPercentage, isRupees, isTonnage]);

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
    <StyledBox 
    ref={componentRef}
    sx={{
      marginBottom: '20px',
    }}
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
          {text('wagonCapacityUtilization')}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
          <FormControl component="fieldset">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
            }}>

            <Typography variant="body1" gutterBottom
            sx={{
              fontSize: '14px',
              color: '#42454E',
              paddingTop: '4px',
              fontWeight: '600',
              fontFamily: '"Inter", sans-serif',
            }}>
              {text('opportunityLossType')}
            </Typography>

            <RadioGroup row value={opportunityLossType} onChange={handleOpportunityLossChange}
            sx={{
              fontFamily: '"Inter", sans-serif',
            }}>
              <FormControlLabel value="Wagon" control={<Radio />} label="Wagon" sx={{
                fontSize: '13px',
                color: '#71747A',
                fontWeight: 'normal',
                fontFamily: '"Inter", sans-serif',
              }} />
              <FormControlLabel value="Percentage" control={<Radio />} label="Percentage" sx={{
                fontSize: '13px',
                color: '#71747A',
                fontWeight: 'normal',
                fontFamily: '"Inter", sans-serif',
              }} />
              <FormControlLabel value="Rupees" control={<Radio />} label="Rupees" sx={{
                fontSize: '13px',
                color: '#71747A',
                fontWeight: 'normal',
                fontFamily: '"Inter", sans-serif',
              }}  />
              <FormControlLabel value="Tonnage" control={<Radio />} label="Tonnage" sx={{
                fontSize: '13px',
                color: '#71747A',
                fontWeight: 'normal',
                fontFamily: '"Inter", sans-serif',
              }} />
            </RadioGroup>

            
            </div>
          </FormControl>

          <Box display="flex" alignItems="center">
            <IconButton onClick={handleDownload}>
              <Image src={DownloadIcon} alt='Download' />
            </IconButton>
            <IconButton onClick={handleScreenshot}>
              <Image src={ScreenShotIcon} alt='Screenshot' />
            </IconButton>
            {/* <StyledSelect value={timeFrame} onChange={handleTimeFrameChange}>
              <MenuItem value="Month Wise">Month Wise</MenuItem>
              <MenuItem value="Quarter Wise">Quarter Wise</MenuItem>
              <MenuItem value="Year Wise">Year Wise</MenuItem>
            </StyledSelect> */}
          </Box>
        </Box>
        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'}>

          <Box width={isMobile ? '100%' : '70%'} mr={isMobile ? 0 : 3} mb={isMobile ? 3 : 0} >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barGap={0}
              barSize={28}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickCount={7}
                domain={yAxisDomain}
                ticks={yAxisTicks}
                label={{ 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft', 
                  offset: 10,
                  dx: -20,
                  dy: 0, 
                  style: {
                    fontSize: '14px',
                    letterSpacing: '0.5px',
                    color: '#71747A',
                    fontWeight: '500',
                    fontFamily: '"Inter", sans-serif',
                    textAnchor: 'middle' 
                  }
                }}
              />
              <Tooltip content={<CustomTooltip isPercentage={isPercentage} isRupees={isRupees} isTonnage={isTonnage}/>}/>
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="square"
                iconSize={12}
                formatter={(value) => <span style={{ color: '#666', fontSize: 14, textAlign: 'center', marginRight: '32px' }}>{value}</span>}
              />
              {
                isPercentage ? (
                  <>
                    <Bar dataKey={barDataKeys?.actualPercentage} name="Actual Percentage" fill="#596CFF"/>
                    <Bar dataKey={barDataKeys?.lossPercentage} name="Loss Percentage" fill="#A4ABFF"/>
                  </>
                ) : isTonnage ? (
                    <>
                      <Bar dataKey={barDataKeys?.lossTonnage} name="Loss Tonnage" stackId="c" fill="#A4ABFF"/>
                      <Bar dataKey={barDataKeys?.actualTonnage} name="Actual Tonnage" stackId="c" fill="#596CFF"/>
                    </>
                ) : isRupees ? (
                    <>
                      <Bar dataKey={barDataKeys?.lossFrieghtAmount} name="Loss Freight Amount" stackId="a" fill="#A4ABFF"/>
                      <Bar dataKey={barDataKeys?.actualFrieghtAmount} name="Actual Freight Amount" stackId="a" fill="#596CFF"/>
                    </>
                )
                  : (
                    <>
                      <Bar dataKey={barDataKeys?.partiallyUtilized} name="Partially Utilized" stackId="a" fill="#EAEBFF"/>
                      <Bar dataKey={barDataKeys?.fullyUtilized} name="Fully Utilized" stackId="a" fill="#A4ABFF"/>
                      <Bar dataKey={barDataKeys?.totalOrdered} name="Total Wagons" stackId="a" fill="#596CFF" />
                    </>
                )
              }
              </BarChart>
            </ResponsiveContainer>
            {/* <div id='toggle-container-various-charts'>
              <button onClick={() => setChartType('bar')}>Bar Chart</button>
              <button onClick={() => setChartType('line')}>Line Chart</button>
              <button onClick={() => setChartType('pie')}>Pie Chart</button>
            </div> */}
          </Box>

          <Box width={isMobile ? '100%' : '30%'}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontWeight: '600',
                fontSize: '16px',
                color: '#2E2D32',
                marginBottom: '16px',
                fontFamily: '"Inter", sans-serif',
              }}>
              {text('overallStatistics')}
            </Typography>
            <StatBox>
              <StatValue style={{ 
                color: '#6BA97A' ,
                fontFamily: '"Inter", sans-serif',
              }}>{avgWagonsCapacityUtilization} %</StatValue>
              <StatLabel
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '12px',
                  color: '#42454E',
                  fontWeight: '400',
                }}
              >{text('avgWagonsCapacityUtilization')}
              </StatLabel>
            </StatBox>
            <StatBox>
              <StatValue style={{ 
                color: '#FF5252',
                fontFamily: '"Inter", sans-serif',
              }}>₹{formattedOpportunityLossRupees}</StatValue>
              <StatLabel 
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '12px',
                  color: '#42454E',
                  fontWeight: '400',
                }}
              >{text('opportunityLossInRupees')}
              </StatLabel>
            </StatBox>
            <StatBox>
              <StatValue style={{ 
                color: '#FF5252',
                fontFamily: '"Inter", sans-serif',
              }}>{formattedOpportunityLossTonnage}</StatValue>
              <StatLabel
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '12px',
                  color: '#42454E',
                  fontWeight: '400',
                }}
              >{text('opportunityLossInTonnage')}
              </StatLabel>
            </StatBox>
          </Box>

        </Box>
    </StyledBox>
  );
}