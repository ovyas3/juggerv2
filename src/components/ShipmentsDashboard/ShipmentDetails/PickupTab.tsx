// components/ShipmentsDashboard/ShipmentDetails/PickupTab.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  AppBar,
  Typography,
  Paper,
  Grid,
  Button,
  Tabs,
  Tab,
  IconButton,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import styles from "./PickupTab.module.css";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPut, httpsPost } from "@/utils/Communication";
import InvoiceTable from "./InvoiceTable";
import { UserRoles } from "@/hooks/useUserRoles";
import Image from "next/image"; // For local asset icons
import { BoxPlotOutlined } from "@ant-design/icons";
import CustomDateTimePicker from "@/components/UI/CustomDateTimePicker/CustomDateTimePicker";
// import CustomDatePicker from '@/components/UI/CustomDatePicker/CustomDatePicker';

// --- Interfaces ---
interface EditableCommercialInvoice {
  num?: string;
  nop?: number;
  uom?: string;
  value?: number;
  gross_weight?: number;
  net_weight?: number;
  considered_weight?: number;
  others?: { delivery_no?: string };
}

interface EditableGoodsInfo {
  delivery_id: any;
  comments?: string;
  commercialInvoices: EditableCommercialInvoice[];
  ewaybillNumber?: string;
  ewaybillExpiryDateTime?: string | null;
}

// interface UserRoles {
//   owner: boolean;
//   fleet: boolean;
// }

// --- Helper Components & Functions ---
const TabPanel = (props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const formatForInput = (dateString: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  } catch (e) {
    return "";
  }
};

const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    let formatted = new Intl.DateTimeFormat("en-GB", { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(date).replace(' at', ',');
    return formatted.replace(/ (am|pm)$/i, (match) => match.toUpperCase());
  } catch (e) {
    return "N/A";
  }
};

const groupInvoicesByDelivery = (invoices: any[], allDeliveries: any[]) => {
  const safeDeliveries = allDeliveries || [];
  if (safeDeliveries.length === 0) {
    return [];
  }

  const invoiceMap = (invoices || []).reduce((acc, current) => {
    const key = current.delivery_id?._id;
    if (key) {
        if (!acc[key]) {
            acc[key] = { ...current, commercial_invoices: [...(current.commercial_invoices || [])] };
        } else {
            acc[key].commercial_invoices.push(...(current.commercial_invoices || []));
        }
    }
    return acc;
  }, {});

  return safeDeliveries.map(delivery => {
    const key = delivery._id;
    if (invoiceMap[key] && invoiceMap[key].commercial_invoices.length > 0) {
      return invoiceMap[key];
    } else {
      // If no invoice exists for this delivery, create a placeholder.
      return {
        delivery_id: { _id: delivery._id, location: delivery.location },
        comments: "",
        ewaybill: { number: "", expire_date: null },
        commercial_invoices: [ 
          { num: "", value: 0, nop: 0, gross_weight: 0, net_weight: 0, considered_weight: 0, others: { delivery_no: "" } },
        ],
      };
    }
  });
};
const SimpleDocViewer = ({ assetUrl }: { assetUrl: string }) => {
  if (!assetUrl) return null;
  const isImage = /\.(jpeg|jpg|gif|png|svg)$/i.test(assetUrl);

  return (
    <a
      href={assetUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={assetUrl.split("/").pop()}
      style={{ textDecoration: "none" }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          cursor: "pointer",
          "&:hover": { borderColor: "primary.main" },
        }}
      >
        {isImage ? (
          <img
            src={assetUrl}
            alt="document preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          // Fallback for non-image files
          <Typography variant="caption" sx={{ p: 1, textAlign: "center" }}>
            View Document
          </Typography>
        )}
      </Paper>
    </a>
  );
};

// --- Main Component ---
const PickupTab = ({
  shipmentData,
  onDataChange,
  canEditTimestamps,
  canEditInvoices,
  ownFleet,
  userRoles,
  isTechnova,
  isEmami,
  isBMWIL,
  isTata
}: {
  shipmentData: any;
  onDataChange: () => void;
  canEditTimestamps: boolean;
  canEditInvoices: boolean;
  ownFleet: boolean;
  userRoles: UserRoles;
  isTechnova: boolean;
  isEmami: boolean;
  isBMWIL: boolean;
  isTata: boolean;
}) => {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [isEditingTimestamps, setIsEditingTimestamps] = useState<
    Record<string, boolean>
  >({});
  const [editableTimestamps, setEditableTimestamps] = useState<
    Record<string, any>
  >({});
  const [isSavingTimestamps, setIsSavingTimestamps] = useState<
    Record<string, boolean>
  >({});
  const [isEditingGoods, setIsEditingGoods] = useState<Record<string, boolean>>(
    {}
  );
  const [editableGoodsInfo, setEditableGoodsInfo] = useState<
    Record<string, EditableGoodsInfo[]>
  >({});
  const [isSavingGoods, setIsSavingGoods] = useState<Record<string, boolean>>(
    {}
  );
  const [newContainerData, setNewContainerData] = useState<
    Record<string, { container: string; seal: string }>
  >({});
  

  const { showMessage } = useSnackbar();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleSubTabChange = (event: React.SyntheticEvent, newValue: number) =>
    setActiveSubTab(newValue);

  // --- Timestamp Handlers ---
  const handleEditTimestampsToggle = (pickupId: string) => {
    const isCurrentlyEditing = !!isEditingTimestamps[pickupId];
    setIsEditingTimestamps((prev) => ({
      ...prev,
      [pickupId]: !isCurrentlyEditing,
    }));
    if (!isCurrentlyEditing) {
      const pickup = shipmentData.pickups.find((p: any) => p._id === pickupId);
      setEditableTimestamps((prev) => ({
        ...prev,
        [pickupId]: {
          arrived_at: pickup.arrived_at || "",
          loading_start:
            pickup.driver_act_loading_time?.start ||
            pickup.fence_act_loading_time?.start ||
            "",
          loading_end:
            pickup.driver_act_loading_time?.end ||
            pickup.fence_act_loading_time?.end ||
            "",
          finished_at: pickup.finished_at || "",
        },
      }));
    }
  };

  const handleTimestampChange = (
    pickupId: string,
    field: string,
    value: Date | null
  ) => {
    setEditableTimestamps((prev) => ({
      ...prev,
      [pickupId]: { ...prev[pickupId], [field]: value ? value.toISOString() : "" },
    }));
  };

  const handleSaveTimestamps = async (pickupId: string) => {
    setIsSavingTimestamps((prev) => ({ ...prev, [pickupId]: true }));
    const dataToSave = editableTimestamps[pickupId];
    const payload = {
      arrived_at: dataToSave.arrived_at
        ? new Date(dataToSave.arrived_at).getTime()
        : null,
      finished_at: dataToSave.finished_at
        ? new Date(dataToSave.finished_at).getTime()
        : null,
      loading_at: {
        start: dataToSave.loading_start
          ? new Date(dataToSave.loading_start).getTime()
          : null,
        end: dataToSave.loading_end
          ? new Date(dataToSave.loading_end).getTime()
          : null,
      },
    };
    try {
      await httpsPut(`shipment/update_pickup/${pickupId}`, payload);
      showMessage("Pickup times updated successfully!", "success");
      handleEditTimestampsToggle(pickupId);
      onDataChange();
    } catch (error: any) {
      showMessage(error.message || "Failed to update pickup times.", "error");
    } finally {
      setIsSavingTimestamps((prev) => ({ ...prev, [pickupId]: false }));
    }
  };

  // useEffect(() => {
  //   // Read 'shippers' from localStorage and parse
  //   try {
  //     const shipperData = JSON.parse(localStorage.getItem("shippers") || "[]");
  //     if (
  //       shipperData &&
  //       shipperData.length > 0 &&
  //       shipperData[0].parent_name === "TechNova Imaging Systems Pvt Ltd"
  //     ) {
  //       setIsTechnova(true);
  //     } else {
  //       setIsTechnova(false);
  //     }
  //   } catch (error) {
  //     setIsTechnova(false);
  //   }
  // }, []);

   // --- Goods & Invoice Handlers ---
   const handleEditGoodsToggle = (pickupId: string) => {
    const isCurrentlyEditing = !!isEditingGoods[pickupId];
    setIsEditingGoods((prev) => ({ ...prev, [pickupId]: !isCurrentlyEditing }));
  
    if (!isCurrentlyEditing) {
      // Going into edit mode → prepare editable state
      const pickup = shipmentData.pickups.find((p: any) => p._id === pickupId);
      const grouped = groupInvoicesByDelivery(
        pickup?.invoices || [],
        shipmentData.deliveries
      );
  
      setEditableGoodsInfo((prev) => ({
        ...prev,
        [pickupId]: grouped.map((g: any) => ({
          ...g,
          commercialInvoices: g.commercial_invoices || [],
          ewaybillNumber: g.ewaybill?.number || "",
          ewaybillExpiryDateTime: g.ewaybill?.expire_date || null,
        })),
      }));
    } else {
      // Exiting edit mode → optional: clear temp state
      setEditableGoodsInfo((prev) => ({
        ...prev,
        [pickupId]: prev[pickupId] ?? [], // keep it safe
      }));
    }
  };

  const handleGoodsInfoChange = (
    pickupId: string,
    groupIndex: number,
    field: string,
    value: any
  ) => {
    setEditableGoodsInfo((prev) => ({
      ...prev,
      [pickupId]: prev[pickupId].map((group, index) =>
        index === groupIndex ? { ...group, [field]: value } : group
      ),
    }));
  };



  const handleInvoiceChange = (
    pickupId: string,
    groupIndex: number,
    ciIndex: number,
    field: string,
    value: any
  ) => {
    setEditableGoodsInfo(prev => {
      const currentGroups = prev[pickupId] ?? [];
      if (!currentGroups[groupIndex]) return prev;
  
      const newGroups = currentGroups.map((group, gIndex) => {
        if (gIndex !== groupIndex) {
          return {
            ...group,
            commercialInvoices: Array.isArray(group.commercialInvoices) ? [...group.commercialInvoices] : []
          };
        }
  
        const updatedInvoices = (group.commercialInvoices ?? []).map((ci, cIndex) => {
          if (cIndex !== ciIndex) return ci;
          if (field === "delivery_no") {
            return { ...ci, others: { ...ci.others, delivery_no: value } };
          }
          return { ...ci, [field]: value };
        });
  
        return { ...group, commercialInvoices: updatedInvoices };
      });
  
      return { ...prev, [pickupId]: newGroups };
    });
  };



  const handleAddRow = (pickupId: string, groupIndex: number) => {
    setEditableGoodsInfo(prev => {
      const currentGroups = prev[pickupId] ?? [];
  
      // Make a shallow-cloned copy of groups + their invoices
      const newGroups = currentGroups.map(g => ({
        ...g,
        commercialInvoices: Array.isArray(g.commercialInvoices) ? [...g.commercialInvoices] : []
      }));
  
      // If groupIndex is out of bounds, create placeholder groups up to that index
      if (groupIndex < 0) return prev;
      if (groupIndex >= newGroups.length) {
        for (let i = newGroups.length; i <= groupIndex; i++) {
          newGroups.push({
            delivery_id: { _id: "", location: {} },
            comments: "",
            commercialInvoices: [
              {
                num: "",
                value: 0,
                nop: 0,
                gross_weight: 0,
                net_weight: 0,
                considered_weight: 0,
                others: { delivery_no: "" },
              },
            ],
            ewaybillNumber: "",
            ewaybillExpiryDateTime: null,
          });
        }
      } else {
        // Add new invoice object to the target group (preserve existing rows)
        const target = newGroups[groupIndex];
        newGroups[groupIndex] = {
          ...target,
          commercialInvoices: [
            ...(target.commercialInvoices ?? []),
            {
              num: "",
              value: 0,
              nop: 0,
              gross_weight: 0,
              net_weight: 0,
              considered_weight: 0,
              others: { delivery_no: "" },
            },
          ],
        };
      }
  
      return { ...prev, [pickupId]: newGroups };
    });
  };


  // const handleAddRow = (pickupId: string) => {
  //   setEditableGoodsInfo(prev => {
  //     const newGoodsInfo = { ...prev };
  //     if (!newGoodsInfo[pickupId]) {
  //       newGoodsInfo[pickupId] = { commercialInvoices: [] };
  //     }
  //     const destGoods = { ...newGoodsInfo[pickupId] };
  //     const newInvoice: EditableCommercialInvoice = {
  //       delivery_id: { _id: "", location: {} },
  //       comments: "",
  //       commercialInvoices: [
  //         {
  //           num: "",
  //           value: 0,
  //           nop: 0,
  //           gross_weight: 0,
  //           net_weight: 0,
  //           considered_weight: 0,
  //           others: { delivery_no: "" },
  //         },
  //       ],
  //       ewaybillNumber: "",
  //       ewaybillExpiryDateTime: null,
  //     }
  //     destGoods.commercialInvoices = [
  //       ...(destGoods.commercialInvoices || []),
  //       newInvoice,
  //     ];
  //     newGoodsInfo[pickupId] = destGoods;
  //     return newGoodsInfo;
  //   });
  // };
  const handleRemoveRow = (pickupId: string, groupIndex: number, ciIndex: number) => {
    setEditableGoodsInfo(prev => {
      const currentGroups = prev[pickupId] ?? [];
      if (!currentGroups[groupIndex]) return prev; // nothing to remove
  
      const newGroups = currentGroups.map((group, idx) => {
        if (idx !== groupIndex) {
          return {
            ...group,
            commercialInvoices: Array.isArray(group.commercialInvoices) ? [...group.commercialInvoices] : []
          };
        }
        const updatedInvoices = (group.commercialInvoices ?? []).filter((_, i) => i !== ciIndex);
        return { ...group, commercialInvoices: updatedInvoices };
      });
  
      return { ...prev, [pickupId]: newGroups };
    });
  };
  //   setEditableGoodsInfo((prev) => {
  //     const currentGroups = prev[pickupId] ?? [];
  
  //     // if no groups yet, initialize with one
  //     if (currentGroups.length === 0) {
  //       return {
  //         ...prev,
  //         [pickupId]: [
  //           {
  //             delivery_id: { _id: "", location: {} },
  //             comments: "",
  //             commercialInvoices: [
  //               {
  //                 num: "",
  //                 value: 0,
  //                 nop: 0,
  //                 gross_weight: 0,
  //                 net_weight: 0,
  //                 considered_weight: 0,
  //                 others: { delivery_no: "" },
  //               },
  //             ],
  //             ewaybillNumber: "",
  //             ewaybillExpiryDateTime: null,
  //           },
  //         ],
  //       };
  //     }
  
  //     return {
  //       ...prev,
  //       [pickupId]: currentGroups.map((group, gIndex) => {
  //         if (gIndex !== groupIndex) return group;
  
  //         const newInvoices = [...(group.commercialInvoices || [])];
  //         newInvoices.push({
  //           num: "",
  //           value: 0,
  //           nop: 0,
  //           gross_weight: 0,
  //           net_weight: 0,
  //           considered_weight: 0,
  //           others: { delivery_no: "" },
  //         });
  
  //         return { ...group, commercialInvoices: newInvoices };
  //       }),
  //     };
  //   });
  // };
  

  // const handleRemoveRow = (pickupId: string, groupIndex: number, ciIndex: number) => {
  //   setEditableGoodsInfo(prev => ({
  //       ...prev,
  //       [pickupId]: prev[pickupId].map((group, gIndex) => {
  //           if (gIndex !== groupIndex) return group;
  //           const updatedInvoices = (group.commercialInvoices ?? []).filter((ci, cIndex) => cIndex !== ciIndex);
  //           return { ...group, commercialInvoices: updatedInvoices };
  //       })
  //   }));
  // };

  const handleSaveGoods = async (pickupId: string) => {
    setIsSavingGoods((prev) => ({ ...prev, [pickupId]: true }));
    const invoiceInfo = editableGoodsInfo[pickupId]
      .map((group) => ({
        delivery_id: group.delivery_id._id,
        comments: group.comments,
        ewaybill_no: group.ewaybillNumber,
        ewaybill_expiry_date: group.ewaybillExpiryDateTime
          ? new Date(group.ewaybillExpiryDateTime).getTime()
          : null,
        commercial_invoices: group.commercialInvoices
          .filter((ci) => ci.num && ci.num.trim() !== "") // Filter out rows with no invoice number
          .map((ci) => ({
            num: ci.num,
            value: Number(ci.value) || 0,
            nop: Number(ci.nop) || 0,
            gross_weight: Number(ci.gross_weight) || 0,
            net_weight: Number(ci.net_weight) || 0,
            considered_weight: Number(ci.considered_weight) || 0,
            others: { delivery_no: ci.others?.delivery_no || "" },
          })),
      }))
      .filter((group) => group.commercial_invoices.length > 0);

    const payload = {
      shipment_id: shipmentData._id,
      pickup_id: pickupId,
      invoice_info: invoiceInfo,
    };

    try {
      await httpsPost("shipment/invoice_info", payload);
      showMessage("Invoice details updated successfully!", "success");
      handleEditGoodsToggle(pickupId);
      onDataChange();
    } catch (error: any) {
      showMessage(error.message || "Failed to save invoice details.", "error");
    } finally {
      setIsSavingGoods((prev) => ({ ...prev, [pickupId]: false }));
    }
  };

  // --- File & Container Handlers ---
  const handleUploadClick = (refId: string) =>
    fileInputRefs.current[refId]?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, pickupId: string, type: "pickup_doc" | "containerNo") => {
    if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        const formData = new FormData();
        
        let endpoint = '';
        let fieldName = '';

        if (type === 'pickup_doc') {
            endpoint = `shipment/upload_document/${pickupId}`;
            fieldName = 'pickup_document';
        } else if (type === 'containerNo') {
            endpoint = `shipment/upload_csno/${pickupId}`;
            fieldName = 'image';
        }

        if (!endpoint) return; // Should not happen

        formData.append(fieldName, file);
        try {
            await httpsPost(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
            showMessage("Document uploaded successfully!", "success");
            onDataChange();
        } catch (error: any) {
            showMessage(error.message || "File upload failed.", "error");
        } finally {
          if (event.target) event.target.value = "";
        }
    }
};


  const labelStyle = {
    width: '150px', // Fixed width for the label. Adjust as needed.
    flexShrink: 0,
    color: 'text.secondary',
  };
  
  const valueStyle = {
    // fontWeight: 'bold',
  };

  const handleNewContainerChange = (
    pickupId: string,
    field: "container" | "seal",
    value: string
  ) => {
    setNewContainerData((prev) => ({
      ...prev,
      [pickupId]: { ...prev[pickupId], [field]: value },
    }));
  };

  const handleAddNumber = async (pickupId: string) => {
    const data = newContainerData[pickupId];
    if (!data || !data.container || !data.seal) {
      showMessage("Container and Seal numbers cannot be empty.", "warning");
      return;
    }
    try {
      await httpsPost("shipment/add_numbers", { pickup: pickupId, ...data });
      showMessage("Container/Seal number added!", "success");
      setNewContainerData((prev) => ({
        ...prev,
        [pickupId]: { container: "", seal: "" },
      }));
      onDataChange();
    } catch (error: any) {
      showMessage(error.message || "Failed to add number.", "error");
    }
  };

  const handleRequestSeal = async (pickupId: string) => {
    try {
      await httpsPost("ws/shipment/request_container_seal", {
        pickup: pickupId,
      });
      showMessage("Container seal requested successfully!", "success");
    } catch (error: any) {
      showMessage(
        error.message || "Failed to request container seal.",
        "error"
      );
    }
  };

  if (!shipmentData || !shipmentData.pickups?.length) {
    return (
      <Typography sx={{ p: 3, textAlign: "center" }}>
        No pickup information available.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* <AppBar
        position="relative"
        color="default"
        sx={{
          boxShadow: "none",
          top: 0, // This ensures it sticks to the very top of the container
          zIndex: 1,
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          flexShrink: 0,
          minHeight: "32px",
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <Tabs
          value={activeSubTab}
          onChange={handleSubTabChange}
          textColor="inherit"
          TabIndicatorProps={{ style: { display: "none" } }}
          variant="fullWidth"
          aria-label="pickup sub-tabs"
          sx={{ minHeight: "32px" }}
        >
          <Tab
            label={
              <Typography variant="body1" sx={{ color: "black" }}>
                Pickup Details
              </Typography>
            }
            sx={{
              textTransform: "none",
              minHeight: "32px",
              paddingTop: "6px",
              paddingBottom: "6px",
              "&.Mui-selected": {
                backgroundColor: "#e0e0e0",
                color: "grey",
              },
            }}
          />
          <Tab
            label={
              <Typography variant="body1" sx={{ color: "black" }}>
                Container No. & Seal No.
              </Typography>
            }
            sx={{
              textTransform: "none",
              minHeight: "32px",
              paddingTop: "6px",
              paddingBottom: "6px",
              "&.Mui-selected": {
                backgroundColor: "#e0e0e0",
                color: "grey",
              },
            }}
          />
        </Tabs>
      </AppBar> */}

      <Box sx={{ flexGrow: 1, overflowY: "auto", position: "relative" }}>
        <TabPanel value={activeSubTab} index={0}>
          {shipmentData.pickups.map((pickup: any, index: number) => {
            const isEditingTimes = isEditingTimestamps[pickup._id];
            const currentTimestampData = editableTimestamps[pickup._id] || {};
            const isEditing = isEditingGoods[pickup._id];
            const goodsInfo = isEditing
              ? editableGoodsInfo[pickup._id] || []
              : groupInvoicesByDelivery(
                  pickup.invoices || [],
                  shipmentData.deliveries
                );

            return (
              <Box key={pickup._id} className={styles.pickupPointCard}>
                <Grid container spacing={2} sx={{mt : '0', ml: '0', width : '100%', border: '1px solid #e0e0e0'}}>
                  <Grid item xs={12} md={7}>
                    <Box className={styles.header}>
                      <span className={styles.pickupIcon}>P{index + 1}</span>
                      <Box className={styles.locationInfo}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          {pickup.location?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {pickup.location?.area}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ pl: "28px" }}>
                      <Typography variant="body2">
                        Scheduled Pickup Date & Time:{" "}
                        <strong>{formatDateTime(pickup.scheduled_at)}</strong>
                      </Typography>
                      {isEmami ? (
                        <Typography variant="body2" sx={{ pl: "16px" }}>
                          Loading Charges (₹):{" "}
                          <strong>
                            {shipmentData.others?.loading_charges || "N/A"}
                          </strong>
                        </Typography>
                        ) : !isTechnova && !isTata && !isBMWIL ? (
                          <Typography variant="body2" sx={{ pl: "16px" }}>
                            DO Number:{" "}
                            <strong>{shipmentData.do_numbers?.join(", ") || "N/A"}</strong>
                          </Typography>
                        ) : null
                      }
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={5} sx={{ padding: "16px" }}>
                    <Paper variant="outlined" sx={{ height: "100%" }}>
                      <Box
                        sx={{
                          p: 1,
                          borderBottom: "1px solid #e0e0e0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            textAlign: "center",
                            flexGrow: 1,
                          }}
                        >

                          Date & Time
                        </Typography>
                        {canEditTimestamps &&
                          (isEditingTimes ? (
                            <>
                              <IconButton
                                size="small"
                                title="Save"
                                onClick={() => handleSaveTimestamps(pickup._id)}
                                disabled={isSavingTimestamps[pickup._id]}
                              >
                                {isSavingTimestamps[pickup._id] ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <SaveIcon sx={{ color: '#4F46E5' }} fontSize="small" />
                                )}
                              </IconButton>
                              <IconButton
                                size="small"
                                title="Cancel"
                                onClick={() =>
                                  handleEditTimestampsToggle(pickup._id)
                                }
                                disabled={isSavingTimestamps[pickup._id]}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton
                              size="small"
                              title="Edit Timestamps"
                              onClick={() =>
                                handleEditTimestampsToggle(pickup._id)
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          ))}
                      </Box>
                      <Box sx={{ p: 2 }}>
                        {isEditingTimes ? (
                          <Box
                            component="form"
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            <CustomDateTimePicker
                              label="Arrival"
                              value={
                                currentTimestampData.arrived_at ? new Date(currentTimestampData.arrived_at) : null
                              }
                              onChange={(newValue: Date | null) =>
                                handleTimestampChange(
                                  pickup._id,
                                  "arrived_at",
                                newValue
                                )
                              }
                            />
                            <CustomDateTimePicker
                              label="Loading Start"
                              value={
                                currentTimestampData.loading_start ? new Date(currentTimestampData.loading_start) : null
                              }
                              onChange={(newValue: Date | null) =>
                                handleTimestampChange(
                                  pickup._id,
                                  "loading_start",
                                newValue
                                )
                              }
                            />
                            <CustomDateTimePicker
                              label="Loading Complete"
                              value={
                                currentTimestampData.loading_end ? new Date(currentTimestampData.loading_end) : null
                              }
                              onChange={(newValue: Date | null) =>
                                handleTimestampChange(
                                  pickup._id,
                                  "loading_end",
                                newValue
                                )
                              }
                            />
                            <CustomDateTimePicker
                              label="Dispatched"
                              value={
                                currentTimestampData.finished_at ? new Date(currentTimestampData.finished_at) : null
                              }
                              onChange={(newValue: Date | null) =>
                                handleTimestampChange(
                                  pickup._id,
                                  "finished_at",
                                newValue
                                )
                              }
                            />
                          </Box>
                        ) : (
                          <>
                            {/* Arrival Row */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <Typography variant="body2" sx={labelStyle}>
                                Arrival
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {pickup.arrived_at
                                  ? `: ${formatDateTime(pickup.arrived_at)}`
                                  : ": N/A"}
                              </Typography>
                            </Box>

                            {/* Loading Start Row */}
                            <Box sx={{ display: "flex", alignItems: "flex-start"}}>
                              <Typography variant="body2" sx={labelStyle}>
                                Loading Start
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {pickup.driver_act_loading_time?.start
                                  ? `: ${formatDateTime(pickup.driver_act_loading_time.start)}`
                                 : ": N/A"}
                              </Typography>
                            </Box>

                            {/* Loading Complete Row */}
                            <Box sx={{ display: "flex", alignItems: "flex-start"}}>
                              <Typography variant="body2" sx={labelStyle}>
                                Loading Complete
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {pickup.driver_act_loading_time?.end
                                  ? `: ${formatDateTime(pickup.driver_act_loading_time.end)}`
                                  : ": N/A"}
                              </Typography>
                            </Box>

                            {/* Dispatched Row */}
                            <Box sx={{ display: "flex", alignItems: "flex-start"}}>
                              <Typography variant="body2" sx={labelStyle}>
                                Dispatched
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {pickup.finished_at
                                  ? `: ${formatDateTime(pickup.finished_at)}`
                                  : ": N/A"}
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, paddingLeft: '919px', paddingTop: '0px' }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleUploadClick(pickup._id + "_doc")}
                      sx={{
                        backgroundColor: '#4F46E5',
                        '&:hover': {
                          backgroundColor: '#4338ca',
                        },
                        textTransform: 'capitalize',
                        height: '30px',
                        fontSize: '0.875rem',
                        textAlign: 'end',
                        
                      }}
                     
                    >
                      Upload Document
                    </Button>
                    <input
                      type="file"
                      ref={el => { if (el) fileInputRefs.current[pickup._id + "_doc"] = el; }}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e, pickup._id, 'pickup_doc')}
                    />
                  </Box>
                </Grid>

               

                <Box className={styles.goodsHeader}>
                  <Typography variant="subtitle1">
                    Goods:{" "}
                    {shipmentData.materials
                      ?.map((m: any) => m.name)
                      .join(", ") || "N/A"}
                  </Typography>
                  {canEditInvoices &&
                    (isEditing ? (
                      <Box>
                        
                        <IconButton
                          size="small"
                          title="Cancel"
                          onClick={() => handleEditGoodsToggle(pickup._id)}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <IconButton
                        size="small"
                        title="Edit Goods & Invoices"
                        onClick={() => handleEditGoodsToggle(pickup._id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    ))}
                </Box>
                <InvoiceTable
                  groupedInvoices={goodsInfo}
                  isEditing={isEditing}
                  editableGoodsInfoForPickup={
                    editableGoodsInfo[pickup._id] || []
                  }
                  onGoodsInfoChange={(groupIndex, field, value) =>
                    handleGoodsInfoChange(pickup._id, groupIndex, field, value)
                  }
                  onInvoiceChange={(groupIndex, ciIndex, field, value) =>
                    handleInvoiceChange(
                      pickup._id,
                      groupIndex,
                      ciIndex,
                      field,
                      value
                    )
                  }
                  onSave={() => handleSaveGoods(pickup._id)} 
                  onAddRow={(groupIndex) => handleAddRow(pickup._id, groupIndex)}
                  onRemoveRow={(groupIndex, ciIndex) =>
                    handleRemoveRow(pickup._id, groupIndex, ciIndex)
                  }
                  isTechnova = {isTechnova}
                  isEmami = {isEmami}
                  isBMWIL = {isBMWIL}
                  shipmentData={shipmentData}
                />
                <Grid
                  container
                  spacing={2}
                  sx={{
                    mt: 2,
                    border: "1px solid #E0E0E0",
                    marginLeft: "0px",
                    marginTop: "10px",
                    width: "100%",
                  }}
                >
                  <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                      padding: "16px",
                      borderRight: { md: "1px solid #E0E0E0" },
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Documents
                    </Typography>
                    <Box className={styles.galleryBox}>
                      {pickup.docs && pickup.docs.length > 0 ? (
                        pickup.docs.map((doc: string, idx: number) => (
                          <SimpleDocViewer key={idx} assetUrl={doc} />
                        ))
                      ) : (
                        <Typography color="textSecondary">
                          No documents uploaded.
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ padding: "16px" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Signature
                    </Typography>
                    <Box className={styles.galleryBox}>
                      {pickup.shipper_signature ? (
                        <img
                          src={pickup.shipper_signature}
                          alt="Signature"
                          style={{ maxHeight: "70px", maxWidth: "100%" }}
                        />
                      ) : (
                        <Typography
                          sx={{ textAlign: "center" }}
                          color="textSecondary"
                        >
                          No Signature Found
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            );
          })}
        </TabPanel>

        <TabPanel value={activeSubTab} index={1}>
          {shipmentData.pickups.map((pickup: any, index: number) => (
            <Box key={pickup._id} className={styles.pickupPointCard}>
              <Box className={styles.header} sx={{ mb: 2 }}>
                <span className={styles.pickupIcon}>P{index + 1}</span>
                <Box className={styles.locationInfo}>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {pickup.location?.name}
                  </Typography>
                </Box>
                {ownFleet && (userRoles.owner || userRoles.fleet) && (
                  <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleRequestSeal(pickup._id)}
                    >
                      Request
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() =>
                        handleUploadClick(pickup._id + "_container")
                      }
                    >
                      Upload
                    </Button>
                    <input
                      type="file"
                      ref={(el) => {
                        fileInputRefs.current[pickup._id + "_container"] = el;
                      }}
                      style={{ display: "none" }}
                      onChange={(e) =>
                        handleFileChange(e, pickup._id, "containerNo")
                      }
                    />
                  </Box>
                )}
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Container No.</TableCell>
                      <TableCell>Seal No.</TableCell>
                      {ownFleet && (userRoles.owner || userRoles.fleet) && (
                        <TableCell align="right">Action</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pickup.numbers && pickup.numbers.length > 0 ? (
                      pickup.numbers.map((num: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{num.container}</TableCell>
                          <TableCell>{num.seal}</TableCell>
                          {ownFleet && (userRoles.owner || userRoles.fleet) && (
                            <TableCell align="right"></TableCell>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={
                            ownFleet && (userRoles.owner || userRoles.fleet)
                              ? 3
                              : 2
                          }
                          align="center"
                        >
                          No container data available.
                        </TableCell>
                      </TableRow>
                    )}
                    {ownFleet && (userRoles.owner || userRoles.fleet) && (
                      <TableRow>
                        <TableCell>
                          <TextField
                            size="small"
                            variant="standard"
                            placeholder="New Container No."
                            value={
                              newContainerData[pickup._id]?.container || ""
                            }
                            onChange={(e) =>
                              handleNewContainerChange(
                                pickup._id,
                                "container",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            variant="standard"
                            placeholder="New Seal No."
                            value={newContainerData[pickup._id]?.seal || ""}
                            onChange={(e) =>
                              handleNewContainerChange(
                                pickup._id,
                                "seal",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleAddNumber(pickup._id)}
                            
                          >
                            <AddIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Pictures
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  minHeight: 100,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                {pickup.other_docs && pickup.other_docs.length > 0 ? (
                  pickup.other_docs.map((doc: string, idx: number) => (
                    <SimpleDocViewer key={idx} assetUrl={doc} />
                  ))
                ) : (
                  <Typography color="textSecondary">
                    No pictures uploaded.
                  </Typography>
                )}
              </Paper>
            </Box>
          ))}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default PickupTab;
