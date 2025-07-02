"use client";

import SideDrawer from "@/components/Drawer/Drawer";
import Header from "@/components/Header/header";
import { httpsGet, } from "@/utils/Communication";
import { Breadcrumb, Card, DatePicker, Spin } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import ProgressTimeline from '../ProgressTimeline';
import { Pagination } from "antd";

const Plant = () => {

  const [fromDate, setFromDate] = useState(dayjs().subtract(30, "day"));
  const [toDate, setToDate] = useState(dayjs());
  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [dataSource, setDataSource] = useState<any>({ data: [], totalVehicleCount: 0, totalWeight: 0 });
  const [shipperName, setShipperName] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [infoItems, setInfoItems] = useState<any>([]);
  const [shipper, setShipper] = useState<any>("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");

  function handlePagination(page: any, page_size: any) {
    setLimit(page_size);
    setSkip((page - 1) * page_size);
  }

  useEffect(() => {
    const plantPageData = localStorage.getItem("plantPageData");
    const parentName = localStorage.getItem("parent");
    if (plantPageData) {
      const data = JSON.parse(plantPageData);
      setShipper(data.shipper);
      setLocation(data.location);
    }
    if(parentName){
      setShipperName(parentName.replace(/['"]+/g, ''));
    }
  }, []);

  useEffect(() => {
     if (shipper) getDetails();
  }, [limit, skip, fromDate, toDate, shipper]);


  const router = useRouter();

  async function getDetails() {
    if (!shipper) return;
    setLoading(true);
    try{
        const response = await httpsGet(
            `cr/stats/order_details?from=${fromDate}&to=${toDate}&limit=${limit}&skip=${skip}&_id=${shipper}`,
            3,
            router
        );
        
        if (response.statusCode === 200) {
          const { total, totalVehicleCount, totalWeight } = response.data;
          let dataArr: any = [];
          response.data.orders.map((val: any, index: any) => {
            dataArr.push({
              key: index + 1,
              weight: val.total_weight || 0,
              vehicleCount: val.total_vehicle_count || "-",
              transporter: val.carrier_name || "-",
              oin: val.OIN,
              sin: val.SIN.join(', '),
              stats: val.stats
            });
          });
    
          setDataSource({
            data: dataArr,
            totalVehicleCount,
            totalWeight
          });
          setTotalRecords(totalVehicleCount);
          setInfoItems([
            {
              label: "Location",
              value: location,
            },
            {
              label: "Status",
              value: "All",
            },
            {
              label: "Vehicle Count",
              value: totalVehicleCount,
            },
            {
              label: "Total Weight (MT)",
              value: totalWeight,
            },
          ]);
        }
        else{
            console.error("Error fetching data:", response.message)
        }
    }
    catch(error){
        console.error("Error in getDetails:", error);
    }
    finally{
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#FAFAFA", position: "relative" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <Spin size="large" />
        </div>
      )}
      <Header />
      <SideDrawer />
      <div
        style={{
          padding: "24px",
          width: "100vw",
          marginLeft: "7%",
          marginTop: "56px",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          rowGap: "18px",
        }}
      >
        <div>
          <Breadcrumb separator={">"}>
            <Breadcrumb.Item>
              <div
                style={{ cursor: "pointer" }}
                onClick={() => {
                  router.push("/plantIndentDashboard");
                }}
              >
                Dashboard
              </div>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <div>{shipperName || "-"}</div>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <Card
          style={{
            display: "flex",
            height: "80px",
            alignItems: "center",
            padding: "12px",
            width: "90%",
            borderRadius: 12,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "90vw",
            }}
          >
            {infoItems.map((item: any, index: number) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "2px",
                  width: "20%",
                }}
              >
                <div style={{ fontSize: "14px", color: "#6B7280" }}>
                  {item.label}
                </div>
                <div style={{ fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "90%",
            borderRadius: 12,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
         
          <div
            id="filters"
            style={{
              display: "flex",
              width: "82vw",
              justifyContent: "space-between",
              marginBottom: "16px",
              marginLeft: '51px'
            }}
          >
            <div style={{ display: "flex", width: "92%", columnGap: "12px" }}>
              {/* <Search
                placeholder="Search Vehicle"
                loading={false}
                style={{ width: "280px" }}
                onChange={(e) => setVehicleSearch(e.target.value)}
                onSearch={getDetails}
              /> */}
              <div>
                <DatePicker
                  placeholder="Select From"
                  showTime
                  value={fromDate}
                  onChange={(date) => setFromDate(date)}
                />
              </div>
              <div>
                <DatePicker
                  placeholder="Select To"
                  showTime
                  value={toDate}
                  onChange={(date) => setToDate(date)}
                />
              </div>
            </div>
            <div style={{marginTop: "-16px" }}>
              <Pagination
                current={Math.floor(skip / limit) + 1}
                pageSize={limit}
                total={totalRecords}
                onChange={handlePagination}
                style={{ marginTop: "16px" }}
              />
            </div>
          </div>
          <div
            style={{
              width: "90vw",
              height: "60vh",
              overflowY: "scroll",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                rowGap: "16px",
                marginBottom: "12px",
                marginTop: "12px",
              }}
            >

            {
              dataSource.data && dataSource.data.length > 0 ? (
                dataSource.data.map((val: any, index: number) => {
                  return <ProgressTimeline key={val.key} data={val} index={index + skip} />;
                })
              ) : (
                <div
                 style={{
                  width: "92%",
                  height: "57vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "dimgrey",
                  fontSize: "16px",
                 }}
                >
                  No data found
                </div>
              )
            }
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Plant;