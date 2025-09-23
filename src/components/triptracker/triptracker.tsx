"use client"
import { useState,useEffect } from "react";
import Image from 'next/image';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Eye,
  Package,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building2,
  Satellite,
  Smartphone,
  Maximize,
  Radio,
  MessageCircle,
  AlertTriangle,
  Navigation,
 // Add this for Fastag
  AppWindow,
 
  AlertOctagon
} from "lucide-react"
import { HelpModal } from "./help-modal"
import { FileText, Image as ImageIcon, Download, X, Receipt } from "lucide-react"
import "./triptracker.css"
// import KeplerMap from "./map/Kepler-map"; // or "../map/KeplerMap" if you rename the file
// To this:
import NextImage from "next/image";
import dynamic from "next/dynamic"

// // Add this line with your other imports
import TollGateIcon from '../../assets/toll_gate_icon_passed.svg';
import Mapmark from '../../assets/mapMarker.svg';
import fullLogo from '@/assets/SmartTruck_tracker.svg'

// import type { ViewState } from "react-map-gl";
// import type { MapRef } from "react-map-gl";


import { Ruler, BadgeCheck, PauseCircle, GitBranch } from "lucide-react" // NEW
// import type { MapState } from "react-map-gl"
const KeplerMap = dynamic(
  () => import('./map/Kepler-map'), 
  { 
    ssr: false, // This is the key: it disables server-side rendering
    loading: () => <div style={{
      height: "100%", 
      background: "#f0f0f0", display: "grid", placeContent: "center"}}>Loading Map...</div> 
  }
);

export function TripTrackingDashboard({ uniqueCode }: { uniqueCode?: string }) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    tripOverview: false,
    vehicleDriver: false,
    tripMetadata: true,
    locations: false,
    journeyProgress: false,
    routeInsights: false,
    liveTracking: false,
    timeline: false,
    alerts: false,
    performance: true,
    tracking: true,
    info: false, 
  })

  interface MapPoint {
    coordinates: number[];
    name: string;
    isCurrent: boolean;
}
interface ShipmentStop {
  location: Location;
  sequence: number;
  arrived_at?: string;
  finished_at: string;
}
interface FormattedLocation {
  id?: string; // Add this if you use it for the key
  kind?: 'pickup' | 'drop';
  name: string;
  date: string;
  time: string;
}
// Add this interface along with your other interfaces
interface FormattedStop {
  id?: string; // Add if used for the key
  kind: 'pickup' | 'drop';
  name: string;
  date: string;
  time: string;
}
interface Location {
  id: string;
  name: string;
  address: string;
  geo_point: {
    coordinates: number[];
  };
}
interface Invoice {
  total_gross_weight?: number; // Use optional '?' if the property might not exist
  total_nop?: number; // Use optional '?' if the property might not exist
  // Add other properties from your API response if needed
}
  // NEW — which tab is active inside the combined card
const [activeInfoTab, setActiveInfoTab] = useState<"vehicle" | "metadata">("vehicle")
const [tollHistoryData, setTollHistoryData] = useState<any[]>([]);
const [haltData, setHaltData] = useState<any[]>([]);
// Add this with your other useState hooks
const [isPdfLoading, setIsPdfLoading] = useState(false);
// Add this line with your other useState hooks
const [epodLinks, setEpodLinks] = useState<string[]>([]);
const [etaDelta, setEtaDelta] = useState({ isLate: false, hours: 0, minutes: 0 });
// CHANGED — add `info`; you can delete `vehicleDriver` and `tripMetadata` if no longer used
const [apiData, setApiData] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isSatelliteViewLocal, setIsSatelliteViewLocal] = useState(false);
const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
const [intermediates, setIntermediates] = useState<FormattedStop[]>([]);

  const [isMapFull, setIsMapFull] = useState(false)      // <-- NEW state
  const [mapMode, setMapMode] = useState<"location" | "map">("location")
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  // This single state object controls the entire map's behavior
const [mapState, setMapState] = useState({
  mode: 'location', // 'location' or 'map'
  showHalts: false,
  showDeviations: false,
});
  // simple example data for map (replace with your real points)
  // const points = [                                       // <-- NEW sample (or wire your data)
  //   {coordinates: [72.8777, 19.0760], ts: Date.now()-86400000, source: "GPS"},
  //   {coordinates: [73.8567, 18.5204], ts: Date.now()-43200000, source: "SIM"},
  //   {coordinates: [86.2029, 22.8046], ts: Date.now()-100000,    source: "APP"},
  // ] as any

  const [activeTimelineTab, setActiveTimelineTab] = useState<"timeline" | "tollHistory" | "documents">("timeline")
  // const ePods = [
  //   { id: "epod1", name: "ePOD - Gate 3", url: "/epods/epod1.jpg", thumb: "/epods/epod1-thumb.jpg" },
  //   { id: "epod2", name: "ePOD - Delivery Note", url: "/epods/epod2.jpg", thumb: "/epods/epod2-thumb.jpg" },
  //   { id: "epod3", name: "ePOD - Driver Sign", url: "/epods/epod3.jpg", thumb: "/epods/epod3-thumb.jpg" },
  // ]
  // ADDED — confirm popover + map highlight flags
const [confirm, setConfirm] = useState<{ open: boolean; kind?: "deviation" | "stoppage" }>({ open: false });

const [showDeviationsOnMap, setShowDeviationsOnMap] = useState(false);
const [showStoppagesOnMap, setShowStoppagesOnMap] = useState(false);
const [destinations, setDestinations] = useState<FormattedLocation[]>([]);
const [deviationCount, setDeviationCount] = useState(0);
const [totalDeviationDistance, setTotalDeviationDistance] = useState(0);

const formatEta = (utcString: any) => {
  if (!utcString) return 'N/A';

  const date = new Date(utcString);

  // Add the explicit type annotation here
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('en-GB', options);
  return formatter.format(date).replace(',', '');
};


const formatTimestamp = (timestamp: string | undefined, type: 'full' | 'date' | 'time' = 'full'): string => {
  if (!timestamp) {
    return 'N/A';
  }

  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata', // Explicitly specify IST
  };

  const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  if (type === 'date') return formattedDate;
  if (type === 'time') return formattedTime;

  // Default to full format
  return `${formattedDate}, ${formattedTime}`;
};

// --- Derived helpers (no duplicates) -------------------------

// picks everything between origin and final

// --- UI state (no duplicates) --------------------------------
const [showAllStops, setShowAllStops] = useState(false);   // for intermediates
const [showAllDests, setShowAllDests] = useState(false);  
const [openTooltipId, setOpenTooltipId] = useState(null);
// This useEffect manages a timeout to hide the PDF loader
// HIGHLIGHT: Add this new state for halt points
const [showHaltPointsOnMap, setShowHaltPointsOnMap] = useState(false);

  // This effect runs whenever the modal's open state changes
// ADDED — open/close + confirm actions
const openConfirm = (kind: "deviation" | "stoppage") => setConfirm({ open: true, kind });
const closeConfirm = () => setConfirm({ open: false });

useEffect(() => {
  // This code runs every time showHaltPointsOnMap changes
  console.log("The new state for showHaltPointsOnMap is:", showHaltPointsOnMap);
}, [showHaltPointsOnMap]);
const confirmYes = () => {
  // Check the kind of confirmation to determine the action
  if (confirm.kind === "stoppage") {
   
    setMapState({ mode: 'map', showHalts: true, showDeviations: false });
    // console.log("Confirming stoppage. The new mapState is:",MapState);
    console.log("Confirming stoppage. showHaltPointsOnMap is now true.");
  } else if (confirm.kind === "deviation") {
    setMapState({ mode: 'map', showHalts: false, showDeviations: true });
    // Handle deviation confirmation
    setShowDeviationsOnMap(true);
    setShowHaltPointsOnMap(false);
    setShowStoppagesOnMap(false);
    console.log("Confirming deviation. showDeviationsOnMap is now true.");
  }
  // Close the confirmation popup
  closeConfirm();
};
  // document modal state
  const [docModal, setDocModal] = useState<{ open: boolean; doc?: { id: string; name: string; url: string } }>({ open: false })
  
  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }))
  }

  const [shipmentStatus, setShipmentStatus] = useState("");
  const [statusClass, setStatusClass] = useState("loading");
  const [disableRefresh, setDisableRefresh] = useState(false);
  const handleKpiClick = (kpiId:any) => {
    setOpenTooltipId(openTooltipId === kpiId ? null : kpiId);
  }
  const getShipmentStatus = (statusCode: string) => {
    console.log("shipment is called");
    let status = "";
  
    let statusClass = "";
  
    switch (statusCode) {
      case "PNDG":
        status = "Pending";
        statusClass = "pending";
        console.log("The statusClass for CPTD is:", statusClass); 
        break;
      case "ALC":
        status = "Allocated";
        statusClass = "allocated";
        console.log("The statusClass for CPTD is:", statusClass); 
        break;
      case "ACPT":
        status = "Accepted";
        statusClass = "accepted";
        console.log("The statusClass for CPTD is:", statusClass); 
        break;
      case "ASN":
        status = "Assigned";
        statusClass = "assigned";
        console.log("The statusClass for CPTD is:", statusClass); 
        break;
      case "ITNS":
        status = "In Transit";
        statusClass = "in-transit";
        console.log("The statusClass for CPTD is:", statusClass); 
        break;
      case "SP":
        status = "Towards Pickup";
        statusClass = "in-transit";
        console.log("The statusClass for CPTD is:", statusClass); 
        break;
      case "AP":
        status = "At Pickup";
        statusClass = "at-location";
        console.log("The statusClass for CPTD is:", statusClass); 
        break;
      case "ALD":
        status = "At Delivery";
        statusClass = "at-location";
        console.log("The statusClass for CPTD is:", statusClass); 
        break;
      case "ABTR":
        status = "About to Reach";
        statusClass = "in-transit";
        console.log("The statusClass for CPTD is:", statusClass); 
        break;
      case "CPTD":
        status = "Delivered";
        statusClass = "Delivered";
        console.log("The statusClass for CPTD is:", statusClass); 
      
   
        break;
      case "CNCL": // Assuming 'CNCL' for cancelled
        status = "Cancelled";
        statusClass = "cancelled";
        console.log("The statusClass for CPTD is:", statusClass); 
      
        break;
      default:
        status = statusCode || "Unknown"; // Fallback to the code itself or 'Unknown'
        statusClass = "unknown";
        console.log("The statusClass for CPTD is:", statusClass); 
        break;
    }
    return { status, disableRefresh, statusClass };
  };
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

// This useEffect handles the main shipment data
const [pathData, setPathData] = useState({ sim: [], app: [], gps: [] });
useEffect(() => {
  const fetchShipmentData = async () => {
    try {
      setLoading(true);
 
      const shipmentResponse = await fetch(`https://live-api.instavans.com/api/raccoon/shipment?unique_code=${encodeURIComponent(uniqueCode ?? '')}`);
      if (!shipmentResponse.ok) throw new Error(`Shipment API error! Status: ${shipmentResponse.status}`);
      const shipmentData = await shipmentResponse.json();
      setApiData(shipmentData.shipment);
      // Extract deviation count and total distance
      const deviations = shipmentData.shipment.deviation?.deviations || [];
      const deviationCountFromApi = deviations.length;
      const totalDistanceOffRoute = deviations.reduce((sum: number, deviation: any) => {
        return sum + (deviation.distance || 0);
      }, 0);
      setDeviationCount(deviationCountFromApi);
      setTotalDeviationDistance(totalDistanceOffRoute);
      // Debug logging
      console.log("Deviation Count:", deviationCountFromApi);
      console.log("Total Deviation Distance:", totalDistanceOffRoute);
      console.log("Individual Deviations:", deviations.map((d: { distance: any; duration: any; }) => ({ distance: d.distance, duration: d.duration })));
      const allPickups  = shipmentData.shipment.pickups;
      setIntermediates(allPickups.slice(1).map((p:ShipmentStop)=> ({
        ...p,
        name: p.location.name,
        date: formatTimestamp(p.finished_at),
        time: formatTimestamp(p.finished_at)
      })));
      const allDeliveries = shipmentData.shipment.deliveries;
      
      setDestinations(allDeliveries.slice(0, -1).map((d: ShipmentStop) => ({
        ...d,
        name: d.location.name,
        date: formatTimestamp(d.finished_at),
        time: formatTimestamp(d.finished_at)
      })));
      calculateEtaDelta(
        shipmentData.shipment.delivery_date,
        shipmentData.shipment.deliveries[shipmentData.shipment.deliveries.length - 1]?.finished_at
      );
      
      if (shipmentData.shipment?.latest_status) {
        const { status, statusClass } = getShipmentStatus(shipmentData.shipment.latest_status);
        setShipmentStatus(status);
        setStatusClass(statusClass);
      }
      
      const newMapPoints: MapPoint[] = [
        {
          coordinates: shipmentData.shipment.pickups[0].location.geo_point.coordinates,
          name: shipmentData.shipment.pickups[0].location.name,
          isCurrent: false,
        },
        {
          coordinates: shipmentData.shipment.deliveries[0].location.geo_point.coordinates,
          name: shipmentData.shipment.deliveries[0].location.name,
          isCurrent: false,
        },
      ];
      if (shipmentData.shipment.trip_tracker?.last_location) {
        newMapPoints.push({
          coordinates: shipmentData.shipment.trip_tracker.last_location,
          name: shipmentData.shipment.trip_tracker.last_location_address,
          isCurrent: true,
        });
      }
      setMapPoints(newMapPoints);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchShipmentData();
}, [refreshTrigger]);

// This useEffect handles the toll history data
useEffect(() => {
  const fetchTollHistory = async () => {
    try {
      const tollResponse = await fetch(`https://live-api.instavans.com/api/raccoon/toll_history?unique_code=${encodeURIComponent(uniqueCode ?? '')}`);
      if (!tollResponse.ok) throw new Error(`Toll API error! Status: ${tollResponse.status}`);
      const tollData = await tollResponse.json();
      setTollHistoryData(tollData.data);
    } catch (err: any) {
      console.error("Failed to fetch toll data:", err);
    }
  };
  fetchTollHistory();
}, [refreshTrigger]);

// This useEffect handles the trails data
useEffect(() => {
  const fetchTrails = async () => {
    try {
      const trailsResponse = await fetch(`https://live-api.instavans.com/api/raccoon/trails?unique_code=${encodeURIComponent(uniqueCode ?? '')}`);
      if (!trailsResponse.ok) throw new Error(`Trails API error! Status: ${trailsResponse.status}`);
      const trailsData = await trailsResponse.json();
  
      setTimelineData(trailsData.trails);
    } catch (err: any) {
      console.error("Failed to fetch trails data:", err);
    }
  };
  fetchTrails();
}, [refreshTrigger]);

// This useEffect handles the ePOD data
useEffect(() => {
  const fetchEpods = async () => {
    try {
      const epodsResponse = await fetch(`https://live-api.instavans.com/api/raccoon/epods?unique_code=${encodeURIComponent(uniqueCode ?? '')}`);
      if (!epodsResponse.ok) throw new Error(`ePODs API error! Status: ${epodsResponse.status}`);
      const epodsData = await epodsResponse.json();
      const urls = epodsData.epods?.deliveries?.flatMap((delivery: any) => delivery.epods) || [];
      setEpodLinks(urls);
    } catch (err: any) {
      console.error("Failed to fetch ePODs data:", err);
    }
  };
  fetchEpods();
}, [refreshTrigger]);

// This useEffect handles the halt data
useEffect(() => {
  const fetchHaltData = async () => {
    try {
      const haltResponse = await fetch(`https://live-api.instavans.com/api/raccoon/halt?unique_code=${encodeURIComponent(uniqueCode ?? '')}`);
      if (!haltResponse.ok) throw new Error(`Halt API error! Status: ${haltResponse.status}`);
      const haltData = await haltResponse.json();
      setHaltData(haltData);
    } catch (err: any) {
      console.error("Failed to fetch halt data:", err);
    }
  };
  fetchHaltData();
}, [refreshTrigger]);


// This useEffect manages a timeout to hide the PDF loader
useEffect(() => {
  let timer: NodeJS.Timeout;
  if (docModal.open) {
    // Hide the loader after 5 seconds, even if onLoad doesn't fire
    timer = setTimeout(() => {
      setIsPdfLoading(false);
    }, 5000); // 5 seconds
  }

  // Cleanup function to clear the timer if the modal is closed early
  return () => {
    clearTimeout(timer);
  };
}, [docModal.open]); // This effect runs whenever the modal's open state changes

// Corrected code for TripTrackingDashboard.tsx
const handleToggleMapView = () => {
  // setMapMode(prevMode => {
 
  //   if (prevMode === 'map') {
  //     setShowHaltPointsOnMap(false);
  //     return 'location';
  //   } else {
  //     return 'map';
  //   }
  // });
  setMapState(prev => ({
    ...prev,
    mode: prev.mode === 'map' ? 'location' : 'map',
    // We also reset the filters when toggling off
    showHalts: prev.mode === 'map' ? false : prev.showHalts,
    showDeviations: prev.mode === 'map' ? false : prev.showDeviations,
  }));
};

const calculateTotalHaltDuration = (data: any[]) => {
  const totalMinutes = data.reduce((sum, halt) => sum + (halt.halt_duration || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours}h ${minutes}m total`;
};


const findLongestHalt = (data: any[]) => {
  if (data.length === 0) return 'N/A';
  const longestHalt = data.reduce((longest, current) => {
    return (current.halt_duration || 0) > (longest.halt_duration || 0) ? current : longest;
  }, data[0]);

  const durationInMinutes = longestHalt.halt_duration;
  const durationHours = Math.floor(durationInMinutes / 60);

  // FIX: Using Math.floor() to prevent rounding up and get the correct minute value.
  const remainingMinutes = Math.floor(durationInMinutes % 60);

  const durationText = `${durationHours}h ${remainingMinutes}m`;
  const address = longestHalt.address || 'Unknown location';
  
  return `${durationText} at ${address.split(',')[0]}`;
};
const totalStoppagesCount = haltData.length;
const totalHaltDurationText = calculateTotalHaltDuration(haltData);
const longestHaltText = findLongestHalt(haltData);
const pickupLocations = apiData?.pickups || [];
const deliveryLocations = apiData?.deliveries || [];
const originLocation = pickupLocations?.[0];
const intermediateStops = pickupLocations.slice(1);
const finalDestination = deliveryLocations?.[deliveryLocations.length - 1];
const lastDelivery = apiData?.deliveries?.[apiData.deliveries.length - 1];
// Add these variables before the 'return' statement
const totalDistanceKm = Math.round(((apiData?.estimated?.distance || 0)) / 1000);
const travelledDistanceKm = Math.round((apiData?.trip_tracker?.travelled_distance || 0) / 1000);
const remainingDistanceKm = Math.round((apiData?.trip_tracker?.remaining_distance || 0) / 1000);
const progressPercentage = totalDistanceKm > 0 ? (travelledDistanceKm / totalDistanceKm) * 100 : 0;
// Add this new function to calculate the on-time percentage
// const getOnTimePercentage = (startDate: string, eta: string, actualDelivery: string) => {
//   const start = new Date(startDate);
//   const etaDate = new Date(eta);
//   const actualDate = new Date(actualDelivery);

//   // Fallback if dates are invalid
//   if (isNaN(start.getTime()) || isNaN(etaDate.getTime()) || isNaN(actualDate.getTime())) {
//     return 0;
//   }

//   const tatMs = etaDate.getTime() - start.getTime(); // promised duration
//   const actualMs = actualDate.getTime() - start.getTime(); // actual duration

//   if (tatMs <= 0 || actualMs <= 0) {
//     return 0; // Invalid input
//   }

//   let percentage = (tatMs / actualMs) * 100;
//   if (percentage > 100) percentage = 100; // cap at 100%

//   return Math.round(percentage); // clean integer %
// };
const getOnTimePercentage = (shipmentData: any, actualDelivery?: string) => {
  console.log({
    pickup: shipmentData?.pickup_date,
    delivery: shipmentData?.delivery_date,
    actualDelivery,
    traveled: shipmentData?.trip_tracker?.travelled_distance,
    estimated: shipmentData?.estimated?.distance,
    dayRunAvg: shipmentData?.dayRun?.avg_distance,
    latestStatus: shipmentData?.latest_status,
  });

  const start = new Date(shipmentData?.pickup_date);
  const etaDate = new Date(shipmentData?.delivery_date);
  const endDate = actualDelivery ? new Date(actualDelivery) : new Date();
  
  const numberOfDays = Math.ceil((endDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const etaDays = Math.ceil((etaDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Distance calculations
  const traveled_distance = shipmentData?.trip_tracker?.travelled_distance || 0;
  const estimated_distance = shipmentData?.estimated?.distance || 0;
  const averageDistanceDayRun = shipmentData?.dayRun?.avg_distance || 0;
  
  // Use dayRun average if available, otherwise calculate from traveled distance
  const dailyDistanceCapacity = averageDistanceDayRun > 0 
    ? averageDistanceDayRun 
    : (traveled_distance > 0 && numberOfDays > 0) 
      ? (traveled_distance / 1000) / numberOfDays 
      : 0;
  
  // Calculate remaining distance
  const remaining_distance = Math.max(0, (estimated_distance / 1000) - (traveled_distance / 1000));
  
  // Predict days needed to complete remaining distance
  const predictedDaysToComplete = dailyDistanceCapacity > 0 
    ? Math.ceil(remaining_distance / dailyDistanceCapacity) 
    : 0;
  
  const currentDate = new Date();
  const predictedCompletionDate = new Date(currentDate.getTime() + (predictedDaysToComplete * 24 * 60 * 60 * 1000));
  
  const isDelivered = shipmentData?.latest_status === "CPTD";
  const deliveryDate = isDelivered ? endDate : predictedCompletionDate;
  
  // Calculate progress percentages
  const timeProgress = numberOfDays / etaDays;
  const distanceProgress = estimated_distance > 0 ? (traveled_distance / estimated_distance) : 0;
  const timeProgressPercent = Math.round(timeProgress * 100);
  const distanceProgressPercent = Math.round(distanceProgress * 100);
  
  // Calculate days remaining
  const daysRemainingToETA = Math.max(0, Math.ceil((etaDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  let onTimePercentage: number;
  let prediction: "early" | "on-time" | "delayed";
  let context: string;
  
  if (isDelivered) {
    const deliveryDelay = Math.max(0, deliveryDate.getTime() - etaDate.getTime()) / (1000 * 60 * 60 * 24);
    onTimePercentage = deliveryDelay === 0 ? 100 : Math.max(0, 100 - (deliveryDelay * 10));
    
    if (deliveryDelay === 0) {
      prediction = "on-time";
      context = "Delivered exactly on schedule";
    } else if (endDate < etaDate) {
      prediction = "early";
      const earlyDays = Math.ceil((etaDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
      context = `Delivered ${earlyDays} day${earlyDays > 1 ? 's' : ''} early`;
    } else {
      prediction = "delayed";
      const lateDays = Math.ceil(deliveryDelay);
      context = `Delivered ${lateDays} day${lateDays > 1 ? 's' : ''} late`;
    }
  } else {
    // For ongoing shipments
    if (distanceProgress >= timeProgress) {
      onTimePercentage = Math.min(100, 80 + (20 * (distanceProgress / timeProgress)));
    } else {
      const behindRatio = timeProgress / Math.max(distanceProgress, 0.1);
      onTimePercentage = Math.max(0, 80 / behindRatio);
    }
    
    // Predict delivery outcome
    const predictedDelayDays = predictedDaysToComplete - daysRemainingToETA;
    
    if (predictedDelayDays <= 0) {
      prediction = "early";
      const earlyDays = Math.abs(predictedDelayDays);
      if (earlyDays === 0) {
        prediction = "on-time";
        context = `${distanceProgressPercent}% complete • On track for on-time delivery`;
      } else {
        context = `${distanceProgressPercent}% complete • Expected ${earlyDays} day${earlyDays > 1 ? 's' : ''} early`;
      }
    } else {
      prediction = "delayed";
      context = `${distanceProgressPercent}% complete • Expected ${predictedDelayDays} day${predictedDelayDays > 1 ? 's' : ''} delay`;
    }
    
    // Add performance context
    if (distanceProgress > timeProgress) {
      const performanceRatio = (distanceProgress / timeProgress);
      if (performanceRatio > 1.2) {
        context += ` • Excellent progress`;
      } else {
        context += ` • Good progress`;
      }
    } else if (distanceProgress < timeProgress * 0.8) {
      context += ` • Behind schedule`;
    }
  }
  
  return {
    onTimePercentage: Math.round(onTimePercentage * 100) / 100,
    prediction,
    context,
    details: {
      distanceProgress: distanceProgressPercent,
      timeProgress: timeProgressPercent,
      daysRemaining: daysRemainingToETA,
      predictedDaysToComplete,
      isDelivered
    }
  };
};

// Now you can call this function with your API data
const onTimePercentage = getOnTimePercentage(
  apiData,
  finalDestination?.finished_at
);
const calculateEtaDelta = (etaDateString:any,actualDateString:any) => {
  if (!etaDateString || !actualDateString) return;

  const eta = new Date(etaDateString);
  const actual = new Date(actualDateString);
  const diffInMs = actual.getTime() - eta.getTime();
  const isLate = diffInMs > 0;
  const absDiff = Math.abs(diffInMs);

  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

  setEtaDelta({ isLate, hours, minutes });
  const isSimActive = apiData?.tripTrackerData.methods.includes("SIM");
  const isGpsActive = apiData?.tripTrackerData.methods.includes("GPS"); 
  const isAppActive = apiData?.tripTrackerData.methods.includes("GPS"); 
};
// Add these variables before the `return` statement
const totalWeight = apiData?.invoices?.reduce((sum:number, invoice:Invoice) => {
  return sum + (invoice.total_gross_weight || 0);
}, 0) || null;

const totalQuantity = apiData?.invoices?.reduce((sum:number, invoice:Invoice) => {
  return sum + (invoice.total_nop || 0);
}, 0) || null;

  return (
    <div className="dashboard-container">
      {loading ? (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Loading ...</p>
      </div>
    ) : (
      <>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-logo-section">
            <Image
              src={fullLogo}
              alt='logo'
              style={{
                  height: '55px',
                  width: '35%',
                  marginLeft: '23px',
                  background: '#251351eb',
                  padding: '10px',
                  borderRadius: '25px'
              }}
            />
            {/* <div className="logo-icon-wrapper tooltip"> */}
              {/* <Truck className="logo-icon" /> */}
              {/* <NextImage src="/assets/SmartTruck_tracker.svg" alt="Truck Logo" width={40} height={40} /> */}
              {/* <span className="tooltip-content">SmartTruck Dashboard</span> */}
              
            {/* </div> */}
            {/* <div>
              <h1 className="logo-title">SmartTruck</h1>
              <p className="logo-subtitle">TRIP TRACKER</p>
            </div> */}
            <div className="header-customer-info">
              <div className="customer-icon-wrapper">
              <Building2 className="customer-icon" />
              </div>
             
              <div>
              <div className="customer-name">
              {lastDelivery?.location?.name || 'N/A'}
                  {/* Tata steel */}
                  </div>
                <div className="customer-role">Customer</div>
                
               
              </div>
            </div>
          </div>
          <div className="header-actions">
            <div className="header-action-item">
              <button className="refresh-button tooltip"onClick={handleRefresh}>
                <RefreshCw className="refresh-icon" />
                {/* <span className="tooltip-content">Refresh Data</span> */}
              </button>
            </div>
            <div className="header-eta">
              <div className="eta-dot"></div>
              <span>ETA: {formatEta(apiData?.delivery_date)}</span>
            </div>
            <div className="shipment-id tooltip">
              <span>{apiData?.SIN || 'N/A'}</span>
              {/* <span className="tooltip-content">Shipment ID</span> */}
            </div>
            <div className="tracking-icons">
            {apiData?.trip_tracker?.methods?.includes("GPS") && (
              <div className="icon-wrapper bg-green tooltip">
                <Satellite className="icon" />
                {/* <span className="tooltip-content">GPS Active</span> */}
              </div>)}
              {apiData?.trip_tracker?.methods?.includes("APP") && (
              <div className="icon-wrapper bg-orange tooltip">
                <Smartphone className="icon" />
                {/* <span className="tooltip-content">Mobile Tracking</span> */}
              </div>)}
              {apiData?.trip_tracker?.methods?.includes("SIM") && (
              <div className="icon-wrapper bg-purple tooltip">
            
              <svg className="icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
            
        
              </div>)}
      {/* Replace your old phone icon block with this one */}
      <div className="icon-wrapper bg-blue  tooltip">
      <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
  <path d="M14 7h5v11h-5V7zm-1-1.5l3-2h2.5l3 2H13zm2 3h3v3h-3V9z"/>
  <path d="M1 18h18v-1H1v1zm3-1v-8h1v8H4zm4 0v-8h1v8H8zm4 0v-8h1v8h-1z"/>
  <path d="M13.5 9.5l-11-4v-1l11 4v1z"/>
</svg>
</div>


            </div>
            <span className={`status-badge ${statusClass} tooltip`}>
            {shipmentStatus}
              {/* <span className="tooltip-content">Shipment Status</span> */}
            </span>
            <HelpModal shipmentId="UHR0002-8" driverPhone="9183526734">
              <button className="help-button">
                <MessageCircle className="help-icon" />
                Get Help
              </button>
            </HelpModal>
          </div>
        </div>
      </header>

   
      {docModal.open && (
  <>
    {/* Backdrop - click to close */}
    <div className="modal-backdrop" onClick={() => setDocModal({ open: false })} />

    {/* Modal */}
    <div
      className="modal-content doc-modal"
      role="dialog"
      aria-modal="true"
      aria-label={docModal.doc?.name || "Document"}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top row: title + close chip */}
      <div className="modal-top">
        <div className="modal-title">
          <ImageIcon className="modal-title-icon" />
          <span>{docModal.doc?.name || "ePOD"}</span>
        </div>

        {/* close chip at top-right */}
        <button
          className="modal-close-chip"
          onClick={() => setDocModal({ open: false })}
          type="button"
        >
          {/* Close */}
          <X className="modal-close-icon" />
        </button>
      </div>

      {/* thin separator under title */}
      <hr className="modal-separator" />

      {/* Fixed-height image frame */}
      <div className="doc-image-frame">
      {isPdfLoading && (
          <div className="pdf-loader">
            <div className="spinner"></div>
            <span>Loading ePOD...</span>
          </div>
        )}
        <iframe
  // HIGHLIGHT: Changed src to use Google Docs Viewer
  src={`https://docs.google.com/gview?url=${docModal.doc?.url}&embedded=true`}
  width="100%"
  height="100%"
  title={docModal.doc?.name}
  style={{ border: 'none' }}
/>
      </div>

      {/* Centered download button */}
      <div className="modal-buttons-container">
        <a className="modal-button" href={docModal.doc?.url} download>
          <Download className="modal-button-icon" />
          <span>Download</span>
        </a>
      </div>
    </div>
  </>
)}

{/* ADDED — top-right confirmation popover */}

{ confirm.open && (
  <>
    <div className="map-confirm-backdrop" onClick={closeConfirm} />

    <div
      className="map-confirm-popover"
      role="dialog"
      aria-modal="true"
      aria-label={confirm.kind === "deviation" ? "Confirm deviations" : "Confirm stoppages"}
    >
      <button
        className="map-confirm-close"
        onClick={closeConfirm}
        aria-label="Close"
        title="Close"
        style={{ position: "absolute", top: 10, right: 12, background: "transparent", border: 0, cursor: "pointer", fontSize: 18, color: "#6b7280" }}
      >
        ✕
      </button>
      {/* <hr className="modal-separator" /> */}

      <div className="map-confirm-title">
  {confirm.kind === "deviation"
    ? (
      <>
        Are you sure you want to see number of deviations
        <br /> on the map?
      </>
    )
    : (
      <>
        Are you sure you want to see number of stoppages
        <br /> on the map?
      </>
    )}
</div>

      <div className="map-confirm-actions" style={{ display: "flex", gap: 55,justifyContent: "center",marginTop:"50px" }}>
        <button className="btn btn-primary" onClick={confirmYes}>Yes</button>
        <button className="btn btn-ghost" onClick={closeConfirm}>No</button>
      </div>
    </div>
  </>
)}

{isMapFull && (
  <>
    <div className="mapfs-backdrop" onClick={() => setIsMapFull(false)} />
    <div className="mapfs-shell">
    <button className="mapfs-exit-btn" onClick={() => setIsMapFull(false)}>
        <X size={16} /> {/* Using the X icon */}
        Exit
      </button>
      <div className="mapfs-card">
        <KeplerMap
          showGPSRoute
          showDeviations={showDeviationsOnMap}
          setShowDeviations={() => setShowDeviationsOnMap(prev => !prev)}
          // showHaltPoints={showHaltPointsOnMap}
          showHaltPoints={showHaltPointsOnMap}
          showStoppages={showStoppagesOnMap} 
          showGeofence
          isFullscreen
          isSatelliteView={isSatelliteViewLocal}
          onToggleFullscreen={() => setIsMapFull(false)}
          unique_code={uniqueCode}
          // apiData={apiData}
          // tollHistoryData={tollHistoryData}
          // haltData={haltData}
          // timelineData={timelineData}
          // mapPoints={mapPoints}
        />
      </div>
    </div>
  </>
)}




      <div className="main-content">
        {/* KPI Strip */}
        <div className="kpi-strip">
          {/* <div className="kpi-card early  tooltip" onClick={() => handleKpiClick("eta-delta")}> */}
          <div
          className={`kpi-card early tooltip ${openTooltipId === "eta-delta" ? "tooltip-open" : ""}`}
          onClick={() => handleKpiClick("eta-delta")}
        >
          <div className="kpi-icon-badge"><Clock className="kpi-icon" /></div>
            {apiData?.latest_status=="CPTD"?(
            <div className="kpi-value"> {etaDelta.isLate ? (
              `Late by ${etaDelta.hours}h ${etaDelta.minutes}m`
            ) : (
              `Early by ${etaDelta.hours}h ${etaDelta.minutes}m`
            )}</div>): (<div className="kpi-value">{shipmentStatus}</div>)}
           
            <div className="kpi-label"> {apiData?.latest_status=="CPTD"?'Delivered':''}</div>
            <div className="kpi-label">{finalDestination?.finished_at ? formatTimestamp(finalDestination?.finished_at) : `ETA: ${formatTimestamp(apiData?.delivery_date)}`}</div>
          
         
            {finalDestination?.finished_at ? (
              <div className="tooltip-content tooltip-lg">
              <div className="tooltip-title">ETA Delta</div>

              <div className="tooltip-row">
                <span className="tooltip-key">Planned delivery:</span>
                <span className="tooltip-val">{formatEta(apiData?.delivery_date)}</span>
              </div>

              <div className="tooltip-row">
                <span className="tooltip-key">Actual delivery:</span>
                <span className="tooltip-val">{formatEta(finalDestination?.finished_at)}</span>
              </div>

              <div className="tooltip-row">
                <span className="tooltip-key">Delta:</span>
                <span className="tooltip-val">{etaDelta.isLate ? (
                `Late by ${etaDelta.hours}h ${etaDelta.minutes}m`
              ) : (
                `Early by ${etaDelta.hours}h ${etaDelta.minutes}m`
              )}</span>
            </div>
            </div>): <></> }

          </div>
{/* 
          <div className="kpi-card distance tooltip" onClick={() => handleKpiClick("distance-metrics")}> */}
            <div
          className={`kpi-card distance tooltip ${openTooltipId === "distance-metrics" ? "tooltip-open" : ""}`}
          onClick={() => handleKpiClick("distance-metrics")}
        >
          <div className="kpi-icon-badge"><Ruler className="kpi-icon" /></div>
            <div className="kpi-distance-metrics">
              <div className="distance-grid">
                <div className="distance-item">
                  <div className="distance-value">{totalDistanceKm}</div>
                  <div className="distance-label">Total (km)</div>
                </div>
                <div className="distance-item">
                  <div className="distance-value traveled">{travelledDistanceKm}</div>
                  <div className="distance-label">Travelled (km)</div>
                </div>
                <div className="distance-item">
                  <div className="distance-value remaining">{remainingDistanceKm}</div>
                  <div className="distance-label">Remaining (km)</div>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill"
                  style={{ 
                    width: `${Math.min(progressPercentage, 100)}%`,
                    transition: 'width 0.8s ease-in-out',
                    background: progressPercentage > 0 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)' : '#e5e7eb',
                    boxShadow: progressPercentage > 0 ? '0 0 10px rgba(34, 197, 94, 0.3)' : 'none',
                    animation: progressPercentage > 0 ? 'progressPulse 2s ease-in-out infinite alternate' : 'none'
                  }}
                ></div>
              </div>
            </div>
            <div className="kpi-label">{apiData?.latest_status=="ITNS"?(<>Distance Metrics ({progressPercentage.toFixed(0)}%)</>):("")}</div>
            {/* <span className="tooltip-content">Total journey: 1450km completed</span> */}
            <div className="tooltip-content tooltip-lg">
      <div className="tooltip-title">Distance Metrics</div>

      <div className="tooltip-row">
        <span className="tooltip-key">Total Distance:</span>
        <span className="tooltip-val">{totalDistanceKm} km</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-key">Travelled:</span>
        <span className="tooltip-val">{travelledDistanceKm} km</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-key">Remaining:</span>
        <span className="tooltip-val">{remainingDistanceKm} km</span>
      </div>

     
    </div>

          </div>

          {/* <div className="kpi-card on-time tooltip"> */}
          <div
          className={`kpi-card on-time tooltip ${openTooltipId === "on-time" ? "tooltip-open" : ""}`}
          onClick={() => handleKpiClick("on-time")}
        >
          <div className="kpi-icon-badge"><BadgeCheck className="kpi-icon" /></div>
            <div className="kpi-value">{onTimePercentage.onTimePercentage}</div>
            <div className="kpi-label">On-Time%</div>
            {/* <span className="tooltip-content">{onTimePercentage.context}</span> */}
            <div className="tooltip-content tooltip-lg">
           
      <div className="tooltip-title">On-Time%</div>

      <div className="tooltip-row">
        <span className="tooltip-key">On-time Prediction:</span>
        <span className="tooltip-val">{onTimePercentage.onTimePercentage} %</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-key">SLA deadline:</span>
        <span className="tooltip-val">{ formatTimestamp(apiData?.delivery_date)}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-key">Status:</span>
        <span className="tooltip-val">{onTimePercentage.context}</span>
      </div>
    </div>
          </div>
         
          <div 
  className={`kpi-card stoppages tooltip ${openTooltipId === "long-alerts" ? "tooltip-open" : ""}`}
  onClick={() => handleKpiClick("halt-alerts")}
>
          <div className="kpi-icon-badge"><PauseCircle className="kpi-icon" /></div>
            <div className="kpi-value">{totalStoppagesCount || 0}</div>
            <div className="kpi-label">Long Stoppages  { parseInt(totalHaltDurationText, 10) > 9 && (
    <span> (&gt;9 hrs)</span>)}</div>
            {/* <span className="tooltip-content">3 extended stops during journey</span> */}
            <div className="tooltip-content tooltip-lg">
      <div className="tooltip-title">Halt Alerts</div>

      <div className="tooltip-row">
        <span className="tooltip-key">Total Stoppages:</span>
        <span className="tooltip-val">{totalStoppagesCount}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-key">Duration:</span>
        <span className="tooltip-val">{totalHaltDurationText}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-key">Longest:</span>
        <span className="tooltip-val tooltip-ellipsis">{longestHaltText}</span>
      </div>

     
    </div>
          </div>

         
          {/* <div className="kpi-card deviations tooltip" onClick={() => handleKpiClick("route-deviations")}> */}
          <div 
  className={`kpi-card deviations tooltip ${openTooltipId === "route-deviations" ? "tooltip-open" : ""}`}
  onClick={() => handleKpiClick("route-deviations")}
>
          <div className="kpi-icon-badge"><GitBranch className="kpi-icon" /></div>
            <div className="kpi-value">{deviationCount}</div>
            <div className="kpi-label">Route deviations</div>
            <div className="tooltip-content tooltip-lg">
      <div className="tooltip-title">Route Deviations</div>

      <div className="tooltip-row">
        <span className="tooltip-key">Total deviations:</span>
        <span className="tooltip-val">{deviationCount}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-key">Distance off-route:</span>
        <span className="tooltip-val">{totalDeviationDistance.toFixed(1)}km</span>
      </div>

   
    </div>
            {/* <span className="tooltip-content">2 deviations from planned route</span> */}
          </div>
          <div className="kpi-card halt-alert tooltip" onClick={() => handleKpiClick("route-deviations")}>
          <div className="kpi-icon-badge"><AlertOctagon className="kpi-icon" /></div>
            <div className="kpi-value">{apiData?.trip_tracker?.no_of_overspeeding || 0}</div>
            <div className="kpi-label">Over Speed</div>
            {/* <span className="tooltip-content">3 extended stops during journey</span> */}
            {/* <div className="tooltip-content tooltip-lg">
      <div className="tooltip-title">Halt Alerts</div>

      <div className="tooltip-row">
        <span className="tooltip-key">Total Stoppages:</span>
        <span className="tooltip-val">3</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-key">Duration:</span>
        <span className="tooltip-val">2h 45min total</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-key">Longest:</span>
        <span className="tooltip-val">1h 30min at Nashik</span>
      </div>


    </div> */}
          </div>
        </div>

        <div className="main-grid">
          {/* Left Sidebar */}
          <div className="sidebar-left">
          <div className="card">
  <div className="card-header">
    
    {/* NEW — Tabs, same pattern as your timeline tabs */}
    <div className="tab-container">
      <button
        className={`tab-button ${activeInfoTab === "vehicle" ? "active" : ""}`}
        onClick={() => setActiveInfoTab("vehicle")}
      >
        <Truck className="card-icon" />
        Vehicle
      </button>
      <button
        className={`tab-button ${activeInfoTab === "metadata" ? "active" : ""}`}
        onClick={() => setActiveInfoTab("metadata")}
      >
        <Package className="tab-icon" />
        Metadata
      </button>
    </div>

    <button className="collapse-button" onClick={() => toggleSection("info")}>
      {collapsedSections.info ? (
        <ChevronDown className="collapse-icon" />
      ) : (
        <ChevronUp className="collapse-icon" />
      )}
    </button>
  </div>

  {!collapsedSections.info && (
    <div className="card-content">
      {activeInfoTab === "vehicle" && (
        /* MOVED FROM OLD "Vehicle & Driver" CARD — no changes inside */
        <div className="vehicle-driver-details">
          <div className="detail-item">
            <span className="detail-label">Name</span>
            <span className="detail-value">{apiData?.driver?.name || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Mobile No</span>
            <span className="detail-value">{apiData?.driver?.mobile || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Vehicle No</span>
            <span className="detail-value">{apiData?.driver?.vehicle_no || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Type</span>
            <span className="detail-value">{apiData?.driver?.vehicle_type?.name || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Transporter</span>
            <span className="detail-value">{apiData?.carrier?.name || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Day run</span>
            <span className="detail-value">{apiData?.dayrun?.avg_distance ? `${apiData.dayrun.avg_distance.toFixed(2)} Km` : 'N/A'}</span>
          </div>
        </div>
      )}

      {activeInfoTab === "metadata" && (
        /* MOVED FROM OLD "Trip Metadata" CARD — no changes inside */
        <div className="metadata-details">
          <div className="detail-item">
            <div className="detail-label">Customer</div>
           
            <div className="detail-value">{lastDelivery?.location?.name || 'N/A'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Shipper</div>
            <div className="detail-value"> {`${apiData?.shipper?.parent_name} (${apiData?.shipper?.name})` || 'N/A'}</div>
          </div>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Cargo Type</div>
              <div className="detail-value">{apiData?.materials?.[0]?.name || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Weight</div>
              <div className="detail-value"> {totalWeight !== null ? totalWeight.toFixed(2) : 'N/A'}
              {' tons'}
            </div>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Quantity</div>
            <div className="detail-value">  {totalQuantity !== null ? totalQuantity : 'N/A'}
            {' units'}</div>
          </div>
       
        </div>
      )}
    </div>
  )}
</div>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <MapPin className="card-icon" />
                  <span>Locations</span>
                </div>
                <button className="collapse-button" onClick={() => toggleSection("locations")}>
                  {collapsedSections.locations ? (
                    <ChevronDown className="collapse-icon" />
                  ) : (
                    <ChevronUp className="collapse-icon" />
                  )}
                </button>
              </div>
              
              

              {!collapsedSections.locations && (
  <div className="card-content">
    {/* ORIGIN (unchanged) */}
    <div className="location-item origin">
      <div className="location-icon-wrapper">
        <div className="location-icon origin-icon">
          <div className="location-dot"></div>
        </div>
      
      </div>
      <div className="location-details">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <div className="location-type">Origin</div>
        {intermediates.length > 0 && !showAllStops && (
        <button
          className="more-badge origin-badge"
          onClick={() => setShowAllStops(true)}
          aria-label={`Show ${intermediates.length} more stops`}
          title={`Show ${intermediates.length} more stops`}
        >
          {intermediates.length}+
        </button>
      )}
   
        
  </div>
        <div className="location-name">{originLocation?.location?.name || 'N/A'}</div>
    
        <div className="location-time">
          <Clock className="time-icon" />
          <span>{formatTimestamp(originLocation?.finished_at)}</span>
        </div>
      </div>
    </div>

   

    {showAllStops && (
      <>
        <div className="stops-scroll">
          {intermediates.map((s) => (
            <div key={s.id} className="location-item origin">
              <div className="location-icon-wrapper">
                <div className="location-icon origin-icon">
                  <div className="location-dot"></div>
                </div>
              </div>
              <div className="location-details">
                <div className="location-type">Origin</div>
                <div className="location-name">{s.name}</div>
                <div className="location-time">
                  <Clock className="time-icon" />
                  <span>{s.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="link-button stops-toggle" onClick={() => setShowAllStops(false)}>
          Hide Origin
        </button>
      </>
    )}

  
    {destinations.length > 0 && showAllDests && (
      <>
        <div className="dests-scroll"> {/* NEW */}
          {destinations.map((d) => (  // NEW: all but final
            <div key={d.id} className="location-item destination"> {/* NEW */}
              <div className="location-icon-wrapper">
                <div className="location-icon destination-icon">{/* reuse red/pink theme for non-final dests */}
                  <div className="location-dot"></div>
                </div>
              </div>
              <div className="location-details">
                <div className="location-type">Destination</div>
                <div className="location-name">{d.name}</div>
                <div className="location-time">
                  <Clock className="time-icon" />
                  <span>{d.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          className="link-button stops-toggle"   // NEW
          onClick={() => setShowAllDests(false)} // NEW
        >
          Hide  destination {/* NEW */}
        </button>
      </>
    )}

    {/* FINAL DESTINATION (always visible at bottom) */}
   
    
        {finalDestination && (
        <div className="location-item destination">
          <div className="location-icon-wrapper">
            <div className="location-icon destination-icon">
              <CheckCircle className="check-icon" />
            </div>
           
          </div>
          <div className="location-details">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="location-type">Destination</div>
          
            {destinations.length > 0 && !showAllDests && (
          <button
            className="more-badge dest-badge"
            onClick={() => setShowAllDests(true)}
            aria-label={`Show ${destinations.length}} more destination${destinations.length > 1 ? "s" : ""}`}
            title={`Show ${destinations.length} more destination${destinations.length > 1 ? "s" : ""}`}
          >
            {destinations.length}+
          </button>
        )}
        </div>
            <div className="location-name">{finalDestination?.location?.name || 'N/A'}</div>
            <div className="location-time">
              <Clock className="time-icon" />
              <span>{formatTimestamp(finalDestination?.finished_at)}</span>
            </div>
           
         
          </div>
        </div> 
 
)}

            </div>)}

           
  

</div>

</div>
          {/* Center Section */}
          <div className="center-section">

            <div className={`card map-card ${collapsedSections.liveTracking ? "collapsed" : ""}`}>
              <div className="card-header">
                <div className="card-title">
                  <MapPin className="card-icon" />
                  <span>Tracking</span>
                </div>
                <button className="collapse-button" onClick={() => toggleSection("liveTracking")}>
                  {collapsedSections.liveTracking ? (
                    <ChevronDown className="collapse-icon" />
                  ) : (
                    <ChevronUp className="collapse-icon" />
                  )}
                </button>
              </div>
              {!collapsedSections.liveTracking && (
                <div className="card-content">
                  {/* <div className="map-buttons">
                    <button className="map-button active" onClick={() => setMapMode("map")}>
                      <Eye className="button-icon" />
                      Map View
                    </button>
                    <button className="map-button outline"onClick={() => setIsMapFull(true)}>
                      <Maximize className="button-icon" />
                      Full Screen Map
                    </button>
                  </div> */}
                <div className="map-buttons">
  <button
    // The className still changes, making the button blue or white
    className={`map-button ${mapMode === 'map' ? 'active' : 'outline'}`}
    // The onClick handler still toggles the view
    onClick={handleToggleMapView}
  >
    {/* HIGHLIGHT: The icon and text are now static and will not change */}
    <Eye className="button-icon" />
    Map View
  </button>

  {/* The Full Screen button remains the same */}
  <button className="map-button outline" onClick={() => setIsMapFull(true)}>
    <Maximize className="button-icon" />
    Full Screen Map
  </button>
  </div>
                  {mapState.mode === "location" && (
                  <div className="map-filter-buttons">
                    <button className="filter-button deviation"  onClick={() => openConfirm("deviation")}  >
                      <Navigation className="filter-icon" />{deviationCount} deviations
                    </button>
                    <button className="filter-button stoppage" onClick={() => openConfirm("stoppage")}  >
                      <AlertTriangle className="filter-icon" />{totalStoppagesCount} Long Stoppages
                    </button>
                  </div>)}
                  {mapState.mode === "location" && (
                  <div className="current-location-box">
                    <div className="location-header">
                      <div className="location-status">
                        <div className="location-dot-active"></div>
                        <span>Current Location</span>
                      </div>
                      <span className={`status-badge ${statusClass} tooltip`}>
                      {shipmentStatus}</span>
                   
                    </div>
                  
                    <div className="location-info">
                      <div className="location-address">
                        <MapPin className="location-icon" />
                        {/* Tata Steel Plant, Jamshedpur */}
                        {apiData?.trip_tracker?.last_location_address?.startsWith("in ")
    ? apiData.trip_tracker.last_location_address.substring(3)
    : apiData?.trip_tracker?.last_location_address}
                      </div>
                      {/* <div className="location-sub-address">Gate 3, Delivery Bay A-2</div> */}
                    
                      <div className="location-update">Last Update: {formatEta(apiData?.trip_tracker?.last_location_at)}</div>
                      {/*
                        Last Known Location:{" "}
  {apiData?.trip_tracker?.last_location_address?.startsWith("in ")
    ? apiData.trip_tracker.last_location_address.substring(3)
    : apiData?.trip_tracker?.last_location_address}</div>  */}
                      <div className="location-signal">
                        {/* <span className="signal-dot"></span>
                        GPS Signal: Strong */}
                      </div>
                    </div>
                  </div>)}
               
     {/* // {mapMode === "map" && (
  //<div style={{ marginTop: "1rem" }}>
   // <InteractiveMap
     // showGPSRoute
     // showDeviations={showDeviationsOnMap}
      //showGeofence
      //isFullScreen={false}
      //onFullScreenToggle={() => setIsMapFull(true)}
    ///>
  //</div>
//)} */}
{mapState.mode === "map" && (
  <div 
  // style={{ marginTop: "1rem" }}
  className="map-host">
    <KeplerMap
      showGPSRoute
      showDeviations={showDeviationsOnMap}
      setShowDeviations={() => setShowDeviationsOnMap(prev => !prev)}
      showGeofence
      isFullscreen={false}
      isSatelliteView={isSatelliteViewLocal}
      onToggleFullscreen={() => setIsMapFull(true)}
      unique_code={uniqueCode}

      // optional callbacks if you want to control toggles from dashboard:
      // onToggleGPSRoute={() => {/* set some local state if needed */}}
      // onToggleDeviations={() => setShowDeviationsOnMap((s) => !s)}
      // onToggleSatellite={() => setIsSatelliteViewLocal((s) => !s)}
    />
  </div>
)}


                </div>
              )}
            </div>

           
             <div className="card ad-card">
              <div className="ad-content">
                <div className="ad-header">
                  <div className="ad-icon-wrapper">
                    <Building2 className="ad-icon" />
                  </div>
                  <span>Sponsored</span>
                </div>
                <h3 className="ad-title">Optimize Your Fleet with TruckMax Pro</h3>
                <p className="ad-text">
                  Advanced route optimization, real-time fuel monitoring, and predictive maintenance alerts.
                </p>
                <button className="ad-button">Learn More</button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="sidebar-right">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Radio className="card-icon" />
                  <span>Device Tracking Status</span>
                </div>
                <button className="collapse-button" onClick={() => toggleSection("tracking")}>
                  {collapsedSections.tracking ? (
                    <ChevronDown className="collapse-icon" />
                  ) : (
                    <ChevronUp className="collapse-icon" />
                  )}
                </button>
              </div>
              {!collapsedSections.tracking && (
                <div className="card-content tracking-status-grid">
                   
                    {apiData?.trip_tracker?.methods?.includes("GPS") && (
                  <div className="tracking-status-item gps">
                  
                    <div className="tracking-status-header">
                      <div className="icon-wrapper">
                        <Satellite style={{ width: "12px", height: "12px" }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "12px", margin: 0 }}>GPS</h3>
                        <p style={{ fontSize: "12px", margin: 0 }}>Tracking</p>
                      </div>
                      <span className="status-pill gps-pill ">Active</span>
                      {/* <span className="status-badge active">Active</span> */}
                    </div>
                    <div className="tracking-details padded">
                      <div className="tracking-detail-row">
                        <span>Last Update:</span>
                        <span>2 min ago</span>
                      </div>
                      <div className="tracking-detail-row">
                        <span>Accuracy:</span>
                        <span>±3 meters</span>
                      </div>
                      <div className="tracking-detail-row">
                        <span>Uptime Duration:</span>
                        <span>47h 32m</span>
                      </div>
                      <div className="tracking-detail-row">
                        <span>Uptime Reliability:</span>
                        <span>98.5%</span>
                      </div>
                    </div>
                  
                  </div>)}
                  {apiData?.trip_tracker?.methods?.includes("SIM") && (
                  <div className="tracking-status-item sim">
                    <div className="tracking-status-header">
                      <div className="icon-wrapper">
                      <svg className="icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                        {/* <Satellite style={{ width: "12px", height: "12px" }} /> */}
                      </div>
                      <div>
                        <h3 style={{ fontSize: "12px", margin: 0 }}>SIM</h3>
                        <p style={{ fontSize: "12px", margin: 0 }}>Tracking</p>
                      </div>
                      <span className="status-pill sim-pill ">Active</span>
                      {/* <span className="status-badge active">Active</span> */}
                    </div>
                    <div className="tracking-details padded">
                      <div className="tracking-detail-row">
                        <span>Last Update:</span>
                        <span>2 min ago</span>
                      </div>
                     
                      <div className="tracking-detail-row">
                        <span>Uptime Duration:</span>
                        <span>47h 32m</span>
                      </div>
                      <div className="tracking-detail-row">
                        <span>Uptime Reliability:</span>
                        <span>98.5%</span>
                      </div>
                    </div>
                  </div>)}
                  {apiData?.trip_tracker?.methods?.includes("APP") && (
                  <div className="tracking-status-item app">
                    <div className="tracking-status-header">
                      <div className="icon-wrapper">
                        <Smartphone style={{ width: "12px", height: "12px" }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "12px", margin: 0 }}>APP</h3>
                        <p style={{ fontSize: "12px", margin: 0 }}>Tracking</p>
                      </div>
                      <span className="status-pill app-pill ">Active</span>
                      {/* <span className="status-badge active">Active</span> */}
                    </div>
                    <div className="tracking-details padded">
                      <div className="tracking-detail-row">
                        <span>Last Update:</span>
                        <span>2 min ago</span>
                      </div>
                      <div className="tracking-detail-row">
                        <span>Accuracy:</span>
                        <span>±3 meters</span>
                      </div>
                      <div className="tracking-detail-row">
                        <span>Uptime Duration:</span>
                        <span>47h 32m</span>
                      </div>
                      <div className="tracking-detail-row">
                        <span>Uptime Reliability:</span>
                        <span>98.5%</span>
                      </div>
                    </div>
                  </div>)}

                  <div className="tracking-status-item fastag">
                    <div className="tracking-status-header">
                      <div className="icon-wrapper">
                        <Smartphone  style={{ width: "16px", height: "16px" }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: "12px", margin: 0,color:'blue' }}>FASTag</h4>
                        <p style={{ fontSize: "12px", margin: 0 }}>Tracking</p>
                      </div>
                      <span className="status-pill fastag-pill ">Active</span>
                      {/* <span className="status-badge active">Active</span> */}
                    </div>
                    <div className="tracking-details  padded">
                      <div className="tracking-detail-row">
                        <span>Last Update:</span>
                        <span>5 min ago</span>
                      </div>
                      <div className="tracking-detail-row">
                        <span>Accuracy:</span>
                        <span>±5 meters</span>
                      </div>
                      <div className="tracking-detail-row">
                        <span>Uptime Duration:</span>
                        <span>47h 45m</span>
                      </div>
                      <div className="tracking-detail-row">
                        <span>Uptime Reliability:</span>
                        <span>99.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
               
              )}
            </div>
         
            <div className="card timeline-card">
              <div className="card-header timeline-header">
                <div className="tab-container">
                  <button
                    className={`tab-button ${activeTimelineTab === "timeline" ? "active" : ""}`}
                    onClick={() => setActiveTimelineTab("timeline")}
                  >
                    <Clock className="tab-icon" />
                    Timeline
                  </button>
                  <button
                    className={`tab-button ${activeTimelineTab === "tollHistory" ? "active" : ""}`}
                    onClick={() => setActiveTimelineTab("tollHistory")}
                  >
                    <CreditCard className="tab-icon" />
                    Toll History
                  </button>
                  <button
    className={`tab-button ${activeTimelineTab === "documents" ? "active" : ""}`}
    onClick={() => setActiveTimelineTab("documents")}
  >
    <FileText className="tab-icon" />
   ePOD
  </button>
                </div>
                <button className="collapse-button" onClick={() => toggleSection("timeline")}>
                  {collapsedSections.timeline ? (
                    <ChevronDown className="collapse-icon" />
                  ) : (
                    <ChevronUp className="collapse-icon" />
                  )}
                </button>
              </div>
              {!collapsedSections.timeline && (
                <div className="card-content timeline-content">
                 
                  {activeTimelineTab === "timeline" && (
  <div className="timeline-section scrollable-container">
    <div className="timeline-title-container">
      <h3>Timeline</h3>
      <p>Latest Events</p> {/* Updated subtitle as API has no 'planned' data */}
    </div>
    
    {timelineData && timelineData.length > 0 ? (
      timelineData.map((event: any, index: number) => (
        <div key={index} className="timeline-item">
          <div className="timeline-icon-container">
       
          {/* <div className="timeline-icon-wrapper"> */}
            {/* <Mapmark className="timeline-icon" /> */}
            < NextImage  src={Mapmark} alt="" width={20} height={20} />
            
  </div>
          <div className="timeline-details">
            <div className="timeline-time-row">
              <span className="timeline-time">
                {new Date(event.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {/* <div className="timeline-dot"></div> */}
            </div>
            <div className="timeline-date">
              {new Date(event.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div className="timeline-event">{event.comments}</div>
          </div>
        </div>
       
      ))
    ) : (
      <div className="no-data-message">No timeline events available.</div>
    )}
  </div>
)}

                  
                    
{activeTimelineTab === "tollHistory" && (
  <div className="toll-history-section scrollable-container">
    {tollHistoryData && tollHistoryData.length > 0 ? (
      tollHistoryData.map((toll: any, index: number) => (
        <div key={index} className="toll-history-item">
        <div className="toll-date">
          <div>{new Date(toll?.time_stamp).toLocaleDateString()}</div>
          <div className="toll-time">{new Date(toll?.time_stamp).toLocaleTimeString()}</div>
        </div>
        <div className="toll-icon-container">
        
          < NextImage  src={TollGateIcon} alt="" width={28} height={28} />
          {/* <img src={TollGateIcon} className="toll-icon" alt="Toll Gate" /> */}
            {/* <Building2 className="toll-icon" /> */}
          {/* </div> */}
          {index < tollHistoryData.length - 1 && <div className="toll-line"></div>}
        </div>
        <div className="toll-name tooltip-ellipsis" data-title={toll?.tollPlazaName}>
          {toll?.tollPlazaName || 'N/A'}
        </div>
      </div>
      ))
    ) : (
      <div className="no-data-message">No toll history available.</div>
    )}
  </div>
)}

         
          
            {activeTimelineTab === "documents" && (
  <div className="documents-grid scrollable-container">
    {/* HIGHLIGHT: Replaced static button with a dynamic map */}
    {epodLinks && epodLinks.length > 0 ? (
      epodLinks.map((url, index) => (
        <button
          key={index}
          className="doc-tile"
          onClick={() =>{
            setIsPdfLoading(true); 
            setDocModal({
              open: true,
              doc: { id: `epod${index + 1}`, name: `ePOD Document ${index + 1}`, url: url },
            })
          }}
        >
          <span className="doc-name">
            <span className="doc-flex">
              <FileText className="doc-icon" />
              <span>ePOD {index + 1}</span>
            </span>
          </span>
        </button>
      ))
    ) : (
      <div className="no-data-message">No ePODs available.</div>
    )}
  </div>
)}
 </div>   
          )}
            </div>
          </div>
        </div>
     </div>
</>)}
    </div>
  )
}

export default TripTrackingDashboard
