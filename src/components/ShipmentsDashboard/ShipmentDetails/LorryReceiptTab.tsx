// components/ShipmentsDashboard/ShipmentDetails/LorryReceiptTab.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  TextField,
  IconButton,
} from "@mui/material";
import styles from "./PickupTab.module.css";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { httpsPost } from "@/utils/Communication";
import { useSnackbar } from "@/hooks/snackBar";
import { UserRoles } from "@/hooks/useUserRoles"; // Import UserRoles interface

const LorryReceiptTab = ({
  shipmentData,
  onDataChange,
  userRoles,
  ownFleet,
}: {
  shipmentData: any;
  onDataChange: () => void;
  userRoles: UserRoles;
  ownFleet: boolean;
}) => {
  const [editingLrId, setEditingLrId] = useState<string | null>(null);
  const [newLrValue, setNewLrValue] = useState("");
  const { showMessage } = useSnackbar();

  // This logic correctly combines all LR sources
  const lorryReceipts = [
    ...(shipmentData?.carrier_waybills || []),
    ...(shipmentData?.fourPL_waybills || []),
    ...(shipmentData?.lrs || []),
  ].map((lr) => ({ ...lr, type: lr.CWB ? "Shipper" : "Carrier" }));

  console.log("Checking Lorry Receipt Source Data:", {
    carrier_waybills: shipmentData?.carrier_waybills || "Not present or empty",
    fourPL_waybills: shipmentData?.fourPL_waybills || "Not present or empty",
    lrs: shipmentData?.lrs || "Not present or empty",
  });

  // --- NEW: Added conditional logic for editing permissions ---
  const canEditLr =
    shipmentData.status !== "Completed" &&
    shipmentData.status !== "Cancelled" &&
    ownFleet &&
    shipmentData.shipmentType !== "4pl" && // Assuming shipmentType is available in shipmentData
    (userRoles.owner || userRoles.fleet_admin);

  const handleEditStart = (lr: any) => {
    setEditingLrId(lr._id);
    const currentNumber =
      lr.CWB?.manual ||
      lr.CWB?.custom ||
      lr.CWB?.default ||
      lr.FWB?.manual ||
      lr.FWB?.custom ||
      lr.FWB?.default ||
      "";
    setNewLrValue(currentNumber);
  };

  const handleEditCancel = () => {
    setEditingLrId(null);
    setNewLrValue("");
  };

  const handleSaveLr = async (lr: any) => {
    const isCWB = !!lr.CWB;
    const endpoint = isCWB
      ? "shipment/update_shipper_waybill"
      : "shipment/update_waybill";
    const payload = isCWB
      ? { CWB_id: lr._id, CWB_no: newLrValue }
      : { FWB_id: lr._id, FWB_no: newLrValue };

    try {
      await httpsPost(endpoint, payload);
      showMessage("Lorry Receipt updated successfully!", "success");
      onDataChange();
      handleEditCancel();
    } catch (error: any) {
      showMessage(error.message || "Failed to update Lorry Receipt.", "error");
    }
  };

  if (!lorryReceipts || lorryReceipts.length === 0) {
    return (
      <Typography sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        Lorry Receipt Not Generated.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                width: "30%",
                fontWeight: "bold",
                textAlign: "center",
                borderRight: "1px solid rgba(224, 224, 224, 1)",
              }}
            >
              Pickup
            </TableCell>
            <TableCell
              sx={{
                width: "30%",
                fontWeight: "bold",
                textAlign: "center",
                borderRight: "1px solid rgba(224, 224, 224, 1)",
              }}
            >
              Delivery
            </TableCell>
            <TableCell
              sx={{
                width: "15%",
                fontWeight: "bold",
                textAlign: "center",
                borderRight: "1px solid rgba(224, 224, 224, 1)",
              }}
            >
              Provided By
            </TableCell>
            <TableCell
              sx={{
                width: "30%",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              LR Number & Downloads
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lorryReceipts.map((lr: any) => {
            const isEditing = editingLrId === lr._id;
            const lrNumber =
              lr.CWB?.manual ||
              lr.CWB?.custom ||
              lr.CWB?.default ||
              lr.FWB?.manual ||
              lr.FWB?.custom ||
              lr.FWB?.default ||
              "N/A";

            return (
              <TableRow key={lr._id}>
                <TableCell sx={{ borderRight: "1px solid rgba(224, 224, 224, 1)" }}>
                  <Typography variant="body2">
                    <span className={styles.pickupIcon}>P{lr.pick_info?.seq}</span> {lr.pick_info?.loc_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lr.pick_info?.area}
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid rgba(224, 224, 224, 1)" }}>
                  <Typography variant="body2">
                    <span className={styles.deliveryIcon}>D{lr.delivery_info?.seq}</span> {" "}
                    {lr.delivery_info?.loc_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lr.delivery_info?.area}
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid rgba(224, 224, 224, 1)", textAlign: "center" }}>{lr.type}
                </TableCell>
                <TableCell sx= {{ textAlign: "center" }}>
                  {isEditing ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1,textAlign: "center", }}>
                      <TextField
                        size="small"
                        variant="outlined"
                        value={newLrValue}
                        onChange={(e) => setNewLrValue(e.target.value)}
                      />
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleSaveLr(lr)}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton size="small" onClick={handleEditCancel}>
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 ,textAlign: "center",}}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {lrNumber}
                      </Typography>
                      {/* --- CORRECTED: Conditional rendering for edit icon --- */}
                      {canEditLr && (
                        <IconButton
                          size="small"
                          onClick={() => handleEditStart(lr)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    {lr.consignor_copy && (
                      <Link
                        href={lr.consignor_copy}
                        target="_blank"
                        rel="noopener"
                        variant="caption"
                      >
                        Download Consignor Copy
                      </Link>
                    )}
                    {lr.consignee_copy && (
                      <Link
                        href={lr.consignee_copy}
                        target="_blank"
                        rel="noopener"
                        variant="caption"
                      >
                        Download Consignee Copy
                      </Link>
                    )}
                    {lr.driver_copy && (
                      <Link
                        href={lr.driver_copy}
                        target="_blank"
                        rel="noopener"
                        variant="caption"
                      >
                        Download Driver Copy
                      </Link>
                    )}
                    {lr.file_copy && (
                      <Link
                        href={lr.file_copy}
                        target="_blank"
                        rel="noopener"
                        variant="caption"
                      >
                        Download File Copy
                      </Link>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LorryReceiptTab;
