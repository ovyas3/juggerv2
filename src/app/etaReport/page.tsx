"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header/header";
import MobileHeader from "@/components/Header/mobileHeader";
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useSnackbar } from "@/hooks/snackBar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { httpsGet, httpsPost } from "@/utils/Communication";
import "./style.css";

function Report() {
  const { showMessage } = useSnackbar();
  const mobile = useWindowSize(500);
  const [reportType, setReportType] = React.useState("");
  const [fromDate, setFromDate] = React.useState(-1);
  const [toDate, setToDate] = React.useState(-1);

  const handleChange = (event: SelectChangeEvent) => {
    setFromDate(-1);
    setToDate(-1);
    setReportType(event.target.value);
  };

  const generateReport = async () => {
    try {
      if (fromDate === -1 || toDate === -1) {
        showMessage("Please select from and to date", "error");
        return;
      }
      if (fromDate > toDate) {
        showMessage("From date should be less than to date", "error");
        return;
      }
      let url = "";
      if (reportType === "ETA") {
        url = `reports/eta?from=${fromDate}&to=${toDate}`;
      } else if (reportType === "MIS") {
        url = `reports/mis?from=${fromDate}&to=${toDate}`;
      }
      const response = await httpsGet(url);
      if (response.statusCode === 200) {
        console.log("response", response.data.link);
        window.open(response.data.link, "_blank");
        showMessage("Report generated successfully", "success");
      }
    } catch (error) {}
  };

  return (
    <div className="handlingAgent_Container">
      {mobile ? (
        <Header title={"Reports"} isMapHelper={false} />
      ) : (
        <MobileHeader />
      )}

      <div
        className={`content_container ${
          mobile ? "adjustMargin" : "adjustMarginMobile"
        }`}
      >
        <div className="report_type">
          <div>
            <span style={{ color: "red" }}>*</span>Report Type
          </div>
          <div>
            <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={reportType}
                onChange={handleChange}
              >
                <MenuItem value={"ETA"}>ETA</MenuItem>
                <MenuItem value={"MIS"}>MIS</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        {reportType === "ETA" && (
          <>
            <div style={{ marginTop: "40px" }}>Invoice Generated Date</div>
            <div className="date_container">
              <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    sx={{}}
                    format="DD/MM/YYYY"
                    onChange={(newDate) => {
                      if (newDate) {
                        const epochTime = newDate.valueOf();
                        setFromDate(epochTime);
                      }
                    }}
                    disableFuture={true}
                  />
                </LocalizationProvider>
              </div>

              <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To"
                    format="DD/MM/YYYY"
                    onChange={(newDate) => {
                      if (newDate) {
                        const epochTime = newDate.valueOf();
                        setToDate(epochTime);
                      }
                    }}
                    disableFuture={true}
                  />
                </LocalizationProvider>
              </div>
            </div>
          </>
        )}

        {reportType === "MIS" && (
          <>
            <div style={{ marginTop: "40px",fontWeight: "bold" }}>E-Demand Date</div>
            <div className="date_container">
              <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    sx={{}}
                    format="DD/MM/YYYY"
                    onChange={(newDate) => {
                      if (newDate) {
                        const epochTime = newDate.valueOf();
                        setFromDate(epochTime);
                      }
                    }}
                    disableFuture={true}
                  />
                </LocalizationProvider>
              </div>

              <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To"
                    format="DD/MM/YYYY"
                    onChange={(newDate) => {
                      if (newDate) {
                        const epochTime = newDate.valueOf();
                        setToDate(epochTime);
                      }
                    }}
                    disableFuture={true}
                  />
                </LocalizationProvider>
              </div>
            </div>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "end" }}>
          <button
            className="report_btn"
            onClick={generateReport}
            disabled={reportType === ""}
          >
            Generate Report
          </button>
        </div>
      </div>

      {mobile ? (
        <SideDrawer />
      ) : (
        <div className="bottom_bar">
          <MobileDrawer />
        </div>
      )}
    </div>
  );
}

export default Report;
