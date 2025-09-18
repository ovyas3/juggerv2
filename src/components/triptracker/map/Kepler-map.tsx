"use client";

import type React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import * as L from "leaflet";
import { MapPin } from "lucide-react";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import styles from "./Kepler-map.module.css";
import type { Icon as LeafletIcon, DivIcon as LeafletDivIcon, Map as LeafletMap } from "leaflet";
import tollPendingUrl from "../../../assets/toll_gate.svg";
import Image from "next/image";
import tollPassedUrl from "../../../assets/toll_gate_icon_passed.svg";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";
import { useMap, useMapEvents } from "react-leaflet"; 
import polyline from "@mapbox/polyline";
import { DateTime } from 'luxon';



// Dynamically import components
const Pane = dynamic(() => import("react-leaflet").then((mod) => mod.Pane), { ssr: false });
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer   = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer),   { ssr: false });
const Polyline    = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline),    { ssr: false });
const Polygon     = dynamic(() => import("react-leaflet").then((mod) => mod.Polygon),     { ssr: false });
const Marker      = dynamic(() => import("react-leaflet").then((mod) => mod.Marker),      { ssr: false });
const Popup       = dynamic(() => import("react-leaflet").then((mod) => mod.Popup),       { ssr: false });
// Add this line

interface KeplerMapProps {
  showGPSRoute?: boolean;
  showDeviations?: boolean;
  showGeofence?: boolean;
  showStoppages?: boolean;
  showHaltPoints?: boolean; 
  isFullscreen?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleSatellite?: () => void;
  onToggleFullscreen?: () => void;
  onToggleGPSRoute?: () => void;
  onToggleDeviations?: () => void;
  isSatelliteView?: boolean;
  unique_code?:string;

}

interface MagnifierSettings {
  positionX: number; // 0-1
  positionY: number; // 0-1
  size: number;      // px
  zoom: number;      // +levels
  borderWidth: number; // px
}
interface FastagPoint {
  geo_point: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
  tollPlazaName: string;
  time_stamp: string; // ISO date
  address: string;
}
interface FastagApi {
  msg: string;
  data: FastagPoint[];
  fastagData?: { polyline?: string };
}
// Define the structure of a geo_point
interface GeoPoint {
  type: string;
  coordinates: [number, number]; // Note: API returns [lng, lat]
}

// Define the structure for a data point in the 'sim' or 'app' arrays
interface PathPoint {
  geo_point: GeoPoint;
  address: string;
  created_at: string;
}

// Define the overall shape of the path data object
interface PathData {
  sim: PathPoint[];
  app: PathPoint[];
  gps: string | PathPoint[]; // Can be a string or an array of PathPoint
  timeline: any[];
  gpsStatus: number;
  status: string;
  temperature: number | null;
}
interface PathResponse {
  sim?: PathPoint[];
  app?: PathPoint[];
  gps?: string | PathPoint[];
}

// Define the state for the path data
interface PathState {
  sim?: PathPoint[];
  app?: PathPoint[];
  gps?: string | PathPoint[];
}
interface HaltPoint {
  _id: string;
  vehicle_no: string;
  address: string;
  start_time: string;
  end_time: string;
  halt_duration: number;
  geo_point: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
  restricted: boolean;
}


// This component connects your ref to the map instance.
function MapController({ mapRef }: { mapRef: React.MutableRefObject<LeafletMap | null> }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  return null; // It doesn't render anything.
}
// Place this function inside Kepler-map.tsx, outside the KeplerMap component

function MagnifierMapController({ setMap }: { setMap: (map: LeafletMap) => void }) {
  const map = useMap(); // Gets the map instance from the nearest <MapContainer>

  useEffect(() => {
    if (map) {
      setMap(map); // Sets the magnifierMap state in the parent
    }
  }, [map, setMap]);

  return null; // Renders nothing
}

export default function KeplerMap({
  showGPSRoute = true,
  showDeviations = true,
  showStoppages = false, 
  showGeofence = true,
  showHaltPoints,
  isFullscreen = false,
  isSatelliteView = false,
  unique_code,
  onToggleSatellite,
  onToggleFullscreen,
  onToggleGPSRoute,
  onToggleDeviations,
}: KeplerMapProps) {
  console.log("KeplerMap received showHaltPoints prop:", showHaltPoints);
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [simPath, setSimPath] = useState<[number, number][]>([]);
const [appPath, setAppPath] = useState<[number, number][]>([]);
const [gpsPath, setGpsPath] = useState<[number, number][]>([]);
  // const [replaySpeed, setReplaySpeed] = useState(50);
  const [customIcons, setCustomIcons] = useState<any>({});
  // Live App coords derived from pathData.app
const [appCoords, setAppCoords] = useState<[number, number][]>([]);

// Saved (persisted) App coords
const [storedAppCoords, setStoredAppCoords] = useState<[number, number][]>([]);
const [showStoredApp, setShowStoredApp] = useState(false);

  const [selectedDeviation, setSelectedDeviation] = useState<number | null>(null);
  const [mainRouteFromApi, setMainRouteFromApi] = useState<[number, number][]>([]);
  const [fastagPoints, setFastagPoints] = useState<FastagPoint[]>([]);
  const [showReplayPanel, setShowReplayPanel] = useState(false);
// Add this new state variable

  const [isNavigating, setIsNavigating] = useState(false); 
const [fastagPath, setFastagPath] = useState<[number, number][]>([]);
const [eta, setEta] = useState("");
const [isLoadingFastag, setIsLoadingFastag] = useState(true);
  // Add these new state variables at the top of your component
const [activeMode, setActiveMode] = useState<'sim' | 'app' | 'gps' | null>(null);
const [activeRoute, setActiveRoute] = useState<[number, number][]>([]);
const [isReplayings, setIsReplayings] = useState(false);
const [progressPercentage, setProgressPercentage] = useState(0);
// Add these new state variables
const [dayRunPolylines, setDayRunPolylines] = useState<[number, number][][]>([]);
const [showDayRun, setShowDayRun] = useState(false);
const [dayRunDetails, setDayRunDetails] = useState<any[]>([]);
 // 0 to 100
const [currentReplayPositions, setCurrentReplayPositions] = useState<number>(0);

// const [haltPopupShown, setHaltPopupShown] = useState(false);
// Add near other refs (e.g. next to vehicleMarkerRef)
const haltPopupRef = useRef<L.Popup | null>(null);
const haltPopupTimerRef = useRef<NodeJS.Timeout | null>(null);

const replayIntervalRef = useRef<NodeJS.Timeout | null>(null); 
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  // Keep these for the new replay system
const [isReplaying, setIsReplaying] = useState(false);
const [replayProgress, setReplayProgress] = useState(0); // 0 to 100
const [currentReplayPosition, setCurrentReplayPosition] = useState<[number, number] | null>(null);
// const [currentReplayIndex, setCurrentReplayIndex] = useState(0);
const replayIndexRef = useRef(0);
const [isPausedAtHalt, setIsPausedAtHalt] = useState(false);
const [replayTimeoutId, setReplayTimeoutId] = useState<NodeJS.Timeout | null>(null);
const [currentReplayHaltIndex, setCurrentReplayHaltIndex] = useState(-1);
  const [showMagnifierSettings, setShowMagnifierSettings] = useState(false);
  const [isMagnifierEnabled, setIsMagnifierEnabled] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [magnifierCenter, setMagnifierCenter] = useState<[number, number]>([28.6139, 77.209]);
  const [isDraggingMagnifier, setIsDraggingMagnifier] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [haltPoints, setHaltPoints] = useState<HaltPoint[]>([]);
  
  const [showHalt, setShowHalt] = useState(false);
  const shouldShowHaltMarkers = showHaltPoints || showHalt;
  const [selectedDeviationForReplay, setSelectedDeviationForReplay] = useState<number | null>(null);
  const [replaySpeed, setReplaySpeed] = useState(1);

  const [previousBounds, setPreviousBounds] = useState<LatLngBoundsExpression | null>(null); // ✅ Add this new state
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
const [panelDragOffset, setPanelDragOffset] = useState({ x: 0, y: 0 });
  const [is3DView, setIs3DView] = useState(false);
  const polylineColors = [
    '#E67E22', // Orange for day 1
    '#3498DB', // Blue for day 2
    '#2ECC71', // Green for day 3
    '#9B59B6', // Purple for day 4
    '#F1C40F', // Yellow for day 5
    // Add more colors if you expect more days
  ];

  const [magnifierSettings, setMagnifierSettings] = useState<MagnifierSettings>({
    positionX: 0.5,
    positionY: 0.5,
    size: 200,
    zoom: 4,
    borderWidth: 4,
  });
  // Add this at the top of your KeplerMap component function
// const [pathData, setPathData] = useState({ sim: [], app: [], gps: [] });
const [pathData, setPathData] = useState<PathState | null>(null);
const [isLoadingPath, setIsLoadingPath] = useState(true);
const [showFastag, setShowFastag] = useState(false);
const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if the screen is mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    // Initial check on component mount
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []); // Empty dependency array ensures this runs only once on mount
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeMode) return;
  
    const path =
      activeMode === 'app' ? appPath :
      activeMode === 'sim' ? simPath :
      activeMode === 'gps' ? gpsPath : [];
  
    if (!path?.length) return;
  
    if (path.length === 1) {
      map.setView(path[0] as any, Math.max(map.getZoom(), 16));
    } else {
      map.fitBounds(path as any, { padding: [40, 40] });
    }
  }, [activeMode, appPath, simPath, gpsPath]);
 

  
const isTollPassed = (p: FastagPoint) => {
  const t = Date.parse(p.time_stamp);
  return Number.isFinite(t) && t <= Date.now();
}
//   useEffect(() => {    // Stop the replay if the component unmounts or if replaying is disabled
//     if (replayTimeoutId) {
//         clearTimeout(replayTimeoutId);
//     }

//     if (!isReplaying || !activeRoute.length) {
//         return;
//     }
//     const animationDelay = 50 / replaySpeed; 
//     // Function to calculate the next position
//     const animateReplay = () => {
//         // Find the next halt point in the route
//         const nextHaltPoint = haltPoints[currentReplayHaltIndex + 1];

//         if (nextHaltPoint) {
//           // Convert the next halt point's coordinates to a `[lat, lng]` tuple
//           const haltCoords: [number, number] = [nextHaltPoint.geo_point.coordinates[1], nextHaltPoint.geo_point.coordinates[0]];
//           const currentPosition = activeRoute[currentReplayIndex];
  
//           // Check if the vehicle is near the halt point
//           const distance = L.latLng(currentPosition).distanceTo(L.latLng(haltCoords));
//           const tolerance = 50; // meters
  
//           if (distance < tolerance && !isPausedAtHalt) {
//             // If close, pause and show the popup
//             setCurrentReplayHaltIndex(prev => prev + 1);
//             setIsPausedAtHalt(true);
//             setReplayTimeoutId(setTimeout(() => {
//               setIsPausedAtHalt(false);
//             // Move to the next halt point
//               // Continue the replay
//               const timeoutId = setTimeout(animateReplay, animationDelay);
//               setReplayTimeoutId(timeoutId);
//             }, 4000)); // Pause for 2 seconds
//             return;
//           }
//         }
//         // Normal replay logic
//         let newIndex = currentReplayIndex + 1;
//         if (newIndex >= activeRoute.length) {
//             setIsReplaying(false); // End of route
//             setCurrentReplayPosition(null);
//             setReplayProgress(100);
//             if (replayTimeoutId) {
//                clearTimeout(replayTimeoutId);
//              setReplayTimeoutId(null);
//                }
//             return;
//         }

//         setCurrentReplayIndex(newIndex);
//       setCurrentReplayPosition(activeRoute[newIndex]);
    
    
//         // ✅ Add this line to update the progress bar
//        const newProgress = ((newIndex) / (activeRoute.length - 1)) * 100;
//         setReplayProgress(newProgress);
//      // Continue the animation
//        const timeoutId = setTimeout(animateReplay, animationDelay);
//                 setReplayTimeoutId(timeoutId);
//     };

//    // Initial call to start the animation
//        const timeoutId = setTimeout(animateReplay, animationDelay);
//     setReplayTimeoutId(timeoutId);

 
//      return () => {
//      if (replayTimeoutId) {
//             clearTimeout(replayTimeoutId);
//         }
//      };
//  }, [isReplaying, activeRoute, currentReplayIndex, isPausedAtHalt, haltPoints, currentReplayHaltIndex,replaySpeed]);
// Find the `useEffect` that contains the `animateReplay` function and update it.
// Find this useEffect block

// Main useEffect for the replay animation loop
// Replace the entire main replay useEffect block with this one
// Replace your main replay useEffect with this consolidated and corrected version.
useEffect(() => {
  let timerId: NodeJS.Timeout | null = null;
  
  if (!isReplaying || !activeRoute.length) {
    // Stop the animation and cleanup if the replay is not active
    if (timerId) clearTimeout(timerId);
    return;
  }

  const animationDelay = 50 / replaySpeed;
  console.log("animateReplay is running. Is paused:", isPausedAtHalt); 
  const animateReplay = () => {
    const candidateIndex = replayIndexRef.current + 1;
    if (candidateIndex >= activeRoute.length) {
      // end of route
      setIsReplaying(false);
      setCurrentReplayPosition(null);
      setReplayProgress(100);
      return;
    }
  
    const nextPosition = activeRoute[candidateIndex];
  
    // Look for a halt that has not been handled yet and is within tolerance
    const toleranceMeters = 50;
    const foundHaltIndex = haltPoints.findIndex((h, idx) => {
      if (idx <= currentReplayHaltIndex) return false; // only look for future halts
      const haltCoords: [number, number] = [
        h.geo_point.coordinates[1],
        h.geo_point.coordinates[0]
      ];
      return L.latLng(nextPosition).distanceTo(L.latLng(haltCoords)) <= toleranceMeters;
    });
  
    if (foundHaltIndex !== -1) {
      // Stop at the halt (do not advance further)
      replayIndexRef.current = candidateIndex;
      setCurrentReplayPosition(nextPosition);
      setReplayProgress(
        (candidateIndex / (activeRoute.length - 1)) * 100
      );
      setCurrentReplayHaltIndex(foundHaltIndex);
      setIsPausedAtHalt(true);
      // do not schedule the next timer here — the pause useEffect handles resume
      return;
    }
  
    // Normal frame advance if no halt
    replayIndexRef.current = candidateIndex;
    setCurrentReplayPosition(nextPosition);
    setReplayProgress(
      (candidateIndex / (activeRoute.length - 1)) * 100
    );
    timerId = setTimeout(animateReplay, animationDelay);
  };
// Start the animation loop if not paused
if (!isPausedAtHalt) {
  timerId = setTimeout(animateReplay, animationDelay);
}

// Cleanup
return () => {
  if (timerId) clearTimeout(timerId);
};
  

 
}, [isReplaying, activeRoute, isPausedAtHalt, haltPoints, currentReplayHaltIndex, replaySpeed]);

// This new useEffect handles the pause duration and resume. It's cleaner and separates concerns.
useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    console.log("Popup useEffect triggered. isPausedAtHalt =", isPausedAtHalt);
    if (isPausedAtHalt) {
        // If we're paused, set a timer to un-pause after 5 seconds.
        timerId = setTimeout(() => {
            setIsPausedAtHalt(false);
        }, 5000);
    }
    return () => {
        if (timerId) {
            clearTimeout(timerId);
        }
    };
}, [isPausedAtHalt]);

// Add this NEW useEffect hook to manage the pause duration and resume.
// This is cleaner and separates concerns.
useEffect(() => {
  let timerId: NodeJS.Timeout | null = null;
  if (isPausedAtHalt) {
    // If we're paused, set a timer to un-pause after 5 seconds.
    timerId = setTimeout(() => {
      setIsPausedAtHalt(false);
    }, 5000);
  }

  // Cleanup the timer if the component unmounts or the state changes.
  return () => {
    if (timerId) {
      clearTimeout(timerId);
    }
  };
}, [isPausedAtHalt]);

const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);


// Remove this existing useEffect hook, which is not correctly managing the popup.
// useEffect(() => {
//   if (isPausedAtHalt && vehicleMarkerRef.current) {
//     // Open the popup when paused at a halt
//     vehicleMarkerRef.current.openPopup();

//     // Set a timer to close the popup and resume replay
//     const timerId = setTimeout(() => {
//       if (vehicleMarkerRef.current) {
//         vehicleMarkerRef.current.closePopup();
//       }
//       setIsPausedAtHalt(false);
//     }, 5000); // 4-second pause

//     // Cleanup function to clear the timer if the component unmounts
//     return () => clearTimeout(timerId);
//   }
// }, [isPausedAtHalt,currentReplayHaltIndex, currentReplayPosition]);



{currentReplayPosition && customIcons.vehicle && (
   <Marker position={currentReplayPosition} icon={customIcons.vehicle} ref={vehicleMarkerRef} />
  )}
 
useEffect(() => {
  
  if (isPausedAtHalt && mapRef.current && currentReplayPosition) {
    mapRef.current.panTo(currentReplayPosition, {
      duration: 0.5,
      easeLinearity: 0.25,
    });
  }
}, [isPausedAtHalt, mapRef, currentReplayPosition]);


// Robust popup using Leaflet L.popup so we don't depend on react-leaflet child timing
useEffect(() => {
  if (!mapRef.current) return;

  // Clear any previous popup / timer
  const closeExisting = () => {
    if (haltPopupTimerRef.current) {
      clearTimeout(haltPopupTimerRef.current);
      haltPopupTimerRef.current = null;
    }
    if (haltPopupRef.current && mapRef.current) {
      try {
        mapRef.current.closePopup(haltPopupRef.current);
      } catch {}
      haltPopupRef.current = null;
    }
  };

  if (isPausedAtHalt && currentReplayHaltIndex > -1 && currentReplayPosition && haltPoints[currentReplayHaltIndex]) {
    // Build a simple HTML string for the popup content
    const h = haltPoints[currentReplayHaltIndex];
    const durationHours = Math.floor(h.halt_duration / 60);
    const durationMins = Math.floor(h.halt_duration % 60);
    const content = `
      <div class="${styles.popup}">
        <div class="${styles.popupTitle} ${styles.titleRed}">Halt Info</div>
        <hr class="${styles.divider}" />
        <div class="${styles.popupBody}">Duration: <strong>${durationHours > 0 ? durationHours + ' hour(s), ' : ''}${durationMins} minute(s)</strong></div>
        <div class="${styles.popupBody}">Start: <strong>${new Date(h.start_time).toLocaleString()}</strong></div>
        <div class="${styles.popupBody}">End: <strong>${new Date(h.end_time).toLocaleString()}</strong></div>
      </div>
    `;

    // ensure previous popup closed
    closeExisting();

    // create/open popup at vehicle position
    try {
      const popup = L.popup({
        closeOnClick: false,
        autoClose: false,
        className: '' // optional: add custom class
      })
        .setLatLng(currentReplayPosition)
        .setContent(content)
        .openOn(mapRef.current as any); // openOn attaches it to the map
      haltPopupRef.current = popup;

      // Pan map slightly to show the popup
      try {
        mapRef.current.panTo(currentReplayPosition, { animate: true, duration: 0.4 });
      } catch {}

      // set timer to close popup and resume replay
      haltPopupTimerRef.current = setTimeout(() => {
        if (haltPopupRef.current && mapRef.current) {
          try { mapRef.current.closePopup(haltPopupRef.current); } catch {}
          haltPopupRef.current = null;
        }
        setIsPausedAtHalt(false);
      }, 5000);
    } catch (err) {
      console.error("Failed to show halt popup", err);
    }
  } else {
    // not paused or missing data -> close any existing popup
    closeExisting();
  }

  // cleanup
  return () => {
    if (haltPopupTimerRef.current) {
      clearTimeout(haltPopupTimerRef.current);
      haltPopupTimerRef.current = null;
    }
    if (haltPopupRef.current && mapRef.current) {
      try { mapRef.current.closePopup(haltPopupRef.current); } catch {}
      haltPopupRef.current = null;
    }
  };
}, [isPausedAtHalt, currentReplayHaltIndex, currentReplayPosition, haltPoints]);


type ShipPoint = {
  location: {
    geo_point: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
    polylines?: string[];
    name?: string;
    city?: string;
    area?: string;
    pincode?: string;
    locality?: string;
  };
  sequence: number;
  arrived_at?: string;
  finished_at?: string;
  waypoints?: ShipPoint[]; 
};
interface PathResponse {
  sim?: PathPoint[];
  app?: PathPoint[];
  gps?: string | PathPoint[];
}
interface PathState {
  path: [number, number][];
  sim?: PathPoint[];
  app?: PathPoint[];
  gps?: string | PathPoint[];
}

type ShipmentResponse = {
  shipment?: {
    _id?: string;
    SIN?: string;
    pickups?: ShipPoint[];
    deliveries?: ShipPoint[];
    waypoints?: ShipPoint[];
    delivery_date:any; 
    trip_tracker?:any;
    dayrun?: {
      dayRuns?: dayRuns[];
    };
 
  };
};
interface dayRuns {
  start: string;
  distance: number;
  travel_time: number;
  polyline: string;
}

// Define the structure of a geo_point
interface GeoPoint {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

// Define the structure of a path point in the SIM or APP data
interface PathPoint {
  geo_point: GeoPoint;
  address: string;
  created_at: string;
}

// Define the structure of the main API response
interface PathData {
  sim: PathPoint[];
  app: PathPoint[];
  gps: string | PathPoint[]; // 'gps' can be a string or an array of PathPoint
  // ... other properties
}

// --- New state for shipment rendering ---
const [shipmentPickups, setShipmentPickups] = useState<
  { pos: [number, number]; label: string; meta?: ShipPoint }[]
>([]);
const [shipmentDeliveries, setShipmentDeliveries] = useState<
  { pos: [number, number]; label: string; meta?: ShipPoint }[]
>([]);
const [deliveryPolylines, setDeliveryPolylines] = useState<[number, number][][]>([]);
const [isLoadingShipment, setIsLoadingShipment] = useState(true);
// helper to build numbered chip icons like "P1", "D2"
const makeChipIcon = useCallback(
  (color: string, label: string) =>
    new L.DivIcon({
      html: `<div class="${styles.markerChip}" style="background-color:${color}">${label}</div>`,
      className: "custom-marker",
      iconSize: [25, 25],
      iconAnchor: [15, 15],
    }),
  []
);
const makeChipicon = useCallback(
  (color: string, label: string) =>
    new L.DivIcon({
      html: `<div class="${styles.markerChip}" style="background-color:${color}">${label}</div>`,
      className: "custom-marker",
      iconSize: [100, 100],
      iconAnchor: [15, 15],
    }),
  []
);
// Inside your KeplerMap component, add this new useEffect
function convertUtcToIst24hr(utcDateString: string | undefined): string {
  if (!utcDateString) {
    return 'N/A';
  }

  const date = new Date(utcDateString);

  // Use Intl.DateTimeFormat to get date and time components in IST
  // This is the most reliable way to handle timezone conversions
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Ensure 24-hour format
    timeZone: 'Asia/Kolkata' // Explicitly set the timezone to IST
  };

  // Get the formatted date and time string
  const formattedString = date.toLocaleString('en-IN', options);

  // Extract the time part (e.g., "00:00:00")
  const timePart = formattedString.split(', ')[1];

  // If the time is midnight, reformat the hour to "24"
  if (timePart && timePart.startsWith('00:00')) {
    const datePart = formattedString.split(', ')[0];
    const newTimePart = timePart 
    // .replace('00:', '24:');
    return `${datePart}, ${newTimePart}`;
  }

  return formattedString;
}
useEffect(() => {
  // If the magnifier is being disabled...
  if (!isMagnifierEnabled) {
    // ...reset the map instance state back to null.
    setMagnifierMap(null);
    console.log("Magnifier instance cleaned up.");
  }
}, [isMagnifierEnabled]); // This effect runs only when isMagnifierEnabled changes
// Fetch current location
// This useEffect ONLY fetches data and runs once on mount.
useEffect(() => {
  const ac = new AbortController();
  const loadShipment = async () => {
    setIsLoadingShipment(true);
    try {
      const res = await fetch(
     
        `https://live-api.instavans.com/api/raccoon/shipment?unique_code=${encodeURIComponent(unique_code ?? '')}`,
        { signal: ac.signal }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const payload: ShipmentResponse = await res.json();
      const shipment = payload.shipment;
      const totalDistanceKm = Math.round(((shipment?.trip_tracker?.travelled_distance || 0) + (shipment?.trip_tracker?.remaining_distance || 0)) / 1000);
const travelledDistanceKm = Math.round((shipment?.trip_tracker?.travelled_distance || 0) / 1000);
const remainingDistanceKm = Math.round((shipment?.trip_tracker?.remaining_distance || 0) / 1000);
const newProgress = totalDistanceKm > 0 ? (travelledDistanceKm / totalDistanceKm) * 100 : 0;
setProgressPercentage(newProgress);
      const dayRuns = shipment?.dayrun?.dayRuns || [];
      const decodedDayRuns = dayRuns
      .filter((run) => run.polyline)
      .map((run) => decodePolyline(run.polyline));
      
      const extractedDetails = dayRuns.map(run => ({
        startTime: convertUtcToIst24hr(run.start),
        distance: run.distance ? `${(run.distance).toFixed(2)} km` : 'N/A', // Assuming distance is in meters
    
        time: run.travel_time ? `${Math.floor(run.travel_time / 3600)}h ${Math.floor((run.travel_time % 3600) / 60)}m` : 'N/A',
        // Include any other details you want to display
      }));
      setDayRunDetails(extractedDetails);
      // Assuming it's encoded
        console.log("Decoded Day Run Polylines:", decodedDayRuns);
        console.log("Day Run Details:", extractedDetails);
        console.log("Show Day Run State:", showDayRun);
      // Update the state with the day run polylines
      setDayRunPolylines(decodedDayRuns);

      if (shipment && shipment.delivery_date) {
        // Create a Date object from the ISO 8601 string
        const deliveryDate = new Date(shipment.delivery_date);
        
        // Format the time to a locale-specific time string (e.g., "12:40 PM")
        // const formattedTime = deliveryDate.toLocaleTimeString([], {
        //   hour: "2-digit",
        //   minute: "2-digit",
        // });
        const formattedTime = DateTime.fromJSDate(deliveryDate).setZone('Asia/Kolkata').toFormat('dd MMM yyyy, HH:mm');

        // Update the ETA state
        setEta(formattedTime);
      }

      const pickups = payload.shipment?.pickups ?? [];
      const deliveries = payload.shipment?.deliveries ?? [];
      const wayData = payload?.shipment?.waypoints ??[];
      const wayCoordinates = wayData.map(waypoints => {
          // The API returns [lng, lat], but Leaflet expects [lat, lng]
          const [lng, lat] = waypoints?.location?.geo_point.coordinates;
          return [lat, lng] as [number, number];
      });

      // Set the state with the extracted coordinates
      setMainRouteFromApi(wayCoordinates);
      const pickupMarkers = pickups
        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
        .map((p, i) => {
          const [lng, lat] = p.location.geo_point.coordinates;
          return { pos: [lat, lng] as [number, number], label: `P${i + 1}`, meta: p };
        });

      const deliveryMarkers = deliveries
        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
        .map((d, i) => {
          const [lng, lat] = d.location.geo_point.coordinates;
          return { pos: [lat, lng] as [number, number], label: `D${i + 1}`, meta: d };
        });

      const decodedPolys: [number, number][][] = [];
      for (const d of deliveries) {
        const enc = d.location.polylines || [];
        for (const encStr of enc) {
          const coords = decodePolyline(encStr);
          if (coords.length > 0) decodedPolys.push(coords);
        }
      }

      setShipmentPickups(pickupMarkers);
      setShipmentDeliveries(deliveryMarkers);
      setDeliveryPolylines(decodedPolys);
      
    } catch (err) {
      console.error("Shipment fetch failed:", err);
    } finally {
      setIsLoadingShipment(false);
    }
  };

  loadShipment();
  return () => ac.abort();
}, [
  // decodePolyline
]); // This dependency is correct

useEffect(() => {
  // Wait until we have data before doing anything
  if (shipmentPickups.length === 0 && shipmentDeliveries.length === 0) {
    return;
  }
  const map = mapRef.current;
  // Now, check if the map instance is ready.
  // If mapRef.current exists, we can safely use it.
  // if (mapRef.current) {
    if (map && map.getContainer()) { 

    const all = [
      ...shipmentPickups.map(p => p.pos),
      ...shipmentDeliveries.map(d => d.pos)
    ];
    if (currentLocation) {
      all.push(currentLocation); // include live point
    }
    if (all.length > 0) {
      console.log("Fitting map bounds now..."); // Add this log for confirmation
      mapRef.current.fitBounds(L.latLngBounds(all), { padding: [40, 40] });
    }
  }
}, [shipmentPickups, shipmentDeliveries]); // ✅ Only depend on the DATA// ✅ Add mapRef.current to the dependencies
useEffect(() => {
  console.log("--- DEBUGGING CURRENT LOCATION ---");
  // Check if the custom vehicle icon is loaded
  if (!customIcons.vehicle) {
    console.log("STATUS: Vehicle icon is not yet loaded.");
  } else {
    console.log("STATUS: Vehicle icon is available.");
  }

  // Check the state of the current location
  if (currentLocation === null) {
    console.log("STATUS: currentLocation is null. Data is not yet fetched or API returned no coordinates.");
  } else {
    console.log("STATUS: currentLocation is valid:", currentLocation);
  }

  // Check if the live vehicle Marker should be visible
  if (currentLocation && !isReplaying) {
    console.log("STATUS: Live vehicle Marker SHOULD be visible.");
  } else {
    console.log("STATUS: Live vehicle Marker is NOT visible due to conditional logic.");
    console.log("Reason: currentLocation is", currentLocation, "and isReplaying is", isReplaying);
  }

}, [currentLocation, isReplaying, customIcons.vehicle]);
useEffect(() => {
  const ac = new AbortController();

  const fetchCurrentLocation = async () => {
    try {
      const res = await fetch(
        `https://live-api.instavans.com/api/raccoon/currentLocation?unique_code=${encodeURIComponent(unique_code ?? '')}`,
        { signal: ac.signal }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        // API returns [lng, lat], Leaflet expects [lat, lng]
        const [lng, lat] = data.data;
        setCurrentLocation([lat, lng]);
      }
    } catch (err) {
      if ((err as any)?.name !== "AbortError") {
        console.error("Current location fetch failed:", err);
      }
    }
  };

  // fetch immediately and then poll every 15s
  fetchCurrentLocation();
  const interval = setInterval(fetchCurrentLocation, 15000);

  return () => {
    clearInterval(interval);
    ac.abort();
  };
}, []);

// Google Encoded Polyline Algorithm decoder → [lat, lng][]
// function decodePolyline(encoded: string): [number, number][] {
  const decodePolyline = useCallback((encoded: string): [number, number][] => {
  if (!encoded) return [];
  let index = 0, lat = 0, lng = 0;
  const coordinates: [number, number][] = [];

  const shift5 = () => {
    let result = 0, shift = 0, b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    return (result & 1) ? ~(result >> 1) : (result >> 1);
  }

  while (index < encoded.length) {
    lat += shift5();
    lng += shift5();
    coordinates.push([lat * 1e-5, lng * 1e-5]); // [lat, lng]
  }
  return coordinates;
}, []); 
useEffect(() => {
  if (activeMode === 'app') {
    console.log('[APP] appPath len:', appPath.length, 'first3:', appPath.slice(0,3));
  }
}, [activeMode, appPath]);
console.log('typeof appPath[0]:', typeof appPath[0], 'value:', appPath[0]);

// This useEffect is already correct and will now work properly

// Add this useEffect to fetch the path data
useEffect(() => {
  const fetchPathData = async () => {
    try {
      const response = await fetch(`https://live-api.instavans.com/api/raccoon/path?unique_code=${encodeURIComponent(unique_code ?? '')}`);
      if (!response.ok) {
        throw new Error("Failed to fetch path data");
      }
      const data:PathResponse = await response.json();
        // Handle the different data types for the path
        // let decodedPath = [];
        // let decodedPath: [number, number][];
        let decodedPath: [number, number][] = [];
      
        if (data.sim && data.sim.length > 0) {
          // decodedPath = data.sim.map(point=> point.geo_point.coordinates);
          const decodedSim = data.sim.map(p => [p.geo_point.coordinates[1], p.geo_point.coordinates[0]] as [number, number]);
          // const decodedSim = data.sim.map(point => point.geo_point.coordinates);
        setSimPath(decodedSim);
          // setActiveMode('sim');
        }  
         if (data.app && data.app.length > 0) {
          const decodedApp = data.app.map(p => [p.geo_point.coordinates[1], p.geo_point.coordinates[0]] as [number, number]);
          // const decodedApp = data.app.map(point => point.geo_point.coordinates);
        setAppPath(decodedApp);
        }
       
        if (data.gps) {
          let decodedGps: [number, number][] = [];
          if (typeof data.gps === 'string') {
            // Decode the polyline string for GPS
            decodedGps = polyline.decode(data.gps);
          } else if (Array.isArray(data.gps) && data.gps.length > 0) {
            // Handle the case where GPS data is an array of points
            decodedGps = data.gps.map(point => point.geo_point.coordinates);
          }
          setGpsPath(decodedGps);
        }
        
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingPath(false);
    }
  };

  fetchPathData();
}, []); // The empty array ensures this runs only once


useEffect(() => {
  if (!pathData || !activeMode ) {
    setActiveRoute([]);
    return;
  }
  
  const sourceData = pathData[activeMode];
  if (!sourceData) {
    setActiveRoute([]);
    return;
  }

  let coordinates: [number, number][] = [];

  if (typeof sourceData === 'string') {
  
    coordinates = polyline.decode(sourceData);

  

  } else if (Array.isArray(sourceData)) {
    // This part of your code is correct, it reverses the [lng, lat] from the API.
    coordinates = (sourceData as PathPoint[]).map((point) => {
      const [lng, lat] = point.geo_point.coordinates;
      return [lat, lng];
    });

   
  }
  
  setActiveRoute(coordinates);

}, [activeMode, pathData]);


useEffect(() => {
  const ac = new AbortController();

  const loadFastag = async () => {
    setIsLoadingFastag(true);
    try {
      const res = await fetch(
        `https://live-api.instavans.com/api/raccoon/toll_history?unique_code=${encodeURIComponent(unique_code ?? '')}`,
        { method: "GET", signal: ac.signal }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const api: FastagApi = await res.json();

      // markers
      setFastagPoints(api?.data ?? []);

      // route polyline (prefer server polyline; else build from points)
      let poly: [number, number][] = [];
      if (api?.fastagData?.polyline) {
        poly = decodePolyline(api.fastagData.polyline);
      } else if (api?.data?.length) {
        poly = api.data.map((p) => [p.geo_point.coordinates[1], p.geo_point.coordinates[0]]);
      }
      setFastagPath(poly);

      // fit map
      if (poly.length && mapRef.current?.fitBounds) {
        mapRef.current.fitBounds(poly as unknown as LatLngExpression[], {
          padding: [40, 40],
        });
      }
    } catch (err) {
      if ((err as any)?.name !== "AbortError") {
        console.error("Fastag fetch failed:", err);
      }
    } finally {
      setIsLoadingFastag(false);
    }
  };

  loadFastag();
  return () => ac.abort();
}, []);

 // This hook gives us the map instance!
// ... (existing functions and callbacks)

// NEW: Event handler to start dragging the panel
const handlePanelMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  e.preventDefault(); // Prevents text selection during drag
  e.stopPropagation();

  const panelHeader = e.currentTarget as HTMLDivElement;
  const rect = panelHeader.getBoundingClientRect();
  
  // Calculate the offset from the top-left of the panel
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  setPanelDragOffset({ x: offsetX, y: offsetY });
  setIsDraggingPanel(true);
}, []);

// NEW: Global mouse move handler to track panel drag
useEffect(() => {
  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!isDraggingPanel) return;

    // Calculate new position based on mouse position and original drag offset
    setPanelPosition({
      x: e.clientX - panelDragOffset.x,
      y: e.clientY - panelDragOffset.y,
    });
  };

  const handleGlobalMouseUp = () => {
    setIsDraggingPanel(false);
  };
  
  if (isDraggingPanel) {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
  }

  return () => {
    window.removeEventListener('mousemove', handleGlobalMouseMove);
    window.removeEventListener('mouseup', handleGlobalMouseUp);
  };
}, [isDraggingPanel, panelDragOffset]);
 




useEffect(() => {
  if (!activeMode) {
    setActiveRoute([]);
    return;
  }
  
  if (activeMode === 'gps') {
    setActiveRoute(gpsPath);
  } else if (activeMode === 'sim') {
    setActiveRoute(simPath);
  } else if (activeMode === 'app') {
    setActiveRoute(appPath);
  } else {
    setActiveRoute([]);
  }

}, [activeMode, gpsPath, simPath, appPath]);
  const [selectedMapStyle, setSelectedMapStyle] = useState("light");
  const [showMapStyleSelector, setShowMapStyleSelector] = useState(false);
  const mapStyles = [
    { id: "none", name: "No Basemap", url: "", color: "#000000" },
    { id: "dark", name: "DarkMatter", url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", color: "#2c3e50" },
    { id: "light", name: "Positron", url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", color: "#f8f9fa" },
    { id: "voyager", name: "Voyager", url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png", color: "#e8f4f8" },
    { id: "satellite", name: "Satellite With Streets", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", color: "#4a5568" },
    { id: "osm-dark", name: "Dark", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", color: "#1a202c" },
    { id: "osm-light", name: "Light", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", color: "#ffffff" },
    { id: "muted-light", name: "Muted Light", url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png", color: "#f1f5f9" },
    { id: "muted-night", name: "Muted Night", url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png", color: "#374151" },
  ];

  const getCurrentMapUrl = () => {
    if (selectedMapStyle === "none") return "";
    if (isSatelliteView) return mapStyles.find((s) => s.id === "satellite")?.url || "";
    return mapStyles.find((s) => s.id === selectedMapStyle)?.url || mapStyles.find((s) => s.id === "light")?.url || "";
  };

  // Delhi
  const center: [number, number] = [28.6139, 77.209];
  const zoom = 12;

  const mainRoute: [number, number][] = [
    [28.6139, 77.209],
    [28.6129, 77.2295],
    [28.5562, 77.241],
    [28.5355, 77.25],
    [28.4595, 77.0266],
    [28.4089, 77.0478],
  ];
  useEffect(() => {
    if (typeof window === "undefined") return;
  
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
  
      const createCustomIcon = (color: string, label: string) =>
        new L.DivIcon({
          html: `<div class="${styles.markerChip}" style="background-color:${color}">${label}</div>`,
          className: "custom-marker",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        const mapPinSvg =`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`
      const vehicleIcon = new L.DivIcon({
        html: mapPinSvg,
        className: styles.mapEmoji,
        iconSize: [100, 100],
        // move anchor aboce the point so it points correctly
        // iconAnchor: [15, 15],
        iconAnchor: [18, 30],
      });
  
      const deviationIcon = new L.DivIcon({
        html: `<div class="${styles.devDot}"></div>`,
        className: "deviation-marker",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
  
      // ✅ NEW: use image icons for FASTag tolls
      const tollPendingIcon = L.icon({
        iconUrl: tollPendingUrl.src, // or: tollPendingUrl (Option B)
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        className: styles.tollIcon, // optional
      });
  
      const tollPassedIcon = L.icon({
        iconUrl: tollPassedUrl.src, // or: tollPassedUrl (Option B)
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        className: styles.tollIcon, // optional
      });
  
      setCustomIcons({
        pickup: createCustomIcon("#22c55e", "P"),
        delivery: createCustomIcon("#ef4444", "D"),
        waypoint: createCustomIcon("#3b82f6", "W"),
        vehicle: vehicleIcon,
        deviation: deviationIcon,
        // replace the old `toll` DivIcon with these two:
        tollPending: tollPendingIcon,
        tollPassed: tollPassedIcon,
      });
  
      setLeafletLoaded(true);
      setIsClient(true);
    });
  }, []);
  useEffect(() => {
    const ac = new AbortController();

    const loadHalt = async () => {
     
      try {
        const res = await fetch(
          `https://live-api.instavans.com/api/raccoon/halt?unique_code=${encodeURIComponent(unique_code ?? '')}`,
          { method: "GET", signal: ac.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const haltData: HaltPoint[] = await res.json();
        setHaltPoints(haltData);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          console.error("Halt fetch failed:", err);
        }
      } finally {
       
      }
    };

    loadHalt();
    return () => ac.abort();
  }, []);
  
 

  const createRouteBuffer = (route: [number, number][], bufferDistance = 0.003): [number, number][] => {
    const buffer: [number, number][] = [];
    for (let i = 0; i < route.length - 1; i++) {
      const [lat1, lng1] = route[i];
      const [lat2, lng2] = route[i + 1];
      const dx = lng2 - lng1;
      const dy = lat2 - lat1;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0) {
        const offsetX = (-dy / length) * bufferDistance;
        const offsetY = (dx / length) * bufferDistance;
        buffer.push([lat1 + offsetY, lng1 + offsetX]);
        buffer.push([lat1 - offsetY, lng1 - offsetX]);
      }
    }
    return buffer;
  };
  const routeBuffer = createRouteBuffer(mainRoute);

  const deviationRoutes = [
    {
      id: 1,
      path: [
        [28.6139, 77.209],
        [28.62, 77.195],
        [28.615, 77.18],
        [28.6129, 77.2295],
      ] as [number, number][],
      reason: "Traffic congestion on main route",
      location: "Karol Bagh Junction",
      startTime: "10:25 AM",
      endTime: "10:50 AM",
      distance: "2.3 km",
      duration: "25 min",
    },
    {
      id: 2,
      path: [
        [28.5562, 77.241],
        [28.54, 77.26],
        [28.53, 77.255],
        [28.5355, 77.25],
      ] as [number, number][],
      reason: "Road construction work",
      location: "Kalkaji Extension",
      startTime: "11:15 AM",
      endTime: "11:25 AM",
      distance: "1.8 km",
      duration: "10 min",
    },
  ];

  const geofenceAreas = [
    { id: 1, center: [28.6139, 77.209] as [number, number], radius: 500, name: "Pickup Zone - Connaught Place", color: "#22c55e" },
    { id: 2, center: [28.5355, 77.25] as [number, number], radius: 800, name: "Transit Zone - Nehru Place", color: "#3b82f6" },
    { id: 3, center: [28.4089, 77.0478] as [number, number], radius: 600, name: "Delivery Zone - Gurgaon", color: "#ef4444" },
  ];

  const vehiclePosition: [number, number] = [28.5562, 77.241];

  const createCircle = (center: [number, number], radius: number): [number, number][] => {
    const points: [number, number][] = [];
    const earthRadius = 6371000;
    for (let i = 0; i <= 64; i++) {
      const angle = (i * 360) / 64;
      const angleRad = (angle * Math.PI) / 180;
      const lat = center[0] + (radius / earthRadius) * (180 / Math.PI) * Math.cos(angleRad);
      const lng = center[1] + ((radius / earthRadius) * (180 / Math.PI) * Math.sin(angleRad)) / Math.cos((center[0] * Math.PI) / 180);
      points.push([lat, lng]);
    }
    return points;
  };

  const calculateMagnifierPosition = useCallback((mouseX?: number, mouseY?: number) => {
    if (!mapContainerRef.current) return { x: 0, y: 0 };
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = mouseX !== undefined ? mouseX : magnifierSettings.positionX * rect.width;
    const y = mouseY !== undefined ? mouseY : magnifierSettings.positionY * rect.height;
    return { x, y };
  }, [magnifierSettings.positionX, magnifierSettings.positionY]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMagnifierEnabled || !isDraggingMagnifier || !mapContainerRef.current 
   || !mapRef.current
  ) return;
    console.log("💨 MOUSE MOVE while dragging...");
    const rect = mapContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const x = mouseX - dragOffset.x;
    const y = mouseY - dragOffset.y;

    const constrainedX = Math.max(magnifierSettings.size / 2, Math.min(x, rect.width - magnifierSettings.size / 2));
    const constrainedY = Math.max(magnifierSettings.size / 2, Math.min(y, rect.height - magnifierSettings.size / 2));

    const position = { x: constrainedX, y: constrainedY };
    setMagnifierPosition(position);

    const map = mapRef.current;
    if (map && map.containerPointToLatLng) {
      try {
        const latLng = map.containerPointToLatLng([position.x, position.y]);
        setMagnifierCenter([latLng.lat, latLng.lng]);
      } catch {
        const bounds = map.getBounds();
        if (bounds) {
          const mapWidth = rect.width;
          const mapHeight = rect.height;
          const north = bounds.getNorth();
          const south = bounds.getSouth();
          const east = bounds.getEast();
          const west = bounds.getWest();
          const lat = north - (position.y / mapHeight) * (north - south);
          const lng = west + (position.x / mapWidth) * (east - west);
          setMagnifierCenter([lat, lng]);
        }
      }
    }
  }, [isMagnifierEnabled, isDraggingMagnifier, dragOffset, magnifierSettings.size]);

  const updateMagnifierScreenPosition = useCallback(() => {
    if (!isMagnifierEnabled || !mapRef.current || !mapContainerRef.current) return;
    const map = mapRef.current;
    try {
      const point = map.latLngToContainerPoint(magnifierCenter);
      const rect = mapContainerRef.current.getBoundingClientRect();
      const constrainedX = Math.max(0, Math.min(point.x, rect.width));
      const constrainedY = Math.max(0, Math.min(point.y, rect.height));
      setMagnifierPosition({ x: constrainedX, y: constrainedY });
    } catch {}
  }, [isMagnifierEnabled, magnifierCenter]);

  useEffect(() => {
    if (!mapRef.current || !isMagnifierEnabled) return;
    const map = mapRef.current;
    const handleMapMove = () => { if (!isDraggingMagnifier) updateMagnifierScreenPosition(); };
    map.on("move", handleMapMove);
    map.on("zoom", handleMapMove);
    return () => {
      map.off("move", handleMapMove);
      map.off("zoom", handleMapMove);
    };
  }, [isMagnifierEnabled, isDraggingMagnifier, updateMagnifierScreenPosition]);

  // This effect handles both the initial setup and updates from the settings panel.
// HIGHLIGHT: This is a new, consolidated useEffect to manage magnifier position.
useEffect(() => {
  if (!isMagnifierEnabled || !mapRef.current || !mapContainerRef.current) {
    // If magnifier is not enabled, or map refs are not ready, do nothing.
    return;
  }

  // Get the bounding box of the map container
  const rect = mapContainerRef.current.getBoundingClientRect();
  const mapInstance = mapRef.current;
  
  // Calculate the new screen position based on the slider values
  const newPositionX = magnifierSettings.positionX * rect.width;
  const newPositionY = magnifierSettings.positionY * rect.height;
  
  // Set the new screen position state
  setMagnifierPosition({ x: newPositionX, y: newPositionY });

  // Convert the new screen position to map coordinates (latitude/longitude)
  const newMagnifierCenter = mapInstance.containerPointToLatLng([newPositionX, newPositionY]);

  // Set the new map center state
  setMagnifierCenter([newMagnifierCenter.lat, newMagnifierCenter.lng]);

  console.log("Magnifier position updated from settings.");

}, [
  isMagnifierEnabled, 
  magnifierSettings.positionX, 
  magnifierSettings.positionY, 
  mapRef, 
  mapContainerRef
]);


const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  console.log("🖱️ MOUSE DOWN triggered.");
  const target = e.target as HTMLElement;

  // HIGHLIGHT: New check to ignore clicks on the magnifier panel
  const isClickOnPanel = target.closest(`.${styles.magnifierPanel}`);
  if (isClickOnPanel) {
    return; // Don't proceed with map or magnifier dragging if the click is on the panel.
  }
  
  // Existing check for markers or popups
  if (target.closest('.leaflet-marker-icon') || target.closest('.leaflet-popup-content')) {
    return;
  }

  if (isMagnifierEnabled && mapContainerRef.current) {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = mapContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const offsetX = mouseX - magnifierPosition.x;
    const offsetY = mouseY - magnifierPosition.y;
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDraggingMagnifier(true);
  }
}, [isMagnifierEnabled, magnifierPosition]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingMagnifier) { 
      console.log("✋ MOUSE UP. Stopping drag.");
      e.preventDefault(); e.stopPropagation(); }
    setIsDraggingMagnifier(false);
  }, [isDraggingMagnifier]);

  useEffect(() => {
    if (showMagnifierSettings) return;
    if (isMagnifierEnabled) {
      const position = calculateMagnifierPosition();
      setMagnifierPosition(position);
      if (mapRef.current && mapContainerRef.current) {
        try {
          const latLng = mapRef.current.containerPointToLatLng([position.x, position.y]);
          setMagnifierCenter([latLng.lat, latLng.lng]);
        } catch {}
      }
    }
  }, [magnifierSettings, showMagnifierSettings, isMagnifierEnabled, calculateMagnifierPosition]);
  const [magnifierMap, setMagnifierMap] = useState<LeafletMap | null>(null);

useEffect(() => {
  // This effect will only run if the magnifier is enabled AND both map refs are available.
  if (isMagnifierEnabled && magnifierMap && mapRef.current) {
    // The 'magnifierMap' variable is already the map instance, no .current is needed
    const magnifierMapInstance = magnifierMap; 
    const mainMap = mapRef.current;

    console.log("--- INITIALIZING MAGNIFIER MAP (Refs are ready!) ---");

    // Use a short timeout. This is a common trick to ensure the map's container
    // has finished rendering in the DOM before we ask the map to measure it.
    const timer = setTimeout(() => {
      // 1. Tell the map to measure its container size (fixes the blank map issue).
      magnifierMap.invalidateSize();
      
      // 2. Set the initial view of the magnifier map.
      const mainMapZoom = mainMap.getZoom();
      magnifierMap.setView(
        magnifierCenter,
        Math.min(mainMapZoom + magnifierSettings.zoom, 18)
      );
      console.log("Magnifier initialized.");
    }, 50); // A 50ms delay is usually sufficient.

    // Cleanup function: if the component unmounts, clear the timeout.
    return () => clearTimeout(timer);
  }
  // This effect's dependencies: It will re-run if the magnifier is toggled on/off,
  // or if the map instances themselves change.
}, [isMagnifierEnabled, magnifierMap, mapRef.current]);


// Effect 2: Handles UPDATES when the magnifier is dragged or zoom setting changes.
// This hook remains the same as it was already correct.
useEffect(() => {
  // Corrected: Use the 'magnifierMap' state variable instead
  if (!isMagnifierEnabled || !magnifierMap || !mapRef.current) {
    return;
  }

  // The 'magnifierMap' variable is already the map instance
  const mainMap = mapRef.current;

  console.log("--- Updating Magnifier View to:", magnifierCenter);
  
  const mainMapZoom = mainMap.getZoom();
  magnifierMap.setView(
    magnifierCenter,
    Math.min(mainMapZoom + magnifierSettings.zoom, 18)
  );

}, [magnifierCenter, magnifierSettings.zoom, isMagnifierEnabled, magnifierMap, mapRef.current]); // Also, add the new dependencies // Dependencies: run when center or zoom changes.
useEffect(() => {
  // If we have a map instance and the magnifier is enabled...
  if (magnifierMap && isMagnifierEnabled) {
    // ...wait a moment for the element to be visible in the DOM.
    const timer = setTimeout(() => {
      // Then, tell the map to re-calculate its size and render the tiles.
      magnifierMap.invalidateSize();
    }, 100); 
    return () => clearTimeout(timer);
  }
}, [magnifierMap, isMagnifierEnabled]); // It runs whenever the magnifier is toggled.

const totalRouteLength = activeRoute.length; 
useEffect(() => {
  return () => {
    // clear interval if component unmounts
    if (replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current);
    }
  };
}, []);
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

const startReplay = () => {
  // Only start if a route is active
  if (activeRoute.length > 0) {
      setIsReplaying(true);
      // Reset the index to 0
      replayIndexRef.current = 0; 
      // Set the initial position on the map
      setCurrentReplayPosition(activeRoute[0]);
      setCurrentReplayHaltIndex(-1);  // reset halts
      setIsPausedAtHalt(false);
      // Clean up any old timers
      // if (replayTimeoutId) {
      //     clearTimeout(replayTimeoutId);
      //     setReplayTimeoutId(null);
      // }
      if (haltPopupTimerRef.current) { clearTimeout(haltPopupTimerRef.current); haltPopupTimerRef.current = null; }
    if (haltPopupRef.current && mapRef.current) { try { mapRef.current.closePopup(haltPopupRef.current); } catch {}; haltPopupRef.current = null; }
  }
};
const pauseReplay = () => {
  setIsReplaying(false);
  if (replayIntervalRef.current) {
    clearInterval(replayIntervalRef.current);
    replayIntervalRef.current = null;
  }
};

const stopReplay = () => {
  setIsReplaying(false);
  if (replayIntervalRef.current) {
    clearInterval(replayIntervalRef.current);
    replayIntervalRef.current = null;
  }

  setCurrentReplayPosition(null);
  setReplayProgress(0);
  setIsPausedAtHalt(false);
setCurrentReplayHaltIndex(-1);
if (haltPopupTimerRef.current) { clearTimeout(haltPopupTimerRef.current); haltPopupTimerRef.current = null; }
if (haltPopupRef.current && mapRef.current) { try { mapRef.current.closePopup(haltPopupRef.current); } catch {}; haltPopupRef.current = null; }

};
const stopAndHideReplay = () => {
  // Stops the replay interval
  setIsReplaying(false);
  if (replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current);
      replayIntervalRef.current = null;
  }
  // Resets the replay state
  setCurrentReplayPosition(null);
  // setCurrentReplayIndex(0);
  setReplayProgress(0);
  setIsPausedAtHalt(false);
setCurrentReplayHaltIndex(-1);
if (haltPopupTimerRef.current) { clearTimeout(haltPopupTimerRef.current); haltPopupTimerRef.current = null; }
if (haltPopupRef.current && mapRef.current) { try { mapRef.current.closePopup(haltPopupRef.current); } catch {}; haltPopupRef.current = null; }


  // Hides the replay panel
  setShowReplayPanel(false);
};


  const resetReplay  = () => { setReplayProgress(0); setCurrentReplayPosition(null); };
  const resumeReplay = () => setIsReplaying(true);

  useEffect(() => {
    if (!isReplaying || selectedDeviationForReplay === null) return;
    const deviation = deviationRoutes.find((d) => d.id === selectedDeviationForReplay);
    if (!deviation) return;

    const interval = setInterval(() => {
      setReplayProgress((prev) => {
        const newProgress = prev + replaySpeed * 2;
        if (newProgress >= 100) { setIsReplaying(false); return 100; }

        const routeLength = deviation.path.length - 1;
        const currentIndex = Math.floor((newProgress / 100) * routeLength);
        const nextIndex = Math.min(currentIndex + 1, routeLength);
        const segmentProgress = (newProgress / 100) * routeLength - currentIndex;

        if (currentIndex < deviation.path.length && nextIndex < deviation.path.length) {
          const [lat1, lng1] = deviation.path[currentIndex];
          const [lat2, lng2] = deviation.path[nextIndex];
          const lat = lat1 + (lat2 - lat1) * segmentProgress;
          const lng = lng1 + (lng2 - lng1) * segmentProgress;
          setCurrentReplayPosition([lat, lng]);
        }
        return newProgress;
      });
    }, 100 / replaySpeed);

    return () => clearInterval(interval);
  }, [isReplaying, selectedDeviationForReplay, replaySpeed, deviationRoutes]);

  const handleMagnifierSettingChange = (key: keyof MagnifierSettings, value: number) =>
    setMagnifierSettings((prev) => ({ ...prev, [key]: value }));

  const navigateToVehicle = useCallback(() => {
    // Check if both the map instance and the current location exist
    if (mapRef.current && currentLocation) {
      if (!isNavigating) {
        setPreviousBounds(mapRef.current.getBounds());
        // ...activate it and fly to the location.
        setIsNavigating(true);
        mapRef.current.flyTo(currentLocation, 11, {
          animate: true,
          duration: 2,
          easeLinearity: 0.25,
        });
      } else {
        // ...otherwise, if it IS already active, just deactivate it.
        setIsNavigating(false);
        if (previousBounds) {
          mapRef.current.flyToBounds(previousBounds, {
            animate: true,
            duration: 1,
          });
      }
    }}
  }, [currentLocation,isNavigating, previousBounds]);
  const handleMagnifierPanelMouseDown = (e: React.MouseEvent) => {
    // This is the new function to prevent event propagation
    // It stops the mousedown event from bubbling up to the map container's onMouseDown handler.
    e.stopPropagation();
  };
  if (!isClient || !leafletLoaded) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.centerCol}>
          <div className={styles.spinnerSm}></div>
          <div className={styles.muted}>Loading real-time tracking map...</div>
        </div>
      </div>
    );
  }

 
  return (
    <div className={styles.mapWrapper}> 
    <div
      ref={mapContainerRef}
      className={styles.container}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDraggingMagnifier ? "grabbing" : isMagnifierEnabled ? "grab" : "default" }}
    >
  
    {
      //  activeRoute.length > 0 &&
        showReplayPanel &&
    <div className={styles.replayPanel}>
        <div className={styles.replayHead}>
            <div className={styles.replayHeadTitle}>Route Replay</div>
            <button  onClick={() => stopAndHideReplay() } className={styles.iconBtnPlain}>
                <X className={styles.iconSm} />
            </button>
        </div>
        <div className={styles.replayBody}>
            <div className={styles.replayRow}>
                {isReplaying ? (
                    <button onClick={pauseReplay} className={`${styles.btn} ${styles.btnRed}`}>
                        <Pause className={styles.iconXs} /> Pause
                    </button>
                ) : (
                    <button onClick={startReplay} className={`${styles.btn} ${styles.btnGreen}`}>
                        <Play className={styles.iconXs} /> Play
                    </button>
                )}
                <button onClick={stopReplay} className={`${styles.btn} ${styles.btnGray}`}>
                    <X className={styles.iconXs} /> Stop
                </button>
                <div className={styles.replaySpeedControl}>
         
         <select
             className={styles.speedSelect}
             value={replaySpeed}
             onChange={(e) => setReplaySpeed(Number(e.target.value))}
         >
             <option value={0.5}>0.5x</option>
             <option value={1}>1x</option>
             <option value={2}>1.25x</option>
             <option value={4}>1.5x</option>
             <option value={8}>2x</option>
         </select>
     </div>
            </div>
           
            {/* Show replay progress only when a route is being replayed */}
            {currentReplayPosition && (
                <>
                    <div className={styles.progressTrack}>
                        <div className={styles.progressBar} style={{ width: `${replayProgress}%` }} />
                    </div>
                    {/* <div className={styles.progressText}>
                        Progress: {Math.round(replayProgress)}%
                    </div> */}
                </>
            )}
        </div>
    </div>}
{/* )} */}
      <MapContainer
        
        ref={mapRef} 
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
        key={isFullscreen ? "fullscreen" : "normal"}
      >
        <MapController mapRef={mapRef} />
          <Pane name="shipmentMarkers" style={{ zIndex: 650 }} />
        {selectedMapStyle !== "none" && (
          <TileLayer
            url={getCurrentMapUrl()}
            attribution={
              selectedMapStyle === "satellite" || isSatelliteView
                ? '© Esri'
                : '© OpenStreetMap contributors'
            }
          />
        )}
        {activeMode === 'gps' && gpsPath.length > 0 && (
  <Polyline
    positions={gpsPath}
    pathOptions={{ color: "#1e40af", weight: 4, opacity: 0.8 }}
  />
)}
{activeMode === 'sim'  && simPath.length > 0 && (
  <Polyline
    positions={simPath}
    pathOptions={{ color: "#800080", weight: 3, opacity: 0.7, dashArray: "10, 10" }} // Purple dashed line for SIM
  />
)}
{activeMode ==='app' && appPath.length > 0 && (
  <Polyline
    positions={appPath}
    pathOptions={{ color: "#f97316", weight: 3, opacity: 0.7 }} // Orange line for APP
  />
)}

{showDayRun && dayRunPolylines.map((coords, i) => (
  <Polyline
    key={`dayrun-${i}`}
    positions={coords}
    pathOptions={{ color: polylineColors[i], weight: 3, opacity: 0.8, dashArray: "8, 8" }}
  >
    <Popup>
      <div>
        <h4 style={{ color: "blue" }}>Day {i + 1} Run Details</h4>
        {/*
          NOTE: Make sure dayRunDetails is an array that corresponds
          to dayRunPolylines.
        */}
        <p><strong>Start Time:</strong> {dayRunDetails[i].startTime}</p>
        <p><strong>Distance:</strong> {dayRunDetails[i].distance}</p>
        <p><strong>Time:</strong> {dayRunDetails[i].time}</p>
      </div>
    </Popup>
  </Polyline> 
))}


      {/* === Shipment: Pickups (P1, P2, ...) === */}
{shipmentPickups.map(({ pos, label, meta }, i) => (
  <Marker
    key={`ship-pickup-${i}`}
    pane="shipmentMarkers" 
    position={pos}
    icon={makeChipicon("#22c55e", label)} // green chip
  >

   
     <Popup>
      <div className={styles.popup}>
        <div className={`${styles.popupTitle} ${styles.titleGreen}`}>Pickup {label}</div>
        <hr className={styles.divider} ></hr>

        {meta?.location?.name && <div className={styles.popupBody}>{meta.location.name.trim()}</div>}
        {meta?.location?.locality && <div className={styles.popupBody}>{meta.location.locality}</div>}
        {meta?.location?.city && <div className={styles.popupBody}>City: {meta.location.city}</div>}
        {meta?.arrived_at && (
          <div className={styles.popupMeta}>Arrived at: {formatTimestamp(meta.finished_at)}</div>
        )}
       
      </div>
    </Popup>
  </Marker>
))}


{/* Always render the vehicle marker and its popup */}
{currentReplayPosition && customIcons.vehicle && (
    <Marker position={currentReplayPosition} icon={customIcons.vehicle} ref={vehicleMarkerRef}>
        {/*
          This Popup must ALWAYS be rendered as a child of the Marker.
          Its visibility will be controlled imperatively by the useEffect.
          We don't need any conditional logic here.
        */}
        <Popup 
        // onClose={() => setIsPausedAtHalt(false)}
        >
            {isPausedAtHalt && currentReplayHaltIndex > -1 && haltPoints[currentReplayHaltIndex] && (
                <div className={styles.popup}>
                    <div className={`${styles.popupTitle} ${styles.titleRed}`}>Halt Info</div>
                    <hr className={styles.divider}></hr>
                    <div className={styles.popupBody}>
                        Duration: <strong>{Math.floor(haltPoints[currentReplayHaltIndex].halt_duration / 60)} hour(s), {haltPoints[currentReplayHaltIndex].halt_duration % 60} minute(s)</strong>
                    </div>
                    <div className={styles.popupBody}>
                        Start: <strong>{new Date(haltPoints[currentReplayHaltIndex].start_time).toLocaleString()}</strong>
                    </div>
                    <div className={styles.popupBody}>
                        End: <strong>{new Date(haltPoints[currentReplayHaltIndex].end_time).toLocaleString()}</strong>
                    </div>
                </div>
            )}
        </Popup>
    </Marker>
)}


{/* === Shipment: Deliveries (D1, D2, ...) === */}
{shipmentDeliveries.map(({ pos, label, meta }, i) => (
  <Marker
    key={`ship-delivery-${i}`}
    pane="shipmentMarkers" 
    position={pos}
    icon={makeChipIcon("#f97316", label)} // red chip
  >
    <Popup>
      <div className={styles.popup}>
        <div className={`${styles.popupTitle} ${styles.titleDes}`}>Delivery {label}</div>
        <hr className={styles.divider} ></hr>

        {meta?.location?.name && <div className={styles.popupBody}>{meta.location.name.trim()}</div>}
        {meta?.location?.locality && <div className={styles.popupBody}>{meta.location.locality}</div>}
        {meta?.location?.city && <div className={styles.popupBody}>City: {meta.location.city}</div>}
        {meta?.finished_at && <div className={styles.popupBody}>Arrived at: {formatTimestamp(meta.finished_at)}</div>}
     
       
      </div>
    </Popup>
  </Marker>
))}

{/* === Delivery Polylines from API (if provided) === */}
{deliveryPolylines.map((coords, i) => (
  <Polyline
    key={`ship-delivery-poly-${i}`}
    positions={coords}
    pathOptions={{ color: "#ef4444", weight: 2, opacity: 0.9, dashArray: "2, 2", fill: true }}
  />
))}

       
{currentLocation &&  !isReplaying &&(
  <Marker 
    position={currentLocation} 
    icon={customIcons.vehicle} 
 
  />
)}

{/* FASTAG Toll Plazas (markers from API) */}
{showFastag && fastagPoints.map((p, idx) => {
  const lat = p.geo_point.coordinates[1];
  const lng = p.geo_point.coordinates[0];
  const icon = isTollPassed(p) ? customIcons.tollPassed : customIcons.tollPending; // ✅
  return (
    <Marker key={`toll-${idx}`} position={[lat, lng]} icon={icon}>
      <Popup>
        <div className={styles.popup}>
          <div className={`${styles.popupTitle} ${styles.titleOrange}`}>Toll Plaza Details</div>
          <hr className={styles.divider} ></hr>
          <div className={styles.popupBody}>{p.tollPlazaName}</div>
          <div className={styles.popupBody}>{p.address}</div>
          <div className={styles.popupMeta}>Time: {new Date(p.time_stamp).toLocaleString()}</div>
        </div>
      </Popup>
    </Marker>
  );
})}
{ shouldShowHaltMarkers  && haltPoints.map((halt, idx) => {
  const lat = halt.geo_point.coordinates[1];
  const lng = halt.geo_point.coordinates[0];
  const durationHours = Math.floor(halt.halt_duration / 60);
  const durationMins = halt.halt_duration % 60;

  return (
    <Marker
      key={`halt-${halt._id}-${idx}`}
      position={[lat, lng]}
      icon={customIcons?.deviation ?? undefined}
    >
      <Popup>
      
      <div className={styles.popup}>
<div className={`${styles.popupTitle} ${styles.titleRed}`}>Halt Info</div>
<hr className={styles.divider} ></hr>

<div className={styles.popupBody}>Duration:<strong>  {durationHours > 0 ? `${durationHours} hour(s), ` : ''} {Math.floor(durationMins)} minute(s)</strong></div>
<div className={styles.popupBody}>Start:<strong> {new Date(halt.start_time).toLocaleString()}</strong></div>
<div className={styles.popupBody}>End:<strong> {new Date(halt.end_time).toLocaleString()}</strong></div>
</div>
      </Popup>
    </Marker>
  );
})}


       

        
{customIcons.waypoint && mainRouteFromApi.slice(1, -1).map((position, index) => (
          <Marker key={`waypoint-${index}`} position={position} icon={customIcons.waypoint}>
            <Popup>
              <div className={styles.popup}>
                <div className={`${styles.popupTitle} ${styles.titleBlue}`}>Waypoint {index + 1}</div>
                <div className={styles.popupBody}>Transit checkpoint</div>
              </div>
           </Popup>
          </Marker>))}

       
        {currentReplayPosition && customIcons.vehicle && (
          <Marker position={currentReplayPosition} icon={customIcons.vehicle}>
            <Popup>
              <div className={styles.popup}>
                <div className={`${styles.popupTitle} ${styles.titleOrange}`}>Replay Position</div>
                <div className={styles.popupBody}>Progress: {Math.round(replayProgress)}%</div>
              </div>
            </Popup>
          </Marker>
        )}

        {showDeviations && customIcons.deviation && deviationRoutes.map((route) => (
          <div key={`deviation-markers-${route.id}`}>
            <Marker position={route.path[0]} icon={customIcons.deviation}>
              <Popup>
                <div className={styles.popup}>
                  <div className={`${styles.popupTitle} ${styles.titleRed} ${styles.popupTitleDivider}`}>Deviation Alert</div>

                  <div className={styles.metricRow}><span className={styles.metricKey}>Location:</span><span className={styles.metricVal}>{route.location}</span></div>
                  <div className={styles.metricRow}><span className={styles.metricKey}>Start Time:</span><span className={styles.metricVal}>{route.startTime}</span></div>
                  <div className={styles.metricRow}><span className={styles.metricKey}>End Time:</span><span className={styles.metricVal}>{route.endTime}</span></div>
                  <div className={styles.metricRow}><span className={styles.metricKey}>Distance:</span><span className={styles.metricVal}>{route.distance}</span></div>
                  <div className={styles.metricRow}><span className={styles.metricKey}>Reason:</span><span className={styles.metricVal}>{route.reason}</span></div>
                  <div className={`${styles.metricRow} ${styles.metricRowTop}`}>
                    <span className={styles.metricKey}>Total Duration:</span><span className={styles.metricVal}>{route.duration}</span>
                  </div>

                  <div className={styles.replayBlock}>
                    <div className={styles.replayTitle}>Replay Route</div>
                    <div className={styles.replayRow}>
                      {selectedDeviationForReplay === route.id && isReplaying ? (
                        <button onClick={() => setIsReplaying(false)} className={`${styles.btn} ${styles.btnRedSm}`}>
                          <Pause className={styles.iconXs} /> Pause
                        </button>
                      ) : selectedDeviationForReplay === route.id && replayProgress > 0 ? (
                        <button onClick={() => resumeReplay()} className={`${styles.btn} ${styles.btnBlueSm}`}>
                          <Play className={styles.iconXs} /> Resume
                        </button>
                      ) : (
                        <button onClick={() => startReplay(
                          // route.id
                          )} className={`${styles.btn} ${styles.btnGreenSm}`}>
                          <Play className={styles.iconXs} /> Play
                        </button>


                      )}
                      <button onClick={() => resetReplay()} className={`${styles.btn} ${styles.btnGraySm}`}>
                        <RotateCcw className={styles.iconXs} /> Reset
                      </button>
                    </div>

                    {selectedDeviationForReplay === route.id && (
                      <div className={styles.replayControls}>
                        <div className={styles.replaySpeed}>
                          <span className={styles.mutedXs}>Speed:</span>
                          <select
                            value={replaySpeed}
                            onChange={(e) => setReplaySpeed(Number(e.target.value))}
                            className={styles.selectXs}
                          >
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={4}>4x</option>
                          </select>
                        </div>
                        <div className={styles.progressTrack}>
                          <div className={styles.progressBar} style={{ width: `${replayProgress}%` }} />
                        </div>
                        <div className={styles.progressText}>Progress: {Math.round(replayProgress)}%</div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>

            <Marker position={route.path[route.path.length - 1]} icon={customIcons.deviation}>
              <Popup>
                <div className={styles.popup}>
                  <div className={`${styles.popupTitle} ${styles.titleOrange}`}>Deviation End</div>
                  <div className={styles.popupBody}>Returned to main route</div>
                  <div className={styles.popupMeta}>End: {route.endTime}</div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
        
       
      </MapContainer>
      {/* Enhanced Magnifier Tool with Custom Settings */}
      {isMagnifierEnabled && (
      
        <div
          // 1. The onMouseDown handler is placed directly on this outer div
          onMouseDown={handleMouseDown}
          style={{
            // --- CSS properties to make this div work ---
            position: 'absolute',
            pointerEvents: 'auto', // CRITICAL: Makes this div clickable
            zIndex: 1001,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            backgroundColor: '#fff',
            
            // --- Your existing dynamic styles ---
            left: magnifierPosition.x - magnifierSettings.size / 2,
            top: magnifierPosition.y - magnifierSettings.size / 2,
            width: magnifierSettings.size,
            height: magnifierSettings.size,
            border: `${magnifierSettings.borderWidth}px solid #3b82f6`,
          }}
        >
          {/* 2. The inner div is made invisible to the mouse */}
          <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              pointerEvents: 'none', // CRITICAL: Clicks pass through to the parent
            }}
          >
            <MapContainer
              // ref={setMagnifierMap}
            
              center={magnifierCenter}
              zoom={Math.min(zoom + magnifierSettings.zoom, 18)}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              attributionControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
              keyboard={false}
              // whenCreated={(mapInstance) => {
              //   setMagnifierMapRef(mapInstance)
              // }}
            >
             {/* <MapController mapRef={mapRef} /> */}
             <MagnifierMapController setMap={setMagnifierMap} />
              {selectedMapStyle !== "none" && (
                <TileLayer
                  url={getCurrentMapUrl()}
                  attribution=""
                  key={`magnifier-tiles-${selectedMapStyle}-${isSatelliteView ? "satellite" : "street"}-${magnifierCenter[0]}-${magnifierCenter[1]}`}
                />
              )}

              

              {/* Show deviation routes in magnifier */}
              {showDeviations &&
                deviationRoutes.map((route) => (
                  <Polyline
                    key={`magnifier-deviation-${route.id}`}
                    positions={route.path}
                    pathOptions={{
                      color: selectedDeviationForReplay === route.id ? "#f59e0b" : "#ef4444",
                      weight: selectedDeviationForReplay === route.id ? 6 : 4,
                      opacity: 1,
                      dashArray: selectedDeviationForReplay === route.id ? "none" : "10, 5",
                    }}
                  />
                ))}

              {/* Show all markers in magnifier with larger icons */}
            
              {customIcons.waypoint &&
                mainRoute
                  .slice(1, -1)
                  .map((position, index) => (
                    <Marker key={`magnifier-waypoint-${index}`} position={position} icon={customIcons.waypoint} />
                  ))}
              {customIcons.vehicle && <Marker position={vehiclePosition} icon={customIcons.vehicle} />}
              {currentReplayPosition && customIcons.vehicle && (
                <Marker position={currentReplayPosition} icon={customIcons.vehicle} />
              )}

              {/* Show deviation markers in magnifier */}
              {showDeviations &&
                customIcons.deviation &&
                deviationRoutes.map((route) => (
                  <div key={`magnifier-deviation-markers-${route.id}`}>
                    <Marker position={route.path[0]} icon={customIcons.deviation} />
                    <Marker position={route.path[route.path.length - 1]} icon={customIcons.deviation} />
                  </div>
                ))}

             
            </MapContainer>

            {/* Enhanced magnifier border and indicators */}
            <div style={{
                position: 'absolute',
                inset: '0px',
                border: '2px solid white',
                borderRadius: '9999px',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '6px',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              {Math.min(zoom + magnifierSettings.zoom, 18)}x
            </div>

            {/* Center crosshair */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
            }}>
              <div style={{
                  width: '24px',
                  height: '2px',
                  backgroundColor: '#3b82f6',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}></div>
              <div style={{
                  position: 'absolute',
                  top: '0px',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '2px',
                  height: '24px',
                  backgroundColor: '#3b82f6',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}></div>
            </div>

            {/* Coordinate display */}
            <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'monospace'
            }}>
              {magnifierCenter[0].toFixed(4)}, {magnifierCenter[1].toFixed(4)}
            </div>
          </div>
        </div>
      )}

      

      {/* Magnifier Settings Panel */}
      {showMagnifierSettings && (
        <div className={styles.magnifierPanel}
        style={{ 
          transform: `translate(${panelPosition.x}px, ${panelPosition.y}px)`,
          cursor: isDraggingPanel ? 'grabbing' : 'grab',
        }}>
          <div className={styles.magnifierPanelHeader}  onMouseDown={handlePanelMouseDown}>
            <h3>Magnifier Settings</h3>
            <button onClick={() => setShowMagnifierSettings(false)} className={styles.iconBtnPlain}>
              <X className={styles.iconSm} />
            </button>
          </div>

          <div className={styles.panelBody}>
            <div>
              <div className={styles.panelRowHead}>
                <label>Position X</label>
                <div className={styles.monoBadge}>{magnifierSettings.positionX.toFixed(3)}</div>
              </div>
              <input type="range" min="0" max="1" step="0.001" value={magnifierSettings.positionX}
                onChange={(e) => handleMagnifierSettingChange("positionX", parseFloat(e.target.value))}
                className={styles.slider} />
            </div>

            <div>
              <div className={styles.panelRowHead}>
                <label>Position Y</label>
                <div className={styles.monoBadge}>{magnifierSettings.positionY.toFixed(3)}</div>
              </div>
              <input type="range" min="0" max="1" step="0.001" value={magnifierSettings.positionY}
                onChange={(e) => handleMagnifierSettingChange("positionY", parseFloat(e.target.value))}
                className={styles.slider} />
            </div>

            <div>
              <div className={styles.panelRowHead}>
                <label>Size</label>
                <div className={styles.monoBadge}>{magnifierSettings.size.toFixed(1)}</div>
              </div>
              <input type="range" min="100" max="400" step="1" value={magnifierSettings.size}
                onChange={(e) => handleMagnifierSettingChange("size", parseFloat(e.target.value))}
                className={styles.slider} />
            </div>

            <div>
              <div className={styles.panelRowHead}>
                <label>Zoom</label>
                <div className={styles.monoBadge}>{magnifierSettings.zoom}</div>
              </div>
              <input type="range" min="1" max="8" step="1" value={magnifierSettings.zoom}
                onChange={(e) => handleMagnifierSettingChange("zoom", parseInt(e.target.value))}
                className={styles.slider} />
            </div>

            <div>
              <div className={styles.panelRowHead}>
                <label>Border Width</label>
                <div className={styles.monoBadge}>{magnifierSettings.borderWidth.toFixed(3)}</div>
              </div>
              <input type="range" min="0" max="10" step="0.1" value={magnifierSettings.borderWidth}
                onChange={(e) => handleMagnifierSettingChange("borderWidth", parseFloat(e.target.value))}
                className={styles.slider} />
            </div>

            <button
              onClick={() => setMagnifierSettings({ positionX: 0.5, positionY: 0.5, size: 200, zoom: 4, borderWidth: 4 })}
              className={`${styles.btn} ${styles.btnSlate}`}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Live Tracking Status */}
      {/* <div className={`${styles.statusOverlay} ${showMagnifierSettings ? styles.statusShift : ""} ${!isFullscreen ? styles.smallText : ""}`}> */}
      <div className={`${styles.statusOverlay} ${showMagnifierSettings ? styles.statusShift : ""} ${!isFullscreen ? styles.smallText : ""} ${showMagnifierSettings ? styles.hideOnSettings : ""}`}>
        <div className={styles.statusTitle}>Live Tracking Status</div>
        <div className={styles.statusList}>
          {/* <div className={styles.statusItem}><span className={`${styles.dot} ${styles.dotGreen}`}></span><span>GPS Signal: Strong</span></div> */}
          <div className={styles.statusItem}><span className={`${styles.dot} ${styles.dotBlue}`}></span><span>   {progressPercentage > 0 ? (
      <>Route Progress: {progressPercentage.toFixed(0)}%</>
    ) : (
      ""
    )}
     
   </span></div>
          <div className={styles.statusItem}><span className={`${styles.dot} ${styles.dotOrange}`}></span><span>ETA: {eta || "N/A"}</span></div>
          {isMagnifierEnabled && (
            <div className={`${styles.statusItem} ${styles.statusSplit}`}>
              <span className={`${styles.dot} ${styles.dotBluePulse}`}></span>
              <span>Magnifier: {magnifierCenter[0].toFixed(2)}, {magnifierCenter[1].toFixed(2)}</span>
            </div>
          )}
          {isReplaying && (
            <div className={`${styles.statusItem} ${styles.statusSplit}`}>
              <span className={`${styles.dot} ${styles.dotPurplePulse}`}></span>
              <span>Replaying Route</span>
            </div>
          )}
        </div>
      </div>

      {/* Top-right icon buttons */}
      <div className={styles.topRightControls}>
        <button
          onClick={() => setShowMapStyleSelector(!showMapStyleSelector)}
          className={`${styles.iconBtn} ${showMapStyleSelector ? styles.iconBtnActivePurple : ""}`}
          title="Map Style"
        >
          <svg className={styles.iconSm} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>

        <button
           onClick={navigateToVehicle} 
           className={`${styles.iconBtn} ${isNavigating ? styles.iconBtnActivePurple : ""}`}
           title="Go to Vehicle Location"
        >
          <svg className={styles.iconSm} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button
          onClick={() => setIsMagnifierEnabled(!isMagnifierEnabled)}
          className={`${styles.iconBtn} ${isMagnifierEnabled ? styles.iconBtnActivePurple : ""}`}
          title="Toggle Magnifier"
        >
          <svg className={styles.iconSm} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <button
          onClick={() => setShowMagnifierSettings(!showMagnifierSettings)}
          className={`${styles.iconBtn} ${showMagnifierSettings ? styles.iconBtnActivePurple : ""}`}
          title="Magnifier Settings"
        >
          <svg className={styles.iconSm} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Map Style Selector */}
      {showMapStyleSelector && (
        <div className={styles.mapStyleSelector}>
          <div className={styles.mapStyleHeader}>
            <h3>Map Style</h3>
            <button onClick={() => setShowMapStyleSelector(false)} className={styles.iconBtnPlain}>
              <X className={styles.iconSm} />
            </button>
          </div>
          <div className={styles.styleList}>
            {mapStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedMapStyle(style.id)}
                className={`${styles.styleItem} ${selectedMapStyle === style.id ? styles.styleItemActive : ""}`}
              >
                <div className={styles.styleSwatch} style={{ backgroundColor: style.color }} />
                <span className={styles.styleName}>{style.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      


      {/* Right side controls */}
      {/* <div className={`${styles.sideControls} ${isFullscreen ? styles.sideControlsFullscreen : ""}`}> */}
      <div className={`${styles.sideControls} ${isFullscreen ? styles.sideControlsFullscreen : ""} ${isMobile ? styles.sideControlsMobile : ""}`}>
      {/* {pathData?.app && pathData?.app?.length > 0 && ( */}
      {appPath.length > 0 &&(
        <button
        onClick={() =>{ setActiveMode(activeMode === 'app' ? null : 'app'); setShowReplayPanel(true);}}
        className={`${styles.sideBtn} ${
          activeMode === 'app' ? styles.sideBtnOrange : styles.sideBtnGray
        }`}
      >
          <div className={styles.sideDotBox}><svg className={styles.iconXs} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/></svg></div>
          <span>App</span>
        </button>)}
        {/* {pathData?.sim && pathData?.sim.length > 0 && ( */}
        {simPath.length > 0 &&(
         <button
         onClick={() => {setActiveMode(activeMode === 'sim' ? null : 'sim');
          setShowReplayPanel(true);}}
         className={`${styles.sideBtn} ${
           activeMode === 'sim' ? styles.sideBtnPurple : styles.sideBtnGray
         }`}
       > {/* Added a new color class for SIM */}
          <div className={styles.sideDotBox}><svg className={styles.iconXs} fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg></div>
          <span>SIM</span>
        </button>
  )
      }
    {fastagPath.length > 0 && (
        <button
        onClick={() => setShowFastag(v => !v)}
        className={`${styles.sideBtn} ${showFastag ? styles.sideBtnFastag : styles.sideBtnGray}`}
      >{/* Added a new color class for SIM */}
          <div className={styles.sideDotBox}>
            
          <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
  <path d="M14 7h5v11h-5V7zm-1-1.5l3-2h2.5l3 2H13zm2 3h3v3h-3V9z"/>
  <path d="M1 18h18v-1H1v1zm3-1v-8h1v8H4zm4 0v-8h1v8H8zm4 0v-8h1v8h-1z"/>
  <path d="M13.5 9.5l-11-4v-1l11 4v1z"/>
</svg></div>
          <span>FASTag</span>
        </button>
      )}
      
        {/* {pathData?.gps */}
       {gpsPath.length > 0
        //  && (Array.isArray(pathData.gps) ? pathData.gps.length > 0 : typeof pathData.gps === 'string')
          && (
       <button
       onClick={() =>{ setActiveMode(activeMode === 'gps' ? null : 'gps');setShowReplayPanel(true);}}
       className={`${styles.sideBtn} ${
         activeMode === 'gps' ? styles.sideBtnGreen : styles.sideBtnGray
       }`}
     >
          <div className={styles.sideDotBox}><svg className={styles.iconXs} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg></div>
          <span>GPS</span>
        </button>)}
        { haltPoints.length > 0 && (
  <button
    onClick={() => setShowHalt((prev) => !prev)}
    className={`${styles.sideBtn} ${showHalt ? styles.sideBtnRed : styles.sideBtnGray}`}
  >
    <div className={styles.sideDotBox}>
      <svg className={styles.iconXs} fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
      </svg>
    </div>
    <span>Halt</span>
  </button>
)}


        <button
          onClick={() => onToggleDeviations && onToggleDeviations()}
          className={`${styles.sideBtn} ${showDeviations ? styles.sideBtnOrange : styles.sideBtnGray}`}
        >
          {/* <div className={styles.sideDotBox}></div> */}
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="6" x2="6" y1="3" y2="15"></line>
  <circle cx="18" cy="6" r="3"></circle>
  <path d="M18 9a9 9 0 0 1-9 9"></path>
  <circle cx="6" cy="18" r="3"></circle>
</svg>
          <span>Deviation</span>
        </button>


        <button
         onClick={() => setShowDayRun((prev) => !prev)}
         className={`${styles.sideBtn} ${showDayRun ? styles.sideBtnPink : styles.sideBtnGray}`}

        >
          {/* <div className={styles.sideDotBox}></div> */}
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20z"></path>
  <path d="M12 6L12 12"></path>
  <path d="M12 12H18"></path>
  <path d="M5 12h-3"></path>
  <path d="M22 12h-2"></path>
  <path d="M12 2v2"></path>
  <path d="M12 20v2"></path>
  <path d="M4.22 4.22l1.42 1.42"></path>
  <path d="M18.36 18.36l1.42 1.42"></path>
</svg>
          <span>Day run</span>
        </button>
      </div>

      {/* Day Run Table */}
      {showDayRun && (
        <div className={`${styles.dayRunTable} ${showMagnifierSettings ? styles.statusShift : ""} ${!isFullscreen ? styles.smallText : ""}`}>
          <div className={styles.tableHeader}>
            <h3>Day Run Details</h3>
            <button onClick={() => setShowDayRun(false)} className={styles.iconBtnPlain}>
              <svg className={styles.iconSm} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className={styles.tableContent}>
            {dayRunDetails.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Start Time</th>
                    <th>Distance</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {dayRunDetails.map((run, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{run.startTime}</td>
                      <td>{run.distance}</td>
                      <td>{run.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                No day run data available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}


