"use client";
import React, { useEffect, useState, useRef } from "react";
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
import { httpsGet } from "@/utils/Communication";
import PopUpForDcCharges from "./PopUpDcCharge";

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
          Total Freight (in Lakh &#8377;): <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

function DcCharges() {
  // yearly chart parameters
  const [yearlyData, setYearlyData] = useState<any>(null);
  const [yAxisDomain, setYAxisDomain] = useState<number[]>([0, 100]);
  const [yAxisTicks, setYAxisTicks] = useState<number[]>([
    0, 20, 40, 60, 80, 100,
  ]);

  // selection parameters
  const [selectedBarYear, setSelectedBarYear] = useState<any>(null);
  const [selectedBarMonth, setSelectedBarMonth] = useState<any>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [payloadDataForPopup, setPayloadDataForPopup] = useState<any>(null);

  // monthly chart parameters
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [monthlyYAxisDomain, setMonthlyYAxisDomain] = useState<number[]>([
    0, 100,
  ]);
  const [monthlyYAxisTicks, setMonthlyYAxisTicks] = useState<number[]>([
    0, 20, 40, 60, 80, 100,
  ]);

  // days chart parameters
  const [daysChart, setDaysChart] = useState<any>(null);
  const [daysYAxisDomain, setDaysYAxisDomain] = useState<number[]>([0, 100]);
  const [daysYAxisTicks, setDaysYAxisTicks] = useState<number[]>([
    0, 20, 40, 60, 80, 100,
  ]);

  const processChartData = (data: any[]) => {
    const normalizedData = data.map((item) => ({
      ...item,
      totalFreightSum: Math.floor((item.totalFreightSum / 1e5) * 100) / 100,
    }));
    const sortedData = normalizedData.sort((a, b) => a._id - b._id);
    const maxFreight = Math.max(...sortedData.map((d) => d.totalFreightSum));
    const adjustedMaxFreight = maxFreight;
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
      totalDCPaid: Math.floor((item.totalDCPaid / 1e5) * 100) / 100,
    }));
    console.log(normalizedData);
    const sortedData = normalizedData.sort(
      (a, b) => monthMap[a._id] - monthMap[b._id]
    );
    const maxFreight = Math.max(...sortedData.map((d) => d.totalDCPaid));
    const adjustedMaxFreight = maxFreight;
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
      totalDCPaid: Math.floor((item.totalDCPaid / 1e5) * 100) / 100,
    }));
    const sortedData = normalizedData.sort((a, b) => a._id - b._id);
    const maxFreight = Math.max(...sortedData.map((d) => d.totalDCPaid));
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

  const getYearlyData = async () => {
    try {
      const response = await httpsGet(`dashboard/dcYearly`, 0, null);
      if (response.statusCode === 200) {
        const processedData = processChartData(response.data);
        setYearlyData(processedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMonthlyChartData = async () => {
    try {
      const response = await httpsGet(
        `dashboard/dcMonthly?year=${selectedBarYear}`,
        0,
        null
      );
      if (response.statusCode === 200) {
        const processedData = processMonthlyChartData(response.data);
        setMonthlyData(processedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDaysChartData = async () => {
    try {
      const response = await httpsGet(
        `dashboard/dcDateWise?year=${selectedBarYear}&month=${
          monthMap[selectedBarMonth] + 1
        }`,
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

  const handleBarClick = (e: any) => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBarClickSecond = (e: any) => {
    if (secondRef.current) {
      secondRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openPopUpForDetails = (event: any) => {
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
      amt: event?.activePayload[0]?.payload?.totalDCPaid,
    });
  };

  useEffect(() => {
    getYearlyData();
  }, []);

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

  return (
    <div
      className="rake-charges"
      style={{
        width: "100%",
        height: "165vh",
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
        DC Charges
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
            data={yearlyData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            onClick={(e) => {
              setSelectedBarMonth(null);
              setSelectedBarYear(e.activeLabel);
              handleBarClickSecond(e);
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
                value: `Total DC Charges (Lakh ₹)`,
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
              fill="#0066CC"
              name={"Years"}
              fontSize={"12px"}
              barSize={100}
              activeBar={
                <Rectangle fill="#0066CC" stroke="#0066CC" opacity={0.8} />
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

      {selectedBarYear && monthlyData?.length > 0 && (
        <div ref={secondRef}>
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
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                onClick={(e) => {
                  setSelectedBarMonth(e.activeLabel);
                  handleBarClick(e);
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
                    value: `Total DC Charges (Lakh ₹)`,
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
                  dataKey="totalDCPaid"
                  fill="#CA6C0F"
                  name={"Months"}
                  fontSize={"12px"}
                  barSize={100}
                  activeBar={
                    <Rectangle fill="#CA6C0F" stroke="#CA6C0F" opacity={0.8} />
                  }
                >
                  <LabelList
                    dataKey="totalDCPaid"
                    position="top"
                    style={{ fontSize: "12px", fill: "#666" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
      {selectedBarYear && selectedBarMonth && daysChart?.length > 0 && (
        <div >
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
                    value: `Total Freight (Lakh ₹)`,
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
                  dataKey="totalDCPaid"
                  fill="#876FD4"
                  name={"Days"}
                  fontSize={"12px"}
                  barSize={100}
                  activeBar={
                    <Rectangle fill="#876FD4" stroke="#876FD4" opacity={0.8} />
                  }
                >
                  <LabelList
                    dataKey="totalDCPaid"
                    position="top"
                    style={{ fontSize: "12px", fill: "#666" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      </div>
      <div ref={targetRef}></div>

      {openPopup && (
        <PopUpForDcCharges
          setOpenPopup={setOpenPopup}
          payloadDataForPopup={payloadDataForPopup}
        />
      )}
      
    </div>
  );
}

export default DcCharges;
