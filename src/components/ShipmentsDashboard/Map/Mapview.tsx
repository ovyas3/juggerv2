"use client";

import { GoogleMap, Marker, useJsApiLoader,InfoWindow } from "@react-google-maps/api";
import { useMemo, useState, useEffect,useRef, useCallback  } from "react";
import { createPortal } from "react-dom";
import React from "react";
import GeofenceLayer from "./Geofencelayer";
import styles from "./Mapview.module.css";
import searchIcon from '../../../assets/search_icon_new.svg';
import filterIcon from '../../../assets/filter-icon.svg';
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
import { useSearchParams } from "next/navigation";
import { StopsPreview } from "./StopsPreview";

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


import dirN from "../../../assets/parkingout.svg";
import dirE from "../../../assets/tare_weight.svg";
import dirS from "../../../assets/gross_weight.svg";
import dirW from "../../../assets/gate_in.svg";
import dirC from "../../../assets/ewaybill.svg"; 

import po_gi from "../../../assets/parkingout.svg";
import gi_tw from "../../../assets/gate_in.svg";
import tw_gw from "../../../assets/tare_weight.svg";
import gw_pg from "../../../assets/gross_weight.svg";
import pg_tc from "../../../assets/ewaybill.svg";
import tc_iv from "../../../assets/test_certificate.svg";
import iv_ew from "../../../assets/invoice.svg";
import ew_only from "../../../assets/post_goods.svg";

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

interface Location {
  name?: string;
  area?: string;
  lat?: number;
  lng?: number;
  state?: string;
  city?: string;
  pincode?: string;
  _id?: string;
}

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
  shipmentId: string;
}
interface Carrier {
  _id: string;
  name: string;
  parent_name: string;
}

interface TripTracker {
  last_location_address?: string;
}
interface ShipmentMaterial {
  _id?: string;
  name?: string;
}

interface Shipment {
  _id: string;
  SIN: string;
  pickups: { location: Location }[];
  deliveries: { location: Location }[];
  carrier: Carrier;
  shipper: { _id: string; name: string };
  status: string;
  materials?: ShipmentMaterial[]; 
  vehicle_type: { 
    _id: string;
    name: string;
    capacity: number;
  };
  latest_status: string;
  driver?: Driver; 
  assigned_driver?: Driver; 
  vehicle_no: string;
  trip_tracker?: TripTracker;
  pickup_date:string;
  delivery_date:string;
  unique_code:string;
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
  const apiKey = "AIzaSyDr0k02Q0b6SF2xum80HvY7I4kAWUCOR2U";
  const formRef = useRef<HTMLFormElement>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [shipmentGroup, setShipmentGroup] = useState(""); 
  const [SelectMaterials, setSelectedMaterials] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [geoFences, setGeoFences] = useState<any[]>([]);
const [infoFromMapClick, setInfoFromMapClick] = useState(false);
type LegendItem = { key: LegendKey; label: string; icon: any };
// at top of component body (client component)
// const portalTarget = typeof window !== 'undefined' ? document.body : null;
const [portalTarget, setPortalTarget] = useState<Element | null>(null);
const searchParams = useSearchParams();

const limitFromUrl = useMemo(() => {
  const n = Number(searchParams.get("limit"));
  return Number.isFinite(n) && n > 0 ? n : 100; // fallback to your old default
}, [searchParams]);

const skipFromUrl = useMemo(() => {
  const n = Number(searchParams.get("skip"));
  return Number.isFinite(n) && n >= 0 ? n : 0; // fallback to your old default
}, [searchParams]);


useEffect(() => {
  // only run on client
  setPortalTarget(document.body);
}, []);

const STATUS_ITEMS: LegendItem[] = [
  { key: "on",    label: "On Time",         icon: ontime },
  { key: "2-4",   label: "2 - 4 Hours",     icon: twotofour },
  { key: "4-8",   label: "4 - 8 Hours",     icon: fourtoeight },
  { key: "8-12",  label: "8 - 12 Hours",    icon: eighttotwelve },
  { key: "12-16", label: "12 - 16 Hours",   icon: twelvetosixteen },
  { key: "16-20", label: "16 - 20 Hours",   icon: sixteentotwenty },
  { key: "20+",   label: "Beyond 20 Hours", icon: beyondtwenty },
] satisfies Array<{ key: LegendKey; label: string; icon: any }>;

const geofenceOverlaysRef = useRef<
  Array<google.maps.Polygon | google.maps.Circle | google.maps.Polyline | google.maps.Marker>
>([]);

const [locationsList, setLocationsList] = useState<Array<{ id: string; label: string }>>([]);
const [selectedStatus, setSelectedStatus] = useState('in_transit');

const [selectedLocation, setSelectedLocation] = useState<string>(""); 
const [selectedCarrier, setSelectedCarrier] = useState<string>("");   
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
const [selectedPickupLocation, setSelectedPickupLocation] = useState<string>("");
const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState<string>("");
const [inPlantStage, setInPlantStage] = useState<string>("");
const [unitLocations, setUnitLocations] = useState<any[]>([]);
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
const INDIA_BBOX = { minLat: 5, maxLat: 38.9, minLng: 68, maxLng: 98 };
const handleAttachDone: () => void = () => {
  closeModal();
};

const updateFormDraft = (field: keyof typeof formDrafts, value: string) => {
  setFormDrafts(prev => ({ ...prev, [field]: value }));
};
  
// add once in the component
useEffect(() => {
  if (isFilterOpen) {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }
}, [isFilterOpen]);

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
const toLatLngIndia = (item: any) => {
  const p = toLatLng(item);
  return p && inIndia(p.lat, p.lng) ? p : null;
};
type PathData = {
  sim: any[];
  app: any[];
  gps: any[];
  haltData: any[];
  meta?: { is_fastag_enabled?: boolean; unique_code?: string };
};

const [pathData, setPathData] = useState<PathData | null>(null);
const [pathVisible, setPathVisible] = useState({ gps: false, app: false, sim: false });
const pathOverlaysRef = useRef<
  Array<
    google.maps.Polyline | google.maps.Marker | google.maps.Polygon | google.maps.Circle
  >
>([]);
const [activeHalt, setActiveHalt] = useState<any | null>(null);
const [haltInfoPos, setHaltInfoPos] = useState<google.maps.LatLngLiteral | null>(null);
const pdOverlaysRef = useRef<Array<google.maps.Marker>>([]);
const [pdInfo, setPdInfo] = useState<{
  pos: google.maps.LatLngLiteral;
  kind: "P" | "D";
  seq: number;
  name?: string;
  area?: string;
  shipmentSIN?: string;
  city?: string;

} | null>(null);

function clearPDMarkers() {
  pdOverlaysRef.current.forEach(m => m.setMap(null));
  pdOverlaysRef.current = [];
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
  meta?: { name?: string; address?: string; area?: string; sin?: string,city?:string },
) {
  console.debug(`[PD] add ${kind}${seq}`, { pos, meta });   
  const marker = new google.maps.Marker({
    position: pos,
    map,
    icon: pdMarkerIcon(kind),
    label: {
      text: (kind + seq) as string,         
      color: "#ffffff",
      fontWeight: "700",
      fontSize: "13px",
    },
    zIndex: 80,
  });
  marker.addListener("click", () => {
    console.debug(`[PD] click ${kind}${seq}`, meta); 
    setPdInfo({ pos, kind, seq, name: meta?.name, area: meta?.area, shipmentSIN: meta?.sin,city:meta?.city });
  });
  pdOverlaysRef.current.push(marker);
  console.debug(`[PD] overlays now`, pdOverlaysRef.current.length); // 👈
  return marker;
}


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

  const direct = resolveLoc(loc);
  if (direct) return direct;

  const key = locKey(loc);
  const cached = geocodeCacheRef.current.get(key);
  if (cached) return cached;

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

// async function drawPDForShipment(s: Shipment) {
//   console.groupCollapsed("[PD] draw", s?.SIN ?? s?._id ?? "unknown");

//   if (!(window as any).google || !google.maps) { console.warn("[PD] maps not ready"); console.groupEnd(); return; }
//   const map = mapRef as unknown as google.maps.Map | null;
//   if (!map) { console.warn("[PD] mapRef.current is null"); console.groupEnd(); return; }

//   const pickupDoc = s?.pickups?.[0] ?? null;
//   const deliveryDoc = s?.deliveries?.[s?.deliveries?.length - 1] ?? null;
//   const pRaw = pickupDoc?.location ?? null;
//   const dRaw = deliveryDoc?.location ?? null;

//   const p = (resolveLoc(pRaw)) || (await ensureLatLngFromLocation(pRaw));
//   const d = (resolveLoc(dRaw)) || (await ensureLatLngFromLocation(dRaw));

//   console.table({ pickup_parsed: p || "❌", delivery_parsed: d || "❌" });

//   clearPDMarkers();
//   let added = 0; const b = new google.maps.LatLngBounds();

//   if (p) { addPDMarker(map, p, "P", 1, { sin: s?.SIN }); b.extend(p); added++; }
//   else   { console.warn("[PD] pickup invalid/missing lat/lng"); }

//   if (d) { addPDMarker(map, d, "D", 1, { sin: s?.SIN }); b.extend(d); added++; }
//   else   { console.warn("[PD] delivery invalid/missing lat/lng"); }

//   if (added && !b.isEmpty()) map.fitBounds(b, 60);
//   else {
//     const ctr = map.getCenter();
//     const test = new google.maps.Marker({ map, position: ctr, label: "TEST" });
//     setTimeout(() => test.setMap(null), 1500);
//   }
//   console.groupEnd();
// }

async function drawPDForShipment(s: Shipment) {
  console.groupCollapsed("[PD] draw", s?.SIN ?? s?._id ?? "unknown");

  if (!(window as any).google || !google.maps) { console.warn("[PD] maps not ready"); console.groupEnd(); return; }
  const map = mapRef as unknown as google.maps.Map | null;
  if (!map) { console.warn("[PD] mapRef.current is null"); console.groupEnd(); return; }

  clearPDMarkers();
  let added = 0; const b = new google.maps.LatLngBounds();

  // Draw all pickup markers
  for (let i = 0; i < (s?.pickups?.length ?? 0); i++) {
    const pickupDoc = s.pickups[i];
    const pRaw = pickupDoc?.location ?? null;
    const p = resolveLoc(pRaw) || (await ensureLatLngFromLocation(pRaw));
    
    if (p) {
      addPDMarker(map, p, "P", i + 1, { sin: s?.SIN, name: pRaw?.name, area: pRaw?.area,city: pRaw?.city });
      b.extend(p);
      added++;
    } else {
      console.warn(`[PD] pickup ${i + 1} invalid/missing lat/lng`);
    }
  }

  // Draw all delivery markers
  for (let i = 0; i < (s?.deliveries?.length ?? 0); i++) {
    const deliveryDoc = s.deliveries[i];
    const dRaw = deliveryDoc?.location ?? null;
    const d = resolveLoc(dRaw) || (await ensureLatLngFromLocation(dRaw));
    
    if (d) {
      addPDMarker(map, d, "D", i + 1, { sin: s?.SIN, name: dRaw?.name, area: dRaw?.area,city: dRaw?.city });
      b.extend(d);
      added++;
    } else {
      console.warn(`[PD] delivery ${i + 1} invalid/missing lat/lng`);
    }
  }

  if (added && !b.isEmpty()) {
    map.fitBounds(b, 60);
  } else {
    // Fallback if no valid locations found
    const ctr = map.getCenter();
    const test = new google.maps.Marker({ map, position: ctr, label: "TEST" });
    setTimeout(() => test.setMap(null), 1500);
  }
  console.groupEnd();
}
function arrivalIsoFromDeliveries(s: Shipment): string | undefined {
  const lastArrived = Array.isArray(s?.deliveries)
    ? (s.deliveries as any[]).filter(d => d?.arrived === true).slice(-1)[0]
    : undefined;

  const arrivedAt =
    lastArrived?.arrived_at ||
    lastArrived?.arrivedAt ||
    lastArrived?.arrival_time;

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
      if (vis.gps) drawLine(pathData.gps, "#2563EB", 22);  
      if (vis.app) drawLine(pathData.app, "#16A34A", 21);  
      if (vis.sim) drawLine(pathData.sim, "#7C3AED", 20);  
  
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
  
    const p = selectedShipment?.pickups?.[0]?.location;
    const d = selectedShipment?.deliveries?.slice(-1)?.[0]?.location;
  
    const pli = toLatLng(p);
    const dli = toLatLng(d);
    if (pli) { addMarker(mapRef!, pli, "P", "#1D4ED8", 70); b.extend(pli); }
    if (dli) { addMarker(mapRef!, dli, "D", "#DC2626", 70); b.extend(dli); }
    for (const s of visibleShipments || []) {
      const p = driverPos(s);
      if (p) b.extend(p);
    }
    if (!b.isEmpty()) mapRef!.fitBounds(b, 64);
  }
  
async function fetchShipmentPathById(shipmentId: string) {
  if (!shipmentId) return null;

  const qs = new URLSearchParams({ shipment: shipmentId }).toString();
  const res = await httpsGet(`shipment/path?${qs}`, 0);
  const raw = (res?.data ?? res) || {};

  return {
    gps: raw.gps ?? [],
    app: raw.app ?? [],
    sim: raw.sim ?? [],
    haltData: raw.haltData ?? [],
    meta: { is_fastag_enabled: raw.is_fastag_enabled, unique_code: raw.unique_code },
  };
}


const onShipmentCardClick = async (shipment: any) => {
  setSelectedShipment(shipment);         
  drawPDForShipment(shipment);
  const data = await fetchShipmentPathById(shipment._id);
  if (!data) return;

  const hasGPS = !!data.gps?.length;
  const hasAPP = !!data.app?.length;
  const hasSIM = !!data.sim?.length;

  if (!(hasGPS || hasAPP || hasSIM)) {
    clearPathOverlays();
    setPathData(null);
    setPathVisible({ gps: false, app: false, sim: false });
    return;
  }

  setPathData(data);
  const vis = { gps: false, app: false, sim: false };
  setPathVisible(vis);
  drawPathsAndHalts(vis);
};

  function buildMaterialBuckets(shipments: Shipment[]): {
    options: MaterialOption[];
    buckets: MaterialBuckets;
  } {
    const idToName = new Map<string, string>();        
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
  
    const buckets: MaterialBuckets = {};
    const UNKNOWN_KEY = "__unknown__";
    const UNKNOWN_LABEL = "Unknown";
  
    for (const { id, name } of rawItems) {
      const resolvedName = name || (id ? idToName.get(id) || "" : "");
      if (!resolvedName) {
        if (!buckets[UNKNOWN_KEY]) buckets[UNKNOWN_KEY] = { label: UNKNOWN_LABEL, ids: [] };
        if (id && !buckets[UNKNOWN_KEY].ids.includes(id)) buckets[UNKNOWN_KEY].ids.push(id);
        continue;
      }
  
      const key = resolvedName.toLowerCase(); 
      if (!buckets[key]) buckets[key] = { label: resolvedName, ids: [] };
      if (id && !buckets[key].ids.includes(id)) buckets[key].ids.push(id);
    }
  
    const entries = Object.entries(buckets);
    const onlyUnknown = entries.length === 1 && entries[0][0] === UNKNOWN_KEY;
  
    const options = entries
      .filter(([k]) => onlyUnknown || k !== UNKNOWN_KEY)
      .map(([key, b]) => ({ key, label: b.label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  
    return { options, buckets };
  }
  
type StatusTab = "all" | "in_plant" | "towards_pickup" | "in_transit" | "at_delivery";

type LegendKey =
  | "on" | "2-4" | "4-8" | "8-12" | "12-16" | "16-20" | "20+"
  | "0-12" | "12-24" | "24+"
  | "N" | "E" | "S" | "W" | "C"
  | "PO" | "GI" | "TW" | "GW" | "PG" | "TC" | "IV" | "EW"
  | "ALL_IN_PLANT" | "ALL_TP" | "ALL_IT" | "ALL_AD";


const [activeLegend, setActiveLegend] = useState<LegendKey | null>(null);

useEffect(() => { setActiveLegend(null); }, [selectedStatus]); 
function delayHours(s:any){ const a=s?.tripTrackerDetails?.total_delay; const v=Number(a); return Number.isFinite(v)?v:0; }


type DetentionBucket = "0-12" | "12-24" | "24+";
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

function detentionBucket(arrivedIso?: string): DetentionBucket {
  if (!arrivedIso) return "0-12"; 

  const h = hoursBetween(arrivedIso, undefined); 
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




function tpBucket(s:any): Extract<LegendKey,"N"|"E"|"S"|"W"|"C"> {
  const from = driverPos(s); const to = firstPickupLatLng(s);
  if (!from || !to) return "C";
  return cardinalDirection(from, to);
}

function plantBucket(s:any): Extract<LegendKey,"PO"|"GI"|"TW"|"GW"|"PG"|"TC"|"IV"|"EW"> {
  const code = String(s?.eventStatus || s?.latest_status || "").toUpperCase();
  const allowed = new Set(["PO","GI","TW","GW","PG","TC","IV","EW"]);
  return (allowed.has(code) ? (code as any) : undefined as any);
}

function allBucket(s:any): Extract<LegendKey,"ALL_IN_PLANT"|"ALL_TP"|"ALL_IT"|"ALL_AD"> {
  const code = String(s?.latest_status || "").toUpperCase();
  if (code === "INPL") return "ALL_IN_PLANT";
  if (code === "SP")   return "ALL_TP";
  if (code === "ALD")  return "ALL_AD";
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
      arr = arr.filter(s => detentionBucket(arrivalIsoFromDeliveries(s)) === activeLegend);
      break;
    case "towards_pickup":
      arr = arr.filter(s => tpBucket(s) === activeLegend);
      break;
    case "in_plant":
      arr = arr.filter(s => plantBucket(s) === activeLegend);
      break;
    case "all":
      arr = arr.filter(s => {
        const k = allBucket(s);
        return k === activeLegend;
      });
      break;
  }
  return arr;
}, [shipmentsData, selectedStatus, activeLegend]);
type GeoFence =
  | { type: "Polygon"; coordinates: number[][][] }          
  | { type: "MultiPolygon"; coordinates: number[][][][] };   



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
  size = 64,            
  core = 6,             
  ring1 = 16,           
  ring2 = 22,           
  ring3 = 30,           
} = {}) {
  const s = size;
  const c = s / 2;
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
    zIndex: 999, 
    icon: {
      url,
      scaledSize: new google.maps.Size(sizePx, sizePx),
      anchor: new google.maps.Point(sizePx / 2, sizePx / 2), 
    },
  });
  geofenceOverlaysRef.current.push(marker);
  return marker;
}
useEffect(() => {
  
  fetchShipments();
  
}, []);

const handleCreateAdvance = (payload: any) => {
  closeModal();
};

const [menu, setMenu] = useState<{
  open: boolean;
  x: number;
  y: number;
  shipmentId?: string;
  placement: "above" | "below";
}>({ open: false, x: 0, y: 0, shipmentId: undefined, placement: "below" });

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

function driverPos(s: Shipment): { lat: number; lng: number } | null {
  const coords = s?.assigned_driver?.geo_point?.coordinates; 
  let lat: number | undefined;
  let lng: number | undefined;

  if (Array.isArray(coords) && coords.length >= 2) {
    let cLng = Number(coords[0]);
    let cLat = Number(coords[1]);

    if ((Math.abs(cLat) > 60 && Math.abs(cLng) <= 60) || cLng < -180 || cLng > 180) {
      const t = cLat; cLat = cLng; cLng = t;
    }
    if ((Math.abs(cLat) > 60 && Math.abs(cLng) <= 60) || cLng < -180 || cLng > 180) {
      const t = cLat; cLat = cLng; cLng = t;
    }

    lat = cLat;
    lng = cLng;
  } else {
    lat = Number((s as any)?.assigned_driver?.latitude ?? (s as any)?.latitude);
    lng = Number((s as any)?.assigned_driver?.longitude ?? (s as any)?.longitude);
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  if (!inIndia(lat, lng)) return null;

  return { lat, lng };
}


function firstPickupLatLng(s: Shipment): { lat: number; lng: number } | null {
  const p = s?.pickups?.[0]?.location;
  if (!p) return null;
  const lat = Number(p.lat), lng = Number(p.lng);
  const res = (Number.isFinite(lat) && Number.isFinite(lng)) ? { lat, lng } : null;
  return res && inIndia(res.lat, res.lng) ? res : null;
}


type DelayBucket = "on" | "2-4" | "4-8" | "8-12" | "12-16" | "16-20" | "20+";
function delayBucket(s: Shipment): DelayBucket {
  const h = delayHours(s);
  if (h < 2)      return "on";   
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
  if (code === "INPL") return srcOf(catInPlant);
  if (code === "SP")   return srcOf(catTowardsPickup);        
  if (code === "ALD")  return srcOf(catAtDelivery);
  if (code === "ITNS" || code === "ABTR") return srcOf(catInTransit);
  return srcOf(catInTransit); 
}
function getMarkerIconForShipment(s: Shipment): google.maps.Icon | undefined {
  let url: string | null = null;

  if (selectedStatus === "towards_pickup") {
    const from = driverPos(s);
    const to   = firstPickupLatLng(s);
    if (from && to) {
      const dir = cardinalDirection(from, to); 
      const m = { N: dirN, E: dirE, S: dirS, W: dirW, C: dirC };
      url = srcOf(m[dir]);
    }
  }
  else if (selectedStatus === "in_plant") {
    url = inPlantStageIcon(s, inPlantStage);
  }
  else if (selectedStatus === "at_delivery") {
    if (activeLegend && detentionBucket(arrivalIsoFromDeliveries(s)) !== activeLegend) {
      return undefined; 
    }
    url = atDeliveryIcon(s);
  }
  else if (selectedStatus === "in_transit") {
    const iconUrl = inTransitIcon(s);
    if (!activeLegend) {
      url = iconUrl;
    } else {
      if (delayBucket(s) === (activeLegend as DelayBucket)) url = iconUrl;
      else url = null;
    }
  }
  else if (selectedStatus === "all") {
    url = allViewIcon(s);
  }

  return url ? markerIcon(url, 30) : undefined;
}

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


  function openModal(type: Exclude<ModalType, null>, shipmentId: string) {
    const id = String(shipmentId);
  
    if (type === "upload" || type === "advance") {
      setModal({ type, shipmentId: id }); 
    } else {
      setModal({ type, shipment: { _id: id, sin: id } }); 
    }
  }
  
const closeModal = () => setModal({ type: null }); 

useEffect(() => {
  const fetchGeoFences = async () => {
    try {
      const unitsRes = await httpsGet("location/units/get", 4);
      const raw = unitsRes?.data ?? [];
const items = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
console.log("API raw:", raw);
console.log("Items extracted:", items);
console.log("Unit sample:", items[0]);

const DEFAULT_RADIUS_METERS = 1000; 

const fences = items
  .map((loc: any) => {
    const gf = loc?.geo_fence;
    if (gf?.type && gf?.coordinates) return { geo_fence: gf };

    const gp = loc?.geo_point;
    const coords = gp?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;

    const lon = Number(coords[0]);
    const lat = Number(coords[1]);

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
      setUnitLocations(unitsRes?.data ?? []);   
    } catch (err) {
      console.error("Error fetching geo-fences:", err);
    }
  };

  fetchGeoFences();
}, []);


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


const EVENT_STATUS_ORDER = ["PO","GI","TW","GW","PG","TC","IV","EW"] as const;
type EventCode = typeof EVENT_STATUS_ORDER[number];

const isEventCode = (v: string): v is EventCode =>
  EVENT_STATUS_ORDER.includes(v as EventCode);

const mapInPlantStageToEventCode = (stage: string) =>
  isEventCode(stage) ? stage : null;

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
  return (θ * 180/Math.PI + 360) % 360; 
}

function cardinalDirection(from: LatLng, to: LatLng): "N"|"E"|"S"|"W"|"C" {
  const distKm = haversineKm(from, to);
  if (distKm < 2) return "C";

  const brg = bearingDeg(from, to); 
  if (brg >= 45 && brg < 135) return "E";
  if (brg >= 135 && brg < 225) return "S";
  if (brg >= 225 && brg < 315) return "W";
  return "N";
}

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

function hoursBetween(isoStart?: string, isoEnd?: string) {
  const a = isoStart ? new Date(isoStart).getTime() : NaN;
  const b = isoEnd ? new Date(isoEnd).getTime() : Date.now();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  return Math.max(0, (b - a) / 36e5);
}


function markerIcon(url: string, size = 30): google.maps.Icon {
  return {
    url,
    scaledSize: new google.maps.Size(size, size),
    labelOrigin: new google.maps.Point(size / 2, -6),
  };
}

function inPlantStageIcon(s: Shipment, fallbackCode?: string): string | null {
  const code = (EVENT_STATUS_ORDER as readonly string[])
    .find(k => (s.latest_status || "").toUpperCase() === k)
    || (fallbackCode && EVENT_STATUS_ORDER.includes(fallbackCode as any) ? fallbackCode : null);

  if (!code) return null;
  const icon = INPLANT_ICON[code as EventCode];
  return srcOf(icon) || null;
}

function atDeliveryIcon(s: Shipment): string | null {
  const bucket = detentionBucket(arrivalIsoFromDeliveries(s));
  if (bucket === "0-12") return srcOf(det_0_12);
  if (bucket === "12-24") return srcOf(det_12_24);
  return srcOf(det_24_plus);
}

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
      byId.set(id, name || id);   
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

useEffect(() => {
  fetchShipments();
}, [shipmentGroup, selectedStatus, inPlantStage]);

useEffect(() => {
  const t = window.setTimeout(() => {
    fetchShipments();
  }, 400); 
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

}, [shipmentsData]); // eslint-disable-line react-hooks/exhaustive-deps

const srcOf = (m: any): string => (typeof m === "string" ? m : m?.src ?? m?.default?.src ?? "");
const MENU_W = 280;

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
  let x = rect.right - MENU_W;                         
  x = Math.max(12, Math.min(x, window.innerWidth - MENU_W - 12));
  const y = rect.top;
  setMenu({ open: true, x, y, shipmentId, placement: "above"});
};

useEffect(() => {
  if (!mapRef) return;
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
  const onScroll = () => closeActionMenu(); 
  window.addEventListener("mousedown", onDown);
  window.addEventListener("keydown", onKey);
  window.addEventListener("scroll", onScroll, true);
  return () => {
    window.removeEventListener("mousedown", onDown);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", onScroll, true);
  };
}, [menu.open]);


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
    
    if (formRef.current) {
      formRef.current.reset();
    }
  };
  
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

const buildApiFilters = () => {
  // const f: any = { limit: 100, skip: 0 };
  const f: any = {
    // ... your other filters
    limit: limitFromUrl,
    skip: skipFromUrl,
  };
  const fromMs = toStartOfDayMs(dateFrom);
  const toMs = toEndOfDayMs(dateTo);

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

  return f;
};
const fetchShipments = async (appliedFilters?: any) => {
  setLoading(true);
  setError(null);

  try {
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

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey ?? "",
    libraries: ["geometry"],
  });
  

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

const stopFromLoc = (loc?: any) => {
  const name = (loc?.name || loc?.area || loc?.city || "—").toString().trim();
  const city = (loc?.city || "").toString().trim();
  return { name, city };
};

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
    setIsSidebarOpen(true); 
    if (menu.open) closeActionMenu();
  };
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
    open={true} 
    onClose={closeModal} 
    shipment={modal.shipment!} 
    onCancelSuccess={fetchShipments} 
  />
)}



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


{modal.type === "upload" && (
  <AttachFilesModal
    show
    onClose={closeModal}
    onAttach={handleAttachDone}         // () => void
    shipmentId={modal.shipmentId}       // string
    isLoading={false}
  />
)}


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
            onLoad={(m) => { setMapRef(m); m.fitBounds(getIndiaBounds(), 64); }}
            onUnmount={() => setMapRef(null)}
            mapContainerStyle={containerStyle}
            options={{
                streetViewControl: false,
                fullscreenControl: true,
                mapTypeControl: true,
                mapTypeControlOptions: {
                  style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,   
                  position: google.maps.ControlPosition.TOP_LEFT,          
                  mapTypeIds: ["roadmap", "satellite", "terrain"],         
                },
              }}
         
          >
          
<GeofenceLayer
  map={mapRef}
  fences={(geoFences || [])
    .map((it: any) => it?.geo_fence) // unwrap
    .filter((gf: any) => gf && (gf.type === "Polygon" || gf.type === "MultiPolygon"))}
/>

{/* {pdInfo && (
  <InfoWindow
    position={pdInfo.pos}
    onCloseClick={() => setPdInfo(null)}
  >
    <div 
    // className={styles.haltCard }
    >
      <div className={styles.haltCardHeader}>
        {pdInfo.kind}{pdInfo.seq} • {pdInfo.shipmentSIN}
      </div>
      <div className={styles.haltDivider} />
      <div className={styles.haltRow}>
        <span className={styles.haltKey}>Name:</span>
        <strong>
        <span className={styles.haltVal}>{pdInfo.name || "-"}</span></strong>
      </div>
      <div className={styles.haltRow}>
        <span className={styles.haltKey}>Address:</span>
        <span className={styles.haltVal}>{pdInfo.address || "-"}</span>
      </div>
    </div>
  </InfoWindow>
)} */}

{mapRef && activeHalt && haltInfoPos && (
  <InfoWindow
    position={haltInfoPos}
    onCloseClick={() => { setActiveHalt(null); setHaltInfoPos(null); }}
    options={{ disableAutoPan: false }}
  >
    <div className={styles.haltCard}>
      <div className={styles.haltHeader}>
        <span className={styles.haltTitle}>Halt Info</span>
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
          ` ${pdInfo.kind === "P" ? styles.pdPickupTitle : styles.pdDeliveryTitle}`
        }>
          {pdInfo.kind === "P" ? "Pickup" : "Delivery"} {pdInfo.seq}
        </span>
        {/* <button className={styles.haltClose} onClick={() => setPdInfo(null)}>×</button> */}
      </div>

      <div className={styles.haltDivider} />

      <div className={styles.haltRow}>
        <span className={styles.haltKey}>Name:</span>
        <strong>
        <span className={styles.haltVal}>{pdInfo.name || "-"}</span></strong>
      </div>
      <div className={styles.haltRow}>
        <span className={styles.haltKey}>Address:</span>
        <strong>
        <span className={styles.haltVal}>{pdInfo.area || "-"}</span></strong>
      </div>
      <div className={styles.haltRow}>
        <span className={styles.haltKey}>City:</span>
        <strong>
        <span className={styles.haltVal}>{pdInfo.city || "-"}</span></strong>
      </div>
      {/* <div className={styles.haltRow}>
        <span className={styles.haltKey}>Shipment:</span>
        <span className={`${styles.haltVal} ${styles.haltStrong}`}>{pdInfo.shipmentSIN || "-"}</span>
      </div> */}
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
      onClick={(e) => {
        e.stopPropagation?.();
        setSelectedShipment(shipment);     
        setInfoFromMapClick(false);         
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
      <StopsPreview shipment={shipment} centered  anchorWithin={document.querySelector(`.${styles.sidebar}`) as HTMLElement} />

    
      <div className={styles.routeSection}>

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
      
      {isFilterOpen ? (portalTarget
      ? createPortal(

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
        </div>,   portalTarget  ) : null)
        : null}
     
      
  
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
