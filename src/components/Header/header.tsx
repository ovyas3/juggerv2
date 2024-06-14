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

const Header = (props: any) => {
  const [parent_name, setParentName] = useState<string>("");
  const [shippers, setShippers] = useState([]);
  const [selected_shipper, setSelectedShipper] = useState("");

  useEffect(() => {
    const parent_name = getCookie("parent_name")?.toString() || "";
    const shippers = JSON.parse(localStorage.getItem("shippers") || "[]");
    const selected_shipper = localStorage.getItem("selected_shipper");
    setParentName(parent_name);
    setShippers(shippers);
    // setSelectedShipper(selected_shipper);
  }, []);

  return (
    <div className="header-wrapper">
      <Box className="container">
        <div className="shipment_text">{props.title}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div className="header_name">{parent_name}</div>
          <div className="drop_down">
            <Dropdown shippers={shippers} />
          </div>
          <div className="divder"></div>
          <div className="bell_icon">
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
          </div>
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
