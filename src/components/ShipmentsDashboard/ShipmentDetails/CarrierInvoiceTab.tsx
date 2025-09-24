// components/ShipmentsDashboard/ShipmentDetails/CarrierInvoiceTab.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Chip,
  Link,
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { UserRoles } from "@/hooks/useUserRoles";

// --- Interfaces ---
interface CarrierInvoice {
  id: string;
  version: number;
  invoiceNumber: string;
  datetime: string;
  updatedBy: string;
  finalAmount: number;
  status: "PENDING" | "APPROVED" | "DISAPPROVED" | "BILLED";
  comments: string;
  pdfLinks: string[];
  disapprovalDoc?: string;
  role_based: boolean;
}

interface ActionModalState {
  open: boolean;
  type: "approve" | "disapprove" | "logi_approve" | "logi_disapprove" | null;
  title: string;
  text: string;
  isDisapprove: boolean;
  reasons: string[];
}

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "1px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

// --- Main Component ---
const CarrierInvoiceTab = ({
  shipmentData,
  logisticsApproval,
  onDataChange,
  userRoles,
}: {
  shipmentData: any;
  userRoles: UserRoles;
  logisticsApproval: boolean;
  onDataChange: () => void;
}) => {
  const { showMessage } = useSnackbar();
  const [invoices, setInvoices] = useState<CarrierInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reasons, setReasons] = useState<string[]>([]);
  const [modalState, setModalState] = useState<ActionModalState>({
    open: false,
    type: null,
    title: "",
    text: "",
    isDisapprove: false,
    reasons: [],
  });
  const [comments, setComments] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);

  // This useEffect hook now fetches all three required pieces of data
  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!shipmentData?._id) return;
      setIsLoading(true);
      try {
        // Use Promise.all to hit all three endpoints concurrently
        const [invoiceResponse, reasonsResponse, gstResponse] =
          await Promise.all([
            httpsGet(
              `carrier_invoice/by_shipment?shipment_id=${shipmentData._id}`,
              6
            ),
            httpsGet("constants/get_reasons?name=invoice"),
            httpsGet(
              `carrier_invoice/check_gst?shipment_id=${shipmentData._id}`,
              6
            ),
          ]);

        // 1. Process Invoice Data
        if (invoiceResponse.data) {
          const formattedInvoices = (invoiceResponse.data || []).map(
            (inv: any, index: number) => ({
              id: inv._id,
              version: index + 1,
              invoiceNumber: inv.IINC?.custom || inv.IINC?.default || "N/A",
              datetime: new Date(inv.created_at).toLocaleString(),
              updatedBy: inv.carrier_user?.name || "N/A",
              finalAmount: inv.final_amount,
              status: inv.status,
              comments: inv.comments || "No comments",
              pdfLinks: inv.pdf_links || [inv.pdf_link].filter(Boolean),
              disapprovalDoc: inv.disapprove_doc,
              role_based: !!inv.approved_by?.logistics,
            })
          );
          setInvoices(formattedInvoices);
        }

        // 2. Process Reasons Data
        if (
          reasonsResponse.statusCode === 200 &&
          reasonsResponse.data[0]?.reason
        ) {
          const fetchedReasons = [...reasonsResponse.data[0].reason, "Other"];
          setReasons(fetchedReasons);
          setModalState((prev) => ({ ...prev, reasons: fetchedReasons }));
        }

        // 3. Process GST/Transit Type Data (optional, store if needed later)
        if (gstResponse.statusCode === 200) {
          // You can store this in state if you need to display or use it
          console.log("Transit Type:", gstResponse.data);
        }
      } catch (error: any) {
        showMessage(
          error.message || "Failed to fetch carrier invoice data.",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceData();
  }, [shipmentData._id]);

  const getStatusChip = (status: CarrierInvoice["status"]) => {
    switch (status) {
      case "APPROVED":
      case "BILLED":
        return <Chip label={status} color="success" size="small" />;
      case "PENDING":
        return <Chip label={status} color="warning" size="small" />;
      case "DISAPPROVED":
        return <Chip label={status} color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleOpenModal = (
    type: ActionModalState["type"],
    invoiceId: string,
    title: string,
    text: string,
    isDisapprove: boolean
  ) => {
    setCurrentInvoiceId(invoiceId);
    setModalState((prev) => ({
      ...prev,
      open: true,
      type,
      title,
      text,
      isDisapprove,
    }));
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, open: false }));
    setComments("");
    setSelectedReason("");
    setCurrentInvoiceId(null);
  };

  const handleSubmitModal = async () => {
    const finalComment = selectedReason === "Other" ? comments : selectedReason;
    if (modalState.isDisapprove && !finalComment) {
      showMessage(
        "A reason or comment is required for disapproval.",
        "warning"
      );
      return;
    }

    let endpoint = "";
    switch (modalState.type) {
      case "approve":
        endpoint = "carrier_invoice/approve";
        break;
      case "disapprove":
        endpoint = "carrier_invoice/disapprove";
        break;
      case "logi_approve":
        endpoint = "carrier_invoice/logi_approve";
        break;
      case "logi_disapprove":
        endpoint = "carrier_invoice/logi_disapprove";
        break;
      default:
        return;
    }

    try {
      await httpsPost(
        endpoint,
        { invoice_id: currentInvoiceId, comments: finalComment },
        1
      );
      showMessage(
        `Invoice successfully ${
          modalState.isDisapprove ? "disapproved" : "approved"
        }.`,
        "success"
      );
      onDataChange();
    } catch (error: any) {
      showMessage(
        error.message ||
          `${modalState.isDisapprove ? "Disapproval" : "Approval"} failed.`,
        "error"
      );
    } finally {
      handleCloseModal();
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (invoices.length === 0) {
    return (
      <Typography sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        No Carrier Invoices found for this shipment.
      </Typography>
    );
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Version</TableCell>
              <TableCell>Invoice</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell align="right">Final Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell>View</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.version}</TableCell>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.datetime}</TableCell>
                <TableCell>{invoice.updatedBy}</TableCell>
                <TableCell align="right">
                  {shipmentData.currency_symbol || "₹"}{" "}
                  {invoice.finalAmount.toFixed(2)}
                </TableCell>
                <TableCell>{getStatusChip(invoice.status)}</TableCell>
                <TableCell>
                  <Tooltip title={invoice.comments} placement="top">
                    <Typography
                      noWrap
                      variant="body2"
                      sx={{ maxWidth: "150px" }}
                    >
                      {invoice.comments}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {invoice.pdfLinks.map((link, index) => (
                    <Link
                      href={link}
                      target="_blank"
                      rel="noopener"
                      key={index}
                      sx={{ display: "block" }}
                    >
                      Download PDF{" "}
                      {invoice.pdfLinks.length > 1 ? index + 1 : ""}
                    </Link>
                  ))}
                </TableCell>
                <TableCell>
                  {invoice.status === "PENDING" && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() =>
                          handleOpenModal(
                            invoice.role_based ? "approve" : "logi_approve",
                            invoice.id,
                            "Approve Invoice",
                            "Are you sure?",
                            false
                          )
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() =>
                          handleOpenModal(
                            invoice.role_based
                              ? "disapprove"
                              : "logi_disapprove",
                            invoice.id,
                            "Disapprove Invoice",
                            "Please provide a reason.",
                            true
                          )
                        }
                      >
                        Disapprove
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Modal */}
      <Modal open={modalState.open} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            {modalState.title}
          </Typography>
          <Typography sx={{ mt: 2 }}>{modalState.text}</Typography>
          {modalState.isDisapprove && (
            <>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Reason</InputLabel>
                <Select
                  value={selectedReason}
                  label="Reason"
                  onChange={(e) => setSelectedReason(e.target.value)}
                >
                  {reasons.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedReason === "Other" && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Comments"
                  sx={{ mt: 2 }}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              )}
            </>
          )}
          <Box
            sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button variant="outlined" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmitModal}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default CarrierInvoiceTab;
