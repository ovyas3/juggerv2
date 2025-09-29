// components/ShipmentsDashboard/ShipmentDetails/CarrierInvoiceTab.tsx
"use client";

import React, { useState, useRef } from "react";
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
  Button,
  Chip,
  Link,
  Tooltip,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from "@/utils/Communication";
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
  const [modalState, setModalState] = useState<ActionModalState>({
    open: false,
    type: null,
    title: "",
    text: "",
    isDisapprove: false,
    reasons: ["Rate Issue", "Incorrect Charges", "POD not clear", "Other"],
  });
  const [comments, setComments] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);

  const invoices: CarrierInvoice[] = (shipmentData?.carrier_invoices || []).map(
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
    setModalState({
      open: true,
      type,
      title,
      text,
      isDisapprove,
      reasons: modalState.reasons,
    });
  };

  const handleCloseModal = () => {
    setModalState({ ...modalState, open: false });
    setComments("");
    setSelectedReason("");
    setCurrentInvoiceId(null);
  };

  // --- CORRECTED: Separate, dedicated function for each API call ---

  const approveInvoice = async (comment: string) => {
    try {
      await httpsPost(
        "carrier_invoice/approve",
        { invoice_id: currentInvoiceId, comments: comment },
        1
      );
      showMessage("Invoice successfully approved.", "success");
      onDataChange();
    } catch (error: any) {
      showMessage(error.message || "Approval failed.", "error");
    } finally {
      handleCloseModal();
    }
  };

  const disapproveInvoice = async (comment: string) => {
    if (!comment) {
      showMessage(
        "A reason or comment is required for disapproval.",
        "warning"
      );
      return;
    }
    try {
      await httpsPost(
        "carrier_invoice/disapprove",
        { invoice_id: currentInvoiceId, comments: comment },
        1
      );
      showMessage("Invoice successfully disapproved.", "success");
      onDataChange();
    } catch (error: any) {
      showMessage(error.message || "Disapproval failed.", "error");
    } finally {
      handleCloseModal();
    }
  };

  const logisticsApproveInvoice = async (comment: string) => {
    try {
      await httpsPost(
        "carrier_invoice/logi_approve",
        { invoice_id: currentInvoiceId, comments: comment },
        1
      );
      showMessage("Invoice approved by Logistics.", "success");
      onDataChange();
    } catch (error: any) {
      showMessage(error.message || "Logistics approval failed.", "error");
    } finally {
      handleCloseModal();
    }
  };

  const logisticsDisapproveInvoice = async (comment: string) => {
    if (!comment) {
      showMessage(
        "A reason or comment is required for disapproval.",
        "warning"
      );
      return;
    }
    try {
      await httpsPost(
        "carrier_invoice/logi_disapprove",
        { invoice_id: currentInvoiceId, comments: comment },
        1
      );
      showMessage("Invoice disapproved by Logistics.", "success");
      onDataChange();
    } catch (error: any) {
      showMessage(error.message || "Logistics disapproval failed.", "error");
    } finally {
      handleCloseModal();
    }
  };

  // This function now acts as a router to the correct handler
  const handleSubmitModal = () => {
    const finalComment = selectedReason === "Other" ? comments : selectedReason;
    switch (modalState.type) {
      case "approve":
        approveInvoice(finalComment);
        break;
      case "disapprove":
        disapproveInvoice(finalComment);
        break;
      case "logi_approve":
        logisticsApproveInvoice(finalComment);
        break;
      case "logi_disapprove":
        logisticsDisapproveInvoice(finalComment);
        break;
      default:
        handleCloseModal();
    }
  };

  const handleCreateDebitNote = (invoiceId: string) =>
    showMessage(`Action: Create Debit Note for ${invoiceId}`, "info");

  if (invoices.length === 0) {
    return (
      <Typography sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        No Carrier Invoices found.
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
                  {invoice.status === "PENDING" &&
                    (logisticsApproval ? (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
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
                          color="error"
                          size="small"
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
                    ) : (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() =>
                            handleOpenModal(
                              "approve",
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
                          color="error"
                          size="small"
                          onClick={() =>
                            handleOpenModal(
                              "disapprove",
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
                    ))}
                  {invoice.status === "DISAPPROVED" && (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Button variant="contained" size="small">
                        Upload Doc
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleCreateDebitNote(invoice.id)}
                      >
                        Debit Note
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
                  {modalState.reasons.map((r) => (
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
