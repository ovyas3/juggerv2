"use client";

import SideDrawer from "@/components/Drawer/Drawer";
import Header from "@/components/Header/header";
import React, { useEffect, useState } from "react";
import { Card, DatePicker, Select, Table } from "antd";
import "react-datepicker/dist/react-datepicker.css";
import "./page.css";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import truck from "../../assets/truck.png";
import Image from "next/image";
import Tilt from "react-parallax-tilt";
import weightMT from "../../assets/weightMT.svg";
import confirmedOrders from "../../assets/confirmedOrders.svg";
import assignedOrders from "../../assets/orders.svg";
dayjs.extend(customParseFormat);

const IndentWiseDashboard = () => {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(dayjs().subtract(30, "day"));
  const [toDate, setToDate] = useState(dayjs());
  const [cardData, setCardData] = useState([
    { name: "Total Vehicles", icon: truck, count: 0, color: "#66A8FF" },
    { name: "Total Weight (MT)", icon: weightMT, count: 0, color: "#FFB266" },
    {
      name: "Confirmed Orders",
      icon: confirmedOrders,
      count: 0,
      color: "#66CC66",
    },
    {
      name: "Assigned Orders",
      icon: assignedOrders,
      count: 0,
      color: "#4CAF50",
    },
  ]);

  const columnsLocationStatus = [
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      onHeaderCell: () => ({
        style: { background: "#20114d", color: "white" },
      }),
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            Indented
          </div>
          <div
            style={{
              fontWeight: "normal",
              fontSize: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Vehicle count (Weight (MT))
          </div>
        </div>
      ),
      dataIndex: "indented",
      key: "indented",
      onHeaderCell: () => ({
        style: { background: "#20114d", color: "white" },
      }),
    },
    // {
    //   title: (
    //     <div
    //       style={{
    //         fontSize: "12px",
    //         display: "flex",
    //         justifyContent: "center",
    //         flexDirection: "column",
    //       }}
    //     >
    //       <div style={{ display: "flex", justifyContent: "center" }}>
    //         Allocated
    //       </div>
    //       <div
    //         style={{
    //           fontWeight: "normal",
    //           fontSize: "10px",
    //           display: "flex",
    //           justifyContent: "center",
    //         }}
    //       >
    //         Vehicle count (Weight (MT))
    //       </div>
    //     </div>
    //   ),
    //   dataIndex: "allocated",
    //   key: "allocated",
    //   onHeaderCell: () => ({
    //     style: { background: "#20114d", color: "white" },
    //   }),
    // },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            Accepted
          </div>
          <div
            style={{
              fontWeight: "normal",
              fontSize: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Vehicle count (Weight (MT))
          </div>
        </div>
      ),
      dataIndex: "accepted",
      key: "accepted",
      onHeaderCell: () => ({
        style: { background: "#20114d", color: "white" },
      }),
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            Assigned
          </div>
          <div
            style={{
              fontWeight: "normal",
              fontSize: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Vehicle count (Weight (MT))
          </div>
        </div>
      ),
      dataIndex: "assigned",
      key: "assigned",
      onHeaderCell: () => ({
        style: { background: "#20114d", color: "white" },
      }),
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            Reported
          </div>
          <div
            style={{
              fontWeight: "normal",
              fontSize: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Vehicle count (Weight (MT))
          </div>
        </div>
      ),
      dataIndex: "reported",
      key: "reported",
      onHeaderCell: () => ({
        style: { background: "#20114d", color: "white" },
      }),
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            GateIn
          </div>
          <div
            style={{
              fontWeight: "normal",
              fontSize: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Vehicle count (Weight (MT))
          </div>
        </div>
      ),
      dataIndex: "gateIn",
      key: "gateIn",
      onHeaderCell: () => ({
        style: { background: "#20114d", color: "white" },
      }),
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            Loading
          </div>
          <div
            style={{
              fontWeight: "normal",
              fontSize: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Vehicle count (Weight (MT))
          </div>
        </div>
      ),
      dataIndex: "reported",
      key: "reported",
      onHeaderCell: () => ({
        style: { background: "#20114d", color: "white" },
      }),
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            Invoiced
          </div>
          <div
            style={{
              fontWeight: "normal",
              fontSize: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Vehicle count (Weight (MT))
          </div>
        </div>
      ),
      dataIndex: "invoiced",
      key: "invoiced",
      onHeaderCell: () => ({
        style: { background: "#20114d", color: "white" },
      }),
    },
    {
      title: (
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            Dispatched
          </div>
          <div
            style={{
              fontWeight: "normal",
              fontSize: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Vehicle count (Weight (MT))
          </div>
        </div>
      ),
      dataIndex: "dispatched",
      key: "dispatched",
      onHeaderCell: () => ({
        style: { background: "#20114d", color: "white" },
      }),
    },
  ];

  const [statusWiseData, setStatusWiseData] = useState([]);
  const [barChartData, setBarChartData] = useState([
    { name: "Invoiced", value: 0, color: "#4B0082" },
    { name: "Accepted", value: 0, color: "#008000" },
    { name: "Assigned", value: 0, color: "#FF8C00" },
    { name: "Reported", value: 0, color: "#1E3A8A" },
    { name: "Dispatched", value: 0, color: "#4682B4" },
  ]);

  const [selectedShippers, setSelectedShippers] = useState<any>([]);
  const [shipperOptions, setShipperOptions] = useState<any>([]);

  async function getShipperData() {
    try {
      const shippersData = localStorage.getItem('shippers');
      if (shippersData) {
        const shippers = JSON.parse(shippersData);
        const options = shippers.map((shipper: any) => ({
          value: shipper._id,
          label: shipper.name
        }));
        setShipperOptions(options);
      }
    } catch (error) {
      console.error('Error fetching shipper data from localStorage:', error);
    }
  }

  useEffect(() => {
    getShipperData();
  }, []);

  async function getStatusWiseData() {

    const payload = {
      from: fromDate,
      to: toDate,
      ...(selectedShippers.length > 0 && { shipperId: selectedShippers })
    };
    
    const response = await httpsPost(
      "cr/security/order_shipment",
      payload,
      router,
      3
    );

    if (response.statusCode === 200) {
      let dataArr: any = [];
      let barChartArr: any = [];
      let totals = {
        key: "Total",
        location: "Total",
        
        indented:0,
        indentedWeight: 0,
        // allocated: 0,
        // allocatedWeight: 0,
        accepted: 0,
        acceptedWeight: 0,
        assigned: 0,
        assignedWeight: 0,
        reported: 0,
        reportedWeight: 0,
        gateIn: 0,
        gateInWeight: 0,
        loading: 0,
        loadingWeight: 0,
        invoiced: 0,
        invoicedWeight: 0,
        dispatched: 0,
        dispatchedWeight: 0,
      };

      response?.data.forEach((val: any, index: any) => {
        dataArr.push({
          key: index + 1,
          location: val.location_name,
          shipper: val._id,
          indented: `${val.indented} (${
            val.indented_weight ? val.indented_weight.toFixed(3) : 0
          })`,
          // allocated: `${val.allocated} (${
          //   val.allocated_weight ? val.allocated_weight.toFixed(3) : 0
          // })`,
          accepted: `${val.accepted} (${
            val.accepted_weight ? val.accepted_weight.toFixed(3) : 0
          })`,
          assigned: `${val.assigned} (${
            val.assigned_weight ? val.assigned_weight.toFixed(2) : 0
          })`,
          reported: `${val.reported} (${
            val.reported_weight ? val.reported_weight.toFixed(2) : 0
          })`,
          gateIn: `${val.GI} (${
            val.GI_weight ? val.GI_weight.toFixed(2) : 0
          })`,
          loading: `${val.LI} (${
            val.LI_weight ? val.LI_weight.toFixed(2) : 0
          })`,
          invoiced: `${val.LO} (${
            val.LO_weight ? val.LO_weight.toFixed(3) : 0
          })`,
          dispatched: `${val.GO} (${
            val.GO_weight ? val.GO_weight.toFixed(2) : 0
          })`,
        });

        barChartArr.push({
          location: val.location_name,
          Vehicles: val.allocated,
          Weight: val.allocated_weight,
        });

        
        totals.indented += val.indented;
        totals.indentedWeight += val.indented_weight;
        // totals.allocated += val.allocated;
        // totals.allocatedWeight += val.allocated_weight;
        totals.accepted += val.accepted;
        totals.acceptedWeight += val.accepted_weight;
        totals.assigned += val.assigned;
        totals.assignedWeight += val.assigned_weight;
        totals.reported += val.reported;
        totals.reportedWeight += val.reported_weight;
        totals.gateIn += val.GI;
        totals.gateInWeight += val.GI_weight;
        totals.loading += val.LI;
        totals.loadingWeight += val.LI_weight;
        totals.invoiced += val.LO;
        totals.invoicedWeight += val.LO_weight;
        totals.dispatched += val.GO;
        totals.dispatchedWeight += val.GO_weight;
      });

      dataArr.push({
        key: totals.key,
        location: totals.location,
        
        indented: `${totals.indented} (${
          totals.indentedWeight ? totals.indentedWeight.toFixed(3) : 0
        })`,
        // allocated: `${totals.allocated} (${
        //   totals.allocatedWeight ? totals.allocatedWeight.toFixed(3) : 0
        // })`,
        accepted: `${totals.accepted} (${
          totals.acceptedWeight ? totals.acceptedWeight.toFixed(3) : 0
        })`,
        assigned: `${totals.assigned} (${
          totals.assignedWeight ? totals.assignedWeight.toFixed(3) : 0
        })`,
        reported: `${totals.reported} (${
          totals.reportedWeight ? totals.reportedWeight.toFixed(3) : 0
        })`,
        gateIn: `${totals.gateIn} (${
          totals.gateInWeight ? totals.gateInWeight.toFixed(3) : 0
        })`,
        loading: `${totals.loading} (${
          totals.loadingWeight ? totals.loadingWeight.toFixed(3) : 0
        })`,
        invoiced: `${totals.invoiced} (${
          totals.invoicedWeight ? totals.invoicedWeight.toFixed(3) : 0
        })`,
        dispatched: `${totals.dispatched} (${
          totals.dispatchedWeight ? totals.dispatchedWeight.toFixed(3) : 0
        })`,
      });
      console.log(dataArr);
      setStatusWiseData(dataArr);
      setBarChartData(barChartArr);
    }
  }

  async function getStats() {
  const payload = {
      from: fromDate,
      to: toDate,
      is_all_unit: true,
    };
    const response = await httpsPost(
      "stats/cr/order_details_ct",
      payload,
      router,
      3
    );
    if (response.statusCode === 200) {
      const statsData = response.data;
      setCardData(
        (prevState: any) =>
          prevState?.map((val: any, index: number) => {
            switch (index) {
              case 0:
                return {
                  ...val,
                  count: statsData.totalVehiclesRequested || "-",
                };
              case 1:
                return {
                  ...val,
                  count: statsData.totalWeight?.toFixed(3) || "-",
                };
              case 2:
                return { ...val, count: statsData.totalOrders || "-" };
              case 3:
                return { ...val, count: statsData.totalVehicleAssigned || "-" };
              default:
                return val;
            }
          }) || []
      );
    }
  }

  useEffect(() => {
    if (fromDate) {
      getStatusWiseData();
      getStats();
    }
  }, [fromDate, toDate, selectedShippers]);

  return (
    <div>
      <Header />
      <SideDrawer />
      <div
        className="plant-indent"
      >
        <div
          id="filters"
          className="filters"
        >
          <div  className="filter-container">
            <div>
              <div className="label">From</div>
              <div
               className="date-picker"
              >
                <DatePicker
                  showTime
                  value={fromDate}
                  onChange={(date) => setFromDate(date)}
                />
              </div>
            </div>
            <div>
              <div className="label">To</div>
              <div
               className="date-picker"
              >
                <DatePicker
                  showTime
                  value={toDate}
                  onChange={(date) => setToDate(date)}
                />
              </div>
            </div>
            <div>
              <div className="label">Select Unit</div>
              <div className="unit">
              <Select
                    mode="multiple"
                    style={{ width: '100%'}}
                    placeholder="Select Unit"
                    options={shipperOptions}
                    value={selectedShippers}
                    maxTagCount={1} 
                    maxTagTextLength={20}
                    optionRender={(option: any) => (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedShippers.includes(option.value)}
                          onChange={() => {}}
                          style={{ marginRight: 8 }}
                        />
                        
                        <span style={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {option.label}
                      </span>
                      </div>
                    )}
                    onChange={(selectedValues) => {
                      setSelectedShippers(selectedValues);
                    }}
                  />
              </div>
            </div>
          </div>
        </div>

        <div
          className="stats"
        >
          {cardData.map((val, index) => (
            <Tilt
              key={index}
              glareEnable={true}
              glareMaxOpacity={0.3}
              glareColor="#ffffff"
              glarePosition="bottom"
              glareBorderRadius="20px"
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              perspective={1000}
              transitionSpeed={1000}
              style={{ width: "20%" }}
            >
              <Card
                style={{
                 background: val.color,
                }}
                key={index}
                className="card"
              >
                <div className="card-content">
                  <div className="shine"></div>
                  <div
                    className="card-img"
                  >
                    <Image src={val.icon} alt="" height={28} width={28} />
                  </div>
                  <div
                    className="card-data"
                  >
                    <span className="name">{val.name}</span>
                    <div
                      className="count"
                    >
                      {val.count}
                    </div>
                  </div>
                </div>
              </Card>
            </Tilt>
          ))}
        </div>

        <div
         className="table-wrapper"
        >
          <Card
            className="card"
          >
            <div
             className="header"
            >
              <span className="title">
                Location Status Overview
              </span>
              {/* <Button icon={<DownloadOutlined />}>Export</Button> */}
            </div>
            <div
              className="table-container"
            >
              <Table
                columns={columnsLocationStatus.map((col, colIndex) => ({
                  ...col,
                  align: "center",
                  className: colIndex === 0 ? "bold-col" : "",
                }))}
                dataSource={statusWiseData}
                style={{ width: "90vw", color: "#6B7280" }}
                rowClassName={(_, index) =>
                  index === statusWiseData.length - 1
                    ? "bold-row fixed-row"
                    : "clickable-row"
                }
                pagination={false}
                sticky
                // onRow={(record: any) => ({
                //   onClick: () => {
                //     router.push(
                //       // `/plantIndentDashboard/plant?shipper=${record?.shipper}`,
                //       '/indentManagement/plant',
                //     );
                //   },
                // })}

                onRow={(record: any) => ({
                  onClick: () => {
                    localStorage.setItem('plantPageData', JSON.stringify(record));
                    router.push('/indentManagement/plant');
                  },
                })}
              />
            </div>
          </Card>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            padding: "0 64px",
            marginTop: "16px",
            paddingBottom: "80px",
          }}
        >
          <div style={{ width: "100%" }}>
            <LocationLoadingChart dataSource={barChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

const LocationLoadingChart = ({ dataSource }: any) => {
  return (
    <Card
      title={
        <Title
          level={4}
          style={{ margin: 0, fontWeight: 500, fontSize: "18px" }}
        >
          Location-wise Loading
        </Title>
      }
      extra={
        <div style={{ display: "flex", gap: "8px" }}>
          {/* <Button icon={<ExpandOutlined />} />
          <Button icon={<DownloadOutlined />}>Export</Button> */}
        </div>
      }
      style={{ borderRadius: 12, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}
    >
      <ResponsiveContainer width="100%" height={600}>
        <BarChart
          data={dataSource}
          barSize={40}
          margin={{ bottom: 200, left: 50, right: 50 }}
        >
          <XAxis
            dataKey="location"
            interval={0}
            angle={dataSource.length > 10 ? -30 : 0}
            textAnchor="end"
            tick={{ fontSize: 12 }}
            dy={20}
            style={{ paddingBottom: "100px" }}
            tickMargin={30}
          />
          <YAxis
            yAxisId="left"
            label={{ value: "Vehicles", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: "Weight (MT)",
              angle: -90,
              position: "insideRight",
            }}
          />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="Vehicles"
            fill="#3b6cd4"
            name="Vehicles"
          />
          <Bar
            yAxisId="right"
            dataKey="Weight"
            fill="#71b361"
            name="Weight (MT)"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default IndentWiseDashboard;
