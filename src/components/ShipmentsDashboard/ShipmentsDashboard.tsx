import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./ShipmentsDashboard.module.css";
import EpodPreviewModal from "../ShipmentsDashboard/DocumentManagement/EpodPreviewModal";
import {
  RefreshCw,
  RotateCw,
  Send,
  FileText,
  Upload,
  Truck,
  IndianRupee,
  TrendingUp,
  Users,
  Clock,
  Package2,
  UserCheck,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  MoreHorizontal,
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
import MarkAsArrivedModal from "../ShipmentsDashboard/Others/MarkAsArrivedModal";
import CompleteShipmentModal from "../ShipmentsDashboard/ShipmentManagement/CompleteShipmentModal";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../UI/dropdown-menu";
// import Button from "@mui/material/Button";
import { ShipmentsTable } from "./ShipmentsTable";
import { AnalyticsView } from "./AnalyticsView";
import { AdvancedFilter } from "./AdvancedFilter/AdvancedFilter";
import LocationModal from "../ShipmentsDashboard/LocationTracking/LocationModal";
import ActiveCarriersModal from "../ShipmentsDashboard/SpecialFeatures/ActiveCarriersModal";
// import FreightModal from "../ShipmentsDashboard/SpecialFeatures/FreightModal";
// import DelayPenaltyModal from "../ShipmentsDashboard/SpecialFeatures/DelayPenaltyModal";
import RerunShipmentModal from "../ShipmentsDashboard/ShipmentManagement/RerunShipmentModal";
import PullFreightModal from "../ShipmentsDashboard/Financial/PullFreightModal";
import AttachFilesModal from "../ShipmentsDashboard/DocumentManagement/AttachFilesModal";
// import UpdateFreightModal from "./Modals/UpdateFreightModal";
import UploadModal from "../ShipmentsDashboard/DocumentManagement/UploadModal";
import AddRoambeeModal from "../ShipmentsDashboard/LocationTracking/AddRoambeeModal";
import OpenVideosModal from "../ShipmentsDashboard/SpecialFeatures/OpenVideosModal";
import AddDeliveryOrderModal from "../ShipmentsDashboard/SpecialFeatures/AddDeliveryOrderModal";
import AddManagedByModal from "../ShipmentsDashboard/SpecialFeatures/AddManagedByModal";
import IncreasePriceModal from "../ShipmentsDashboard/Financial/IncreasePriceModal";
import UpdateStatusModal from "../ShipmentsDashboard/ShipmentManagement/UpdateStatusModal";
import WarningModal from "../ShipmentsDashboard/SpecialFeatures/WarningModal";
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
import AddRemarkDialog from '../ShipmentsDashboard/LocationTracking/AddRemarkDialog';
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

// Types
interface Shipment {
  drop: any;
  organization: any;
  unique_code: any;
  epods: any;
  _id: string;
  sin: string;
  status: string;
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

// 1. First, define the Location interface
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

const ShipmentsDashboard: React.FC = () => {
  const { showMessage } = useSnackbar();
  // State management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [totalShipments, setTotalShipments] = useState(0);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [shipmentType, setShipmentType] = useState<
    "all" | "outbound" | "inbound" | "others"
  >("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isAnalyticsView, setIsAnalyticsView] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("SIN");
  const [selectedSubFilter, setSelectedSubFilter] = useState<string | null>(
    null
  );

  // Advanced filters
  const [invoiceNo, setInvoiceNo] = useState("");
  const [lrNumber, setLrNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
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
  const [selectedShipmentDetails, setSelectedShipmentDetails] =
    useState<Shipment | null>(null);
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
  const [showAddRoambeeDialog, setShowAddRoambeeDialog] = useState(false);
  const [showLastKnownLocationDialog, setShowLastKnownLocationDialog] =
    useState(false);
  const [showOpenVideosDialog, setShowOpenVideosDialog] = useState(false);
  const [showAddDODialog, setShowAddDODialog] = useState(false);
  const [showAddManagedByDialog, setShowAddManagedByDialog] = useState(false);
  const [showIncreasePriceDialog, setShowIncreasePriceDialog] = useState(false);
  const [showAddRemarkDialog, setShowAddRemarkDialog] = useState(false);

  // Modal data states
  const [shipmentDelayData, setShipmentDelayData] = useState<any>({});
  const [selectedRerunOption, setSelectedRerunOption] = useState("");
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
  const [freightPayload, setFreightPayload] = useState<any>({});
  const [selectedShipmentStatus, setSelectedShipmentStatus] = useState("");
  const [roambeeId, setRoambeeId] = useState("");
  const [lastKnownLocationValue, setLastKnownLocationValue] = useState("");
  const [lastKnownLocationTime, setLastKnownLocationTime] = useState("");
  const [doNumber, setDoNumber] = useState("");
  const [selectedCarrierManagedBy, setSelectedCarrierManagedBy] = useState<any>(
    { id: "", name: "" }
  );
  const [selectedDealerType, setSelectedDealerType] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [notify, setNotify] = useState(false);
  const [other, setOther] = useState(false);
  const [checked, setChecked] = useState(false);

  // Add these state variables at the top of your functional component
  const [showRoambeeModal, setShowRoambeeModal] = useState(false);
  const [selectedShipmentForRoambee, setSelectedShipmentForRoambee] =
    useState<Shipment | null>(null);
  const [isSubmittingRoambee, setIsSubmittingRoambee] = useState(false);

  // Advanced search states
  const [showAdvanceSearch, setShowAdvanceSearch] = useState(false);

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
  const [searchTerm, setSearchTerm] = useState("");
  const [analyticsStatusDistribution, setAnalyticsStatusDistribution] =
    useState<any[]>([]);
  const [analyticsDivisionPerformance, setAnalyticsDivisionPerformance] =
    useState<any[]>([]);
  const [analyticsAlerts, setAnalyticsAlerts] = useState<any[]>([]);
  const [totalFreightData, setTotalFreightData] = useState<any[]>([]);
  const [averageFreightData, setAverageFreightData] = useState<any[]>([]);

  // Additional states for functionality
  const [roles, setRoles] = useState<any>({ owner: false, fleet: false });
  const [functions, setFunctions] = useState<any>({
    shipment_management: false,
    hide_mobile: true,
    hide_freight: true,
  });
  const [symbol, setSymbol] = useState("₹");
  const [userType, setUserType] = useState("");
  const [dealerTypes, setDealerTypes] = useState<any[]>([]);
  const [reasons, setReasons] = useState<any[]>([]);
  const [delayReasons, setDelayReasons] = useState<any[]>([]);
  const [weightUnits, setWeightUnits] = useState<any[]>(["KG", "MT", "TON"]);
  const [shipmentStatuses, setShipmentStatuses] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [sampleLink, setSampleLink] = useState("");
  const [videoURL, setVideoURL] = useState("");

  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [shipmentsArray, setShipmentsArray] = useState<any[]>([]);
  const [selectedShipmentsArray, setSelectedShipmentsArray] = useState<any[]>(
    []
  );
  const [isTechnova, setIsTechnova] = useState(false);
  const initialLoadDone = useRef(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [currentShipment, setCurrentShipment] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showAddDO, setShowAddDO] = useState(false);
  const [currentShipmentNo, setCurrentShipmentNo] = useState("");

  const [showGpsModal, setShowGpsModal] = useState(false);
  const [selectedGps, setSelectedGps] = useState<string[]>([]);

  const [showDelayReasonDialog, setShowDelayReasonDialog] = useState(false);
  const [selectedShipmentForDelay, setSelectedShipmentForDelay] = useState<Shipment | null>(null);

  const [selectedShipmentForPriceIncrease, setSelectedShipmentForPriceIncrease] = useState<string>("");

  const [showMarkAsArrivedModal, setShowMarkAsArrivedModal] = useState(false);
  const [selectedShipmentForArrival, setSelectedShipmentForArrival] = useState<Shipment | null>(null);
  const [showCompleteShipmentModal, setShowCompleteShipmentModal] = useState(false);
  const [selectedShipmentForCompletion, setSelectedShipmentForCompletion] = useState<Shipment | null>(null);

  const [showMissedShipmentModal, setShowMissedShipmentModal] = useState(false);
  const [selectedShipmentForMissed, setSelectedShipmentForMissed] = useState<Shipment | null>(null)
  const [odcFilter, setOdcFilter] = useState<boolean>(false);
  // ...existing code...
const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

const [locationDialogState, setLocationDialogState] = useState<{
  isOpen: boolean;
  shipmentId?: string;
}>({ isOpen: false });

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

  const handleDelayReasonSubmit = async (shipmentId: string, remark: string) => {
    try {
      const response = await httpsPost('shipment/delay', {
        shipment_id: shipmentId,
        reason: remark,
        type: 'delay_reason'
      });

      if (response.statusCode === 200) {
        // Refresh the shipment data or update the UI as needed
        showMessage('Delay reason updated successfully', 'success');
        // You might want to refresh the shipments list here
        // fetchShipments(); 
      } else {
        throw new Error(response.message || 'Failed to update delay reason');
      }
    } catch (error: any) {
      console.error('Error updating delay reason:', error);
      showMessage(
        error.message || 'Failed to update delay reason. Please try again.',
        'error'
      );
    }
  };

  // Modal and dialog states
  const [delayHistory, setDelayHistory] = useState<any[]>([]);
  const [delaygpsRemoveHistory, setDelaygpsRemoveHistory] = useState<any[]>([]);
  const [delayReasonType, setDelayReasonType] = useState("");
  const [selectedShipmentNo, setSelectedShipmentNo] = useState("");
  const [fromDateTsReRun, setFromDateTsReRun] = useState("");
  const [toDateTsReRun, setToDateTsReRun] = useState("");
  const [freightType, setFreightType] = useState<'rate' | 'client_rate'>("rate");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [shipmentsFilter, setShipmentsFilter] = useState<any>({
    type_filter: "outbound",
  });
  const [advanceSearch, setAdvanceSearch] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("SIN");

  const [shipmentSin, setShipmentSin] = useState("");
  const [carrierSearch, setCarrierSearch] = useState("");
  const [commercialInvoice, setCommercialInvoice] = useState(null);
  const [fromDateString, setFromDateString] = useState("");
  const [toDateString, setToDateString] = useState("");
  const [transVehicle, setTransVehicle] = useState("");
  const [selectedSegmentations, setSelectedSegmentations] = useState([]);
  const [nonTracking, setNonTracking] = useState("");

  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [modalShipment, setModalShipment] = useState<Shipment | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [showIncreasePrice, setShowIncreasePrice] = useState(false);

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

  
  const actionMenuCategories = {
    "Quick Actions": [
      { icon: Eye, label: "View", color: "text-blue-600" },
      {
        icon: Share2,
        label: "Share",
        color: "text-blue-500",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          const trackingUrl = `${window.location.origin}/track/${shipment.unique_code}`;
          setShareUrl(trackingUrl);
          setSharedShipment(shipment);
          setShareModalOpen(true);
        },
      },
      {
  icon: Mail,
  label: "Mail",
  color: "text-orange-600",
  onClick: (shipment: Shipment) => {
    console.log("Mail action onClick called");
    closeAllDialogs();
    setShipmentToMail(shipment);
    setMailModalOpen(true);
    console.log("Mail modal should now be open");
  },
},
      {
        icon: XCircle,
        label: "Cancel",
        color: "text-red-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setShipmentToCancel(shipment);
          setCancelModalOpen(true);
        },
      },
    ],
    "Tracking & GPS": [
      { 
        icon: Download, 
        label: "SIM Tracking", 
        color: "text-amber-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipment(shipment);
          setModalOpen(true);
        }
      },
      {
        icon: WifiOff,
        label: "GPS Disconnection Reason",
        color: "text-teal-600",
        onClick: (shipment: Shipment) => handleOpenReasonDialog('gps', shipment._id, shipment.sin)
      },
      { 
        icon: Wifi, 
        label: "Add GPS Connection", 
        color: "text-amber-600",
        onClick: (shipment: Shipment) => handleOpenGpsModal(shipment)
      },
      { icon: Clock, label: "Update Delay Reason", color: "text-teal-600", onClick: (shipment: Shipment) => {
        closeAllDialogs();
        handleOpenReasonDialog('delay', shipment._id, shipment.sin)
      } },
    ],
    "Location & Routes": [
      {
        icon: Edit,
        label: "Edit Pickup Location",
        color: "text-pink-600",
        onClick: (shipment: Shipment) => handleOpenEditLocation(shipment, 'pickup'),
        disabled: (shipment: Shipment) => 
          ['Completed', 'Cancelled'].includes(shipment.status)
      },
      {
        icon: Edit,
        label: "Edit Delivery Location",
        color: "text-pink-600",
        onClick: (shipment: Shipment) => handleOpenEditLocation(shipment, 'delivery'),
        disabled: (shipment: Shipment) => 
          ['Completed', 'Cancelled'].includes(shipment.status)
      },
      {
        icon: Route,
        label: "Pull Freight with Routes",
        color: "text-brown-600",
        onClick: (shipment: Shipment) => {
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
        }
      },
      {
        icon: Calculator,
        label: "Recalculate Distance",
        color: "text-pink-600",
        onClick: (shipment: any) => {
          closeAllDialogs();
          handleRecalculateDistance(shipment)
        }
      },
    ],
    "Freight & Payment": [
      {
        icon: Truck,
        label: "Update Carrier Freight",
        color: "text-gray-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          handleOpenFreightModal(shipment._id, shipment.sin, 'rate');
        }
      },
      { 
        icon: Truck, 
        label: "Flush Freight", 
        color: "text-gray-600",
        onClick: handleFlushFreight
      },
      {
        icon: CreditCard,
        label: "Create Advance Payment",
        color: "text-indigo-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipmentForPayment(shipment);
          setShowPaymentAdvanceModal(true);
        },
      },
      {
        icon: FileText,
        label: "Change Invoice Type",
        color: "text-brown-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipmentForInvoiceType(shipment);
          setIsInvoiceTypeModalOpen(true);
        },
      },
    ],
    "Documents & Status": [
      {
        icon: FileText,
        label: "Upload Approval Documents",
        color: "text-purple-600",
        onClick: (shipment: Shipment) => {
          console.log('Upload Approval Documents clicked');
          closeAllDialogs();
          console.log('Setting selected shipment and showing dialog');
          setSelectedShipmentForAttach(shipment);
          setShowAttachDialog(true);
        },
      },
      {
        icon: Package,
        label: "View Epods",
        color: "text-brown-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          console.log('View Epods clicked, shipment:', shipment);
          setSelectedShipmentForEpod(shipment);
          console.log('After setSelectedShipmentForEpod, selectedShipmentForEpod:', shipment);
          setIsEpodModalOpen(true);
          console.log('After setIsEpodModalOpen, isEpodModalOpen:', true);
        },
      },
      {
        icon: CheckCircle,
        label: "Complete Shipment",
        color: "text-green-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipmentForCompletion(shipment);
          setShowCompleteShipmentModal(true);
        },
      },
      {
        icon: DoorOpen,
        label: "Recalculate Customer Gate In/Out",
        color: "text-pink-600",
        onClick: 
          (shipment: Shipment) => handleRecalculateGateInOut(shipment),
        disabled: (shipment: Shipment) =>
          ["Completed", "Cancelled"].includes(shipment.status),
          },
    ],
    Other: [
      {
        icon: PlusCircle,
        label: "Add Roambee ID",
        color: "text-blue-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipmentForRoambee(shipment);
          setShowRoambeeModal(true);
        },
      },
      // {
      //   icon: CheckCircle,
      //   label: "Complete Shipment",
      //   color: "text-green-600",
      //   onClick: (shipment: Shipment) => {
      //     setShipmentForCompletion(shipment);
      //     setShowCompleteShipmentModal(true);
      //   }
      // },
      {
        icon: CheckCircle,
        label: "Submit Mark As Arrived",
        color: "text-green-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipmentForArrival(shipment);
          setShowMarkAsArrivedModal(true);
        },
      },
      //Create Payment Advice
      {
        icon: CreditCard,
        label: "Create Payment Advance",
        color: "text-indigo-600",
        onClick: (shipment: Shipment) => handleCreatePaymentAdvice(shipment),
      },
      //Bulk Upload - Commercial Invoices
      {
        icon: Upload,
        label: "Bulk Upload - Commercial Invoices",
        color: "text-green-600",
        onClick: (shipment: Shipment) => handleBulkUploadClick(shipment)
      },
    ],
    Others: [
      // Add DO Details
      {
        icon: PlusCircle,
        label: "Add DO Details",
        color: "text-blue-600",
        onClick: (shipment: any) => {
          closeAllDialogs();
          setSelectedShipment(shipment);
          setSelectedShipmentSIN(shipment.sin || shipment._id);
          setShowAddDODialog(true);
        },
      },
      // update shipment status
      {
        icon: Edit,
        label: "Update Shipment Status",
        color: "text-yellow-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipmentForStatus(shipment);
          setShowStatusModal(true);
        }
      },
      // Mark as faulty
      {
        icon: AlertCircle,
        label: "Mark Fault Device",
        color: "text-red-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipmentForFaulty(shipment);
          setShowFaultyModal(true);
        }
      },
       // Missed Shipment
      {
        icon: AlertCircle,
        label: "Missed Shipment",
        color: "text-red-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipmentForMissed(shipment);
          setShowMissedShipmentModal(true);
        }
      },
      {
        icon: AlertCircle,
        label: "Missed Event",
        color: "text-red-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipmentForMissedEvent(shipment);
          setShowMissedEventModal(true);
        }
      },
    ],
    Others1: [
      // Add Managed By 
      {
        icon: UserPlus,
        label: "Add Managed By",
        color: "text-blue-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipmentForManagedBy(shipment);
          setShowAddManagedByModal(true);
        }
      },
      // Retriggered missed shipment
      {
        icon: RefreshCw,
        label: "ReTrigger Missed Events",
        color: "text-blue-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          setSelectedShipmentForRetrigger(shipment);
          setShowRetriggerEventModal(true);
        }
      },
      //Reassign
      {
        icon: RefreshCw,
        label: "Reassign",
        color: "text-blue-600",
      },
      //Update Client Freight
      {
        icon: Edit,
        label: "Update Client Freight",
        color: "text-yellow-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          handleOpenFreightModal(shipment._id, shipment.sin, 'client_rate');
        }
      },
      //Add Driver Expenses
      {
        icon: Plus,
        label: "Add Driver Expenses",
        color: "text-green-600",
        onClick: (shipment: Shipment) => {
          closeAllDialogs();
          handleDriverExpenseClick(shipment);
        }
      },
    ],
    Others2: [
      //Add/Edit Geofence
      {
        icon: Plus,
        label: "Add/Edit Geofence",
        color: "text-green-600",
        onClick: handleOpenGeofenceEditor,
        disabled: (shipment: Shipment) => 
          ['Completed', 'Cancelled'].includes(shipment.status)
      },
    ]
  };

const closeActionMenu = () => {
  console.log("closeActionMenu executed, closing dropdown");
  setActionMenuOpenId(null);
};

  useEffect(() => {
    console.log('showAttachDialog state changed:', showAttachDialog);
  }, [showAttachDialog]);

  // Sub filters data
  const subFilters = [
    { key: "completed", label: "Completed", count: 0, color: "#2ecc40" },
    { key: "approved", label: "Approved", count: 0, color: "#27ae60" },
    { key: "pending", label: "Pending", count: 0, color: "#2980b9" },
    { key: "in_transit", label: "In Transit", count: 0, color: "#f39c12" },
    { key: "cancelled", label: "Cancelled", count: 0, color: "#e74c3c" },
    { key: "assigned", label: "Assigned", count: 0, color: "#8e44ad" },
    { key: "towards_pickup", label: "Towards Pickup", count: 0, color: "#16a085" },
    { key: "at_pickup", label: "At Pickup", count: 0, color: "#3498db" },
    { key: "at_delivery", label: "At Delivery", count: 0, color: "#f1948a" },
    { key: "accepted", label: "Accepted", count: 0, color: "#1abc9c" },
    { key: "about_to_reach", label: "About to Reach", count: 0, color: "#34495e" }
  ];

  // Analytics lifecycle data
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

  const lucideIconMap = {
    inventory_2: Package2, // closest to "inventory"
    assignment_ind: UserCheck, // closest to "assignment/user"
    local_shipping: Truck, // truck for shipping
    transfer_within_a_station: RefreshCw, // movement/transfer
    task_alt: ClipboardCheck, // completion/check
    check_circle: CheckCircle2, // check mark
  };

  const lucideInsightIcons = {
    check_circle: CheckCircle2,
    warning: AlertTriangle,
    trending_up: TrendingUp,
    people: Users,
  };

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
    }, // Changed 'grey' to 'default'
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

  // Effect
 

  useEffect(() => {
    setShowButtons(selectedShipmentsArray.length > 0);
  }, [selectedShipmentsArray]);

  // Event handlers
  const handleShipmentTypeChange = (
    type: "outbound" | "inbound" | "others" | "all"
  ) => {
    setShipmentType(type);
    setCurrentPage(0);
    // Pass the type directly to fetchShipments to ensure it uses the correct type
    fetchShipments(type);
  };

  const handleSubFilterSelect = (filterKey: string) => {
    const newSelectedFilter = selectedSubFilter === filterKey ? null : filterKey;

    // 2. Set the state with the new value
    setSelectedSubFilter(newSelectedFilter);
  
    // Reset page to 0 and fetch data with the new filter
    setCurrentPage(0);
    fetchShipments({
      dashboard_filter: newSelectedFilter,
      skip: 0,
      limit: pageSize,
    });
  };

  const handleClearFilters = () => {
    setInvoiceNo("");
    setLrNumber("");
    setFromDate("");
    setToDate("");
    setVehicleNumber("");
    setMobile("");
    setSelectedCarriers([]);
    setSelectedOrganizations([]);
    setSelectedMaterials([]);
    setSelectedPickups([]);
    setSelectedDeliveries([]);
    setSearchQuery("");
    fetchShipments();
  };

  const handleOpenShipmentDetails = (shipment: Shipment) => {
    setSelectedShipmentDetails(shipment);
    setShowShipmentDetails(true);
  };

  const handleOpenLocationsPopup = (
    locations: any[],
    type: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    const locationsArray = Array.isArray(locations) ? locations : [];
    setLocationPopupData({ locations: locationsArray, type, shipmentSin: "" });
    setShowLocationPopup(true);
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      Completed: "#28a745",
      "In Transit": "#17a2b8",
      "At Pickup": "#ffc107",
      Pending: "#6c757d",
      Cancelled: "#dc3545",
      Assigned: "#007bff",
      "Towards Pickup": "#fd7e14",
      "At Delivery": "#20c997",
      Accepted: "#6f42c1",
      "About to Reach": "#e83e8c",
    };
    return statusColors[status] || "#6c757d";
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return "N/A";
    return new Date(dateTime).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const columnsToDisplay = [
    "selected",
    "sno",
    "status",
    "sin",
    "pickup_drop",
    "date_time",
    "carrier",
    "vehicle_number",
    "track",
    "driver",
    "driver_phone",
    "epod",
    "consent",
    "subscribed",
    "last_location",
    "freight",
    "action",
  ];

  const fetchDropdownData = async () => {
    try {
      const response = await fetch("/api/dropdowns");
      const data = await response.json();

      if (data.statusCode === 200) {
        setMaterialsArray(data.data.materials || []);
        setLocationsArray(data.data.locations || []);
        setPickupLocations(data.data.pickup_locations || []);
        setDeliveryLocations(data.data.delivery_locations || []);
        setSegmentations(data.data.segmentations || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      const data = await response.json();
      setOrganizations(data.data || []);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchCarriers = async () => {
    try {
      const response = await httpsGet("carriers", 0);
      const data = response.data;
      setAllCarriers(data || []);
    } catch (error) {
      console.error("Error fetching carriers:", error);
    }
  };

  const handleShipmentClick = (shipment: any) => {
    setCurrentShipment(shipment);
    setShowUpdateStatus(true);
  };

  const handleStatusUpdate = async (statusId: any) => {
    try {
      // Call your API to update the status
      // await updateShipmentStatus(currentShipment.id, statusId);
      // Handle success (maybe show a success message and refresh the data)
      setShowUpdateStatus(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleTrackShipment = (shipment: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Open tracking modal or navigate to tracking page
    console.log("Tracking shipment:", shipment.sin);
  };

  const handleMapView = (shipment: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Open map modal
    console.log("Opening map for shipment:", shipment.sin);
  };

  const handleShareShipment = (shipment: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Open share modal
    console.log("Sharing shipment:", shipment.sin);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show success message
    console.log("Copied to clipboard:", text);
  };

  const handleAdvancedSearch = () => {
    // const filters = {
    //   fromDate,
    //   toDate,
    //   invoiceNo,
    //   lrNumber,
    //   materials: selectedMaterials.map(m => m._id),
    //   pickups: selectedPickups.map(p => p._id),
    //   deliveries: selectedDeliveries.map(d => d._id),
    //   carriers: selectedCarriers.map(c => c._id),
    //   status: shipmentStatusName,
    //   mobile,
    //   vehicleNo,
    //   sin: shipmentSIN,
    //   projectCode,
    //   saleOrder,
    //   purchaseOrder,
    //   ppdNo,
    //   organization: selectedOrganisation.id,
    //   segmentations: selectedSegmentation
    // };
    // fetchShipments(filters);
    // setShowAdvanceSearch(false);
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

    fetchShipments();
  };

  // Pagination Functions
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchShipments({
      skip: newPage * pageSize,
      limit: pageSize,
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0);
    fetchShipments({
      skip: 0,
      limit: newPageSize,
    });
  };

  // Modal Functions for all the dialog handlers
  const openShipmentDetails = (shipment: any, tabIndex: number = 0) => {
    // Open shipment details modal
    console.log("Opening shipment details:", shipment);
  };

  const openAssignModal = (shipment: any, label: string = "Assign Driver") => {
    // Open assign driver modal
    console.log("Opening assign modal:", shipment);
  };

  const openCancelModal = (shipment: any) => {
    // Open cancel shipment modal
    console.log("Opening cancel modal:", shipment);
  };

  const showLastLocation = (shipment: any) => {
    setLastKnownLocationValue(
      shipment.trip_tracker?.last_location_address || "N/A"
    );
    setLastKnownLocationTime(
      formatDate(shipment.trip_tracker?.last_location_at)
    );
    setShowLastKnownLocationDialog(true);
  };

  // Bulk Actions
  const printInvoices = async () => {
    if (selectedShipmentsArray.length === 0) {
      alert("Please select shipments");
      return;
    }

    const payload = { ids: selectedShipmentsArray };
    try {
      const response = await fetch("/api/reports/download_invoice_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.statusCode === 200) {
        window.open(data.data.link, "_blank");
      }
    } catch (error) {
      console.error("Error printing invoices:", error);
    }
  };

  const printLRs = () => {
    if (selectedShipmentsArray.length === 0) {
      alert("Please select shipments");
      return;
    }
    // Open print LR modal
    console.log("Printing LRs for:", selectedShipmentsArray);
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchDropdownData();
    fetchOrganizations();
    fetchCarriers();
  }, []);

  // Analytics Functions
  const toggleAnalyticsView = () => {
    setIsAnalyticsView(!isAnalyticsView);
  };

  const toggleCompactView = () => {
    setIsCompactView(!isCompactView);
  };

  const openActiveCarriersPopup = () => {
    setShowActiveCarriersPopup(true);
  };


  // const getPullFreight = async (data: {
  //   destination: string;
  //   freightRate: string;
  // }) => {
  //   console.log(" getPullFreight ----");
  //   try {
  //     const response = await httpsGet(
  //       `/api/freight_rate_route_code/get?destination=${encodeURIComponent(
  //         data.destination
  //       )}&shipment=${encodeURIComponent(pullFreightData.shipmentId)}`
  //     );

  //     if (response.statusCode === 200) {
  //       alert(`New Freight Rate is ${response.data}`);
  //       setShowPullFreightDialog(false);
  //     }
  //   } catch (error) {
  //     console.error("Error getting freight rate:", error);
  //     alert("Failed to get freight rate");
  //   }
  // };

  const updateFreight = async () => {
    try {
      const response = await fetch("/api/shipment/update_freight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(freightPayload),
      });
      const data = await response.json();

      if (data.statusCode === 200) {
        alert("Freight updated successfully");
        setShowUpdateFreightDialog(false);
        fetchShipments();
      }
    } catch (error) {
      console.error("Error updating freight:", error);
    }
  };

  const updateShipmentStatus = async () => {
    if (!selectedShipmentStatus) {
      alert("Please select a status");
      return;
    }

    try {
      const response = await fetch("/api/shipment/update_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment: selectedShipmentSIN,
          status: selectedShipmentStatus,
        }),
      });
      const data = await response.json();

      if (data.statusCode === 200) {
        alert("Status updated successfully");
        setShowUpdateStatusDialog(false);
        fetchShipments();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const submitManagedBy = async () => {
    try {
      const response = await fetch("/api/shipment/add_managed_by", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment: selectedShipmentSIN,
          managedBy: selectedCarrierManagedBy.id,
        }),
      });
      const data = await response.json();

      if (data.statusCode === 200) {
        alert("Carrier added successfully");
        setShowAddManagedByDialog(false);
        fetchShipments();
      }
    } catch (error) {
      console.error("Error adding managed by:", error);
    }
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

  const updateRemarks = async () => {
    const url =
      delayReasonType === "delayReason"
        ? "/api/shipment/delay_reason"
        : "/api/shipment/gps_disconnection_reason";

    const payload =
      delayReasonType === "delayReason"
        ? {
            _id: selectedShipmentSIN,
            delay_reason:
              selectedReason === "Others" ? otherReason : selectedReason,
            ...(notify ? { notify } : {}),
          }
        : {
            _id: selectedShipmentSIN,
            reason: selectedReason === "Others" ? otherReason : selectedReason,
          };

    try {
      const response = await fetch(url, {
        method: delayReasonType === "delayReason" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.statusCode === 200) {
        alert("Updated successfully");
        setShowAddRemarkDialog(false);
        fetchShipments();
      }
    } catch (error) {
      console.error("Error updating remarks:", error);
    }
  };

  const approveWaiveOff = async (status: string) => {
    try {
      const response = await fetch(
        `/api/shipment/delay_penalty_waive_off/${selectedShipmentSIN}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            suggested_amount: shipmentDelayData.suggested_amount,
          }),
        }
      );
      const data = await response.json();

      if (data.statusCode === 200) {
        alert("Waive off processed successfully");
        setShowDelayedShipmentDialog(false);
        fetchShipments();
      }
    } catch (error) {
      console.error("Error processing waive off:", error);
    }
  };

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchShipments({ search: searchValue });
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const onRerunSubmit = async () => {
    if (!selectedRerunOption) {
      alert("Please select a status");
      return;
    }

    try {
      const response = await fetch("/api/re/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment: selectedShipmentSIN,
          status: selectedRerunOption,
          startTime: fromDateTsReRun,
          endTime: toDateTsReRun,
        }),
      });
      const data = await response.json();

      if (data.statusCode === 200) {
        alert("Rerun successful");
        setShowRerunDialog(false);
      }
    } catch (error) {
      console.error("Error running rerun:", error);
    }
  };

  // File handling functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Handle file upload logic
      console.log("Files selected:", files);
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

  const attachFiles = async () => {
    // Handle file attachment logic
    console.log("Attaching files");
  };

  const uploadBulkShipments = async () => {
    // Handle bulk upload logic
    console.log("Uploading bulk shipments");
  };

  const submitRoambee = async () => {
    if (!selectedShipmentForRoambee) return;

    try {
      setIsSubmittingRoambee(true);
      // Replace with your actual API endpoint
      const response = await httpsPost("shipment/add_roambee_id", {
        shipmentId: selectedShipmentForRoambee._id,
        roambeeId,
      });

      if (response.data.statusCode === 200) {
        showMessage("Roambee ID added successfully", "success");
        setShowRoambeeModal(false);
        // Refresh the shipments list or update the specific shipment
        fetchShipments();
      }
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Failed to add Roambee ID",
        "error"
      );
    } finally {
      setIsSubmittingRoambee(false);
    }
  };

  const handleWarningConfirm = (confirmed: boolean) => {
    setShowWarningDialog(false);
    if (confirmed) {
      // Proceed with the action
      console.log("Warning confirmed, proceeding...");
    }
  };

  const tableRef = useRef<HTMLDivElement>(null);

  // Utility Functions
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

    // Use the provided type or fall back to the current shipmentType
    const filterType = type || shipmentType;

    if (filterType !== "all") {
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

    if (shipmentType === "all") {
      delete filters.dashboard_filter;
      delete filters.type_filter;
    }

    setShowButtons(false);

    try {
      // Replace with your actual API call
      const response = await httpsPost("shipment/many", filters, {}, 5);

      console.log("Response:", response.data);

      if (response.statusCode === 200) {
        console.log("Response:", "calling");
        setTotalShipments(response.data.count);
        const result = response.data.shipments;
        const processedShipments: any[] = [];

        // Complex data mapping (converted from Angular forEach logic)
        result.forEach((element: any) => {
          const temp: any = {
            material: [],
          };

          // Basic properties
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

          // Driver and vehicle information
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

          // Loading/unloading charges
          temp.loading_charges = element.others
            ? element.others.loading_charges
            : "";
          temp.unloading_charges = element.others
            ? element.others.unloading_charges
            : "";
          temp.is_mykl = element.others ? element.others.s_mykl : false;
          temp.others = element.others;

          // Materials
          const mat = element.materials || [];
          temp.driverType =
            (element.assigned_driver && element.assigned_driver.driver_type) ||
            "";

          // GPS Vehicle logic
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

          // Status determination
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

          // Carrier information
          temp.carrier = element.carrier || "";
          temp.carrier_parent_name = element.carrier
            ? element.carrier.parent_name
            : "Own Fleet";
          temp.organization = element.organization || "";
          temp.isOwnFleet_shipment = element.own_fleet || false;
          temp.booked_by = element.shipper?.name || "";
          temp.order = element.order;

          // Vehicle type information
          temp.reqVehicleType =
            element.vehicle_type && element.vehicle_type.name
              ? element.vehicle_type.name
              : "N/A";
          temp.reqVehicleType_id =
            element.vehicle_type && element.vehicle_type._id
              ? element.vehicle_type._id
              : "N/A";

          // Trip tracker information
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

          // Location information
          temp.drop_num = element.deliveries?.length || 0;
          temp.drop = element.deliveries?.[0]?._id;

          // Date information
          temp.pickDate = element.pickup_date;
          temp.scheduledDate = toShortDateTime(element.pickup_date);
          temp.actualDate = toShortDateTime(element.pickup_date);
          temp.actualPickupDate =
            element.pickups &&
            element.pickups.length &&
            element.pickups[0].finished_at
              ? toShortDateTime(element.pickups[0].finished_at)
              : "";

          // Time and distance
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

          // Delivery information
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

          // Location IDs
          temp.lastDeliveryLocation =
            element.deliveries && element.deliveries.length
              ? element.deliveries[element.deliveries.length - 1].location._id
              : "";
          temp.firstPickupLocation =
            element.pickups && element.pickups.length
              ? element.pickups[0].location._id
              : "";

          // Shipper counts
          temp.inboundShippers = element.inbound_shippers?.length || 0;
          temp.outBoundShippers = element.outbound_shippers?.length || 0;

          // Trans vehicle information
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

          // Delay calculation
          temp.time_delay = element.trip_tracker?.total_delay || 0;
          const delay_buffer = 0; // This should come from settings
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

          // SIM tracking information
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

          // Delay deduction
          temp.delay_deduction = element.delay_deduction || 0;

          // Disable share logic
          temp.disableShare = [
            "Assigned",
            "Completed",
            "Cancelled",
            "Pending",
          ].includes(temp.status);
          temp.disableClickShare =
            !["Assigned", "Completed", "Cancelled"].includes(temp.status) &&
            temp.assigned !== "Pending";

          // PPD and serial number
          temp.ppd = element.ppd || null;
          temp.serial_number = element.serial_number || null;
          temp.is_unplanned = element.is_unplanned || null;
          temp.ppd_updated = element.ppd_updated || false;

          // Rate information
          temp.rate = element.rate || {};
          temp.client_rate = element.client_rate || {};
          temp.epods_available = element.epods_available || false;

          // Invoice edit disable logic
          if (element.finished_at || temp.status === "Cancelled") {
            temp.disableInvoiceEdit = true;
          } else {
            temp.disableInvoiceEdit = false;
          }

          // Finished and arrived timestamps
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

          // Waybill flag
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

          // Commercial invoice existence check
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

  // Event handlers
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
    Completed: "#2ecc40", // Bright Green
    Approved: "#27ae60", // Deep Green
    Pending: "#2980b9", // Strong Blue
    "In Transit": "#f39c12", // Vivid Orange
    Cancelled: "#e74c3c", // Bright Red
    Assigned: "#8e44ad", // Purple
    "Towards Pickup": "#16a085", // Teal
    "At Pickup": "#3498db", // Sky Blue
    "At Delivery": "#f1948a", // Pink
    Accepted: "#1abc9c", // Aqua
    "About to Reach": "#34495e", // Dark Blue-Grey
  };

  const statusLabels: Record<string, string> = {
    Completed: "Completed",
    Approved: "Approved",
    Pending: "Pending",
    "In Transit": "In Transit",
    Cancelled: "Cancelled",
    Assigned: "Assigned",
    "Towards Pickup": "Towards Pickup",
    "At Pickup": "At Pickup",
    "At Delivery": "At Delivery",
    Accepted: "Accepted",
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
        title={statusLabels[status] || status} // Show status text on hover
      />
    );
  };

  const renderSINCell = (shipment: any) => (
    <div>
      {shipment.sin}
      {shipment.ppd && <span>-{shipment.ppd}</span>}
      {shipment.serial_number && (
        <span>
          {shipment.is_unplanned ? " - US" : " - SS"}- {shipment.serial_number}
        </span>
      )}
      {shipment.delayed_shipment && (
        <span
          title="Delay"
          style={{
            cursor: "default",
            display: "inline-flex",
            verticalAlign: "middle",
            marginLeft: 8,
          }}
        >
          <AlertCircle size={18} color="#e03e3e" />
        </span>
      )}
      {shipment.sale_order && (
        <div>
          {shipment.sale_order.split(",")[0]}
          {shipment.sale_order.split(",").length > 1 && (
            <span title={shipment.sale_order.split(",").slice(1).join(",")}>
              +{shipment.sale_order.split(",").length - 1}
            </span>
          )}
        </div>
      )}
    </div>
  );
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

    // For 'inbound' and 'outbound' types, only show the relevant location type
    if (
      (shipmentType === "inbound" && !isPickup) ||
      (shipmentType === "outbound" && isPickup)
    ) {
      return null;
    }

    if (!firstLocation) return null;

    // Get the appropriate date based on shipment type and location type
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
          {!isPickup && shipment.destination_code && (
            <button
              className={styles.copyButton}
              onClick={(e) => {
                e.stopPropagation();
                copyDestinationCode(shipment.destination_code);
              }}
              title="Copy destination code"
            >
              📋
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

  return (
    <div>
      {shipment.trip_tracker?.last_location_address ? (
        <LocationDialog
          address={shipment.trip_tracker.last_location_address}
          lastUpdated={shipment.trip_tracker?.last_location_at}
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
            <MapPin className={styles.locationIcon} />
          </Button>
        </LocationDialog>
      ) : (
        "-"
      )}
    </div>
  );
};

  const renderDateTimeCell = (shipment: any, shipmentType: string) => {
    // When shipmentType is 'others' show Pickup and Delivery times with badges
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

    // Shipment Type 'inbound'
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

    // Shipment Type 'outbound' or 'all'
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

    // Default fallback
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
        {/* Display color for consent status */}
        {shipment.showGreenConsent ? (
          <span className={styles.flagImgG}>Subscribed</span>
        ) : (
          <span className={styles.flagImgR}>Not Subscribed</span>
        )}
      </div>
    ) : null;
  };

  const handleAttachFiles = async (files: FileList) => {
    setIsUploading(true);
    try {
      // Handle file upload here
      console.log("Uploading files:", files);
      // await uploadFiles(files);
      setShowAttachModal(false);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderMaterialCell = (shipment: any) => (
    <div>
      {shipment.material?.map((item: any, i: number) => (
        <span key={i}>
          {item.name}
          {i < shipment.material.length - 1 && ", "}
        </span>
      ))}
    </div>
  );

  const filteredCarriers = allCarriers.filter((carrier) =>
    carrier.name.toLowerCase().includes(carrierSearch.toLowerCase())
  );

  // const handleApply = () => {
  //   const filters = {};
  //   if (selectedOrganisation) filters.organizations = [selectedOrganisation.id || selectedOrganisation._id];
  //   if (selectedMaterials.length) filters.materials = selectedMaterials.map((m) => m.id || m._id);
  //   if (invoiceNo) filters.invoice_no = invoiceNo;
  //   if (lrNumber) filters.lr_no = lrNumber;
  //   if (shipmentSin) filters.SIN = shipmentSin;
  //   if (shipmentStatus.length) filters.status = shipmentStatus;
  //   if (projectCode) filters.project_code = projectCode;
  //   if (ppdNo) filters.ppd_no = ppdNo;
  //   if (selectedPickups.length) filters.pickups = selectedPickups.map((p) => p.id || p._id);
  //   if (selectedCarriers.length) filters.carriers = selectedCarriers.map((c) => c.id || c._id);
  //   if (commercialInvoice !== null) filters.commercial_invoice = commercialInvoice;
  //   if (selectedDeliveries.length) filters.deliveries = selectedDeliveries.map((d) => d.id || d._id);
  //   if (fromDateString) filters.from = fromDateString;
  //   if (toDateString) filters.to = toDateString;
  //   if (transVehicle) filters.trans_vehicle = transVehicle === "Trans";
  //   if (saleOrder) filters.sale_order = saleOrder;
  //   if (purchaseOrder) filters.purchase_order = purchaseOrder;
  //   if (selectedSegmentations.length) filters.segmentations = selectedSegmentations;
  //   if (nonTracking) filters.nonTracking = nonTracking === "Tracking" ? false : true;
  //   if (mobile) filters.mobile = mobile;

  //   if (onApply) onApply(filters);
  // };

  // const handleClear = () => {
  //   setSelectedOrganisation(null);
  //   setSelectedMaterials([]);
  //   setInvoiceNo("");
  //   setLrNumber("");
  //   setShipmentSin("");
  //   setShipmentStatus([]);
  //   setProjectCode("");
  //   setPpdNo("");
  //   setSelectedPickups([]);
  //   setSelectedCarriers([]);
  //   setCarrierSearch("");
  //   setCommercialInvoice(null);
  //   setSelectedDeliveries([]);
  //   setFromDateString("");
  //   setToDateString("");
  //   setTransVehicle("");
  //   setSaleOrder("");
  //   setPurchaseOrder("");
  //   setSelectedSegmentations([]);
  //   setNonTracking("");
  //   setMobile("");

  //   if (onClear) onClear();
  // };

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
      // Refresh the shipments data
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
      // Refresh the shipments data
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
      // Refresh the shipments data
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
    // Refresh the shipments list or update the specific shipment status
    // For example:
    fetchShipments(); // Assuming you have a function to refresh the shipments
  };

  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [shipmentToMail, setShipmentToMail] = useState<Shipment | null>(null);

  const [showPaymentAdviceModal, setShowPaymentAdviceModal] = useState(false);


  const handleCreatePaymentAdvice = (shipment: Shipment) => {
    closeAllDialogs();
    setSelectedShipmentForPayment(shipment);
    setShowPaymentAdviceModal(true);
  };

  const handleRecalculateGateInOut = async (shipment: Shipment) => {
    closeAllDialogs();
    setSelectedShipmentForRerun(shipment);
    setShowRerunDialog(true);
  }

  const handlePaymentAdviceSubmit = async (data: any) => {
    try {
      // TODO: Replace with your actual API call
      // const response = await httpsPost('carrier_bill_advice/create', data);
      // if (response.success) {
      //   // Handle success
      //   setShowPaymentAdviceModal(false);
      //   // Optionally refresh the data
      //   fetchShipments();
      // }
      console.log("Payment advice data:", data);
      setShowPaymentAdviceModal(false);
    } catch (error) {
      console.error("Error creating payment advice:", error);
    }
  };

  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState<'pickup' | 'delivery'>('pickup');
  const [shipperPrefs, setShipperPrefs] = useState<ShipperPrefs>({
    locations: [],
    deliveryLocations: []
  });

// Update the handleOpenEditLocation function
const handleOpenEditLocation = (shipment: any, type: 'pickup' | 'delivery') => {
  setSelectedShipment(shipment);
  setSelectedLocationType(type);
  
  // Get existing location data similar to Angular version
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
  
  // Get current location coordinates if available
  if (shipment.triptracker?.lastlocation) {
    currentLocation = shipment.triptracker.lastlocation;
  }
  
  // Fetch shipper preferences
  if (shipment.organization?.id) {
    fetchShipperPrefs(shipment.organization._id);
  }
  
  // Set the combined location data for the modal
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

  const handleFetchLocations = async (date: Date | null) => {
    if (!selectedShipment) return [];
    
    try {
      // Implement your location fetching logic here
      // This is a placeholder - replace with your actual API call
      const response = await httpsGet('location/search', 
      //   {
      //   date: date?.toISOString(),
      //   type: selectedLocationType,
      //   shipmentId: selectedShipment._id
      // }, 
      4);
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      showMessage('Failed to fetch locations', 'error');
      return [];
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
  // Delete the previous search filter
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
  
  // Clear the input flag and fetch shipments
  fetchShipments(shipmentsFilter);
};


  const handleEditSubmit = async (location: any, date: Date | null) => {
    if (!selectedShipment) return;
    
    try {
      const payload = {
        shipmentId: selectedShipment._id,
        locationId: location._id,
        type: selectedLocationType,
        date: date?.toISOString()
      };
      
      const response = await httpsPost('shipment/update-location', payload, {}, 4);
      
      if (response.statusCode === 200) {
        showMessage('Location updated successfully', 'success');
        fetchShipments(); // Refresh the shipments list
        setShowEditLocationModal(false);
      } else {
        throw new Error(response.message || 'Failed to update location');
      }
    } catch (error: any) {
      console.error('Error updating location:', error);
      showMessage(error.message || 'Failed to update location', 'error');
    }
  };

  const fetchLocations = async (date: Date | null) => {
    try {
      // TODO: Implement the API call to fetch locations
      return [];
    } catch (error) {
      console.error("Error fetching locations:", error);
      return [];
    }
  };


  const [isPrintLRModalOpen, setIsPrintLRModalOpen] = useState(false);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);

  const handlePrintLR = (data: { type: string; copyTypes: string[] }) => {
    // Handle the print LR action here
    console.log(
      "Printing LRs for shipment IDs:",
      selectedShipmentIds,
      "with data:",
      data
    );
    // Add your API call or print logic here
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
    setShowAddRoambeeDialog(false);
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
      // Add your payment submission logic here
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

  const fetchInvoiceData = async (shipmentId: string) => {
    try {
      setIsLoadingInvoices(true);
      const response = await httpsGet(`/api/shipment/one/${shipmentId}`);
      // Transform the response data to match the expected format
      const invoiceItems = response.data.invoices?.map((inv: any) => ({
        invoiceType: inv.invoiceType || 'CT',
        invoice: inv.invoiceNumber || '',
        shippedQty: inv.shippedQuantity || 0,
        shippedNop: inv.shippedPieces || 0,
        ...inv // Include all other invoice properties
      })) || [];
      setInvoiceData(invoiceItems);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      // Show error toast or notification
    } finally {
      setIsLoadingInvoices(false);
    }
  };

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
      // Call your API to update invoice types
      await httpsPost('/api/update-invoice-types', {
        shipmentId: selectedShipmentForInvoiceType?._id,
        invoices: invoiceData.map(inv => ({
          invoice: inv.invoice,
          invoiceType: inv.invoiceType
        }))
      });
      // Show success message
      // Close the modal
      setIsInvoiceTypeModalOpen(false);
      // Refresh the shipment data
      fetchShipments();
    } catch (error) {
      console.error('Error updating invoice types:', error);
      // Show error toast or notification
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
    fetchShipments(); // Refresh the shipments list
    showMessage('Freight updated successfully', 'success');
  };

  return (
    <div className={styles.main}>
      {/* Header */}
      <div className={styles.shipmentsMainHeader}>
        <h1 className={styles.pageTitle}>Shipments Dashboard</h1>
        <HeaderActions
          onFetchShipments={openFetchJdeShipment}
          onUpdateVehicleArrival={uploadVehicleArrivalBackToJde}
          onSendEPOD={updateEPODBackToJDE}
          onFetchInvoiceDetails={fetchInvoiceDetails}
          onBulkUpload={() => openBulkUpload("shipment")}
          isTechnova={isTechnova}
          isLoading={isLoading}
          hasSelectedShipments={selectedShipmentsArray.length > 0}
        />
      </div>
      {/* Tabs */}
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

        <div className={styles.refresh} onClick={clearFilters}>
          <RefreshCw className={styles.lucideIcon} />
        </div>
      </div>
      {/* Sub Filters */}
      <div className={styles.subFiltersContainer}>
        <div className={styles.filterButtonsGroup}>
          {subFilters.map((filter) => (
    //         <button
    //           key={filter.key}
    //           className={`${styles.filterButton} ${
    //             selectedSubFilter === filter.key ? styles.selected : ""
    //           }`}
    //           onClick={() => handleSubFilterSelect(filter.key)}
    //            style={{
    //   border: `2px solid ${filter.color}`,
    //   backgroundColor:
    //     selectedSubFilter === filter.key
    //       ? `${filter.color}20` 
    //       : "transparent",    
    // }}
    //         >
    //           {filter.label}
    //           <span className={styles.filterCount} style={{ 
    //             backgroundColor: filter.color,
    //             color: 'white'
    //           }}>
    //             {filter.count}
    //           </span>
    //         </button>

    <button
    key={filter.key}
    className={`${styles.filterButton} ${
      selectedSubFilter === filter.key ? styles.selected : ""
    }`}
    onClick={() => handleSubFilterSelect(filter.key)}
    style={{
      // @ts-ignore
      '--filter-color': filter.color,
      '--filter-color-10': `${filter.color}1a`,
      '--filter-color-20': `${filter.color}33`,
      borderColor: filter.color,
      color: selectedSubFilter === filter.key ? filter.color : 'inherit',
    } as React.CSSProperties}
  >
    {filter.label}
  </button>
          ))}
        </div>
        {/* <div className={styles.filterGroup}>
  <label className={styles.checkboxLabel}>
    <input
      type="checkbox"
      checked={odcFilter === true}
      onChange={(e) => setOdcFilter(e.target.checked)}
    />
    <span>ODC Shipment(s)</span>
  </label>
</div> */}


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

        {/* All buttons are now wrapped in a single container */}
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

          <div className={styles.button}>Map View</div>

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
   {/* </div> */}

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
          segmentations={segmentations}
          pickLocations={pickupLocations} // Add your pickup locations array here
          deliverLocations={deliveryLocations} // Add your delivery locations array here
          shipStatus={shipmentStatus} // Add your shipment status array here
          onApply={(filters) => {
            console.log("Applied filters:", filters);
            // Handle filter application here (e.g., update state, fetch filtered data)
          }}
          onClear={() => {
            console.log("Filters cleared");
            // Handle filter clear here (e.g., reset filters, fetch all data)
          }}
          onClose={() => {
            console.log("Close filter");
            // Handle close action (e.g., hide the filter panel)
            setShowAdvancedSearch(false);
          }}
        />
      )}
      {/* Action buttons */}
      {/* {showButtons && (
        <div className={styles.bulkActions}>
          <div className={styles.submitButton}>
            <div className={styles.button}>
              Download LRs
            </div>
          </div>
          <div className={styles.submitButton}>
            <div className={styles.button} style={{ width: '150px' }}>
              Recalculate Freight
            </div>
          </div>
        </div>
      )} */}
      {/* Analytics View */}
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
        /* Table View */
        <div className={styles.section}>
          {/* Header with search and filters */}

          {/* Table */}
          <div
            className={`${styles.tableDivContainer} ${
              isCompactView ? styles.compactView : ""
            }`}
            data-shipment-type={shipmentType}
          >
            {/* Pagination */}
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
                selectedShipmentsArray={selectedShipmentsArray}
                handleSelectAllShipments={handleSelectAllShipments}
                shipmentsArray={shipmentsArray}
                currentPage={currentPage}
                pageSize={pageSize}
                shipmentType={shipmentType}
                showLoader={showLoader}
                actionSearch={actionSearch}
                setActionSearch={setActionSearch}
                actionMenuCategories={actionMenuCategories}
                renderStatusCell={renderStatusCell}
                renderSINCell={renderSINCell}
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
              />
            )}
          </div>
        </div>
      )}
      {/* Modals */}
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
      {/* Active Carriers Popup */}
      {showActiveCarriersPopup && (
        <ActiveCarriersModal
          show={showActiveCarriersPopup}
          carriers={activeCarriersData}
          onClose={() => setShowActiveCarriersPopup(false)}
        />
      )}
      {/* Total Freight Popup */}
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
      {/* Delayed Shipment Dialog */}
      {/* {showDelayedShipmentDialog && (
        <DelayPenaltyModal
          show={showDelayedShipmentDialog}
          delayData={{
            sin: shipmentDelayData.sin,
            penalty: shipmentDelayData.penalty,
            reason: shipmentDelayData.reason,
            status: shipmentDelayData.status,
            suggested_amount: shipmentDelayData.suggested_amount,
          }}
          onClose={() => setShowDelayedShipmentDialog(false)}
          onApprove={(status) => approveWaiveOff(status)}
        />
      )} */}
      {/* Rerun Dialog */}
      {/* {showRerunDialog && (
        <RerunShipmentModal
          show={showRerunDialog}
          shipmentSIN={selectedShipmentSIN}
          onClose={() => setShowRerunDialog(false)}
          onSubmit={({ status, fromDate, toDate }) => {
            setSelectedRerunOption(status);
            setFromDateTsReRun(fromDate);
            setToDateTsReRun(toDate);
            onRerunSubmit();
          }}
        />
      )} */}

      {/* Pull Freight Dialog */}
      {showPullFreightDialog && (
  <PullFreightModal
    _id={pullFreightData._id}  // Changed from shipmentId to _id
    show={showPullFreightDialog}
    sin={pullFreightData.sin}  // Changed from pullFreightData.SIN to pullFreightData.sin
    vehicleNo={pullFreightData.vehicleNo}
    pickup={pullFreightData.pickup}
    destinations={pullFreightData.destinations}
    onClose={() => {
      setShowPullFreightDialog(false);
    }}
    onGetFreight={async (data) => {
      try {
        // Handle the freight data here
        console.log('Freight data:', data);
        // Add your freight handling logic here
      } catch (error) {
        console.error('Error handling freight:', error);
      }
    }}
  />
)}

      {showRoambeeModal && selectedShipmentForRoambee && (
        <AddRoambeeModal
          show={showRoambeeModal}
          shipmentNo={selectedShipmentForRoambee?.sin || ""}
          shipmentId={selectedShipmentForRoambee?._id || ""}
          onClose={() => {
            setShowRoambeeModal(false);
            setSelectedShipmentForRoambee(null);
          }}
          onSuccess={() => {
            fetchShipments();
          }}
          isLoading={isSubmittingRoambee}
        />
      )}

      {showAttachDialog && selectedShipmentForAttach && (
        <AttachFilesModal
          show={showAttachDialog}
          onClose={() => setShowAttachDialog(false)}
          onAttach={() => {
            // This will be called after successful upload
            // You can refresh the shipments list or update the UI as needed
            fetchShipments(); // Assuming you have a function to refresh the shipments
          }}
          shipmentId={selectedShipmentForAttach._id || ""} // Make sure to use the correct property name
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
      fetchShipments(); // Refresh the shipments list
    }}
  />
)}

      {/*      
     
      
      {showUpdateFreightDialog && (
        <IncreasePriceModal
           show={showIncreasePrice}
  shipmentId={selectedShipmentId}
  onClose={() => setShowIncreasePrice(false)}
  onSubmit={async (dealerType) => {
    try {
      // Call your API here
      await api.updateShipmentPrice(selectedShipmentId, dealerType);
      setShowIncreasePrice(false);
      // Optionally refresh the shipment data
    } catch (error) {
      console.error('Failed to update price:', error);
    }
  }}
  isLoading={isLoading}
        />
      )}
     
      {showWarningDialog && (
        <WarningModal
          show={showWarningDialog}
          message="Driver is already assigned to this shipment. Do you want to continue?"
          onConfirm={() => handleWarningConfirm(true)}
          onCancel={() => setShowWarningDialog(false)}
          confirmText="Continue"
          cancelText="Cancel"
        />
      )}
     
      {showUpdateStatusDialog && (
        <UpdateStatusModal
           show={showUpdateStatus}
           shipmentNo={currentShipment.shipmentNumber}
           shipmentDetails={{
        from: {
          location: currentShipment.pickupLocation
        },
        to: {
          location: currentShipment.deliveryLocation
        }
      }}
      statusOptions={currentShipment.availableStatuses}
      onUpdate={handleStatusUpdate}
      onClose={() => setShowUpdateStatus(false)}
      isLoading={isUpdatingStatus}
      dIndex={1}
        />
      )}
     
      {showUploadDialog && (
        <UploadModal
          show={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onUpload={handleUpload}
          isLoading={false}
        />
      )}
     
      
     
      {showOpenVideosDialog && (
        <OpenVideosModal
         show={showVideo}
  videoUrl={videoUrl}
  onClose={() => setShowVideo(false)}
  title="Shipment Loading Video"
        />
      )}
     
      {showAddDODialog && (
        <AddDeliveryOrderModal
  show={showAddDO}
  shipmentNo={currentShipmentNo}
  onSave={handleSaveDO}
  onClose={() => setShowAddDO(false)}
  isLoading={isSaving}
/>
      )}

      {showAddManagedByDialog && (
        <AddManagedByModal
          show={showAddManagedByDialog}
          shipmentId={selectedShipmentSIN || ""}
          currentManagedBy={
            selectedCarrierManagedBy.id
              ? {
                  type: "user",
                  id: selectedCarrierManagedBy.id,
                  name: selectedCarrierManagedBy.name,
                }
              : undefined
          }
          users={[
            {
              id: "user1",
              name: "John Doe",
              email: "john@example.com",
              role: "Manager",
            },
            {
              id: "user2",
              name: "Jane Smith",
              email: "jane@example.com",
              role: "Supervisor",
            },
          ]}
          teams={[
            { id: "team1", name: "Logistics Team", memberCount: 5 },
            { id: "team2", name: "Customer Support", memberCount: 3 },
          ]}
          onSave={handleSaveManagedBy}
          onClose={() => setShowAddManagedByDialog(false)}
          isLoading={false}
        />
      )}
      
      {showIncreasePriceDialog && (
        <IncreasePriceModal
          show={showIncreasePriceDialog}
          shipmentId={selectedShipmentSIN || ""}
          currentPrice={1000}
          onSave={handleSavePriceIncrease}
          onClose={() => setShowIncreasePriceDialog(false)}
          isLoading={false}
          approvers={[
            {
              id: "approver1",
              name: "Approver One",
              email: "approver1@example.com",
            },
            {
              id: "approver2",
              name: "Approver Two",
              email: "approver2@example.com",
            },
          ]}
        />
      )} */}
      {showJdeBookShipment && (
        <JdeBookShipment
          open={showJdeBookShipment}
          onClose={() => setShowJdeBookShipment(false)}
          ltl={true}
          onSuccess={() => {
            showMessage("Shipment created successfully", "success");
            fetchShipments(); // Refresh the shipments list
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
      fetchShipments(); // Refresh the shipments list
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
            fetchShipments(); // Refresh the shipments list
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
      {/* {showPaymentAdviceModal && selectedShipmentForPayment && (
        <CreatePaymentAdviceModal
          show={showPaymentAdviceModal}
          onClose={() => {
            setShowPaymentAdviceModal(false);
            setSelectedShipmentForPayment(null);
          }}
          onSubmit={handlePaymentAdviceSubmit}
          data={{
            shipmentAdvice: true,
            shipment: selectedShipmentForPayment,
            carrier: selectedShipmentForPayment.carrier_parent_name || ''
          }}
          isLoading={false}
        />
      )} */}
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
    combinedLocation={combinedLocationData.combinedLocation} // Add this prop
    pickupCity={combinedLocationData.pickupCity} // Add this prop
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
          fetchShipments(); // Refresh the shipments list
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
      fetchShipments(); // Refresh the shipments list
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
            invoices: [], // Add invoice data if available
            carrier_waybills: [], // Add waybill data if available
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
            // Add any additional required data here
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
      shipmentType: "arrived", // This is the key difference!
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
            // Refresh the shipments list or perform any other success action
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
      fetchShipments(); // Refresh the shipments list
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
      fetchShipments(); // Refresh the shipments list
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
      fetchShipments(); // Refresh the shipments list
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
      fetchShipments(); // Refresh the shipments list
    }}
  />
)}

{selectedShipment && (
      <DriverExpenses
        open={showDriverExpenses}
        onClose={() => setShowDriverExpenses(false)}
        shipment={selectedShipment}
        onSuccess={() => {
          // Refresh the shipments data or show success message
          // You might want to add a refresh function here
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
        _id: dest._id || `temp-${index}`, // Ensure _id is provided
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

    // </div>
  );
};



export default ShipmentsDashboard;
