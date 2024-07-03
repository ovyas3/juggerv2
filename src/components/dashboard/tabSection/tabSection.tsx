"use client";

import React, { useState } from "react";
import { httpsGet } from "@/utils/Communication";
import { Tab, Box, Select, MenuItem } from "@mui/material";
import "./tabSection.css";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import Status from "../status/status";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
// import BarsDataset from "../charts/barChart";
import TrackingStatus from "../status/trackingStatus";
import Image from "next/image";
import helpCenterIcon from "../../../assets/help_center_icon.svg";
import helpCenteredIconHovered from "../../../assets/help_center_icon_hovered.svg";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Popup } from "@/components/Popup/popup";
import { useTranslations } from "next-intl";

const Tabsection = () => {
  const [value, setValue] = useState("1");
  const [data, setData] = useState<any>([]);
  const [statusInfo, setStatusInfo] = useState<string>('');
  const [statusNumber, setStatusNumber] = useState<number>(0);
  const [helpCenterBtnHovered, setHelpCenterBtnHovered] = useState(false);
  const t = useTranslations("DASHBOARD");

  const handleChange = (val: any) => {
    setValue(val);
  };

  const handleAllRakesAndTable = async (props: any) => {
    const getProps = props.toLowerCase().replace(/\s/g, ""); 
    if(getProps === "totalrakes"){
      const res = await httpsGet("all_captive_rakes_details", 0);
      setData(res);
    } else if (getProps === "trackingwithgps"){
      const res = await httpsGet("all_captive_rakes_details?tracking=true", 0);
      setData(res);
    } else if (getProps === "nontracking"){
      const res = await httpsGet("all_captive_rakes_details?tracking=false", 0);
      setData(res);
    }
    setStatusInfo("all");
    setStatusNumber(1);
  };

  const handleSchemeTypeAndTable = async (props: any) => {
    const getSchemeType = props;
    const validSchemes = ["SFTO", "GPWIS", "BFNV"];
  
    if (validSchemes.includes(getSchemeType)) {
      const res = await httpsGet(`all_captive_rakes_details?scheme=${getSchemeType}`, 0);
      setData(res);
      if(getSchemeType === "SFTO"){
        setStatusInfo("sfto");
        setStatusNumber(2);
      } else if(getSchemeType === "GPWIS"){
        setStatusInfo("gpwis");
        setStatusNumber(3);
      } else if(getSchemeType === "BFNV"){
        setStatusInfo("bfnv");
        setStatusNumber(4);
      }
    }
  }

  const handleTrackingAndNonTracking = async (props: any) => {
    const getProps = props;
    if(getProps === "trackingWithLoad"){
      const res = await httpsGet("all_captive_rakes_details?tracking=true&withLoad=true", 0);
      setData(res);
      setStatusInfo("trackingWithLoad");
      setStatusNumber(5);
    } else if(getProps === "trackingWithoutLoad"){
      const res = await httpsGet("all_captive_rakes_details?tracking=true&withLoad=false", 0);
      setData(res);
      setStatusInfo("trackingWithoutLoad");
      setStatusNumber(6);
    } else if(getProps === "nonTrackingWithLoad"){
      const res = await httpsGet("all_captive_rakes_details?tracking=false&withLoad=true", 0);
      setData(res);
      setStatusInfo("nonTrackingWithLoad");
      setStatusNumber(7);
    } else if(getProps === "nonTrackingWithoutLoad"){
      const res = await httpsGet("all_captive_rakes_details?tracking=false&withLoad=false", 0);
      setData(res);
      setStatusInfo("nonTrackingWithoutLoad");
      setStatusNumber(8);
    }
  };

  return (
    <div className="wrapper">
      <div>
        <div>
          <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: "divider"}}>
                <TabList onChange={handleChange}>
                  <Tab label={t("railOverview")} value="1" />
                  {/* <Tab label="Handling Agent's Overview" value="2" />
                  <Tab label="Customer Overview" value="3" /> */}
                </TabList>
              </Box>
              {/* <div className="filter-bar">
                <div className="filterdrop-wrapper">
                  <div className="dropdown">
                    <Select
                      sx={{ width: "136px", height: "36px" }}
                      value={value}
                      label="Age"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={10}>Twenty</MenuItem>
                      <MenuItem value={21}>Twenty one</MenuItem>
                      <MenuItem value={22}>Twenty one and a half</MenuItem>
                    </Select>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={["DatePicker"]}>
                        <DemoItem>
                          <DatePicker
                            label="From"
                            className="date-picker-dashboard"
                            sx={{
                              "& .MuiInputBase-input::placeholder": {
                                fontSize: "12px",
                              },
                              "& .MuiInputBase-input": {
                                fontSize: "12px",
                                height: "36px",
                                width: "128px",
                                // padding: "8px 14px",
                                boxSizing: "border-box",
                              },
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderColor: "#E9E9EB",
                                  alignItems: "center",
                                  width: "128px",
                                },
                              },
                              "&.mui-10o2lyd-MuiStack-root": {
                                width: "128px",
                                overflow: "hidden",
                                paddingTop: "0px",
                              },
                              "& .MuiInputAdornment-root": {
                                marginLeft: "-38px",
                              },
                            }}
                          />
                        </DemoItem>
                      </DemoContainer>
                    </LocalizationProvider>
                  </div>
                  <div className="dropdown">
                    <Select
                      sx={{ width: "136px", height: "36px" }}
                      value={value}
                      label="Age"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={10}>Twenty</MenuItem>
                      <MenuItem value={21}>Twenty one</MenuItem>
                      <MenuItem value={22}>Twenty one and a half</MenuItem>
                    </Select>
                  </div>
                  <div className="dropdown">
                    <Select
                      sx={{ width: "136px", height: "36px" }}
                      value={value}
                      label="Age"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={10}>Twenty</MenuItem>
                      <MenuItem value={21}>Twenty one</MenuItem>
                      <MenuItem value={22}>Twenty one and a half</MenuItem>
                    </Select>
                  </div>
                  <div className="dropdown">
                    <Select
                      sx={{ width: "136px", height: "36px" }}
                      value={value}
                      label="Age"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={10}>Twenty</MenuItem>
                      <MenuItem value={21}>Twenty one</MenuItem>
                      <MenuItem value={22}>Twenty one and a half</MenuItem>
                    </Select>
                  </div>
                </div>
                <div
                  className="help-btn"
                  onMouseOver={() => setHelpCenterBtnHovered(true)}
                  onMouseLeave={() => setHelpCenterBtnHovered(false)}
                >
                  <Image
                    src={
                      helpCenterBtnHovered
                        ? helpCenteredIconHovered
                        : helpCenterIcon
                    }
                    alt=""
                    style={{ color: "white" }}
                  />
                  <span style={{ marginLeft: "8px" }}>Help Center</span>
                </div>
              </div> */}
             <TabPanel value="1" className="tabpanel-container">
                <div className="tabpanel-contents">
                  {/* <div
                    style={{ borderRight: "1px solid #DFE3EB", width: "60vw" }}
                  >
                    <Status />
                    <BarsDataset/>
                  </div> */}
                  <div className="tracking-status">
                    <TrackingStatus 
                          handleAllRakesAndTable={handleAllRakesAndTable}
                          handleSchemeTypeAndTable={handleSchemeTypeAndTable}
                          handleTrackingAndNonTracking={handleTrackingAndNonTracking}
                          statusInfo={statusInfo}
                          statusNumber={statusNumber}
                          />
                  </div>
                  <div className="vertical-line"/>
                  <div className="popup-container">
                  {data && <Popup data={data} />}
                  </div>
                </div>
              </TabPanel>
              {/* <TabPanel value="2">Item Two</TabPanel>
              <TabPanel value="3">Item Three</TabPanel> */}
            </TabContext>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Tabsection;
