"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { httpsGet } from "@/utils/Communication";
import PopUpForRakeCharges from "./PopUpForRakeCharges";

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
  Dec: 11,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          fontSize: "12px",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <p>
          Year: <strong>{label}</strong>
        </p>
        <p>
          Total Freight (in Cr &#8377;): <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const RakeCharges = () => {
  const [yearlyChart, setYearlyChart] = useState<any>(null);
  const [monthlyChart, setMonthlyChart] = useState<any>(null);
  const [daysChart, setDaysChart] = useState<any>(null);

  const [yAxisDomain, setYAxisDomain] = useState<number[]>([0, 100]);
  const [yAxisTicks, setYAxisTicks] = useState<number[]>([
    0, 20, 40, 60, 80, 100,
  ]);

  const [monthlyYAxisDomain, setMonthlyYAxisDomain] = useState<number[]>([
    0, 100,
  ]);
  const [monthlyYAxisTicks, setMonthlyYAxisTicks] = useState<number[]>([
    0, 20, 40, 60, 80, 100,
  ]);

  const [daysYAxisDomain, setDaysYAxisDomain] = useState<number[]>([0, 100]);
  const [daysYAxisTicks, setDaysYAxisTicks] = useState<number[]>([
    0, 20, 40, 60, 80, 100,
  ]);

  const [selectedBarYear, setSelectedBarYear] = useState<any>(null);
  const [selectedBarMonth, setSelectedBarMonth] = useState<any>(null);

  const [openPopup, setOpenPopup] = useState(false);
  const [payloadDataForPopup, setPayloadDataForPopup] = useState<any>(null);

  const processChartData = (data: any[]) => {
    const normalizedData = data.map((item) => ({
      ...item,
      totalFreightSum: parseFloat((item.totalFreightSum / 1e7).toFixed(2)),
    }));
    const sortedData = normalizedData.sort((a, b) => a._id - b._id);
    const maxFreight = Math.max(...sortedData.map((d) => d.totalFreightSum));
    const adjustedMaxFreight = maxFreight + 250;
    const newDomain = [0, Math.ceil(adjustedMaxFreight)];
    const tickInterval = Math.ceil(adjustedMaxFreight / 7);
    const newTicks = Array.from(
      { length: Math.ceil(adjustedMaxFreight / tickInterval) + 1 },
      (_, i) => parseFloat(((i * tickInterval) / 1).toFixed(2))
    );
    setYAxisDomain(newDomain);
    setYAxisTicks(newTicks);
    return sortedData;
  };

    const processMonthlyChartData = (data: any[]) => {
      const normalizedData = data.map((item) => ({
        ...item,
        totalFreightSum: parseFloat((item.totalFreightSum / 1e7).toFixed(2)),
      }));
      console.log(normalizedData);
      const sortedData = normalizedData.sort((a, b) => monthMap[a._id] - monthMap[b._id]);
      const maxFreight = Math.max(...sortedData.map((d) => d.totalFreightSum));
      const adjustedMaxFreight = maxFreight + 100;
      const newDomain = [0, Math.ceil(adjustedMaxFreight)];
      const tickInterval = Math.ceil(adjustedMaxFreight / 7);
      const newTicks = Array.from(
        { length: Math.ceil(adjustedMaxFreight / tickInterval) + 1 },
        (_, i) => parseFloat(((i * tickInterval) / 1).toFixed(2))
      );
      setMonthlyYAxisDomain(newDomain);
      setMonthlyYAxisTicks(newTicks);
      return sortedData;
    };

  const processDayChartData = (data: any[]) => {
    const normalizedData = data.map((item) => ({
      ...item,
      totalFreightSum: parseFloat((item.totalFreightSum / 1e7).toFixed(2)),
    }));
    const sortedData = normalizedData.sort((a, b) => a._id - b._id);
    const maxFreight = Math.max(...sortedData.map((d) => d.totalFreightSum));
    const adjustedMaxFreight = maxFreight + 1;
    const newDomain = [0, Math.ceil(adjustedMaxFreight)];
    const tickInterval = Math.ceil(adjustedMaxFreight / 7);
    const newTicks = Array.from(
      { length: Math.ceil(adjustedMaxFreight / tickInterval) + 1 },
      (_, i) => parseFloat(((i * tickInterval) / 1).toFixed(2))
    );
    setDaysYAxisDomain(newDomain);
    setDaysYAxisTicks(newTicks);
    return sortedData;
  };

  const getChartData = async () => {
    try {
      const response = await httpsGet("dashboard/rakeChargesYearly", 0, null);
      if (response.statusCode === 200) {
        const processedData = processChartData(response.data);
        setYearlyChart(processedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMonthlyChartData = async () => {
    try {
      const response = await httpsGet(
        `dashboard/rakeChargesMonthly?year=${selectedBarYear}`,
        0,
        null
      );
      if (response.statusCode === 200) {
        const processedData = processMonthlyChartData(response.data);
        setMonthlyChart(processedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDaysChartData = async () => {
    try {
      const response = await httpsGet(
        `dashboard/rakeChargeDateWise?year=${selectedBarYear}&month=${monthMap[selectedBarMonth]}`,
        0,
        null
      );
      if (response.statusCode === 200) {
        const processedData = processDayChartData(response.data);
        setDaysChart(processedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openPopUpForDetails = (event: any) => {
    console.log(event);
    const date = new Date(event.activeLabel);
    const from = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0
    );
    const to = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    );
    setOpenPopup(true);
    setPayloadDataForPopup({
      from: from,
      to: to,
      amt: event?.activePayload[0]?.payload?.totalFreightSum,
    });
  };

  useEffect(() => {
    if (selectedBarYear) {
      getMonthlyChartData();
    }
  }, [selectedBarYear]);

  useEffect(() => {
    if (selectedBarMonth) {
      getDaysChartData();
    }
  }, [selectedBarMonth]);

  useEffect(() => {
    getChartData();
  }, []);

  return (
    <div
      className="rake-charges"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <header
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          marginTop: "20px",
          marginBottom: "10px",
        }}
      >
        Rake Charges
      </header>

      <div
        style={{
          width: "100%",
          height: "400px",
          boxShadow:
            "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
          paddingTop: "24px",
          paddingBottom: "10px",
          marginBottom: "30px",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={yearlyChart}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            onClick={(e) => {
              setSelectedBarMonth(null);
              setSelectedBarYear(e.activeLabel);
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="_id"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: "12px",
                fill: "#666",
              }}
              label={{
                position: "insideBottom",
                offset: -5,
                style: { fontSize: "12px" },
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickCount={7}
              domain={yAxisDomain}
              ticks={yAxisTicks}
              label={{
                value: `Total Freight (Cr ₹)`,
                angle: -90,
                position: "insideLeft",
                textAnchor: "middle",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#666",
                },
              }}
              tick={{
                fontSize: "10px",
                fill: "#666",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                fontSize: "12px",
                color: "#666",
              }}
            />
            <Bar
              dataKey="totalFreightSum"
              fill="#8884d8"
              name={"Years"}
              fontSize={"12px"}
              barSize={100}
              activeBar={
                <Rectangle fill="#8884d8" stroke="#8884d8" opacity={0.8} />
              }
            >
              <LabelList
                dataKey="totalFreightSum"
                position="top"
                style={{ fontSize: "12px", fill: "#666" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selectedBarYear && (
        <div>
          <header style={{ fontSize: "16px", fontWeight: "bold" }}>
            For Year {selectedBarYear} :
          </header>
          <div
            style={{
              width: "100%",
              height: "400px",
              boxShadow:
                "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
              paddingTop: "24px",
              paddingBottom: "10px",
              marginTop: "10px",
              marginBottom: "30px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyChart}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                onClick={(e) => {
                  setSelectedBarMonth(e.activeLabel);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="_id"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: "12px",
                    fill: "#666",
                  }}
                  label={{
                    position: "insideBottom",
                    offset: -5,
                    style: { fontSize: "12px" },
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickCount={7}
                  domain={monthlyYAxisDomain}
                  ticks={monthlyYAxisTicks}
                  label={{
                    value: `Total Freight (Cr ₹)`,                
                    angle: -90,
                    position: "insideLeft",
                    textAnchor: "middle",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#666",
                    },
                  }}
                  tick={{
                    fontSize: "10px",
                    fill: "#666",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    color: "#666",
                  }}
                />
                <Bar
                  dataKey="totalFreightSum"
                  fill="#A7D477"
                  name={"Months"}
                  fontSize={"12px"}
                  barSize={100}
                  activeBar={
                    <Rectangle fill="#A7D477" stroke="#A7D477" opacity={0.8} />
                  }
                >
                  <LabelList
                    dataKey="totalFreightSum"
                    position="top"
                    style={{ fontSize: "12px", fill: "#666" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedBarMonth && daysChart?.length > 0 && (
        <div>
          <header style={{ fontSize: "16px", fontWeight: "bold" }}>
            For Year {selectedBarYear} ({selectedBarMonth}) :
          </header>
          <div
            style={{
              width: "100%",
              height: "400px",
              boxShadow:
                "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
              paddingTop: "24px",
              paddingBottom: "10px",
              marginTop: "10px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={daysChart}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                onClick={(e) => {
                  openPopUpForDetails(e);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="_id"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: "12px",
                    fill: "#666",
                  }}
                  label={{
                    position: "insideBottom",
                    offset: -5,
                    style: { fontSize: "12px" },
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickCount={7}
                  domain={daysYAxisDomain}
                  ticks={daysYAxisTicks}
                  label={{
                    value: `Total Freight (Cr ₹)`,                
                    angle: -90,
                    position: "insideLeft",
                    textAnchor: "middle",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#666",
                    },
                  }}
                  tick={{
                    fontSize: "10px",
                    fill: "#666",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    color: "#666",
                  }}
                />
                <Bar
                  dataKey="totalFreightSum"
                  fill="#D9ABAB"
                  name={"Days"}
                  fontSize={"12px"}
                  barSize={100}
                  activeBar={
                    <Rectangle fill="#D9ABAB" stroke="#D9ABAB" opacity={0.8} />
                  }
                >
                  <LabelList
                    dataKey="totalFreightSum"
                    position="top"
                    style={{ fontSize: "12px", fill: "#666" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {openPopup && (
        <PopUpForRakeCharges
          setOpenPopup={setOpenPopup}
          payloadDataForPopup={payloadDataForPopup}
        />
      )}
    </div>
  );
};

export default RakeCharges;
