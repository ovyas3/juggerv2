"use client";

import {
  Container,
  Grid,
  Avatar,
  useMediaQuery,
  Box,
  CardMedia,
} from "@mui/material";

import "./header.css";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import Dropdown from "./dropdown";
import ProfileDrop from "./proFileDrop";
import { useEffect, useState } from "react";
import { getCookie } from "@/utils/storageService";
import BackIcon from "@/assets/back.svg";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePathname } from "next/navigation";
import dynamic from 'next/dynamic'

const Header = ({ setReloadOnHeaderChange, isMapHelper, getAllShipment, isShipmentMapView }: any) => {
  const isCorporateUser = getCookie("is_corporate_user") === "true";
  const router = useRouter();
  const pathname = usePathname();
  const [parent_name, setParentName] = useState<string>("");
  const [shippers, setShippers] = useState([]);

  useEffect(() => {
    const parent_name = getCookie("parent_name")?.toString() || "";
    const shippersData = JSON.parse(localStorage.getItem("corporate_shipper") || "[]");
    setParentName(parent_name);
    setShippers(shippersData);
  }, []);

  const getHeaderTitle = () => {
    switch (pathname) {
      case "/externalParking":
        return "External Parking"
      case "/invoicingDashboard":
        return "Road Invoicing & Loading Status"
      case "/freightEstimator":
        return "Freight Estimator"
      case "/invoicingTrends":
        return "Trends"
      case "/TransporterPerformance":
        return "Transporter Performance"
      case "/Productivity":
        return "Productivity"
      case "/VehicleStagingLive":
        return "Vehicle Staging Live"
      case "/TATDashboard":
        return "TAT Dashboard"
      case "/TATTrends":
        return "TAT Trends"
      case "/TransporterLoadDetails":
        return "Load Details"
      case "/OwnVehicleUsage":
        return "Own Vehicle Usage"
      // case "/ewaybillDashboard":
      //   return "eWayBill Dashboard"
      // case "/leadDistanceAnalysis":
      //   return "Lead (Distance) Analysis"
      // case "/freightTrends":
      //   return "Freight Trends Dashboard"
      default:
        return ""
    }
  }
  
  if (pathname === "/invoicingDashboard") {
    const BillingDashboard = dynamic(() => 
      import('../BillingDashboard/BillingDashboard'), 
      { ssr: false }
    );
    
    return <BillingDashboard hideHeader={true} hideTable={true} />;
  }

  return (
    <div className="header-wrapper">
      <Box className="container">
        <div className="shipment_title">
          {isMapHelper ? <Image src={BackIcon} alt="back" width={25} height={30} style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')} /> : <></>}
          {isShipmentMapView ? <Image src={BackIcon} alt="back" width={25} height={30} style={{ cursor: 'pointer' }} onClick={() => router.push('/orders')} /> : <></>}
          <p className="shipment_text">{getHeaderTitle()}</p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {isCorporateUser ?
            <div className="drop_down">
              {shippers.length && <Dropdown reload={setReloadOnHeaderChange} shippers={shippers} getAllShipment={getAllShipment} />}
            </div> :
            <div className="header_name">{parent_name}</div>
          }
          <div className="divder"></div>
          <div className="profile_pic">
            <ProfileDrop />
          </div>
        </div>
      </Box>
    </div>
  );
};

export default Header;
