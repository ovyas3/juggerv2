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
import styles from "./DeliveryTab.module.css";
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

const formatForInput = (dateString: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
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

const DeliveryTab = ({
  shipmentData,
  onDataChange,
  userRoles,
  isShipmentManagement,
  ownFleet,
}: {
  shipmentData: any;
  onDataChange: () => void;
  userRoles: UserRoles;
  isShipmentManagement: boolean;
  ownFleet: boolean;
}) => {
  const [isEditingTimestamps, setIsEditingTimestamps] = useState<
    Record<string, boolean>
  >({});
  const [isEditingInvoices, setIsEditingInvoices] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [isEditingDocs, setIsEditingDocs] = useState<Record<string, boolean>>(
    {}
  );

  const [editableTimestamps, setEditableTimestamps] = useState<
    Record<string, any>
  >({});
  const [editableInvoices, setEditableInvoices] = useState<Record<string, any>>(
    {}
  );
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<Record<string, HTMLInputElement | null>>({});
  const { showMessage } = useSnackbar();

  // Re-initialize editable state when data changes to avoid stale state
  useEffect(() => {
    if (shipmentData?.deliveries) {
      const initialInvoices: Record<string, any> = {};
      shipmentData.deliveries.forEach((delivery: any) => {
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
      section === "timestamps" ? setIsEditingTimestamps : setIsEditingDocs;
    setSectionEditing((prev) => {
      const isCurrentlyEditing = !!prev[deliveryId];
      if (!isCurrentlyEditing && section === "timestamps") {
        const delivery = shipmentData.deliveries.find(
          (d: any) => d._id === deliveryId
        );
        setEditableTimestamps((prevTimes) => ({
          ...prevTimes,
          [deliveryId]: {
            arrived_at: delivery.arrived_at || "",
            unloading_start: delivery.driver_act_unloading_time?.start || "",
            unloading_end: delivery.driver_act_unloading_time?.end || "",
            finished_at: delivery.finished_at || "",
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
      [deliveryId]: { ...prev[deliveryId], [field]: value ? value.toISOString() : "" },
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
        `shipment/update_delivery/${deliveryId}`,
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

      invoice[field] = !invoice[field]; // Toggle the value

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

  const labelStyle = {
    width: '150px', // Fixed width for the label. Adjust as needed.
    flexShrink: 0,
    color: 'text.secondary',
  };
  
  const valueStyle = {
    // fontWeight: 'bold',
  };

  const handleSaveInvoices = async (
    deliveryId: string,
    invoiceId: string,
    invoiceGroupIndex: number,
    invoiceIndex: number
  ) => {
    const invoiceToSave =
      editableInvoices[deliveryId][invoiceGroupIndex].invoice[invoiceIndex];
    const payload = {
      commercial_invoice: {
        comments: invoiceToSave.comments || "",
        status: Object.entries(invoiceToSave)
          .filter(([key, value]) => key.endsWith("_checked") && value)
          .map(([key]) => key.replace("_checked", "").toUpperCase()),
        num: invoiceToSave.num,
        // Add invoice_products logic here if needed
      },
    };

    setIsSaving((prev) => ({ ...prev, [invoiceId]: true }));
    try {
      await httpsPut(`shipment/update_invoice/${invoiceId}`, payload);
      showMessage("Invoice details updated successfully!", "success");
      handleEditToggle(deliveryId, "invoices", invoiceId);
      onDataChange();
    } catch (error: any) {
      showMessage(error.message || "Failed to save invoice details.", "error");
    } finally {
      setIsSaving((prev) => ({ ...prev, [invoiceId]: false }));
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
      await httpsPost("shipment/approveEpod", payload);
      showMessage(
        `EPODs ${approve ? "approved" : "disapproved"} successfully!`,
        "success"
      );
      onDataChange();
    } catch (error: any) {
      showMessage(error.message || "Failed to update EPOD status.", "error");
    }
  };

  if (!shipmentData || !shipmentData.deliveries?.length) {
    return (
      <Typography sx={{ p: 3, textAlign: "center" }}>
        No delivery information available.
      </Typography>
    );
  }

  return (
    <Box>
      {shipmentData.deliveries.map((delivery: any, index: number) => {
        const isEditing = isEditingTimestamps[delivery._id];
        const isEditingDcs = isEditingDocs[delivery._id];
        const currentTimestampData = editableTimestamps[delivery._id] || {};
        const currentInvoiceData =
          editableInvoices[delivery._id] || delivery.invoices;

        const showEpodButtons = !ownFleet && delivery.epods?.length > 0;
        const canApprove = showEpodButtons && delivery.epod_approved !== true;
        const canDisapprove =
          showEpodButtons && delivery.epod_approved !== false;

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
                <Typography variant="body2" sx = {{paddingLeft: '40px'}}>
                  Delivery Date and Time:{" "}
                  <strong>{formatDateTime(delivery.scheduled_at)}</strong>
                </Typography>
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

                          {/* Icons are positioned on the right side of the header cell */}
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
                                        color="primary"
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
                                // <IconButton
                                //     size="small"
                                //     aria-label="edit delivery date and time"
                                //     onClick={() =>
                                //       handleEditToggle(
                                //         delivery._id, 'timestamps'
                                //       )
                                //     }
                                //     sx={{
                                //       position: 'absolute',
                                //       right: 8,
                                //       top: '50%',
                                //       transform: 'translateY(-50%)',
                                //     }}>
                                //     <Image
                                //       src={EditPencilIcon}
                                //       alt="Edit Timestamps"
                                //       width={20}
                                //       height={20}
                                //     />
                                //   </IconButton>
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
                            // EDIT MODE: Using TextFields
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
                                value={currentTimestampData.arrived_at ? new Date(currentTimestampData.arrived_at) : null}
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
                                value={currentTimestampData.unloading_start ? new Date(currentTimestampData.unloading_start) : null}
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
                                value={currentTimestampData.unloading_end ? new Date(currentTimestampData.unloading_end) : null}
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
                                value={currentTimestampData.finished_at ? new Date(currentTimestampData.finished_at) : null}
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
                            // VIEW MODE: Using Typography
                            <>
                              <Box sx={{ display: "flex", alignItems: "flex-start"}}>
                                <Typography variant="body2" sx={labelStyle}>
                                  Arrival
                                </Typography>
                                <Typography variant="body2" sx={valueStyle}>
                                  {delivery.arrived_at
                                    ? formatDateTime(delivery.arrived_at)
                                    : ": N/A"}
                                </Typography>
                              </Box>
                        
                              <Box sx={{ display: "flex", alignItems: "flex-start"}}>
                                <Typography variant="body2" sx={labelStyle}>
                                  Unloading Start
                                </Typography>
                                <Typography variant="body2" sx={valueStyle}>
                                  {delivery.driver_act_unloading_time?.start ? formatDateTime(delivery.driver_act_unloading_time.start) : ": N/A"}
                                </Typography>
                              </Box>

                               <Box sx={{ display: "flex", alignItems: "flex-start"}}>
                                <Typography variant="body2" sx={labelStyle}>
                                Unloading Complete
                                </Typography>
                                <Typography variant="body2" sx={valueStyle}>
                                  {delivery.driver_act_unloading_time?.end ? formatDateTime(delivery.driver_act_unloading_time.end) : ": N/A"}
                                </Typography>
                              </Box>

                               <Box sx={{ display: "flex", alignItems: "flex-start"}}>
                                <Typography variant="body2" sx={labelStyle}>
                                Delivered
                                </Typography>
                                <Typography variant="body2" sx={valueStyle}>
                                  {delivery.finished_at
                                    ? formatDateTime(delivery.finished_at)
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
            {/* Section Header with only the title
              <Box className={styles.sectionHeader}>
                  <Typography variant="subtitle1">Commercial Invoice Details</Typography>
              </Box> */}

            {currentInvoiceData && currentInvoiceData.length > 0 ? (
              currentInvoiceData.map(
                (invoiceGroup: any, invGroupIndex: number) => (
                  <Box key={invGroupIndex} className={styles.invoiceGroup}>
                    <Typography variant="caption">
                      From Pickup Point {invoiceGroup.p_label}
                    </Typography>
                    {(invoiceGroup.invoice || []).map(
                      (inv: any, invIndex: number) => {
                        const isEditingInv =
                          !!isEditingInvoices[delivery._id]?.[inv._id];
                        return (
                          <Paper
                            key={inv._id || invIndex}
                            variant="outlined"
                            sx={{ p: 2, mb: 1 }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={3}>
                                  <Typography variant="body2">
                                    <strong>Invoice:</strong> {inv.num}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                  <Typography variant="body2">
                                    <strong>Value:</strong> {inv.value}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                  <Typography variant="body2">
                                    <strong>Packages:</strong> {inv.nop}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                  <Typography variant="body2">
                                    <strong>Gross Wt:</strong>{" "}
                                    {inv.gross_weight}
                                  </Typography>
                                </Grid>
                              </Grid>
                              {canEditAny &&
                                !shipmentData.carrier_invoices?.length &&
                                (isEditingInv ? (
                                  <Box>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleSaveInvoices(
                                          delivery._id,
                                          inv._id,
                                          invGroupIndex,
                                          invIndex
                                        )
                                      }
                                      disabled={isSaving[inv._id]}
                                    >
                                      {isSaving[inv._id] ? (
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
                                          inv._id
                                        )
                                      }
                                    >
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                ) : (
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleEditToggle(
                                        delivery._id,
                                        "invoices",
                                        inv._id
                                      )
                                    }
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                ))}
                            </Box>

                            <Box className={styles.packageStatus}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500, mr: 2 }}
                              >
                                Package Status:
                              </Typography>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={!!inv.full_checked}
                                    disabled={!isEditingInv}
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
                                    disabled={!isEditingInv || inv.full_checked}
                                    onChange={(e) =>
                                      handleInvoiceCheckboxChange(
                                        delivery._id,
                                        invGroupIndex,
                                        invIndex,
                                        "missing_checked"
                                      )
                                    }
                                  />
                                }
                                label="Short"
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={!!inv.damaged_checked}
                                    disabled={!isEditingInv || inv.full_checked}
                                    onChange={(e) =>
                                      handleInvoiceCheckboxChange(
                                        delivery._id,
                                        invGroupIndex,
                                        invIndex,
                                        "damaged_checked"
                                      )
                                    }
                                  />
                                }
                                label="Damaged"
                              />
                            </Box>
                          </Paper>
                        );
                      }
                    )}
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
                  {canEditAny && !isEditingDcs && (
                    <IconButton
                      size="small"
                      onClick={() => handleEditToggle(delivery._id, "docs")}
                    >
                      {/* <EditIcon sx={{ width: "20px", height: "20px" }} /> */}
                    </IconButton>
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
                {isEditingDcs && (
                  <button
                    className={styles.uploading_picture_button}
                    onClick={() => handleUploadClick(delivery._id, "goods")}
                  >
                    Upload Picture
                  </button>
                )}
              </Grid>
              <Grid item xs={12} md={6} sx={{ padding: "16px" }}>
                <Box className={styles.sectionHeader}>
                  <Typography variant="subtitle2">EPODs</Typography>
                  {delivery.epod_approved === true && (
                    <Typography
                      variant="caption"
                      color="green"
                      sx={{ fontWeight: "bold" }}
                    >
                      EPOD Approved
                    </Typography>
                  )}
                  {delivery.epod_approved === false &&
                    delivery.epods?.length > 0 && (
                      <Tooltip title={delivery.reject_reason?.join(", ")}>
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ fontWeight: "bold" }}
                        >
                          EPOD Disapproved
                        </Typography>
                      </Tooltip>
                    )}
                  {canEditAny && !isEditingDcs && (
                    <IconButton
                      sx = {{padding : "0px"}}
                      size="small"
                      onClick={() => handleEditToggle(delivery._id, "docs")}
                    >
                      <EditIcon sx={{ width: "20px", height: "20px" }} />
                    </IconButton>
                  )}
                </Box>
                <Box className={styles.galleryBox}>
                  {delivery.epods && delivery.epods.length > 0 ? (
                    delivery.epods.map((epod: any, idx: number) => (
                      <SimpleDocViewer key={idx} assetUrl={epod.link} />
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      No EPODs found
                    </Typography>
                  )}
                </Box>
                {isEditingDcs && (
                  <button
                    className={styles.uploading_epod_button}
                    onClick={() => handleUploadClick(delivery._id, "epod")}
                  >
                    Upload EPOD
                  </button>
                )}
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  {canApprove && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() =>
                        handleApproveDisapproveEPOD(delivery._id, true)
                      }
                    >
                      Approve
                    </Button>
                  )}
                  {canDisapprove && (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() =>
                        handleApproveDisapproveEPOD(delivery._id, false)
                      }
                    >
                      Disapprove
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
            {isEditingDcs && (
              <Box sx={{ textAlign: "right", mt: 2 }}>
                <button
                  className={styles.done_button}
                  onClick={() => handleEditToggle(delivery._id, "docs")}
                >
                  Done
                </button>
              </Box>
            )}

            {/* --- NEWLY ADDED DOCUMENTS AND SIGNATURE SECTION --- */}
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
