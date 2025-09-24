"use client";

import { GoogleMap, Marker, useJsApiLoader,InfoWindow } from "@react-google-maps/api";
import { useMemo, useState, useEffect,useRef, useCallback  } from "react";
import { createPortal } from "react-dom";
import React from "react";
import GeofenceLayer from "./Geofencelayer";
import styles from "./Mapview.module.css";
import searchIcon from '../../../assets/search_icon_new.svg';
import filterIcon from '../../../assets/filter-icon.svg';
// const CONTAINER_STYLE = { width: "100%", height: "616px" };
import ontime from '../../../assets/on_time.svg';
import twotofour from '../../../assets/two_fours_hrs.svg';
import fourtoeight from '../../../assets/four_eight_hrs.svg';
import eighttotwelve from '../../../assets/eight_twelve_hrs.svg';
import twelvetosixteen from '../../../assets/twelve_sixteen_hrs.svg';
import sixteentotwenty from '../../../assets/sixteen_twenty_hrs.svg';
import beyondtwenty from '../../../assets/beyond_20.svg';
import Link from 'next/link';
import { httpsPost } from "@/utils/Communication";
import shipmentpic from "../../../assets/intransit_isometric.svg";
import person from "../../../assets/Group_15943.svg";
import vehicle from "../../../assets/Group 19481.svg";
import person2 from "../../../assets/Group_19498.svg";
import vehicle2 from "../../../assets/Group_19497.svg";
import eye from "../../../assets/icon-view.svg";
import cancel from "../../../assets/icon-cancel-red.svg";
import share from "../../../assets/share.svg";
import mail from "../../../assets/mailround.svg";
import upload from "../../../assets/attachFiles.svg";
import doc from "../../../assets/Doc-icon.svg";
import { httpsGet } from "@/utils/Communication";

import header from "../../UI/ModalHeader/ModalHeader";
import { Col } from "antd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import { DatePicker } from "antd";
import dayjs from "dayjs";

// TOWARDS PICKUP (cardinal)
import dirN from "../../../assets/parkingout.svg";
import dirE from "../../../assets/tare_weight.svg";
import dirS from "../../../assets/gross_weight.svg";
import dirW from "../../../assets/gate_in.svg";
import dirC from "../../../assets/ewaybill.svg"; // “center” / very close

// IN PLANT (stages)
import po_gi from "../../../assets/parkingout.svg";
import gi_tw from "../../../assets/gate_in.svg";
import tw_gw from "../../../assets/tare_weight.svg";
import gw_pg from "../../../assets/gross_weight.svg";
import pg_tc from "../../../assets/ewaybill.svg";
import tc_iv from "../../../assets/test_certificate.svg";
import iv_ew from "../../../assets/invoice.svg";
import ew_only from "../../../assets/post_goods.svg";

// AT DELIVERY (detention)
import det_0_12 from "../../../assets/green_at_delivery_icon.svg";
import det_12_24 from "../../../assets/light_red_at_delivery_icon.svg";
import det_24_plus from "../../../assets/red_at_delivery_icon.svg";


import catInPlant from "../../../assets/Group_19511.svg";
import catTowardsPickup from "../../../assets/Group_19524.svg";
import catInTransit from "../../../assets/Group_19527.svg";
import catAtDelivery from "../../../assets/Group_19522.svg";
import CancelModal from "../ShipmentManagement/CancelShipmentModal";
import ShareModal from "../Communication/ShareModal";
import MailModal  from "../Communication/MailModal";
import  AttachFilesModal from "../DocumentManagement/AttachFilesModal";
import CreateAdvancePaymentModal  from "../Financial/CreatePaymentAdvanceModal";
import { MarkerClusterer, SuperClusterAlgorithm, type Renderer } from "@googlemaps/markerclusterer";

// const clusterRenderer: Renderer = {
//   render: ({ count, position }) =>
//     new google.maps.Marker({
//       position,
//       // Blue bubble with the count in the middle
//       icon: {
//         url: `data:image/svg+xml;utf8,${encodeURIComponent(`
//           <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
//             <defs>
//               <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
//                 <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#000" flood-opacity=".25"/>
//               </filter>
//             </defs>
//             <circle cx="22" cy="22" r="16" fill="#3b82f6" filter="url(#s)"/>
//           </svg>
//         `)}`,
//         scaledSize: new google.maps.Size(44, 44),
//       },
//       label: {
//         text: String(count),
//         fontSize: "14px",
//         fontWeight: "700",
//         color: "#fff",
//       },
//       zIndex: google.maps.Marker.MAX_ZINDEX + count,
//     }),
// };
// Define the shape of a Location object
// interface ShipmentLocation {
//   _id: string;
//   city: string;
//   area: string;
//   pincode: string;
//   name: string;
// }
interface Location {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  state?: string;
  city?: string;
  pincode?: string;
  _id?: string;
}

// Define the shape of a Driver object
interface Driver {
  _id: string;
  mobile: string;
  name: string;
  vehicle_type: {
    _id: string;
    name: string;
    capacity: number;
  };
  driver_type: string;
  vehicle_no: string;
  geo_point: {
    type: string;
    coordinates: number[];
  };
  last_online_time: string;
}
interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  shipmentId: string; // The ID passed from Mapview.tsx
}
// Define the shape of a Carrier object
interface Carrier {
  _id: string;
  name: string;
  parent_name: string;
}

// Define the shape of a TripTracker object
interface TripTracker {
  last_location_address?: string;
}
interface ShipmentMaterial {
  _id?: string;
  name?: string;
}

// Define the main Shipment object
interface Shipment {
  _id: string;
  SIN: string;
  pickups: { location: Location }[];
  deliveries: { location: Location }[];
  carrier: Carrier;
  shipper: { _id: string; name: string };
  status: string;
  materials?: ShipmentMaterial[]; 
  // vehicle_type:string;
  vehicle_type: { // <-- Change this to an object
    _id: string;
    name: string;
    capacity: number;
  };
  latest_status: string;
  driver?: Driver; // Note: The driver property might be optional based on your data.
  assigned_driver?: Driver; // The driver data is also under this key
  vehicle_no: string;
  trip_tracker?: TripTracker;
  pickup_date:string;
  delivery_date:string;
  unique_code:string;
  // Add other properties you might need from your API response
}
interface ShipmentLocation {
  _id?: string;
  name?: string;
  city?: string;
}

interface ShipmentCarrier {
  _id?: string;
  name?: string;
  parent_name?: string;
}
export const INDIA_BBOX = { minLat: 5, maxLat: 38.9, minLng: 68, maxLng: 98 };

export function inIndia(lat: number, lng: number): boolean {
  return (
    lat >= INDIA_BBOX.minLat && lat <= INDIA_BBOX.maxLat &&
    lng >= INDIA_BBOX.minLng && lng <= INDIA_BBOX.maxLng
  );
}
//
// function drawGeoFences(data: any[], map: google.maps.Map) {
//   console.log("[GEOFENCE] draw start. items:", data?.length);
//   const overlays: Array<google.maps.MVCObject> = [];
//   const bounds = new google.maps.LatLngBounds();

//   if (!map || !Array.isArray(data)) return { overlays, bounds };

//   const STYLE = {
//     fillColor: "#2962FF",
//     fillOpacity: 0.01,
//     strokeColor: "#2962FF",
  
//     strokeOpacity: 0.4,
//     strokeWeight: 1,
//     clickable: false,
//   } as const;

//   const LL = (lon: any, lat: any) => new google.maps.LatLng(Number(lat), Number(lon));
 
//   // function ringToPath(ring: number[][]): google.maps.LatLngLiteral[] {
//   //   const path: google.maps.LatLngLiteral[] = [];
//   //   for (const pt of ring || []) {
//   //     if (!Array.isArray(pt) || pt.length < 2) continue;
//   //     let lng = Number(pt[0]), lat = Number(pt[1]);
  
//   //     // auto-swap if someone sent [lat,lng]
//   //     if ((Math.abs(lat) > 60 && Math.abs(lng) <= 60) || lng < -180 || lng > 180) {
//   //       [lat, lng] = [lng, lat];
//   //     }
//   //     if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;
//   //     if (!inIndia(lat, lng)) continue;  // ignore out-of-India
//   //     path.push({ lat, lng });
//   //   }
//   //   return path;
//   // }
//   // const addPolygon = (rings: number[][][]) => {
//   //   // rings = [outerRing, hole1, hole2, ...]; each ring = [[lon,lat], ...]
//   //   const paths = (rings || []).map((ring) =>
//   //     (ring || [])
//   //       .filter((pt) => Array.isArray(pt) && pt.length >= 2)
//   //       .map(([lon, lat]) => LL(lon, lat))
//   //   );
//   //   if (!paths.length || !paths[0].length) return;

//   //   const polygon = new google.maps.Polygon({ paths, map, ...STYLE });
//   //   // extend bounds by outer ring vertices
//   //   paths[0].forEach((p) => bounds.extend(p));
//   //   overlays.push(polygon);
//   // };

//   // const addMultiPolygon = (polys: number[][][][]) => {
//   //   (polys || []).forEach((rings) => addPolygon(rings));
//   // };

//   // const addCircle = (v: any) => {
//   //   let lon: number, lat: number, radius: number;
//   //   if (Array.isArray(v)) {
//   //     [lon, lat, radius] = v;
//   //   } else if (Array.isArray(v?.center) && v?.radius != null) {
//   //     [lon, lat] = v.center;
//   //     radius = Number(v.radius);
//   //   } else {
//   //     return;
//   //   }
//   //   const center = LL(lon, lat);
//   //   const circle = new google.maps.Circle({ center, radius, map, ...STYLE });
//   //   const cb = circle.getBounds?.();
//   //   if (cb) bounds.union(cb); else bounds.extend(center);
//   //   overlays.push(circle);
//   // };
  

//   try {
//     (data || []).forEach((it) => {
//       const gf = it?.geo_fence;
//       if (!gf || !gf.type || !gf.coordinates) return;
//       if (gf.type === "Polygon") addPolygon(gf.coordinates);
//       else if (gf.type === "MultiPolygon") addMultiPolygon(gf.coordinates);
//       else if (gf.type === "Circle") addCircle(gf.coordinates);
//       // unsupported -> skip silently
//     });
//   } catch {
//     // bad geometry -> skip silently
//   }

//   return { overlays, bounds };
// }
// const fences = [
//   {
//     type: "Polygon" as const,
//     coordinates: [
//       [ [77.58,12.98], [77.62,12.98], [77.62,13.01], [77.58,13.01], [77.58,12.98] ] // [lng,lat]
//     ]
//   },
//   {
//     type: "MultiPolygon" as const,
//     coordinates: [
//       [ // polygon A
//         [ [72.82,18.94], [72.85,18.94], [72.85,18.97], [72.82,18.97], [72.82,18.94] ] // outer
//       ],
//       [ // polygon B
//         [ [72.79,18.93], [72.81,18.93], [72.81,18.95], [72.79,18.95], [72.79,18.93] ]
//       ]
//     ]
//   }
// ];
// const toLatLng = (item: any) => {
//   const lat =
//     typeof item?.latitude === "number"
//       ? item.latitude
//       : item?.geo_point?.coordinates?.[1]; // GeoJSON [lng, lat] -> [1]
//   const lng =
//     typeof item?.longitude === "number"
//       ? item.longitude
//       : item?.geo_point?.coordinates?.[0]; // GeoJSON [lng, lat] -> [0]
//   return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
// };
const toLatLng = (item: any) => {
  if (!item) return null;

  const num = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  // 1) lat/lng (string or number)
  let lat = num(item?.lat);
  let lng = num(item?.lng);

  // 2) latitude/longitude (fallback)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    lat = num(item?.latitude);
    lng = num(item?.longitude);
  }

  // 3) GeoJSON [lng, lat]
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    const coords = item?.geo_point?.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      lng = num(coords[0]);
      lat = num(coords[1]);
    }
  }

  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
};

export default function Mapview() {
  // IMPORTANT: don’t hardcode the key in code you commit
  const apiKey = "AIzaSyDr0k02Q0b6SF2xum80HvY7I4kAWUCOR2U";
  const formRef = useRef<HTMLFormElement>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [shipmentGroup, setShipmentGroup] = useState(""); 
  const [SelectMaterials, setSelectedMaterials] = useState<string>("");
  // const [materialsList, setMaterialsList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [geoFences, setGeoFences] = useState<any[]>([]);
  // state
const [infoFromMapClick, setInfoFromMapClick] = useState(false);
type LegendItem = { key: LegendKey; label: string; icon: any };

const STATUS_ITEMS: LegendItem[] = [
  { key: "on",    label: "On Time",         icon: ontime },
  { key: "2-4",   label: "2 - 4 Hours",     icon: twotofour },
  { key: "4-8",   label: "4 - 8 Hours",     icon: fourtoeight },
  { key: "8-12",  label: "8 - 12 Hours",    icon: eighttotwelve },
  { key: "12-16", label: "12 - 16 Hours",   icon: twelvetosixteen },
  { key: "16-20", label: "16 - 20 Hours",   icon: sixteentotwenty },
  { key: "20+",   label: "Beyond 20 Hours", icon: beyondtwenty },
] satisfies Array<{ key: LegendKey; label: string; icon: any }>;

//   const geofenceOverlaysRef = useRef<
//   Array<google.maps.Polygon | google.maps.Circle | google.maps.Polyline>
// >([]);
// Mapview.tsx (around line 282)
const geofenceOverlaysRef = useRef<
  // **Change the type here to include Marker**
  Array<google.maps.Polygon | google.maps.Circle | google.maps.Polyline | google.maps.Marker>
>([]);
// map instance

const [locationsList, setLocationsList] = useState<Array<{ id: string; label: string }>>([]);
const [selectedStatus, setSelectedStatus] = useState('in_transit');

// Selected values (store ids)
const [selectedLocation, setSelectedLocation] = useState<string>(""); // delivery location id
const [selectedCarrier, setSelectedCarrier] = useState<string>("");   // carrier id
// Distinct lists
const [vehicleSearch, setVehicleSearch] = useState<string>("");
const vehicleDebounceRef = useRef<number | null>(null);

const [pickupLocationsList, setPickupLocationsList] =
  useState<Array<{ id: string; label: string }>>([]);
const [deliveryLocationsList, setDeliveryLocationsList] =
  useState<Array<{ id: string; label: string }>>([]);
const [carriersList, setCarriersList] =
  useState<Array<{ id: string; label: string }>>([]);
  const [appliedSearchFilters, setAppliedSearchFilters] = useState<any>(null);
  const [shipmentsData, setShipmentsData] =useState<Shipment[]>([]);
// Selected values
const [selectedPickupLocation, setSelectedPickupLocation] = useState<string>("");
const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState<string>("");
// In-Plant event stage (short codes)
const [inPlantStage, setInPlantStage] = useState<string>("");
// Draft value for vehicle number (used only inside the modal)
// near your other useState calls
const [unitLocations, setUnitLocations] = useState<any[]>([]);
// Add this new useEffect near the bottom of your existing imports/hooks:
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [totalShipments, setTotalShipments] = useState(0);
const [trackingCount, setTrackingCount] = useState(0);
const [nonTrackingCount, setNonTrackingCount] = useState(0);
const [shipmentIdSearch, setShipmentIdSearch] = useState<string>("");
const [dateFrom, setDateFrom] = useState<string>(""); // yyyy-mm-dd
const [dateTo, setDateTo] = useState<string>("");
const [isFilterOpen, setIsFilterOpen] = useState(false);
const center = useMemo(() => ({ lat: 40.7812, lng: -73.9665 }), []);
const [materialsList, setMaterialsList] =
  useState<Array<{ key: string; label: string }>>([]);
const [materialBuckets, setMaterialBuckets] =
  useState<Record<string, { label: string; ids: string[] }>>({});
  type MaterialOption = { key: string; label: string };
  type MaterialBuckets = Record<string, { label: string; ids: string[] }>;
  const [formDrafts, setFormDrafts] = useState({
    materials: "",
    pickupLocation: "",
    deliveryLocation: "",
    carrier: "",
    status: "",
    inPlantStage: "",
    shipmentId: "",
    dateFrom: "",
    dateTo: "",
    vehicle: ""
  });
  // India-ish bounding box
// const INDIA_BBOX = { minLat: 5, maxLat: 38.9, minLng: 68, maxLng: 98 };
// const inIndia = (lat: number, lng: number) =>
//   lat >= INDIA_BBOX.minLat && lat <= INDIA_BBOX.maxLat &&
//   lng >= INDIA_BBOX.minLng && lng <= INDIA_BBOX.maxLng;
const INDIA_BBOX = { minLat: 5, maxLat: 38.9, minLng: 68, maxLng: 98 };
const handleAttachDone: () => void = () => {
  // optional: refetch, toast, etc.
  closeModal();
};

const updateFormDraft = (field: keyof typeof formDrafts, value: string) => {
  setFormDrafts(prev => ({ ...prev, [field]: value }));
};
  

const onFormMaterialChange = (value: string) => updateFormDraft("materials", value);
const onFormPickupChange = (value: string) => updateFormDraft("pickupLocation", value);
const onFormDeliveryChange = (value: string) => updateFormDraft("deliveryLocation", value);
const onFormCarrierChange = (value: string) => updateFormDraft("carrier", value);
const onFormStatusChange = (value: string) => updateFormDraft("status", value);
const onFormInPlantChange = (value: string) => updateFormDraft("inPlantStage", value);
const onFormShipmentIdChange = (value: string) => updateFormDraft("shipmentId", value);
const onFormVehicleChange = (value: string) => updateFormDraft("vehicle", value);
const onFormDateFromChange = (value: string) => updateFormDraft("dateFrom", value);
const onFormDateToChange = (value: string) => updateFormDraft("dateTo", value);


function inIndia(lat: number, lng: number): boolean {
  return (
    lat >= INDIA_BBOX.minLat && lat <= INDIA_BBOX.maxLat &&
    lng >= INDIA_BBOX.minLng && lng <= INDIA_BBOX.maxLng
  );
}
// Wrap your existing toLatLng so callers can “only-India”
const toLatLngIndia = (item: any) => {
  const p = toLatLng(item);
  return p && inIndia(p.lat, p.lng) ? p : null;
};

  // path data returned by v1/shipment/path
type PathData = {
  sim: any[];
  app: any[];
  gps: any[];
  haltData: any[];
  meta?: { is_fastag_enabled?: boolean; unique_code?: string };
};

const [pathData, setPathData] = useState<PathData | null>(null);
const [pathVisible, setPathVisible] = useState({ gps: false, app: false, sim: false });
// const pathOverlaysRef = useRef<Array<google.maps.MVCObject>>([]);
const pathOverlaysRef = useRef<
  Array<
    google.maps.Polyline | google.maps.Marker | google.maps.Polygon | google.maps.Circle
  >
>([]);
const [activeHalt, setActiveHalt] = useState<any | null>(null);
const [haltInfoPos, setHaltInfoPos] = useState<google.maps.LatLngLiteral | null>(null);
// P/D markers + popup
const pdOverlaysRef = useRef<Array<google.maps.Marker>>([]);
const [pdInfo, setPdInfo] = useState<{
  pos: google.maps.LatLngLiteral;
  kind: "P" | "D";
  seq: number;
  name?: string;
  address?: string;
  shipmentSIN?: string;
} | null>(null);

function clearPDMarkers() {
  pdOverlaysRef.current.forEach(m => m.setMap(null));
  pdOverlaysRef.current = [];
}

// function locToLatLng(loc?: { lat?: any; lng?: any }) {
//   const lat = Number(loc?.lat), lng = Number(loc?.lng);
//   return isValidLatLng(lat, lng) ? { lat, lng } : null;
// }
// replace your current helper
function locToLatLng(loc?: any) {
  if (!loc) return null;
  // try all the shapes we see in your data
  const lat = Number(
    loc?.lat ??
    loc?.latitude ??
    loc?.geo_point?.coordinates?.[1]
  );
  const lng = Number(
    loc?.lng ??
    loc?.longitude ??
    loc?.geo_point?.coordinates?.[0]
  );
  return isValidLatLng(lat, lng) ? { lat, lng } : null;
}

function pdMarkerIcon(kind: "P"|"D"): google.maps.Symbol {
  const color = kind === "P" ? "#16a34a" /* green */ : "#f97316" /* orange */;
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 12,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
  };
}

function addPDMarker(
  map: google.maps.Map,
  pos: google.maps.LatLngLiteral,
  kind: "P"|"D",
  seq: number,
  meta?: { name?: string; address?: string; sin?: string },
) {
  console.debug(`[PD] add ${kind}${seq}`, { pos, meta });   
  const marker = new google.maps.Marker({
    position: pos,
    map,
    icon: pdMarkerIcon(kind),
    label: {
      text: (kind + seq) as string,         // "P1"/"P2"/"D1"/"D2"
      color: "#ffffff",
      fontWeight: "700",
      fontSize: "25px",
    },
    zIndex: 80,
  });
  marker.addListener("click", () => {
    console.debug(`[PD] click ${kind}${seq}`, meta); 
    setPdInfo({ pos, kind, seq, name: meta?.name, address: meta?.address, shipmentSIN: meta?.sin });
  });
  pdOverlaysRef.current.push(marker);
  console.debug(`[PD] overlays now`, pdOverlaysRef.current.length); // 👈
  return marker;
}

// function drawPickupDeliveryMarkers() {
//   if (!mapRef) return;
//   clearPDMarkers();

//   // draw for *visible* shipments only
//   for (const s of visibleShipments || []) {
//     // Pickups: P1, P2...
//     (s.pickups || []).forEach((p, i) => {
//       // const pos = locToLatLng(p?.location);
//       const pos = toLatLng(p?.location);
   
//       if (!pos) return;
//       addPDMarker(mapRef!, pos, "P", i + 1, {
//         name: p?.location?.name,
//         address: p?.location?.address,
//         sin: s.SIN,
//       });
//     });

//     // Deliveries: D1, D2...
//     (s.deliveries || []).forEach((d, i) => {
//       // const pos = locToLatLng(d?.location);
//       const pos = toLatLng(d?.location);
//       if (!pos) return;
//       addPDMarker(mapRef!, pos, "D", i + 1, {
//         name: d?.location?.name,
//         address: d?.location?.address,
//         sin: s.SIN,
//       });
//     });
//   }
// }
// function drawPDForShipment(s: Shipment) {
//   if (!mapRef || !s) return;
//   console.group(`[PD] draw for SIN ${s.SIN}`);                   // 👈
//   console.log("[PD] pickups raw:", s.pickups);
//   console.log("[PD] deliveries raw:", s.deliveries);
// console.log("pickup is working");
//   // clear old P/D
//   clearPDMarkers();

//   const b = new google.maps.LatLngBounds();
//   let added = 0;

//   // P1, P2, ...
//   (s.pickups || []).forEach((p, i) => {
//     const pos = toLatLng(p?.location);
//     console.debug(`[PD] P${i+1} loc →`, p?.location, "→", pos);  
//     if (!pos) return;
//     addPDMarker(mapRef!, pos, "P", i + 1, {
//       name: p?.location?.name,
//       address: p?.location?.address,
//       sin: s.SIN,
//     });
//     b.extend(pos);
//     added++;
//   });

//   // D1, D2, ...
//   (s.deliveries || []).forEach((d, i) => {
//     const pos = toLatLng(d?.location);
//     console.debug(`[PD] D${i+1} loc →`, d?.location, "→", pos);  // 👈
//     if (!pos) return;
//     addPDMarker(mapRef!, pos, "D", i + 1, {
//       name: d?.location?.name,
//       address: d?.location?.address,
//       sin: s.SIN,
//     });
//     b.extend(pos);
//     added++;
//   });

//   if (added && !b.isEmpty()) mapRef.fitBounds(b, 64);
// }

// function drawPDForShipment(s: Shipment) {
//   // console.groupCollapsed("[PD] draw", s?.SIN ?? s?._id ?? "unknown");
//   console.group("[PD] draw", s?.SIN ?? s?._id ?? "unknown");
//   // 1) hard guards
//   if (!s) { console.warn("[PD] no shipment"); console.groupEnd(); return; }
//   if (!(window as any).google || !google.maps) {
//     console.warn("[PD] google maps not ready");
//     console.groupEnd();
//     return;
//   }
//   // const map = mapRef?.current as google.maps.Map | null;
//   const map = mapRef as google.maps.Map | null;
//   if (!map) {
//     console.warn("[PD] mapRef.current is null");
//     console.groupEnd();
//     return;
//   }

//   // 2) map container sanity (height/overlay)
//   const div = map.getDiv() as HTMLElement;
//   const rect = div.getBoundingClientRect();
//   console.log("[PD] map size", { w: rect.width, h: rect.height });

//   // 3) unwrap raw arrays to location objects
//   const pickupDoc = s?.pickups?.[0] ?? null;
//   const deliveryDoc = s?.deliveries?.[s?.deliveries?.length - 1] ?? null;
//   const pRaw = pickupDoc?.location ?? null;
//   const dRaw = deliveryDoc?.location ?? null;

//   console.log("[PD] pickups raw:", s?.pickups);
//   console.log("[PD] deliveries raw:", s?.deliveries);
//   console.log("[PD] pRaw:", pRaw, "dRaw:", dRaw);

//   // 4) tolerant parser (lat/lng | latitude/longitude | geo_point.coordinates | coordinates)
//   const toLatLng = (v: any): google.maps.LatLngLiteral | null => {
//     if (!v) return null;
//     const n = (x: any) => { const y = Number(x); return Number.isFinite(y) ? y : NaN; };

//     let lat = n(v?.lat), lng = n(v?.lng);
//     if (!Number.isFinite(lat) || !Number.isFinite(lng)) { lat = n(v?.latitude); lng = n(v?.longitude); }
//     if (!Number.isFinite(lat) || !Number.isFinite(lng)) { // GeoJSON at root
//       const c = v?.coordinates;
//       if (Array.isArray(c) && c.length >= 2) { lng = n(c[0]); lat = n(c[1]); }
//     }
//     if (!Number.isFinite(lat) || !Number.isFinite(lng)) { // nested geo_point
//       const gc = v?.geo_point?.coordinates;
//       if (Array.isArray(gc) && gc.length >= 2) { lng = n(gc[0]); lat = n(gc[1]); }
//     }
//     if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

//     const inRange = (a:number,b:number)=> a>=-90&&a<=90&&b>=-180&&b<=180;
//     if (!inRange(lat,lng) && inRange(lng,lat)) {
//       console.warn("[PD] lat/lng looked swapped → fixing");
//       return { lat: lng, lng: lat };
//     }
//     return inRange(lat,lng) ? { lat, lng } : null;
//   };

//   const p = toLatLng(pRaw);
//   const d = toLatLng(dRaw);
//   console.table({
//     pickup_parsed: p || "❌",
//     delivery_parsed: d || "❌",
//   });

//   // 5) clear old + add markers
//   clearPDMarkers();

//   let added = 0;
//   const b = new google.maps.LatLngBounds();

//   if (p) {
//     addPDMarker(map, p, "P", 1, { sin: s?.SIN });
//     b.extend(p);
//     added++;
//   } else {
//     console.warn("[PD] pickup invalid/missing lat/lng");
//   }

//   if (d) {
//     addPDMarker(map, d, "D", 1, { sin: s?.SIN });
//     b.extend(d);
//     added++;
//   } else {
//     console.warn("[PD] delivery invalid/missing lat/lng");
//   }

//   console.log("[PD] markers added:", added);

//   if (added > 0 && !b.isEmpty()) {
//     map.fitBounds(b, 60);
//   } else {
//     // drop a test marker to prove overlays/map are rendering
//     const ctr = map.getCenter();
//     console.warn("[PD] no PD markers created → TEST marker @ map center");
//     const test = new google.maps.Marker({ map, position: ctr, label: "TEST" });
//     setTimeout(() => test.setMap(null), 1500);
//   }

//   console.groupEnd();
// }

// helper right above drawPDForShipment
// const resolveLoc = (v: any) =>
//   toLatLng(v) ||
//   toLatLng(v?.location) ||
//   toLatLng(v?.loc) ||
//   toLatLng(v?.geo) ||
//   null;

// --- Geocoding fallback for P/D ---
const geocoderRef = useRef<google.maps.Geocoder | null>(null);
const geocodeCacheRef = useRef<Map<string, google.maps.LatLngLiteral>>(new Map());

useEffect(() => {
  if ((window as any).google && !geocoderRef.current) {
    geocoderRef.current = new google.maps.Geocoder();
  }
}, []);

const toLatLng = (v: any): google.maps.LatLngLiteral | null => {
  if (!v) return null;
  const n = (x: any) => { const y = Number(x); return Number.isFinite(y) ? y : NaN; };
  let lat = n(v?.lat), lng = n(v?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) { lat = n(v?.latitude); lng = n(v?.longitude); }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) { const c = v?.coordinates; if (Array.isArray(c) && c.length >= 2) { lng = n(c[0]); lat = n(c[1]); } }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) { const gc = v?.geo_point?.coordinates; if (Array.isArray(gc) && gc.length >= 2) { lng = n(gc[0]); lat = n(gc[1]); } }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const inRange = (a:number,b:number)=> a>=-90&&a<=90&&b>=-180&&b<=180;
  if (!inRange(lat,lng) && inRange(lng,lat)) return { lat: lng, lng: lat };
  return inRange(lat,lng) ? { lat, lng } : null;
};

const resolveLoc = (v:any) =>
  toLatLng(v) || toLatLng(v?.location) || toLatLng(v?.loc) || toLatLng(v?.geo) || null;

const buildAddress = (loc:any) =>
  [loc?.name, loc?.area, loc?.city, loc?.pincode].filter(Boolean).join(", ");

const locKey = (loc:any) => loc?._id || buildAddress(loc) || JSON.stringify(loc || {});

async function ensureLatLngFromLocation(loc:any): Promise<google.maps.LatLngLiteral | null> {
  if (!loc) return null;

  // 1) try direct fields first
  const direct = resolveLoc(loc);
  if (direct) return direct;

  // 2) cache
  const key = locKey(loc);
  const cached = geocodeCacheRef.current.get(key);
  if (cached) return cached;

  // 3) geocode from address
  const address = buildAddress(loc);
  if (!address || !geocoderRef.current) return null;

  try {
    const { results } = await geocoderRef.current.geocode({ address, region: "in" });
    const ll = results?.[0]?.geometry?.location?.toJSON?.();
    if (ll && Number.isFinite(ll.lat) && Number.isFinite(ll.lng)) {
      geocodeCacheRef.current.set(key, ll);
      console.debug("[PD] geocoded:", address, "→", ll);
      return ll;
    }
  } catch (e) {
    console.warn("[PD] geocode failed:", address, e);
  }
  return null;
}

// make the caller handle the promise (or just ignore; markers will pop in)
async function drawPDForShipment(s: Shipment) {
  console.groupCollapsed("[PD] draw", s?.SIN ?? s?._id ?? "unknown");

  if (!(window as any).google || !google.maps) { console.warn("[PD] maps not ready"); console.groupEnd(); return; }
  // const map = mapRef?.current as google.maps.Map | null;
  const map = mapRef as unknown as google.maps.Map | null;
  if (!map) { console.warn("[PD] mapRef.current is null"); console.groupEnd(); return; }

  const pickupDoc = s?.pickups?.[0] ?? null;
  const deliveryDoc = s?.deliveries?.[s?.deliveries?.length - 1] ?? null;
  const pRaw = pickupDoc?.location ?? null;
  const dRaw = deliveryDoc?.location ?? null;

  // try direct; then geocode if needed
  const p = (resolveLoc(pRaw)) || (await ensureLatLngFromLocation(pRaw));
  const d = (resolveLoc(dRaw)) || (await ensureLatLngFromLocation(dRaw));

  console.table({ pickup_parsed: p || "❌", delivery_parsed: d || "❌" });

  clearPDMarkers();
  let added = 0; const b = new google.maps.LatLngBounds();

  if (p) { addPDMarker(map, p, "P", 1, { sin: s?.SIN }); b.extend(p); added++; }
  else   { console.warn("[PD] pickup invalid/missing lat/lng"); }

  if (d) { addPDMarker(map, d, "D", 1, { sin: s?.SIN }); b.extend(d); added++; }
  else   { console.warn("[PD] delivery invalid/missing lat/lng"); }

  if (added && !b.isEmpty()) map.fitBounds(b, 60);
  else {
    const ctr = map.getCenter();
    const test = new google.maps.Marker({ map, position: ctr, label: "TEST" });
    setTimeout(() => test.setMap(null), 1500);
  }
  console.groupEnd();
}


  /** Angular parity: pick the *last* arrived delivery’s arrived_at. */
function arrivalIsoFromDeliveries(s: Shipment): string | undefined {
  // deliveries: [{ arrived: boolean, arrived_at: ISO, ... }]
  const lastArrived = Array.isArray(s?.deliveries)
    ? (s.deliveries as any[]).filter(d => d?.arrived === true).slice(-1)[0]
    : undefined;

  const arrivedAt =
    lastArrived?.arrived_at ||
    lastArrived?.arrivedAt ||
    lastArrived?.arrival_time;

  // strict fallback chain (optional but practical)
  return (
    arrivedAt ||
    (s as any)?.delivery_gate_in ||
    (s as any)?.at_delivery_time ||
    s.delivery_date ||
    undefined
  );
}
function clearPathOverlays() {
  pathOverlaysRef.current.forEach(o => o.setMap(null));
  pathOverlaysRef.current = [];
}

// function addOverlay(o: google.maps.MVCObject) {
//   pathOverlaysRef.current.push(o);
//   return o;
// }
function addOverlay(
  o: google.maps.Polyline | google.maps.Marker | google.maps.Polygon | google.maps.Circle
) {
  pathOverlaysRef.current.push(o);
  return o;
}

function polyline(map: google.maps.Map, pts: google.maps.LatLngLiteral[], color: string, z = 20) {
  const pl = new google.maps.Polyline({
    path: pts, map, strokeColor: color, strokeOpacity: 0.9, strokeWeight: 3, zIndex: z,
  });
  return addOverlay(pl) as google.maps.Polyline;
}

function addMarker(map: google.maps.Map, pos: google.maps.LatLngLiteral, label?: string, color = "red", z = 50) {
  const mk = new google.maps.Marker({
    position: pos, map, zIndex: z,
    label: label ? { text: label, color: "#fff" } : undefined,
    icon: label ? undefined : {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 1.5
    }
  });
  return addOverlay(mk) as google.maps.Marker;
}

  function drawPathsAndHalts(vis = pathVisible) {
    if (!mapRef) return;
    clearPathOverlays();
  
    const b = new google.maps.LatLngBounds();
    const addPts = (pts: google.maps.LatLngLiteral[]) => pts.forEach(p => b.extend(p));
  
    const drawLine = (items: any[], color: string, z: number) => {
      const pts = (items || []).map(toLatLng).filter(Boolean) as google.maps.LatLngLiteral[];
      if (pts.length >= 2) {
        polyline(mapRef!, pts, color, z);
        addPts(pts);
      } else if (pts.length === 1) {
        addMarker(mapRef!, pts[0], undefined, color, z + 1);
        addPts(pts);
      }
    };
  
    if (pathData) {
      if (vis.gps) drawLine(pathData.gps, "#2563EB", 22);  // blue
      if (vis.app) drawLine(pathData.app, "#16A34A", 21);  // green
      if (vis.sim) drawLine(pathData.sim, "#7C3AED", 20);  // purple
  
      // halts as red pins
      (pathData.haltData || []).forEach((h: any) => {
        const p = toLatLng(h);
        if (!p) return;
        const m = addMarker(mapRef!, p, undefined, "red", 60);
        m.addListener("click", () => {
          setActiveHalt(h);
          setHaltInfoPos(p);
        });
        b.extend(p);
      });
    }
  
    // pickup & delivery markers for the selected shipment
    const p = selectedShipment?.pickups?.[0]?.location;
    const d = selectedShipment?.deliveries?.slice(-1)?.[0]?.location;
  
    // const pli = p?.lat && p?.lng ? { lat: Number(p.lat), lng: Number(p.lng) } : null;
    // const dli = d?.lat && d?.lng ? { lat: Number(d.lat), lng: Number(d.lng) } : null;
    const pli = toLatLng(p);
    const dli = toLatLng(d);
    if (pli) { addMarker(mapRef!, pli, "P", "#1D4ED8", 70); b.extend(pli); }
    if (dli) { addMarker(mapRef!, dli, "D", "#DC2626", 70); b.extend(dli); }
    for (const s of visibleShipments || []) {
      const p = driverPos(s);
      if (p) b.extend(p);
    }
    // zoom to what we drew
    if (!b.isEmpty()) mapRef!.fitBounds(b, 64);
  }
  
// replace your existing path fetch with this
async function fetchShipmentPathById(shipmentId: string) {
  if (!shipmentId) return null;

  const qs = new URLSearchParams({ shipment: shipmentId }).toString();
  const res = await httpsGet(`shipment/path?${qs}`, 0);
  const raw = (res?.data ?? res) || {};

  // normalize shape
  return {
    gps: raw.gps ?? [],
    app: raw.app ?? [],
    sim: raw.sim ?? [],
    haltData: raw.haltData ?? [],
    meta: { is_fastag_enabled: raw.is_fastag_enabled, unique_code: raw.unique_code },
  };
}

// 

//   if (!shipmentId) return;

//   // Optional: pass date range if your UI has them
//   const qs = new URLSearchParams({
//     shipment: shipmentId,
//     ...(dateFrom ? { from: new Date(dateFrom).toISOString() } : {}),
//     ...(dateTo   ? { to:   new Date(dateTo).toISOString() }   : {}),
//   }).toString();

//   // GET with query string (same util you used elsewhere)
//   const res = await httpsGet(`shipment/path?${qs}`, 0);
//   const payload = (res?.data ?? res) as any;

//   const sim  = payload?.sim  ?? [];
//   const app  = payload?.app  ?? [];
//   const gps  = payload?.gps  ?? [];
//   const halt = payload?.haltData ?? [];

//   setPathData({
//     sim, app, gps, haltData: halt,
//     meta: { is_fastag_enabled: payload?.is_fastag_enabled, unique_code: payload?.unique_code }
//   });

//   // default: show what’s available (you can change the default)
//   setPathVisible({ gps: gps.length > 0, app: app.length > 0, sim: sim.length > 0 });

//   // draw once after fetching
//   drawPathsAndHalts({ gps: gps.length > 0, app: app.length > 0, sim: sim.length > 0 });
// }

  
//   // Reset all modal drafts + selected filters, then refetch
// const handleClearFilters = () => {
//   // drafts (modal local state)
//   setDraftMaterials("-");
//   setDraftPickupLocation("");
//   setDraftDeliveryLocation("");
//   setDraftCarrier("");
//   setDraftStatus("");
//   setDraftInPlantStage("");
//   setDraftShipmentId("");
//   setDraftDateFrom("");
//   setDraftDateTo("");
//   setDraftVehicle("");

//   // active filters shown in the header bar / applied to API
//   setSelectedMaterials("");
//   setSelectedPickupLocation("");
//   setSelectedDeliveryLocation("");
//   setSelectedCarrier("");
//   setSelectedStatus("all"); // or "" if you prefer truly empty
//   setInPlantStage("");
//   setShipmentIdSearch("");
//   setDateFrom("");
//   setDateTo("");
//   setVehicleSearch("");

//   // refetch with defaults (no filter)
//   fetchShipments({
//     status: "all",
//     inPlantStage: "",
//     material: "",
//     pickups: "",
//     deliveries: "",
//     carrier_id: "",
//     SIN: "",
//     from: "",
//     to: "",
//     vehicle_no: "",
//     group: "all",
//   });
// };
const handleClearFilters = () => {
  // Reset all state variables
//   setDraftMaterials("");
//   setDraftPickupLocation("");
  // ... (rest of the clear logic)

  // Re-fetch with the new, cleared state
  fetchShipments();
};
// call this from your shipment card onClick
const onShipmentCardClick = async (shipment: any) => {
  setSelectedShipment(shipment);           // still needed for P/D pins, etc.
  drawPDForShipment(shipment);
  const data = await fetchShipmentPathById(shipment._id);
  if (!data) return;

  const hasGPS = !!data.gps?.length;
  const hasAPP = !!data.app?.length;
  const hasSIM = !!data.sim?.length;

  // if nothing exists → clear everything and bail
  if (!(hasGPS || hasAPP || hasSIM)) {
    clearPathOverlays();
    setPathData(null);
    setPathVisible({ gps: false, app: false, sim: false });
    return; // chips won't render because pathData is null
  }

  // we have at least one track → save, show only what exists, draw once
  setPathData(data);
  // const vis = { gps: hasGPS, app: hasAPP, sim: hasSIM };
  const vis = { gps: false, app: false, sim: false };
  setPathVisible(vis);
  drawPathsAndHalts(vis);
};

  function buildMaterialBuckets(shipments: Shipment[]): {
    options: MaterialOption[];
    buckets: MaterialBuckets;
  } {
    const idToName = new Map<string, string>();        // pass 1: learn names by id
    const rawItems: Array<{ id: string; name: string }> = [];
  
    for (const s of shipments || []) {
      for (const m of s.materials || []) {
        const id = String((m as any)?._id ?? (m as any)?.id ?? "").trim();
        const name = String((m as any)?.name ?? "").trim();
        if (!id && !name) continue;
        rawItems.push({ id, name });
        if (id && name && !idToName.has(id)) idToName.set(id, name);
      }
    }
  
    // pass 2: resolve name (prefer m.name, else learned id→name); bucket by name
    const buckets: MaterialBuckets = {};
    const UNKNOWN_KEY = "__unknown__";
    const UNKNOWN_LABEL = "Unknown";
  
    for (const { id, name } of rawItems) {
      const resolvedName = name || (id ? idToName.get(id) || "" : "");
      if (!resolvedName) {
        // still unnamed → put under a single "Unknown" bucket (or skip if you prefer)
        if (!buckets[UNKNOWN_KEY]) buckets[UNKNOWN_KEY] = { label: UNKNOWN_LABEL, ids: [] };
        if (id && !buckets[UNKNOWN_KEY].ids.includes(id)) buckets[UNKNOWN_KEY].ids.push(id);
        continue;
      }
  
      const key = resolvedName.toLowerCase(); // de-dupe case-insensitively
      if (!buckets[key]) buckets[key] = { label: resolvedName, ids: [] };
      if (id && !buckets[key].ids.includes(id)) buckets[key].ids.push(id);
    }
  
    // Build options list; hide "Unknown" unless it’s the only thing we have
    const entries = Object.entries(buckets);
    const onlyUnknown = entries.length === 1 && entries[0][0] === UNKNOWN_KEY;
  
    const options = entries
      .filter(([k]) => onlyUnknown || k !== UNKNOWN_KEY) // drop Unknown if others exist
      .map(([key, b]) => ({ key, label: b.label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  
    return { options, buckets };
  }
  
type StatusTab = "all" | "in_plant" | "towards_pickup" | "in_transit" | "at_delivery";

type LegendKey =
  // in_transit
  | "on" | "2-4" | "4-8" | "8-12" | "12-16" | "16-20" | "20+"
  // at_delivery
  | "0-12" | "12-24" | "24+"
  // towards_pickup
  | "N" | "E" | "S" | "W" | "C"
  // in_plant
  | "PO" | "GI" | "TW" | "GW" | "PG" | "TC" | "IV" | "EW"
  // all
  | "ALL_IN_PLANT" | "ALL_TP" | "ALL_IT" | "ALL_AD";


const [activeLegend, setActiveLegend] = useState<LegendKey | null>(null);

useEffect(() => { setActiveLegend(null); }, [selectedStatus]); // reset when switching tabs
// in_transit
function delayHours(s:any){ const a=s?.tripTrackerDetails?.total_delay; const v=Number(a); return Number.isFinite(v)?v:0; }


// at_delivery
type DetentionBucket = "0-12" | "12-24" | "24+";
// ---- date -> epoch ms helpers (local timezone) ----
type D = string | number | Date | undefined | null;

const toStartOfDayMs = (v: D): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const d = typeof v === "number" ? new Date(v) : new Date(String(v));
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const toEndOfDayMs = (v: D): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const d = typeof v === "number" ? new Date(v) : new Date(String(v));
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

// Mapview.tsx (Around line 750) - Verification (Assuming hoursBetween works)
// function detentionBucket(s: Shipment): DetentionBucket {
//   // Let's assume you have a reliable 'timeArrivedAtDelivery' field for precision
//   // For now, stick to the provided logic, assuming `s.delivery_date` is the proxy start time.
//   const arrivedIso = s.delivery_date || null; 

//   if (!arrivedIso) return "0-12"; // Default

//   const h = hoursBetween(arrivedIso, undefined); // end time defaults to Date.now()
//   if (!Number.isFinite(h)) return "0-12"; 
  
//   // These return values MUST match the keys in the LEGEND_ITEMS object:
//   if (h < 12) return "0-12";
//   if (h < 24) return "12-24";
//   return "24+";
// }
function detentionBucket(arrivedIso?: string): DetentionBucket {
  if (!arrivedIso) return "0-12"; // default

  const h = hoursBetween(arrivedIso, undefined); // compare with now
  if (!Number.isFinite(h)) return "0-12";

  if (h < 12) return "0-12";
  if (h < 24) return "12-24";
  return "24+";
}

const MAP_HEIGHTS: Record<StatusTab | "default", number> = {
  in_transit: 570,
  at_delivery: 570,
  in_plant: 605,
  towards_pickup: 605,
  all: 605,
  default: 605,
};
const containerStyle = useMemo(() => {
  const h = MAP_HEIGHTS[(selectedStatus as StatusTab) ?? "default"] ?? MAP_HEIGHTS.default;
  return { width: "100%", height: `${h}px` };
}, [selectedStatus]);


// towards_pickup
// function driverPos(s:any){ /* your existing helper */ }

function tpBucket(s:any): Extract<LegendKey,"N"|"E"|"S"|"W"|"C"> {
  const from = driverPos(s); const to = firstPickupLatLng(s);
  if (!from || !to) return "C";
  return cardinalDirection(from, to); // returns N/E/S/W/C
}

// in_plant
function plantBucket(s:any): Extract<LegendKey,"PO"|"GI"|"TW"|"GW"|"PG"|"TC"|"IV"|"EW"> {
  const code = String(s?.eventStatus || s?.latest_status || "").toUpperCase();
  const allowed = new Set(["PO","GI","TW","GW","PG","TC","IV","EW"]);
  // return (allowed.has(code) ? (code as any) : "PO");
  return (allowed.has(code) ? (code as any) : undefined as any);
}

// all
function allBucket(s:any): Extract<LegendKey,"ALL_IN_PLANT"|"ALL_TP"|"ALL_IT"|"ALL_AD"> {
  const code = String(s?.latest_status || "").toUpperCase();
  if (code === "INPL") return "ALL_IN_PLANT";
  if (code === "SP")   return "ALL_TP";
  if (code === "ALD")  return "ALL_AD";
  // ITNS/ABTR → In Transit
  return "ALL_IT";
}
const LEGEND_ITEMS: Record<StatusTab, Array<{key:LegendKey; label:string; icon:any}>> = {
  in_transit: [
    { key:"on",    label:"On Time",            icon: ontime },
    { key:"2-4",   label:"2 - 4 Hours",        icon: twotofour },
    { key:"4-8",   label:"4 - 8 Hours",        icon: fourtoeight },
    { key:"8-12",  label:"8 - 12 Hours",       icon: eighttotwelve },
    { key:"12-16", label:"12 - 16 Hours",      icon: twelvetosixteen },
    { key:"16-20", label:"16 - 20 Hours",      icon: sixteentotwenty },
    { key:"20+",   label:"Beyond 20 Hours",    icon: beyondtwenty },
  ],
  at_delivery: [
    { key:"0-12",  label:"0 - 12 Hours",       icon: det_0_12 },
    { key:"12-24", label:"12 - 24 Hours",      icon: det_12_24 },
    { key:"24+",   label:"Beyond 24 Hours",    icon: det_24_plus },
  ],
  towards_pickup: [
    { key:"N", label:"North",  icon: dirN },
    { key:"E", label:"East",   icon: dirE },
    { key:"S", label:"South",  icon: dirS },
    { key:"W", label:"West",   icon: dirW },
    { key:"C", label:"Center", icon: dirC },
  ],
  in_plant: [
    { key:"PO", label:"PO → GI", icon: po_gi },
    { key:"GI", label:"GI → TW", icon: gi_tw},
    { key:"TW", label:"TW → GW", icon: tw_gw },
    { key:"GW", label:"GW → PG", icon: gw_pg },
    { key:"PG", label:"PG → TC", icon: pg_tc},
    { key:"TC", label:"TC → IV", icon: tc_iv},
    { key:"IV", label:"IV → EW", icon: iv_ew },
    { key:"EW", label:"Ewaybill", icon: ew_only },
  ],

  all: [
    { key:"ALL_IN_PLANT", label:"In Plant",      icon: catInPlant },
    { key:"ALL_TP",       label:"Towards Pickup",icon: catTowardsPickup },
    { key:"ALL_IT",       label:"In Transit",    icon: catInTransit },
    { key:"ALL_AD",       label:"At Delivery",   icon: catAtDelivery },
  ],
};
const visibleShipments = useMemo(() => {
  let arr = Array.isArray(shipmentsData) ? shipmentsData : [];

  if (!activeLegend) return arr;

  switch (selectedStatus as StatusTab) {
    case "in_transit":
      arr = arr.filter(s => delayBucket(s) === activeLegend);
      break;
    case "at_delivery":
      // arr = arr.filter(s => detentionBucket(s) === activeLegend);
      arr = arr.filter(s => detentionBucket(arrivalIsoFromDeliveries(s)) === activeLegend);
      break;
    case "towards_pickup":
      arr = arr.filter(s => tpBucket(s) === activeLegend);
      break;
    case "in_plant":
      arr = arr.filter(s => plantBucket(s) === activeLegend);
      break;
    case "all":
      // Either: switch the tab when user clicks a category…
      //   if (activeLegend === "ALL_IN_PLANT") setSelectedStatus("in_plant");
      // …or filter in-place by latest_status:
      arr = arr.filter(s => {
        const k = allBucket(s);
        return k === activeLegend;
      });
      break;
  }
  return arr;
}, [shipmentsData, selectedStatus, activeLegend]);
type GeoFence =
  | { type: "Polygon"; coordinates: number[][][] }           // [ [ [lng,lat], ... ]  , [hole], ... ]
  | { type: "MultiPolygon"; coordinates: number[][][][] };   // [ [ [ring], [ring] ], [ [ring] ] ]



// Style like your screenshot (soft blue fill, thin stroke)
const GEOFENCE_STYLE: google.maps.PolygonOptions & google.maps.CircleOptions = {
  strokeColor: "#1D4ED8",
  strokeOpacity: 0.9,
  strokeWeight: 1,
  fillColor: "#3B82F6",
  fillOpacity: 0.12,
  clickable: false,
  zIndex: 5,
};

function blueRingSvg({
  size = 64,            // pixel size of the badge
  core = 6,             // inner dot radius (px)
  ring1 = 16,           // first ring radius
  ring2 = 22,           // second ring radius
  ring3 = 30,           // outer ring radius
} = {}) {
  const s = size;
  const c = s / 2;
  // colors + opacities tuned to match your Angular look
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
      <defs>
        <radialGradient id="g1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#60A5FA" stop-opacity="0.10"/>
          <stop offset="70%" stop-color="#60A5FA" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#60A5FA" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- outer soft glow -->
      <circle cx="${c}" cy="${c}" r="${ring3}" fill="url(#g1)"/>
      <!-- middle halo -->
      <circle cx="${c}" cy="${c}" r="${ring2}" fill="#60A5FA" fill-opacity="0.1"/>
      <!-- inner halo -->
      <circle cx="${c}" cy="${c}" r="${ring1}" fill="#3B82F6" fill-opacity="0.1"/>
      <!-- core dot -->
      <circle cx="${c}" cy="${c}" r="${core}" fill="#1D4ED8" fill-opacity="0.15"/>
    </svg>
  `)}`;
}
function addBlueRingMarker(map: google.maps.Map, lat: number, lng: number, sizePx = 64) {
  const url = blueRingSvg({ size: sizePx });
  const marker = new google.maps.Marker({
    position: { lat, lng },
    map,
    clickable: false,
    zIndex: 999, // above fences, below info windows
    icon: {
      url,
      scaledSize: new google.maps.Size(sizePx, sizePx),
      anchor: new google.maps.Point(sizePx / 2, sizePx / 2), // center the badge at the point
    },
  });
  geofenceOverlaysRef.current.push(marker);
  return marker;
}
useEffect(() => {
  
  fetchShipments();
  
}, []);
function isValidLatLng(lat?: number, lng?: number) {
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (!isFinite(lat) || !isFinite(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(Math.abs(lat) < 1e-6 && Math.abs(lng) < 1e-6);
}
const handleAttach = (files: File[]) => {
  // …do your upload, then close
  closeModal();
};
const handleCreateAdvance = (payload: any) => {
  // …create payment advice, then close
  closeModal();
};
// Mapview.tsx (REPLACED CODE - Around line 258)
// Mapview.tsx (Around line 251) - VERIFIED CODE FOR ROBUSTNESS
// function ringToPath(ring: any): google.maps.LatLngLiteral[] {
//   const path: google.maps.LatLngLiteral[] = [];
//   if (!Array.isArray(ring)) return path;

//   for (const pair of ring) {
//     if (!Array.isArray(pair) || pair.length < 2) {
//       console.warn("Skipping malformed coordinate pair:", pair);
//       continue;
//     }
//     // coerce
//     let lng = Number(pair[0]);
//     let lat = Number(pair[1]);

//     if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
//       console.warn("Skipping non-finite coordinate pair:", pair);
//       continue;
//     }

//     // auto-swap if it looks like [lat, lng]
//     if ((Math.abs(lat) > 60 && Math.abs(lng) <= 60) || (lng < -180 || lng > 180)) {
//       const t = lat; lat = lng; lng = t;
//     }

//     if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
//       console.warn("Skipping out-of-range pair:", pair);
//       continue;
//     }
//     path.push({ lat, lng });
//   }
//   return path;
// }

// type ModalType = "cancel" | "share" | "mail" | "upload" | "advance" | null;

const [menu, setMenu] = useState<{
  open: boolean;
  x: number;
  y: number;
  shipmentId?: string;
  placement: "above" | "below";
}>({ open: false, x: 0, y: 0, shipmentId: undefined, placement: "below" });

// type ModalType = 'cancel' | 'share' | 'mail' |  'upload' | 'advance' | null;
// // type ModalState = { type: ModalType; shipment?: { _id: string; sin: string } };
// // const [modal, setModal] = useState<ModalState>({ type: null });
// type ModalState =
//   | { type: "cancel";  shipment: { _id: string; sin: string } }   // needs object
//   | { type: "mail";    shipment: { _id: string; sin: string } }   // needs object
//   | { type: "share";   shipment: { _id: string; sin: string } }   // needs object
//   | { type: "upload";  shipmentId: string }                       // needs id
//   | { type: "advance"; shipmentId: string }                       // needs id
//   | { type: null };

// const [modal, setModal] = useState<ModalState>({ type: null });
type ModalType = "cancel" | "mail" | "share" | "upload" | "advance" | null;

type ModalState =
  | { type: "cancel" | "mail" | "share"; shipment: { _id: string; sin: string } }
  | { type: "upload" | "advance";        shipmentId: string }
  | { type: null };

const [modal, setModal] = useState<ModalState>({ type: null });

function openCancelModal(s: { _id: string; SIN: string }) {
  setModal({ type: "cancel",  shipment: { _id: s._id, sin: s.SIN } });
}
function openMailModal(s: { _id: string; SIN: string }) {
  setModal({ type: "mail",    shipment: { _id: s._id, sin: s.SIN } });
}
function openShareModal(s: { _id: string; SIN: string }) {
  setModal({ type: "share",   shipment: { _id: s._id, sin: s.SIN } });
}
function openAttachModal(id: string)  { setModal({ type: "upload",  shipmentId: id }); }
function openAdvanceModal(id: string) { setModal({ type: "advance", shipmentId: id }); }

// const closeModal = () => setModal({ type: null });

// const [modal, setModal] = useState<{ type: ModalType; shipmentId?: string }>({
//   type: null,
//   shipmentId: undefined,
// });
// ---------- Driver position ----------
// function driverPos(s: Shipment): { lat: number; lng: number } | null {
//   // prefer assigned_driver.geo_point (GeoJSON [lng,lat])
//   const coords = s?.assigned_driver?.geo_point?.coordinates;
//   if (Array.isArray(coords) && coords.length >= 2) {
//     const lng = Number(coords[0]); const lat = Number(coords[1]);
//     if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
//   }
//   // fallbacks (if your API also flattens lat/lng)
//   const lat = (s as any)?.assigned_driver?.latitude ?? (s as any)?.latitude;
//   const lng = (s as any)?.assigned_driver?.longitude ?? (s as any)?.longitude;
//   return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
// }
function driverPos(s: Shipment): { lat: number; lng: number } | null {
  // Prefer GeoJSON if present
  const coords = s?.assigned_driver?.geo_point?.coordinates; // usually [lng, lat]
  let lat: number | undefined;
  let lng: number | undefined;

  if (Array.isArray(coords) && coords.length >= 2) {
    // Start with “GeoJSON order”
    let cLng = Number(coords[0]);
    let cLat = Number(coords[1]);

    // Auto-swap if it *looks* like [lat, lng] slipped through
    // (lat looks huge/invalid, or "lng" out of range)
    if ((Math.abs(cLat) > 60 && Math.abs(cLng) <= 60) || cLng < -180 || cLng > 180) {
      const t = cLat; cLat = cLng; cLng = t;
    }

    lat = cLat;
    lng = cLng;
  } else {
    // Fallbacks (flat lat/lng)
    lat = Number((s as any)?.assigned_driver?.latitude ?? (s as any)?.latitude);
    lng = Number((s as any)?.assigned_driver?.longitude ?? (s as any)?.longitude);
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  // Keep the “ignore obviously wrong” rule, but apply it *after* the swap heuristic
  if (!inIndia(lat, lng)) return null;

  return { lat, lng };
}



// ---------- First pickup lat/lng (for Towards Pickup bearing) ----------
// function firstPickupLatLng(s: Shipment): { lat: number; lng: number } | null {
//   const p = s?.pickups?.[0]?.location;
//   if (!p) return null;
//   const lat = Number(p.lat); const lng = Number(p.lng);
//   return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
// }
function firstPickupLatLng(s: Shipment): { lat: number; lng: number } | null {
  const p = s?.pickups?.[0]?.location;
  if (!p) return null;
  const lat = Number(p.lat), lng = Number(p.lng);
  const res = (Number.isFinite(lat) && Number.isFinite(lng)) ? { lat, lng } : null;
  return res && inIndia(res.lat, res.lng) ? res : null;
}
// ---------- In-Transit: delay buckets ----------
// function delayHours(s: Shipment): number {
//   // Angular code uses tripTrackerDetails.total_delay (hours)
//   const a = (s as any)?.tripTrackerDetails?.total_delay;
//   const b = (s as any)?.trip_tracker?.total_delay; // fallback if you store it here
//   const v = Number.isFinite(a) ? a : Number(b);
//   return Number.isFinite(v) ? v : 0;
// }

type DelayBucket = "on" | "2-4" | "4-8" | "8-12" | "12-16" | "16-20" | "20+";
function delayBucket(s: Shipment): DelayBucket {
  const h = delayHours(s);
  if (h < 2)      return "on";   // ⬅️ Angular-aligned threshold
  if (h < 4)      return "2-4";
  if (h < 8)      return "4-8";
  if (h < 12)     return "8-12";
  if (h < 16)     return "12-16";
  if (h < 20)     return "16-20";
  return "20+";
}


function inTransitIcon(s: Shipment): string {
  const b = delayBucket(s);
  if (b === "on")    return srcOf(ontime);
  if (b === "2-4")   return srcOf(twotofour);
  if (b === "4-8")   return srcOf(fourtoeight);
  if (b === "8-12")  return srcOf(eighttotwelve);
  if (b === "12-16") return srcOf(twelvetosixteen);
  if (b === "16-20") return srcOf(sixteentotwenty);
  return srcOf(beyondtwenty);
}
function allViewIcon(s: Shipment): string | null {
  const code = String(s?.latest_status || "").toUpperCase();
  // map Angular’s buckets:
  if (code === "INPL") return srcOf(catInPlant);
  if (code === "SP")   return srcOf(catTowardsPickup);        // Scheduled / Towards Pickup
  if (code === "ALD")  return srcOf(catAtDelivery);
  if (code === "ITNS" || code === "ABTR") return srcOf(catInTransit);
  return srcOf(catInTransit); // safe default
}
function getMarkerIconForShipment(s: Shipment): google.maps.Icon | undefined {
  let url: string | null = null;

  if (selectedStatus === "towards_pickup") {
    // Use bearing to the first pickup
    const from = driverPos(s);
    const to   = firstPickupLatLng(s);
    if (from && to) {
      const dir = cardinalDirection(from, to); // N/E/S/W/C
      const m = { N: dirN, E: dirE, S: dirS, W: dirW, C: dirC };
      url = srcOf(m[dir]);
    }
  }
  else if (selectedStatus === "in_plant") {
    url = inPlantStageIcon(s, inPlantStage);
  }
  else if (selectedStatus === "at_delivery") {
    if (activeLegend && detentionBucket(arrivalIsoFromDeliveries(s)) !== activeLegend) {
      return undefined; // don’t render this marker
    }
    url = atDeliveryIcon(s);
  }
  else if (selectedStatus === "in_transit") {
    // Delay buckets + optional legend filter
    const iconUrl = inTransitIcon(s);
    if (!activeLegend) {
      url = iconUrl;
    } else {
      // show only shipments matching the clicked legend bucket
      if (delayBucket(s) === (activeLegend as DelayBucket)) url = iconUrl;
      else url = null;
    }
  }
  else if (selectedStatus === "all") {
    url = allViewIcon(s);
  }

  return url ? markerIcon(url, 30) : undefined;
}
// function getMarkerIconForShipment(s: Shipment): google.maps.Icon | undefined {
//   let url: string | null = null;

//   switch (selectedStatus as StatusTab) {
//     case "in_transit":
//       if (activeLegend && delayBucket(s) !== activeLegend) return undefined;
//       url = inTransitIcon(s); // your existing map -> icon
//       break;

//     case "at_delivery":
//       if (activeLegend && detentionBucket(s) !== activeLegend) return undefined;
//       url = atDeliveryIcon(s);
//       break;

//     case "towards_pickup":
//       if (activeLegend && tpBucket(s) !== activeLegend) return undefined;
//       url = directionIconFor(s); // use your cardinalDirection → icon map
//       break;

//     case "in_plant":
//       if (activeLegend && plantBucket(s) !== activeLegend) return undefined;
//       url = inPlantStageIcon(s);
//       break;

//     case "all":
//       if (activeLegend && allBucket(s) !== activeLegend) return undefined;
//       url = allViewIcon(s);
//       break;
//   }

//   return url ? markerIcon(url, 30) : undefined;
// }

// const visibleShipments = useMemo(() => {
//   let arr = Array.isArray(shipmentsData) ? shipmentsData : [];

//   // Towards Pickup requires both driver & first pickup coords to compute direction
//   if (selectedStatus === "towards_pickup") {
//     arr = arr.filter(s => driverPos(s) && firstPickupLatLng(s));
//   }

//   if (selectedStatus === "in_plant" && inPlantStage) {
//     const code = mapInPlantStageToEventCode(inPlantStage);
//     if (code) {
//       arr = arr.filter(s => String(s.latest_status || "").toUpperCase() === code);
//     }
//   }

//   if (selectedStatus === "in_transit" && activeLegend) {
//     arr = arr.filter(s => delayBucket(s) === (activeLegend as DelayBucket));
//   }

//   // (Optional) apply your delivery-location / carrier dropdowns here

//   return arr;
// }, [shipmentsData, selectedStatus, inPlantStage, activeLegend]);
useEffect(() => {
  if (!mapRef || visibleShipments.length === 0) return;
  const b = new google.maps.LatLngBounds();
  let added = 0;
  visibleShipments.forEach(s => {
    const p = driverPos(s);
    if (p) { b.extend(p); added++; }
  });
  if (added) mapRef.fitBounds(b, 64);
}, [mapRef, visibleShipments]);

// const openModal = (type: Exclude<ModalType, null>, shipmentId?: string) => {
//   console.log(`[openModal] Type: ${type}, Shipment ID Received: ${shipmentId}`); 
//   setModal({ type, shipmentId });
//   // close the menu when opening a modal
//   setMenu((m) => ({ ...m, open: false }));
// };
// const openModal = (type: Exclude<ModalType, null>, shipmentId?: string) => {
//   console.log('[openModal] Type:', type, 'Shipment ID Received:', shipmentId);

  // SIN is the shipment id in your system → feed both fields
  // const shipment =
  //   shipmentId ? { sin: String(shipmentId)}  : undefined;
  function openModal(type: Exclude<ModalType, null>, shipmentId: string) {
    // ensure we always get an id for any modal that opens
    const id = String(shipmentId);
  
    if (type === "upload" || type === "advance") {
      setModal({ type, shipmentId: id }); // expects string id
    } else {
      setModal({ type, shipment: { _id: id, sin: id } }); // expects object
    }
  }
  
//     const shipment =
//     shipmentId 
//     ? { 
//         // FIX: Include the required '_id' property.
//         _id: String(shipmentId), // Using shipmentId (SIN) as the _id
//         sin: String(shipmentId) 
//       }  
//     : undefined;
//     setModal({ type, shipment });


// };

// const closeModal = () => setModal({ type: null, shipment: undefined });
// const closeModal = () => setModal({ type: null }); 
const closeModal = () => setModal({ type: null }); // no extra props



function clearGeofenceOverlays() {
  geofenceOverlaysRef.current.forEach(o => o.setMap(null));
  geofenceOverlaysRef.current = [];
}
// Converts a GeoJSON ring [[lng,lat], ...] ➜ google paths [{lat,lng}, ...]
function ringToPath(ring: any): google.maps.LatLngLiteral[] {
  const path: google.maps.LatLngLiteral[] = [];
  if (!Array.isArray(ring)) return path;

  for (const pt of ring) {
    if (!Array.isArray(pt) || pt.length < 2) continue;
    let lng = Number(pt[0]);
    let lat = Number(pt[1]);

    // auto-swap if someone sent [lat,lng]
    if ((Math.abs(lat) > 60 && Math.abs(lng) <= 60) || lng < -180 || lng > 180) {
      [lat, lng] = [lng, lat];
    }

    // basic sanity
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

    // (optional) keep only India-ish points; comment out if you want everything
    // const inIndia = (a:number,b:number)=> a>=5 && a<=38.9 && b>=68 && b<=98;
    // if (!inIndia(lat, lng)) continue;

    path.push({ lat, lng });
  }
  return path;
}


// function drawGeoFencesOnMap(data: any[], map: google.maps.Map) {
//      console.log("[GEOFENCE] draw start. items:", data?.length);
//      clearGeofenceOverlays();
//      const bounds = new google.maps.LatLngBounds();
//      let added = 0;
  
//      for (const item of data || []) {
//        const gf = item?.geo_fence;
//        const type = String(gf?.type || "").toLowerCase();
//        if (!type || !gf?.coordinates) continue;
  
//        if (type === "circle") {
//          let lng = Number(gf.coordinates[0]);
//          let lat = Number(gf.coordinates[1]);
//          const radius = Number(gf.coordinates[2] ?? 250);
//          if ((Math.abs(lat) > 60 && Math.abs(lng) <= 60) || (lng < -180 || lng > 180)) {
//           const t = lat; lat = lng; lng = t;
//          }
//          if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radius)) continue;
//         //  const c = new google.maps.Circle({ ...GEOFENCE_STYLE, center: { lat, lng }, radius, map });
//         //  geofenceOverlaysRef.current.push(c);
//         //  const cb = c.getBounds?.();
//         //  cb ? bounds.union(cb) : bounds.extend({ lat, lng });
//          addBlueRingMarker(map, lat, lng, 64);
//          added++;
//         continue;
//        }
  
//       // if ((type === "polygon" || type === "multipolygon") && Array.isArray(gf.coordinates)) {
//       //    const multiPolys: number[][][][] = type === "multipolygon" ? gf.coordinates : [gf.coordinates];
//       //   for (const rings of multiPolys) {
//       //      const paths = (rings || []).map(ringToPath).filter(p => p.length >= 3);
//       //      if (!paths.length) continue;
//       //      const p = new google.maps.Polygon({ ...GEOFENCE_STYLE, paths, map });
//       //   geofenceOverlaysRef.current.push(p);
//       //     paths[0].forEach(pt => bounds.extend(pt as any));
//       //      added++;
//       //    }
//       // }
//       if ((type === "polygon" || type === "multipolygon") && Array.isArray(gf.coordinates)) {
//         // MultiPolygon wraps an array of Polygons: [[rings], [rings]]
//         // Polygon is just an array of rings: [rings]
//         const polygonRings: number[][][] = type === "multipolygon"
//           // Flatten the MultiPolygon structure down to an array of all its rings
//           ? gf.coordinates.flat(1) as number[][][] 
//           : gf.coordinates as number[][][];

//         for (const rings of polygonRings) {
//           // 'rings' here is an array of coordinates for ONE polygon's exterior/holes: [[lon,lat], [lon,lat], ...]

//           // 1. Convert all rings (exterior + holes) using ringToPath
//           // paths will be: [[{lat,lng}, ...], [{lat,lng}, ...]]
//           const paths = (rings || []).map(ringToPath).filter(p => p.length >= 3);
          
//           if (!paths.length) continue;
          
//           // 2. The paths property takes an array of rings/paths for the Polygon
//           const p = new google.maps.Polygon({ ...GEOFENCE_STYLE, paths, map });
          
//           geofenceOverlaysRef.current.push(p);
          
//           // 3. Extend bounds using the OUTERMOST ring (paths[0])
//           paths[0].forEach(pt => bounds.extend(pt as any));
//           added++;
//         }
//       }
//      }
  
//      console.log("[GEOFENCE] overlays added:", added, "bounds empty?", bounds.isEmpty());
//      return { added: added > 0, bounds };
//    }



useEffect(() => {
  const fetchGeoFences = async () => {
    try {
      const unitsRes = await httpsGet("location/units/get", 4);
      const raw = unitsRes?.data ?? [];
const items = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
console.log("API raw:", raw);
console.log("Items extracted:", items);
console.log("Unit sample:", items[0]);

const DEFAULT_RADIUS_METERS = 1000; // tune as needed

const fences = items
  .map((loc: any) => {
    // Prefer geo_fence if backend starts sending it later
    const gf = loc?.geo_fence;
    if (gf?.type && gf?.coordinates) return { geo_fence: gf };

    // Fallback to geo_point -> Circle
    const gp = loc?.geo_point;
    const coords = gp?.coordinates;
    // coords are [lon, lat] in your payload
    if (!Array.isArray(coords) || coords.length < 2) return null;

    const lon = Number(coords[0]);
    const lat = Number(coords[1]);

    // filter garbage / origin-like points
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (!inIndia(lat, lon)) return null;   
    if (Math.abs(lat) < 0.0001 && Math.abs(lon) < 0.0001) return null;

    return {
      geo_fence: {
        type: "Circle",
        coordinates: [lon, lat, DEFAULT_RADIUS_METERS],
      },
    };
  })
  .filter(Boolean);
console.log("Geo fence is",fences);
setGeoFences(fences);
      setUnitLocations(unitsRes?.data ?? []); // optional: for unit markers
    } catch (err) {
      console.error("Error fetching geo-fences:", err);
    }
  };

  fetchGeoFences();
}, []);
const setAndFetch = <T,>(setter: (v: T) => void) => (v: T) => {
  setter(v);
  fetchShipments(); // same as how status triggers an immediate fetch
};

// useEffect(() => {
//     if (!mapRef) { console.log("[GEOFENCE] mapRef not ready"); return; }
//      if (!geoFences || geoFences.length === 0) { console.log("[GEOFENCE] no fences to draw"); return; }
//      const { added, bounds } = drawGeoFencesOnMap(geoFences, mapRef);
//     if (added && !bounds.isEmpty()) {
//        console.log("[GEOFENCE] fitting bounds");
//        mapRef.fitBounds(bounds, 64);
//    } else {
//        console.log("[GEOFENCE] nothing added or empty bounds");
//      }
//      return () => clearGeofenceOverlays();
//    }, [geoFences, mapRef]);



// useEffect(() => {
//   if (mapRef && geoFences.length > 0) {
//     drawGeoFences(geoFences, mapRef);
//   }
// }, [geoFences, mapRef]);
// Style like your screenshot (soft blue fill, thin stroke)





// Draw everything and return whether anything was added


// One function to open the modal and prefill all draft fields
const openFiltersWithSnapshot = (patch?: Partial<{
  materials: string;
  pickupLocation: string;
  deliveryLocation: string;
  carrier: string;
  status: string;
  inPlant: string;
  vehicle: string;
  sin: string;
  from_date: string;
  to_date: string;
}>) => {
  // Don't read from main state - only use the patch parameter
  // This keeps the form independent from main view changes
  setFormDrafts({
    materials: patch?.materials ?? "",
    pickupLocation: patch?.pickupLocation ?? "",
    deliveryLocation: patch?.deliveryLocation ?? "",
    carrier: patch?.carrier ?? "",
    status: patch?.status ?? "",
    inPlantStage: patch?.inPlant ?? "",
    shipmentId: patch?.sin ?? "",
    dateFrom: patch?.from_date ?? "",
    dateTo: patch?.to_date ?? "",
    vehicle: patch?.vehicle ?? ""
  });
  setIsFilterOpen(true);
};


// fixed order (same as UI)
const EVENT_STATUS_ORDER = ["PO","GI","TW","GW","PG","TC","IV","EW"] as const;
type EventCode = typeof EVENT_STATUS_ORDER[number];

const isEventCode = (v: string): v is EventCode =>
  EVENT_STATUS_ORDER.includes(v as EventCode);

// UI already gives us "PO" | "GI" | ... so just validate
const mapInPlantStageToEventCode = (stage: string) =>
  isEventCode(stage) ? stage : null;
// For Towards Pickup: need current driver position + first pickup location
// ---------- Direction / distance ----------
type LatLng = { lat: number; lng: number };

function toRad(v: number) { return (v * Math.PI) / 180; }
function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat/2)**2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function bearingDeg(a: LatLng, b: LatLng) {
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const λ1 = toRad(a.lng), λ2 = toRad(b.lng);
  const y = Math.sin(λ2-λ1) * Math.cos(φ2);
  const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
  const θ = Math.atan2(y, x);
  return (θ * 180/Math.PI + 360) % 360; // 0..360
}

/** Collapse to N/E/S/W; if very close, return 'C' (center). */
function cardinalDirection(from: LatLng, to: LatLng): "N"|"E"|"S"|"W"|"C" {
  const distKm = haversineKm(from, to);
  if (distKm < 2) return "C"; // close enough

  const brg = bearingDeg(from, to); // 0=N, 90=E, 180=S, 270=W
  if (brg >= 45 && brg < 135) return "E";
  if (brg >= 135 && brg < 225) return "S";
  if (brg >= 225 && brg < 315) return "W";
  return "N";
}

// ---------- In-Plant stage mapping ----------
const INPLANT_LABEL: Record<EventCode, string> = {
  PO: "Parking Out → Gate In",
  GI: "Gate In → Tare Weight",
  TW: "Tare Weight → Gross Weight",
  GW: "Gross Weight → Post Goods",
  PG: "Post Goods → Test Certificate",
  TC: "Test Certificate → Invoice",
  IV: "Invoice → Ewaybill",
  EW: "Ewaybill",
};

const INPLANT_ICON: Record<EventCode, any> = {
  PO: po_gi,
  GI: gi_tw,
  TW: tw_gw,
  GW: gw_pg,
  PG: pg_tc,
  TC: tc_iv,
  IV: iv_ew,
  EW: ew_only,
};

// ---------- At-Delivery detention ----------
function hoursBetween(isoStart?: string, isoEnd?: string) {
  const a = isoStart ? new Date(isoStart).getTime() : NaN;
  const b = isoEnd ? new Date(isoEnd).getTime() : Date.now();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  return Math.max(0, (b - a) / 36e5);
}

/** Buckets: '0-12' | '12-24' | '24+' */
// function detentionBucket(startIso?: string, endIso?: string) {
//   const h = hoursBetween(startIso, endIso);
//   if (!Number.isFinite(h)) return "0-12";
//   if (h < 12) return "0-12";
//   if (h < 24) return "12-24";
//   return "24+";
// }

// ---------- Marker icon builder ----------
function markerIcon(url: string, size = 30): google.maps.Icon {
  return {
    url,
    scaledSize: new google.maps.Size(size, size),
    labelOrigin: new google.maps.Point(size / 2, -6), // ← nudge label above icon
  };
}


function pickupDirectionIcon(s: Shipment): string | null {
  const from = toLatLng(s.assigned_driver as any);
  const pLoc = s?.pickups?.[0]?.location;
  if (!from || !pLoc?.lat || !pLoc?.lng) return null;
  const to = { lat: Number(pLoc.lat), lng: Number(pLoc.lng) };

  const dir = cardinalDirection(from, to);
  const map = { N: dirN, E: dirE, S: dirS, W: dirW, C: dirC };
  const icon = map[dir];
  return srcOf(icon) || null;
}

// For In Plant: take shipment.latest_status if it’s one of the stage codes; else the filter value
function inPlantStageIcon(s: Shipment, fallbackCode?: string): string | null {
  const code = (EVENT_STATUS_ORDER as readonly string[])
    .find(k => (s.latest_status || "").toUpperCase() === k)
    || (fallbackCode && EVENT_STATUS_ORDER.includes(fallbackCode as any) ? fallbackCode : null);

  if (!code) return null;
  const icon = INPLANT_ICON[code as EventCode];
  return srcOf(icon) || null;
}

// For At Delivery: compute detention hours since arrival (choose your own field!)
// function atDeliveryIcon(s: Shipment): string | null {
//   // Pick your source of "arrived at delivery" time:
//   const arrivedIso =
//     (s as any)?.delivery_gate_in ||      // if you have it
//     (s as any)?.at_delivery_time ||      // or this
//     s.delivery_date ||                   // fallback
//     null;

//   const bucket = detentionBucket(arrivedIso, undefined);
//   if (bucket === "0-12") return srcOf(det_0_12);
//   if (bucket === "12-24") return srcOf(det_12_24);
//   return srcOf(det_24_plus);
// }
// function atDeliveryIcon(s: Shipment): string | null {
//   const arrivedIso =
//     (s as any)?.delivery_gate_in ||
//     (s as any)?.at_delivery_time ||
//     s.delivery_date || 
//     null;

//   const bucket = detentionBucket(arrivedIso);
//   if (bucket === "0-12") return srcOf(det_0_12);
//   if (bucket === "12-24") return srcOf(det_12_24);
//   return srcOf(det_24_plus);
// }
function atDeliveryIcon(s: Shipment): string | null {
  const bucket = detentionBucket(arrivalIsoFromDeliveries(s));
  if (bucket === "0-12") return srcOf(det_0_12);
  if (bucket === "12-24") return srcOf(det_12_24);
  return srcOf(det_24_plus);
}


// Main selector based on the current filter (selectedStatus)
// function getMarkerIconForShipment(s: Shipment): google.maps.Icon | undefined {
//   let url: string | null = null;

//   if (selectedStatus === "towards_pickup") {
//     url = pickupDirectionIcon(s);
//   } else if (selectedStatus === "in_plant") {
//     url = inPlantStageIcon(s, inPlantStage);
//   } else if (selectedStatus === "at_delivery") {
//     url = atDeliveryIcon(s);
//   } else if (selectedStatus === "in_transit") {
//     // You already have your “vehicle by hours” logic; if you map that to icons,
//     // just set url = srcOf(the_in_transit_icon_for_this_shipment)
//     // or leave null to use your existing in-transit branch.
//   }

//   return url ? markerIcon(url, 30) : undefined;
// }



  // kind: "delivery" | "pickup" | "both"
// const computeDistinctLocations = (shipments: Shipment[], kind: "delivery" | "pickup" | "both" = "delivery") => {
//   const byId = new Map<string, string>();
//   const take = (loc?: ShipmentLocation) => {
//     if (!loc?._id) return;
//     const label = (loc.name || loc.city || "").trim();
//     if (!label) return;
//     if (!byId.has(loc._id)) byId.set(loc._id, label);
//   };

//   for (const sh of shipments ?? []) {
//     if (kind !== "pickup") for (const d of sh.deliveries ?? []) take(d.location);
//     if (kind !== "delivery") for (const p of sh.pickups ?? []) take(p.location);
//   }
//   // stable sort alphabetically
//   return Array.from(byId, ([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
// };
const computeDistinctLocations = (
  shipments: Shipment[],
  kind: "delivery" | "pickup" | "both" = "delivery"
) => {
  const byId = new Map<string, string>();

  const take = (loc: any) => {
    const id = String(loc?._id ?? "").trim();
    const name = String(loc?.name ?? "").trim();
    if (!id) return;
    if (!byId.has(id)) {
      byId.set(id, name || id);   // fall back to id if no name
    }
  };

  for (const sh of shipments ?? []) {
    if (kind !== "pickup") for (const d of sh.deliveries ?? []) take(d.location);
    if (kind !== "delivery") for (const p of sh.pickups ?? []) take(p.location);
  }

  return Array.from(byId, ([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
};


const computeDistinctCarriers = (shipments: Shipment[]) => {
  const byId = new Map<string, string>();
  for (const sh of shipments ?? []) {
    const c = sh.carrier;
    if (!c?._id) continue;
    const label = (c.parent_name || c.name || "").trim();
    if (!label) continue;
    if (!byId.has(c._id)) byId.set(c._id, label);
  }
  return Array.from(byId, ([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
};
// Initial load only


useEffect(() => {
  fetchShipments();
}, [shipmentGroup, selectedStatus, inPlantStage]);

useEffect(() => {
  // if user clears the box, refetch with other filters
  const t = window.setTimeout(() => {
    fetchShipments();
  }, 400); // 300–500ms is comfy
  return () => window.clearTimeout(t);
}, [vehicleSearch]);


useEffect(() => {
  const locs = computeDistinctLocations(shipmentsData, "delivery"); // or "both"
  const carrs = computeDistinctCarriers(shipmentsData);
  const pickuplocs= computeDistinctLocations(shipmentsData, "pickup");
  setLocationsList(locs);
  setDeliveryLocationsList(locs);
  setCarriersList(carrs);
  setPickupLocationsList(pickuplocs); 
  const { options, buckets } = buildMaterialBuckets(shipmentsData);
  setMaterialsList(options);
  setMaterialBuckets(buckets);

  // (optional) auto-select the first item if nothing chosen yet
  // if (!selectedLocation && locs[0]) setSelectedLocation(locs[0].id);
  // if (!selectedCarrier && carrs[0]) setSelectedCarrier(carrs[0].id);
}, [shipmentsData]); // eslint-disable-line react-hooks/exhaustive-deps

  // normalize asset imports to a URL (works with file-loader/SVGR default)
const srcOf = (m: any): string => (typeof m === "string" ? m : m?.src ?? m?.default?.src ?? "");
const MENU_W = 280;

// const [menu, setMenu] = useState<{
//   open: boolean;
//   x: number;
//   y: number;
//   shipmentId?: string;
//   placement: "above" | "below";
// }>({ open: false, x: 0, y: 0, shipmentId: undefined, placement: "below" });

const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
const actionItems = useMemo(
  () => [
    { key: "view", icon: eye, label: "View", onClick: (id: string) => console.log("view", id) },
    { key: "cancel", icon: cancel, label: "Cancel", onClick: (id: string) => openModal("cancel", id)},
    { key: "share", icon: share, label: "Share", onClick: (id: string) => openModal("mail", id) },
    { key: "mail", icon: mail, label: "Mail", onClick: (id: string) =>  openModal("share", id)},
    { key: "upload", icon: upload, label: "Upload Approval Documents", onClick: (id: string) =>  openModal("upload", id) },
    { key: "advance", icon: doc, label: "Create Advance Payment", onClick: (id: string) => openModal("advance", id) },
 
  ],
  [openModal]
);
const openActionMenu = (evt: React.MouseEvent<HTMLButtonElement>, shipmentId?: string) => {
  const rect = (evt.currentTarget as HTMLElement).getBoundingClientRect();
  let x = rect.right - MENU_W;                         // align right edge of menu with button
  x = Math.max(12, Math.min(x, window.innerWidth - MENU_W - 12));
  const y = rect.top;
  // const y = Math.min(rect.bottom + 8, window.innerHeight - 12); 
  setMenu({ open: true, x, y, shipmentId, placement: "above"});
};
// const computeDistinctMaterials = (shipments: Shipment[]) => {
//   const seen = new Map<string, string>();
//   for (const sh of shipments ?? []) {
//     for (const m of sh.materials ?? []) {
//       const raw = typeof m === "string" ? m : m?.name;
//       if (!raw) continue;
//       const trimmed = raw.trim();
//       if (!trimmed) continue;
//       const key = trimmed.toLowerCase(); // de-dupe case-insensitively
//       if (!seen.has(key)) seen.set(key, trimmed);
//     }
//   }
//   return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
// };
// const computeDistinctMaterials = (shipments: Shipment[]) => {
//      // Prefer de-duplication by material _id; fall back to name
//      const byId = new Map<string, { id: string; label: string }>();
//      const byNameKey = new Map<string, { id: string; label: string }>();
//      for (const sh of shipments ?? []) {
//        for (const m of sh.materials ?? []) {
//         const id = (m as any)?._id || "";
//         const name = ((m as any)?.name || (typeof m === "string" ? m : "") || "").trim();
//          if (!id && !name) continue;
//          if (id) {
//            if (!byId.has(id)) byId.set(id, { id, label: name || id });
//          } else {
//           const key = name.toLowerCase();
//            if (!byNameKey.has(key)) byNameKey.set(key, { id: name, label: name });
//          }
//        }
//      }
//      const list = [...byId.values(), ...byNameKey.values()];
//      return list.sort((a, b) => a.label.localeCompare(b.label));
//    };

// useEffect(() => {
//   setMaterialsList(computeDistinctMaterials(shipmentsData));

// }, [shipmentsData])
useEffect(() => {
  if (!mapRef) return;
  // drawPickupDeliveryMarkers();
  console.log("[PD] effect fired. visible:", visibleShipments.length);
  return () => clearPDMarkers();
}, [mapRef, visibleShipments]);

const closeActionMenu = () => setMenu((s) => ({ ...s, open: false }));

useEffect(() => {
  if (!menu.open) return;
  const onDown = (e: MouseEvent) => {
    const el = document.getElementById("action-menu");
    if (el && el.contains(e.target as Node)) return;
    closeActionMenu();
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeActionMenu(); };
  const onScroll = () => closeActionMenu(); // any scroll closes it (keeps life simple)
  window.addEventListener("mousedown", onDown);
  window.addEventListener("keydown", onKey);
  window.addEventListener("scroll", onScroll, true);
  return () => {
    window.removeEventListener("mousedown", onDown);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", onScroll, true);
  };
}, [menu.open]);


// UI -> API status mapping: always an UPPERCASE array
const mapStatusToApi = (s: string): string[] => {
  switch (s) {
    case "all":             return ["ALL"];
    case "in_transit":      return ["INTRANSIT"];
    case "at_delivery":     return ["ATDELIVERY"];
    case "towards_pickup":  return ["TOWARDSPICKUP"];
    case "in_plant":        return ["INPLANT"];
    default:                return ["ALL"];
  }
};

  // Function to close the sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedShipment(null);
  };
  const fmtTime = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const mon = d.toLocaleString("en-GB", { month: "short" }); // e.g., Sep
    const hr24 = d.getHours();
    const hr = (hr24 % 12) || 12;
    const min = String(d.getMinutes()).padStart(2, "0");
    const ampm = hr24 >= 12 ? "PM" : "AM";
    return `${day}-${mon}, ${hr}:${min} ${ampm}`;
  };
  // const buildApiFilters = () => {
  //   const f: any = { limit: 50, skip: 0 };
  //   if (selectedStatus === "in_plant") {
  //     const code = mapInPlantStageToEventCode(inPlantStage);
  //     if (code) f.event_status = code;
     
  //   }
  //   if (vehicleSearch.trim()) {
  //     f.vehicle_no = vehicleSearch.trim().toUpperCase().replace(/\s+/g, "");
  //   }
  //   f.status = mapStatusToApi(selectedStatus);
  //    if (shipmentIdSearch.trim()) {
  //        // adjust the key to what your API expects (e.g., sin / SIN / shipment_id)
  //       f.sin = shipmentIdSearch.trim().toUpperCase();
  //      }
      
  //     //  if (SelectMaterials && SelectMaterials !== "__no_materials__") {
  //     //    f.material = SelectMaterials;
  //     //  }
  //     if (sMaterial && sMaterial !== "__no_materials__") {
  //       const bucket = materialBuckets[sMaterial]; // sMaterial is the name key (lowercased)
  //       if (bucket?.ids?.length) {
  //         f.materials = bucket.ids; // <-- ARRAY OF IDS
  //       }
  //     }
  //     if (selectedPickupLocation && selectedPickupLocation !== "__no_pickups__") {
  //        f.pickups = selectedPickupLocation;
  //      }
  //      if (selectedDeliveryLocation && selectedDeliveryLocation !== "__no_locations__") {
  //        f.deliveries= selectedDeliveryLocation;
  //      }
  //     if (selectedCarrier && selectedCarrier !== "__no_carriers__") {
  //        f.carriers= selectedCarrier;
  //      }
  //      if (dateFrom) f.from_date = dateFrom;   // yyyy-mm-dd
  //      if (dateTo)   f.to_date   = dateTo;
  //   return f;
  // };
  // const buildApiFilters = (overrides?: Partial<{
  //   status: string;
  //   inPlantStage: string;
  //   material: string;
  //   pickups: string;
  //   deliverys: string;
  //   carrier_id: string;
  //   sin: string;           // shipment id
  //   from_date: string;
  //   to_date: string;
  //   vehicle_no: string;
  //   group: string;
  // }>) => {
  //   const f: any = { limit: 50, skip: 0 };
  
  //   const sStatus        = overrides?.status                 ?? selectedStatus;
  //   const sInPlant       = overrides?.inPlantStage           ?? inPlantStage;
  //   const sMaterial      = overrides?.material               ?? SelectMaterials;
  //   const sPickup        = overrides?.pickups     ?? selectedPickupLocation;
  //   const sDelivery      = overrides?.deliveries   ?? selectedDeliveryLocation;
  //   const sCarrier       = overrides?.carrier_id             ?? selectedCarrier;
  //   const sSin           = overrides?.SIN                   ?? shipmentIdSearch;
  //   const sFrom          = overrides?.from                  ?? dateFrom;
  //   const sTo            = overrides?.to                     ?? dateTo;
  //   const sVehicle       = overrides?.vehicle_no             ?? vehicleSearch;
  //   const sGroup         = overrides?.group                  ?? shipmentGroup;
  //   const fromMs = toStartOfDayMs(sFrom);
  // const toMs   = toEndOfDayMs(sTo);
  //   // status
  //   f.status = mapStatusToApi(sStatus);
  
  //   // in-plant event status (array)
  //   if (sStatus === "in_plant") {
  //     const code = mapInPlantStageToEventCode(sInPlant);
  //     if (code) f.event_status = [code];
  //    // keep if backend uses ordering
  //   }
  
  //   // vehicle
  
  
  //   // other filters
  //   if (sSin?.trim())                 f.SIN = sSin.trim().toUpperCase();
  //   // if (sMaterial && sMaterial !== "__no_materials__")           f.material = sMaterial;
  //   if (sMaterial && sMaterial !== "__no_materials__") {
  //     const bucket = materialBuckets[sMaterial]; // sMaterial is the name key (lowercased)
  //     if (bucket?.ids?.length) {
  //       f.materials = bucket.ids;  // <-- ARRAY OF IDS
  //     }
  //   }
  //   if (sPickup && sPickup !== "__no_pickups__")                 f.pickup_location_id = sPickup;
  //   if (sDelivery && sDelivery !== "__no_locations__")           f.delivery_location_id = sDelivery;
  //   if (sCarrier && sCarrier !== "__no_carriers__")              f.carrier_id = sCarrier;
  //   // if (sFrom) f.from = sFrom;
  //   // if (sTo)   f.to  = sTo;
  //   if (sVehicle && sVehicle.trim()) {
  //     f.vehicle_no = sVehicle.trim();
  //   }
  //   if (fromMs !== undefined) f.from = fromMs;
  //   if (toMs   !== undefined) f.to   = toMs;
  
  //   if (sGroup && sGroup !== "all") f.group = sGroup;
  
  //   return f;
  // };

  const handleSearchClearDrafts = () => {
    setFormDrafts({
      materials: "",
      pickupLocation: "",
      deliveryLocation: "",
      carrier: "",
      status: "",
      inPlantStage: "",
      shipmentId: "",
      dateFrom: "",
      dateTo: "",
      vehicle: ""
    });
    
    // Force form reset for any additional form elements
    if (formRef.current) {
      formRef.current.reset();
    }
  };
  

// NEW: apply drafts → live filters, then fetch once
// const handleSearchApply = () => {
//   setSelectedMaterials(draftMaterials);
//   setSelectedPickupLocation(draftPickupLocation);
//   setSelectedDeliveryLocation(draftDeliveryLocation);
//   setSelectedCarrier(draftCarrier);
//   setSelectedStatus(draftStatus || "all");
//   setInPlantStage(draftInPlantStage);
//   setShipmentIdSearch(draftShipmentId);
//   setDateFrom(draftDateFrom);
//   setDateTo(draftDateTo);
//   setVehicleSearch(draftVehicle);

//   // fetchShipments({
//   //   status: draftStatus || "all",
//   //   inPlantStage: draftInPlantStage,
//   //   material: draftMaterials,
//   //   pickup_location_id: draftPickupLocation,
//   //   delivery_location_id: draftDeliveryLocation,
//   //   carrier_id: draftCarrier,
//   //   sin: draftShipmentId,
//   //   from_date: draftDateFrom,
//   //   to_date: draftDateTo,
//   //   vehicle_no: draftVehicle,
//   //   group: shipmentGroup || "all",
//   // });

//   setIsFilterOpen(false);
// };
// mapview.tsx

const handleSearchApply = () => {
    const filters: any = { limit: 50, skip: 0 };
    
    filters.status = mapStatusToApi(formDrafts.status || "all");
    
    if (formDrafts.status === 'in_plant') {
      const code = mapInPlantStageToEventCode(formDrafts.inPlantStage);
      if (code) filters.event_status = [code];
    }
  
    if (formDrafts.shipmentId.trim()) {
      filters.sin = formDrafts.shipmentId.trim().toUpperCase();
    }
  
    if (formDrafts.materials && formDrafts.materials !== "__no_materials__") {
      const bucket = materialBuckets[formDrafts.materials];
      if (bucket?.ids?.length) {
        filters.materials = bucket.ids;
      }
    }
  
    if (formDrafts.pickupLocation && formDrafts.pickupLocation !== "__no_pickups__") {
      filters.pickups = formDrafts.pickupLocation;
    }
  
    if (formDrafts.deliveryLocation && formDrafts.deliveryLocation !== "__no_locations__") {
      filters.deliveries = formDrafts.deliveryLocation;
    }
  
    if (formDrafts.carrier && formDrafts.carrier !== "__no_carriers__") {
      filters.carriers = formDrafts.carrier;
    }
  
    if (formDrafts.vehicle.trim()) {
      filters.vehicle_no = formDrafts.vehicle.trim();
    }
  
    if (formDrafts.dateFrom) filters.from = toStartOfDayMs(formDrafts.dateFrom);
    if (formDrafts.dateTo) filters.to = toEndOfDayMs(formDrafts.dateTo);
  
    // Update the main filter state
    setSelectedMaterials(formDrafts.materials);
    setSelectedPickupLocation(formDrafts.pickupLocation);
    setSelectedDeliveryLocation(formDrafts.deliveryLocation);
    setSelectedCarrier(formDrafts.carrier);
    setSelectedStatus(formDrafts.status);
    setInPlantStage(formDrafts.inPlantStage);
    setShipmentIdSearch(formDrafts.shipmentId);
    setDateFrom(formDrafts.dateFrom);
    setDateTo(formDrafts.dateTo);
    setVehicleSearch(formDrafts.vehicle);
  
    fetchShipments(filters);
    setIsFilterOpen(false);
  };
// NEW: cancel just closes and restores drafts to current live filters
const handleSearchCancel = () => {
    setFormDrafts({
      materials: SelectMaterials ?? "",
      pickupLocation: selectedPickupLocation ?? "",
      deliveryLocation: selectedDeliveryLocation ?? "",
      carrier: selectedCarrier ?? "",
      status: selectedStatus ?? "",
      inPlantStage: inPlantStage ?? "",
      shipmentId: shipmentIdSearch ?? "",
      dateFrom: dateFrom ?? "",
      dateTo: dateTo ?? "",
      vehicle: vehicleSearch ?? ""
    });
    setIsFilterOpen(false);
  };

  useEffect(() => {
    if (!mapRef || !Array.isArray(unitLocations) || unitLocations.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    let added = 0;
  
    unitLocations.forEach((loc: any) => {
      const pos = toLatLng(loc);
      if (pos) {
        bounds.extend(pos);
        added++;
      }
    });
  
    if (added) mapRef.fitBounds(bounds, 64);
  }, [mapRef, unitLocations]);
  
  // useEffect(() => {
  //   const fetchShipments = async () => {
  //     setLoading(true);
  //     setError(null);
  
  //     const filters = buildApiFilters();
  //     try {
  //       const res = await httpsPost("shipment/many", filters, {}, 5);
  
  //       // Shape-safe extraction
  //       const shipments =
  //         res?.data?.data?.shipments ??
  //         res?.data?.shipments ??
  //         res?.shipments ??
  //         [];
  
  //       if (!Array.isArray(shipments)) {
  //         console.warn("Unexpected shipments shape:", res);
  //         setError("Unexpected API response.");
  //         setShipmentsData([]);
  //         setTotalShipments(0);
  //         setTrackingCount(0);
  //         setNonTrackingCount(0);
  //       } else {
  //         setShipmentsData(shipments);
  //         let tracking = 0;
  //         let nonTracking = 0;
    
  //         shipments.forEach((shipment) => {
  //           // Check for location data in the assigned_driver object
  //           const hasLocation =
  //             shipment.assigned_driver &&
  //             shipment.assigned_driver.geo_point &&
  //             shipment.assigned_driver.geo_point.coordinates &&
  //             shipment.assigned_driver.geo_point.coordinates.length > 0;
    
  //           if (hasLocation) {
  //             tracking += 1;
  //           } else {
  //             nonTracking += 1;
  //           }
  //         });
    
  //         // Update state with the calculated counts
  //         setShipmentsData(shipments);
  //         setTotalShipments(shipments.length);
  //         setTrackingCount(tracking);
  //         setNonTrackingCount(nonTracking);
  //       }
        
  
  //     } catch (e: any) {
  //       console.error("Error fetching shipments:", e);
  //       setError(e?.message || "Could not load shipments.");
  //       setShipmentsData([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  
  //   fetchShipments();
  // }, [  vehicleSearch ,SelectMaterials,
  //   selectedDeliveryLocation,
  //   selectedCarrier,
  //   inPlantStage,  
   
  //   shipmentGroup, selectedStatus ]);
 
  // const fetchShipments = async () => {
  //   setLoading(true);
  //   setError(null);
  
  //   try {
  //     const filters: any = { limit: 50, skip: 0 };
  //     const fromMs = toStartOfDayMs(dateFrom);
  //     const toMs = toEndOfDayMs(dateTo);
  
  //     filters.status = mapStatusToApi(selectedStatus);
  //     if (selectedStatus === 'in_plant') {
  //       const code = mapInPlantStageToEventCode(inPlantStage);
  //       if (code) filters.event_status = [code];
  //     }
  //     if (shipmentIdSearch.trim()) {
  //       filters.sin = shipmentIdSearch.trim().toUpperCase();
  //     }
  //     if (SelectMaterials && SelectMaterials !== "__no_materials__") {
  //       const bucket = materialBuckets[SelectMaterials];
  //       if (bucket?.ids?.length) {
  //         filters.materials = bucket.ids;
  //       }
  //     }
  //     if (selectedPickupLocation && selectedPickupLocation !== "__no_pickups__") {
  //       filters.pickups = selectedPickupLocation;
  //     }
  //     if (selectedDeliveryLocation && selectedDeliveryLocation !== "__no_locations__") {
  //       filters.deliveries = selectedDeliveryLocation;
  //     }
  //     if (selectedCarrier && selectedCarrier !== "__no_carriers__") {
  //       filters.carriers = selectedCarrier;
  //     }
  //     if (vehicleSearch.trim()) {
  //       filters.vehicle_no = vehicleSearch.trim();
  //     }
  //     if (fromMs !== undefined) filters.from = fromMs;
  //     if (toMs !== undefined) filters.to = toMs;
  //     if (shipmentGroup && shipmentGroup !== "all") filters.group = shipmentGroup;
  
  //     const res = await httpsPost("shipment/many", filters, {}, 5);
  //     const shipments = res?.data?.data?.shipments ?? res?.data?.shipments ?? res?.shipments ?? [];
  
  //     if (!Array.isArray(shipments)) {
  //       setError("Unexpected API response.");
  //       setShipmentsData([]);
  //       setTotalShipments(0);
  //       setTrackingCount(0);
  //       setNonTrackingCount(0);
  //       return;
  //     }
  
  //     let tracking = 0, nonTracking = 0;
  //     shipments.forEach((s) => {
  //       const coords = s.assigned_driver?.geo_point?.coordinates ?? [];
  //       coords.length ? tracking++ : nonTracking++;
  //     });
  
  //     setShipmentsData(shipments);
  //     setTotalShipments(shipments.length);
  //     setTrackingCount(tracking);
  //     setNonTrackingCount(nonTracking);
  //   } catch (e: any) {
  //     console.error("Error fetching shipments:", e);
  //     setError(e?.message || "Could not load shipments.");
  //     setShipmentsData([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // mapview.tsx
// mapview.tsx

const buildApiFilters = () => {
  const f: any = { limit: 100, skip: 0 };
  const fromMs = toStartOfDayMs(dateFrom);
  const toMs = toEndOfDayMs(dateTo);

  // Apply filters from component state
  f.status = mapStatusToApi(selectedStatus);
  if (selectedStatus === 'in_plant') {
    const code = mapInPlantStageToEventCode(inPlantStage);
    if (code) f.event_status = [code];
  }
  if (shipmentIdSearch.trim()) {
    f.SIN = shipmentIdSearch.trim().toUpperCase();
  }
  if (SelectMaterials && SelectMaterials !== "__no_materials__") {
    const bucket = materialBuckets[SelectMaterials];
    if (bucket?.ids?.length) {
      f.materials = bucket.ids;
    }
  }
  if (selectedPickupLocation && selectedPickupLocation !== "__no_pickups__") {
    f.pickups = selectedPickupLocation;
  }
  if (selectedDeliveryLocation && selectedDeliveryLocation !== "__no_locations__") {
    f.deliveries= selectedDeliveryLocation;
  }
  if (selectedCarrier && selectedCarrier !== "__no_carriers__") {
    f.carriers = selectedCarrier;
  }
  if (vehicleSearch.trim()) {
    f.vehicle_no = vehicleSearch.trim();
  }
  if (fromMs !== undefined) f.from = fromMs;
  if (toMs !== undefined) f.to = toMs;
  // if (shipmentGroup && shipmentGroup !== "all") f.group = shipmentGroup;

  return f;
};
const fetchShipments = async (appliedFilters?: any) => {
  setLoading(true);
  setError(null);

  try {
    // Use the provided filters if available, otherwise build from current state
    // const filters = appliedFilters || buildApiFilters();
// after — always run through the builder so we map names → ids
const filters = buildApiFilters();

    const res = await httpsPost("shipment/many", filters, {}, 5);
   const shipments = res?.data?.data?.shipments ?? res?.data?.shipments ?? res?.shipments ?? [];

    if (!Array.isArray(shipments)) {
      setError("Unexpected API response.");
      setShipmentsData([]);
      setTotalShipments(0);
      setTrackingCount(0);
      setNonTrackingCount(0);
      return;
    }
  
    let tracking = 0, nonTracking = 0;
    shipments.forEach((s:any) => {
      const coords = s.assigned_driver?.geo_point?.coordinates ?? [];
      coords.length ? tracking++ : nonTracking++;
    });

    setShipmentsData(shipments);
    setTotalShipments(shipments.length);
    setTrackingCount(tracking);
    setNonTrackingCount(nonTracking);
  } catch (e: any) {
    console.error("Error fetching shipments:", e);
    setError(e?.message || "Could not load shipments.");
    setShipmentsData([]);
  } finally {
    setLoading(false);
  }
};
  function directionIconFor(s: Shipment): string | null {
    const from = driverPos(s);
    const to = firstPickupLatLng(s);
    if (!from || !to) return null;
  
    const dir = cardinalDirection(from, to); // returns "N", "E", "S", "W", or "C"
    const map: Record<string, any> = {
      N: dirN,
      E: dirE,
      S: dirS,
      W: dirW,
      C: dirC,
    };
  
    return srcOf(map[dir]) ?? null;
  }
  // const { isLoaded } = useJsApiLoader({
  //   id: "google-map-script",
  //   googleMapsApiKey: apiKey ?? "",
  //   libraries: ["geometry"], // ← add this
  // });
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey ?? "",
    libraries: ["geometry"],
  });
  
  // const { isLoaded, loadError } = useJsApiLoader({
  //   id: "google-map-script",
  //   googleMapsApiKey: apiKey ?? "",
  // });

  // Default to 'In Transit' or 'In Plant'
  
  // const handleStatusChange = (event) => {
  //   setSelectedStatus(event.target.value);
  // };
  // If you must keep it, change the definition to this:
const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
  setSelectedStatus(event.target.value);
};
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // helper to normalize a location into {name, city}
const stopFromLoc = (loc?: any) => {
  const name = (loc?.name || loc?.area || loc?.city || "—").toString().trim();
  const city = (loc?.city || "").toString().trim();
  return { name, city };
};

// build arrays for pickups / deliveries
const makeStops = (arr: any[] | undefined, kind: "pickup" | "delivery") =>
  (arr ?? []).map((item, i) => {
    const { name, city } = stopFromLoc(item?.location);
    return {
      key: item?._id ?? `${kind}-${i}`,
      label: `${kind === "pickup" ? "P" : "D"}${i + 1}`,
      name,
      city,
      kind,
    };
  });

// --- Bounds helpers ---
const lastGeofenceBoundsRef = useRef<google.maps.LatLngBounds | null>(null);

function getIndiaBounds() {
  const b = new google.maps.LatLngBounds();
  b.extend({ lat: 5,    lng: 68  });
  b.extend({ lat: 38.9, lng: 98  });
  return b;
}

function collectBounds(): google.maps.LatLngBounds | null {
  if (!mapRef) return null;
  const b = new google.maps.LatLngBounds();

  // 1) Vehicles (visible list)
  for (const s of visibleShipments || []) {
    const p = driverPos(s);
    if (p) b.extend(p);
  }

  // 2) Selected shipment P/D
  const p = selectedShipment?.pickups?.[0]?.location;
  const d = selectedShipment?.deliveries?.slice(-1)?.[0]?.location;
  if (p?.lat && p?.lng) b.extend({ lat: Number(p.lat), lng: Number(p.lng) });
  if (d?.lat && d?.lng) b.extend({ lat: Number(d.lat), lng: Number(d.lng) });

  // 3) Paths + halts (respect current visibility)
  const pushPts = (arr: any[]) =>
    (arr || []).map(toLatLng).filter(Boolean).forEach((pt: any) => b.extend(pt));
  if (pathData) {
    if (pathVisible.gps) pushPts(pathData.gps);
    if (pathVisible.app) pushPts(pathData.app);
    if (pathVisible.sim) pushPts(pathData.sim);
    (pathData.haltData || []).map(toLatLng).filter(Boolean).forEach((pt: any) => b.extend(pt));
  }

  // 4) Geofences (bounds captured when drawing)
  if (lastGeofenceBoundsRef.current && !lastGeofenceBoundsRef.current.isEmpty()) {
    b.union(lastGeofenceBoundsRef.current);
  }

  return b.isEmpty() ? null : b;
}

const fitAll = useCallback((pad = 64) => {
  if (!mapRef) return;
  const b = collectBounds();
  if (b) mapRef.fitBounds(b, pad);
  else   mapRef.fitBounds(getIndiaBounds(), pad); // fallback
}, [mapRef, visibleShipments, selectedShipment, pathData, pathVisible]);

 
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsFilterOpen(false);
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  },[isFilterOpen]); 
  const handleClear = () => formRef.current?.reset();

  // function geoFenceToPolygons(gf: GeoFence): google.maps.LatLngLiteral[][][] {
  //   const type = gf.type.toLowerCase();
  //   if (type === "polygon") {
  //     // Polygon → array of rings → paths: [outer, hole1, ...]
  //     const rings = (gf as any).coordinates as number[][][];
  //     const paths = rings.map(ringToPath).filter(r => r.length >= 3);
  //     return paths.length ? [paths] : [];
  //   }
  //   if (type === "multipolygon") {
  //     // MultiPolygon → array of polygons → each polygon is array of rings
  //     const polys = (gf as any).coordinates as number[][][][];
  //     const out: google.maps.LatLngLiteral[][][] = [];
  //     for (const rings of polys) {
  //       const paths = (rings || []).map(ringToPath).filter(r => r.length >= 3);
  //       if (paths.length) out.push(paths);
  //     }
  //     return out;
  //   }
  //   return [];
  // }
  useEffect(() => {
    console.log("Maps loader:", { isLoaded, loadError, hasKey: Boolean(apiKey) });
    if (loadError) console.error("Maps load error:", loadError);
  }, [isLoaded, loadError, apiKey]);
  const handleSupport = () => {
    window.open("https://ticket.instavans.com/", "_blank", "noopener,noreferrer");
  };
  useEffect(() => {
    console.log("--- DEBUG START ---");
    console.log("1. Map API isLoaded:", isLoaded);
    console.log("2. Map loadError:", loadError);
    console.log("3. Map Ref initialized:", !!mapRef);
    console.log("4. GeoFences State Size:", geoFences.length);
    
    if (isLoaded && mapRef && geoFences.length > 0) {
        console.log("--- READY TO DRAW ---");
    }
    
  }, [isLoaded, loadError, mapRef, geoFences]);
  const handleShipmentClick = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsSidebarOpen(true); // Assuming you want to open the sidebar on click
    // Optionally, close the menu if it was open
    if (menu.open) closeActionMenu();
  };
  // Replace the existing useEffect:
// useEffect(() => {
//   if (!mapRef) return;                 
//   if (!geoFences || geoFences.length === 0) return;

//   // *** CHANGE: Call the correct function name ***
//   const { added, bounds } = drawGeoFencesOnMap(geoFences, mapRef); // <--- CORRECTED FUNCTION CALL
  
//   if (added && !bounds.isEmpty()) mapRef.fitBounds(bounds, 64); // Use 'added' flag
// Collect Lat/Lngs for all visible vehicles
function vehiclesLatLngs(list: Shipment[]): google.maps.LatLngLiteral[] {
  const pts: google.maps.LatLngLiteral[] = [];
  for (const s of list || []) {
    const p = driverPos(s);                 // you already have this helper
    if (p) pts.push(p);
  }
  return pts;
}
useEffect(() => {
  if (!mapRef) return;
  fitToAllVehicles(visibleShipments);
}, [mapRef, visibleShipments, selectedStatus, activeLegend]);

function fitToAllVehicles(list: Shipment[] = visibleShipments) {
  const map = mapRef;
  if (!map) return;

  const b = new google.maps.LatLngBounds();
  const pts = vehiclesLatLngs(list);
  pts.forEach((p) => b.extend(p));

  if (!b.isEmpty()) {
    map.fitBounds(b, 64);
  } else {
    // sensible India fallback so you don't end up in the Atlantic
    const sw = new google.maps.LatLng(INDIA_BBOX.minLat, INDIA_BBOX.minLng);
    const ne = new google.maps.LatLng(INDIA_BBOX.maxLat, INDIA_BBOX.maxLng);
    map.fitBounds(new google.maps.LatLngBounds(sw, ne), 64);
  }
}

// }, [geoFences, mapRef]);
  return (
    <div className={styles.wrapper}>
      
      {/* Cancel */}
{modal.type === "cancel" && (
  
  <CancelModal
    open={true} // The modal is open
    onClose={closeModal} // Pass the function to close the modal
    shipment={modal.shipment!} // The shipment object
    onCancelSuccess={fetchShipments} // Pass a function to refresh the data after a successful cancellation
  />
)}


 {/* {modal.type === "share" && (
  <ShareModal
    open
    onClose={closeModal}
    shipment={modal.shipmentId!}
  />
 
)} */}
{modal.type === "share" && (
  <ShareModal
    open
    onClose={closeModal}
    trackingUrl={`${(typeof window !== "undefined" ? window.location.origin : "")}/tracking/${modal.shipment.sin}`}
  />
)}


{/* Mail */}
{modal.type === "mail" && (
  <MailModal
    open
    onClose={closeModal}
    shipment={modal.shipment!}
  />
)}

{/* Upload Approval Documents */}


{/* Create Advance Payment */}
{/* {modal.type === "upload" && (
  <AttachFilesModal
    show={true}
    onClose={closeModal}
    onAttach={handleAttachDone}
    // shipment={modal.shipment!}
    shipmentId={modal.shipment!} 
    isLoading={false}
  />
 
)} */}
{modal.type === "upload" && (
  <AttachFilesModal
    show
    onClose={closeModal}
    onAttach={handleAttachDone}         // () => void
    shipmentId={modal.shipmentId}       // string
    isLoading={false}
  />
)}

{/* {modal.type === "advance" && (
  <CreateAdvancePaymentModal 
    show={true}
    onClose={closeModal}
    onSubmit={handleCreateAdvance}
    shipmentId={modal.shipment!}
    data={undefined}   // or pass your initial data object if needed
  />
)} */}
{modal.type === "advance" && (
  <CreateAdvancePaymentModal
    show
    onClose={closeModal}
    onSubmit={handleCreateAdvance}
    shipmentId={modal.shipmentId}       // string
    // data={undefined}
    data={{}} 
  />
)}

      {/* Control bar */}
      <div className={styles.controls}>
      <div className={styles.headerBar}>
  <h2 className={styles.title}>CONSOLIDATED MAP VIEW</h2>

  <div className={styles.searchWrap}>

    <span className={styles.searchIcon}><img src={searchIcon.src ?? searchIcon} alt="Search" className={styles.searchIcon} />
    </span>
    <input
      type="text"
      value={vehicleSearch}
      className={styles.searchInput}
      placeholder="Search Vehicle No"
      onChange={(e) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        setVehicleSearch(value);
        // optional: reset page if you paginate
        // setCurrentPage(0);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          // fire immediately on Enter
          fetchShipments();
        }
      }}
    />
     <button
            type="button"
            className={styles.filterBtn}
            aria-haspopup="dialog"
            aria-controls="filterDialog"
            aria-expanded={isFilterOpen}
            onClick={() => {
                console.log("filter click"); 
                setIsFilterOpen(true)
              openFiltersWithSnapshot()
            }}
             title="Open filters"
          >
            <img src={(filterIcon as any).src ?? (filterIcon as any)} alt="" />
          </button>
   
  </div>
  <Link href="/shipmentsDashboard">
  <button className={styles.shipmentsBtn}>Vehicles By Shipments</button>
  </Link>
</div>

<div style={{ display: "flex", justifyContent: "space-between" }}>
  <div>
    <div className={styles.controlsRow}>
      <div className={styles.noTicks}>
        <Select value={shipmentGroup} onValueChange={setShipmentGroup}>
          <SelectTrigger className={styles.select}>
            <SelectValue placeholder="All Shipments" className={styles.selectValue} />
          </SelectTrigger>
          <SelectContent className={styles.selectContent}>
            <SelectItem value="all" className={styles.selectItem}>All Shipments</SelectItem>
            <SelectItem value="outbound" className={styles.selectItem}>Outbound Shipments</SelectItem>
            <SelectItem value="inbound" className={styles.selectItem}>Inbound Shipments</SelectItem>
            <SelectItem value="other" className={styles.selectItem}>Other Shipments</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className={styles.select}>
          <SelectValue placeholder="Towards Pickup" className={styles.selectValue} />
        </SelectTrigger>
        <SelectContent className={styles.selectContent}>
          <SelectItem value="towards_pickup" className={styles.selectItem}>Towards Pickup</SelectItem>
          <SelectItem value="in_plant" className={styles.selectItem}>In Plant</SelectItem>
          <SelectItem value="in_transit" className={styles.selectItem}>In Transit</SelectItem>
          <SelectItem value="at_delivery" className={styles.selectItem}>At Delivery</SelectItem>
          <SelectItem value="all" className={styles.selectItem}>All</SelectItem>
        </SelectContent>
      </Select>
      
      {selectedStatus === 'towards_pickup' && (
        <Select>
          <SelectTrigger className={styles.select}>
            <SelectValue placeholder="Estimated arrival in" className={styles.selectValue} />
          </SelectTrigger>
          <SelectContent className={styles.selectContent}>
            <SelectItem value="2000" className={styles.selectItem}>24 hours</SelectItem>
            <SelectItem value="3000" className={styles.selectItem}>48 hours</SelectItem>
            <SelectItem value="4000" className={styles.selectItem}>72 hours</SelectItem>
          </SelectContent>
        </Select>
      )}
      
      {selectedStatus === 'in_plant' && (
        <Select value={inPlantStage} onValueChange={setInPlantStage}>
          <SelectTrigger className={styles.select}>
            <SelectValue placeholder="Event status" className={styles.selectValue}/>
          </SelectTrigger>
          <SelectContent className={styles.selectContent}>
            <SelectItem value="PO" className={styles.selectItem}>Parking Out - Gate In</SelectItem>
            <SelectItem value="GI" className={styles.selectItem}>Gate In - Tare Weight</SelectItem>
            <SelectItem value="TW" className={styles.selectItem}>Tare Weight - Gross Weight</SelectItem>
            <SelectItem value="GW" className={styles.selectItem}>Gross Weight - Post Goods</SelectItem>
            <SelectItem value="PG" className={styles.selectItem}>Post Goods - Test Certificate</SelectItem>
            <SelectItem value="TC" className={styles.selectItem}>Test Certificate - Invoice</SelectItem>
            <SelectItem value="IV" className={styles.selectItem}>Invoice - Ewaybill</SelectItem>
            <SelectItem value="EW" className={styles.selectItem}>Ewaybill</SelectItem>
          </SelectContent>
        </Select>
      )}
      
      {selectedStatus !== 'towards_pickup' && selectedStatus !== 'all' && (
        <Select 
          value={SelectMaterials || undefined} 
          onValueChange={(value) => {
            setSelectedMaterials(value);
            // Let useEffect handle the API call
          }}
        >
          <SelectTrigger className={styles.select}>
            <SelectValue placeholder="Materials" className={styles.selectValue}/>
          </SelectTrigger>
          <SelectContent className={styles.selectContent}>
            {materialsList.length === 0 ? (
              <SelectItem value="__no_materials__" disabled className={styles.selectItem}>
                No materials found
              </SelectItem>
            ) : (
              materialsList.map((m) => (
                <SelectItem key={m.key} value={m.key} className={styles.selectItem}>
                  {m.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
      
      {(selectedStatus === 'in_transit' || selectedStatus === 'at_delivery') && (
        <>
          <Select 
            value={selectedDeliveryLocation || undefined} 
            onValueChange={(value) => {
              setSelectedDeliveryLocation(value);
              // Let useEffect handle the API call
            }}
          >
            <SelectTrigger className={styles.select}>
              <SelectValue placeholder="Customer Location" className={styles.selectValue}/>
            </SelectTrigger>
            <SelectContent className={styles.selectContent}>
              {deliveryLocationsList.length === 0 ? (
                <SelectItem value="__no_locations__" disabled className={styles.selectItem}>
                  No locations found
                </SelectItem>
              ) : (
                deliveryLocationsList.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id} className={styles.selectItem}>
                    {loc.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedCarrier || undefined} 
            onValueChange={(value) => {
              setSelectedCarrier(value);
            }}
          >
            <SelectTrigger className={styles.select}>
              <SelectValue placeholder="Carrier" className={styles.selectValue}/>
            </SelectTrigger>
            <SelectContent className={styles.selectContent}>
              {carriersList.length === 0 ? (
                <SelectItem value="__no_carriers__" disabled className={styles.selectItem}>
                  No carriers found
                </SelectItem>
              ) : (
                carriersList.map((c) => (
                  <SelectItem key={c.id} value={c.id} className={styles.selectItem}>
                    {c.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
    
    {/* Right side controls */}
    <div className={styles.controlsRowRight}>
      {selectedStatus === 'in_transit' && ( 
        <Select>
          <SelectTrigger className={styles.select}>
            <SelectValue placeholder="ETA" className={styles.selectValue}/>
          </SelectTrigger>
          <SelectContent className={styles.selectContent}>
            <SelectItem value="within" className={styles.selectItem}>Within ETA</SelectItem>
            <SelectItem value="beyond" className={styles.selectItem}>Beyond ETA</SelectItem>
          </SelectContent>
        </Select>
      )}
      
      {selectedStatus === 'at_delivery' && (
        <Select>
          <SelectTrigger className={styles.select}>
            <SelectValue placeholder="Detention" className={styles.selectValue}/>
          </SelectTrigger>
          <SelectContent className={styles.selectContent}>
            <SelectItem value="0" className={styles.selectItem}>0 - 12 Hours</SelectItem>
            <SelectItem value="12" className={styles.selectItem}>12 - 24 Hours</SelectItem>
            <SelectItem value="24" className={styles.selectItem}>Beyond 24 Hours</SelectItem>
          </SelectContent>
        </Select>
      )}
      
      {selectedStatus === 'in_transit' && ( 
        <Select>
          <SelectTrigger className={styles.select}>
            <SelectValue placeholder="Delay" className={styles.selectValue}/>
          </SelectTrigger>
          <SelectContent className={styles.selectContent}>
            <SelectItem value="2" className={styles.selectItem}>2–4 hrs</SelectItem>
            <SelectItem value="4" className={styles.selectItem}>4–8 hrs</SelectItem>
            <SelectItem value="8" className={styles.selectItem}>8–12 hrs</SelectItem>
            <SelectItem value="12" className={styles.selectItem}>12-16 hrs</SelectItem>
            <SelectItem value="16" className={styles.selectItem}>16–20 hrs</SelectItem>
            <SelectItem value="20" className={styles.selectItem}>Beyond 20hrs</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  </div>
  
  {/* Shipment tracking stats */}
  <div className={styles.shipmentrack}>
    <div className={styles.totalShipments}>
      <span className={styles.totalLabel}>Total Shipments</span>
      <span className={styles.totalValue}>
        {totalShipments}
      </span>
    </div>
    
    {selectedStatus !== 'in_transit' && (
      <div className={styles.totalShipments}>
        <span className={styles.totalLabel}>Tracking</span>
        <span className={styles.totalValue}>
          {trackingCount}
        </span>
      </div>
    )}
    
    {selectedStatus !== 'in_transit' && (
      <div className={styles.totalShipments}>
        <span className={styles.totalLabel}>Non Tracking</span>
        <span className={styles.totalValue}>
          {nonTrackingCount}
        </span>
      </div>
    )}
  </div>
</div>

      </div>

      {/* Map */}
      <div className={styles.mapCard}>
        {!apiKey && (
          <div className={styles.alert}>
            Missing <code>NEXT_PUBLIC_GOOGLE_MAPS_KEY</code>
          </div>
        )}
        {loadError && (
          <div className={styles.alert}>Failed to load Google Maps.</div>
        )}
        <div className={styles.mapCard}>
        {LEGEND_ITEMS[selectedStatus as StatusTab]?.length > 0 && (
  <div className={styles.legendBar} aria-label="ETA legend">
  {selectedStatus === "towards_pickup" && (
    <>
      {[{k:"N",l:"North",i:dirN},{k:"E",l:"East",i:dirE},{k:"S",l:"South",i:dirS},{k:"W",l:"West",i:dirW},{k:"C",l:"Center",i:dirC}]
        .map(({k,l,i}) => (
          <span key={k} className={styles.legendItem}>
            <img className={styles.legendIcon} src={srcOf(i)} alt="" />
            <span className={styles.legendText}>{l}</span>
          </span>
        ))}
    </>
  )}

  {selectedStatus === "in_plant" && (
    <>
      {EVENT_STATUS_ORDER.map(code => (
        <span key={code} className={styles.legendItem}>
          <img className={styles.legendIcon} src={srcOf(INPLANT_ICON[code])} alt="" />
          <span className={styles.legendText}>{INPLANT_LABEL[code]}</span>
        </span>
      ))}
    </>
  )}

  {/* {selectedStatus === "at_delivery" && (
    <>
      {[{k:"0-12",l:"0–12 hrs",i:det_0_12},
        {k:"12-24",l:"12–24 hrs",i:det_12_24},
        {k:"24+",l:"Beyond 24 hrs",i:det_24_plus}].map(({k,l,i}) => (
        <span key={k} className={styles.legendItem}>
          <img className={styles.legendIcon} src={srcOf(i)} alt="" />
          <span className={styles.legendText}>{l}</span>
        </span>
      ))}
    </>
  )} */}
  {selectedStatus === "at_delivery" && (
  <>
    {[
      { k: "0-12",  l: "0–12 hrs",      i: det_0_12 },
      { k: "12-24", l: "12–24 hrs",     i: det_12_24 },
      { k: "24+",   l: "Beyond 24 hrs", i: det_24_plus },
    ].map(({ k, l, i }) => (
      <button
        key={k}
        type="button"
        className={`${styles.legendItem} ${activeLegend === k ? styles.legendActive : ""}`}
        onClick={() => setActiveLegend(activeLegend === k ? null : (k as LegendKey))}
        aria-pressed={activeLegend === k}
        title={l}
      >
        <img className={styles.legendIcon} src={srcOf(i)} alt="" />
        <span className={styles.legendText}>{l}</span>
      </button>
    ))}
  </>
)}

    {/* {selectedStatus === "all" && (
      <>
      {[
        { key: "in_plant", label: "In Plant", icon: catInPlant },
        { key: "towards_pickup", label: "Towards Pickup", icon: catTowardsPickup },
        { key: "in_transit", label: "In Transit", icon: catInTransit },
        { key: "at_delivery", label: "At Delivery", icon: catAtDelivery },
      ].map(({ key, label, icon }) => (
        <span key={key} className={styles.legendItem}>
          <img className={styles.legendIcon} src={srcOf(icon)} alt="" />
          <span className={styles.legendText}>{label}</span>
        </span>
      ))}
    </>
    )} */}
{selectedStatus === "all" && (
  <>
    {[
      { k: "ALL_IN_PLANT", label: "In Plant",        icon: catInPlant },
      { k: "ALL_TP",       label: "Towards Pickup",  icon: catTowardsPickup },
      { k: "ALL_IT",       label: "In Transit",      icon: catInTransit },
      { k: "ALL_AD",       label: "At Delivery",     icon: catAtDelivery },
    ].map(({ k, label, icon }) => (
      <button
        key={k}
        type="button"
        className={`${styles.legendItem} ${activeLegend === k ? styles.legendActive : ""}`}
        onClick={() => setActiveLegend(activeLegend === k ? null : (k as LegendKey))}
        aria-pressed={activeLegend === k}
        title={label}
      >
        <img className={styles.legendIcon} src={srcOf(icon)} alt="" />
        <span className={styles.legendText}>{label}</span>
      </button>
    ))}
  </>
)}
{selectedStatus === "in_transit" && (
  <div className={styles.legendRow}>
    {STATUS_ITEMS.map(({ key, label, icon }) => (
      <button
        key={key}
        type="button"
        className={`${styles.legendItem} ${activeLegend === key ? styles.legendActive : ""}`}
        onClick={() => setActiveLegend(prev => (prev === key ? null : key))}
        aria-pressed={activeLegend === key}
        title={label}
      >
        <img
          className={styles.legendIcon}
          src={(icon as any).src ?? (icon as any)}
          alt=""
        />
        <span className={styles.legendText}>{label}</span>
      </button>
    ))}
  </div>
)}

  {/* {selectedStatus === "in_transit" && (
  // 1) type the items so `key` is LegendKey (not plain string)
const STATUS_ITEMS = [
  { key: "on",   label: "On Time",         icon: ontime },
  { key: "2-4",  label: "2 - 4 Hours",     icon: twotofour },
  { key: "4-8",  label: "4 - 8 Hours",     icon: fourtoeight },
  { key: "8-12", label: "8 - 12 Hours",    icon: eighttotwelve },
  { key: "12-16",label: "12 - 16 Hours",   icon: twelvetosixteen },
  { key: "16-20",label: "16 - 20 Hours",   icon: sixteentotwenty },
  { key: "20+",  label: "Beyond 20 Hours", icon: beyondtwenty },
] satisfies Array<{ key: LegendKey; label: string; icon: any }>

// 2) render (note: only one leading `{`, not `{{`)
{STATUS_ITEMS.map(({ key, label, icon }) => (
  <button
    key={key}
    type="button"
    className={`${styles.legendItem} ${activeLegend === key ? styles.legendActive : ""}`}
    onClick={() => setActiveLegend(prev => (prev === key ? null : key))}
    aria-pressed={activeLegend === key}
    title={label}
  >
    <img
      className={styles.legendIcon}
      src={(icon as any).src ?? (icon as any)}
      alt=""
    />
    <span className={styles.legendText}>{label}</span>
  </button>
))} */}

  
</div>)}
<button
  type="button"
  className={styles.supportBtn}

    // hook this up to your support flow
    onClick={handleSupport} 
  
>
  Support
</button>


        {isLoaded && (
        
          <GoogleMap
            // onLoad={(map) => {
            //   setMapRef(map);
            //   map.setCenter({ lat: 22.9734, lng: 78.6569 }); // India-ish
            //   map.setZoom(5);
             
            // }}
            onLoad={(m) => { setMapRef(m); m.fitBounds(getIndiaBounds(), 64); }}
            onUnmount={() => setMapRef(null)}
            // mapContainerStyle={CONTAINER_STYLE}
            mapContainerStyle={containerStyle}
            // center={center}
            // defaultCenter={{ lat: 22.9734, lng: 78.6569 }} // India fallback
            // defaultZoom={5}
            // defaultCenter={{ lat: 22.9734, lng: 78.6569 }} // fallback
            // zoom={5}
            options={{
                streetViewControl: false,
                fullscreenControl: true,
                mapTypeControl: true,
                mapTypeControlOptions: {
                  style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,   // ← dropdown like your screenshot
                  position: google.maps.ControlPosition.TOP_LEFT,          // ← top-left
                  mapTypeIds: ["roadmap", "satellite", "terrain"],         // ← include Terrain
                },
              }}
         
          >
             {/* <GeofenceLayer map={map} fences={fences} /> */}
          
<GeofenceLayer
  map={mapRef}
  fences={(geoFences || [])
    .map((it: any) => it?.geo_fence) // unwrap
    .filter((gf: any) => gf && (gf.type === "Polygon" || gf.type === "MultiPolygon"))}
/>

             {/* {unitLocations?.map((loc: any) => {
    const pos = toLatLng(loc);
    if (!pos) return null;
    return (
      <Marker
        key={loc._id ?? loc.token ?? `${pos.lat},${pos.lng}`}
        position={pos}
       
      />
    );
  })} */}
  {/* {mapRef && activeHalt && haltInfoPos && (
  <InfoWindow
    position={haltInfoPos}
    onCloseClick={() => { setActiveHalt(null); setHaltInfoPos(null); }}
  >
    <div style={{ maxWidth: 240 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Halt</div>
      <div><b>Duration:</b> {activeHalt?.halt_duration ?? activeHalt?.duration ?? "-"} mins</div>
      <div><b>Start:</b> {fmtTime(activeHalt?.start_time || activeHalt?.from)}</div>
      <div><b>End:</b> {fmtTime(activeHalt?.end_time || activeHalt?.to)}</div>
      {activeHalt?.address ? <div style={{ marginTop: 4 }}>{activeHalt.address}</div> : null}
    </div>
  </InfoWindow>
)} */}
{/* Halt InfoWindow */}
{/* {mapRef && activeHalt && haltInfoPos && (
  <InfoWindow
    position={haltInfoPos}
    onCloseClick={() => { setActiveHalt(null); setHaltInfoPos(null); }}
  >
    <div >
      <div className={styles.haltCardHeader}>Halt Info</div>
      <div className={styles.haltDivider} />

      <div className={styles.haltRow}>
        <span className={styles.haltKey}>Duration:</span>
        <span className={`${styles.haltVal} ${styles.haltStrong}`}>
        {activeHalt?.halt_duration ?? activeHalt?.duration ?? "-"} mins
        </span>
      </div>

    
    </div>
  </InfoWindow>
)} */}
{pdInfo && (
  <InfoWindow
    position={pdInfo.pos}
    onCloseClick={() => setPdInfo(null)}
  >
    <div className={styles.haltCard}>
      <div className={styles.haltCardHeader}>
        {pdInfo.kind}{pdInfo.seq} • {pdInfo.shipmentSIN}
      </div>
      <div className={styles.haltDivider} />
      <div className={styles.haltRow}>
        <span className={styles.haltKey}>Name:</span>
        <span className={styles.haltVal}>{pdInfo.name || "-"}</span>
      </div>
      <div className={styles.haltRow}>
        <span className={styles.haltKey}>Address:</span>
        <span className={styles.haltVal}>{pdInfo.address || "-"}</span>
      </div>
    </div>
  </InfoWindow>
)}

{mapRef && activeHalt && haltInfoPos && (
  <InfoWindow
    position={haltInfoPos}
    onCloseClick={() => { setActiveHalt(null); setHaltInfoPos(null); }}
    options={{ disableAutoPan: false }}
  >
    <div className={styles.haltCard}>
      <div className={styles.haltHeader}>
        <span className={styles.haltTitle}>Halt Info</span>
        {/* <button
          className={styles.haltClose}
          aria-label="Close"
          onClick={() => { setActiveHalt(null); setHaltInfoPos(null); }}
        >
          ×
        </button> */}
      </div>

      <div className={styles.haltDivider} />

      <div className={styles.haltRow}>
        <span className={styles.haltKey}>Duration:</span>
        <span className={`${styles.haltVal} ${styles.haltStrong}`}>
          {(activeHalt?.halt_duration ?? activeHalt?.duration ?? "-")} mins
        </span>
      </div>
    </div>
  </InfoWindow>
)}
{mapRef && pdInfo && (
  <InfoWindow
    position={pdInfo.pos}
    onCloseClick={() => setPdInfo(null)}
  >
    <div className={styles.haltCard}>
      <div className={styles.haltHeader}>
        <span className={
          `${styles.haltTitle} ${pdInfo.kind === "P" ? styles.pdPickupTitle : styles.pdDeliveryTitle}`
        }>
          {pdInfo.kind === "P" ? "Pickup" : "Delivery"} {pdInfo.seq}
        </span>
        <button className={styles.haltClose} onClick={() => setPdInfo(null)}>×</button>
      </div>

      <div className={styles.haltDivider} />

      <div className={styles.haltRow}>
        <span className={styles.haltKey}>Name:</span>
        <span className={styles.haltVal}>{pdInfo.name || "-"}</span>
      </div>
      <div className={styles.haltRow}>
        <span className={styles.haltKey}>Address:</span>
        <span className={styles.haltVal}>{pdInfo.address || "-"}</span>
      </div>
      <div className={styles.haltRow}>
        <span className={styles.haltKey}>Shipment:</span>
        <span className={`${styles.haltVal} ${styles.haltStrong}`}>{pdInfo.shipmentSIN || "-"}</span>
      </div>
    </div>
  </InfoWindow>
)}




            {/* Marker is fine; Google recommends AdvancedMarkerElement going forward */}
            {visibleShipments.map((s) => {
  const pos = driverPos(s);
  if (!pos) return null;

  const icon = getMarkerIconForShipment(s);
  // Fallback if icon undefined in some branch:
  const finalIcon = icon ?? markerIcon(srcOf(catInTransit), 28);

  return (
    // <Marker
    //   key={s._id}
    //   position={pos}
    //   icon={finalIcon}
     
    //   onClick={() => setSelectedShipment(s)}
    // />
    <Marker
  key={s._id}
  position={pos}
  icon={finalIcon}
  label={{
    text: (s.vehicle_no || s.assigned_driver?.vehicle_no || "").toUpperCase(),
    className: styles.vehicleLabel,
  }}
  // onClick={() => setSelectedShipment(s)}
  onClick={() => { setSelectedShipment(s); setInfoFromMapClick(true); }}
/>
  );
})}
{selectedShipment && infoFromMapClick && (() => {
  const pos = driverPos(selectedShipment);
  if (!pos) return null;

  const vNo =
    selectedShipment.vehicle_no ||
    selectedShipment.assigned_driver?.vehicle_no ||
    "—";

  const carrier =
    selectedShipment.carrier?.parent_name ||
    selectedShipment.carrier?.name ||
    "—";

  const driverName = selectedShipment.assigned_driver?.name || "—";
  const driverMobile = selectedShipment.assigned_driver?.mobile || "—";
  const customer = selectedShipment.shipper?.name || "—";
  const destination =
    selectedShipment.deliveries?.[0]?.location?.city ||
    selectedShipment.deliveries?.[0]?.location?.name ||
    "—";
  const material =
    (selectedShipment.materials || [])
      .map(m => m?.name)
      .filter(Boolean)
      .join("+") || "—";

  return (
    <InfoWindow position={pos} onCloseClick={() => setSelectedShipment(null)}>
      <div className={styles.infoCard}>
        <div className={styles.infoRow}>
          SIN: {""}
          <a
            href={`/triptracker?uniqueCode=${selectedShipment.unique_code}`}
            target="_blank"
            rel="noreferrer"
          >  {selectedShipment.SIN}</a>
        </div>

        <div className={styles.infoRow}>Vehicle Number:<strong> {vNo}</strong></div>
        <div className={styles.infoRow}>Carrier:<strong> {carrier}</strong></div>
        <div className={styles.infoRow}>Driver:<strong> {driverName}</strong></div>
        <div className={styles.infoRow}>Driver Mobile:<strong> {driverMobile}</strong></div>

        <hr className={styles.infoHr} />

        <div className={styles.infoRow}>Customer:<strong> {customer}</strong></div>
        <div className={styles.infoRow}>Destination:<strong> {destination}</strong></div>
        <div className={styles.infoRow}>Material:<strong> {material}</strong></div>
      </div>
    </InfoWindow>
  );
})()}


          </GoogleMap>
          
        )}
         <button
          className={`${styles.sidebarToggleButton} ${isSidebarOpen ? styles.sidebarToggleButtonActive : ''}`}
          onClick={() => setIsSidebarOpen(prev => !prev)}
          aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? '›' : '‹'}
        </button>
  </div>
      </div>

{selectedShipment && pathData && (pathData.gps?.length || pathData.app?.length || pathData.sim?.length) ? (
  <div className={styles.legendDock}>
    <div className={styles.legendBar}>{/* your existing legend items */}</div>
    
    <div className={styles.pathChips}>
      {pathData.gps?.length ? (
        <button
          type="button"
          className={`${styles.chip} ${pathVisible.gps ? styles.chipGpsOn : styles.chipGpsOff}`}
          onClick={() => { const v = { ...pathVisible, gps: !pathVisible.gps }; setPathVisible(v); drawPathsAndHalts(v); }}
        >
          GPS
        </button>
      ) : null}

      {pathData.app?.length ? (
        <button
          type="button"
          className={`${styles.chip} ${pathVisible.app ? styles.chipAppOn : styles.chipAppOff}`}
          onClick={() => { const v = { ...pathVisible, app: !pathVisible.app }; setPathVisible(v); drawPathsAndHalts(v); }}
        >
          APP
        </button>
       ) : null} 

      {pathData.sim?.length ? (
        <button
          type="button"
          className={`${styles.chip} ${pathVisible.sim ? styles.chipSimOn : styles.chipSimOff}`}
          onClick={() => { const v = { ...pathVisible, sim: !pathVisible.sim }; setPathVisible(v); drawPathsAndHalts(v); }}
        >
          SIM
        </button>
      ) : null}
    </div>
  </div>
) : null}




      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
          
          </div>
         
<div className={styles.shipmentListContainer}>
{loading && (
    <div style={{ padding: 8 }}>Loading…</div>
  )}

 

  {!loading && !error && (shipmentsData ?? []).length === 0 && (
    <div style={{ padding: 8 }}>No shipments found.</div>
  )}
  

 

{(shipmentsData ?? []).map((shipment) => {
  const pickups = makeStops(shipment?.pickups, "pickup");
  const deliveries = makeStops(shipment?.deliveries, "delivery");
  
  const stops = [
    ...pickups.map((s) => ({ ...s, type: "pickup" })),
    ...deliveries.map((s) => ({ ...s, type: "delivery" })),
  ];
  


  return (
    <div
      key={shipment?._id ?? shipment?.SIN}
      className={styles.shipmentCard}
      // onClick={() =>{
      //   fetchShipmentPathById(shipment._id);
      //   handleShipmentClick?.(shipment)}
      // } 
      onClick={(e) => {
        e.stopPropagation?.();
        setSelectedShipment(shipment);      // keeps P/D markers working
        setInfoFromMapClick(false);         // suppress InfoWindow
        // fetchShipmentPathById(shipment._id);
        onShipmentCardClick(shipment);
      }}
      
    >
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>

          <img className={styles.headerIcon} src={shipmentpic.src} alt="" />
          <span className={styles.headerLabel}>Shipment Id</span>
        </div>
        <div className={styles.shipmentID}>{shipment?.SIN ?? "—"}</div>
      </div>

    
      <div className={styles.routeSection}>
      {/* {pickups.map((s) => (
    <div className={styles.stopRow} key={s.key}>
      <span className={`${styles.stopBadge} ${styles.pickupBadge}`}>
       
        {s.label}
      </span>
      <div className={styles.stopPill}>
        {s.name}{" - "}{s.city || "—"}
      </div>
    </div>
   
  ))}
 {pickups.length > 0 && deliveries.length > 0 && (
  <div className={styles.routeDots} aria-hidden="true">
    <span />
    <span />
    <span />
  </div>
)}

  
  {deliveries.map((s) => (
    <div className={styles.stopRow} key={s.key}>
      <span className={`${styles.stopBadge} ${styles.deliveryBadge}`}>
        {s.label}
      </span>
      <div className={styles.stopPill}>
        {s.name}{" - "}{s.city || "—"}
      </div>
    </div>
  ))} */}
  {stops.map((s, idx) => (
  <React.Fragment key={s.key}>
    <div className={styles.stopRow}>
      <span
        className={`${styles.stopBadge} ${
          s.type === "pickup" ? styles.pickupBadge : styles.deliveryBadge
        }`}
      >
        {s.label}
      </span>
      <div className={styles.stopPill}>
        {s.name}{" - "}{s.city || "—"}
      </div>
    </div>

    {/* connector only if not the last stop */}
    {idx < stops.length - 1 && (
      <div className={styles.routeDots} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    )}
  </React.Fragment>
))}

      </div>

      <hr className={styles.cardDivider} />


      <div className={styles.metaSection}>
        <div className={styles.metaItem}>
        
          <img className={styles.metaIcon} src={person.src} alt="" />
          <div className={styles.metaText}>{shipment?.shipper?.name ?? "—"}</div>
        </div>

        <div className={styles.metaItem}>
          <img className={styles.metaIcon} src={vehicle.src} alt="" />
          <div className={styles.metaText}>
            {shipment?.carrier?.parent_name ??
              shipment?.carrier?.name ??
              "—"}
          </div>
        </div>

        <div className={styles.metaItem}>
          <img className={styles.metaIcon} src={vehicle2.src} alt="" />
          <div className={styles.metaText}>
            {shipment?.vehicle_no ?? "—"}
            <br />
            {shipment?.vehicle_type?.name ?? "—"}
          </div>
        </div>

        <div className={styles.metaItem}>
          <img className={styles.metaIcon} src={person2.src} alt="" />
          <div className={styles.metaText}>
            {shipment?.assigned_driver?.name ?? "—"}
            {shipment?.assigned_driver?.mobile
              ? ` ${shipment.assigned_driver.mobile}`
              : ""}
          </div>
        </div>
      </div>

      <hr className={styles.cardDivider} />

      {/* Time + Action */}
      <div className={styles.timeRow}>
      <div className={styles.timeItemcol} style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        <div className={styles.timeItem}>
          <span className={styles.timeLabel}>Pickup Time:</span>
          {fmtTime(shipment?.pickup_date)}
        </div>
        <div className={styles.timeItem}>
          <span className={styles.timeLabel}>Delivery Time:</span>
          {fmtTime(shipment?.delivery_date)}
        </div>
        </div>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const id =  shipment?.SIN;
            console.log("Shipment ID passed to menu:", id);
            openActionMenu(e, id);
          
          }}
        >
          Action <span className={styles.caret} />
        </button>
      </div>
    </div>
  );
})}

</div>

        </div>
      
      {isFilterOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && setIsFilterOpen(false)} >
          <div
            className={styles.modal}
            role="dialog"
            id="filterDialog"
            aria-modal="true"
            aria-labelledby="filterTitle"
          >
            
            <ModalHeader
  title="Search Shipments"
  onClose={() => setIsFilterOpen(false)}
  className={styles.modalHeader}   />


<form
  ref={formRef}
  className={styles.modalBody}
  onSubmit={(e) => {
    e.preventDefault();
    handleSearchApply();
  }}
>
  {/* Materials */}
  <div className={styles.field}>
    <label>Materials</label>
    <Select value={formDrafts.materials || undefined} onValueChange={onFormMaterialChange} key={`materials-${formDrafts.materials}`}>
      <SelectTrigger className={styles.select}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={styles.selectContent}>
        {materialsList.length === 0 ? (
          <SelectItem
            value="__no_materials__"
            disabled
            className={styles.selectItem}
          >
            No materials found
          </SelectItem>
        ) : (
          materialsList.map((m) => (
            <SelectItem key={m.key} value={m.key} className={styles.selectItem}>
              {m.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  </div>

  {/* Pickup Location */}
  <div className={styles.field}>
    <label>Pickup Location</label>
    <Select value={formDrafts.pickupLocation || undefined} onValueChange={onFormPickupChange} key={`pickup-${formDrafts.pickupLocation}`} >
      <SelectTrigger className={styles.select}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={styles.selectContent}>
        {pickupLocationsList.length === 0 ? (
          <SelectItem
            value="__no_pickups__"
            disabled
            className={styles.selectItem}
          >
            No pickup locations
          </SelectItem>
        ) : (
          pickupLocationsList.map((loc) => (
            <SelectItem
              key={loc.id}
              value={loc.id}
              className={styles.selectItem}
            >
              {loc.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  </div>

  <div className={styles.field}>
    <label>Delivery Location</label>
    <Select value={formDrafts.deliveryLocation || undefined} onValueChange={onFormDeliveryChange} key={`delivery-${formDrafts.deliveryLocation}`}>
      <SelectTrigger className={styles.select}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={styles.selectContent}>
        {deliveryLocationsList.length === 0 ? (
          <SelectItem
            value="__no_locations__"
            disabled
            className={styles.selectItem}
          >
            No locations found
          </SelectItem>
        ) : (
          deliveryLocationsList.map((loc) => (
            <SelectItem
              key={loc.id}
              value={loc.id}
              className={styles.selectItem}
            >
              {loc.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  </div>

  <div className={styles.field}>
    <label>Carrier</label>
    <Select value={formDrafts.carrier || undefined} onValueChange={onFormCarrierChange} key={`carrier-${formDrafts.carrier}`}>
      <SelectTrigger className={styles.select}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={styles.selectContent}>
        {carriersList.length === 0 ? (
          <SelectItem
            value="__no_carriers__"
            disabled
            className={styles.selectItem}
          >
            No carriers found
          </SelectItem>
        ) : (
          carriersList.map((c) => (
            <SelectItem
              key={c.id}
              value={c.id}
              className={styles.selectItem}
            >
              {c.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  </div>

  <div className={styles.field}>
    <label>Shipment Status</label>
    <Select value={formDrafts.status || undefined} onValueChange={onFormStatusChange} key={`status-${formDrafts.status}`}>
      <SelectTrigger className={styles.select}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={styles.selectContent}>
        <SelectItem value="intransit" className={styles.selectItem}>In Transit</SelectItem>
        <SelectItem value="towardspickup" className={styles.selectItem}>Towards Pickup</SelectItem>
        <SelectItem value="inplant" className={styles.selectItem}>In Plant</SelectItem>
        <SelectItem value="atdelivery" className={styles.selectItem}>At Delivery</SelectItem>
        <SelectItem value="all" className={styles.selectItem}>All</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {formDrafts.status === 'inplant' && (
    <div className={styles.field}>
      <label>In Plant Stage</label>
      <Select value={formDrafts.inPlantStage || undefined} onValueChange={onFormInPlantChange} key={`inPlantStage-${formDrafts.inPlantStage}`}>
        <SelectTrigger className={styles.select}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={styles.selectContent}>
          <SelectItem value="PO" className={styles.selectItem}>Parking Out - Gate In</SelectItem>
          <SelectItem value="GI" className={styles.selectItem}>Gate In - Tare Weight</SelectItem>
          <SelectItem value="TW" className={styles.selectItem}>Tare Weight - Gross Weight</SelectItem>
          <SelectItem value="GW" className={styles.selectItem}>Gross Weight - Post Goods</SelectItem>
          <SelectItem value="PG" className={styles.selectItem}>Post Goods - Test Certificate</SelectItem>
          <SelectItem value="TC" className={styles.selectItem}>Test Certificate - Invoice</SelectItem>
          <SelectItem value="IV" className={styles.selectItem}>Invoice - Ewaybill</SelectItem>
          <SelectItem value="EW" className={styles.selectItem}>Ewaybill</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )}


  <div className={styles.field}>
    <label>Shipment ID</label>
    <input 
      className={styles.input} 
      value={formDrafts.shipmentId} 
      onChange={(e) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        onFormShipmentIdChange(value);
      }}
      placeholder="Enter shipment ID"
      maxLength={15}
    />
  </div>

  <div className={styles.field}>
    <label>Vehicle Number</label>
    <input 
      className={styles.input} 
      value={formDrafts.vehicle} 
      onChange={(e) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        onFormVehicleChange(value);
      }}
      placeholder="Enter vehicle number"
      maxLength={15}
    />
  </div>


  <div className={styles.field}>
    <label>From</label>
    <DatePicker
      value={formDrafts.dateFrom ? dayjs(formDrafts.dateFrom, "YYYY-MM-DD") : null}
      onChange={(_, s) => onFormDateFromChange(s as string)}
      format="YYYY-MM-DD"
      allowClear
      className={styles.dateInput}
      key={`dateFrom-${formDrafts.dateFrom}`}
    />
  </div>


  <div className={styles.field}>
    <label>To</label>
    <DatePicker
      value={formDrafts.dateTo ? dayjs(formDrafts.dateTo, "YYYY-MM-DD") : null}
      onChange={(_, s) => onFormDateToChange(s as string)}
      format="YYYY-MM-DD"
      allowClear
      className={styles.dateInput}
      key={`dateTo-${formDrafts.dateTo}`}
    />
  </div>

  <div className={styles.modalActions}>
    <button type="button" onClick={handleSearchClearDrafts} className={styles.clearBtn}>
      Clear
    </button>
    <button type="submit" className={styles.applyBtn}>
      Apply
    </button>
  </div>
</form>

          </div>
        </div>
      
      )}
      
  
      {mounted && menu.open && createPortal(
  <div
    id="action-menu"
    className={`${styles.actionMenu} ${menu.placement === "above" ? styles.actionMenuAbove : ""}`}
    style={{ top: `${menu.y}px`, left: `${menu.x}px`, width: `${MENU_W}px` }}
    role="menu"
  >
    {actionItems.map((it) => (
      <div
        key={it.key}
        className={styles.actionMenuItem}
        role="menuitem"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); it.onClick(menu.shipmentId || ""); closeActionMenu(); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { it.onClick(menu.shipmentId || ""); closeActionMenu(); }
        }}
      >
        <img className={styles.actionMenuIcon} src={srcOf(it.icon)} alt="" />
        <span className={styles.actionMenuText}>{it.label}</span>
      </div>
    ))}
  </div>,
  document.body
)}

  </div>


  );
}
