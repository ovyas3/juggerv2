"use client";
import "./filters.css";
import * as React from "react";
import { useState, useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import { motion } from "framer-motion";
import Image from "next/image";
import MapViewIcon from "@/assets/map_view.svg";
import { useRouter, usePathname } from "next/navigation";
import CustomDatePicker from "@/components/UI/CustomDatePicker/CustomDatePicker";

function Filters({
  onToFromChange,
  onChangeStatus,
  onChangeRakeTypes,
  reload,
  shipmentsPayloadSetter,
}: any) {
  const [rakeType, setRakeType] = useState(["IR", "CR"]);
  const router = useRouter();

  const today = new Date();
  const twentyDaysBefore = new Date();
  twentyDaysBefore.setDate(today.getDate() - 20);

  const [startDate, setStartDate] = useState(twentyDaysBefore);
  const [endDate, setEndDate] = useState(today);
  const [error, setError] = useState("");
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [filterEDemand, setFilterEDemand] = useState("");
  const [filterDestination, setFilterDestination] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");

  const oneMonthAgo: any = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

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

  useEffect(() => {
    shipmentsPayloadSetter((prev: any) => {
      const newState = { ...prev };
      newState.rake_types = rakeType;
      return newState;
    });
  }, [rakeType]);

  const handleStartDateChange = (e: any) => {
    const newStartDate = new Date(e);
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (e: any) => {
    const newEndDate = new Date(e);
    setEndDate(newEndDate);
  };

  function clearFilter() {
    setFilterMaterial("");
    setFilterDestination("");
    setFilterEDemand("");
    shipmentsPayloadSetter((prevState: any) => {
      const newState = { ...prevState };
      delete newState["eDemand"];
      delete newState["destination"];
      delete newState["material"];
      return newState;
    });
  }

  function handleSubmit() {
    shipmentsPayloadSetter((prevState: any) => {
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

  useEffect(() => {
    if (!reload)
      if (startDate && endDate && !error) {
        onToFromChange(endDate, startDate);
      }
  }, [startDate, endDate, error]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 20,
          position: "relative",
          overflowY: "hidden",
        }}
      >
        <div style={{ width: "132px", height: 36 }}>
          <CustomDatePicker
            label="From"
            value={startDate}
            onChange={(newDate) => {
              handleStartDateChange(newDate);
            }}
            maxDate={endDate}
            defaultDate={oneMonthAgo}
            maxSelectableDate={today}
          />
        </div>

        <div style={{ width: "132px", height: 36 }}>
          <CustomDatePicker
            label="To"
            value={endDate}
            onChange={(newDate) => {
              handleEndDateChange(newDate);
            }}
            maxDate={endDate}
            maxSelectableDate={today}
          />
        </div>

        {/* <div style={{fontSize:'12px', display:'flex', alignItems:'center',gap:6, height:36, }}>
            <Checkbox size="small" style={{height:12, width:12}} onChange={() => handleChangeRakeType("ALL")} checked={rakeType.includes("ALL")} />
            <div className="">ALL</div>
        </div> */}

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
            onClick={() => router.push(`/shipment_map_view?from=${new Date(startDate)}&to=${new Date(endDate)}`)}
          >
            <Image src={MapViewIcon} alt="map view" width={16} height={16} />
            <span className="map-view-btn-header">Map View</span>
          </motion.div>
        </div>

        {/* <div style={{ position: "relative" }}>
          <div
            className="filter-container"
            onClick={() => setOpenFilterModal(true)}
          >
            <FilterAltIcon className="filter-icon" />
            <img src={filter_icon.src} alt="" />
          </div>
        </div> */}
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

export default Filters;