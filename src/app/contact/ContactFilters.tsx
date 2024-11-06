"use client";

import * as React from "react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useState, useEffect } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";
import service from "@/utils/timeService";
import Image from "next/image";
import MapViewIcon from "@/assets/map_view.svg";
import calenderIcon from "@/assets/calender_icon_filters.svg";
import filter_icon from "@/assets/filter_icon.svg";

function ContactFilters({ setContactDetailsPayload }: any) {
  const [status, setStatus] = useState([
    "In Transit",
    "Delivered At Hub",
    "Delivered At Customer",
  ]);
  const [rakeType, setRakeType] = useState([
    "All",
    "Captive Rakes",
    "Indian Railway Rakes",
  ]);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

  const today = new Date();
  const twentyDaysBefore = new Date();
  twentyDaysBefore.setDate(today.getDate() - 20);

  const [startDate, setStartDate] = useState(twentyDaysBefore);
  const [endDate, setEndDate] = useState(today);
  const [error, setError] = useState("");
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [filterEDemand, setFilterEDemand] = useState("");
  const [filterDestination, setFilterDestination] = useState("");
  const [disableStartDate, setDisableStartDate] = useState(false);
  const [disableEndDate, setDisableEndDate] = useState(false);
  const [filterMaterial, setFilterMaterial] = useState("");

  const formatDate = (date: any) => {
    const t = service.getLocalTime(new Date(date));
    return t;
  };

  const handleStartDateChange = (e: any) => {
    const newStartDate = e.$d;
    if (new Date(newStartDate) > new Date(endDate)) {
      setError("Start date cannot be after end date");
    } else {
      setError("");
    }
    setStartDate(newStartDate.setHours(0, 0, 0, 0));
    shouldDisableStartDate(newStartDate.setHours(0, 0, 0, 0));
  };

  const handleEndDateChange = (e: any) => {
    const newEndDate = e.$d;
    if (new Date(startDate) > new Date(newEndDate)) {
      setError("Start date cannot be after end date");
    } else {
      setError("");
    }
    setEndDate(newEndDate);
    shouldDisableEndDate(newEndDate);
  };

  useEffect(() => {
    setContactDetailsPayload((prevState: any) => {
      const newState = { ...prevState };
      if (startDate) newState.from = new Date(startDate);
      if (endDate) newState.to = new Date(endDate);
      return newState;
    });
  }, [startDate, endDate]);

  // function clearFilter() {
  //     setFilterMaterial('')
  //     setFilterDestination('')
  //     setFilterEDemand('')
  //     shipmentsPayloadSetter((prevState: any) => {
  //         const newState = { ...prevState };
  //         delete newState["eDemand"];
  //         delete newState["destination"];
  //         delete newState["material"];

  //         return newState;
  //     });
  // }

  function shouldDisableStartDate(date: Date): boolean | undefined {
    const disable = date > new Date() || date > endDate;
    return disable;
  }

  function shouldDisableEndDate(date: Date): boolean | undefined {
    const disable =
      date > new Date() ||
      new Date(new Date(date).setHours(23, 59, 59, 999)) < startDate;
    return disable;
  }

  // function handleSubmit() {
  //     shipmentsPayloadSetter((prevState: any) => {
  //         const newState = { ...prevState };
  //         if (!filterEDemand) delete newState["eDemand"];
  //         else newState.eDemand = filterEDemand;
  //         if (!filterDestination) delete newState["destination"];
  //         else newState.destination = filterDestination;
  //         if (!filterMaterial) delete newState["material"]
  //         else newState.material = filterMaterial

  //         return newState;
  //     });
  //     setOpenFilterModal(false);
  // }

  // useEffect(() => {
  //     if (!reload)
  //         if (startDate && endDate && !error) {
  //             onToFromChange(endDate, startDate);
  //         }

  // }, [startDate, endDate, error]);

  // useEffect(() => {
  //     if (reload) {
  //         const today = new Date();
  //         const twentyDaysBefore = new Date(today);
  //         twentyDaysBefore.setDate(today.getDate() - 20);

  //         setStartDate(twentyDaysBefore);
  //         setEndDate(today);

  //         if (startDate === twentyDaysBefore && endDate === today) {
  //             onToFromChange(today, twentyDaysBefore);
  //         }
  //         setStatus(['In Transit','Delivered At Hub',
  //             'Delivered At Customer']);
  //     }
  // }, [reload]);

  return (
    <div>
      <div style={{ display: "flex", gap: 20 }}>
        <div
          style={{
            height: 36,
            width: 132,
            border: "1px solid #E9E9EB",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            paddingLeft: 8,
          }}
        >
          <div style={{ height: 16, width: 16, marginBottom: 4 }}>
            <img src={calenderIcon.src} alt="" />
          </div>
          <div style={{ flex: 1, marginTop: 6, marginLeft: 10 }}>
            <div style={{ fontSize: 10, color: "#44475B" }}>From</div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                open={openStartDatePicker}
                onOpen={() => setOpenStartDatePicker(true)}
                onClose={() => setOpenStartDatePicker(false)}
                slotProps={{
                  textField: {
                    placeholder: formatDate(startDate),
                    onClick: () => setOpenStartDatePicker(!openStartDatePicker),
                    fullWidth: true,
                    InputProps: {
                      endAdornment: null,
                    },
                  },
                }}
                sx={{
                  ".MuiInputBase-input": {
                    padding: "0 !important",
                    fontSize: "12px !important",
                  },
                  ".MuiInputBase-root": {
                    padding: 0,
                    border: "none",
                    "& fieldset": { border: "none" },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                  },
                }}
                value={dayjs(startDate)}
                onChange={(newDate) => {
                  handleStartDateChange(newDate);
                }}
                // disabled={disableStartDate}
              />
            </LocalizationProvider>
          </div>
        </div>

        <div
          style={{
            height: 36,
            width: 132,
            border: "1px solid #E9E9EB",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            paddingLeft: 8,
          }}
        >
          <div style={{ height: 16, width: 16, marginBottom: 4 }}>
            <img src={calenderIcon.src} alt="" />
          </div>
          <div style={{ flex: 1, marginTop: 6, marginLeft: 10 }}>
            <div style={{ fontSize: 10, color: "#44475B" }}>To</div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                open={openEndDatePicker}
                onOpen={() => setOpenEndDatePicker(true)}
                onClose={() => setOpenEndDatePicker(false)}
                slotProps={{
                  textField: {
                    placeholder: formatDate(endDate),
                    onClick: () => setOpenEndDatePicker(!openEndDatePicker),
                    fullWidth: true,
                    InputProps: {
                      endAdornment: null,
                    },
                  },
                }}
                sx={{
                  ".MuiInputBase-input": {
                    padding: "0 !important",
                    fontSize: "12px !important",
                  },
                  ".MuiInputBase-root": {
                    padding: 0,
                    border: "none",
                    "& fieldset": { border: "none" },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                  },
                }}
                value={dayjs(endDate)}
                onChange={(newDate) => {
                  handleEndDateChange(newDate);
                }}
                disableFuture={true}
                disabled={disableStartDate}
              />
            </LocalizationProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactFilters;
