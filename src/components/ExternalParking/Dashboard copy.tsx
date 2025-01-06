'use client'

import React, { useState, useEffect } from "react";
import { httpsGet } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { Card, CardContent, Typography, Button, Grid, Box } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CustomSelect from "../UI/CustomSelect/CustomSelect";
import './dashboard.css';

const idNameMap: { [key: string]: string } = {
  'total_registration': 'Total Registration',
  'ep': 'External Parking',
  'shipment': 'Shipment(s)',
}

const timeRangeIDNameMap: { [key: string]: string } = {
  0: '0-8 Hours',
  8: '8-16 Hours',
  16: '16-24 Hours',
  24: '24-32 Hours',
  32: '32-40 Hours',
  40: '40-48 Hours',
  48: '48-56 Hours',
  56: '56-64 Hours',
}

const Dashboard = () => {
  const [vehicleStatusData, setVehicleStatusData] = useState<any[]>([]);
  const [timeRangeData, setTimeRangeData] = useState<any[]>([]);
  const [condition, setCondition] = useState("24");
  const router = useRouter();

  const fetchVehicleStatusData = async () => {
    const response = await httpsGet(`externalParking/vehicleStatus?condition=${condition}`, 1, router);
    if (response.statusCode === 200) {
      const vehicleData = []
      for(const key of Object.keys(response.data)) {
        vehicleData.push({
          id: key,
          name: idNameMap[key],
          count: response.data[key][0].count[0],
          shipments: response.data[key][0].data[0],
        });
      };
      setVehicleStatusData(vehicleData);
    }
  };

  const fetchTimeRangeData = async () => {
    const response = await httpsGet('externalParking/timeRange', 1, router);
    if (response.statusCode === 200) {
      const timeRangeD = []
      for(const timeRange of response.data) {
        timeRangeD.push({
          id: timeRange._id,
          name: timeRangeIDNameMap[timeRange._id] || '>64 Hours',
          count: timeRange.count,
          shipments: timeRange.data,
        });
      };
      setTimeRangeData(timeRangeD);
    }
  };

  useEffect(() => {
    fetchVehicleStatusData();
  }, [condition]);

  useEffect(() => {
    fetchTimeRangeData();
  }, []);

  const handleClick = (id: string) => {
    console.log("clicked", id);
    // Add your logic here for handling the click event
  };

  const conditionOptions = [
    { value: "24", label: "Last 24 hours" },
    { value: "48", label: "Last 48 hours" },
    { value: "72", label: "Last 72 hours" },
    { value: "96", label: "Last 96 hours" },
  ];

  return (
    <Box sx={{ p: 3 }} className="wrapper">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Vehicle Status Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CustomSelect
            value={condition}
            onValueChange={setCondition}
            placeholder="Select condition"
            options={conditionOptions}
          />
          <Button
            variant="outlined"
            onClick={fetchVehicleStatusData}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {vehicleStatusData.map((data) => (
          <Grid item xs={12} sm={6} md={4} key={data.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'box-shadow 0.3s', 
                '&:hover': { boxShadow: 6 } 
              }}
              onClick={() => handleClick(data.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" component="div">
                    {data.name}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {data.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* time-range  */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 4 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Vehicle Wait Time
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* <CustomSelect
            value={condition}
            onValueChange={setCondition}
            placeholder="Select condition"
            options={conditionOptions}
          /> */}
          <Button
            variant="outlined"
            onClick={fetchTimeRangeData}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {timeRangeData.map((data) => (
          <Grid item xs={6} sm={4} md={2} key={data.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'box-shadow 0.3s', 
                '&:hover': { boxShadow: 6 } 
              }}
              onClick={() => handleClick(data.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" component="div">
                    {data.name}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {data.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
