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
  datetime: { date: string; time: string };
  updatedBy: string;
  finalAmount: number;
  status: "PENDING" | "APPROVED" | "DISAPPROVED" | "BILLED" | "PAYMENT_PAID";
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

// --- Updated Date Formatting Function ---
const formatDateTime = (dateString?: string): { date: string; time: string } => {
  if (!dateString) return { date: "N/A", time: "" };
  try {
    const date = new Date(dateString);
    // Date format: 26 Jul
    const datePart = date.toLocaleString("en-GB", { day: "numeric", month: "short" });
    // Time format: 9:00 PM
    const timePart = date.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return { date: datePart, time: timePart };
  } catch (e) {
    return { date: "N/A", time: "" };
  }
};

// --- Main Component ---
const CarrierInvoiceTab = ({
  shipmentData,
  logisticsApproval,
  onDataChange,
  userRoles,
  obdNumber
}: {
  shipmentData: any;
  userRoles: UserRoles;
  obdNumber: number;
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

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!shipmentData?._id) return;
      setIsLoading(true);
      try {
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
              datetime: formatDateTime(inv.created_at),
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

  // --- MODIFIED getStatusChip FUNCTION ---
  const getStatusText = (status: CarrierInvoice["status"]) => {
    let color = "text.primary";
    switch (status) {
      case "APPROVED":
      case "BILLED":
        color = "success.main";
        break;
      case "PAYMENT_PAID":
        color = "success.main";
        break;
      case "PENDING":
        color = "warning.main";
        break;
      case "DISAPPROVED":
        color = "error.main";
        break;
    }
    return <Typography variant="body2" sx={{ color, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{status}</Typography>;
  };
  // ----------------------------------------

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

  // --- Styled Table Components ---
  const StyledTableCell = (props: any) => (
    <TableCell
      {...props}
      align="center" // All cells are center aligned
      sx={{ p: 1, fontSize: "0.8rem", ...props.sx }} // Reduced font size
    />
  );

  const StyledTableHeadCell = (props: any) => (
    <TableCell
      {...props}
      align="center"
      sx={{
        fontWeight: "bold",
        color: "#09337e", // Header text color
        backgroundColor: "#f5f5f5", // Light background color for header
        whiteSpace: "nowrap",
        p: 1,
        ...props.sx,
      }}
    />
  );

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
        <Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell sx={{ width: "7%" }}>Version</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "15%" }}>Carrier Invoice No.</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "10%" }}>Date & Time</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "20%" }}>Generated <br></br>By</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "10%" }}>
                Final <br></br>Amount (₹)
              </StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "10%" }}>Status</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "15%" }}>Comments</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "10%" }}>Documents</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "10%" }}>Actions</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} hover>
                <StyledTableCell>{invoice.version}</StyledTableCell>
                
                {/* DO NOT WRAP: Carrier Invoice */}
                <StyledTableCell sx={{ whiteSpace: "nowrap", textAlign: "center" }}>
                  <Tooltip title={invoice.invoiceNumber}>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {invoice.invoiceNumber}
                    </Typography>
                  </Tooltip>
                  {/* --- ADD THIS LOGIC HERE --- */}
                  {obdNumber > 0 && (
                      <Typography variant="caption" sx={{ color: '#188c06', display: 'block', mt: 0.5 }}>
                          OBD Number Available
                      </Typography>
                  )}
                  {obdNumber <= 0 && (
                      <Typography variant="caption" sx={{ color: '#E64F4F', display: 'block', mt: 0.5 }}>
                          OBD Number Not Available
                      </Typography>
                  )}
                  {/* --- END ADDED LOGIC --- */}
                </StyledTableCell>

                {/* DO NOT WRAP: Date & Time */}
                <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>{invoice.datetime.date}</Typography>
                  <Typography variant="caption" color="text.secondary">{invoice.datetime.time}</Typography>
                </StyledTableCell>

                {/* WRAP ALLOWED: Generated By */}
                <StyledTableCell sx={{ whiteSpace: "normal" }}>
                    {invoice.updatedBy}
                </StyledTableCell>
                
                <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
                  
                  {invoice.finalAmount.toFixed(2)}
                </StyledTableCell>
                
                <StyledTableCell >{getStatusText(invoice.status)}</StyledTableCell>
                
                {/* WRAP ALLOWED: Comments */}
                <StyledTableCell sx={{ whiteSpace: "normal" }}>
                  <Typography variant="body2">
                    {invoice.comments}
                  </Typography>
                </StyledTableCell>
                
                {/* WRAP ALLOWED: Documents */}
                <StyledTableCell sx={{ whiteSpace: "normal" }}>
                  {invoice.pdfLinks.length > 0 ? (
                    <Box>
                      <Tooltip title={invoice.pdfLinks[0]} placement="top">
                        <Link
                          href={invoice.pdfLinks[0]}
                          target="_blank"
                          rel="noopener"
                          sx={{ display: "block", color: "#4f46E5", textDecoration: "underline" }}
                        >
                          Document - {invoice.invoiceNumber}
                        </Link>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                        N/A
                    </Typography>
                  )}
                </StyledTableCell>

                <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
                  {invoice.status === "PENDING" && (
                    <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
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
                </StyledTableCell>
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