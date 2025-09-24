// components/ShipmentsDashboard/ShipmentDetails/ShipmentDetails.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  AppBar,
  Paper,
  CircularProgress,
} from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
import styles from "./ShipmentDetails.module.css";
import { format } from "date-fns";
import { httpsGet } from "@/utils/Communication";
import { useUserRoles } from "@/hooks/useUserRoles";

// Import all tab components
import ShipmentDetailsTab from "./ShipmentDetailsTab";
import ActivityTimelineTab from "./ActivityTimelineTab";
import PickupTab from "./PickupTab";
import SecurityAppStagesTab from "./SecurityAppStagesTab";
import DeliveryTab from "./DeliveryTab";
import FreightTab from "./CarrierInvoiceTab";
import FourPlInvoiceTab from "./FourPlInvoiceTab";
import LorryReceiptTab from "./LorryReceiptTab";
import ClearIcon from '@mui/icons-material/Clear';
import ChartTab from "./ChartTab";
import MaterialsTab from "./MaterialsTab";
import EventLogTab from "./EventLogTab";
import BillToTab from "./BillToTab";

const getShipmentStatusName = (code: string): string => {
  const statusMap: { [key: string]: string } = {
    ASN: "Assigned",
    ACPT: "Accepted",
    AP: "At Pickup",
    ALD: "At Delivery",
    CPTD: "Completed",
    ITNS: "In Transit",
    SP: "Towards Pickup",
    ABTR: "About to Reach",
    PNDG: "Pending",
    CNCL: "Cancelled",
  };
  return statusMap[code] || code;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      className={styles.tabPanel}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface ShipmentDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string | null;
}

interface Shipper {
  parent_name?: string;
  type?: string;
}

const ShipmentDetails: React.FC<ShipmentDetailsProps> = ({
  isOpen,
  onClose,
  shipmentId,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRoles = useUserRoles();

  const [isMYKL, setIsMYKL] = useState(false);
  const [isTechnova, setIsTechnova] = useState(false);
  const [isRSPL, setIsRSPL] = useState(false);
  const [showFreight, setShowFreight] = useState(false);
  const [ownFleet, setOwnFleet] = useState(false);
  const [shipmentType, setShipmentType] = useState("normal");
  const [customerData, setCustomerData] = useState<any[]>([]);

  const isShipmentManagement =
    userRoles.unit_admin || userRoles.owner || userRoles.shipment;
  const enablePickEdit =
    shipmentData?.shipmentType === "outbound" &&
    shipmentData?.status !== "Cancelled";
  const canEditPickups = isShipmentManagement || enablePickEdit;
  const enableDeliveryEdit =
    shipmentData?.shipmentType === "inbound" &&
    shipmentData?.status !== "Cancelled" &&
    !shipmentData?.carrier_invoices?.length;
  const canEditDeliveries = isShipmentManagement || enableDeliveryEdit;

 // In ShipmentDetails.tsx

const fetchDetails = useCallback(async () => {
  if (!shipmentId) return;
  setIsLoading(true);
  try {
      const [shipmentResponse, constantsResponse] = await Promise.all([
          httpsGet(`shipment/one?shipmentId=${shipmentId}`),
          httpsGet(`settings/constants`),
      ]);

      const shippersRaw = localStorage.getItem("shippers");
      // As you discovered, the roles string might be double-stringified. It's safer to handle that here too.
      const shippers: any[] = shippersRaw ? JSON.parse(shippersRaw) : [];

      // *** FIX STARTS HERE ***
      // 1. Get the active shipper ID from local storage.
      //    (Note: In Angular it was from a cookie, ensure it's in localStorage for React or adjust as needed)
      const currentShipperId = localStorage.getItem('shipper_id');

      // 2. Find the correct shipper object from the array. Default to the first one if not found.
      const activeShipper = shippers.find(s => s._id === currentShipperId) || shippers[0];
      // *** FIX ENDS HERE ***

      if (shipmentResponse.statusCode === 200) {
          const apiDetail = shipmentResponse.data;

          const fullShipmentData = {
              ...apiDetail,
              constants: constantsResponse.data,
              shippers,
          };

          const displayStatus = getShipmentStatusName(apiDetail.latest_status);
          const displayDate = apiDetail.created_at
              ? format(new Date(apiDetail.created_at), "dd-MMM-yyyy hh:mm a")
              : "...";
          setShipmentData({ ...fullShipmentData, displayStatus, displayDate });

          // Use the activeShipper's name for conditional logic
          const parentName = activeShipper?.parent_name || apiDetail.organization?.name || "";

          setIsMYKL(parentName === "MYK Laticrete India Private Limited");
          setIsTechnova(parentName === "TechNova Imaging Systems Pvt Ltd");
          setIsRSPL(parentName === "RSPL Limited");

          setShowFreight(
              userRoles.owner ||
              userRoles.finance ||
              userRoles.ratecard ||
              userRoles.unit_admin
          );
          
          // Set state based on the correct, active shipper
          setOwnFleet(apiDetail.own_fleet || false);
          setShipmentType(activeShipper?.type || "normal");

          const hasCustomerData = apiDetail.deliveries?.some(
              (d: any) => d.customer_data?.length > 0
          );
          setCustomerData(hasCustomerData ? [{}] : []);
      } else {
          console.error("Failed to fetch shipment details");
      }
  } catch (error) {
      console.error("Error fetching shipment details:", error);
  } finally {
      setIsLoading(false);
  }
}, [shipmentId, userRoles]); // Added userRoles to dependency array for correctness

  useEffect(() => {
    if (isOpen) {
      fetchDetails();
    }
  }, [isOpen, fetchDetails]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) =>
    setActiveTab(newValue);

  const handleOpenMapModal = (eventData: any) => {
    console.log("Opening map for event:", eventData);
    alert(
      `Showing map for location: [${eventData.latitude}, ${eventData.longitude}]`
    );
  };

  const tabsConfig = [
    {
      label: "Shipment Details",
      visible: true,
      component: (
        <ShipmentDetailsTab
          shipmentData={shipmentData}
          showFreight={showFreight}
          ownFleet={ownFleet}
          type={shipmentType}
        />
      ),
    },
    {
      label: "Activity Timeline",
      visible: true,
      component: (
        <ActivityTimelineTab
          shipmentData={shipmentData}
          onOpenMap={handleOpenMapModal}
        />
      ),
    },
    {
      label: "Pickup",
      visible: true,
      component: (
        <PickupTab
          shipmentData={shipmentData}
          onDataChange={fetchDetails}
          canEditTimestamps={canEditPickups}
          canEditInvoices={canEditPickups}
          ownFleet={ownFleet}
          userRoles={userRoles}
        />
      ),
    },
    {
      label: "Security App Stages",
      visible: isMYKL,
      component: <SecurityAppStagesTab shipmentData={shipmentData} />,
    },
    {
      label: "Delivery",
      visible: true,
      component: (
        <DeliveryTab
          shipmentData={shipmentData}
          onDataChange={fetchDetails}
          userRoles={userRoles}
          isShipmentManagement={isShipmentManagement}
          ownFleet={ownFleet}
        />
      ),
    },
    {
      label: "Carrier Invoice",
      visible: !ownFleet && showFreight,
      component: (
        <FreightTab
          shipmentData={shipmentData}
          userRoles={userRoles}
          logisticsApproval={shipmentData?.logistics_approval_needed || false}
          onDataChange={fetchDetails}
        />
      ),
    },
    {
      label: "4PL Invoice",
      visible: shipmentType === "4pl" && showFreight,
      component: <FourPlInvoiceTab shipmentData={shipmentData} />,
    },
    {
      label: "LR",
      visible: true,
      component: (
        <LorryReceiptTab
          shipmentData={shipmentData}
          onDataChange={fetchDetails}
          userRoles={userRoles}
          ownFleet={ownFleet}
        />
      ),
    },
    {
      label: "Chart",
      visible: isTechnova,
      component: <ChartTab shipmentData={shipmentData} />,
    },
    {
      label: "Materials",
      visible: customerData.length > 0 || isRSPL || isMYKL,
      component: <MaterialsTab shipmentData={shipmentData} />,
    },
    {
      label: "Event Log",
      visible: isMYKL,
      component: <EventLogTab shipmentData={shipmentData} />,
    },
    {
      label: "Bill To",
      visible: isTechnova,
      component: <BillToTab shipmentData={shipmentData} />,
    },
  ];

  const visibleTabs = tabsConfig.filter((tab) => tab.visible);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Paper className={styles.modalPaper} elevation={0} square>
        <Box className={styles.modalHeader}>
          <Typography variant="subtitle1" component="h2">
            Shipment ID : {shipmentData?.SIN || "..."} |{" "}
            {shipmentData?.displayStatus || "..."}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {shipmentData?.displayDate || "..."}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{ color: "white" }}
            >
              <ClearIcon />
            </IconButton>
          </Box>
        </Box>
        <AppBar position="static" color="default" sx={{ boxShadow: "none" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: "#4F46E5" } }}
          >
            {visibleTabs.map((tab, index) => (
              <Tab
                label={tab.label}
                key={index}
                sx={{
                  textTransform: "capitalize",
                  "&.Mui-selected": { color: "#4F46E5" },
                }}
              />
            ))}
          </Tabs>
        </AppBar>
        <Box className={styles.modalContentArea}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            visibleTabs.map((tab, index) => (
              <TabPanel value={activeTab} index={index} key={index}>
                {tab.component}
              </TabPanel>
            ))
          )}
        </Box>
      </Paper>
    </Modal>
  );
};

export default ShipmentDetails;
