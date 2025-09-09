import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  styled,
  useMediaQuery
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface ChartDataPoint {
  timestamp: number;
  value: number;
}

interface DoorEvent {
  timestamp: number;
  type: 'open' | 'close';
}

interface ChartTabProps {
  temperatureData: ChartDataPoint[];
  weightData: ChartDataPoint[];
  doorEvents: DoorEvent[];
  loading: boolean;
  isTechnova: boolean;
}

const ChartTab: React.FC<ChartTabProps> = ({
  temperatureData = [],
  weightData = [],
  doorEvents = [],
  loading = false,
  isTechnova = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  
  const tempChartRef = useRef<HTMLDivElement>(null);
  const weightChartRef = useRef<HTMLDivElement>(null);
  const doorChartRef = useRef<HTMLDivElement>();
  
  const [tempChart, setTempChart] = useState<echarts.ECharts | null>(null);
  const [weightChart, setWeightChart] = useState<echarts.ECharts | null>(null);
  const [doorChart, setDoorChart] = useState<echarts.ECharts | null>(null);
  
  // Initialize charts
  useEffect(() => {
    if (tempChartRef.current) {
      const chart = echarts.init(tempChartRef.current);
      setTempChart(chart);
      
      return () => {
        chart.dispose();
      };
    }
  }, []);
  
  useEffect(() => {
    if (weightChartRef.current) {
      const chart = echarts.init(weightChartRef.current);
      setWeightChart(chart);
      
      return () => {
        chart.dispose();
      };
    }
  }, []);
  
  useEffect(() => {
    if (doorChartRef.current) {
      const chart = echarts.init(doorChartRef.current);
      setDoorChart(chart);
      
      return () => {
        chart.dispose();
      };
    }
  }, []);
  
  // Update temperature chart
  useEffect(() => {
    if (!tempChart || !temperatureData.length) return;
    
    const option: echarts.EChartsOption = {
      title: {
        text: t('shipment.temperatureGraph'),
        left: 'center',
        textStyle: {
          color: theme.palette.text.primary,
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const date = new Date(params[0].value[0]);
          return `${date.toLocaleString()}<br/>${params[0].marker} ${params[0].seriesName}: ${params[0].value[1]}°C`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: theme.palette.divider,
          },
        },
        axisLabel: {
          color: theme.palette.text.secondary,
        },
      },
      yAxis: {
        type: 'value',
        name: '°C',
        nameTextStyle: {
          color: theme.palette.text.secondary,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: theme.palette.divider,
          },
        },
        axisLabel: {
          color: theme.palette.text.secondary,
        },
        splitLine: {
          lineStyle: {
            color: theme.palette.divider,
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: t('shipment.temperature'),
          type: 'line',
          showSymbol: false,
          data: temperatureData.map(item => [item.timestamp, item.value]),
          lineStyle: {
            color: theme.palette.primary.main,
            width: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(25, 118, 210, 0.2)' },
              { offset: 1, color: 'rgba(25, 118, 210, 0.05)' },
            ]),
          },
        },
      ],
      backgroundColor: theme.palette.background.paper,
    };
    
    tempChart.setOption(option);
    
    const handleResize = () => {
      tempChart.resize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [tempChart, temperatureData, t, theme]);
  
  // Update weight chart
  useEffect(() => {
    if (!weightChart || !weightData.length) return;
    
    const option: echarts.EChartsOption = {
      title: {
        text: t('shipment.weightGraph'),
        left: 'center',
        textStyle: {
          color: theme.palette.text.primary,
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const date = new Date(params[0].value[0]);
          return `${date.toLocaleString()}<br/>${params[0].marker} ${params[0].seriesName}: ${params[0].value[1]} MT`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: theme.palette.divider,
          },
        },
        axisLabel: {
          color: theme.palette.text.secondary,
        },
      },
      yAxis: {
        type: 'value',
        name: 'MT',
        nameTextStyle: {
          color: theme.palette.text.secondary,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: theme.palette.divider,
          },
        },
        axisLabel: {
          color: theme.palette.text.secondary,
        },
        splitLine: {
          lineStyle: {
            color: theme.palette.divider,
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: t('shipment.weight'),
          type: 'line',
          showSymbol: false,
          data: weightData.map(item => [item.timestamp, item.value]),
          lineStyle: {
            color: theme.palette.secondary.main,
            width: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(156, 39, 176, 0.2)' },
              { offset: 1, color: 'rgba(156, 39, 176, 0.05)' },
            ]),
          },
        },
      ],
      backgroundColor: theme.palette.background.paper,
    };
    
    weightChart.setOption(option);
    
    const handleResize = () => {
      weightChart.resize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [weightChart, weightData, t, theme]);
  
  // Update door events chart
  useEffect(() => {
    if (!doorChart || !doorEvents.length) return;
    
    // Process door events to create segments
    const segments: { value: number; itemStyle: { color: string } }[] = [];
    let lastTime = doorEvents[0]?.timestamp || 0;
    
    for (let i = 0; i < doorEvents.length; i++) {
      const event = doorEvents[i];
      segments.push({
        value: event.timestamp - lastTime,
        itemStyle: {
          color: event.type === 'open' ? '#4caf50' : '#f44336',
        },
      });
      lastTime = event.timestamp;
    }
    
    const option: echarts.EChartsOption = {
      title: {
        text: t('shipment.doorEvents'),
        left: 'center',
        textStyle: {
          color: theme.palette.text.primary,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const event = doorEvents[params.dataIndex];
          const date = new Date(event.timestamp);
          return `${event.type === 'open' ? 'Opened' : 'Closed'}: ${date.toLocaleString()}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        show: false,
      },
      yAxis: {
        type: 'category',
        data: [''],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
      series: [
        {
          name: 'Door Status',
          type: 'bar',
          stack: 'total',
          silent: true,
          itemStyle: {
            borderColor: 'transparent',
            color: theme.palette.divider,
          },
          emphasis: {
            itemStyle: {
              borderColor: 'transparent',
            },
          },
          data: segments,
        },
      ],
      backgroundColor: theme.palette.background.paper,
    };
    
    doorChart.setOption(option);
    
    const handleResize = () => {
      doorChart.resize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [doorChart, doorEvents, t, theme]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const ChartContainer = styled(Paper)({
    width: '100%',
    height: 400,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  });
  
  const ChartWrapper = styled('div')({
    flex: 1,
    width: '100%',
    minHeight: 300,
  });
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isTechnova) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="textSecondary" align="center">
          {t('shipment.technovaRequired')}
        </Typography>
      </Box>
    );
  }
  
  const hasCharts = temperatureData.length > 0 || weightData.length > 0 || doorEvents.length > 0;
  
  if (!hasCharts) {
    return (
      <Box p={3} textAlign="center">
        <InfoIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {t('shipment.noChartData')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {t('shipment.noChartDataDescription')}
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box p={isMobile ? 1 : 3}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant={isMobile ? 'scrollable' : 'standard'}
        scrollButtons={isMobile ? 'auto' : false}
        aria-label="chart tabs"
        sx={{ mb: 2 }}
      >
        {temperatureData.length > 0 && <Tab label={t('shipment.temperature')} />}
        {weightData.length > 0 && <Tab label={t('shipment.weight')} />}
        {doorEvents.length > 0 && <Tab label={t('shipment.doorEvents')} />}
      </Tabs>
      
      <Box>
        {activeTab === 0 && temperatureData.length > 0 && (
          <ChartContainer elevation={1}>
            <ChartWrapper ref={tempChartRef} />
          </ChartContainer>
        )}
        
        {activeTab === 1 && weightData.length > 0 && (
          <ChartContainer elevation={1}>
            <ChartWrapper ref={weightChartRef} />
          </ChartContainer>
        )}
        
        {activeTab === 2 && doorEvents.length > 0 && (
          <ChartContainer elevation={1}>
            <ChartWrapper ref={el => {
              if (el) doorChartRef.current = el;
            }} />
          </ChartContainer>
        )}
      </Box>
    </Box>
  );
};

export default ChartTab;
