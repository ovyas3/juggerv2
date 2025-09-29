// components/ShipmentsDashboard/ShipmentDetails/DeliveryTab.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ArticleIcon from "@mui/icons-material/Article";
import CancelIcon from "@mui/icons-material/Cancel";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import styles from "./DeliveryTab.module.css";
import pickupStyles from "./PickupTab.module.css"; // Import styles from PickupTab
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPut, httpsPost } from "@/utils/Communication";
import { UserRoles } from "@/hooks/useUserRoles";
import CustomDateTimePicker from "@/components/UI/CustomDateTimePicker/CustomDateTimePicker";

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
          <ArticleIcon sx={{ fontSize: 40, color: "text.secondary" }} />
        )}
      </Paper>
    </a>
  );
};

const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    let formatted = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(date)
      .replace(" at", ",");
    return formatted.replace(/ (am|pm)$/i, (match) => match.toUpperCase());
  } catch (e) {
    return "N/A";
  }
};

const DeliveryTab = ({
  shipmentData,
  onDataChange,
  userRoles,
  isShipmentManagement,
  ownFleet,
  isTechnova,
  isEmami,
  isBMWIL, // Pass isBMWIL prop from parent
}: {
  shipmentData: any;
  onDataChange: () => void;
  userRoles: UserRoles;
  isShipmentManagement: boolean;
  ownFleet: boolean;
  isTechnova: boolean;
  isEmami: boolean;
  isBMWIL: boolean;
}) => {
  const [mappedDeliveries, setMappedDeliveries] = useState<any[]>([]);
  const [isEditingTimestamps, setIsEditingTimestamps] = useState<
    Record<string, boolean>
  >({});
  const [isEditingInvoices, setIsEditingInvoices] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [isEditingDcs, setIsEditingDcs] = useState<Record<string, boolean>>({});
  const [editableTimestamps, setEditableTimestamps] = useState<
    Record<string, any>
  >({});
  const [showEpodDeletePopup, setShowEpodDeletePopup] = useState(false);

  const [showDisapproveDialog, setShowDisapproveDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentDeliveryForApproval, setCurrentDeliveryForApproval] = useState<any>(null);
  const [editableInvoices, setEditableInvoices] = useState<Record<string, any>>(
      {}
    );

    // For EPODs on individual invoices
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentInvoiceForEpod, setCurrentInvoiceForEpod] = useState<any>(null);
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, invoice: any) => {
    setAnchorEl(event.currentTarget);
    setCurrentInvoiceForEpod(invoice);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // For EPOD deletion confirmation popup
  const [openEpodDeletePopup, setOpenEpodDeletePopup] = useState(false);
  const [epodToDelete, setEpodToDelete] = useState<{ deliveryId: string; invoiceNum: string; epodUrl: string; index: number } | null>(null);

  const handleDeleteClick = (deliveryId: string, invoiceNum: string, epodUrl: string, index: number) => {
    setEpodToDelete({ deliveryId, invoiceNum, epodUrl, index });
    setOpenEpodDeletePopup(true);
  };

  // For approval/disapproval of delivery-level EPODs
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [disapproveReason, setDisapproveReason] = useState('');
  const [deliveryIdForApproval, setDeliveryIdForApproval] = useState<string | null>(null);

  const handleDisapproveClick = (deliveryId: string) => {
    setDeliveryIdForApproval(deliveryId);
    setShowReasonInput(true);
  };

  // New state variables for editing the invoice table's comments and status
  const [editableInvoiceComments, setEditableInvoiceComments] = useState({});
  const [editablePackageStatus, setEditablePackageStatus] = useState({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<Record<string, HTMLInputElement | null>>({});
  const { showMessage } = useSnackbar();

  useEffect(() => {
    if (
      shipmentData?.deliveries &&
      shipmentData?.pickups &&
      shipmentData?.invoices
    ) {
      const deliveryInvoiceMap = new Map();
      shipmentData.invoices.forEach((invoiceDoc: any) => {
        if (invoiceDoc.delivery_id) {
          const deliveryIdStr = invoiceDoc.delivery_id.toString();
          if (!deliveryInvoiceMap.has(deliveryIdStr)) {
            deliveryInvoiceMap.set(deliveryIdStr, []);
          }
          const pickupLabel = shipmentData.pickups.find(
            (p: any) => p._id === invoiceDoc.pickup_id
          )?.sequence;
          const formattedInvoiceGroup = {
            ...invoiceDoc,
            p_label: `P${pickupLabel}`,
            edit_enable: false,
            invoice: invoiceDoc.invoice || [],
          };
          deliveryInvoiceMap.get(deliveryIdStr).push(formattedInvoiceGroup);
        }
      });

      const newMappedDeliveries = shipmentData.deliveries
        .sort((a: any, b: any) => a.sequence - b.sequence)
        .map((delivery: any) => ({
          ...delivery,
          invoices: deliveryInvoiceMap.get(delivery._id.toString()) || [],
          epods: (delivery.epods || []).map((link: string) => ({
            extension: link.substr(link.lastIndexOf(".")).substr(1),
            link,
          })),
          all_docs: [...(delivery.other_docs || []), ...(delivery.docs || [])],
        }));

      setMappedDeliveries(newMappedDeliveries);

      const initialInvoices: Record<string, any> = {};
      newMappedDeliveries.forEach((delivery: any) => {
        initialInvoices[delivery._id] = JSON.parse(
          JSON.stringify(delivery.invoices || [])
        );
      });
      setEditableInvoices(initialInvoices);
    }
  }, [shipmentData]);

  const canEditDelivery =
    shipmentData.status !== "Cancelled" && !shipmentData.hasCarrierInvoices;
  const canEditAny = isShipmentManagement || canEditDelivery;

  const handleEditToggle = (
    deliveryId: string,
    section: "timestamps" | "invoices" | "docs",
    invoiceId?: string
  ) => {
    if (section === "invoices" && invoiceId) {
      setIsEditingInvoices((prev) => ({
        ...prev,
        [deliveryId]: {
          ...prev[deliveryId],
          [invoiceId]: !prev[deliveryId]?.[invoiceId],
        },
      }));
      return;
    }

    const setSectionEditing =
      section === "timestamps" ? setIsEditingTimestamps : setIsEditingDcs;
    setSectionEditing((prev) => {
      const isCurrentlyEditing = !!prev[deliveryId];
      if (!isCurrentlyEditing && section === "timestamps") {
        const delivery = mappedDeliveries.find(
          (d: any) => d._id === deliveryId
        );
        setEditableTimestamps((prevTimes) => ({
          ...prevTimes,
          [deliveryId]: {
            arrived_at: delivery?.arrived_at || "",
            unloading_start: delivery?.driver_act_unloading_time?.start || "",
            unloading_end: delivery?.driver_act_unloading_time?.end || "",
            finished_at: delivery?.finished_at || "",
          },
        }));
      }
      return { ...prev, [deliveryId]: !isCurrentlyEditing };
    });
  };

  const handleTimestampChange = (
    deliveryId: string,
    field: string,
    value: Date | null
  ) => {
    setEditableTimestamps((prev) => ({
      ...prev,
      [deliveryId]: {
        ...prev[deliveryId],
        [field]: value ? value.toISOString() : "",
      },
    }));
  };

  const handleSaveTimestamps = async (deliveryId: string) => {
    setIsSaving((prev) => ({ ...prev, [deliveryId]: true }));
    const dataToSave = editableTimestamps[deliveryId];
    const payload = {
      arrived_at: dataToSave.arrived_at
        ? new Date(dataToSave.arrived_at).getTime()
        : null,
      finished_at: dataToSave.finished_at
        ? new Date(dataToSave.finished_at).getTime()
        : null,
      unloading_at: {
        start: dataToSave.unloading_start
          ? new Date(dataToSave.unloading_start).getTime()
          : null,
        end: dataToSave.unloading_end
          ? new Date(dataToSave.unloading_end).getTime()
          : null,
      },
    };

    try {
      const response = await httpsPut(
        `v2/shipment/update_delivery/${deliveryId}`,
        payload
      );
      if (response.statusCode === 200) {
        showMessage("Delivery times updated successfully!", "success");
        handleEditToggle(deliveryId, "timestamps");
        onDataChange();
      }
    } catch (error: any) {
      showMessage(error.message || "Failed to update delivery times.", "error");
    } finally {
      setIsSaving((prev) => ({ ...prev, [deliveryId]: false }));
    }
  };

  const handleInvoiceCheckboxChange = (
    deliveryId: string,
    groupIndex: number,
    invoiceIndex: number,
    field: string
  ) => {
    setEditableInvoices((prev) => {
      const deliveryInvoices = JSON.parse(
        JSON.stringify(prev[deliveryId] || [])
      );
      const invoice = deliveryInvoices[groupIndex].invoice[invoiceIndex];

      invoice[field] = !invoice[field];

      if (field === "full_checked" && invoice[field]) {
        invoice.missing_checked = false;
        invoice.damaged_checked = false;
        invoice.clotted_checked = false;
        invoice.rejected_checked = false;
        invoice.carton_damage_checked = false;
      }

      return { ...prev, [deliveryId]: deliveryInvoices };
    });
  };

  const handleInvoiceFieldChange = (
    deliveryId: string,
    groupIndex: number,
    invoiceIndex: number,
    field: string,
    value: string | number
  ) => {
    setEditableInvoices((prev) => {
      const deliveryInvoices = JSON.parse(
        JSON.stringify(prev[deliveryId] || [])
      );
      const invoice = deliveryInvoices[groupIndex].invoice[invoiceIndex];
      invoice[field] = value;
      return { ...prev, [deliveryId]: deliveryInvoices };
    });
  };

  const labelStyle = {
    width: "150px",
    flexShrink: 0,
    color: "text.secondary",
  };

  const valueStyle = {
    fontWeight: "bold",
  };

  const handleSaveInvoices = async (deliveryId: string, invoiceGroup: any) => {
    setIsSaving((prev) => ({ ...prev, [invoiceGroup._id]: true }));

    const payload = {
      commercial_invoice: {
        comments: invoiceGroup.comments || "",
        status: invoiceGroup.status || [],
        num: invoiceGroup.num,
        invoice_products: [],
      },
    };

    try {
      const response = await httpsPut(
        `v1/shipment/update_invoice/${invoiceGroup._id}`,
        payload
      );
      if (response.statusCode === 200) {
        showMessage("Invoice details updated successfully!", "success");
        handleEditToggle(deliveryId, "invoices", invoiceGroup._id);
        onDataChange();
      }
    } catch (error: any) {
      showMessage(error.message || "Failed to save invoice details.", "error");
    } finally {
      setIsSaving((prev) => ({ ...prev, [invoiceGroup._id]: false }));
    }
  };

  const handleUploadClick = (deliveryId: string, type: "epod" | "goods") => {
    const refId = `${deliveryId}-${type}`;
    fileInputRef.current?.[refId]?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    deliveryId: string,
    type: "epod" | "goods"
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const formData = new FormData();
      const endpoint = `shipment/epods_goods/${deliveryId}`;
      const formKey = type === "epod" ? "epod_pics" : "goods_pics";
      formData.append(formKey, file);

      try {
        await httpsPost(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showMessage(`${type.toUpperCase()} uploaded successfully!`, "success");
        onDataChange();
      } catch (error: any) {
        showMessage(error.message || "File upload failed.", "error");
      }
    }
  };

  const handleRequestEPODs = async (deliveryId: string) => {
    try {
      await httpsPost("ws/shipment/request_epod", {
        shipment: shipmentData._id,
        delivery: deliveryId,
      });
      showMessage("EPOD requested successfully!", "success");
    } catch (error: any) {
      showMessage(error.message || "Failed to request EPOD.", "error");
    }
  };

  const handleApproveDisapproveEPOD = async (
    deliveryId: string,
    approve: boolean
  ) => {
    let reason = "";
    if (!approve) {
      reason = prompt("Please provide a reason for disapproval:") || "";
      if (!reason) {
        showMessage("Disapproval reason is required.", "warning");
        return;
      }
    }

    const payload = { delivery: deliveryId, approved: approve, reason: reason };

    try {
      await httpsPost("v1/shipment/approveEpod", payload);
      showMessage(
        `EPODs ${approve ? "approved" : "disapproved"} successfully!`,
        "success"
      );
      onDataChange();
    } catch (error: any) {
      showMessage(error.message || "Failed to update EPOD status.", "error");
    }
  };

  if (!mappedDeliveries.length) {
    return (
      <Typography sx={{ p: 3, textAlign: "center" }}>
        No delivery information available.
      </Typography>
    );
  }

  const handleAddNewInvoiceRow = (
    deliveryId: string,
    invGroupIndex: number
  ) => {
    setEditableInvoices((prev) => {
      const updatedInvoices = { ...prev };
      const invoiceGroup = updatedInvoices[deliveryId][invGroupIndex];
      const newInvoice = {
        nop: 0,
        num: "",
        uom: shipmentData.uom,
        value: 0,
        gross_weight: 0,
        net_weight: 0,
        considered_weight: 0,
        others: {
          bill_to: "",
          bill_to_name: "",
          delivery_no: "",
        },
      };
      invoiceGroup.invoice.push(newInvoice);
      return updatedInvoices;
    });
  };

  const handleRemoveInvoiceRow = (
    deliveryId: string,
    invGroupIndex: number,
    invIndex: number
  ) => {
    setEditableInvoices((prev) => {
      const updatedInvoices = { ...prev };
      updatedInvoices[deliveryId][invGroupIndex].invoice.splice(invIndex, 1);
      return updatedInvoices;
    });
  };

  const handleAddCommercialInvoice = (
    deliveryId: string,
    invoiceId: string
  ) => {
    setEditableInvoices((prev) => {
      const newEditableInvoices = { ...prev };
      const deliveryInvoices = newEditableInvoices[deliveryId];
      const invoiceGroupIndex = deliveryInvoices.findIndex(
        (group: any) => group._id === invoiceId
      );

      if (invoiceGroupIndex !== -1) {
        const invoiceGroup = deliveryInvoices[invoiceGroupIndex];
        invoiceGroup.invoice.push({
          nop: 0,
          num: "",
          value: 0,
          uom: shipmentData.uom,
          gross_weight: 0,
          net_weight: 0,
          considered_weight: 0,
          others: {
            bill_to: "",
            bill_to_name: "",
            delivery_no: "",
          },
        });
      }
      return newEditableInvoices;
    });
  };

  const handleRemoveCommercialInvoice = (
    deliveryId: string,
    invoiceId: string,
    invIndex: number
  ) => {
    setEditableInvoices((prev) => {
      const newEditableInvoices = { ...prev };
      const deliveryInvoices = newEditableInvoices[deliveryId];
      const invoiceGroupIndex = deliveryInvoices.findIndex(
        (group: any) => group._id === invoiceId
      );

      if (invoiceGroupIndex !== -1) {
        newEditableInvoices[deliveryId][invoiceGroupIndex].invoice.splice(
          invIndex,
          1
        );
      }
      return newEditableInvoices;
    });
  };

  return (
    <Box>
      {mappedDeliveries.map((delivery: any, index: number) => {
        const isEditing = isEditingTimestamps[delivery._id];
        const isCurrentlyEditingDocs = isEditingDcs[delivery._id];
        const currentTimestampData = editableTimestamps[delivery._id] || {};
        const currentInvoiceData =
          editableInvoices[delivery._id] || delivery.invoices;

        const showEpodButtons = !ownFleet && delivery.epods?.length > 0;
        const canApprove = showEpodButtons && delivery.epod_approved !== true;
        const canDisapprove =
          showEpodButtons && delivery.epod_approved !== false;

        const showUploadRequestButtons =
          (isBMWIL || ownFleet) && (userRoles.owner || userRoles.fleet);
          
        return (
          <Box key={delivery._id} className={styles.deliveryPointCard}>
            <Grid
              container
              spacing={2}
              sx={{
                marginLeft: "0px",
                border: "1px solid #E0E0E0",
                marginTop: "0px",
                width: "100%",
              }}
            >
              <Grid item xs={12} md={7} sx={{ padding: "16px" }}>
                <Box className={styles.header}>
                  <span className={styles.deliveryIcon}>D{index + 1}</span>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {delivery.location?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {delivery.location?.area}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ paddingLeft: "40px" }}>
                  Delivery Date and Time:{" "}
                  <strong>{formatDateTime(delivery.scheduled_at)}</strong>
                </Typography>
                {(isTechnova || isEmami || isBMWIL) && (
                  <Typography variant="body2" sx={{ paddingLeft: "40px" }}>
                    Invoice Number (s):{" "}
                    <strong>
                      {delivery.invoices.flatMap((group: any) => group.invoice.map((inv: any) => inv.num)).filter(Boolean).join(", ")}
                    </strong>
                  </Typography>
                )}
                {(isEmami || isBMWIL) && (
                  <Typography variant="body2" sx={{ paddingLeft: "40px" }}>
                    Materials:{" "}
                    <strong>
                      {shipmentData.materials?.map((m: any) => m.name).join(", ") || "N/A"}
                    </strong>
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={5} sx={{ padding: "16px" }}>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    height: "100%",
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            position: "relative",
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              display: "inline-block",
                            }}
                          >
                            Date & Time
                          </Typography>
                          {canEditAny && (
                            <Box
                              sx={{
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            >
                              {isEditing ? (
                                <>
                                  <IconButton
                                    size="small"
                                    title="Save"
                                    onClick={() =>
                                      handleSaveTimestamps(delivery._id)
                                    }
                                    disabled={isSaving[delivery._id]}
                                  >
                                    {isSaving[delivery._id] ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      <SaveIcon
                                        sx={{ color: "#4F46E5" }}
                                        fontSize="small"
                                      />
                                    )}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    title="Cancel"
                                    onClick={() =>
                                      handleEditToggle(
                                        delivery._id,
                                        "timestamps"
                                      )
                                    }
                                    disabled={isSaving[delivery._id]}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </>
                              ) : (
                                <IconButton
                                  size="small"
                                  title="Edit Timestamps"
                                  onClick={() =>
                                    handleEditToggle(delivery._id, "timestamps")
                                  }
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ verticalAlign: "top" }}>
                          {isEditing ? (
                            <Box
                              component="form"
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                pt: 1,
                              }}
                            >
                              <CustomDateTimePicker
                                label="Arrival"
                                value={
                                  currentTimestampData.arrived_at
                                    ? new Date(currentTimestampData.arrived_at)
                                    : null
                                }
                                onChange={(newValue: Date | null) =>
                                  handleTimestampChange(
                                    delivery._id,
                                    "arrived_at",
                                    newValue
                                  )
                                }
                              />
                              <CustomDateTimePicker
                                label="Unloading Start"
                                value={
                                  currentTimestampData.unloading_start
                                    ? new Date(
                                        currentTimestampData.unloading_start
                                      )
                                    : null
                                }
                                onChange={(newValue: Date | null) =>
                                  handleTimestampChange(
                                    delivery._id,
                                    "unloading_start",
                                    newValue
                                  )
                                }
                              />
                              <CustomDateTimePicker
                                label="Unloading Complete"
                                value={
                                  currentTimestampData.unloading_end
                                    ? new Date(
                                        currentTimestampData.unloading_end
                                      )
                                    : null
                                }
                                onChange={(newValue: Date | null) =>
                                  handleTimestampChange(
                                    delivery._id,
                                    "unloading_end",
                                    newValue
                                  )
                                }
                              />
                              <CustomDateTimePicker
                                label="Delivered"
                                value={
                                  currentTimestampData.finished_at
                                    ? new Date(currentTimestampData.finished_at)
                                    : null
                                }
                                onChange={(newValue: Date | null) =>
                                  handleTimestampChange(
                                    delivery._id,
                                    "finished_at",
                                    newValue
                                  )
                                }
                              />
                            </Box>
                          ) : (
                            <>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Typography variant="body2" sx={labelStyle}>
                                  Arrival
                                </Typography>
                                <Typography variant="body2" sx={valueStyle}>
                                  {delivery.arrived_at
                                    ? `: ${formatDateTime(delivery.arrived_at)}`
                                    : ": N/A"}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Typography variant="body2" sx={labelStyle}>
                                  Unloading
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', pl: '20px' }}>
                                <Typography variant="body2" sx={{...labelStyle, width: '130px'}}>
                                  Start
                                </Typography>
                                <Typography variant="body2" sx={valueStyle}>
                                  {delivery.driver_act_unloading_time?.start
                                    ? `: ${formatDateTime(
                                        delivery.driver_act_unloading_time.start
                                      )}`
                                    : ": N/A"}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', pl: '20px' }}>
                                <Typography variant="body2" sx={{...labelStyle, width: '130px'}}>
                                  Complete
                                </Typography>
                                <Typography variant="body2" sx={valueStyle}>
                                  {delivery.driver_act_unloading_time?.end
                                    ? `: ${formatDateTime(
                                        delivery.driver_act_unloading_time.end
                                      )}`
                                    : ": N/A"}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Typography variant="body2" sx={labelStyle}>
                                  Delivered
                                </Typography>
                                <Typography variant="body2" sx={valueStyle}>
                                  {delivery.finished_at
                                    ? `: ${formatDateTime(delivery.finished_at)}`
                                    : ": N/A"}
                                </Typography>
                              </Box>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
            <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    marginTop: '8px',
                  }}>
                    {showUploadRequestButtons && (
                        <>
                          <Button 
                            variant="contained" 
                            size="small" 
                            sx={{ backgroundColor: '#4f46e5', '&:hover': { backgroundColor: '#4338ca' }, textTransform: 'capitalize' , boxShadow: 'none'}}
                            onClick={() => handleUploadClick(delivery._id, "epod")}
                          >
                            Upload EPOD
                          </Button>
                          <Button 
                            variant="contained" 
                            size="small" 
                            sx={{ backgroundColor: '#0c6628', '&:hover': { backgroundColor: '#095221' }, textTransform: 'capitalize', boxShadow: 'none' }}
                            onClick={() => handleRequestEPODs(delivery._id)}
                          >
                            Request EPOD
                          </Button>
                        </>
                      )}
                    {delivery.epods && delivery.epods.length > 0 && (
                      <>
                        {delivery.epod_approved === null && (
                          <>
                            <button
                              style={{
                                backgroundColor: '#0c6628',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '5px 9px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: 'Roboto, Helvika, Arial, sans-serif'
                              }}
                              onClick={() => handleApproveDisapproveEPOD(delivery._id, true)}
                            >
                              Approve
                            </button>
                            <Button
                              style={{
                                backgroundColor: '#d85120',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '5px 9px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: 'Roboto, Helvika, Arial, sans-serif'
                              }}
                              onClick={() => handleApproveDisapproveEPOD(delivery._id, false)}
                            >
                              Disapprove
                            </Button>
                          </>
                        )}

                        {delivery.epod_approved === true && (
                          <>
                            <Typography
                              variant="caption"
                              style={{
                                color: 'green',
                                fontWeight: 'bold',
                                marginRight: '15px'
                              }}
                            >
                              EPOD Approved
                            </Typography>
                            <Button
                              style={{
                                backgroundColor: '#d85120',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '5px 9px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: 'Roboto, Helvika, Arial, sans-serif'
                              }}
                              onClick={() => handleApproveDisapproveEPOD(delivery._id, false)}
                            >
                              Disapprove
                            </Button>
                          </>
                        )}

                        {delivery.epod_approved === false && (
                          <>
                            <Typography
                              variant="caption"
                              style={{
                                color: 'red',
                                fontWeight: 'bold',
                                marginRight: '15px'
                              }}
                            >
                              EPOD Disapproved
                            </Typography>
                            <button
                              style={{
                                backgroundColor: '#0c6628',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '5px 9px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: 'Roboto, Helvika, Arial, sans-serif'
                              }}
                              onClick={() => handleApproveDisapproveEPOD(delivery._id, true)}
                            >
                              Approve
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>

            {currentInvoiceData && currentInvoiceData.length > 0 ? (
              currentInvoiceData.map(
                (invoiceGroup: any, invGroupIndex: number) => (
                  <Box key={invGroupIndex} className={styles.invoiceGroup}>
                    <Box sx={{ display: "flex", alignItems: "center", my: 1, gap: 1 }}>
                      <span className={pickupStyles.pickupIcon}>
                        {invoiceGroup.p_label}
                      </span>
                      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ mr: 1}}
                      >
                        Total Gross Weight: <strong style ={{ fontWeight: "bold" }}>{invoiceGroup.total_gross_weight} {shipmentData.uom}</strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mr: 1 }}
                      >
                        Total Net Weight: <strong style ={{ fontWeight: "bold" }}>{invoiceGroup.total_net_weight} {shipmentData.uom}</strong> 
                      </Typography>
                      {!isTechnova && (
                        <Typography
                          variant="body2"
                          sx={{ mr: 1 }}
                        >
                          Total Considered Weight: <strong style ={{ fontWeight: "bold" }}>{invoiceGroup.total_considered_weight} {shipmentData.uom}</strong>
                          
                        </Typography>
                      )}
                      </Box>
                      {invoiceGroup.pdf_link && (
                        <IconButton
                          size="small"
                          component="a"
                          href={invoiceGroup.pdf_link}
                          download
                        >
                          <ArticleIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canEditAny && (
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleEditToggle(
                              delivery._id,
                              "invoices",
                              invoiceGroup._id
                            )
                          }
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleAddNewInvoiceRow(delivery._id, invGroupIndex)
                        }
                        disabled={
                          !isEditingInvoices[delivery._id]?.[invoiceGroup._id]
                        }
                      >
                        <AddCircleOutlineIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleRemoveInvoiceRow(
                            delivery._id,
                            invGroupIndex,
                            invoiceGroup.invoice.length - 1
                          )
                        }
                        disabled={
                          !isEditingInvoices[delivery._id]?.[
                            invoiceGroup._id
                          ] || invoiceGroup.invoice.length <= 1
                        }
                      >
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    

                    <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: "#F5F5F5" }}>
                        <TableRow>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: "#09337e"}}>S.No.</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' , color: "#09337e", width: '180px'}}>Invoice</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: "#09337e", width: '150px' }}>Value (₹)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold',color: "#09337e", width: '1px' }}>Packages</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: "#09337e",  width: '150px'  }}>Gross Wt. ({shipmentData.uom})</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: "#09337e",  width: '150px'  }}>Net Wt. ({shipmentData.uom})</TableCell>
                          {!isTechnova && <TableCell align="center" sx={{ fontWeight: 'bold', color: "#09337e" }}>Considered Wt. ({shipmentData.uom})</TableCell>}
                          <TableCell align="center" sx={{ fontWeight: 'bold' , color: "#09337e",}}>Package Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' , color: "#09337e", width: '250px'}}>Comments</TableCell>
                          {isEditingInvoices[delivery._id]?.[invoiceGroup._id] && <TableCell align="center" sx={{ fontWeight: 'bold' }}></TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(invoiceGroup.invoice || []).map(
                          (inv: any, invIndex: number) => {
                            const isEditingInv = !!isEditingInvoices[delivery._id]?.[
                              invoiceGroup._id
                            ];
                            const status = Object.entries(inv)
                              .filter(
                                ([key, value]) =>
                                  key.endsWith("_checked") && value
                              )
                              .map(([key]) =>
                                key.replace("_checked", "").toUpperCase()
                              );
                            
                            const isDefaultStatus = status.length === 0;
                            const statusText = isDefaultStatus ? "Full" : status.join(", ");

                            return (
                              <React.Fragment key={invIndex}>
                                <TableRow hover>
                                  <TableCell align="center" sx={{ padding: '2px 7px' }}>{invIndex + 1}</TableCell>
                                  <TableCell align="center" sx={{ padding: '2px 7px' }}>
                                    {isEditingInv ? (
                                      <TextField
                                        size="small"
                                        fullWidth
                                        sx={{ padding: '4px 4px' }}
                                        value={inv.num}
                                        onChange={(e) =>
                                          handleInvoiceFieldChange(
                                            delivery._id,
                                            invGroupIndex,
                                            invIndex,
                                            "num",
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      inv.num
                                    )}
                                  </TableCell>
                                  <TableCell align="center" sx={{ padding: '2px 7px' }}>
                                    {isEditingInv ? (
                                      <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        value={inv.value}
                                        onChange={(e) =>
                                          handleInvoiceFieldChange(
                                            delivery._id,
                                            invGroupIndex,
                                            invIndex,
                                            "value",
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      inv.value
                                    )}
                                  </TableCell>
                                  <TableCell align="center" sx={{ padding: '2px 7px' }}>
                                    {isEditingInv ? (
                                      <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        value={inv.nop}
                                        onChange={(e) =>
                                          handleInvoiceFieldChange(
                                            delivery._id,
                                            invGroupIndex,
                                            invIndex,
                                            "nop",
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      inv.nop
                                    )}
                                  </TableCell>
                                  <TableCell align="center" sx={{ padding: '2px 7px' }}>
                                    {isEditingInv ? (
                                      <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        value={inv.gross_weight}
                                        onChange={(e) =>
                                          handleInvoiceFieldChange(
                                            delivery._id,
                                            invGroupIndex,
                                            invIndex,
                                            "gross_weight",
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      inv.gross_weight
                                    )}
                                  </TableCell>
                                  <TableCell align="center" sx={{ padding: '2px 7px' }}>
                                    {isEditingInv ? (
                                      <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        value={inv.net_weight}
                                        onChange={(e) =>
                                          handleInvoiceFieldChange(
                                            delivery._id,
                                            invGroupIndex,
                                            invIndex,
                                            "net_weight",
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      inv.net_weight
                                    )}
                                  </TableCell>
                                  {!isTechnova && <TableCell align="center" sx={{ padding: '2px 7px' }}>
                                    {isEditingInv ? (
                                      <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        value={inv.considered_weight}
                                        onChange={(e) =>
                                          handleInvoiceFieldChange(
                                            delivery._id,
                                            invGroupIndex,
                                            invIndex,
                                            "considered_weight",
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      inv.considered_weight
                                    )}
                                  </TableCell>}
                                  <TableCell align="center" sx={{ padding: '2px 7px' }}>
                                    {isEditingInv ? (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                        }}
                                      >
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              size="small"
                                              checked={!!inv.full_checked}
                                              onChange={(e) =>
                                                handleInvoiceCheckboxChange(
                                                  delivery._id,
                                                  invGroupIndex,
                                                  invIndex,
                                                  "full_checked"
                                                )
                                              }
                                            />
                                          }
                                          label="Full"
                                        />
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              size="small"
                                              checked={!!inv.missing_checked}
                                              onChange={(e) =>
                                                handleInvoiceCheckboxChange(
                                                  delivery._id,
                                                  invGroupIndex,
                                                  invIndex,
                                                  "missing_checked"
                                                )
                                              }
                                              disabled={!isEditingInv || inv.full_checked}
                                            />
                                          }
                                          label="Short"
                                        />
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              size="small"
                                              checked={!!inv.damaged_checked}
                                              onChange={(e) =>
                                                handleInvoiceCheckboxChange(
                                                  delivery._id,
                                                  invGroupIndex,
                                                  invIndex,
                                                  "damaged_checked"
                                                )
                                              }
                                              disabled={!isEditingInv || inv.full_checked}
                                            />
                                          }
                                          label="Damaged"
                                        />
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              size="small"
                                              checked={!!inv.clotted_checked}
                                              onChange={(e) =>
                                                handleInvoiceCheckboxChange(
                                                  delivery._id,
                                                  invGroupIndex,
                                                  invIndex,
                                                  "clotted_checked"
                                                )
                                              }
                                              disabled={!isEditingInv || inv.full_checked}
                                            />
                                          }
                                          label="Clotted"
                                        />
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              size="small"
                                              checked={!!inv.rejected_checked}
                                              onChange={(e) =>
                                                handleInvoiceCheckboxChange(
                                                  delivery._id,
                                                  invGroupIndex,
                                                  invIndex,
                                                  "rejected_checked"
                                                )
                                              }
                                              disabled={!isEditingInv || inv.full_checked}
                                            />
                                          }
                                          label="Rejected"
                                        />
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              size="small"
                                              checked={!!inv.carton_damage_checked}
                                              onChange={(e) =>
                                                handleInvoiceCheckboxChange(
                                                  delivery._id,
                                                  invGroupIndex,
                                                  invIndex,
                                                  "carton_damage_checked"
                                                )
                                              }
                                              disabled={!isEditingInv || inv.full_checked}
                                            />
                                          }
                                          label="Carton Damage"
                                        />
                                      </Box>
                                    ) : (
                                      <Typography variant="body2" sx={{ 
                                        fontStyle: isDefaultStatus ? 'italic' : 'normal',
                                        color: isDefaultStatus ? 'text.secondary' : 'text.primary'
                                      }}>{statusText}</Typography>
                                    )}
                                  </TableCell>
                                  <TableCell align="center" sx={{ padding: '2px 7px' }}>
                                    {isEditingInv ? (
                                      <TextField
                                        multiline
                                        rows={2}
                                        fullWidth
                                        size="small"
                                        
                                        value={inv.comments || ''}
                                        onChange={(e) =>
                                          handleInvoiceFieldChange(
                                            delivery._id,
                                            invGroupIndex,
                                            invIndex,
                                            "comments",
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{inv.comments || 'N/A'}</Typography>
                                    )}
                                  </TableCell>
                                  {isEditingInv && (
                                    <TableCell align="center" sx={{ padding: '2px 7px' }}>
                                      <Box sx={{ display: "flex" }}>
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleSaveInvoices(
                                              delivery._id,
                                              invoiceGroup
                                            )
                                          }
                                          disabled={isSaving[invoiceGroup._id]}
                                        >
                                          {isSaving[invoiceGroup._id] ? (
                                            <CircularProgress size={16} />
                                          ) : (
                                            <SaveIcon
                                              color="primary"
                                              fontSize="small"
                                            />
                                          )}
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleEditToggle(
                                              delivery._id,
                                              "invoices",
                                              invoiceGroup._id
                                            )
                                          }
                                          disabled={isSaving[invoiceGroup._id]}
                                        >
                                          <CancelIcon
                                            color="error"
                                            fontSize="small"
                                          />
                                        </IconButton>
                                      </Box>
                                    </TableCell>
                                  )}
                                </TableRow>
                              </React.Fragment>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  </Box>
                )
              )
            ) : (
              <Typography
                color="text.secondary"
                sx={{ my: 2, textAlign: "center" }}
              >
                No Commercial Invoices found for this delivery.
              </Typography>
            )}

            <Grid
              container
              spacing={2}
              sx={{
                mt: 1,
                ml: "0px",
                border: "1px solid #E0E0E0",
                width: "100%",
              }}
            >
              <Grid
                item
                xs={12}
                md={6}
                sx={{ padding: "16px", borderRight: "1px solid  #E0E0E0" }}
              >
                <Box className={styles.sectionHeader}>
                  <Typography variant="subtitle2">
                    Damaged/Rejected/Missing Pictures
                  </Typography>
                  {canEditAny && !isCurrentlyEditingDocs && (
                    <IconButton
                      size="small"
                      onClick={() => handleEditToggle(delivery._id, "docs")}
                    ></IconButton>
                  )}
                </Box>
                <Box className={styles.galleryBox}>
                  {delivery.goods_pics && delivery.goods_pics.length > 0 ? (
                    delivery.goods_pics.map((pic: string, idx: number) => (
                      <SimpleDocViewer key={idx} assetUrl={pic} />
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      No Pictures found
                    </Typography>
                  )}
                </Box>
                {isCurrentlyEditingDocs && (
                  <button
                    className={styles.uploading_picture_button}
                    onClick={() => handleUploadClick(delivery._id, "goods")}
                  >
                    Upload Picture
                  </button>
                )}
              </Grid>
              <Grid item xs={12} md={6} style={{ padding: "16px" }}>
              <Box style={{ fontFamily: 'Muli, sans-serif' }}>
                <Box style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '5px'
                }}>
                  <Typography variant="subtitle2" >
                    EPODs
                  </Typography>
                  
                </Box>
                <Box style={{
                  border: '2px dashed #e0e0e0',
                  minHeight: '45px',
                  marginBottom: '5px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  padding: '5px',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  {delivery.epods && delivery.epods.length > 0 ? (
                    delivery.epods.map((epod: any, idx: number) => (
                      <SimpleDocViewer key={idx} assetUrl={epod.link} />
                    ))
                  ) : (
                    <Typography color="text.secondary" style={{ marginTop: '10px' }}>
                      No EPODs found
                    </Typography>
                  )}
                </Box>
                {isCurrentlyEditingDocs && (
                  <button
                    style={{
                      backgroundColor: '#2962FF',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 15px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginTop: '10px'
                    }}
                    onClick={() => handleUploadClick(delivery._id, "epod")}
                  >
                    Upload EPOD
                  </button>
                )}
              </Box>
              </Grid>
            </Grid>
            {isCurrentlyEditingDocs && (
              <Box sx={{ textAlign: "right", mt: 2 }}>
                <button
                  className={styles.done_button}
                  onClick={() => handleEditToggle(delivery._id, "docs")}
                >
                  Done
                </button>
              </Box>
            )}

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
                  {delivery.all_docs && delivery.all_docs.length > 0 ? (
                    delivery.all_docs.map((doc: string, idx: number) => (
                      <SimpleDocViewer key={idx} assetUrl={doc} />
                    ))
                  ) : (
                    <Typography
                      sx={{ textAlign: "center" }}
                      color="textSecondary"
                    >
                      No Documents Found
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6} sx={{ padding: "16px" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Signature
                </Typography>
                <Box className={styles.galleryBox}>
                  {delivery.signature ? (
                    <img
                      src={delivery.signature}
                      alt="Signature"
                      className={styles.signatureImage}
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
            <input
              type="file"
              ref={(el) => {
                fileInputRef.current[`${delivery._id}-epod`] = el;
              }}
              style={{ display: "none" }}
              onChange={(e) => handleFileChange(e, delivery._id, "epod")}
            />
            <input
              type="file"
              ref={(el) => {
                fileInputRef.current[`${delivery._id}-goods`] = el;
              }}
              style={{ display: "none" }}
              onChange={(e) => handleFileChange(e, delivery._id, "goods")}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default DeliveryTab;