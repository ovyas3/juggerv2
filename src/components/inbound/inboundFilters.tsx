import "./style.css";

import * as React from "react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useState, useEffect } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import closeIcon from "../../assets/close_icon.svg";
import dayjs from "dayjs";
import service from "@/utils/timeService";
import { motion } from "framer-motion";
import Image from "next/image";
import MapViewIcon from "@/assets/map_view.svg";
import calenderIcon from "@/assets/calender_icon_filters.svg";
import filter_icon from "@/assets/filter_icon.svg";

const formatDate = (date: any) => {
  const t = service.getLocalTime(new Date(date));
  return t;
};

function InboundFilters() {
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);
  const today = new Date();
  const twentyDaysBefore = new Date();
  twentyDaysBefore.setDate(today.getDate() - 20);
  const [startDate, setStartDate] = useState(twentyDaysBefore);
  const [endDate, setEndDate] = useState(today);
  const [error, setError] = useState("");
  const [disableStartDate, setDisableStartDate] = useState(false);
  const [openFilterModal, setOpenFilterModal] = useState(false)

  const [captiveRake, setCaptiveRake] = useState(true);
  const [indianRake, setIndianRake] = useState(true);
  const [rakeArray, setRakeArray] = useState<any>(["CR", "IR"]);

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

  const handleStartDateChange = (newDate: any) => {
    const newStartDate = newDate.$d;
    if (new Date(newStartDate) > new Date(endDate)) {
      setError("Start date cannot be after end date");
    } else {
      setError("");
    }
    setStartDate(newStartDate);
    shouldDisableStartDate(newStartDate);
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
    const rakeArray = [];
    if (captiveRake) rakeArray.push("CR");
    if (indianRake) rakeArray.push("IR");
    setRakeArray(rakeArray);
  }, [captiveRake, indianRake]);

  console.log(startDate,'--------ghjkjhgfdfghj----------', endDate);

  return (
    <div id="inboundFiltersContainer">
      <div id="inboundFilters">
        <div id="from-date">
          <div id="calenderBox">
            <Image
              src={calenderIcon.src}
              alt="calenderIcon"
              height={16}
              width={16}
            />
          </div>
          <div id="from-date-box">
            <div id="from-date-text">From</div>
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
                disabled={disableStartDate}
              />
            </LocalizationProvider>
          </div>
        </div>

        <div id="from-date">
          <div id="calenderBox">
            <Image
              src={calenderIcon.src}
              alt="calenderIcon"
              height={16}
              width={16}
            />
          </div>
          <div id="from-date-box">
            <div id="from-date-text">To</div>
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

        <div id="rakeType">
          <motion.section
            animate={{
              scale: captiveRake ? 0.95 : 1,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            onClick={() => {
              setCaptiveRake(!captiveRake);
            }}
            className="status_text"
            style={{
              backgroundColor: captiveRake ? "#161D6F" : "#F0F3F9",
              color: captiveRake ? "#F0F3F9" : "#21114D",
            }}
          >
            Captive Rakes
          </motion.section>
          <motion.section
            animate={{
              scale: indianRake ? 0.95 : 1,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            onClick={() => {
              setIndianRake(!indianRake);
            }}
            className="status_text"
            style={{
              backgroundColor: indianRake ? "#161D6F" : "#F0F3F9",
              color: indianRake ? "#F0F3F9" : "#21114D",
            }}
          >
            Indian Railway Rakes
          </motion.section>
        </div>

        <div>
          <motion.div
            id="map-view-btn-orders"
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() => window.open("/shipment_map_view", "_blank")}
          >
            <div>
              <Image src={MapViewIcon} alt="map view" width={16} height={16} />
            </div>

            <div id="map-view-btn-header">Map View</div>
          </motion.div>
        </div>

        <div style={{ position: "relative" }}>
          <div
            className="filter-container"
            onClick={() => setOpenFilterModal(!openFilterModal)}
          >
            <FilterAltIcon className="filter-icon" />
          </div>
        </div>
      </div>


      {openFilterModal && (
       <div >
            fghjjhjgdhchdgcd
       </div>
        )}
    </div>
  );
}
export default InboundFilters;
