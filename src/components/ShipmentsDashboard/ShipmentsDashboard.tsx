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
} from "lucide-react";
import { Button } from "../UI/button";
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
import IncreasePriceModal from "../ShipmentsDashboard/Financial/CreatePaymentAdvanceModal";
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
import EditLocationsModal from "../ShipmentsDashboard/DocumentManagement/PrintLRModal";
import PrintLRModal from "../ShipmentsDashboard/DocumentManagement/PrintLRModal";

// Types
interface Shipment {
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
  const [pageSize, setPageSize] = useState(100);

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

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalShipments: 8,
    totalFreightValue: 117750,
    averageFreight: 14719,
    activeCarriers: 7,
  });

  // Modal states
  const [showShipmentDetails, setShowShipmentDetails] = useState(false);
  const [selectedShipmentDetails, setSelectedShipmentDetails] =
    useState<Shipment | null>(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationPopupData, setLocationPopupData] = useState<any>(null);
  const [showActiveCarriersPopup, setShowActiveCarriersPopup] = useState(false);
  const [showTotalFreightPopup, setShowTotalFreightPopup] = useState(false);
  const [showAverageFreightPopup, setShowAverageFreightPopup] = useState(false);
  const [showDelayedShipmentDialog, setShowDelayedShipmentDialog] =
    useState(false);
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
  const [pullFreightData, setPullFreightData] = useState({
    SIN: "",
    vehicleNo: "",
    pickup: "",
    shipmentId: "", // Make sure this is included
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
    // Add date information to each location
    const locationsWithDates = locations.map((loc) => ({
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
    });
    setShowLocationPopup(true);
  };

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
  // Modal and dialog states
  const [delayHistory, setDelayHistory] = useState<any[]>([]);
  const [delaygpsRemoveHistory, setDelaygpsRemoveHistory] = useState<any[]>([]);
  const [delayReasonType, setDelayReasonType] = useState("");
  const [selectedShipmentNo, setSelectedShipmentNo] = useState("");
  const [fromDateTsReRun, setFromDateTsReRun] = useState("");
  const [toDateTsReRun, setToDateTsReRun] = useState("");
  const [freightType, setFreightType] = useState("");
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
  const actionMenuCategories = {
    "Quick Actions": [
      { icon: Eye, label: "View", color: "text-blue-600" },
      {
        icon: Share2,
        label: "Share",
        color: "text-blue-500",
        onClick: (shipment: Shipment) => {
          // Generate the tracking URL based on your application's routing
          const trackingUrl = `${window.location.origin}/tracking/${shipment._id}`;
          setShareUrl(trackingUrl);
          setShareModalOpen(true);
        },
      },
      {
        icon: Mail,
        label: "Mail",
        color: "text-orange-600",
        onClick: (shipment: Shipment) => {
          setShipmentToMail(shipment);
          setMailModalOpen(true);
        },
      },
      {
        icon: XCircle,
        label: "Cancel",
        color: "text-red-600",
        onClick: (shipment: Shipment) => {
          setShipmentToCancel(shipment);
          setCancelModalOpen(true);
        },
      },
    ],
    "Tracking & GPS": [
      { icon: Download, label: "SIM Tracking", color: "text-amber-600" },
      {
        icon: WifiOff,
        label: "GPS Disconnection Reason",
        color: "text-teal-600",
      },
      { icon: Wifi, label: "Add GPS Connection", color: "text-amber-600" },
      { icon: Clock, label: "Update Delay Reason", color: "text-teal-600" },
    ],
    "Location & Routes": [
      {
        icon: Edit,
        label: "Edit Pickup Location",
        color: "text-pink-600",
        onClick: (shipment: any) => {
          console.log("Edit Pickup Location clicked", { shipment });
          setSelectedShipment(shipment);
          setSelectedLocationType("pickup");
          console.log("Before setting showEditLocationModal to true");
          setShowEditLocationModal(true);
          console.log("After setting showEditLocationModal to true");
        },
      },
      {
        icon: Edit,
        label: "Edit Delivery Location",
        color: "text-pink-600",
        onClick: (shipment: any) => {
          console.log("Edit Delivery Location clicked", { shipment });
          setSelectedShipment(shipment);
          setSelectedLocationType("delivery");
          console.log("Before setting showEditLocationModal to true");
          setShowEditLocationModal(true);
          console.log("After setting showEditLocationModal to true");
        },
      },
      {
        icon: Route,
        label: "Pull Freight with Routes",
        color: "text-brown-600",
        onClick: (shipment: Shipment) => {
          setPullFreightData({
            SIN: shipment._id,
            vehicleNo: shipment.vehicleNumber,
            pickup: shipment.driverMobile,
            shipmentId: shipment._id, // Make sure to set this if needed by getPullFreight
          });
          setShowPullFreightDialog(true);
        },
      },
      {
        icon: Calculator,
        label: "Recalculate Distance",
        color: "text-pink-600",
      },
    ],
    "Freight & Payment": [
      {
        icon: Truck,
        label: "Update Carrier Freight",
        color: "text-gray-600",
      },
      { icon: Truck, label: "Flush Freight", color: "text-gray-600" },
      {
        icon: CreditCard,
        label: "Create Advance Payment",
        color: "text-indigo-600",
      },
      {
        icon: FileText,
        label: "Change Invoice Type",
        color: "text-brown-600",
      },
    ],
    "Documents & Status": [
      {
        icon: FileText,
        label: "Upload Approval Documents",
        color: "text-purple-600",
      },
      {
        icon: Package,
        label: "View Epods",
        color: "text-brown-600",
        onClick: (shipment: Shipment) => {
          setSelectedShipmentForEpod(shipment);
          setIsEpodModalOpen(true);
        },
      },
      {
        icon: CheckCircle,
        label: "Submit Mark As Arrived",
        color: "text-green-600",
      },
      {
        icon: DoorOpen,
        label: "Recalculate Customer Gate In/Out",
        color: "text-pink-600",
      },
    ],
    Other: [
      {
        icon: PlusCircle,
        label: "Add Roambee ID",
        color: "text-blue-600",
        onClick: (shipment: Shipment) => {
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
        onClick: () => setShowUploadModal(true),
      },
    ],
    Others: [
      // Add DO Details
      {
        icon: PlusCircle,
        label: "Add DO Details",
        color: "text-blue-600",
        onClick: (shipment: any) => {
          setSelectedShipment(shipment);
          setSelectedShipmentSIN(shipment.sin || shipment._id);
          setShowAddDODialog(true);
        },
      },
      // Edit Pickup Location
      {
        icon: Edit,
        label: "Edit Pickup Location",
        color: "text-pink-600",
      },
      // Edit Delivery Location
      {
        icon: Edit,
        label: "Edit Delivery Location",
        color: "text-pink-600",
      },
      //view ePODS
      {
        icon: Eye,
        label: "View ePODS",
        color: "text-green-600",
      },
    ],
  };

  // Sub filters data
  const subFilters = [
    { key: "accepted", label: "Accepted", count: 156 },
    { key: "at_pickup", label: "At Pickup", count: 23 },
    { key: "in_transit", label: "In Transit", count: 53 },
    { key: "completed", label: "Completed", count: 29 },
    { key: "delayed", label: "Delayed", count: 12 },
    { key: "today", label: "Today", count: 234 },
    { key: "high_priority", label: "High Priority", count: 45 },
    { key: "pending_epod", label: "Pending EPOD", count: 156 },
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
    setSelectedSubFilter(selectedSubFilter === filterKey ? null : filterKey);
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
    setLocationPopupData({ locations, type });
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

  const openTotalFreightPopup = () => {
    setShowTotalFreightPopup(true);
  };

  const openAverageFreightPopup = () => {
    setShowAverageFreightPopup(true);
  };

  const getPullFreight = async (data: {
    destination: string;
    freightRate: string;
  }) => {
    console.log(" getPullFreight ----");
    try {
      const response = await httpsGet(
        `/api/freight_rate_route_code/get?destination=${encodeURIComponent(
          data.destination
        )}&shipment=${encodeURIComponent(pullFreightData.shipmentId)}`
      );

      if (response.statusCode === 200) {
        alert(`New Freight Rate is ${response.data}`);
        setShowPullFreightDialog(false);
      }
    } catch (error) {
      console.error("Error getting freight rate:", error);
      alert("Failed to get freight rate");
    }
  };

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

  const submitDONumber = async () => {
    try {
      const response = await fetch("/api/shipment/add_do_number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment: selectedShipmentSIN,
          doNumber,
        }),
      });
      const data = await response.json();

      if (data.statusCode === 200) {
        alert("DO Number added successfully");
        setShowAddDODialog(false);
        fetchShipments();
      }
    } catch (error) {
      console.error("Error adding DO number:", error);
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
      const response = await fetch("/api/rates/refresh-freight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipments: selectedShipmentsArray,
          dealer_type: selectedDealerType,
        }),
      });
      const data = await response.json();

      if (data.statusCode === 200) {
        alert("Freight recalculated successfully");
        setShowIncreasePriceDialog(false);
        fetchShipments();
      }
    } catch (error) {
      console.error("Error recalculating freight:", error);
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

    // Use the provided type or fall back to the current shipmentType
    const filterType = type || shipmentType;

    if (filterType !== "all") {
      filters.type_filter = filterType;
    }

    filters.limit = pageSize;
    filters.skip = currentPage * pageSize;

    if (inputQuery !== "" && inputQuery.length && searchValue) {
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
  }, [currentPage, pageSize]);

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
  }

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
    openLocationsPopup: (type: string, locations: any[]) => void,
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
                openLocationsPopup(displayType, locations.slice(1));
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
      {/* {shipment.trans_vehicle_no?.length > 0 && (
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
      <div className={styles.sub}>(Requested / Assigned)</div>
      <div className={styles.sub}>{shipment.reqVehicleType} / {shipment.vehicleType}</div> */}
    </div>
  );

  const renderConsentCell = (shipment: any) => (
    <div className={styles.consent}>
      {shipment.showGreenConsent && <span className={styles.flagImgG}>✓</span>}
      {shipment.showRedConsent && <span className={styles.flagImgR}>✗</span>}
    </div>
  );

  const handleSubmitRoambee = async (roambeeId: string) => {
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

  const renderSubscriptionCell = (shipment: any) => {
    // This logic enables the cell if "showSubscriptionStatus" is true
    // AND shipment.simTracking is present AND shipment is not GPS vehicle
    console.log(
      "shipment.showSubscriptionStatus",
      shipment.showSubscriptionStatus
    );
    console.log("shipment.gpsVehicle", shipment.gpsVehicle);
    // akila - simconsent
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
  console.log(
    "Rendering PullFreightModal with showPullFreightDialog:",
    showPullFreightDialog
  );

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

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
        "/v1/jde/vehicleArrival",
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
        "/v1/jde/uploadEPODtoJDE",
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
        "/v1/jde/fetchInvoicesFromJde",
        selectedShipmentsArray
      );

      if (response.statusCode === 200) {
        showMessage("Invoice details fetched successfully", "success");
      } else {
        showMessage("Failed to fetch invoice details", "error");
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
  const [selectedShipmentForPayment, setSelectedShipmentForPayment] =
    useState<Shipment | null>(null);

  const handleCreatePaymentAdvice = (shipment: Shipment) => {
    setSelectedShipmentForPayment(shipment);
    setShowPaymentAdviceModal(true);
  };

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
  const [selectedLocationType, setSelectedLocationType] = useState<
    "pickup" | "delivery"
  >("pickup");

  const [shipperPrefs, setShipperPrefs] = useState({
    locations: [],
    deliveryLocations: [],
  });

  const handleEditSubmit = async (location: any, date: Date | null) => {
    try {
      // TODO: Implement the API call to update the location
      console.log(`Updating ${selectedLocationType} location:`, {
        location,
        date,
      });
      setShowEditLocationModal(false);
    } catch (error) {
      console.error("Error updating location:", error);
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

  useEffect(() => {
    console.log("showEditLocationModal state changed:", showEditLocationModal);
    console.log("selectedShipment:", selectedShipment);
    console.log("selectedLocationType:", selectedLocationType);
  }, [showEditLocationModal, selectedShipment, selectedLocationType]);

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
    // Get selected shipment IDs
    const selectedIds = shipments
      .filter((shipment) => shipment.selected)
      .map((shipment) => shipment._id);

    if (selectedIds.length === 0) {
      // Optionally show a message to select shipments first
      return;
    }

    closeAllDialogs();
    setSelectedShipmentIds(selectedIds);
    setIsPrintLRModalOpen(true);
  };

  const [isIncreasePriceModalOpen, setIsIncreasePriceModalOpen] =
    useState(false);
  const [
    selectedShipmentForRecalculation,
    setSelectedShipmentForRecalculation,
  ] = useState<string>("");

  const handleRecalculateFreight = async (dealerType: string) => {
    try {
      // Handle the recalculate freight action here
      console.log(
        "Recalculating freight for shipment ID:",
        selectedShipmentForRecalculation,
        "with dealer type:",
        dealerType
      );
      // Add your API call or recalculation logic here

      // Close the modal after successful submission
      setIsIncreasePriceModalOpen(false);
    } catch (error) {
      console.error("Error recalculating freight:", error);
    }
  };

  const handleRecalculateFreightClick = () => {
    // Get the first selected shipment ID (or handle multiple selections as needed)
    const selectedId = shipments.find((shipment) => shipment.selected)?._id;

    if (!selectedId) {
      // Optionally show a message to select a shipment first
      return;
    }

    closeAllDialogs();
    setSelectedShipmentForRecalculation(selectedId);
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
            <button
              key={filter.key}
              className={`${styles.filterButton} ${
                selectedSubFilter === filter.key ? styles.selected : ""
              }`}
              onClick={() => handleSubFilterSelect(filter.key)}
            >
              {filter.label}
              <span className={styles.filterCount}>{filter.count}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={styles.header}>
        <div className={styles.inputContainer}>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className={styles.inputSelect}
          >
            <option value="SIN">SIN</option>
            <option value="project_code">Project Code</option>
            <option value="vehicle_no">Vehicle No</option>
            <option value="purchase_order">PO Number</option>
            <option value="sale_order">SO Number</option>
            <option value="ppd_no">PPD Number</option>
            <option value="do_number">DO Number</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Enter ${searchType}`}
            className={styles.inputSelect}
            // onKeyPress={(e) => e.key === 'Enter' && c()}
          />
        </div>

        <div
          className={`${styles.submitButton} ${styles.advancedSearchSubmitButton}`}
          role="button"
          tabIndex={0}
          onClick={() => setShowAdvancedSearch((prev) => !prev)}
          onKeyPress={(e) =>
            e.key === "Enter" && setShowAdvancedSearch((prev) => !prev)
          }
          style={{ cursor: "pointer" }}
        >
          <div className={styles.button}>Advanced Search</div>
        </div>

        <div className={styles.submitButton}>
          <div
            className={styles.button}
            // onClick={openMapView}
            style={{ marginLeft: 10 }}
          >
            Map View
          </div>
        </div>

        <div className={styles.commercial_invoice_btn}>
          <div className={styles.submitButton}>
            <div className={styles.commercial_invoice_submit}>
              <select
                className={styles.customSelectButton}
                // onChange={(e) => openBulkUpload(e.target.value)}
                defaultValue=""
                aria-label="Upload commercial invoices"
              >
                <option value="" disabled>
                  Upload Commercial Invoice
                </option>
                <option value="commercial_invoice">
                  Upload Commercial Invoice
                </option>
                <option value="commercial_invoice_Tcode">
                  Upload with TCode
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.submitButton}>
          <div
            className={styles.button}
            onClick={toggleAnalyticsView}
            style={{ marginLeft: 10 }}
          >
            {isAnalyticsView ? "Table View" : "Analytics View"}
          </div>
        </div>

        <div className={styles.submitButton}>
          <div
            className={styles.button}
            onClick={toggleCompactView}
            style={{ marginLeft: 10 }}
          >
            {isCompactView ? "Comfortable" : "Compact"}
          </div>
        </div>

        {/* {advanceSearch && ( */}
        {/* <div className={styles.submitButton}>
          <div
            className={styles.button}
            // onClick={clear}
            style={{ width: 46 }}
          >
            Clear
          </div>
        </div> */}
        {/* // )} */}

        {showButtons && (
          <>
            <div
              className={styles.submitButton}
              onClick={handleDownloadLRsClick}
            >
              <div className={styles.button}>Download LRs</div>
            </div>
            <div className={styles.submitButton}>
              <div
                className={styles.button}
                onClick={handleRecalculateFreightClick}
                style={{ width: 150 }}
              >
                Recalculate Freight
              </div>
            </div>
          </>
        )}

        {/* {urlParams?.type && ( */}
        {/* <div className={styles.submitButton}>
          <div
            className={styles.button}
            // onClick={resetFilters}
          >
            Reset Filters
          </div>
        </div> */}
        {/* )} */}
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
          openTotalFreightPopup={openTotalFreightPopup}
          openAverageFreightPopup={openAverageFreightPopup}
          openActiveCarriersPopup={openActiveCarriersPopup}
        />
      ) : (
        /* Table View */
        <div className={styles.section}>
          {/* Header with search and filters */}

          {/* Table */}
          <div
            className={`${styles.tableContainer} ${
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
                  <SelectContent>
                    <SelectItem value="100">100 per page</SelectItem>
                    <SelectItem value="200">200 per page</SelectItem>
                    <SelectItem value="300">300 per page</SelectItem>
                    <SelectItem value="400">400 per page</SelectItem>
                    <SelectItem value="500">500 per page</SelectItem>
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

            <div className={styles.statusLegend}>
              {Object.entries(statusLabels).map(([status, label]) => (
                <div key={status} className={styles.legendItem}>
                  <div
                    className={styles.legendColor}
                    style={{ backgroundColor: statusColors[status] || "#666" }}
                  />
                  <span className={styles.legendText}>{label}</span>
                </div>
              ))}
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
              />
            )}
          </div>
        </div>
      )}
      {/* Modals */}
      {showLocationPopup && locationPopupData && (
        <LocationModal
          show={showLocationPopup}
          type={locationPopupData?.type || ""}
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
      {/* {showTotalFreightPopup && (
        <FreightModal
          show={showTotalFreightPopup}
          title="Total Freight Breakdown"
          data={totalFreightData}
          showPercentage={true}
          onClose={() => setShowTotalFreightPopup(false)}
        />
      )} */}
      {/* {showAverageFreightPopup && (
        <FreightModal
          show={showAverageFreightPopup}
          title="Average Freight Details"
          data={averageFreightData}
          onClose={() => setShowAverageFreightPopup(false)}
        />
      )} */}
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
      {showRerunDialog && (
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
      )}

      {/* Pull Freight Dialog */}
      {showPullFreightDialog && (
        <PullFreightModal
          show={showPullFreightDialog}
          sin={pullFreightData.SIN}
          vehicleNo={pullFreightData.vehicleNo}
          pickup={pullFreightData.pickup}
          destinations={destinations}
          onClose={() => {
            console.log("Modal close button clicked");
            setShowPullFreightDialog(false);
          }}
          onGetFreight={getPullFreight}
        />
      )}

      {showRoambeeModal && selectedShipmentForRoambee && (
        <AddRoambeeModal
          show={showRoambeeModal}
          shipmentNo={selectedShipmentForRoambee?.sin || ""}
          onClose={() => {
            setShowRoambeeModal(false);
            setSelectedShipmentForRoambee(null);
          }}
          onSubmit={handleSubmitRoambee}
          isLoading={isSubmittingRoambee}
        />
      )}

      {/*      
      {showAttachDialog && (
        <AttachFilesModal
          show={showAttachDialog}
          onClose={() => setShowAttachDialog(false)}
          onFileChange={handleFileChange}
          onAttach={attachFiles}
        />
      )}
      
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
      {shareModalOpen && (
        <ShareModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          trackingUrl={shareUrl}
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
          isLoading={false}
        />
      )}
      {/* {showEditLocationModal && selectedShipment && (
  <EditLocationsModal
    show={showEditLocationModal}
    onClose={() => setShowEditLocationModal(false)}
    addLocationsType={selectedLocationType}
    orderNumber={selectedShipment?.sin || selectedShipment?._id || ""}
    shipperPrefs={shipperPrefs}
    onEditSubmit={handleEditSubmit}
    onFetchLocation={fetchLocations}
   nearestPickup={selectedShipment?.from?.[0]?.location ? {
  ...selectedShipment.from[0].location,
  area: '' 
} : null}
  />
)} */}

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

      {/* {isIncreasePriceModalOpen && (
        <IncreasePriceModal
          show={isIncreasePriceModalOpen}
          shipmentId={selectedShipmentForRecalculation}
          onClose={() => setIsIncreasePriceModalOpen(false)}
          onSubmit={handleRecalculateFreight}
        />
      )} */}
    </div>
  );
};

export default ShipmentsDashboard;
