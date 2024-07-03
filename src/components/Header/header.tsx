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

const Header = ({title, setReloadOnHeaderChange, isMapHelper}:any) => {
  const router = useRouter();
  const [parent_name, setParentName] = useState<string>("");
  const [shippers, setShippers] = useState([]);
  const [selected_shipper, setSelectedShipper] = useState("");

  useEffect(() => {
    const parent_name = getCookie("parent_name")?.toString() || "";
    const shippersData = JSON.parse(localStorage.getItem("shippers") || "[]");
    const selected_shipper = localStorage.getItem("selected_shipper");
    setParentName(parent_name);
    setShippers(shippersData);
    // setSelectedShipper(selected_shipper);
  }, []);

  return (
    <div className="header-wrapper">
      <Box className="container">
        <div className="shipment_title">
          {isMapHelper ? <Image src={BackIcon} alt="back" width={25} height={30} style={{cursor: 'pointer'}} onClick={() => router.push('/dashboard')}/> : <></>}
           <p className="shipment_text">{title}</p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div className="header_name">{parent_name}</div>
          {/* <div className="drop_down">
            {shippers.length && <Dropdown reload={setReloadOnHeaderChange} shippers={shippers}  />}
          </div> */}
          {/* <div className="divder"></div> */}
          {/* <div className="bell_icon">
            <Badge
              badgeContent={0}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  transform: "scale(0.6)",
                  top: -8,
                  right: -7,
                },
              }}
            >
              <NotificationsIcon
                color="action"
                sx={{ width: 20, height: 18 }}
              />
            </Badge>
          </div> */}
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
