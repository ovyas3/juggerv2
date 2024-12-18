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
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import filter_icon from "@/assets/filter_icon.svg";
import Tooltip from "@mui/material/Tooltip";
import { TooltipProps } from "@mui/material/Tooltip";
import { styled } from '@mui/material/styles';
import service from "@/utils/timeService";
import { Bold } from "lucide-react";

interface StyledTooltipProps extends TooltipProps {
  className?: string;
  color?: string;
}

const CustomTooltip = styled(({ className, color, ...props }: StyledTooltipProps & { color: string }) => (
  <Tooltip 
    {...props} 
    classes={{ popper: className }} 
    PopperProps={{
      popperOptions: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [2, -8],
            },
          },
        ],
      },
    }}
  />
))(({ color }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: color, // Use the color prop here
    color: '#fff',
    width: '100%',
    height: '36px',
    boxShadow: '0px 0px 2px rgba(0,0,0,0.1)',
    fontSize: '8px',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
  },
  '& .MuiTooltip-arrow': {
    color: color, // Also set the arrow color
  },
}));


function Filters({
  onToFromChange,
  onChangeStatus,
  onChangeRakeTypes,
  reload,
  shipmentsPayloadSetter,
  lastFoisPingDate,
  lastFOISPing,
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

  const [showFilterOn, setShowFilterOn] = useState(false);
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

  useEffect(()=>{
    if(filterEDemand === '' && filterDestination === '' && filterMaterial === ''){
      setShowFilterOn(false)
    }else{
      setShowFilterOn(true)
    }
  },[filterEDemand,filterDestination,filterMaterial])

  useEffect(()=>{
    if(filterEDemand === '' && filterDestination === '' && filterMaterial === ''){
      setShowFilterOn(false)
    }else{
      setShowFilterOn(true)
    }
  },[filterEDemand,filterDestination,filterMaterial])

  const getTimeDifferenceAndColor = (lastFoisPingDate: Date | string) => {
    const now = new Date();

    // Check if lastFoisPingDate is a valid date
    if (!lastFoisPingDate || !(lastFoisPingDate instanceof Date) || isNaN(lastFoisPingDate.getTime())) {
        return { timeAgo: 'No Date Found', color: '#CCCCCC' }; 
    }

    const diffInMs = now.getTime() - new Date(lastFoisPingDate).getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000); 

    let color = '';
    let timeAgo = '';

    if (diffInSeconds < 60) { 
        timeAgo = `${diffInSeconds} seconds ago`;
        color = '#18BE8A';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        timeAgo = `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        color = '#18BE8A';
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60); 
        timeAgo = `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min${minutes > 1 ? 's' : ''}` : ''} ago`;
        color = '#FF9800';
    } else { 
        const days = Math.floor(diffInSeconds / 86400);
        const hours = Math.floor((diffInSeconds % 86400) / 3600);
        timeAgo = `${days} day${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours} hour${hours > 1 ? 's' : ''}` : ''} ago`;
        color = '#FF5C5C';
    }

    return { timeAgo, color };
  };

  const { timeAgo, color } = getTimeDifferenceAndColor(lastFoisPingDate);
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 20,
          position: "relative",
          overflowY: "hidden",
          alignItems:'center'
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

        <div>
          <div
            className={showFilterOn ? "active" : ""}
            onClick={() => setOpenFilterModal(true)}
          >
            <img src={filter_icon.src} alt="" />
          </div>
        </div>

        <CustomTooltip 
          arrow 
          color={color}
          title={
              <div style={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  fontSize: '10px',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 600,
                  paddingTop: '2px',
                  gap: '2px'
              }}>
                  <div>{service.utcToist(lastFoisPingDate, "dd-MMM-yy HH:mm") || ''}</div>
                  <div>{timeAgo}</div>
              </div>
          }>
          <div className="fois-indication-circle" style={{ 
            backgroundColor: color
          }}>
              <div className="fois-indication-text">
                  FOIS
              </div>
          </div>
        </CustomTooltip>
      </div>

      {openFilterModal && (
        <div style={{ 
          display: "flex", 
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          width: "100%",
          height: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          justifyContent: "center",
          alignItems: "center",
        }}>
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