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
import { useRouter, usePathname } from "next/navigation";

const formatDate = (date: any) => {
  const t = service.getLocalTime(new Date(date));
  return t;
};

function InboundFilters({ setInBoundPayload }: any) {
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);
  const today = new Date();
  const twentyDaysBefore = new Date();
  twentyDaysBefore.setDate(today.getDate() - 20);
  const [startDate, setStartDate] = useState(twentyDaysBefore);
  const [endDate, setEndDate] = useState(today);
  const [error, setError] = useState("");
  const [disableStartDate, setDisableStartDate] = useState(false);
  const [openFilterModal, setOpenFilterModal] = useState(false);

  const [captiveRake, setCaptiveRake] = useState(true);
  const [indianRake, setIndianRake] = useState(true);
  const [rakeArray, setRakeArray] = useState<any>(["CR", "IR"]);

  const router = useRouter();
  const [rakeType, setRakeType] = useState(["IR", "CR"]);

  const [filterEDemand, setFilterEDemand] = useState("");
  const [filterDestination, setFilterDestination] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");

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

  const handleChangeRakeType = (value: any) => {
    switch (value) {
      case "ALL":
        setRakeType((prev: any) => {
          const newState = [...prev];
          if (newState.includes("ALL")) {
            return [];
          } else {
            return ["ALL", "IR", "CR"];
          }
        });
        break;
      case "IR":
        setRakeType((prev: any) => {
          const newState = [...prev];
          if (newState.includes("ALL"))
            newState.splice(newState.indexOf("ALL"), 1);
          if (newState.includes("IR")) {
            newState.splice(newState.indexOf("IR"), 1);
            return newState;
          } else {
            newState.push("IR");
            return newState;
          }
        });
        break;
      case "CR":
        setRakeType((prev: any) => {
          const newState = [...prev];
          if (newState.includes("ALL"))
            newState.splice(newState.indexOf("ALL"), 1);
          if (newState.includes("CR")) {
            newState.splice(newState.indexOf("CR"), 1);
            return newState;
          } else {
            newState.push("CR");
            return newState;
          }
        });
        break;
      default:
        break;
    }
  };

  function handleSubmit() {
    setInBoundPayload((prevState: any) => {
      const newState = { ...prevState };
      if (!filterEDemand) delete newState["eDemand"];
      else newState.eDemand = filterEDemand;
      if (!filterDestination) delete newState["destination"];
      else newState.destination = filterDestination;
      if (!filterMaterial) delete newState["material"];
      else newState.material = filterMaterial;
      return newState;
    });
    setOpenFilterModal(false);
  }

  function clearFilter() {
    setFilterMaterial("");
    setFilterDestination("");
    setFilterEDemand("");
    setInBoundPayload((prevState: any) => {
      const newState = { ...prevState };
      delete newState["eDemand"];
      delete newState["destination"];
      delete newState["material"];
      return newState;
    });
  }

  useEffect(() => {
    setInBoundPayload((prev: any) => {
      const newState = { ...prev };
      newState.rake_types = rakeType;
      return newState;
    });
  }, [rakeType]);

  useEffect(() => {
    const rakeArray = [];
    if (captiveRake) rakeArray.push("CR");
    if (indianRake) rakeArray.push("IR");
    setRakeArray(rakeArray);
  }, [captiveRake, indianRake]);

  useEffect(() => {
    setInBoundPayload((prevPayload: any) => ({
      ...prevPayload,
      from: startDate,
      to: endDate,
      // rake_types: rakeArray,
    }));
  }, [startDate, endDate]);

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

        <div
          style={{
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 36,
          }}
        >
          <Checkbox
            size="small"
            style={{ height: 12, width: 12 }}
            onChange={() => handleChangeRakeType("CR")}
            checked={rakeType.includes("CR")}
          />
          <div className="">Captive Rakes</div>
        </div>

        <div
          style={{
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 36,
          }}
        >
          <Checkbox
            size="small"
            style={{ height: 12, width: 12 }}
            onChange={() => handleChangeRakeType("IR")}
            checked={rakeType.includes("IR")}
          />
          <div className="">Indian Railway Rakes</div>
        </div>

        <div>
          <motion.div
            className="map-view-btn-orders"
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() =>
              router.push(
                `/shipment_map_view?from=${new Date(startDate)}&to=${new Date(
                  endDate
                )}`
              )
            }
          >
            <Image src={MapViewIcon} alt="map view" width={16} height={16} />
            <span className="map-view-btn-header">Map View</span>
          </motion.div>
        </div>

        <div style={{ position: "relative" }}>
          <div
            className="filter-container"
            onClick={() => setOpenFilterModal(true)}
          >
            <img src={filter_icon.src} alt="" />
          </div>
        </div>
      </div>

      {openFilterModal && (
        <div style={{ display: "flex", justifyContent: "right" }}>
          <div className="search">
            <div className="search-container">
              <div className="search-container-group">
                <label className="search-label">e-Demand Number</label>
                <input
                  type="text"
                  className="search-group"
                  onChange={(e) => setFilterEDemand(e.target.value)}
                  value={filterEDemand}
                />
              </div>
              <div className="search-container-group">
                <label className="search-label">Destination</label>
                <input
                  className="search-group"
                  onChange={(e) => setFilterDestination(e.target.value)}
                  value={filterDestination}
                />
              </div>
              <div className="search-container-group">
                <label className="search-label">Material</label>
                <input
                  className="search-group"
                  onChange={(e) => setFilterMaterial(e.target.value)}
                  value={filterMaterial}
                />
              </div>
            </div>
            <div className="search-trigger">
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={() => clearFilter()}>Clear</button>
            </div>
          </div>
          <div
            className="overlay-container"
            onClick={() => setOpenFilterModal(false)}
          />
        </div>
      )}
    </div>
  );
}
export default InboundFilters;
