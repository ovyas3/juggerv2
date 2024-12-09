"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  Popup,
  GeoJSON,
  Polyline,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "./MapLayers.css";
import { httpsGet, httpsPost } from "@/utils/Communication";
import getBoundary from "./IndianClaimed";
import coordsOfTracks from "./IndianTracks";
import { useWindowSize } from "@/utils/hooks";
import { MagnifyingGlass } from "react-loader-spinner";
import pickupIcon from "../../assets/pickup_icon.svg";
import dropIcon from "@/assets/drop_icon.svg";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Paper from "@mui/material/Paper";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import InputLabel from "@mui/material/InputLabel";
import captiveRakeIndicator from "@/assets/captive_rakes.svg";
import { environment } from "@/environments/env.api";

import IdleIcon from "@/assets/idle_icon.svg";
import InactiveIcon from "@/assets/inactive_icon.svg";
import {
  countTracking,
  getCaptiveIndianRakes,
  trackingByFoisGpsHook,
} from "@/utils/hooks";

import { divIcon, point } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo, useCallback } from "react";
import "leaflet-boundary-canvas";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Grid,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Switch from "@mui/material/Switch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import SideDrawer from "@/components/Drawer/Drawer";
import Header from "@/components/Header/header";

import { DateTime } from "luxon";
import service from "@/utils/timeService";
import { statusBuilder } from "./StatusBuilder/StatusBuilder";
import Image from "next/image";
import TripTracker from "./TripTracker";

import SearchIcon from "@/assets/search_icon.svg";
import { useSnackbar } from "@/hooks/snackBar";
import Tooltip from "@mui/material/Tooltip";
import { TooltipProps } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

import CustomDatePicker from "@/components/UI/CustomDatePicker/CustomDatePicker";
import searchIcon from "@/assets/search_wagon.svg";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Icon, CircleMarker } from "leaflet";

import CurrencyIcon from "@/assets/current_location_icon.svg";
import deliveryIcon from "@/assets/delivery_location_icon.svg";
import getIndiaMap from "@/components/MapView/IndiaMap";
import indiaGeoJSON from "@/components/MapView/IndiaMap";
import "leaflet/dist/leaflet.css";
import "leaflet-boundary-canvas";
import Placeholder from "./Skeleton/placeholder";



interface StyledTooltipProps extends TooltipProps {
  className?: string;
}


const customIcon = L.icon({
  iconUrl: "assets/train_on_map_icon_idle.svg",
  iconSize: [38, 38], // adjust icon size as needed
  iconAnchor: [19, 38], // adjust anchor point as needed
  popupAnchor: [0, -38], // adjust popup anchor as needed
});

const customIconDelivered = L.icon({
  iconUrl: "/assets/train_on_map_icon_in_transit.svg",
  iconSize: [38, 38], // adjust icon size as needed
  iconAnchor: [19, 38], // adjust anchor point as needed
  popupAnchor: [0, -38], // adjust popup anchor as needed
});

const customIconIdle = L.icon({
  iconUrl: "/assets/train_on_map_icon.svg",
  iconSize: [38, 38], // adjust icon size as needed
  iconAnchor: [19, 38], // adjust anchor point as needed
  popupAnchor: [0, -38], // adjust popup anchor as needed
});


const createClusterCustomIconDelivered = function (cluster: any) {
  return divIcon({
    html: `<span class="cluster-icon-delivered">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true),
  });
};

const colorOfStatus = (status: string) => {
  switch (status) {
    case "In Plant":
      return "#174D68";
    case "In Transit":
      return "#F69805";
    case "Delivered":
      return "success";
    default:
      return "info";
  }
};

const bgColorOfStatus = (status: string) => {
  switch (status) {
    case "In Plant":
      return "#F4FCFC";
    case "In Transit":
      return "#FEF3E7";
    case "Delivered":
      return "success";
    default:
      return "info";
  }
};

interface ShipmentCardProps {
  index: number;
  shipment: any;
  handleShipmentSelection: (shipment: any) => void;
  handleNavigation: (unique_code: string) => void;
}

const ShipmentCard: React.FC<ShipmentCardProps> = ({
  index,
  shipment,
  handleShipmentSelection,
  handleNavigation,
}) => {
  const gpsFOIS =
    (shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0 &&
      shipment.trip_tracker?.last_location?.fois) || // Checking FOIS tracking
    (shipment.trip_tracker?.last_location?.gps?.coordinates.length > 0 &&
      shipment.trip_tracker?.last_location?.gps); // Checking FOIS tracking
  const isTracking = gpsFOIS && gpsFOIS.coordinates.length > 0 ? true : false;

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.stopPropagation();
    window.open(
      `${environment.PROD_BASE_URL}tracker?unique_code=${shipment.unique_code}`,
      "_blank"
    );
  };

  return (
    <Card
      style={{
        overflow: "hidden",
        backgroundColor: "#F5F5F5",
        position: "relative",
        borderRadius: "0px",
        boxShadow:'none'
      }}
      className="cardHover"
      onClick={(e) => {
        e.stopPropagation();
        handleShipmentSelection(shipment);
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          overflow: "hidden",
          borderRadius: "12px",
          marginInline: 12,
          marginBottom: 12,
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "0px",
            left: "8px",
            backgroundColor: "#42454E",
            fontSize: 12,
            color: "#fff",
            paddingInline: 5,
            paddingBlock: 3,
          }}
          className="card-sudo-element"
        >
          {shipment?.is_captive ? "Captive Rake" : "Indian Railways Rake"}
        </div>

        <CardContent>
          <Typography
            variant="h6"
            component="div"
            id="shipment-list-fnr"
            sx={{
              fontFamily: '"Inter", sans-serif !important',
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
              fontSize: "14px",
            }}
          >
            <div>
              #{" "}
              {shipment.all_FNRs ? (
                <a
                  onClick={handleLinkClick}
                  style={{
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: "blue",
                  }}
                >
                  {shipment.all_FNRs[0]}
                </a>
              ) : (
                "N/A"
              )}
              <span className="extraFnr-indicator">
                <span className="fnr-count">
                  {shipment.all_FNRs && shipment.all_FNRs.length > 1
                    ? `+${shipment.all_FNRs.length - 1} more`
                    : ""}
                </span>
                <span className="more-fnr-indicator">
                  {shipment.all_FNRs && shipment.all_FNRs.length > 1
                    ? shipment.all_FNRs
                        .slice(1)
                        .map((item: any, index: number) => {
                          return (
                            <div key={index} className="each-fnr">
                              {item}
                            </div>
                          );
                        })
                    : ""}
                </span>
              </span>
            </div>
            <div
              style={{
                color: colorOfStatus(statusBuilder(shipment.status)),
                backgroundColor: bgColorOfStatus(
                  statusBuilder(shipment.status)
                ),
                fontSize: 12,
                paddingInline: "8px",
                paddingBlock: "2px",
                width: "fit-content",
              }}
            >
              {statusBuilder(shipment.status)}
            </div>
          </Typography>

          <Typography sx={{ fontSize: 12 }} gutterBottom>
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginTop: "10px",
              }}
            >
              <div>
                <Image
                  src={CurrencyIcon.src}
                  alt="currency"
                  width={16}
                  height={16}
                />
              </div>
              <div>-</div>
              <div>
                <div>Current Location</div>
                <div style={{ fontWeight: 600 }}>
                  {shipment?.trip_tracker?.fois_last_location || "--"}
                </div>
              </div>
            </div>
          </Typography>

          <Typography
            sx={{ fontSize: 12 }}
            variant="body2"
            component="div"
            id="shipment-list-bottom"
          >
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginTop: "10px",
              }}
            >
              <div>
                <Image width={16} height={16} alt="drop" src={dropIcon} />
              </div>
              <div>-</div>
              <div>
                <div>Delivery Location</div>
                <div style={{ fontWeight: 600 }}>
                  {shipment.delivery_location?.name} (
                  {shipment.delivery_location?.code})
                </div>
              </div>
            </div>
          </Typography>
        </CardContent>
      </div>
    </Card>
  );
};

type StatusKey = "OB" | "ITNS" | "Delivered" | "none" | "AVE" | "INPL" | "ALL";

interface TrackingStatus {
  tracking: number;
  notTracking: number;
}
interface captive_rakes {
  captive: number;
  indian: number;
}
interface rakeType {
  captive: boolean;
  indian: boolean;
}

const searchOptions = [
  { value: "fnr", label: "FNR No.", placeholder: "Enter FNR No." },
  // { value: "dest", label: "Dest. Code", placeholder:'Enter Destination Code' },
  // { value: "crName", label: "CR Names", placeholder:'Enter CR Name' },
];

// Main Component for Map Layers
const MapLayers = () => {
  const { showMessage } = useSnackbar();
  const isMobile = useMediaQuery("(min-width:600px)");
  const [map, setMap] = useState<L.Map | null>(null);
  const center: [number, number] = [24.2654256, 78.9145218];
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  const [mobileShow, setMobileShow] = useState<boolean>(true);
  const [currentZoom, setCurrentZoom] = useState<number>(5);
  const [currentFocusstatus, setCurrentFocusstatus] = useState<any>("TOTAL");

  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [allShipments, setAllShipments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [inTransitCount, setInTransitCount] = useState<number>(0);
  const [idleCount, setIdleCount] = useState<number>(0);
  const [deliveryCount, setDeliveryCount] = useState<number>(0);
  const [idleShipments, setIdleShipments] = useState<any[]>([]);
  const [inTransitShipments, setInTransitShipments] = useState<any[]>([]);
  const [deliveredShipments, setDeliveredShipments] = useState<any[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<any[]>([]);
  const [searcedShipments, setSearchedShipments] = useState<any[]>([]);
  const [showSearched, setShowSearched] = useState<boolean>(false);
  const [showFiltered, setShowFiltered] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(true);
  const [isTotal, setIsTotal] = useState(true);
  const [showIdle, setShowIdle] = useState<boolean>(true);
  const [showInTransit, setShowInTransit] = useState<boolean>(true);
  const [showDelivered, setShowDelivered] = useState<boolean>(true);
  const [selectedFromDate, setSelectedFromDate] =
    React.useState<dayjs.Dayjs | null>(null);
  const [selectedToDate, setSelectedToDate] =
    React.useState<dayjs.Dayjs | null>(null);
  const [openFromDatePicker, setOpenFromDatePicker] = useState(false);
  const [openToDatePicker, setOpenToDatePicker] = useState(false);
  const [trackingNonTracking, setTrackingNonTracking] =
    useState<TrackingStatus>({ tracking: 0, notTracking: 0 });
  const [rakeType, setRakeType] = useState([
    "Captive Rakes",
    "Indian Railway Rakes",
  ]);
  const [showRakeTypeFiltered, setShowRakeTypeFiltered] = useState(false);
  const [rakeTypeFilteredShipments, setRakeTypeFilteredShipments] = useState<
    any[]
  >([]);
  const [isTracking, setIsTracking] = useState(0);
  const [filteredShipmentsBackup, setFilteredShipmentsBackup] = useState<any[]>(
    []
  );

  const [selectedType, setSelectedType] = useState("FNR No.");
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  const [inPlantCaptive, setInPlantCaptive] = useState<captive_rakes>({
    captive: 0,
    indian: 0,
  });
  const [inTransitCaptive, setInTransitCaptive] = useState<captive_rakes>({
    captive: 0,
    indian: 0,
  });
  const [deliveredCaptive, setDeliveredCaptive] = useState<captive_rakes>({
    captive: 0,
    indian: 0,
  });
  const [totalCaptive, setTotalCaptive] = useState<captive_rakes>({
    captive: 0,
    indian: 0,
  });

  const [headingFilters, setHeadingFilters] = useState("");
  const [headingColors, setHeadingColors] = useState("");

  const [trackingByFoisGps, setTrackingByFoisGps] = useState<any>({
    foiscount: 0,
    gpscount: 0,
  });
  const [trackingAvailed, setTrackingAvailed] = useState<any>(false);
  const [shipmentMapView, setShipmentMapView] = useState<any>([]);
  const [trackingTypeSelected, setTrackingTypeSelected] = useState<any>({
    fois: false,
    gps: false,
  });
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [hiddenTrackingInfo, setHiddenTrackingInfo] = useState<any>(false);

  const [crLabelName, setCrLabelName] = useState("");
  const [fnrTerm, setFnrTerm] = useState("");
  const [crNames, setCrNames] = useState<any[]>([]);
  const [inputCRValue, setInputCRValue] = useState("");
  const [selectedCR, setSelectedCR] = useState("");
  const [isCROpen, setIsCROpen] = useState(false);
  const [filteredCROptions, setFilteredCrOptions] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(searchOptions[0]);
  const [handleSearch, setHandleSearch] = useState<String | null>(null);
  const [is_outbound, setIs_outbound] = useState(true);

  useEffect(() => {
    if (!map) return;

    const fetchGeoJSON = async () => {
      try {
        const { features } = getIndiaMap();

        const indiaGeoJSON = {
          type: "FeatureCollection",
          features,
        };

        // Add boundary masking with the combined GeoJSON
        const osmLayer = (L.TileLayer as any).boundaryCanvas(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            boundary: indiaGeoJSON,
            attribution:
              '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          }
        );

        map.addLayer(osmLayer);

        // Add the claimed boundaries as a separate layer
        const claimedBoundaries = getBoundary();
        L.geoJSON(claimedBoundaries, {
          style: boundaryStyle,
        }).addTo(map);
      } catch (error) {
        console.error("Error fetching GeoJSON:", error);
      }
    };

    fetchGeoJSON();
  }, [map]);

  useEffect(() => {
    const fetchNames = async () => {
      const names = await httpsGet("get/captive_rakes_names", 0, router);
      if (names.data && names.data.length > 0) {
        setCrNames(names.data);
        setFilteredCrOptions(names.data);
      } else {
        setCrNames([]);
        setFilteredCrOptions([]);
      }
    };
    fetchNames();
  }, []);

  useEffect(() => {
    if (map) {
      map.on("zoomend", () => {
        setCurrentZoom(map.getZoom());
      });
    }
  }, [map]);

 
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsCROpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigation = (unique_code: string) => {
    setTimeout(() => {
      router.push(`/tracker?unique_code=${unique_code}`);
    }, 0);
  };

  useEffect(() => {
    if (rakeType.length === 1) {
      let data;
      let isCaptive = rakeType[0];
      if (showSearched) {
        data = searcedShipments.filter((val) => {
          if (isCaptive === "Captive Rakes") return val.is_captive === true;
          else return val.is_captive === false;
        });
        setRakeTypeFilteredShipments(data);
      } else if (showFiltered) {
        data = filteredShipments.filter((val) => {
          if (isCaptive === "Captive Rakes") return val.is_captive === true;
          else return val.is_captive === false;
        });
        setRakeTypeFilteredShipments(data);
      } else if (showAll) {
        data = allShipments.filter((val) => {
          if (isCaptive === "Captive Rakes") return val.is_captive === true;
          else return val.is_captive === false;
        });
        setRakeTypeFilteredShipments(data);
      }
      setShowRakeTypeFiltered(true);
    } else {
      setShowRakeTypeFiltered(false);
    }
  }, [rakeType, allShipments, searcedShipments, filteredShipments]);

  useEffect(() => {
    setShowSearched(false);
    setSearchInput("");
  }, [allShipments, filteredShipments]);


  const boundaryStyle = (feature: any) => {
    switch (feature.properties.boundary) {
      case "claimed":
        return {
          color: "#C2B3BF",
          weight: 2,
        };
      default:
        return {
          color: "",
          weight: 0,
        };
    }
  };

  const addIndiaBoundaries = () => {
    const b = getBoundary();
    if (map instanceof L.Map) {
      L.geoJSON(b, {
        style: boundaryStyle,
      }).addTo(map);
    } else {
      console.error("map is not a Leaflet map object");
    }
  };

  const getTrackingShipment = (shipments: any[]) => {
    const shipmentData = shipments
      .sort((a: any, b: any) => {
        return a.created_at - b.created_at;
      })
      .map((shipment: any) => {
        return {
          _id: shipment && shipment._id,
          FNR:
            shipment && shipment.all_FNRs ? shipment.all_FNRs.join(", ") : "",
          pickup:
            shipment &&
            shipment.pickup_location &&
            shipment.pickup_location.name
              ? shipment.pickup_location.name +
                " (" +
                shipment.pickup_location.code +
                ")"
              : "",
          delivery:
            shipment &&
            shipment.delivery_location &&
            shipment.delivery_location.name
              ? shipment.delivery_location.name +
                " (" +
                shipment.delivery_location.code +
                ")"
              : "",
          status: shipment && shipment.status ? shipment.status : "",
          gps:
            shipment &&
            ((shipment.trip_tracker?.last_location?.fois?.coordinates.length >
              0 &&
              shipment.trip_tracker?.last_location?.fois) ||
              (shipment.trip_tracker?.last_location?.gps?.coordinates.length >
                0 &&
                shipment.trip_tracker?.last_location?.gps)),
          tripTracker: shipment && shipment?.trip_tracker?.fois_last_location,
        };
      })
      .filter(
        (shipment: any) => shipment.gps && shipment.gps.coordinates.length > 0
      );
    return shipmentData;
  };

  const filterShipments = (status: StatusKey, event: any) => {
    let filteredShipments: any[] = [];
    setIsTracking(0);
    if (status === "AVE" || status === "OB" || status === "INPL") {
      setHiddenTrackingInfo(false);
      setHeadingFilters("In Plant");
      setHeadingColors("#3790CC");
      setShowInTransit(false);
      setShowIdle(true);
      filteredShipments = originalData.filter(
        (shipment: any) => shipment.status === "INPL"
      );
      setTrackingNonTracking(countTracking(filteredShipments));
      setTrackingByFoisGps(trackingByFoisGpsHook(filteredShipments));
      setShipmentMapView(filteredShipments);
      setTrackingTypeSelected({ fois: false, gps: false });
      const idle = getTrackingShipment(filteredShipments);
      setIdleShipments(idle);
    } else if (status === "ITNS") {
      setShowIdle(false);
      setShowInTransit(true);
      setHiddenTrackingInfo(false);
      setHeadingFilters("In Transit");
      setHeadingColors("#F6981D");
      filteredShipments = originalData.filter(
        (shipment: any) => shipment.status === "ITNS"
      );
      setTrackingNonTracking(countTracking(filteredShipments));
      setTrackingByFoisGps(trackingByFoisGpsHook(filteredShipments));
      setShipmentMapView(filteredShipments);
      setTrackingTypeSelected({ fois: false, gps: false });
      const inTransit = getTrackingShipment(filteredShipments);
      setInTransitShipments(inTransit);
    } else if (status === "ALL") {
      setShowIdle(true);
      setHiddenTrackingInfo(false);
      setHeadingFilters("Total");
      setHeadingColors("#40BE8A");
      filteredShipments = originalData.filter(
        (shipment: any) =>
          shipment.status === "ITNS" || shipment.status === "INPL"
      );
      // setTrackingNonTracking(countTracking(filteredShipments));
      // setTrackingByFoisGps(trackingByFoisGpsHook(filteredShipments))
      setShipmentMapView(filteredShipments);
      setTrackingTypeSelected({ fois: false, gps: false });
      const total = getTrackingShipment(filteredShipments);
      setShowInTransit(true);
      setInTransitShipments(total);
      setIdleShipments(total);
    }

    // setShowIdle(status === "OB");
    // setShowInTransit(status === 'ITNS');
    // setShowDelivered(status === "Delivered");
    setShowAll(false);
    setShowFiltered(true);
    const filteredWithTracking = filteredShipments.map((shipment) => {
      const gpsFois =
        (shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0 &&
          shipment.trip_tracker?.last_location?.fois) ||
        (shipment.trip_tracker?.last_location?.gps?.coordinates.length > 0 &&
          shipment.trip_tracker?.last_location?.gps);
      const isTracking =
        gpsFois && gpsFois.coordinates && gpsFois.coordinates.length > 0;
      return { ...shipment, isTracking };
    });
    setFilteredShipments(filteredWithTracking);
    setFilteredShipmentsBackup(filteredWithTracking);
    map?.flyTo(center, 5, { duration: 1 });
  };

  const getShipments = async (fnr: string, selectedCRID: string) => {
    let payload: any = {
      from: selectedFromDate
        ? service.millies(selectedFromDate.format())
        : null,
      to: selectedToDate ? service.millies(selectedToDate.format()) : null,
      is_outbound,
    };

    if (fnr.length === 11) {
      payload["fnr"] = fnr;
    }

    if (selectedCRID) {
      payload["captive"] = selectedCRID;
    }

    setIsTracking(0);
    const shipments = await httpsPost("/shipment_map_view", payload, router);
    const inTransit = shipments.filter(
      (shipment: any) => shipment.status === "ITNS"
    );
    const idle = shipments.filter(
      (shipment: any) => shipment.status === "INPL"
    );
    const delivered = shipments.filter(
      (shipment: any) => shipment.status === "Delivered"
    );
    setTotalCount(shipments.length);
    setInTransitCount(inTransit.length);
    setIdleCount(idle.length);
    setDeliveryCount(delivered.length);

    setInTransitCaptive(getCaptiveIndianRakes(inTransit));
    setDeliveredCaptive(getCaptiveIndianRakes(delivered));
    setInPlantCaptive(getCaptiveIndianRakes(idle));
    setTotalCaptive(getCaptiveIndianRakes(shipments));

    setHeadingFilters("In Transit");
    setHeadingColors("#F6981D");
    setTrackingByFoisGps(trackingByFoisGpsHook(inTransit));
    setShipmentMapView(inTransit);
    setTrackingTypeSelected({ fois: false, gps: false });

    const inTransitShips = getTrackingShipment(inTransit);
    const idleShips = getTrackingShipment(idle);
    const deliveredShips = getTrackingShipment(delivered);
    setInTransitShipments(inTransitShips);
    setIdleShipments(idleShips);
    setDeliveredShipments(deliveredShips);
    setShowAll(true);
    setShowFiltered(false);
    setShowIdle(true);
    setShowInTransit(true);
    setShowDelivered(true);
    setTrackingNonTracking(countTracking(inTransit));

    const allShipmentsWithTracking = [...inTransit, ...idle].map((shipment) => {
      const gpsFois =
        (shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0 &&
          shipment.trip_tracker?.last_location?.fois) ||
        (shipment.trip_tracker?.last_location?.gps?.coordinates.length > 0 &&
          shipment.trip_tracker?.last_location?.gps);
      const isTracking =
        gpsFois && gpsFois.coordinates && gpsFois.coordinates.length > 0;
      return { ...shipment, isTracking };
    });
    setOriginalData(shipments);
    setAllShipments(allShipmentsWithTracking);
  };

  useEffect(() => {
    if (map) {
      addIndiaBoundaries();
    }
  }, [map]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const toTime = toParam ? dayjs(toParam) : dayjs();
    const fromTime = fromParam ? dayjs(fromParam) : toTime.subtract(30, "day");
    setSelectedFromDate(fromTime.subtract(1, "day"));
    setSelectedToDate(toTime.subtract(1, "day"));
  }, []);

  useEffect(() => {
    if (selectedFromDate && selectedToDate) {
      getShipments("", "");
    }
  }, [selectedFromDate, selectedToDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (target && target.nodeType === Node.ELEMENT_NODE) {
        if (!(target as Element).closest(".table-rows-container")) {
          setSelectedShipment(null);
          if (selectedMarkerRef.current) {
            selectedMarkerRef.current.closePopup();
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(()=>{
    if(handleSearch !== null &&handleSearch.length === 0 ){ 
      getShipments("", "");
      setCurrentFocusstatus('TOTAL')
    }
  },[handleSearch])

  const handleShipmentSelection = (shipment: any) => {
    if (selectedShipment && selectedShipment._id === shipment._id) {
      setSelectedShipment(null);
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.closePopup();
      }
      map?.flyTo(center, 5, { duration: 1 });
    } else {
      setSelectedShipment(shipment);
      focusOnShipment(shipment);
    }
  };

  const focusOnShipment = (shipment: any) => {
    const gpsFois =
      (shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0 &&
        shipment.trip_tracker?.last_location?.fois) ||
      (shipment.trip_tracker?.last_location?.gps?.coordinates.length > 0 &&
        shipment.trip_tracker?.last_location?.gps);
    if (map && gpsFois && gpsFois.coordinates.length > 0) {
      const point = L.latLng(gpsFois.coordinates[1], gpsFois.coordinates[0]);
      map.flyTo(point, 13, { duration: 1 });

      setTimeout(() => {
        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.openPopup();
        }
      }, 1250);
    } else {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.closePopup();
      }
      map?.flyTo(center, 5, { duration: 1 });
    }
  };

  return (
    <div>
      <div className="shipment-map-container">
        {isMobile ? <SideDrawer /> : null}
        <div style={{ width: "100%", overflow: "hidden" }}>
          {isMobile ? (
            <Header
              title="Shipments Map View"
              isMapHelper={false}
              isShipmentMapView={true}
            ></Header>
          ) : (
            <MobileHeader />
          )}
          <div
            style={{
              position: "relative",
              backgroundColor: "red",
              height: "100vh",
              width: "100vw",
            }}
          >
            <MapContainer
              className="map"
              id="shipment-map"
              center={center}
              zoomControl={false}
              zoom={5.4}
              style={{
                height: "100%",
                width: "100%",
                zIndex: "0",
                position: "fixed",
                left: 0,
              }}
              attributionControl={false}
              ref={setMap}
            >
              {/* <div className={"layersControl"}>
                <LayersControl>
                  <LayersControl.BaseLayer checked name="Street View">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Satellite View">
                    <TileLayer
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
              </div> */}

              {showIdle &&
                idleShipments.length &&
                idleShipments
                  .filter((shipment: any) => shipment.status === "INPL")
                  .map((shipment, index) => {
                    const circleIconInplant = L.divIcon({
                      className: "circle-icon",
                      html: `<div style="width: 13px; height: 13px; border-radius: 50%; background-color: #174D68; border: 1px solid white"></div>`,
                      iconSize: [10, 10],
                      iconAnchor: [5, 5],
                      popupAnchor: [0, -10],
                    });
                    return (
                      <Marker
                        key={index}
                        icon={
                          currentZoom > 9 ? customIconIdle : circleIconInplant
                        }
                        position={[
                          shipment.gps.coordinates[1],
                          shipment.gps.coordinates[0],
                        ]}
                        ref={(el) => {
                          if (
                            selectedShipment &&
                            selectedShipment._id === shipment._id
                          ) {
                            selectedMarkerRef.current = el;
                          }
                        }}
                      >
                        <Popup>
                          <Typography variant="h6" component="div">
                            # {shipment.FNR}
                          </Typography>
                          <Typography variant="body2" component="div">
                            <Grid container>
                              <Grid item xs={12}>
                                <Typography
                                  variant="body2"
                                  component="div"
                                  sx={{ display: "flex" }}
                                >
                                  <div className="dropLabel">D</div>
                                  <div>
                                    <Image
                                      height={10}
                                      alt="drop"
                                      src={dropIcon}
                                    />{" "}
                                    - {shipment.delivery}
                                  </div>
                                </Typography>
                                <Typography sx={{ fontSize: "12px" }}>
                                  {shipment?.tripTracker}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Typography>
                        </Popup>
                      </Marker>
                    );
                  })}

              {showInTransit &&
                inTransitShipments.length &&
                inTransitShipments.filter((shipment: any) => shipment.status === "ITNS").map((shipment, index) => {
                  const circleIcon = L.divIcon({
                    className: "circle-icon",
                    html: `<div style="width: 13px; height: 13px; border-radius: 50%; background-color: #F6981D; border: 1px solid white"></div>`,
                    iconSize: [10, 10],
                    iconAnchor: [5, 5],
                    popupAnchor: [0, -10],
                  });
                  return (
                    <Marker
                      key={index}
                      position={[
                        shipment.gps.coordinates[1],
                        shipment.gps.coordinates[0],
                      ]}
                      icon={currentZoom > 9 ? customIcon : circleIcon}
                      ref={(el) => {
                        if (
                          selectedShipment &&
                          selectedShipment._id === shipment._id
                        ) {
                          selectedMarkerRef.current = el;
                        }
                      }}
                    >
                      <Popup>
                        <Typography variant="h6" component="div">
                          # {shipment.FNR}
                        </Typography>
                        <Typography variant="body2" component="div">
                          <Grid container>
                            <Grid item xs={12}>
                              <Typography
                                variant="body2"
                                component="div"
                                sx={{ display: "flex" }}
                              >
                                <div className="dropLabel">D</div>
                                <div>
                                  <Image
                                    height={10}
                                    alt="drop"
                                    src={dropIcon}
                                  />{" "}
                                  - {shipment.delivery}
                                </div>
                              </Typography>
                              <Typography sx={{ fontSize: "12px" }}>
                                {shipment?.tripTracker}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Typography>
                      </Popup>
                    </Marker>
                  );
                })}

              {/* <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIconDelivered}>
                {showDelivered && deliveredShipments.length && deliveredShipments.map((shipment, index) => {
                  return <Marker key={index} position={[shipment.gps.coordinates[1], shipment.gps.coordinates[0]]} icon={customIconDelivered} ref={(el) => {
                    if (selectedShipment && selectedShipment._id === shipment._id) {
                      selectedMarkerRef.current = el;
                    }
                  }}>
                    <Popup>
                      <Typography variant="h6" component="div">
                        # {shipment.FNR}
                      </Typography>
                      <Typography variant="body2" component="div">
                        <Grid container>
                          <Grid item xs={12}>
                                <Typography variant="body2" component="div">
                                  <Image height={10} alt="pickup" src={pickupIcon} /> - {shipment.pickup}
                                </Typography>
                              </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" component="div" sx={{ display: 'flex' }}>
                              <div className='dropLabel'>D</div><div><Image height={10} alt="drop" src={dropIcon} /> - {shipment.delivery}</div>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Typography>
                    </Popup>
                  </Marker>
                })
                }
              </MarkerClusterGroup> */}
            </MapContainer>

            <Box
              sx={{
                paddingTop: isMobile ? "56px" : 0,
                marginLeft: isMobile ? "70px" : 0,
                backgroundColor: "#F5F5F5",
                position: "absolute",
                left: "0",
                height: isMobile ? "100vh" : "40vh",
                boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                width: isMobile ? "386px" : "100vw",
                bottom: 0,
                minHeight: isMobile ? "100vh" : "300px",
                borderTopLeftRadius: isMobile ? "0px" : "12px",
                borderTopRightRadius: isMobile ? "0px" : "12px",
                transition: "all 0.5s ease-in-out",
                transform: isMobile
                  ? ""
                  : mobileShow
                  ? "translateY(0)"
                  : "translateY(92%)",
                overflowY: "scroll",
              }}
            >
              {!isMobile && (
                <div
                  style={{
                    backgroundColor: "#E5E1DA",
                    width: "100px",
                    height: 6,
                    marginTop: 8,
                    borderRadius: 12,
                    marginInline: "auto",
                  }}
                  id="slider"
                  onClick={() => {
                    setMobileShow(!mobileShow);
                  }}
                ></div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: isMobile ? "space-between" : "space-around",
                  alignItems: "center",
                  gap: 10,
                  paddingInline: isMobile ? "12px" : "12px",
                  marginTop: isMobile ? "12px" : "10px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    width: "100%",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08)",

                  }}
                >
                  <CustomDatePicker
                    label="From"
                    value={selectedFromDate ? selectedFromDate.toDate() : null}
                    onChange={(date) =>
                      setSelectedFromDate(date ? dayjs(date) : null)
                    }
                  />
                </div>
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    width: "100%",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08)",

                  }}
                >
                  <CustomDatePicker
                    label="To"
                    value={selectedToDate ? selectedToDate.toDate() : null}
                    onChange={(date) =>
                      setSelectedToDate(date ? dayjs(date) : null)
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "6px",
                  marginTop: "12px",
                  padding: "12px 12px 0px 12px",
                  marginInline: "12px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08)",

                }}
              >
                <header
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    paddingBottom: "10px",
                    borderBottom: "1px solid #E5E1DA",
                  }}
                >
                  Tracking Status
                </header>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "6px",
                    gap: 10,
                  }}
                >
                  <div
                    onClick={(e) => {
                      filterShipments("ALL", e);
                      setIsTotal(false);
                      setCurrentFocusstatus("TOTAL");
                    }}
                    id="total"
                    className={currentFocusstatus === "TOTAL" ? "active" : ""}
                    style={{ flex: 1, alignContent: "center" }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: "24px" }}>
                      {idleCount + inTransitCount}
                    </div>
                    <div style={{ fontSize: 12 }}>Total</div>
                  </div>

                  <div
                    onClick={(e) => {
                      filterShipments("INPL", e);
                      setIsTotal(false);
                      setCurrentFocusstatus("INPL");
                    }}
                    id="inpl"
                    className={currentFocusstatus === "INPL" ? "active" : ""}
                    style={{ flex: 1 }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: "24px" }}>
                      {idleCount}
                    </div>
                    <div style={{ fontSize: 12 }}>In Plant</div>
                  </div>

                  <div
                    onClick={(e) => {
                      filterShipments("ITNS", e);
                      setIsTotal(false);
                      setCurrentFocusstatus("ITNS");
                    }}
                    id="itns"
                    className={currentFocusstatus === "ITNS" ? "active" : ""}
                    style={{ flex: 1 }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: "24px" }}>
                      {inTransitCount}
                    </div>
                    <div style={{ fontSize: 12 }}>In Transit</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  height: "40px",
                  minHeight: "40px",
                  marginTop: "12px",
                  backgroundColor: "white",
                  marginInline: "12px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      height: "40px",
                      backgroundColor: "#A4ABFF",
                      borderRadius: "7px 0px 0px 7px",
                      width: "100px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onClick={() => {setIsDropdownOpen(!isDropdownOpen)}} 
                  >
                    <div style={{ fontSize: 12, cursor: "pointer" }}>
                      {selectedOption?.label}
                    </div>
                    {/* <ArrowDropDownIcon /> */}
                    {/* ---selection Options--- */}
                    <div>
                      {isDropdownOpen && (
                        <div id='optionsContainer'>
                          {searchOptions.filter(
                            (option) => option.value !== selectedOption?.value
                          ).map((option, index) => (
                            <div key={index}
                              style={{ padding: "12px 16px", cursor: "pointer" }}
                              className="options"
                              onClick={()=>{setSelectedOption(option);}}
                            >{option.label}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    style={{
                      height: "40px",
                      width: "60%",
                      border: "none",
                      outline: "none",
                      padding: "0px 4px",
                    }}
                    placeholder={selectedOption?.placeholder}
                    onChange={(e) => setHandleSearch(e.target.value)}
                  />
                </div>
                <div style={{ marginTop: 4, marginRight: 12, cursor: "pointer" }}
                  onClick={()=>{
                    if(selectedOption.value === 'fnr'){
                      getShipments(handleSearch?.toString() ?? '', "");
                    }else if (selectedOption.value === 'crName') {
                      getShipments("", handleSearch?.toString() ?? '');
                    }
                    setCurrentFocusstatus("");
                  }}
                >
                  <Image
                    src={searchIcon.src}
                    alt="searchIcon"
                    height={20}
                    width={20}
                  />
                </div>
              </div>

              <Box sx={{}} className="shipment-details-container">
                {showFiltered &&
                  !showSearched &&
                  !showRakeTypeFiltered &&
                  filteredShipments.map((shipment, index) => {
                    return (
                      <ShipmentCard
                        key={index}
                        index={index}
                        shipment={shipment}
                        handleShipmentSelection={handleShipmentSelection}
                        handleNavigation={handleNavigation}
                      />
                    );
                  })}
                {showAll &&
                  !showSearched &&
                  !showRakeTypeFiltered &&
                  allShipments.map((shipment, index) => {
                    return (
                      <ShipmentCard
                        key={index}
                        index={index}
                        shipment={shipment}
                        handleShipmentSelection={handleShipmentSelection}
                        handleNavigation={handleNavigation}
                      />
                    );
                  })}
                {showSearched &&
                  !showRakeTypeFiltered &&
                  searcedShipments.map((shipment, index) => {
                    return (
                      <ShipmentCard
                        key={index}
                        index={index}
                        shipment={shipment}
                        handleShipmentSelection={handleShipmentSelection}
                        handleNavigation={handleNavigation}
                      />
                    );
                  })}
                {showRakeTypeFiltered &&
                  rakeTypeFilteredShipments.map((shipment, index) => {
                    return (
                      <ShipmentCard
                        key={index}
                        index={index}
                        shipment={shipment}
                        handleShipmentSelection={handleShipmentSelection}
                        handleNavigation={handleNavigation}
                      />
                    );
                  })}
              </Box>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLayers;
