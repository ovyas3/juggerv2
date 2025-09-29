import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./ShipmentsDashboard.module.css";
import EpodPreviewModal from "../ShipmentsDashboard/DocumentManagement/EpodPreviewModal";
import {
  RefreshCw,
  FileText,
  Upload,
  Truck,
  Clock,
  AlertCircle,
  Search,
  DoorOpen,
  Eye,
  CheckCircle,
  Package,
  CreditCard,
  Calculator,
  Route,
  Edit,
  Wifi,
  Mail,
  Share2,
  XCircle,
  Download,
  WifiOff,
  PlusCircle,
  UserPlus,
  Plus,
  MapPin,
} from "lucide-react";
import CompleteShipmentModal from "../ShipmentsDashboard/ShipmentManagement/CompleteShipmentModal";
import Link from 'next/link';
import {
  Button
} from "../UI/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { httpsGet, httpsPost } from "@/utils/Communication";
import SubscribeModal from "./Communication/SubscribeModal";
import { ShipmentsTable } from "./ShipmentsTable";
import { AnalyticsView } from "./AnalyticsView";
import { AdvancedFilter } from "./AdvancedFilter/AdvancedFilter";
import ShipmentDetails from "./ShipmentDetails/ShipmentDetails"; 
import LocationModal from "../ShipmentsDashboard/LocationTracking/LocationModal";
import ActiveCarriersModal from "../ShipmentsDashboard/SpecialFeatures/ActiveCarriersModal";
import RerunShipmentModal from "../ShipmentsDashboard/ShipmentManagement/RerunShipmentModal";
import PullFreightModal from "../ShipmentsDashboard/Financial/PullFreightModal";
import AttachFilesModal from "../ShipmentsDashboard/DocumentManagement/AttachFilesModal";
import UploadModal from "../ShipmentsDashboard/DocumentManagement/UploadModal";
import OpenVideosModal from "../ShipmentsDashboard/SpecialFeatures/OpenVideosModal";
import AddDeliveryOrderModal from "../ShipmentsDashboard/SpecialFeatures/AddDeliveryOrderModal";
import AddManagedByModal from "../ShipmentsDashboard/SpecialFeatures/AddManagedByModal";
import IncreasePriceModal from "../ShipmentsDashboard/Financial/IncreasePriceModal";
import UpdateStatusModal from "../ShipmentsDashboard/ShipmentManagement/UpdateStatusModal";
import HeaderActions from "../ShipmentsDashboard/HeaderActions/HeaderActions";
import { useSnackbar } from "@/hooks/snackBar";
import JdeBookShipment from "../ShipmentsDashboard/SpecialFeatures/JdeBookShipment";
import BulkUploadShipments from "../ShipmentsDashboard/DocumentManagement//BulkUploadShipments";
import ShareModal from "../ShipmentsDashboard/Communication/ShareModal";
import CancelShipmentModal from "../ShipmentsDashboard/ShipmentManagement/CancelShipmentModal";
import MailModal from "../ShipmentsDashboard/Communication/MailModal";
import CreatePaymentAdvanceModal from "../ShipmentsDashboard/Financial/CreatePaymentAdvanceModal";
import EditLocationsModal from "../ShipmentsDashboard/LocationTracking/EditLocationsModal";
import PrintLRModal from "../ShipmentsDashboard/DocumentManagement/PrintLRModal";
import AddGpsConnectionModal from "../ShipmentsDashboard/LocationTracking/AddGpsConnectionModal";
import ConfirmationDialog from '../UI/ConfirmationDialog/ConfirmationDialog';
import RecalculateDistanceModal from '../ShipmentsDashboard/Financial/RecalculateDistanceModal';
import InvoiceTypeModal from '../ShipmentsDashboard/Financial/InvoiceTypeModal';
import ReasonDialog from '@/components/ShipmentsDashboard/Others/ReasonDialog';
import UpdateCarrierFreight from '../ShipmentsDashboard/Others/UpdateCarrierFreight';
import MarkFaultyModal from '../ShipmentsDashboard/ShipmentManagement/MarkFaultyModal';
import MissedShipmentModal from "./ShipmentManagement/MissedShipmentModal";
import MissedEventModal from "./SpecialFeatures/MissedEventModal";
import RetriggerEventModal from "./SpecialFeatures/RetriggerEventModal";
import DriverExpenses from "./SpecialFeatures/DriverExpenses";
import GeofenceEditor from "./SpecialFeatures/GeofenceEditor";
import { LocationDialog } from "./LocationTracking/LocationDialog";
import TotalFreightModal from "./SpecialFeatures/TotalFreightModal";
import { HelpCircle } from "lucide-react";


interface Shipment {
  isVehicleId: any;
  disableInvoiceEdit: any;
  assigned_driver: any;
  assigned: string;
  firstPickupLocation: string;
  lastDeliveryLocation: string;
  inboundShippers: any;
  isOwnFleet_shipment: any;
  client_rate: any;
  rate: any;
  drop: any;
  organization: any;
  unique_code: any;
  epods: any;
  _id: string;
  sin: string;
  status: string;
  materials: Material[]; 
  pickups?: LocationDetails[]; 
  deliveries?: LocationDetails[];
  carrier?: Carrier; 
  from: Array<{
    location: { name: string; city: string; _id: string };
    finished_at?: string;
  }>;
  to: Array<{
    location: { name: string; city: string; _id: string };
    finished_at?: string;
  }>;
  carrier_parent_name: string;
  vehicleNumber: string;
  driverName: string;
  driverMobile: string;
  scheduledDate: string;
  scheduledDeliveryDate: string;
  actualPickupDate: string;
  actualDeliveryDate: string;
  frieght_price: number;
  material: Array<{ name: string }>;
  selected: boolean;
  delayed_shipment: boolean;
  trip_tracker?: {
    last_location_address: string;
    last_location_at: string;
    methods?: string[];
  };
  booked_by: string;
  ppd?: string;
  serial_number?: string;
  is_unplanned?: boolean;
  sale_order?: string;
  destination_code?: string;
  trackConsent: boolean;
  subscriptionStatus: boolean;
  showGreenConsent: boolean;
  showRedConsent: boolean;
  epods_available: boolean;
  trans_vehicle_no: Array<{
    vehicle_no: string;
    remark: string;
    date: string;
  }>;
  gpsProvider?: string;
  gps_disconnection_reason?: any[];
  delay_reason?: any[];
}
interface Carrier {
  _id: string;
  name: string;
  parent_name: string;
  // ... other carrier properties if they exist in your data
}
interface LocationDetails {
  location: Location;
}
interface Location {
  _id: string;
  name: string;
  area: string;
  city: string;
}
interface Material {
  _id: string;
  name: string;
}
interface Insight {
  text: string;
  icon: string;
  color: "green" | "orange" | "blue" | "default";
}

interface FilterOption {
  id: string;
  label: string;
  selected: boolean;
}

interface AnalyticsData {
  totalShipments: number;
  totalFreightValue: number;
  averageFreight: number;
  activeCarriers: number;
  delayedShipments: number;
  highPriority: number;
}

interface Location {
  _id: string;
  name: string;
  area: string;
  city: string;
  shipper?: string;
  geo_fence?: {
    coordinates: number[][][];
  };
}

interface ShipperPrefs {
  locations: Location[];
  deliveryLocations: Location[];
}
type ParentFlags = {
  parentRaw: string | null;  // e.g., "TechNova Imaging Systems Pvt Ltd"
  parent: string;            // normalized, e.g., "technova"
  isTechnova: boolean;
  isMykl: boolean;
  isModenik: boolean;
  isEmami: boolean;
  isjspl: boolean;
 isbmw: boolean;
  istatapower: boolean;
 };
 
 
 // Try a few common keys and shapes you already use in LS
//  function readParentFromLocalStorage(): string | null {
//   const keys = ["parent", "shippers", "shipper", "selectedShipper"];
//   for (const k of keys) {
//     const raw = localStorage.getItem(k);
//     if (!raw) continue;
 
 
//     // If JSON, try known fields; else treat as plain string
//     try {
//       if (raw.trim().startsWith("{") || raw.trim().startsWith("[")) {
//         const obj = JSON.parse(raw);
//         const name =
//           obj?.parent_name ||
//           obj?.parent?.name ||
//           obj?.parent ||
//           obj?.name ||
//           obj?.company ||
//           null;
//         if (typeof name === "string" && name.trim()) return name.trim();
//       } else {
//         if (raw.trim()) return raw.trim();
//       }
//     } catch {
//       if (raw.trim()) return raw.trim();
//     }
//   }
//   return null;
//  }
// Corrected readParentFromLocalStorage function
function readParentFromLocalStorage(): string | null {
  const keys = ["parent", "shippers", "shipper", "selectedShipper"];
  for (const k of keys) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;

    try {
      // Check if it's a JSON object or array
      if (raw.trim().startsWith("{") || raw.trim().startsWith("[")) {
        const obj = JSON.parse(raw);

        let parentName = null;
        if (Array.isArray(obj) && obj.length > 0) {
          // If it's an array, get the parent_name from the first object
          parentName = obj[0]?.parent_name || null;
        } else if (typeof obj === "object") {
          // If it's a single object, get the parent_name directly
          parentName =
            obj?.parent_name ||
            obj?.parent?.name ||
            obj?.parent ||
            obj?.name ||
            obj?.company ||
            null;
        }

        if (typeof parentName === "string" && parentName.trim()) {
          return parentName.trim();
        }
      } else {
        // Handle a simple string value
        if (raw.trim()) {
          return raw.trim();
        }
      }
    } catch {
      // If parsing fails, fall back to the raw string
      if (raw.trim()) {
        return raw.trim();
      }
    }
  }
  return null;
}
 function normalizeName(n: string | null): string {
  if (!n) return "";
  return n
  .toLowerCase()
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "") // keep only a-z0-9
  .replace(/(privatelimited|private|limited|ltd|llp|plc|co|company|systems|imaging|india|pvt)/g, "");
}


// Map normalized name to flags; include common typos/variants
// function getParentFlags(): ParentFlags {
// const raw = readParentFromLocalStorage();
// const norm = normalizeName(raw);

// const isTechnova = raw === "TechNova Imaging Systems Pvt Ltd";
//   const isMykl     = raw === "MYK Laticrete India Private Limited";
  
//   // Use the normalized name or raw name for partial matches.
//   // The original code uses .includes() for JSPL, so let's replicate that.
//   const isjspl = rawLower.includes('jsp') || rawLower.includes('jspl angul');
// // // include typo “techonva” and spacing variants
// // const isTechnova = /(TechNova|techonva)/.test(norm);
// // const isMykl     = /mykl/.test(norm);
// const isModenik  = /Modenik/.test(norm);
// const isEmami    = /Emami/.test(norm);
// // const isjspl=/JSPL/.test(norm);
// const isbmw=/bmw/.test(norm);
// const istatapower=/tatpower/.test(norm);


// return { parentRaw: raw, parent: norm, isTechnova, isMykl, isModenik, isEmami,isjspl,isbmw,istatapower };
// }
function getParentFlags(): ParentFlags {
  const raw = readParentFromLocalStorage();
  const norm = normalizeName(raw);
  console.log("Raw parent name from local storage:", raw);
  console.log("Normalized parent name:", norm);

  const isTechnova = raw === "TechNova Imaging Systems Pvt Ltd";
  const isMykl     = raw === "MYK Laticrete India Private Limited";
  
  // Use a case-insensitive check and trim for robustness
  const rawLower = raw?.toLowerCase().trim() ?? '';
  const isjspl = rawLower.includes('jsp') || rawLower.includes('jspl angul');
  console.log("isjspl check (rawLower):", rawLower);
  console.log("isjspl result:", isjspl);
  // You had these in the original function as well.
  const isModenik  = /modenik/.test(norm);
  const isEmami    = /emami/.test(norm);
  const isbmw      = /bmw/.test(norm);
  const istatapower= /tatpower/.test(norm);

  return { parentRaw: raw, parent: norm, isTechnova, isMykl, isModenik, isEmami, isjspl, isbmw, istatapower };
}
const ShipmentsDashboard: React.FC = () => {
  const [rawShipmentResponse, setRawShipmentResponse] = useState<any>(null);
  const { showMessage } = useSnackbar();
  // State management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [totalShipments, setTotalShipments] = useState(0);
  const [shipmentType, setShipmentType] = useState<
    "all" | "outbound" | "inbound" | "others"
  >("all");
  const [isLoading, setIsLoading] = useState(false);

  const [showButtons, setShowButtons] = useState(false);
  const [isAnalyticsView, setIsAnalyticsView] = useState(false);
  const [isCompactView, setIsCompactView] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [defaultDetailsTab, setDefaultDetailsTab] = useState<string | undefined>(undefined);


  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [searchType, setSearchType] = useState("SIN");

  // Advanced filters
  const [invoiceNo, setInvoiceNo] = useState("");
  const [lrNumber, setLrNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedCarriers, setSelectedCarriers] = useState<FilterOption[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<
    FilterOption[]
  >([]);
  const [selectedMaterials, setSelectedMaterials] = useState<FilterOption[]>(
    []
  );
  const [selectedPickups, setSelectedPickups] = useState<FilterOption[]>([]);
  const [selectedDeliveries, setSelectedDeliveries] = useState<FilterOption[]>(
    []
  );

  const [isEpodModalOpen, setIsEpodModalOpen] = useState(false);
  const [selectedShipmentForEpod, setSelectedShipmentForEpod] =
    useState<Shipment | null>(null);
  const [selectedShipmentForAttach, setSelectedShipmentForAttach] =
    useState<Shipment | null>(null);

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalShipments: 8,
    totalFreightValue: 117750,
    averageFreight: 14719,
    activeCarriers: 7,
    delayedShipments: 2,
    highPriority: 1,
  });

  // Modal states
  const [showShipmentDetails, setShowShipmentDetails] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationPopupData, setLocationPopupData] = useState<{
    type: string;
    locations: any[];
    shipmentSin: string;
  } | null>(null);  
  const [showActiveCarriersPopup, setShowActiveCarriersPopup] = useState(false);
  const [showTotalFreightPopup, setShowTotalFreightPopup] = useState(false);
  const [showAverageFreightPopup, setShowAverageFreightPopup] = useState(false);
  const [showDelayedShipmentDialog, setShowDelayedShipmentDialog] = useState(false);
  const [showRerunDialog, setShowRerunDialog] = useState(false);
  const [showPullFreightDialog, setShowPullFreightDialog] = useState(false);
  const [showAttachDialog, setShowAttachDialog] = useState(false);
  const [showUpdateFreightDialog, setShowUpdateFreightDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLastKnownLocationDialog, setShowLastKnownLocationDialog] =
    useState(false);
  const [showOpenVideosDialog, setShowOpenVideosDialog] = useState(false);
  const [showAddDODialog, setShowAddDODialog] = useState(false);
  const [showAddManagedByDialog, setShowAddManagedByDialog] = useState(false);
  const [showIncreasePriceDialog, setShowIncreasePriceDialog] = useState(false);
  const [showAddRemarkDialog, setShowAddRemarkDialog] = useState(false);

  const [selectedShipmentSIN, setSelectedShipmentSIN] = useState("");
  const [pullFreightData, setPullFreightData] = useState<{
    _id: string;
    vehicleNo: string;
    pickup: string;
    sin: string;
    destinations: Array<{
      name: string;
      area?: string;
      city: string;
      _id: string;
    }>;
  }>({
    _id: "",
    vehicleNo: "",
    pickup: "",
    sin: "",
    destinations: []
  });
  const [selectedDealerType, setSelectedDealerType] = useState("");

  // Add these state variables at the top of your functional component
  const [showRoambeeModal, setShowRoambeeModal] = useState(false);
  const [selectedShipmentForRoambee, setSelectedShipmentForRoambee] =
    useState<Shipment | null>(null);
  const [isSubmittingRoambee, setIsSubmittingRoambee] = useState(false);

  const [shipmentStatusName, setShipmentStatusName] = useState<string[]>([]);

  const [vehicleNo, setVehicleNo] = useState("");
  const [shipmentSIN, setShipmentSIN] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [saleOrder, setSaleOrder] = useState("");
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [ppdNo, setPpdNo] = useState("");

  // Organization and carrier data
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [allCarriers, setAllCarriers] = useState<any[]>([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState<any>({
    name: "",
    id: "",
  });
  const [selectedCarrier, setSelectedCarrier] = useState<any>({
    name: "",
    id: "",
  });
  const [parentFlags, setParentFlags] = React.useState<ParentFlags>(() => getParentFlags());

  // Filter and dropdown data
  const [materialsArray, setMaterialsArray] = useState<any[]>([]);
  const [locationsArray, setLocationsArray] = useState<any[]>([]);
  const [pickupLocations, setPickupLocations] = useState<any[]>([]);
  const [deliveryLocations, setDeliveryLocations] = useState<any[]>([]);
  const [segmentations, setSegmentations] = useState<any[]>([]);
  const [selectedSegmentation, setSelectedSegmentation] = useState<any[]>([]);
  const [selectedAnalyticsRange, setSelectedAnalyticsRange] = useState("today");
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Analytics data

  const [analyticsSummary, setAnalyticsSummary] = useState<any>({
    totalShipments: 0,
    totalFreightValue: 0,
    averageFreight: 0,
    activeCarriers: 0,
  });
  const [totalFreightData, setTotalFreightData] = useState<any[]>([]);
  const [averageFreightData, setAverageFreightData] = useState<any[]>([]);
  const [userType, setUserType] = useState("");

  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [shipmentsArray, setShipmentsArray] = useState<any[]>([]);
  const [selectedShipmentsArray, setSelectedShipmentsArray] = useState<any[]>(
    []
  );
  const [isTechnova, setIsTechnova] = useState(false);
  const [isTata, setIsTata] = useState(false);
  const initialLoadDone = useRef(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showAddDO, setShowAddDO] = useState(false);

  const [showGpsModal, setShowGpsModal] = useState(false);
  const [selectedGps, setSelectedGps] = useState<string[]>([]);


  const [selectedShipmentForPriceIncrease, setSelectedShipmentForPriceIncrease] = useState<string>("");

  const [showMarkAsArrivedModal, setShowMarkAsArrivedModal] = useState(false);
  const [selectedShipmentForArrival, setSelectedShipmentForArrival] = useState<Shipment | null>(null);
  const [showCompleteShipmentModal, setShowCompleteShipmentModal] = useState(false);
  const [selectedShipmentForCompletion, setSelectedShipmentForCompletion] = useState<Shipment | null>(null);

  const [showMissedShipmentModal, setShowMissedShipmentModal] = useState(false);
  const [selectedShipmentForMissed, setSelectedShipmentForMissed] = useState<Shipment | null>(null)
  const [odcFilter, setOdcFilter] = useState<boolean>(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  const [locationDialogState, setLocationDialogState] = useState<{
    isOpen: boolean;
    shipmentId?: string;
  }>({ isOpen: false });

  const [freightType, setFreightType] = useState<'rate' | 'client_rate'>("rate");
  const [shipmentsFilter, setShipmentsFilter] = useState<any>({
    type_filter: "outbound",
  });
  const [advanceSearch, setAdvanceSearch] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("SIN");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );

  const [actionSearch, setActionSearch] = useState("");

  const [showFlushFreightConfirm, setShowFlushFreightConfirm] = useState(false);
  const [shipmentToFlush, setShipmentToFlush] = useState<Shipment | null>(null);
  const [isFlushingFreight, setIsFlushingFreight] = useState(false);
  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean;
    type: 'delay' | 'gps';
    shipmentId: string | null;
    sin: string;
  }>({
    open: false,
    type: 'delay',
    shipmentId: null,
    sin: ""
  });
const [selectedShipmentForGps, setSelectedShipmentForGps] = useState<any>(null);
const [showStatusModal, setShowStatusModal] = useState(false);
const [selectedShipmentForStatus, setSelectedShipmentForStatus] = useState<Shipment | null>(null);
const [showFaultyModal, setShowFaultyModal] = useState(false);
const [selectedShipmentForFaulty, setSelectedShipmentForFaulty] = useState<Shipment | null>(null);
const [showMissedEventModal, setShowMissedEventModal] = useState(false);
const [selectedShipmentForMissedEvent, setSelectedShipmentForMissedEvent] = useState<Shipment | null>(null);
const [showAddManagedByModal, setShowAddManagedByModal] = useState(false);
const [selectedShipmentForManagedBy, setSelectedShipmentForManagedBy] = useState<Shipment | null>(null);
// Add these state variables at the top with other state declarations
const [showRetriggerEventModal, setShowRetriggerEventModal] = useState(false);
const [selectedShipmentForRetrigger, setSelectedShipmentForRetrigger] = useState<Shipment | null>(null);
const [showDriverExpenses, setShowDriverExpenses] = useState(false);

// Add this near other state declarations
const [isGeofenceEditorOpen, setIsGeofenceEditorOpen] = useState(false);
const [selectedShipmentForGeofence, setSelectedShipmentForGeofence] = useState<Shipment | null>(null);
const [selectedSubFilters, setSelectedSubFilters] = useState<string[]>([]);
// Add this state to store the location data for the modal
const [combinedLocationData, setCombinedLocationData] = useState<{
  combinedLocation: string;
  pickupCity: string;
  pickupId: string;
  deliveryId: string;
  currentLocation: number[];
}>({
  combinedLocation: '',
  pickupCity: '',
  pickupId: '',
  deliveryId: '',
  currentLocation: []
});

const [roles, setRoles] = useState({
  owner: false,
  fleet: false, 
  shipment_admin: false,
  unit_admin: false,
  rate_card: false,
  finance: false
});

const [functions, setFunctions] = useState({
  shipment_management: false,
  hide_mobile: true,
  hide_freight: true
});

const [showTracking, setShowTracking] = useState(false);
const [showFreight, setShowFreight] = useState(false);
const [selectedShipperLocationID, setSelectedShipperLocationID] = useState("");

const handleSaveDO = async (doNumber: string) => {
  try {
    // Call your API to save the DO number
    // await saveDONumber(currentShipmentNo, doNumber);
    setShowAddDO(false);
    // Refresh your data or show success message
  } catch (error) {
    console.error("Failed to save DO number:", error);
  }
};

const helpDataInbound = [
  { head: 'Help', data: 'View all the inbound shipments' },
];
const helpDataOutbound = [
  { head: 'Help', data: 'View all the outbound shipments' },
];
const helpDataOthers = [
  { head: 'Help', data: 'View all other shipments' },
];

const openInvoiceVideos = () => {
  setShowOpenVideosDialog(true);
};

const openLocationsPopup = (
  type: string,
  locations: any[],
  shipment: any
) => {
  if (!shipment) {
    console.error('No shipment data provided');
    return;
  }
  
  const locationsArray = Array.isArray(locations) ? locations : [];
  
  // Add date information to each location
  const locationsWithDates = locationsArray.map((loc) => ({
    ...loc,
    scheduledDate:
      type === "pickup"
        ? shipment.scheduledDate
        : shipment.scheduledDeliveryDate,
    actualDate:
      type === "pickup"
        ? shipment.actualPickupDate
        : shipment.actualDeliveryDate,
  }));

  setLocationPopupData({
    type: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
    locations: locationsWithDates,
    shipmentSin: shipment.sin, // Changed from shipmentId to sin to match the LocationModal props
  });
  setShowLocationPopup(true);
};
useEffect(() => {
  console.log('locationPopupData:', locationPopupData);
}, []);

const openVideo = (url: string) => {
  setVideoUrl(url);
  setShowVideo(true);
};

useEffect(() => {
  // Read 'shippers' from localStorage and parse
  try {
    const shipperData = JSON.parse(localStorage.getItem("shippers") || "[]");
    if (
      shipperData &&
      shipperData.length > 0 &&
      shipperData[0].parent_name === "TechNova Imaging Systems Pvt Ltd"
    ) {
      setIsTechnova(true);
    } else {
      setIsTechnova(false);
    }
  } catch (error) {
    setIsTechnova(false);
  }
}, []);

useEffect(() => {
  // Read 'shippers' from localStorage and parse
  try {
    const shipperData = JSON.parse(localStorage.getItem("shippers") || "[]");
    if (
      shipperData &&
      shipperData.length > 0 &&
      shipperData[0].parent_name === "Tata Power Ltd"
    ) {
      setIsTata(true);
    } else {
      setIsTata(false);
    }
  } catch (error) {
    setIsTata(false);
  }
}, []);


// Add this with other handler functions
const handleOpenGeofenceEditor = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForGeofence(shipment);
  setIsGeofenceEditorOpen(true);
};

  const handleOpenReasonDialog = (type: 'delay' | 'gps', shipmentId: string, sin: string) => {
    setReasonDialog({
      open: true,
      type,
      shipmentId,
      sin
    });
  };

  const handleOpenGpsModal = (shipment: any) => {
    closeAllDialogs();
    setSelectedShipmentForGps(shipment);
    setSelectedGps([]); // Reset selected GPS
    setShowGpsModal(true);
  };
  
  const handleCloseReasonDialog = () => {
    setReasonDialog(prev => ({ ...prev, open: false }));
  };

  const handleDriverExpenseClick = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowDriverExpenses(true);
  };
  const handleViewDetails = (shipmentId: string) => {
    setSelectedShipmentId(shipmentId);
    setIsDetailsModalOpen(true);
  };
  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedShipmentId(null);
  };

  const handleFlushFreight = async (shipment: Shipment) => {
    closeAllDialogs();
    if (!shipment._id) {
      showMessage('Invalid shipment selected', 'error');
      return;
    }
    setShipmentToFlush(shipment);
    setShowFlushFreightConfirm(true);
  };

  const confirmFlushFreight = async () => {
    if (!shipmentToFlush?._id) {
      showMessage('No shipment selected', 'error');
      return;
    }

    setShowFlushFreightConfirm(false);
    setIsFlushingFreight(true);
  
    try {
      const response = await httpsPost('carrier_invoice/flushFreight', {
        _id: shipmentToFlush._id
      }, {}, 6);

      if (response.statusCode === 200) {
        showMessage('Freight flushed successfully', 'success');
        // Refresh the shipments list or update the UI as needed
        // fetchShipments();
      } else {
        showMessage(response.message || 'Failed to flush freight', 'error');
      }
    } catch (error: any) {
      console.error('Error flushing freight:', error);
      showMessage(
        error.message || 'Failed to flush freight. Please try again.',
        'error'
      );
    } finally {
      setIsFlushingFreight(false);
    }
  };

  const handleShareShipment = (shipment: Shipment) => {
  closeAllDialogs();
  const trackingUrl = `${window.location.origin}/track/${shipment.unique_code}`;
  setShareUrl(trackingUrl);
  setSharedShipment(shipment);
  setShareModalOpen(true);
};

const handleMailShipment = (shipment: Shipment) => {
  closeAllDialogs();
  setShipmentToMail(shipment);
  setMailModalOpen(true);
};

const handleCancelShipment = (shipment: Shipment) => {
  closeAllDialogs();
  setShipmentToCancel(shipment);
  setCancelModalOpen(true);
};

const handleSimTracking = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipment(shipment);
  setModalOpen(true);
};

const handlePullFreightWithRoutes = (shipment: Shipment) => {
  closeAllDialogs();
  setPullFreightData({
    _id: shipment._id,
    sin: shipment.sin,
    vehicleNo: shipment.vehicleNumber || "",
    pickup: shipment.from?.[0]?.location?.name || "",
    destinations: shipment.to?.map(dest => ({
      _id: dest.location?._id || "",
      name: dest.location?.name || "",
      city: dest.location?.city || ""
    })) || []
  });
  setShowPullFreightDialog(true);
};

const handleRecalculateDistanceClick = (shipment: Shipment) => {
  closeAllDialogs();
  handleRecalculateDistance(shipment);
};

const handleCreateAdvancePayment = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForPayment(shipment);
  setShowPaymentAdvanceModal(true);
};

const handleChangeInvoiceType = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForInvoiceType(shipment);
  setIsInvoiceTypeModalOpen(true);
};

const handleUploadApprovalDocuments = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForAttach(shipment);
  setShowAttachDialog(true);
};

const handleViewEpods = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForEpod(shipment);
  setIsEpodModalOpen(true);
};

const handleCompleteShipment = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForCompletion(shipment);
  setShowCompleteShipmentModal(true);
};

const handleMarkAsArrived = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForArrival(shipment);
  setShowMarkAsArrivedModal(true);
};

const handleBulkUploadCommercialInvoices = (shipment: Shipment) => {
  handleBulkUploadClick(shipment);
};

const handleAddDODetails = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipment(shipment);
  setSelectedShipmentSIN(shipment.sin || shipment._id);
  setShowAddDODialog(true);
};

const handleUpdateShipmentStatus = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForStatus(shipment);
  setShowStatusModal(true);
};

const handleMarkFaultDevice = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForFaulty(shipment);
  setShowFaultyModal(true);
};

const handleMissedShipment = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForMissed(shipment);
  setShowMissedShipmentModal(true);
};

const handleMissedEvent = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForMissedEvent(shipment);
  setShowMissedEventModal(true);
};

const handleAddManagedBy = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForManagedBy(shipment);
  setShowAddManagedByModal(true);
};

const handleRetriggerMissedEvents = (shipment: Shipment) => {
  closeAllDialogs();
  setSelectedShipmentForRetrigger(shipment);
  setShowRetriggerEventModal(true);
};

const handleAddDriverExpenses = (shipment: Shipment) => {
  closeAllDialogs();
  handleDriverExpenseClick(shipment);
};

  const handleOpenDetailsOnTab = (shipment: Shipment, tab: string) => {
    closeAllDialogs();
    setDefaultDetailsTab(tab);
    setSelectedShipmentId(shipment._id);
    setIsDetailsModalOpen(true);
  };


  const handleCreatePaymentAdvice = (shipment: Shipment) => {
    closeAllDialogs();
    setSelectedShipmentForPayment(shipment);
    setShowPaymentAdviceModal(true);
  };


const actionMenuCategories = (shipment: Shipment) => {
  return {
    "Quick Actions": [
      { 
        icon: Eye, 
        label: "View", 
        color: "text-blue-600",
        show: true,
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          handleViewDetails(shipment._id);
        }
      },
      { 
        icon: Share2, 
        label: "Share", 
        color: "text-blue-500", 
        onClick: () => handleShareShipment(shipment),
        show: true,
        disabled: shipment.status != 'Assigned' && shipment.status != 'Completed' && shipment.status != 'Cancelled' && shipment.assigned != 'Pending'
      },
      { 
        icon: Mail, 
        label: "Mail", 
        color: "text-orange-600", 
        onClick: () => handleMailShipment(shipment),
        show: true,
        disabled: shipment.status != 'Assigned' && shipment.status != 'Completed' && shipment.status != 'Cancelled' && shipment.assigned != 'Pending'
      },
      { 
        icon: XCircle, 
        label: "Cancel", 
        color: "text-red-600", 
        onClick: () => handleCancelShipment(shipment),
        show: shipment.status !== 'Completed' && shipment.status !== 'Cancelled'
      },
    ],
    
    "Tracking & GPS": [
      { 
        icon: Download, 
        label: "SIM Tracking", 
        color: "text-amber-600", 
        onClick: () => handleSimTracking(shipment),
        show: showTracking,
        disabled: (shipment.status === 'Completed' || shipment.status === 'Assigned' || shipment.status === 'Cancelled')
      },
      { 
        icon: WifiOff, 
        label: "GPS Disconnection Reason", 
        color: "text-teal-600", 
        onClick: () => handleOpenReasonDialog('gps', shipment._id, shipment.sin),
        show: true
      },
      { 
        icon: Wifi, 
        label: "Add GPS Connection", 
        color: "text-amber-600", 
        onClick: () => handleOpenGpsModal(shipment),
        show: !!shipment.carrier
      },
      { 
        icon: Clock, 
        label: "Update Delay Reason", 
        color: "text-teal-600", 
        onClick: () => handleOpenReasonDialog('delay', shipment._id, shipment.sin),
        show: true
      },
    ],
    
    "Freight & Payment": [
      { 
        icon: Truck, 
        label: "Update Carrier Freight", 
        color: "text-gray-600", 
        onClick: () => handleOpenFreightModal(shipment._id, shipment.sin, 'rate'),
        show: shipment.rate?.type === 'manual' && showFreight
      },
      { 
        icon: Truck, 
        label: "Update Client Freight", 
        color: "text-yellow-600", 
        onClick: () => handleOpenFreightModal(shipment._id, shipment.sin, 'client_rate'),
        show: shipment.client_rate?.type === 'manual' && showFreight
      },
      { 
        icon: CreditCard, 
        label: "Create Payment Advice", 
        color: "text-indigo-600", 
        onClick: () => handleCreateAdvancePayment(shipment),
        show: !shipment.isOwnFleet_shipment && shipment.status !== 'Cancelled'
      },
      { icon: FileText, label: "Change Invoice Type", color: "text-brown-600", onClick: handleChangeInvoiceType, show: true },
    ],
    
    "Shipment Management": [
      { 
        icon: PlusCircle, 
        label: "Add DO Details", 
        color: "text-blue-600", 
        onClick: () => handleAddDODetails(shipment),
        show: shipment.status === 'Accepted'
      },
      { 
        icon: Edit, 
        label: "Update Shipment Status", 
        color: "text-yellow-600", 
        onClick: () => handleUpdateShipmentStatus(shipment),
        show: (roles.shipment_admin || roles.owner) && shipment.status === 'In Transit'
      },
      { 
        icon: CheckCircle, 
        label: "Complete Shipment", 
        color: "text-green-600", 
        onClick: () => handleCompleteShipment(shipment),
        show: (functions.shipment_management || (roles.owner || roles.fleet)) && 
              (!shipment.inboundShippers || 
               (selectedShipperLocationID === shipment.lastDeliveryLocation) || 
               (selectedShipperLocationID === shipment.firstPickupLocation)),
        disabled: (shipment.status === 'Completed' || shipment.status === 'Cancelled')
      },
      { 
        icon: CheckCircle, 
        label: "Submit Mark As Arrived", 
        color: "text-green-600", 
        onClick: () => handleMarkAsArrived(shipment),
        show: functions.shipment_management || (roles.owner || roles.fleet),
        disabled: (shipment.status === 'Completed' || shipment.status === 'Cancelled')
      },
      { 
        icon: RefreshCw, 
        label: "Reassign", 
        color: "text-blue-600",
        show: shipment.isOwnFleet_shipment && !shipment.carrier && (roles.owner || roles.fleet),
        disabled: (shipment.status === 'Completed' || shipment.status === 'Cancelled')
      },
      ...(parentFlags.isjspl
        ? [{ 
            icon: AlertCircle, 
            label: "Mark Fault Device", 
            color: "text-red-600", 
            onClick: () => handleMarkFaultDevice(shipment),
            show: shipment.assigned_driver?.vehicle && !!shipment.assigned_driver.vehicle.gps
          } as const]: []),
      ...(parentFlags.isjspl
        ? [{ 
            icon: AlertCircle, 
            label: "Missed Event", 
            color: "text-red-600", 
            onClick: () => handleMissedEvent(shipment),
            show: true
          } as const] : []),
    ],
    
    "Documents & Status": [
      { 
        icon: FileText, 
        label: "Upload Approval Documents", 
        color: "text-purple-600", 
        onClick: () => handleUploadApprovalDocuments(shipment),
        show: shipment.rate?.type === 'manual'
      },
      { 
        icon: Package, 
        label: "View Epods", 
        color: "text-brown-600", 
        onClick: () => handleViewEpods(shipment),
        show: !!shipment.carrier
      },
      { 
        icon: Upload, 
        label: "Upload ePOD", 
        color: "text-green-600",
        show: shipment.isOwnFleet_shipment && !shipment.carrier && (roles.owner || roles.fleet)
      },
      { 
        icon: Upload, 
        label: "Request ePOD", 
        color: "text-green-600",
        show: shipment.isOwnFleet_shipment && !shipment.carrier && (roles.owner || roles.fleet)
      },
      { 
        icon: Upload, 
        label: "Bulk Upload - Commercial Invoices", 
        color: "text-green-600", 
        onClick: () => handleBulkUploadCommercialInvoices(shipment),
        show: !shipment.disableInvoiceEdit && (shipmentType === 'outbound' || shipmentType === 'all')
      },
    ],

    "Advanced": [
      { 
        icon: UserPlus, 
        label: "Add Managed By", 
        color: "text-blue-600", 
        onClick: () => handleAddManagedBy(shipment),
        show: !!shipment.isOwnFleet_shipment
      },
      ...(parentFlags.isMykl
        ? [{ 
            icon: RefreshCw, 
            label: "ReTrigger Missed Events", 
            color: "text-blue-600", 
            onClick: () => handleRetriggerMissedEvents(shipment),
            show: true
          } as const]: []),
      { 
        icon: Plus, 
        label: "Add Driver Expenses", 
        color: "text-green-600", 
        onClick: () => handleAddDriverExpenses(shipment),
        show: ((shipment.isOwnFleet_shipment && !shipment.carrier) || 
               shipment.status === 'Completed') && !!shipment.isVehicleId
      },
      { icon: Plus, label: "Add/Edit Geofence", color: "text-green-600", onClick: () => handleOpenGeofenceEditor(shipment), show: true },
      { icon: Truck, label: "Flush Freight", color: "text-gray-600", onClick: () => handleFlushFreight(shipment), show: true },
    ],
    
    "Location & Routes": [
      { 
        icon: Edit, 
        label: "Edit Pickup Location", 
        color: "text-pink-600", 
        onClick: () => handleOpenEditLocation(shipment, 'pickup'), 
        show: true,
        disabled: ['Completed', 'Cancelled'].includes(shipment.status) 
      },
      { 
        icon: Edit, 
        label: "Edit Delivery Location", 
        color: "text-pink-600", 
        onClick: () => handleOpenEditLocation(shipment, 'delivery'), 
        show: true,
        disabled: ['Completed', 'Cancelled'].includes(shipment.status) 
      },
      { 
        icon: Calculator, 
        label: "Recalculate Distance", 
        color: "text-pink-600", 
        onClick: () => handleRecalculateDistanceClick(shipment),
        show: true
      },
      { 
        icon: Route, 
        label: "Pull Freight with Routes", 
        color: "text-brown-600", 
        onClick: () => handlePullFreightWithRoutes(shipment),
        show: true
      },
      { icon: DoorOpen, label: "Recalculate Customer Gate In/Out", color: "text-pink-600", onClick: (shipment: Shipment) => handleRecalculateGateInOut(shipment), disabled: (shipment: Shipment) => ["Completed", "Cancelled"].includes(shipment.status), show: shipment.trip_tracker?.methods?.includes('GPS') },
      // { 
      //   icon: RefreshCw, 
      //   label: "Rerun", 
      //   color: "text-blue-600",
      //   show: shipment.trip_tracker?.methods?.includes('GPS')
      // },
    ],

    // "Loading/Unloading": [
    //   { 
    //     icon: Upload, 
    //     label: shipmentsFilter.type_filter === 'outbound' ? "Add Loading Changes" : "Add Unloading Changes", 
    //     color: "text-green-600",
    //     onClick: () => handleBoundShippers(shipment, shipmentsFilter.type_filter),
    //     show: shipmentsFilter.type_filter === 'inbound' || shipmentsFilter.type_filter === 'outbound'
    //   }
    // ]
  };
};

// Add functions to initialize roles and functions
const getRoles = () => {
  try {
    const rolesData = JSON.parse(localStorage.getItem('roles') || '[]');
    const newRoles = {
      owner: false,
      fleet: false,
      shipment_admin: false,
      unit_admin: false,
      rate_card: false,
      finance: false
    };

    rolesData.forEach((element: any) => {
      if (element.value === 'accountowner') newRoles.owner = true;
      if (element.value === 'fleetshipmentexecutive' || element.value === 'fleetshipmentadministrator') newRoles.fleet = true;
      if (element.value === 'unitadministrator') newRoles.unit_admin = true;
      if (element.value === 'ratecardadministrator' || element.value === 'ratecardexecutive') newRoles.rate_card = true;
      if (element.value === 'financeexecutive' || element.value === 'financeadministrator') newRoles.finance = true;
      if (element.value === 'shipmentadministrator') newRoles.shipment_admin = true;
    });

    setRoles(newRoles);
  } catch (error) {
    console.error('Error parsing roles:', error);
  }
};

const getFunctions = () => {
  try {
    const functionsData = JSON.parse(localStorage.getItem('functions') || '[]');
    const newFunctions = {
      shipment_management: false,
      hide_mobile: true,
      hide_freight: true
    };

    functionsData.forEach((element: any) => {
      if (element.value === 'manageshipment') newFunctions.shipment_management = true;
      if (element.value === 'hidemobilenumber') newFunctions.hide_mobile = false;
      if (element.value === 'hideshipmentfreight') newFunctions.hide_freight = false;
    });

    setFunctions(newFunctions);
    setShowFreight(!newFunctions.hide_freight || roles.owner || roles.rate_card || roles.finance || roles.unit_admin);
  } catch (error) {
    console.error('Error parsing functions:', error);
  }
};

// Add this useEffect to initialize roles and functions
useEffect(() => {
  getRoles();
  getFunctions();
  
  // Check if tracking should be shown
  const environment = process.env.NODE_ENV;
  setShowTracking(environment === 'development' || process.env.NEXT_PUBLIC_COUNTRY === 'IN');
}, []);


const closeActionMenu = () => {
  console.log("closeActionMenu executed, closing dropdown");
  setActionMenuOpenId(null);
};

  useEffect(() => {
    console.log('showAttachDialog state changed:', showAttachDialog);
  }, [showAttachDialog]);

  const subFilters = [
    { key: "SP", label: "Towards Pickup", count: 0, color: "#16a085" },
    { key: "AP", label: "At Pickup", count: 0, color: "#3498db" },
    { key: "INPLANT", label: "In Plant", count: 0, color: "#a502b0" },
    { key: "ITNS", label: "In Transit", count: 0, color: "#f39c12" },
    // { key: "ALD", label: "About to Reach", count: 0, color: "#34495e" },
    { key: "ALD", label: "At Delivery", count: 0, color: "#667eea" },
    { key: "CPTD", label: "Completed", count: 0, color: "#2ecc40" },
    { key: "CNCL", label: "Cancelled", count: 0, color: "#e74c3c" },
    // { key: "delayed", label: "Delayed", count: 0, color: "#ed8936" },
  ];

  const analyticsLifeCycle = [
    {
      stage: "Order Creation",
      subtitle: "New orders received from customers",
      icon: "inventory_2",
      total: 150,
      slaHit: 84,
      throughput: { onTime: 120, delayed: 20, waiting: 10 },
      time: "12h",
    },
    {
      stage: "Carrier Assignment",
      subtitle: "Orders assigned to logistics partners",
      icon: "assignment_ind",
      total: 145,
      slaHit: 95,
      throughput: { onTime: 115, delayed: 25, waiting: 5 },
      time: "17h",
    },
    {
      stage: "Vehicle Assignment",
      subtitle: "Shipments assigned to specific vehicles",
      icon: "local_shipping",
      total: 140,
      slaHit: 95,
      throughput: { onTime: 110, delayed: 22, waiting: 8 },
      time: "28h",
    },
    {
      stage: "Transit",
      subtitle: "Shipments currently in transit",
      icon: "transfer_within_a_station",
      total: 125,
      slaHit: 87,
      throughput: { onTime: 85, delayed: 30, waiting: 10 },
      time: "52m",
    },
    {
      stage: "Delivery",
      subtitle: "Shipments delivered to customers",
      icon: "task_alt",
      total: 95,
      slaHit: 87,
      throughput: { onTime: 75, delayed: 15, waiting: 5 },
      time: "N/A",
    },
    {
      stage: "ePOD",
      subtitle: "Electronic Proof of Delivery received",
      icon: "check_circle",
      total: 80,
      slaHit: 93,
      throughput: { onTime: 70, delayed: 8, waiting: 2 },
      time: "N/A",
    },
  ];

  const analyticsInsights = [
    {
      text: "Shipment volume increased by 12.5% compared to last week",
      icon: "check_circle",
      color: "green",
    },
    {
      text: "Delayed shipments increased by 15.2% - consider reviewing carrier performance",
      icon: "warning",
      color: "orange",
    },
    {
      text: "FLYJAC-MWH division showing strongest performance with highest shipment count",
      icon: "trending_up",
      color: "blue",
    },
    {
      text: "Carrier diversity remains stable with 7 active partners",
      icon: "people",
      color: "default",
    },
  ];

  const activeCarriersData = [
    {
      carrier: "PATANJALI PARIVAHAN PVT LTD",
      sin: "SH001",
      totalFreight: 12500,
      divisions: "FLYJAC-MWH",
    },
    {
      carrier: "Rajhans parivahan pvt ltd",
      sin: "SH002",
      totalFreight: 10000,
      divisions: "P5-MWH",
    },
    {
      carrier: "KIRAT LOGISTICS",
      sin: "SH003",
      totalFreight: 8000,
      divisions: "P5-MWH",
    },
    {
      carrier: "V-Trans(India)Limited",
      sin: "SH004",
      totalFreight: 15000,
      divisions: "FLYJAC-MWH",
    },
  ];

  useEffect(() => {
    setShowButtons(selectedShipmentsArray.length > 0);
  }, [selectedShipmentsArray]);

  const handleShipmentTypeChange = (
    type: "outbound" | "inbound" | "others" | "all"
  ) => {
    setShipmentType(type);
    setCurrentPage(0);
    fetchShipments({ type_filter: type });
  };

  const handleSubFilterSelect = (filterKey: string) => {
    const updatedFilters = selectedSubFilters.includes(filterKey)
      ? selectedSubFilters.filter(key => key !== filterKey)
      : [...selectedSubFilters, filterKey];
  
    setSelectedSubFilters(updatedFilters);
    setCurrentPage(0);
  
    const filterObj: any = {
      skip: 0,
      limit: pageSize,
      odc: odcFilter
    };
  
    if (updatedFilters.length > 0) {
      filterObj.status = updatedFilters;  
    }
    
    fetchShipments(filterObj);
  };

  // const fetchDropdownData = async () => {
  //   try {
  //     const response = await fetch("/api/dropdowns");
  //     const data = await response.json();

  //     if (data.statusCode === 200) {
  //       // setMaterialsArray(data.data.materials || []);
  //       setLocationsArray(data.data.locations || []);
  //       setPickupLocations(data.data.pickup_locations || []);
  //       setDeliveryLocations(data.data.delivery_locations || []);
  //       setSegmentations(data.data.segmentations || []);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching dropdown data:", error);
  //   }
  // };

  // const fetchOrganizations = async () => {
  //   try {
  //     const response = await fetch("/api/organizations");
  //     const data = await response.json();
  //     setOrganizations(data.data || []);
  //   } catch (error) {
  //     console.error("Error fetching organizations:", error);
  //   }
  // };

  const fetchCarriers = async () => {
    try {
      const response = await httpsGet("carriers", 0);
      const data = response.data;
      setAllCarriers(data || []);
    } catch (error) {
      console.error("Error fetching carriers:", error);
    }
  };

  const shipmentStatus = [
    { name: "PNDG", value: "Pending" },
    { name: "ASN", value: "Assigned" },
    { name: "ACPT", value: "Accepted" },
    { name: "SP", value: "Towards Pickup" },
    { name: "AP", value: "At Pickup" },
    { name: "ITNS", value: "In Transit" },
    { name: "ABTR", value: "About to Reach" },
    { name: "ALD", value: "At Delivery" },
    { name: "CPTD", value: "Completed" },
    { name: "CNCL", value: "Cancelled" },
  ];

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setInvoiceNo("");
    setLrNumber("");
    setSelectedMaterials([]);
    setSelectedPickups([]);
    setSelectedDeliveries([]);
    setSelectedCarriers([]);
    setShipmentStatusName([]);
    setMobile("");
    setVehicleNo("");
    setShipmentSIN("");
    setProjectCode("");
    setSaleOrder("");
    setPurchaseOrder("");
    setPpdNo("");
    setSelectedOrganisation({ name: "", id: "" });
    setSelectedSegmentation([]);
    setOdcFilter(false);
    setSelectedSubFilters([]);

    fetchShipments();
  };

  // useEffect(() => {
  //   fetchDropdownData();
  //   fetchOrganizations();
  //   fetchCarriers();
  // }, []);

  const toggleAnalyticsView = () => {
    setIsAnalyticsView(!isAnalyticsView);
  };

  const toggleCompactView = () => {
    setIsCompactView(!isCompactView);
  };

  const openActiveCarriersPopup = () => {
    setShowActiveCarriersPopup(true);
  };

  const submitIncreasePrice = async () => {
    try {
      const response = await httpsPost("rates/refresh-freight", {
        shipments: selectedShipmentsArray,
        dealer_type: selectedDealerType,
      }, {},4);
      if (response.statusCode === 200) {
        showMessage("Freight recalculated successfully", "success");
        setShowIncreasePriceDialog(false);
        fetchShipments();
      }
    } catch (error) {
      console.error("Error recalculating freight:", error);
      showMessage("Error recalculating freight", "error");
    }
  };

  const handleBulkUploadFileChange = async (files: FileList) => {
    try {
      console.log("Files to upload:", files);

      // Example: Create FormData and upload files
      // const formData = new FormData();
      // Array.from(files).forEach((file) => {
      //   formData.append('files', file);
      // });
      //
      // const response = await httpsPost('api/upload/commercial-invoices', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      //
      // if (response.success) {
      //   setShowUploadModal(false);
      //   // Optionally refresh the data
      //   fetchShipments();
      // }

      // For now, just close the modal after a short delay
      setTimeout(() => {
        setShowUploadModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const tableRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const copyDestinationCode = (destination_code: string) => {
    if (destination_code !== "") {
      navigator.clipboard.writeText(destination_code);
      console.log("Copied:", destination_code);
    }
  };

  const toShortDateTime = (date: any, format?: string) => {
    if (!date) return "";
    const dateObj = new Date(date);
    return dateObj.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const timeConvert = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hrs ${minutes} mins`;
  };

  const fetchShipments = async (type: any = {}) => {
    if (advanceSearch) {
      // Add all advance search filters here
      // (converted from Angular advance search logic)
    }

    
    setShowLoader(true);
    
    const filters: any = {};

    if (odcFilter !== null) {
      filters.odc = odcFilter;
    }

    if (typeof type === "object" && type !== null && !Array.isArray(type)) {
    Object.assign(filters, type);
  }

  const filterType = type.type_filter || shipmentType;

  if (filterType && filterType !== "all") {
    filters.type_filter = filterType;
  }

    filters.limit = pageSize;
    filters.skip = currentPage * pageSize;

    if (inputQuery !== "" && inputQuery.length > 0 && searchValue) {
      if (searchValue === "vehicle_no") {
        filters[searchValue] = inputQuery.toUpperCase();
      } else {
        filters[searchValue] = inputQuery;
      }
    }

    setSelectedShipmentsArray([]);

    setShowButtons(false);

    try {
      const response = await httpsPost("shipment/many", filters, {}, 5);

      console.log("Response:", response.data);
      setRawShipmentResponse(response.data);
     
        if (response.statusCode === 200) {
          console.log("Response:", "calling");
          setTotalShipments(response.data.count);
          const result = response.data.shipments;
          const processedShipments: any[] = [];
          // setPickupLocations(data.data.pickup_locations || []);
          //       setDeliveryLocations(data.data.delivery_locations || []);
          const allPickupLocations: Location[] = [];
  
          result.forEach((shipment: Shipment) => {
            if (shipment.pickups && Array.isArray(shipment.pickups)) {
              shipment.pickups.forEach(pickup => {
                // Check if the location is already in our array
                const isDuplicate = allPickupLocations.some(
                  (existingLoc) => existingLoc._id === pickup.location._id
                );
    
                // If it's not a duplicate, add it to our array
                if (pickup.location && pickup.location._id && !isDuplicate) {
                  allPickupLocations.push({
                    _id: pickup.location._id,
                    name: pickup.location.name,
                    area: pickup.location.area,
                    city: pickup.location.city,
                  });
                }
              });
            }
          });
          console.log("Unique pickup locations collected:", allPickupLocations);
        
          setPickupLocations(allPickupLocations);
          const allDeliveryLocations: Location[] = [];
  
          result.forEach((shipment: Shipment) => {
            if (shipment.deliveries && Array.isArray(shipment.deliveries)) {
              shipment.deliveries.forEach((delivery) => {
                // Check if the location is already in our array
                const isDuplicate = allDeliveryLocations.some(
                  (existingLoc) => existingLoc._id === delivery.location._id
                );
      
                // If it's not a duplicate, add it to our array
                if (delivery.location && delivery.location._id && !isDuplicate) {
                  allDeliveryLocations.push({
                    _id: delivery.location._id,
                    name: delivery.location.name,
                    area: delivery.location.area,
                    city: delivery.location.city,
                  });
                }
              });
            }
          });
      
          console.log("Unique delivery locations collected:", allDeliveryLocations);
          // set the state
          setDeliveryLocations(allDeliveryLocations);
         
          const allCarriers: Carrier[] = [];
  
          result.forEach((shipment: Shipment) => {
            if (shipment.carrier && shipment.carrier._id) {
              // 1. Declare and assign 'currentCarrier' inside the 'if' block
              const currentCarrier = shipment.carrier;
          
              // 2. Safely use 'currentCarrier' inside the same 'if' block
              const isDuplicate = allCarriers.some(
                (existingCarrier) => existingCarrier._id === currentCarrier._id
              );
          
              if (!isDuplicate) {
                allCarriers.push(currentCarrier);
              }
            }
          });
          
          console.log("Unique carriers collected:", allCarriers)
          setAllCarriers(allCarriers || []);
        
          // const uniqueMaterials = new Set();
          // const allMaterials: Material[] = [];
    
     
          // result.forEach((shipment:Shipment) => {
          //     if (shipment.materials && Array.isArray(shipment.materials)) {
          //         shipment.materials.forEach((material: Material) => {
          //             if (material && material._id && !uniqueMaterials.has(material._id)) {
          //                 uniqueMaterials.add(material._id);
          //                 allMaterials.push(material);
          //             }
          //         });
          //     }
          // });
          // console.log("Unique materials extracted from shipments:", allMaterials);
        
          // setMaterialsArray(allMaterials);
       // Build a distinct materials list (first by name, keep id for backend)
  
       const seenMaterialIds = new Set<string>();
  const uniqueMaterials: Material[] = [];
  
  for (const sh of (result as Shipment[])) {
    if (!Array.isArray(sh.materials)) continue;
  
    for (const m of sh.materials) {
      if (!m?._id) continue;               // must have id (we submit ids)
      const id = String(m._id);
      if (seenMaterialIds.has(id)) continue;
  
      seenMaterialIds.add(id);
      uniqueMaterials.push({ _id: id, name: m.name ?? "" });
    }
  }
  
  // Optional: sort for nicer UX
  uniqueMaterials.sort((a, b) => a.name.localeCompare(b.name));
  
  // Update the state once with the DISTINCT list
  setMaterialsArray(uniqueMaterials);
          

        result.forEach((element: any) => {
          const temp: any = {
            material: [],
          };

          temp._id = element._id;
          temp.sin = element.SIN;
          temp.do_number = element.do_number || "";
          temp.driver_expense_exists =
            element.driver_expense_paid !== undefined;
          temp.driver_expense_paid = element.driver_expense_paid || false;
          temp.unique_code = element.unique_code;
          temp.from = element.pickups;
          temp.to = element.deliveries;
          temp.selected = false;
          temp.uom = element.uom || "";
          temp.advance_amount = element.advance_amount;
          temp.delay_reason = element.delay_reason;
          temp.sale_order = element.sale_order || "";
          temp.gps_disconnection_reason = element.gps_disconnection_reason;
          temp.isSpotDriver = element.driver.driver_type === "temporary";

          temp.driver_type =
            (element.assigned_driver && element.assigned_driver.driver_type) ||
            "N/A";
          temp.assigned_driver = element.assigned_driver;
          temp.reqVehicleType =
            element.vehicle_type && element.vehicle_type.name
              ? element.vehicle_type.name
              : "N/A";

          temp.vehicle_id = element.driver
            ? element.driver.vehicle
            : element.assigned_driver
            ? element.assigned_driver.vehicle
            : "";
          temp.isVehicleId = temp.vehicle_id ? true : false;

          temp.vehicleType = element.driver
            ? element.driver.vehicle_type.name
            : element.assigned_driver
            ? element.assigned_driver.vehicle_type.name
            : "N/A";
          temp.vehicleNumber = element.driver
            ? element.driver.vehicle_no
            : element.assigned_driver
            ? element.assigned_driver.vehicle_no
            : "N/A";

          temp.driver_id = element.driver
            ? element.driver._id
            : element.assigned_driver
            ? element.assigned_driver._id
            : "";
          temp.driverName = element.driver
            ? element.driver.name
            : element.assigned_driver
            ? element.assigned_driver.name
            : "N/A";
          temp.driverMobile = element.driver
            ? element.driver.mobile
            : element.assigned_driver
            ? element.assigned_driver.mobile
            : "N/A";

          temp.notAccepted = !element.driver;

          temp.loading_charges = element.others
            ? element.others.loading_charges
            : "";
          temp.unloading_charges = element.others
            ? element.others.unloading_charges
            : "";
          temp.is_mykl = element.others ? element.others.s_mykl : false;
          temp.others = element.others;

          const mat = element.materials || [];
          temp.driverType =
            (element.assigned_driver && element.assigned_driver.driver_type) ||
            "";

          temp.gpsVehicle = false;
          if (
            element.assigned_driver &&
            element.assigned_driver.gps &&
            element.assigned_driver.gps.provider &&
            element.assigned_driver.gps.provider !== "none"
          ) {
            temp.gpsVehicle = true;
          }
          if (
            element.assigned_driver &&
            element.assigned_driver.vehicle &&
            element.assigned_driver.vehicle.gps &&
            element.assigned_driver.vehicle.gps.provider &&
            element.assigned_driver.vehicle.gps.provider !== "none"
          ) {
            temp.gpsVehicle = true;
          }

          mat.forEach((item: any) => {
            temp.material.push(item);
          });

          const shipStatus = [
            { name: "PNDG", value: "Pending" },
            { name: "ASN", value: "Assigned" },
            { name: "ACPT", value: "Accepted" },
            { name: "SP", value: "Towards Pickup" },
            { name: "AP", value: "At Pickup" },
            { name: "ITNS", value: "In Transit" },
            { name: "ABTR", value: "About to Reach" },
            { name: "ALD", value: "At Delivery" },
            { name: "CPTD", value: "Completed" },
            { name: "CNCL", value: "Cancelled" },
          ];

          temp.status =
            element.approved_by_shipper && element.approved_by_shipper.completed
              ? "Approved"
              : shipStatus.find((item) => item.name === element.latest_status)
                  ?.value || "Unknown";

          temp.carrier = element.carrier || "";
          temp.carrier_parent_name = element.carrier
            ? element.carrier.parent_name
            : "Own Fleet";
          temp.organization = element.organization || "";
          temp.isOwnFleet_shipment = element.own_fleet || false;
          temp.booked_by = element.shipper?.name || "";
          temp.order = element.order;

          temp.reqVehicleType =
            element.vehicle_type && element.vehicle_type.name
              ? element.vehicle_type.name
              : "N/A";
          temp.reqVehicleType_id =
            element.vehicle_type && element.vehicle_type._id
              ? element.vehicle_type._id
              : "N/A";

          temp.tripTracker = !!(
            element.trip_tracker &&
            element.trip_tracker.methods &&
            element.trip_tracker.methods.length
          );
          temp.trip_tracker = element.trip_tracker;
          temp.shipment_tracker = element.shipment_tracker || "";
          temp.method =
            element.trip_tracker && element.trip_tracker.methods
              ? element.trip_tracker.methods
              : [];
          temp.show_consent = temp.method.indexOf("SIM") !== -1;

          temp.drop_num = element.deliveries?.length || 0;
          temp.drop = element.deliveries?.[0]?._id;

          temp.pickDate = element.pickup_date;
          temp.scheduledDate = toShortDateTime(element.pickup_date);
          temp.actualDate = toShortDateTime(element.pickup_date);
          temp.actualPickupDate =
            element.pickups &&
            element.pickups.length &&
            element.pickups[0].finished_at
              ? toShortDateTime(element.pickups[0].finished_at)
              : "";

          temp.estimatedTime = element.estimated
            ? timeConvert(element.estimated.duration)
            : "N/A";
          temp.destination_code = element.others?.destination_code || "";
          temp.remainingTime = "";
          temp.totalDistance = element.estimated
            ? (element.estimated.distance / 1000).toFixed(2) + " kms"
            : "N/A";
          temp.remainingDistance = "";
          temp.coveredDistance = "N/A";
          temp.odc = !!element.odc;
          temp.frieght_price = element.estimated?.price || "";
          temp.currentLocation = "";

          temp.deliveryDate = element.delivery_date;
          temp.scheduledDeliveryDate = toShortDateTime(element.delivery_date);
          temp.actualDeliveryDate =
            element.deliveries &&
            element.deliveries.length &&
            element.deliveries[element.deliveries.length - 1].finished_at
              ? toShortDateTime(
                  element.deliveries[element.deliveries.length - 1].finished_at
                )
              : "";

          temp.lastDeliveryLocation =
            element.deliveries && element.deliveries.length
              ? element.deliveries[element.deliveries.length - 1].location._id
              : "";
          temp.firstPickupLocation =
            element.pickups && element.pickups.length
              ? element.pickups[0].location._id
              : "";

          temp.inboundShippers = element.inbound_shippers?.length || 0;
          temp.outBoundShippers = element.outbound_shippers?.length || 0;

          let transVehicleNos: any[] = [];
          if (element.others && element.others.trans_vehicle) {
            element.others.trans_vehicle.forEach((vehicle: any) => {
              transVehicleNos.push({
                vehicle_no: vehicle.trans_vehicle_no,
                remark: vehicle.trans_remark,
                date: vehicle.trans_date
                  ? new Date(vehicle.trans_date).toLocaleString()
                  : "",
              });
            });
          }
          temp.trans_vehicle_no = transVehicleNos;

          temp.time_delay = element.trip_tracker?.total_delay || 0;
          const delay_buffer = 0;
          if (temp.time_delay > delay_buffer) {
            temp.delayed_shipment = true;
          } else if (
            temp.status !== "Completed" &&
            temp.status !== "Cancelled" &&
            new Date(element.delivery_date) < new Date()
          ) {
            temp.delayed_shipment = true;
          } else {
            temp.delayed_shipment = false;
          }

          temp.trackConsent = element.simTracking?.isConsent || false;
          temp.whatsApp = element.whatsapp || {};
          temp.showGreenConsent =
            element.simTracking && element.simTracking.isConsent;
          temp.showRedConsent =
            element.simTracking &&
            !element.simTracking.isConsent &&
            element.simTracking.isSubscribed;
          temp.showSubscriptionStatus = element.simTracking ? true : false;
          temp.subscriptionStatus = element.simTracking?.isSubscribed || false;
          temp.simTrackingCarrier = element.simTracking?.carrier || "";

          temp.delay_deduction = element.delay_deduction || 0;

          temp.disableShare = [
            "Assigned",
            "Completed",
            "Cancelled",
            "Pending",
          ].includes(temp.status);
          temp.disableClickShare =
            !["Assigned", "Completed", "Cancelled"].includes(temp.status) &&
            temp.assigned !== "Pending";

          temp.ppd = element.ppd || null;
          temp.serial_number = element.serial_number || null;
          temp.is_unplanned = element.is_unplanned || null;
          temp.ppd_updated = element.ppd_updated || false;

          temp.rate = element.rate || {};
          temp.client_rate = element.client_rate || {};
          temp.epods_available = element.epods_available || false;
          if (element.finished_at || temp.status === "Cancelled") {
            temp.disableInvoiceEdit = true;
          } else {
            temp.disableInvoiceEdit = false;
          }

          temp.finished_at =
            element.deliveries &&
            element.deliveries.length &&
            element.deliveries[element.deliveries.length - 1].finished_at
              ? element.deliveries[element.deliveries.length - 1].finished_at
              : null;
          temp.arrived_at =
            element.deliveries &&
            element.deliveries.length &&
            element.deliveries[element.deliveries.length - 1].arrived_at
              ? element.deliveries[element.deliveries.length - 1].arrived_at
              : null;

          if (element.carrier_waybills && element.carrier_waybills.length) {
            temp.waybillFlag = !!element.carrier_waybills[0].pdf_link;
          } else if (
            element.fourPL_waybills &&
            element.fourPL_waybills.length
          ) {
            temp.waybillFlag = !!element.fourPL_waybills[0].pdf_link;
          } else {
            temp.waybillFlag = false;
          }

          let commercial_invoice_exist = false;
          if (element.fourPL_waybills && element.fourPL_waybills.length) {
            if (
              element.fourPL_waybills[0].invoice_info &&
              element.fourPL_waybills[0].invoice_info.invoice
            ) {
              const invoiceArr =
                element.fourPL_waybills[0].invoice_info.invoice;
              invoiceArr.forEach((item: any) => {
                if (item.num || item.value) {
                  commercial_invoice_exist = true;
                }
              });
            }
          }

          if (element.carrier_waybills && element.carrier_waybills.length) {
            if (
              element.carrier_waybills[0].invoice_info &&
              element.carrier_waybills[0].invoice_info.invoice
            ) {
              const invoiceArr =
                element.carrier_waybills[0].invoice_info.invoice;
              invoiceArr.forEach((item: any) => {
                if (item.num || item.value) {
                  commercial_invoice_exist = true;
                }
              });
            }
          }

          if (element.invoices && element.invoices.length) {
            commercial_invoice_exist = true;
          }

          temp.commercial_invoice_exist = commercial_invoice_exist;
          processedShipments.push(temp);
        });

        console.log("Processed shipments:", "calling outside");

        setShipmentsArray(processedShipments);
        setShipments(processedShipments);
        setShowLoader(false);
      }
    } catch (error) {
      setShowLoader(false);
      console.error("Error fetching shipments:", error);
    }
  };

  useEffect(() => {
    console.log("Triggered useEffect");
    if (!initialLoadDone.current) {
      fetchShipments();
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [currentPage, pageSize, odcFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return "✓";
      case "In Transit":
        return "→";
      case "Pending":
        return "⏳";
      case "Cancelled":
        return "✕";
      default:
        return "•";
    }
  };

  const handleSelectAllShipments = (checked: boolean) => {
    if (checked) {
      const newSelected = shipmentsArray
        .slice(0, Math.min(shipmentsArray.length, 10))
        .map((s) => s._id);
      setSelectedShipmentsArray(newSelected);
    } else {
      setSelectedShipmentsArray([]);
    }
    setShowButtons(checked && shipmentsArray.length > 0);
  };

  const handleSelectShipment = (id: string, checked: boolean) => {
    if (checked && selectedShipmentsArray.length >= 10) {
      console.log("Maximum 10 shipments can be selected");
      return;
    }

    let newSelected = [...selectedShipmentsArray];
    if (checked) {
      newSelected.push(id);
    } else {
      newSelected = newSelected.filter((selectedId) => selectedId !== id);
    }

    setSelectedShipmentsArray(newSelected);
    setShowButtons(newSelected.length > 0);
  };
  const statusColors: Record<string, string> = {
    Completed: "#2ecc40",
    "In Transit": "#f39c12",
    Cancelled: "#e74c3c",
    "Towards Pickup": "#16a085",
    "At Pickup": "#3498db",
    "At Delivery": "#667eea",
    "About to Reach": "#34495e",
    "In Plant": "#a502b0",
  };

  const statusLabels: Record<string, string> = {
    Completed: "Completed",
    "In Transit": "In Transit",
    Cancelled: "Cancelled",
    "Towards Pickup": "Towards Pickup",
    "At Pickup": "At Pickup",
    "At Delivery": "At Delivery",
    "About to Reach": "About to Reach",
  };

  function renderStatusCell(shipment: any) {
    const status = shipment.status;
    const bgColor = statusColors[status] || "#666";

    return (
      <div
        style={{
          backgroundColor: bgColor,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          margin: "0 auto",
        }}
        title={statusLabels[status] || status}
      />
    );
  };

  const renderLocationCell = (
    shipment: any,
    copyDestinationCode: (code: string) => void,
    openLocationsPopup: (type: string, locations: any[], shipment: any) => void,
    shipmentType: string,
    displayType: "pickup" | "delivery" = "pickup"
  ) => {
    const isPickup = displayType === "pickup";
    const locations = isPickup ? shipment.from : shipment.to;
    const firstLocation = locations?.[0]?.location;
    const additionalCount = locations?.length > 1 ? locations.length - 1 : 0;

    if (
      (shipmentType === "inbound" && !isPickup) ||
      (shipmentType === "outbound" && isPickup)
    ) {
      return null;
    }

    if (!firstLocation) return null;

    const getDateText = () => {
      if (shipmentType === "others") {
        return isPickup
          ? `${shipment.scheduledDate || "N/A"}`
          : `${shipment.scheduledDeliveryDate || "N/A"}`;
      } else if (shipmentType === "inbound") {
        return `${shipment.scheduledDeliveryDate || "N/A"}`;
      } else if (shipmentType === "outbound" || shipmentType === "all") {
        return `${shipment.scheduledDate || "N/A"}`;
      }
      return "";
    };

    return (
      <div className={styles.locationCell}>
        <div className={styles.locationInfo} style={{ display: "flex" }}>
          <div className={isPickup ? styles.pickIcon : styles.dropIcon}>
            {isPickup ? "P1" : "D1"}
          </div>
          <div className={styles.locationTextWrapper}>
            <span
              className={styles.locationText}
              title={`${firstLocation.name || ""} - ${
                firstLocation.city || ""
              }`}
            >
              {firstLocation.name} - {firstLocation.city}
            </span>
            <div className={styles.dateText} style={{ color: "#858282" }}>
              {getDateText()}
            </div>
          </div>
          {additionalCount > 0 && (
            <button
              className={`${styles.badgeCircle} ${
                isPickup ? styles.badgePickup : styles.badgeDelivery
              }`}
              onClick={(e) => {
                e.stopPropagation();
                openLocationsPopup(displayType, locations.slice(1), shipment);
              }}
              title={`Show ${additionalCount} additional ${
                isPickup ? "pickup" : "delivery"
              } locations`}
            >
              +{additionalCount}
            </button>
          )}
        </div>
      </div>
    );
  };
const renderLastLocationCell = (shipment: any) => {
  const isDialogOpen = locationDialogState.isOpen && locationDialogState.shipmentId === shipment._id;
  
  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocationDialogState({
      isOpen: true,
      shipmentId: shipment._id
    });
  };

  const handleLocationDialogClose = () => {
    setLocationDialogState({ isOpen: false });
  };

  let lastUpdatedColor = "#22c55e"; 
  if (shipment.trip_tracker?.last_location_at) {
    const last = new Date(shipment.trip_tracker.last_location_at).getTime();
    const now = Date.now();
    const diffMinutes = (now - last) / (1000 * 60);
    if (diffMinutes > 60) {
      lastUpdatedColor = "#ef4444";
    }
  }

  return (
    <div>
      {shipment.trip_tracker?.last_location_address ? (
        <LocationDialog
          address={shipment.trip_tracker.last_location_address}
          lastUpdated={shipment.trip_tracker?.last_location_at}
          lastUpdatedColor={lastUpdatedColor}
          isOpen={isDialogOpen}
          onClose={handleLocationDialogClose}
          shipmentId={shipment.sin}
        >
          <Button
            variant="ghost"
            size="icon"
            className={styles.locationButton}
            title="View location"
            onClick={handleLocationClick}
          >
            <MapPin className={styles.locationIcon} color={lastUpdatedColor} />
          </Button>
        </LocationDialog>
      ) : (
        "-"
      )}
    </div>
  );
};

  const renderDateTimeCell = (shipment: any, shipmentType: string) => {
    if (shipmentType === "others") {
      return (
        <div className={styles.locTabs}>
          <div className={styles.locTile}>
            <span className={styles.location}>{shipment.scheduledDate}</span>
            {shipment.actualPickupDate && (
              <span
                className={`${styles.sub} ${
                  shipment.delayed_shipment
                    ? styles.whiteFont
                    : styles.actualPicktime
                }`}
              >
                (Actual: {shipment.actualPickupDate})
              </span>
            )}
          </div>
          <div className={styles.locTile}>
            <span className={styles.location}>
              {shipment.scheduledDeliveryDate}
            </span>
          </div>
        </div>
      );
    }

    if (shipmentType === "inbound") {
      return (
        <div className={styles.locTabs}>
          <div className={styles.locTile}>
            <span className={styles.location}>
              {shipment.scheduledDeliveryDate}
            </span>
          </div>
        </div>
      );
    }

    if (shipmentType === "outbound" || shipmentType === "all") {
      return (
        <div className={styles.locTabs}>
          <div className={styles.locTile}>
            <span className={styles.location}>{shipment.scheduledDate}</span>
            {shipment.actualPickupDate && (
              <span className={styles.actualPicktime}>
                (Actual: {shipment.actualPickupDate})
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.locTabs}>
        <div className={styles.locTile}>
          <span className={styles.location}>
            {shipment.scheduledDate || "N/A"}
          </span>
        </div>
      </div>
    );
  };

  const openSubscribeModal = (shipment: any) => {
    setSelectedShipment(shipment);
    setModalOpen(true);
  };

  const closeSubscribeModal = () => {
    setModalOpen(false);
    setSelectedShipment(null);
  };

  const renderVehicleCell = (shipment: any) => (
    <div>
      <div>{shipment.vehicleNumber}</div>
      {shipment.trans_vehicle_no?.length > 0 && (
        <div className={styles.sub}>
          {shipment.trans_vehicle_no.map((vehicle: any, idx: number) => (
            <div key={idx}>
              {vehicle.vehicle_no}
              <br />
              <small>Remark: {vehicle.remark}</small>
              <br />
              <small>{vehicle.date}</small>
            </div>
          ))}
        </div>
      )}
      {/* <div className={styles.sub}>(Requested / Assigned)</div>
      <div className={styles.sub}>{shipment.reqVehicleType} / {shipment.vehicleType}</div> */}
    </div>
  );

  const renderConsentCell = (shipment: any) => (
    <div className={styles.consent}>
      {shipment.showGreenConsent && <span className={styles.flagImgG}>✓</span>}
      {shipment.showRedConsent && <span className={styles.flagImgR}>✗</span>}
    </div>
  );

  const renderSubscriptionCell = (shipment: any) => {
    return shipment.showSubscriptionStatus && !shipment.gpsVehicle ? (
      <div
        className={styles.subscription}
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          openSubscribeModal(shipment);
        }}
      >
        {shipment.showGreenConsent ? (
          <span className={styles.flagImgG}>Subscribed</span>
        ) : (
          <span className={styles.flagImgR}>Not Subscribed</span>
        )}
      </div>
    ) : null;
  };

  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedShipmentForBulkUpload, setSelectedShipmentForBulkUpload] = useState<any>(null);
 
  const handleBulkUploadClick = (shipment: any) => {
    setSelectedShipmentForBulkUpload(shipment);
    setShowBulkUploadModal(true);
  };

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharedShipment, setSharedShipment] = useState<Shipment | null>(null);

  const [showJdeBookShipment, setShowJdeBookShipment] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadType, setBulkUploadType] = useState("");

  const openFetchJdeShipment = () => {
    setShowJdeBookShipment(true);
  };

  const uploadVehicleArrivalBackToJde = async () => {
    if (selectedShipmentsArray.length === 0) {
      showMessage("No Shipment selected!", "error");
      return;
    }

    try {
      setIsLoading(true);
      const response = await httpsPost(
        "jde/vehicleArrival",
        selectedShipmentsArray
      );

      if (response.success) {
        showMessage("Vehicle arrival updated successfully", "success");
      } else {
        showMessage("Failed to update vehicle arrival", "error");
      }
      fetchShipments();
    } catch (error) {
      console.error("Error updating vehicle arrival:", error);
      showMessage("Failed to update vehicle arrival", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateEPODBackToJDE = async () => {
    if (selectedShipmentsArray.length === 0) {
      showMessage("No Shipment selected!", "error");
      return;
    }

    try {
      setIsLoading(true);
      const response = await httpsPost(
        "jde/uploadEPODtoJDE",
        selectedShipmentsArray
      );

      if (response.statusCode === 200) {
        showMessage("EPOD updated successfully", "success");
      } else {
        showMessage("Failed to update EPOD", "error");
      }
      fetchShipments();
    } catch (error) {
      console.error("Error updating EPOD:", error);
      showMessage("Failed to update EPOD", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvoiceDetails = async () => {
    if (selectedShipmentsArray.length === 0) {
      showMessage("No Shipment selected!", "error");
      return;
    }

    try {
      setIsLoading(true);
      const response = await httpsPost(
        "jde/fetchInvoicesFromJde",
        selectedShipmentsArray
      );

      if (response.statusCode === 200) {
        showMessage("Invoice details fetched successfully", "success");
      } else {
        showMessage(response.message || "Failed to fetch invoice details", "error");
      }
      fetchShipments();
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      showMessage("Failed to fetch invoice details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const openBulkUpload = (type: string) => {
    setBulkUploadType(type);
    setShowBulkUpload(true);
  };

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [shipmentToCancel, setShipmentToCancel] = useState<Shipment | null>(
    null
  );

  const handleCancelSuccess = () => {
    fetchShipments();
  };

  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [shipmentToMail, setShipmentToMail] = useState<Shipment | null>(null);

  const [showPaymentAdviceModal, setShowPaymentAdviceModal] = useState(false);


  const handleRecalculateGateInOut = async (shipment: Shipment) => {
    closeAllDialogs();
    setSelectedShipmentForRerun(shipment);
    setShowRerunDialog(true);
  }

  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState<'pickup' | 'delivery'>('pickup');
  const [shipperPrefs, setShipperPrefs] = useState<ShipperPrefs>({
    locations: [],
    deliveryLocations: []
  });
  const limit = pageSize;
  const skip = currentPage * pageSize;
const handleOpenEditLocation = (shipment: any, type: 'pickup' | 'delivery') => {
  setSelectedShipment(shipment);
  setSelectedLocationType(type);
  
  let combinedLocation = '';
  let pickupCity = '';
  let pickupId = '';
  let deliveryId = '';
  let currentLocation: number[] = [];
  
  if (type === 'pickup' && shipment.from && shipment.from.length > 0) {
    const location = shipment.from[0].location;
    combinedLocation = `${location.name} - ${location.area}${location.city ? ` - ${location.city}` : ''}`;
    pickupId = shipment.from[0].id;
    pickupCity = location.city || '';
  }
  
  if (type === 'delivery' && shipment.to && shipment.to.length > 0) {
    const location = shipment.to[0].location;
    combinedLocation = `${location.name} - ${location.area}${location.city ? ` - ${location.city}` : ''}`;
    deliveryId = shipment.to[0].id;
  }
  
  if (shipment.triptracker?.lastlocation) {
    currentLocation = shipment.triptracker.lastlocation;
  }
  
  if (shipment.organization?.id) {
    fetchShipperPrefs(shipment.organization._id);
  }
  
  setCombinedLocationData({
    combinedLocation,
    pickupCity,
    pickupId,
    deliveryId,
    currentLocation
  });
  
  setShowEditLocationModal(true);
};

  const fetchShipperPrefs = async (orgId: string) => {
    try {
      const response = await httpsGet(`org_pref?organization=${orgId}`, 4);
      if (response.statusCode === 200) {
        // For supplier type, filter locations
        const typeData = JSON.parse(localStorage.getItem('shippers') || '[]');
        if (typeData[0]?.type === 'supplier') {
          const supplier = typeData[0];
          const locationData: ShipperPrefs['locations'] = [...(response.data.locations || [])];
          setShipperPrefs({
            locations: locationData.filter(x => x.shipper === supplier._id),
            deliveryLocations: locationData.filter(x => x.shipper !== supplier._id)
          });
        } else {
          setShipperPrefs({
            locations: [...(response.data.locations || [])],
            deliveryLocations: [...(response.data.locations || [])]
          });
        }
      }
    } catch (error) {
      console.error('Error fetching shipper prefs:', error);
      showMessage('Failed to load location preferences', 'error');
    }
  };

  const SearchTypes = [
  { name: 'SIN', value: 'SIN' },
  { name: 'Project Code', value: 'project_code' },
  { name: 'Vehicle No', value: 'vehicle_no' },
  { name: 'PO Number', value: 'purchase_order' },
  { name: 'SO Number', value: 'sale_order' },
  { name: 'PPD Number', value: 'ppd_no' },
  { name: 'DO Number', value: 'do_number' },
];

const changeSearchType = (typeName: string, typeValue: string) => {
  delete shipmentsFilter[searchValue];
  setSearchType(typeName);
  setSearchValue(typeValue);
  setInputQuery("");
};

const applyFilter = () => {
  if (inputQuery.length <= 3) {
    showMessage('Enter at least 4 characters to Search', 'error');
    return;
  }
  
  fetchShipments(shipmentsFilter);
};

  const [isPrintLRModalOpen, setIsPrintLRModalOpen] = useState(false);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);

  const handlePrintLR = (data: { type: string; copyTypes: string[] }) => {
    console.log(
      "Printing LRs for shipment IDs:",
      selectedShipmentIds,
      "with data:",
      data
    );
  };

  const handleDownloadLRsClick = () => {
    const selectedId = selectedShipmentsArray[0];
    if (!selectedId) {
      showMessage("Please select a shipment first", "error");
      return;
    }
    closeAllDialogs();
    setSelectedShipmentIds(selectedId);
    setIsPrintLRModalOpen(true);
  };

  const [isIncreasePriceModalOpen, setIsIncreasePriceModalOpen] =
    useState(false);


  const handleRecalculateFreightClick = () => {
    const selectedId = selectedShipmentsArray[0];
    if (!selectedId) {
      showMessage("Please select a shipment first", "error");
      return;
    }
    closeAllDialogs();
    setSelectedShipmentForPriceIncrease(selectedId);
    setIsIncreasePriceModalOpen(true);
  };

  const closeAllDialogs = () => {
    setActionSearch("");
    setIsEpodModalOpen(false);
    setShowShipmentDetails(false);
    setShowLocationPopup(false);
    setShowActiveCarriersPopup(false);
    setShowTotalFreightPopup(false);
    setShowAverageFreightPopup(false);
    setShowDelayedShipmentDialog(false);
    setShowRerunDialog(false);
    setShowPullFreightDialog(false);
    setShowAttachDialog(false);
    setShowUpdateFreightDialog(false);
    setShowWarningDialog(false);
    setShowUpdateStatusDialog(false);
    setShowUploadModal(false);
    setShowLastKnownLocationDialog(false);
    setShowOpenVideosDialog(false);
    setShowAddDODialog(false);
    setShowAddManagedByDialog(false);
    setShowIncreasePriceDialog(false);
    setShowAddRemarkDialog(false);
    setShowJdeBookShipment(false);
    setShowBulkUpload(false);
    setShareModalOpen(false);
    setCancelModalOpen(false);
    setMailModalOpen(false);
    setShowPaymentAdviceModal(false);
    setShowEditLocationModal(false);
    setIsPrintLRModalOpen(false);
    setIsIncreasePriceModalOpen(false);
  };

  const [showPaymentAdvanceModal, setShowPaymentAdvanceModal] = useState(false);
  const [selectedShipmentForPayment, setSelectedShipmentForPayment] = useState<Shipment | null>(null);
  const [selectedShipmentForRerun, setSelectedShipmentForRerun] = useState<Shipment | null>(null);

  const handlePaymentAdvanceSubmit = async (paymentData: any) => {
    try {
      console.log('Submitting payment advance:', paymentData);
      // Example API call (uncomment and modify as needed):
      // const response = await httpsPost('payments/advance', {
      //   shipment_id: selectedShipmentForPayment?._id,
      //   ...paymentData
      // });
      // 
      // if (response.statusCode === 200) {
      //   showMessage('Payment advance created successfully', 'success');
      //   setShowPaymentAdvanceModal(false);
      // }
    } catch (error: any) {
      console.error('Error creating payment advance:', error);
      showMessage(
        error.message || 'Failed to create payment advance. Please try again.',
        'error'
      );
    }
  };

  const [showRecalculateDistanceModal, setShowRecalculateDistanceModal] = useState(false);
  const [selectedShipmentForRecalculation, setSelectedShipmentForRecalculation] = useState<{
    _id: string;
    sin: string;
    from: Array<{ location: { name: string; city: string; _id: string } }>;
    to: Array<{ location: { name: string; city: string; _id: string } }>;
  } | null>(null);

  const handleRecalculateDistance = (shipment: any) => {
    setSelectedShipmentForRecalculation({
      _id: shipment._id,
      sin: shipment.sin,
      from: shipment.from,
      to: shipment.to
    });
    setShowRecalculateDistanceModal(true);
  };

  const [isInvoiceTypeModalOpen, setIsInvoiceTypeModalOpen] = useState(false);
  const [selectedShipmentForInvoiceType, setSelectedShipmentForInvoiceType] = useState<Shipment | null>(null);

  const [invoiceData, setInvoiceData] = useState<Array<{
    invoiceType: 'CT' | 'PT';
    invoice: string;
    shippedQty: number | string;
    shippedNop: number | string;
    [key: string]: any;
  }>>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  const handleInvoiceTypeChange = (item: any, newType: 'CT' | 'PT') => {
    setInvoiceData(prevData =>
      prevData.map(inv =>
        inv.invoice === item.invoice ? { ...inv, invoiceType: newType } : inv
      )
    );
  };

  const handleInvoiceTypeSubmit = async () => {
    try {
      setIsLoadingInvoices(true);
      await httpsPost('/api/update-invoice-types', {
        shipmentId: selectedShipmentForInvoiceType?._id,
        invoices: invoiceData.map(inv => ({
          invoice: inv.invoice,
          invoiceType: inv.invoiceType
        }))
      });
      setIsInvoiceTypeModalOpen(false);
      fetchShipments();
    } catch (error) {
      console.error('Error updating invoice types:', error);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const [showUpdateFreightModal, setShowUpdateFreightModal] = useState(false);
  const [selectedShipmentForFreight, setSelectedShipmentForFreight] = useState<string | null>(null);
  const [freightSIN, setFreightSIN] = useState<string>('');

  const handleOpenFreightModal = (shipmentId: string, sin: string, freightType: 'rate' | 'client_rate') => {
    setSelectedShipmentForFreight(shipmentId);
    setFreightSIN(sin);
    setFreightType(freightType);
    setShowUpdateFreightModal(true);
  };

  const handleFreightUpdateSuccess = () => {
    setShowUpdateFreightModal(false);
    fetchShipments();
    showMessage('Freight updated successfully', 'success');
  };

  const hasSelected = selectedShipmentsArray.length > 0; 

  const handleMissedShipmentHeader = () => {
  if (!selectedShipmentsArray.length) {
    showMessage("Please select at least one shipment", "error");
    return;
  }
  const shipment = shipments.find(s => s._id === selectedShipmentsArray[0]);
  if (shipment) {
    setSelectedShipmentForMissed(shipment);
    setShowMissedShipmentModal(true);
  }
};

  return (
    <div className={styles.main}>
      <div className={styles.tabsContainer}>
        <div className={styles.tabsGroup}>
          <div
            className={`${styles.tab} ${
              shipmentType === "outbound" ? styles.selected : ""
            }`}
            onClick={() => handleShipmentTypeChange("outbound")}
          >
            Outbound
          </div>
          <div
            className={`${styles.tab} ${
              shipmentType === "inbound" ? styles.selected : ""
            }`}
            onClick={() => handleShipmentTypeChange("inbound")}
          >
            Inbound
          </div>
          <div
            className={`${styles.tab} ${
              shipmentType === "others" ? styles.selected : ""
            }`}
            onClick={() => handleShipmentTypeChange("others")}
          >
            Others
          </div>
          <div
            className={`${styles.tab} ${
              shipmentType === "all" ? styles.selected : ""
            }`}
            onClick={() => handleShipmentTypeChange("all")}
          >
            All
          </div>
        </div>

        <div  className={styles.headerActions}>
        <HeaderActions
          onFetchShipments={openFetchJdeShipment}
          onUpdateVehicleArrival={uploadVehicleArrivalBackToJde}
          onSendEPOD={updateEPODBackToJDE}
          onFetchInvoiceDetails={fetchInvoiceDetails}
          onBulkUpload={() => openBulkUpload("shipment")}
          isTechnova={isTechnova}
          isTata={isTata}
          isLoading={isLoading}
          isjspl={parentFlags.isjspl}
          hasSelectedShipments={selectedShipmentsArray.length > 0}
          onMissedShipment={handleMissedShipmentHeader} 
        />

        {
          shipmentType !== "all" && (
            <span
            style={{ padding: "0px 3px", cursor: "pointer", verticalAlign: "middle" }}
            onClick={openInvoiceVideos}
            title={
              shipmentType === "inbound"
                ? helpDataInbound[0].data
                : shipmentType === "outbound"
                ? helpDataOutbound[0].data
                : helpDataOthers[0].data
            }
          >
        <HelpCircle className={styles.helpIcon} style={{ width: 22, height: 22, verticalAlign: "middle" }} />
          </span>
          )
        }



        <div className={styles.refresh} onClick={clearFilters}>
          <RefreshCw className={styles.lucideIcon} />
        </div>
        </div>
      </div>
      <div className={styles.subFiltersContainer}>
<div className={styles.filterButtonsGroup}>
  {subFilters.map((filter) => {
    const isSelected = selectedSubFilters.includes(filter.key);
    return (
      <button
        key={filter.key}
        className={`${styles.filterButton} ${
          isSelected ? styles.selected : ""
        }`}
        onClick={() => handleSubFilterSelect(filter.key)}
        style={{
          '--filter-color': filter.color,
          '--filter-color-10': `${filter.color}1a`,
          '--filter-color-20': `${filter.color}33`,
          borderColor: filter.color,
          color: isSelected ? filter.color : 'inherit',
          backgroundColor: isSelected ? `${filter.color}1a` : 'transparent',
        } as React.CSSProperties}
      >
        {filter.label}
        {isSelected && <span className={styles.checkmark}>✓</span>}
      </button>
    );
  })}
</div>
 { isTechnova &&(
        <div className={styles.filterGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={odcFilter === true}
              onChange={(e) => setOdcFilter(e.target.checked)}
            />
            <span>ODC Shipment(s)</span>
          </label>
        </div>)}


      </div>
      <div className={styles.header}>
      <div className={styles.tableControls}>
  <div className={styles.inputSearchContainer}>
    <Select
      value={searchType}
      onValueChange={(value) => {
        const selectedType = SearchTypes.find(type => type.name === value);
        if (selectedType) {
          changeSearchType(selectedType.name, selectedType.value);
        }
      }}
    >
      <SelectTrigger className={styles.perSinSelect}>
        <SelectValue placeholder={searchType} />
      </SelectTrigger>
      <SelectContent className={styles.perPageContent}>
        {SearchTypes.map((type) => (
          <SelectItem key={type.value} value={type.name} className={styles.perPageItem}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    
    <div className={styles.searchInputContainer}>
      <input
        type="text"
        placeholder="Search ..."
        name="filter"
        value={inputQuery}
        onChange={(e) => setInputQuery(e.target.value)}
        className={styles.inputSearch}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            applyFilter();
          }
        }}
      />
      <Search
        className={styles.searchIcon}
        onClick={applyFilter}
      />
    </div>
  </div>
  
</div>

        <div className={styles.buttonContainer}>
          <div
            className={`${styles.button} ${styles.advancedSearchSubmitButton}`}
            role="button"
            tabIndex={0}
            onClick={() => setShowAdvancedSearch((prev) => !prev)}
            onKeyPress={(e) =>
              e.key === "Enter" && setShowAdvancedSearch((prev) => !prev)
            }
          >
            Advanced Search
          </div>
          {/* <Link href="/Mapview" style={{textDecoration: "none"}}> */}
         <Link href={{ pathname: "/Mapview", query: { limit: String(limit), skip: String(skip) } }} style={{textDecoration: "none"}}>
          <button className={styles.button}>Map View</button>
          </Link>

          <div className={styles.tableControls}>
  <Select onValueChange={(value) => openBulkUpload(value)}>
    <SelectTrigger className={styles.perPageSelect}>
      <SelectValue placeholder="Upload Commercial Invoice" />
    </SelectTrigger>
    <SelectContent className={styles.perPageContent}>
      <SelectItem value="commercial_invoice" className={styles.perPageItem}>
        Upload Commercial Invoice
      </SelectItem>
      <SelectItem value="commercial_invoice_Tcode" className={styles.perPageItem}>
        Upload with TCode
      </SelectItem>
    </SelectContent>
  </Select>
</div>

          <div className={styles.button} onClick={toggleAnalyticsView}>
            {isAnalyticsView ? "Table View" : "Analytics View"}
          </div>

          <div className={styles.button} onClick={toggleCompactView}>
            {isCompactView ? "Comfortable" : "Compact"}
          </div>

          {showButtons && (
            <>
              <div className={styles.button} onClick={handleDownloadLRsClick}>
                Download LRs
              </div>
              <div
                className={styles.button}
                onClick={handleRecalculateFreightClick}
                style={{ width: 150 }}
              >
                Recalculate Freight
              </div>
            </>
          )}
        </div>
       </div> 

      {showAdvancedSearch && (
        <AdvancedFilter
          userType={userType}
          organizations={organizations}
          materialsArray={materialsArray}
          allCarriers={allCarriers}
          limit={pageSize}
          skip={currentPage * pageSize}
          odcFilter={odcFilter}
          segmentations={segmentations}
          pickLocations={pickupLocations}
          deliverLocations={deliveryLocations}
          shipStatus={shipmentStatus}
          onApply={(filters) => {
            console.log("Applied filters:", filters);
          }}
          onClear={() => {
            console.log("Filters cleared");
          }}
          onClose={() => {
            console.log("Close filter");
            setShowAdvancedSearch(false);
          }}
        />
      )}
      {isAnalyticsView ? (
        <AnalyticsView
          analyticsData={analyticsData}
          analyticsLifeCycle={analyticsLifeCycle}
          analyticsInsights={analyticsInsights as Insight[]}
          selectedAnalyticsRange={selectedAnalyticsRange}
          setSelectedAnalyticsRange={setSelectedAnalyticsRange}
          formatCurrency={formatCurrency}
          openActiveCarriersPopup={openActiveCarriersPopup}
        />
      ) : (
        <div className={styles.section}>
          <div
            className={`${styles.tableDivContainer} ${
              isCompactView ? styles.compactView : ""
            }`}
            data-shipment-type={shipmentType}
          >
            <div className={styles.tableHeader}>
              <div className={styles.tableInfo}>
                <span className={styles.resultsCount}>
                  Showing {currentPage * pageSize + 1}-
                  {Math.min((currentPage + 1) * pageSize, totalShipments)} of{" "}
                  {totalShipments.toLocaleString()} shipments
                </span>
              </div>

              <div className={styles.tableControls}>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(0);
                  }}
                >
                  <SelectTrigger className={styles.perPageSelect}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={styles.perPageContent}>
                    <SelectItem value="100" className={styles.perPageItem}>100 per page</SelectItem>
                    <SelectItem value="200" className={styles.perPageItem}>200 per page</SelectItem>
                    <SelectItem value="300" className={styles.perPageItem}>300 per page</SelectItem>
                    <SelectItem value="400" className={styles.perPageItem}>400 per page</SelectItem>
                    <SelectItem value="500" className={styles.perPageItem}>500 per page</SelectItem>
                  </SelectContent>
                </Select>

                <div className={styles.paginationControls}>
                  <button
                    className={styles.paginationButton}
                    title="First page"
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                  >
                    <ChevronsLeft className={styles.paginationIcon} />
                  </button>
                  <button
                    className={styles.paginationButton}
                    title="Previous page"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className={styles.paginationIcon} />
                  </button>
                  <span className={styles.pageInfo}>
                    Page {currentPage + 1} of{" "}
                    {Math.ceil(totalShipments / pageSize) || 1}
                  </span>
                  <button
                    className={styles.paginationButton}
                    title="Next page"
                    onClick={() =>
                      setCurrentPage(
                        Math.min(
                          Math.ceil(totalShipments / pageSize) - 1,
                          currentPage + 1
                        )
                      )
                    }
                    disabled={(currentPage + 1) * pageSize >= totalShipments}
                  >
                    <ChevronRight className={styles.paginationIcon} />
                  </button>
                  <button
                    className={styles.paginationButton}
                    title="Last page"
                    onClick={() =>
                      setCurrentPage(Math.ceil(totalShipments / pageSize) - 1)
                    }
                    disabled={(currentPage + 1) * pageSize >= totalShipments}
                  >
                    <ChevronsRight className={styles.paginationIcon} />
                  </button>
                </div>
              </div>
             
                  </div>



            {!isAnalyticsView && (
              <ShipmentsTable
                isAnalyticsView={isAnalyticsView}
                isCompactView={isCompactView}
                tableRef={tableRef}
                isjspl={parentFlags.isjspl}
                isTechnova={parentFlags.isTechnova}
                isMykl={parentFlags.isMykl}
                selectedShipmentsArray={selectedShipmentsArray}
                handleSelectAllShipments={handleSelectAllShipments}
                shipmentsArray={shipmentsArray}
                currentPage={currentPage}
                pageSize={pageSize}
                shipmentType={shipmentType}
                showLoader={showLoader}
                actionSearch={actionSearch}
                setActionSearch={setActionSearch}
                actionMenuCategories={() => actionMenuCategories}
                renderStatusCell={renderStatusCell}
                onViewDetails={handleViewDetails}
                renderLocationCell={renderLocationCell}
                renderDateTimeCell={renderDateTimeCell}
                renderVehicleCell={renderVehicleCell}
                renderConsentCell={renderConsentCell}
                renderSubscriptionCell={renderSubscriptionCell}
                handleSelectShipment={handleSelectShipment}
                copyDestinationCode={copyDestinationCode}
                openLocationsPopup={openLocationsPopup}
                formatCurrency={formatCurrency}
                renderLastLocationCell={renderLastLocationCell}
                actionMenuOpenId={actionMenuOpenId}
                setActionMenuOpenId={setActionMenuOpenId}
                closeActionMenu={closeActionMenu}
                openSubscribeModal={openSubscribeModal}
              />
            )}
          </div>
        </div>
      )}
      {showLocationPopup && locationPopupData && (
        <LocationModal
          shipmentSin={locationPopupData?.shipmentSin || ""}
          show={showLocationPopup}
          type={locationPopupData?.type as "Delivery" | "Pickup"}
          locations={locationPopupData?.locations || []}
          onClose={() => setShowLocationPopup(false)}
        />
      )}
      {modalOpen && selectedShipment && (
        <SubscribeModal
          open={modalOpen}
          onClose={closeSubscribeModal}
          shipment={selectedShipment}
        />
      )}
      {isDetailsModalOpen && selectedShipmentId && (
        <ShipmentDetails
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
          shipmentId={selectedShipmentId}
      
        />
      )}
      {showActiveCarriersPopup && (
        <ActiveCarriersModal
          show={showActiveCarriersPopup}
          carriers={activeCarriersData}
          onClose={() => setShowActiveCarriersPopup(false)}
        />
      )}
      {showTotalFreightPopup && (
        <TotalFreightModal
          show={showTotalFreightPopup}
          title="Total Freight Breakdown"
          totalFreightData={totalFreightData}
          onClose={() => setShowTotalFreightPopup(false)}
        />
      )}
      {showAverageFreightPopup && (
        <TotalFreightModal
          show={showAverageFreightPopup}
          title="Average Freight Details"
          totalFreightData={averageFreightData}
          onClose={() => setShowAverageFreightPopup(false)}
        />
      )}
      {showPullFreightDialog && (
  <PullFreightModal
    _id={pullFreightData._id} 
    show={showPullFreightDialog}
    sin={pullFreightData.sin} 
    vehicleNo={pullFreightData.vehicleNo}
    pickup={pullFreightData.pickup}
    destinations={pullFreightData.destinations}
    onClose={() => {
      setShowPullFreightDialog(false);
    }}
    onGetFreight={async (data) => {
      try {
        console.log('Freight data:', data);
      } catch (error) {
        console.error('Error handling freight:', error);
      }
    }}
  />
)}
      {showAttachDialog && selectedShipmentForAttach && (
        <AttachFilesModal
          show={showAttachDialog}
          onClose={() => setShowAttachDialog(false)}
          onAttach={() => {
            fetchShipments(); 
          }}
          shipmentId={selectedShipmentForAttach._id || ""} 
          sin={selectedShipmentForAttach.sin || ""}
        />
      )}

{showStatusModal && selectedShipmentForStatus && (
  <UpdateStatusModal
    show={showStatusModal}
    shipmentNo={selectedShipmentForStatus.sin}
    shipmentId={selectedShipmentForStatus._id}
    shipmentDetails={{
      from: selectedShipmentForStatus.from[0],
      to: selectedShipmentForStatus.to[0]
    }}
    onClose={() => {
      setShowStatusModal(false);
      setSelectedShipmentForStatus(null);
    }}
    onSuccess={() => {
      fetchShipments(); 
    }}
  />
)}



            {showOpenVideosDialog && (
        <OpenVideosModal
           show={showOpenVideosDialog}
  videoUrl={videoUrl}
  onClose={() => setShowOpenVideosDialog(false)}
  title={
    shipmentType === "inbound"
      ? helpDataInbound[0]?.data
      : shipmentType === "outbound"
      ? helpDataOutbound[0]?.data
      : helpDataOthers[0]?.data
  }
        />
      )}


      {showJdeBookShipment && (
        <JdeBookShipment
          open={showJdeBookShipment}
          onClose={() => setShowJdeBookShipment(false)}
          ltl={true}
          onSuccess={() => {
            showMessage("Shipment created successfully", "success");
            fetchShipments(); 
          }}
        />
      )}

{reasonDialog.open && reasonDialog.shipmentId && (
  <ReasonDialog
    open={reasonDialog.open}
    onClose={handleCloseReasonDialog}
    type={reasonDialog.type}
    shipmentId={reasonDialog.shipmentId}
    sin={reasonDialog.sin}
    history={
      reasonDialog.type === 'delay' 
        ? shipments.find(s => s._id === reasonDialog.shipmentId)?.delay_reason || []
        : shipments.find(s => s._id === reasonDialog.shipmentId)?.gps_disconnection_reason || []
    }
    onSuccess={() => {
      fetchShipments(); 
      showMessage('Reason updated successfully', 'success');
    }}
  />
)}

      {showBulkUpload && (
        <BulkUploadShipments
          open={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          type={
            bulkUploadType as
              | "order"
              | "shipment"
              | "commercial_invoice"
              | "commercial_invoice_Tcode"
          }
          onSuccess={() => {
            showMessage("Bulk upload completed successfully", "success");
            fetchShipments(); 
          }}
        />
      )}
      {shareModalOpen && sharedShipment && (
        <ShareModal
          open={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSharedShipment(null);
          }}
          trackingUrl={shareUrl}
          sin={sharedShipment.sin}
        />
      )}
      {cancelModalOpen && shipmentToCancel && (
        <CancelShipmentModal
          open={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false);
            setShipmentToCancel(null);
          }}
          shipment={shipmentToCancel}
          onCancelSuccess={handleCancelSuccess}
        />
      )}
      {mailModalOpen && shipmentToMail && (
        <MailModal
          open={mailModalOpen}
          onClose={() => {
            setMailModalOpen(false);
            setShipmentToMail(null);
          }}
          shipment={shipmentToMail}
        />
      )}
      {showUploadModal && (
        <UploadModal
          show={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleBulkUploadFileChange}
          title="Upload Commercial Invoices"
          accept=".pdf,.xls,.xlsx,.doc,.docx"
          multiple={true}
          maxSizeMB={10}
          isLoading={false}
        />
      )}
      {showAddDODialog && (
        <AddDeliveryOrderModal
          show={showAddDODialog}
          onClose={() => setShowAddDODialog(false)}
          onSave={handleSaveDO}
          shipmentNo={selectedShipmentSIN}
          shipmentId={selectedShipment?._id || ""}
          isLoading={false}
        />
      )}
{showEditLocationModal && selectedShipment && (
  <EditLocationsModal
    show={showEditLocationModal}
    onClose={() => {
      setShowEditLocationModal(false);
      setCombinedLocationData({
        combinedLocation: '',
        pickupCity: '',
        pickupId: '',
        deliveryId: '',
        currentLocation: []
      });
    }}
    addLocationsType={selectedLocationType}
    shipmentId={selectedShipment._id}
    shipperPrefs={shipperPrefs}
    orderNumber={selectedShipment.sin}
    pickupId={combinedLocationData.pickupId}
    deliveryId={combinedLocationData.deliveryId}
    elementOrderId={selectedShipment.organization._id}
    currentLocation={combinedLocationData.currentLocation}
    combinedLocation={combinedLocationData.combinedLocation} 
    pickupCity={combinedLocationData.pickupCity} 
    onEditSuccess={() => {
      setShowEditLocationModal(false);
      fetchShipments();
      setCombinedLocationData({
        combinedLocation: '',
        pickupCity: '',
        pickupId: '',
        deliveryId: '',
        currentLocation: []
      });
    }}
  />
)}


      {showGpsModal && selectedShipmentForGps && (
        <AddGpsConnectionModal
        show={showGpsModal}
        onClose={() => {
          setShowGpsModal(false);
          setSelectedGps([]);
        }}
        selectedGps={selectedGps}
        onGpsChange={setSelectedGps}
        driverType={selectedShipmentForGps.driver_type === 'attached' ? 'temporary' : 'own'}
        attachedDriverId={selectedShipmentForGps.assigned_driver?._id}
        vehicleId={selectedShipmentForGps.assigned_driver?.vehicle_type?._id || ""}
        onSuccess={() => {
          fetchShipments(); 
          showMessage('GPS connection added successfully', 'success');
        }}
        isLoading={false} 
        sin={selectedShipmentForGps.sin}
        />
      )}

{showFaultyModal && selectedShipmentForFaulty && (
  <MarkFaultyModal
    show={showFaultyModal}
    vehicleNumber={selectedShipmentForFaulty.vehicleNumber || ''}
    gpsProvider={selectedShipmentForFaulty.gpsProvider || 'GPS Device'}
    sin={selectedShipmentForFaulty.sin}
    onClose={() => {
      setShowFaultyModal(false);
      setSelectedShipmentForFaulty(null);
    }}
    onSuccess={() => {
      fetchShipments(); 
    }}
  />
)}

     

      {isEpodModalOpen && selectedShipmentForEpod && (
        <EpodPreviewModal
          open={isEpodModalOpen}
          onClose={() => {
            setIsEpodModalOpen(false);
            setSelectedShipmentForEpod(null);
          }}
          data={{
            deliveries: [
              {
                _id: selectedShipmentForEpod._id,
                location: selectedShipmentForEpod.to[0]?.location || {
                  name: "",
                  city: "",
                  _id: "",
                },
                epods:
                  selectedShipmentForEpod.epods?.map((epod: any) => epod.url) ||
                  [],
                finished_at: selectedShipmentForEpod.actualDeliveryDate,
                epod_uploaded_date:
                  selectedShipmentForEpod.epods?.[0]?.uploaded_at ||
                  new Date().toISOString(),
              },
            ],
            pickups: selectedShipmentForEpod.from,
            do_numbers: selectedShipmentForEpod.serial_number
              ? [selectedShipmentForEpod.serial_number]
              : [],
            invoices: [], 
            carrier_waybills: [], 
            sin: selectedShipmentForEpod.sin,
          }}
        />
      )}

      {isPrintLRModalOpen && (
        <PrintLRModal
          open={isPrintLRModalOpen}
          onClose={() => setIsPrintLRModalOpen(false)}
          shipmentIds={selectedShipmentIds}
          onPrint={handlePrintLR}
        />
      )}

      {isIncreasePriceModalOpen && (
        <IncreasePriceModal
          show={isIncreasePriceModalOpen}
          shipmentId={selectedShipmentForPriceIncrease}
          onClose={() => setIsIncreasePriceModalOpen(false)}
          onSubmit={submitIncreasePrice}
        />
      )}
      {showPaymentAdvanceModal && selectedShipmentForPayment && (
        <CreatePaymentAdvanceModal
          show={showPaymentAdvanceModal}
          onClose={() => setShowPaymentAdvanceModal(false)}
          onSubmit={handlePaymentAdvanceSubmit}
          shipmentId={selectedShipmentForPayment._id}
          data={{
            shipment: selectedShipmentForPayment,
          }}
        />
      )}
      {showFlushFreightConfirm && (
        <ConfirmationDialog
          isOpen={showFlushFreightConfirm}
          title="Confirm Flush Freight"
          message="Are you sure you want to flush freight for this shipment? This action cannot be undone."
          confirmText={isFlushingFreight ? 'Processing...' : 'Yes, Flush Freight'}
          onConfirm={confirmFlushFreight}
          onCancel={() => setShowFlushFreightConfirm(false)}
          isProcessing={isFlushingFreight}
          sin={shipmentToFlush?.sin}
        />
      )}
      {showRecalculateDistanceModal && selectedShipmentForRecalculation && (
        <RecalculateDistanceModal
          show={showRecalculateDistanceModal}
          onClose={() => setShowRecalculateDistanceModal(false)}
          shipmentId={selectedShipmentForRecalculation._id}
          sin={selectedShipmentForRecalculation.sin}
          pickupAddresses={selectedShipmentForRecalculation.from.map(f => 
            `${f.location.name}${f.location.city ? `, ${f.location.city}` : ''}`
          )}
          deliveryAddresses={selectedShipmentForRecalculation.to.map(t => 
            `${t.location.name}${t.location.city ? `, ${t.location.city}` : ''}`
          )}
        />
      )}
      {isInvoiceTypeModalOpen && selectedShipmentForInvoiceType && (
        <InvoiceTypeModal
          show={isInvoiceTypeModalOpen}
          onClose={() => {
            setIsInvoiceTypeModalOpen(false);
            setSelectedShipmentForInvoiceType(null);
          }}
          shipmentId={selectedShipmentForInvoiceType._id}
          invoiceData={invoiceData}
          onTypeChange={handleInvoiceTypeChange}
          onSubmit={handleInvoiceTypeSubmit}
          loading={isLoadingInvoices}
          sin={selectedShipmentForInvoiceType.sin}
        />
      )}
      {selectedShipmentForFreight && (
        <UpdateCarrierFreight
        open={showUpdateFreightModal}
        onClose={() => setShowUpdateFreightModal(false)}
        shipmentId={selectedShipmentForFreight}
        onSuccess={handleFreightUpdateSuccess}
        freightType={freightType}
        sin={freightSIN}
      />
      )}
     {selectedShipmentForArrival && (
  <CompleteShipmentModal
    show={showMarkAsArrivedModal}
    onClose={() => setShowMarkAsArrivedModal(false)}
    shipment={{
      _id: selectedShipmentForArrival._id,
      sin: selectedShipmentForArrival.sin,
      from: selectedShipmentForArrival.from?.[0]?.location?.name,
      to: selectedShipmentForArrival.to?.[0]?.location?.name,
      shipmentType: "arrived", 
      drop: selectedShipmentForArrival.drop,
    }}
    fetchShipments={fetchShipments}
    setShowCompleteShipmentModal={setShowMarkAsArrivedModal}
  />
)}
{selectedShipmentForCompletion && (
  <CompleteShipmentModal
    show={showCompleteShipmentModal}
    onClose={() => setShowCompleteShipmentModal(false)}
    shipment={{
      _id: selectedShipmentForCompletion._id,
      sin: selectedShipmentForCompletion.sin || '',
      from: selectedShipmentForCompletion.from?.[0]?.location?.name,
      to: selectedShipmentForCompletion.to?.[0]?.location?.name,
      shipmentType: "complete",
    }}
    fetchShipments={fetchShipments}
    setShowCompleteShipmentModal={setShowCompleteShipmentModal}
  />
)}
      {showBulkUploadModal && (
        <BulkUploadShipments
          open={showBulkUploadModal}
          onClose={() => setShowBulkUploadModal(false)}
          type="commercial_invoice"
          shipmentId={selectedShipmentForBulkUpload?._id}
          onSuccess={() => {
            fetchShipments();
          }}
          sin={selectedShipmentForBulkUpload?.sin}
        />
      )}

{showMissedShipmentModal && (
  <MissedShipmentModal
    show={showMissedShipmentModal}
    onClose={() => {
      setShowMissedShipmentModal(false);
      setSelectedShipmentForMissed(null);
    }}
    onSuccess={() => {
      fetchShipments(); 
    }}
    sin={selectedShipmentForMissed?.sin || ""}
  />
)}

{showMissedEventModal && selectedShipmentForMissedEvent && (
  <MissedEventModal
    show={showMissedEventModal}
    shipmentId={selectedShipmentForMissedEvent._id}
    onClose={() => {
      setShowMissedEventModal(false);
      setSelectedShipmentForMissedEvent(null);
    }}
    onSuccess={() => {
      fetchShipments();   
    }}
    sin={selectedShipmentForMissedEvent.sin || ""}
  />
)}

{showAddManagedByModal && selectedShipmentForManagedBy && (
  <AddManagedByModal
    show={showAddManagedByModal}
    shipmentId={selectedShipmentForManagedBy._id}
    shipmentNo={selectedShipmentForManagedBy.sin}
    onClose={() => {
      setShowAddManagedByModal(false);
      setSelectedShipmentForManagedBy(null);
    }}
    onSuccess={() => {
      fetchShipments(); 
    }}
  />
)}

{showRetriggerEventModal && selectedShipmentForRetrigger && (
  <RetriggerEventModal
    show={showRetriggerEventModal}
    shipment={selectedShipmentForRetrigger}
    onClose={() => {
      setShowRetriggerEventModal(false);
      setSelectedShipmentForRetrigger(null);
    }}
    onSuccess={() => {
      fetchShipments(); 
    }}
  />
)}

{selectedShipment && (
      <DriverExpenses
        open={showDriverExpenses}
        onClose={() => setShowDriverExpenses(false)}
        shipment={selectedShipment}
        onSuccess={() => {
          setShowDriverExpenses(false);
        }}
      />
    )}

{showRerunDialog && (
  <RerunShipmentModal
    show={showRerunDialog}
    shipmentId={selectedShipmentForRerun?._id || ""}
    onClose={() => setShowRerunDialog(false)}
  />
)}

{isGeofenceEditorOpen && selectedShipmentForGeofence && (
  <GeofenceEditor
    open={isGeofenceEditorOpen}
    onClose={() => setIsGeofenceEditorOpen(false)}
    shipment={{
      ...selectedShipmentForGeofence,
      pickDate: selectedShipmentForGeofence.scheduledDate || new Date().toISOString(),
      deliverDate: selectedShipmentForGeofence.scheduledDeliveryDate || new Date().toISOString(),
      to: (selectedShipmentForGeofence.to || []).map((dest: any, index: number) => ({
        _id: dest._id || `temp-${index}`,
        location: {
          _id: dest.location?._id || `loc-${index}`,
          name: dest.location?.name || '',
          area: dest.location?.area || '',
          geo_point: { 
            coordinates: dest.location?.geo_point?.coordinates || [0, 0] 
          },
          polylines: [],
          reference: dest.location?.reference || ''
        }
      }))
    }}
  />
)}
 </div>
  );
};



export default ShipmentsDashboard;
