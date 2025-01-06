/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Skeleton,
  Divider,
  Slider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CustomSelect from "../UI/CustomSelect/CustomSelect";
import "./dashboard.css";

// Reusable Time Range Section Component
interface TimeRangeSectionProps {
  title: string;
  data: any[];
  loading: boolean;
  onRefresh: () => void;
}

const TimeRangeSection: React.FC<TimeRangeSectionProps> = ({
  title,
  data,
  loading,
  onRefresh,
}) => {
  const handleClick = (id: string) => {
    console.log("clicked", id);
    // Add your logic here for handling the click event
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          mt: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: "bold", color: "text.primary" }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={onRefresh}
            startIcon={<RefreshIcon />}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>
      <Grid container spacing={1}>
        {loading ? (
          // Show skeletons while loading
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Card
                className="glassy-card"
                sx={{
                  height: 70,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.16)",
                }}
              >
                <Skeleton variant="text" width={100} height={25} />
              </Card>
            </Grid>
          ))
        ) : data.length === 0 ? (
          // Show no data message if no data is available
          <Grid item xs={12}>
            <Card
              className="glassy-card"
              sx={{
                height: 70,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.16)",
              }}
            >
              <Typography variant="subtitle2" color="textSecondary">
                No data available
              </Typography>
            </Card>
          </Grid>
        ) : (
          // Map the data
          data.map((item) => (
            <Grid item xs={6} sm={4} md={2} key={item.id}>
              <Card
                className="glassy-card"
                sx={{
                  cursor: "pointer",
                  transition: "box-shadow 0.3s",
                  "&:hover": { boxShadow: 4 },
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.16)",
                }}
                onClick={() => handleClick(item.id)}
              >
                <CardContent sx={{ padding: "10px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      component="div"
                      sx={{
                        textAlign: "center",
                        mb: 0.5,
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: "bold" }}
                    >
                      {item.count}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </>
  );
};

// Custom hook to manage dashboard data fetching and state
const useDashboardData = () => {
  const [vehicleStatusData, setVehicleStatusData] = useState<any[]>([]);
  const [vehicleWaitTimeData, setVehicleWaitTimeData] = useState<any[]>([]);
  const [shipmentTimeRangeData, setShipmentTimeRangeData] = useState<any[]>([]);
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);
  const [condition, setCondition] = useState("24");
  const [vehicleStatusLoading, setVehicleStatusLoading] = useState(true);
  const [vehicleWaitTimeLoading, setVehicleWaitTimeLoading] = useState(true);
  const [shipmentTimeRangeLoading, setShipmentTimeRangeLoading] =
    useState(true);
  const [invoiceCountLoading, setInvoiceCountLoading] = useState(true);

  const router = useRouter();

  // Map of API response IDs to readable names for vehicle status data
  const idNameMap: { [key: string]: string } = {
    total_registration: "Total Registration",
    ep: "External Parking",
    shipment: "Shipment(s)",
  };

  // Map of time range IDs to readable names for vehicle wait time data
  const timeRangeIDNameMap: { [key: string]: string } = {
    0: "0-8 Hours",
    8: "8-16 Hours",
    16: "16-24 Hours",
    24: "24-32 Hours",
    32: "32-40 Hours",
    40: "40-48 Hours",
    48: "48-56 Hours",
    56: "56-64 Hours",
  };

  const mapTimeRangeData = (data: any[]) => {
    return data.map((timeRange: any) => ({
      id: timeRange._id,
      name: timeRangeIDNameMap[timeRange._id] || ">64 Hours",
      count: timeRange.count,
      shipments: timeRange.data,
    }));
  };
  const fetchData = async (
    endpoint: string,
    setData: any,
    setLoading: (loading: boolean) => void,
    condition?: string
  ) => {
    setLoading(true);
    try {
      let url = endpoint;
      if (condition) {
        url = `${endpoint}?condition=${condition}`;
      }
      const response = await httpsGet(url, 1, router);

      if (response && response.statusCode === 200) {
        if (endpoint.includes("vehicleStatus")) {
          const vehicleData = Object.keys(response.data).map((key) => ({
            id: key,
            name: idNameMap[key],
            count: response.data[key][0]?.count?.[0],
            shipments: response.data[key][0]?.data?.[0],
          }));
          setData(vehicleData);
        } else if (
          endpoint.includes("timeRange") &&
          !endpoint.includes("shipment")
        ) {
          const timeRangeData = mapTimeRangeData(response.data);
          setData(timeRangeData);
        } else if (endpoint.includes("shipment/timeRange")) {
          const shipmentTimeRange = mapTimeRangeData(response.data);
          setData(shipmentTimeRange);
        } else if (endpoint.includes("invoice/Count")) {
          setData(response.data);
        }
      } else {
        console.error(`Failed to fetch data from ${endpoint}`);
        setData(endpoint.includes("invoice/Count") ? null : []);
      }
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      setData(endpoint.includes("invoice/Count") ? null : []);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostData = async (
    endpoint: string,
    data: any,
    setData: any,
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true);
    try {
      const response = await httpsPost(endpoint, data, router, 1);
      if (response && response.statusCode === 200) {
        setData(response.data);
      } else {
        console.error(`Failed to fetch data from ${endpoint}`);
        setData([]);
      }
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(
      "externalParking/vehicleStatus",
      setVehicleStatusData,
      setVehicleStatusLoading,
      condition
    );
  }, [condition, router]);

  useEffect(() => {
    fetchData(
      "externalParking/timeRange",
      setVehicleWaitTimeData,
      setVehicleWaitTimeLoading
    );
  }, [router]);

  useEffect(() => {
    fetchData(
      "shipment/timeRange",
      setShipmentTimeRangeData,
      setShipmentTimeRangeLoading
    );
  }, [router]);
  useEffect(() => {
    fetchPostData("invoice/Count", {}, setInvoiceCount, setInvoiceCountLoading);
  }, [router]);

  const refreshAllData = useCallback(() => {
    fetchData(
      "externalParking/vehicleStatus",
      setVehicleStatusData,
      setVehicleStatusLoading,
      condition
    );
    fetchData(
      "externalParking/timeRange",
      setVehicleWaitTimeData,
      setVehicleWaitTimeLoading
    );
    fetchData(
      "shipment/timeRange",
      setShipmentTimeRangeData,
      setShipmentTimeRangeLoading
    );
    fetchPostData("invoice/Count", {}, setInvoiceCount, setInvoiceCountLoading);
  }, [condition, fetchData]);

  return {
    vehicleStatusData,
    vehicleWaitTimeData,
    shipmentTimeRangeData,
    invoiceCount,
    condition,
    setCondition,
    fetchVehicleStatusData: () =>
      fetchData(
        "externalParking/vehicleStatus",
        setVehicleStatusData,
        setVehicleStatusLoading,
        condition
      ),
    fetchVehicleWaitTimeData: () =>
      fetchData(
        "externalParking/timeRange",
        setVehicleWaitTimeData,
        setVehicleWaitTimeLoading
      ),
    fetchShipmentTimeRangeData: () =>
      fetchData(
        "shipment/timeRange",
        setShipmentTimeRangeData,
        setShipmentTimeRangeLoading
      ),
    fetchInvoiceCount: () =>
      fetchPostData("invoice/Count", {}, setInvoiceCount, setInvoiceCountLoading),
    vehicleStatusLoading,
    vehicleWaitTimeLoading,
    shipmentTimeRangeLoading,
    invoiceCountLoading,
    refreshAllData,
  };
};

// Main Dashboard Component
const Dashboard = () => {
  const {
    vehicleStatusData,
    vehicleWaitTimeData,
    shipmentTimeRangeData,
    invoiceCount,
    condition,
    setCondition,
    fetchVehicleStatusData,
    fetchVehicleWaitTimeData,
    fetchShipmentTimeRangeData,
    fetchInvoiceCount,
    vehicleStatusLoading,
    vehicleWaitTimeLoading,
    shipmentTimeRangeLoading,
    invoiceCountLoading,
    refreshAllData,
  } = useDashboardData();

  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | null>(
    null
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefreshInterval) {
      intervalId = setInterval(refreshAllData, autoRefreshInterval * 60 * 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefreshInterval, refreshAllData]);

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
  const sliderMarks = [
    { value: 10, label: "10 min" },
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
  ];
  return (
    <div className="dashboard-container">
      <Box
        sx={{
          p: 1,
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", color: "text.primary", mr: 1 }}
          >
            Auto Refresh
          </Typography>
          <Slider
            size="small"
            // defaultValue={null}
            valueLabelDisplay="auto"
            step={null}
            marks={sliderMarks}
            min={10}
            max={30}
            onChange={(_, value) => setAutoRefreshInterval(value as number)}
            sx={{
              width: "200px",
              color: "white",
              "& .MuiSlider-thumb": {
                backgroundColor: "white",
              },
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold", color: "text.primary" }}
          >
            Vehicle Status Dashboard
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CustomSelect
              value={condition}
              onValueChange={setCondition}
              placeholder="Select condition"
              options={conditionOptions}
              //  size="small"
            />
            <Button
              variant="outlined"
              onClick={fetchVehicleStatusData}
              startIcon={<RefreshIcon />}
              disabled={vehicleStatusLoading}
              size="small"
            >
              Refresh
            </Button>
          </Box>
        </Box>
        <Grid container spacing={1}>
          {vehicleStatusLoading ? (
            // Show skeletons while loading
            Array.from({ length: 3 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  className="glassy-card"
                  sx={{
                    height: 70,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.16)",
                  }}
                >
                  <Skeleton variant="text" width={100} height={25} />
                </Card>
              </Grid>
            ))
          ) : vehicleStatusData.length === 0 ? (
            // Show no data message if no data is available
            <Grid item xs={12}>
              <Card
                className="glassy-card"
                sx={{
                  height: 70,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.16)",
                }}
              >
                <Typography variant="subtitle2" color="textSecondary">
                  No vehicle status data available
                </Typography>
              </Card>
            </Grid>
          ) : (
            // Map the vehicle status data
            vehicleStatusData.map((data) => (
              <Grid item xs={12} sm={6} md={4} key={data.id}>
                <Card
                  className="glassy-card"
                  sx={{
                    cursor: "pointer",
                    transition: "box-shadow 0.3s",
                    "&:hover": { boxShadow: 4 },
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.16)",
                  }}
                  onClick={() => handleClick(data.id)}
                >
                  <CardContent sx={{ padding: "10px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        component="div"
                        sx={{
                          textAlign: "center",
                          mb: 0.5,
                        }}
                      >
                        {data.name}
                      </Typography>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: "bold" }}
                      >
                        {data.count}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
        <Divider
          sx={{
            my: 2,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        />
        <TimeRangeSection
          title="Vehicle Wait Time"
          data={vehicleWaitTimeData}
          loading={vehicleWaitTimeLoading}
          onRefresh={fetchVehicleWaitTimeData}
        />
        <Divider
          sx={{
            my: 2,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        />
        <TimeRangeSection
          title="Shipment Time Range"
          data={shipmentTimeRangeData}
          loading={shipmentTimeRangeLoading}
          onRefresh={fetchShipmentTimeRangeData}
        />
        <Divider
          sx={{
            my: 2,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold", color: "text.primary" }}
          >
            Invoice Count
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={fetchInvoiceCount}
              startIcon={<RefreshIcon />}
              disabled={invoiceCountLoading}
              size="small"
            >
              Refresh
            </Button>
          </Box>
        </Box>
        <Grid container spacing={1}>
          {invoiceCountLoading ? (
            <Grid item xs={12}>
              <Card
                className="glassy-card"
                sx={{
                  height: 70,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.16)",
                }}
              >
                <Skeleton variant="text" width={100} height={25} />
              </Card>
            </Grid>
          ) : (
            <Grid item xs={12} sm={6} md={4}>
              <Card
                className="glassy-card"
                sx={{
                  cursor: "pointer",
                  transition: "box-shadow 0.3s",
                  "&:hover": { boxShadow: 4 },
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.16)",
                }}
              >
                <CardContent sx={{ padding: "10px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: "bold" }}
                    >
                      {invoiceCount}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </div>
  );
};

export default Dashboard;
