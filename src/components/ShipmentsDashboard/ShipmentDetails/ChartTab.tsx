// components/ShipmentsDashboard/ShipmentDetails/ChartTab.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
} from "@mui/material";
import ReactECharts from "echarts-for-react"; // Assuming you use a wrapper like this
import { httpsGet } from "@/utils/Communication";
import { format } from "date-fns";
import { useSnackbar } from "@/hooks/snackBar";

interface ChartDataPoint {
  timestamp: string | number;
  value: number;
}

interface DoorStatus {
  reardoor: string | number;
}

interface ChartTabProps {
  shipmentData: any;
}

const ChartTab: React.FC<ChartTabProps> = ({ shipmentData }) => {
  const [chartTemperatureData, setChartTemperatureData] = useState<
    ChartDataPoint[]
  >([]);
  const [chartWeightData, setChartWeightData] = useState<ChartDataPoint[]>([]);
  const [chartDoorData, setChartDoorData] = useState<DoorStatus[]>([]);
  const [shipmentPoints, setShipmentPoints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showMessage } = useSnackbar();

  const shipmentId = shipmentData?._id;
  const uom = shipmentData?.uom || "MT"; // Assuming MT or a derived default

  // Helper to format timestamps for display
  const formatTime = (timestamp: string | number) => {
    try {
      return format(new Date(timestamp), "dd-MMM-yyyy hh:mm a");
    } catch (e) {
      return "N/A";
    }
  };

  // --- Data Fetching Logic ---
  useEffect(() => {
    if (!shipmentId) return;

    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        // This simulates the call to the endpoint 'v2/shipment/twd'
        const response = await httpsGet(
          `shipment/twd?shipment=${shipmentId}`,
          8
        );
        const data = response.data || {};

        const rawTemperature = (data.temperature || []).flatMap(
          (e: any) => e.temperature || []
        );
        const rawWeight = (data.weight || []).flatMap(
          (e: any) => e.weight || []
        );

        // Process Temperature Data
        const tempPoints = rawTemperature.map((e: any) => ({
          timestamp: formatTime(e.timestamp),
          value: parseFloat(parseFloat(e.value).toFixed(2)),
        }));
        setChartTemperatureData(tempPoints);

        // Process Weight Data
        const weightPoints = rawWeight.map((e: any) => ({
          timestamp: formatTime(e.timestamp),
          value: parseFloat(parseFloat(e.value).toFixed(2)),
        }));
        setChartWeightData(weightPoints);

        // Process Door Data (Assuming structure similar to Angular's chartDoorData)
        setChartDoorData(data.doorStatus || []);

        // Process Shipment Points (For mark points on the Echarts graph)
        const generateShipmentPoints = (chartData: ChartDataPoint[]) => {
          // This complex logic requires recreating the Angular component's timeline correlation,
          // which is best done server-side or in a utility function. For simplicity,
          // we'll leave it as a mock structure derived from the chart data timestamps for now.
          return chartData.slice(0, 2).map((point, i) => ({
            name: i === 0 ? "P1" : "D1",
            xAxis: point.timestamp,
            yAxis: point.value,
            symbol: "pin",
            label: { show: true },
          }));
        };

        // We use temperature data to determine points if available
        if (tempPoints.length) {
          setShipmentPoints(generateShipmentPoints(tempPoints));
        }
      } catch (error: any) {
        showMessage(error.message || "Failed to fetch chart data.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [shipmentId]);

  // --- Echarts Options ---

  // 1. Temperature Graph Options
  const temperatureGraphOptions = useMemo(() => {
    if (!chartTemperatureData.length) return {};

    const xData = chartTemperatureData.map((p) => p.timestamp);
    const yData = chartTemperatureData.map((p) => p.value);

    return {
      title: { text: shipmentData?.temperature_graph || "" },
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const p = params[0];
          return `${p.data.timestamp} - ${p.data.value.toFixed(2)} °C`;
        },
      },
      xAxis: { type: "category", data: xData },
      yAxis: {
        type: "value",
        name: "Temperature (°C)",
        axisLabel: { formatter: "{value} °C" },
      },
      dataZoom: [{ start: 0, end: 100 }],
      series: [
        {
          name: "Temperature",
          type: "line",
          showSymbol: false,
          data: yData.map((v, i) => ({ value: v, timestamp: xData[i] })),
          markPoint: { data: shipmentPoints },
          lineStyle: { color: "#2962FF" },
        },
      ],
    };
  }, [chartTemperatureData, shipmentPoints, shipmentData]);

  // 2. Weight Graph Options
  const weightGraphOptions = useMemo(() => {
    if (!chartWeightData.length) return {};

    const xData = chartWeightData.map((p) => p.timestamp);
    const yData = chartWeightData.map((p) => p.value);

    return {
      title: { text: shipmentData?.weight_graph || "Weight Graph" },
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const p = params[0];
          return `${p.data.timestamp} - ${p.data.value.toFixed(2)} ${uom}`;
        },
      },
      xAxis: { type: "category", data: xData },
      yAxis: {
        type: "value",
        name: `Weight (${uom})`,
        axisLabel: { formatter: `{value} ${uom}` },
      },
      dataZoom: [{ start: 0, end: 100 }],
      series: [
        {
          name: "Weight",
          type: "line",
          showSymbol: false,
          data: yData.map((v, i) => ({ value: v, timestamp: xData[i] })),
          markPoint: { data: shipmentPoints },
          lineStyle: { color: "#00C853" },
        },
      ],
    };
  }, [chartWeightData, shipmentPoints, shipmentData, uom]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasChartData =
    chartTemperatureData.length > 0 || chartWeightData.length > 0;

  return (
    <Box className="body-section">
      <Box sx={{ p: 2 }}>
        {/* Graph Headings */}
        <Box className="graph_heading" sx={{ display: "flex", gap: 4, mb: 2 }}>
          {chartTemperatureData.length > 0 && (
            <Typography
              variant="subtitle1"
              className="temp_graph"
              style={{
                fontWeight: "bold",
                color: "#09337e",
                fontSize: "1.1rem",
              }}
            >
              {/* This should be translated, mock translation used */}
              Temperature Graph
            </Typography>
          )}
          {chartWeightData.length > 0 && (
            <Typography variant="subtitle1" className="weight_graph">
              {/* This should be translated, mock translation used */}
              Weight Graph
            </Typography>
          )}
        </Box>

        {/* Graphs and Details */}
        <Box
          className="temp_weight_graph"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* Temperature Graph */}
          {chartTemperatureData.length > 0 && (
            <Box sx={{ flex: 1 }}>
              <ReactECharts
                option={temperatureGraphOptions}
                style={{ height: 300 }}
                className="demo-chart"
              />
              <Box className="temp-details" sx={{ mt: 1 }}>
                <List dense disablePadding>
                  {shipmentPoints
                    .filter((p) => p.yAxis)
                    .map((shipment: any, i) => (
                      <ListItem key={i} disablePadding>
                        <Typography variant="body2" className="item">
                          {shipment.name}: {shipment.yAxis} °C
                        </Typography>
                      </ListItem>
                    ))}
                </List>
              </Box>
            </Box>
          )}

          {/* Weight Graph */}
          {chartWeightData.length > 0 && (
            <Box sx={{ flex: 1 }}>
              <ReactECharts
                option={weightGraphOptions}
                style={{ height: 300 }}
                className="demo-chart1"
              />
              <Box className="temp-details" sx={{ mt: 1 }}>
                <List dense disablePadding>
                  {shipmentPoints
                    .filter((p) => p.yAxis)
                    .map((shipment: any, i) => (
                      <ListItem key={i} disablePadding>
                        <Typography variant="body2" className="item">
                          {shipment.name}: {shipment.yAxis} {uom}
                        </Typography>
                      </ListItem>
                    ))}
                </List>
              </Box>
            </Box>
          )}

          {/* No Data Template */}
          {!hasChartData && (
            <Box
              className="nodata"
              sx={{ p: 4, textAlign: "center", width: "100%" }}
            >
              <Typography color="text.secondary">
                {/* This should be translated, mock translation used */}
                No Temperature data found.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Rear Door Open Events */}
        {chartDoorData.length > 0 && (
          <Box
            className="rear_door_open"
            sx={{ mt: 4, borderTop: "1px solid #ccc", pt: 2 }}
          >
            <Typography
              variant="subtitle1"
              className="title"
              sx={{ fontWeight: "bold", mb: 1 }}
            >
              {/* This should be translated, mock translation used */}
              Rear Door Open
            </Typography>
            <Box
              className="multi-steps"
              sx={{ display: "flex", overflowX: "auto", py: 1 }}
            >
              {chartDoorData.map((item: any, i) => (
                <Box
                  key={i}
                  className="steps"
                  sx={{
                    flexShrink: 0,
                    mr: 3,
                    p: 1,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    fontSize: "0.85rem",
                  }}
                >
                  {formatTime(item.reardoor)}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChartTab;
