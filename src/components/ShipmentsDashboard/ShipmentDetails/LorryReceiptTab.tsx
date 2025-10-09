// components/ShipmentsDashboard/ShipmentDetails/LorryReceiptTab.tsx
"use client";

import React, { useState, useMemo } from "react";
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
import { UserRoles } from "@/hooks/useUserRoles";

interface LocationInfo {
  loc_name?: string;
  area?: string;
  seq?: number;
}

interface CombinedLorryReceipt {
  _id: string;
  type: "Shipper" | "Carrier" | "Technova";
  lrNumber: string;
  pick_info?: LocationInfo;
  delivery_info?: LocationInfo;
  consignor_copy?: string;
  consignee_copy?: string;
  driver_copy?: string;
  file_copy?: string;
  pdf_link?: string;
  [key: string]: any; // Allow other properties from spread
}

const LorryReceiptTab = ({
  shipmentData,
  onDataChange,
  userRoles,
  ownFleet,
  isTechnova,
}: {
  shipmentData: any;
  onDataChange: () => void;
  userRoles: UserRoles;
  ownFleet: boolean;
  isTechnova: boolean; // Explicitly passed as a prop
}) => {
  const [editingLrId, setEditingLrId] = useState<string | null>(null);
  const [newLrValue, setNewLrValue] = useState("");
  const { showMessage } = useSnackbar();

  const groupedLorryReceipts = useMemo(() => {
    const combined: CombinedLorryReceipt[] = [];

    // Process Carrier Waybills (CWB)
    // Angular logic: Sets type to 'Carrier' for carrier_waybills
    (shipmentData?.carrier_waybills || []).forEach((lr: any) => {
      combined.push({
        ...lr,
        type: "Carrier", // This should be "Carrier" to match Angular
        lrNumber: lr.CWB?.manual || lr.CWB?.custom || lr.CWB?.default || "N/A",
        pick_info: lr.pick_info,
        delivery_info: lr.delivery_info,
      });
    });

    // Process 4PL Waybills (FWB)
    // Angular logic: Sets type to '4PL' for fourPL_waybills
    (shipmentData?.fourPL_waybills || []).forEach((lr: any) => {
      combined.push({
        ...lr,
        type: "4PL", // This should be "4PL" to match Angular
        lrNumber: lr.FWB?.manual || lr.FWB?.custom || lr.FWB?.default || "N/A",
        pick_info: lr.pick_info,
        delivery_info: lr.delivery_info,
      });
    });

    // Process Technova's LRs (lrs)
    // Angular logic: Sets type to 'Technova' for Technova LRs
    (shipmentData?.lrs || []).forEach((lr: any) => {
      combined.push({
        ...lr,
        type: "Technova",
        lrNumber: lr.no || "N/A",
        pick_info: {
          loc_name: lr.pickup?.location?.name,
          area: lr.pickup?.location?.area,
          seq: lr.pickup?.sequence,
        },
        delivery_info: {
          loc_name: lr.delivery?.location?.name,
          area: lr.delivery?.location?.area,
          seq: lr.delivery?.sequence,
        },
        technova: lr.technova,
      });
    });

    const grouped = combined.reduce((acc, lr) => {
      const pickSeq = lr.pick_info?.seq || 'N/A';
      const delSeq = lr.delivery_info?.seq || 'N/A';
      const key = `P${pickSeq}-D${delSeq}`;

      if (!acc[key]) {
        acc[key] = {
          pick_info: lr.pick_info,
          delivery_info: lr.delivery_info,
          receipts: new Map(),
        };
      }
      // Use lrNumber as the key to prevent duplicates
      if (!acc[key].receipts.has(lr.lrNumber)) {
        acc[key].receipts.set(lr.lrNumber, lr);
      }
      return acc;
    }, {} as Record<string, { pick_info?: LocationInfo; delivery_info?: LocationInfo; receipts: Map<string, CombinedLorryReceipt> }>);

    return Object.values(grouped).map(group => ({
      ...group,
      receipts: Array.from(group.receipts.values()),
    }));
  }, [shipmentData]);

  const canEditLr = useMemo(() => {
    return (
      shipmentData.status !== "Completed" &&
      shipmentData.status !== "Cancelled" &&
      ownFleet &&
      shipmentData.shipmentType !== "4pl" &&
      (userRoles.owner || userRoles.fleet_admin)
    );
  }, [shipmentData, ownFleet, userRoles]);

  const handleEditStart = (lr: any) => {
    setEditingLrId(lr._id);
    const currentNumber =
      lr.CWB?.manual ||
      lr.CWB?.custom ||
      lr.CWB?.default ||
      lr.FWB?.manual ||
      lr.FWB?.custom ||
      lr.FWB?.default ||
      (lr.type === "Technova" && lr.lrNumber !== "N/A" ? lr.lrNumber : "") ||
      "";
    setNewLrValue(currentNumber);
  };

  const handleEditCancel = () => {
    setEditingLrId(null);
    setNewLrValue("");
  };

  const handleSaveLr = async (lr: any) => {
    const isCWB = !!lr.CWB;
    const isTechnovaLr = lr.type === "Technova";
    
    let endpoint = "";
    let payload = {};

    if (isTechnovaLr) {
      showMessage("Technova LRs cannot be edited.", "warning");
      handleEditCancel();
      return;
    } else if (isCWB) {
      endpoint = "shipment/update_shipper_waybill";
      payload = { CWB_id: lr._id, CWB_no: newLrValue };
    } else { // FWB
      endpoint = "shipment/update_waybill";
      payload = { FWB_id: lr._id, FWB_no: newLrValue };
    }

    try {
      await httpsPost(endpoint, payload);
      showMessage("Lorry Receipt updated successfully!", "success");
      onDataChange();
      handleEditCancel();
    } catch (error: any) {
      showMessage(error.message || "Failed to update Lorry Receipt.", "error");
    }
  };

  if (!groupedLorryReceipts || groupedLorryReceipts.length === 0) {
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
          {groupedLorryReceipts.map((group, index) => {
            return (
              <TableRow key={index}>
                <TableCell sx={{ borderRight: "1px solid rgba(224, 224, 224, 1)" }}>
                  <Typography variant="body2">
                    <span className={styles.pickupIcon}>P{group.pick_info?.seq}</span> {group.pick_info?.loc_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {group.pick_info?.area}
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid rgba(224, 224, 224, 1)" }}>
                  <Typography variant="body2">
                    <span className={styles.deliveryIcon}>D{group.delivery_info?.seq}</span> {" "}
                    {group.delivery_info?.loc_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {group.delivery_info?.area}
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid rgba(224, 224, 224, 1)", textAlign: "center", verticalAlign: 'top', paddingTop: '16px' }}>
                  {/* Show unique types only */}
                  {[...new Set(group.receipts.map(lr => lr.type))].join(', ')}
                </TableCell>
                <TableCell sx={{ textAlign: "center", verticalAlign: 'top', paddingTop: '16px' }}>
                  <Box>
                    {editingLrId && group.receipts.some(lr => lr._id === editingLrId) ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: 'center' }}>
                        <TextField
                          size="small"
                          variant="outlined"
                          value={newLrValue}
                          onChange={(e) => setNewLrValue(e.target.value)}
                        />
                        <IconButton color="primary" size="small" onClick={() => handleSaveLr(group.receipts.find(lr => lr._id === editingLrId))}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton size="small" onClick={handleEditCancel}>
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {group.receipts.map(lr => lr.lrNumber).join(', ')}
                        </Typography>
                        {canEditLr && group.receipts.length === 1 && group.receipts[0].type !== "Technova" && (
                          <IconButton size="small" onClick={() => handleEditStart(group.receipts[0])}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    )}
                    <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5, alignItems: 'center' }}>
                      {group.receipts.flatMap(lr => [
                        lr.consignor_copy && (
                          <Link key={`${lr._id}-consignor`} href={lr.consignor_copy} target="_blank" rel="noopener" variant="caption">
                            Download Consignor Copy ({lr.lrNumber})
                          </Link>
                        ),
                        lr.consignee_copy && (
                          <Link key={`${lr._id}-consignee`} href={lr.consignee_copy} target="_blank" rel="noopener" variant="caption">
                            Download Consignee Copy ({lr.lrNumber})
                          </Link>
                        ),
                        lr.driver_copy && (
                          <Link key={`${lr._id}-driver`} href={lr.driver_copy} target="_blank" rel="noopener" variant="caption">
                            Download Driver Copy ({lr.lrNumber})
                          </Link>
                        ),
                        lr.file_copy && (
                          <Link key={`${lr._id}-file`} href={lr.file_copy} target="_blank" rel="noopener" variant="caption">
                            Download File Copy ({lr.lrNumber})
                          </Link>
                        ),
                        lr.pdf_link && (
                          <Link key={`${lr._id}-extra`} href={lr.pdf_link} target="_blank" rel="noopener" variant="caption">
                            Download Extra ({lr.lrNumber})
                          </Link>
                        ),
                      ].filter(Boolean))}
                    </Box>
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