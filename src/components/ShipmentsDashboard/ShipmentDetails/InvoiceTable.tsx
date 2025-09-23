// components/ShipmentsDashboard/ShipmentDetails/InvoiceTable.tsx
import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  Paper,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline"; 
import styles from "./PickupTab.module.css";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CustomDateTimePicker from "@/components/UI/CustomDateTimePicker/CustomDateTimePicker";

interface InvoiceTableProps {
  groupedInvoices: any[];
  isEditing: boolean;
  editableGoodsInfoForPickup: any[];
  onInvoiceChange: (
    groupIndex: number,
    ciIndex: number,
    field: string,
    value: string
  ) => void;
  onGoodsInfoChange: (groupIndex: number, field: string, value: any) => void;
  onAddRow: (groupIndex: number) => void;
  onSave: () => void;
  onRemoveRow: (groupIndex: number, ciIndex: number) => void;
}

const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return "DD MMM YYYY, hh:mm";
  try {
    return dayjs(dateString).format("DD MMM YYYY, hh:mm");
  } catch (e) {
    return "N/A";
  }
};

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#e0e0e0" },
    "&:hover fieldset": { borderColor: "#c0c0c0" },
    "&.Mui-focused fieldset": { borderColor: "#4F46E5" },
  },
  "& .MuiInputBase-input": { padding: "8.5px 4px" }, // Reduced horizontal padding
};

// A small component to create a consistent vertical block for each invoice line
const InvoiceFieldWrapper: React.FC<{
  children: React.ReactNode;
  isLast: boolean;
}> = ({ children, isLast }) => (
  <Box
    sx={{
      minHeight: "40px",
      display: "flex",
      alignItems: "center",
      mb: isLast ? 0 : 2,
    }}
  >
    {children}
  </Box>
);

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  groupedInvoices,
  isEditing,
  editableGoodsInfoForPickup,
  onInvoiceChange,
  onGoodsInfoChange,
  onAddRow,
  onSave,
  onRemoveRow,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    invoice: any
  ) => {
    setAnchorEl(event.currentTarget);
    setCurrentInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentInvoice(null);
  };

  const hasMoreInfo =
    currentInvoice?.others?.bill_doc ||
    currentInvoice?.others?.delivery_no ||
    currentInvoice?.others?.t_code;

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      className={styles.invoiceTableContainer}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: "bold",
                minWidth: "300px",
                color: "#09337e",
                backgroundColor: "#F5F5F5",
              }}
            >
              Delivery Location
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "280px", // Increased width
                backgroundColor: "#F5F5F5",
              }}
            >
              Invoice Number
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "280px", // Increased width
                backgroundColor: "#F5F5F5",
              }}
            >
              Value (₹)
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "280px", // Reduced width
                backgroundColor: "#F5F5F5",
              }}
            >
              No. of Packages
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "280px",
                backgroundColor: "#F5F5F5",
              }}
            >
              Gross Wt.(MT)
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "280px",
                backgroundColor: "#F5F5F5",
              }}
            >
              Net Wt. (MT)
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "280px",
                backgroundColor: "#F5F5F5",
              }}
            >
              Cons. Wt.(MT)
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "280px",
                backgroundColor: "#F5F5F5",
              }}
            >
              Delivery No.
            </TableCell>
            {isEditing && (
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#09337e",
                  backgroundColor: "#F5F5F5",
                }}
              >
                Actions
              </TableCell>
            )}
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                backgroundColor: "#F5F5F5",
              }}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {groupedInvoices.map((invGroup: any, groupIndex: number) => {
            const invoicesToRender =
              (isEditing
                ? editableGoodsInfoForPickup[groupIndex]?.commercialInvoices
                : invGroup.commercial_invoices) ?? [];

            const currentGoodsInfo = isEditing
              ? editableGoodsInfoForPickup[groupIndex] || {}
              : invGroup;

            return (
              <TableRow key={invGroup.delivery_id?._id || groupIndex}>
                {/* 1. Delivery Location Cell (Renders ONCE per row) */}
                <TableCell sx={{ verticalAlign: "top" }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <span className={styles.deliveryIcon}>
                      D{groupIndex + 1}
                    </span>
                    <Box>
                      <Typography
                        variant="body1"
                        className={styles.locationName}
                        sx={{ fontWeight: 500, fontSize: "12px" }}
                      >
                        {invGroup.delivery_id?.location?.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.locationName}
                        color="text.secondary"
                        sx={{ fontSize: "12px" }}
                      >
                        {invGroup.delivery_id?.location?.area}
                      </Typography>
                    </Box>
                  </Box>
                  <TextField
                    multiline
                    rows={2}
                    fullWidth
                    variant="outlined"
                    size="small"
                    label="Comments"
                    sx={{ mt: 1, ...textFieldStyles }}
                    disabled={!isEditing}
                    value={currentGoodsInfo.comments || ""}
                    onChange={(e) =>
                      onGoodsInfoChange(groupIndex, "comments", e.target.value)
                    }
                  />
                  <Box sx={{ mt: 1 }}>
                    {isEditing ? (
                      <CustomDateTimePicker
                        label="E-waybill Expiry"
                        value={
                          currentGoodsInfo.ewaybillExpiryDateTime
                            ? new Date(currentGoodsInfo.ewaybillExpiryDateTime)
                            : null
                        }
                        onChange={(newDate: Date | null) =>
                          onGoodsInfoChange(
                            groupIndex,
                            "ewaybillExpiryDateTime",
                            newDate
                          )
                        }
                      />
                    ) : (
                      <Box sx={{ mt: 1, pl: 1 , border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                        <Typography variant="caption" color="text.secondary">
                          E-waybill Expiry
                        </Typography> 
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(currentGoodsInfo.ewaybillExpiryDateTime)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>

                {/* --- Mapped Cells (Render vertically for each invoice) --- */}

                {/* Invoice Number */}
                <TableCell sx={{ verticalAlign: "top" }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <InvoiceFieldWrapper
                      key={ci._id || `num-${ciIndex}`}
                      isLast={ciIndex === invoicesToRender.length - 1}
                    >
                      <TextField
                        size="small"
                        variant="outlined"
                        sx={{ ...textFieldStyles, width: "100%"}}
                        disabled={!isEditing}
                        value={ci.num ?? ""}
                        onChange={(e) =>
                          onInvoiceChange(
                            groupIndex,
                            ciIndex,
                            "num",
                            e.target.value
                          )
                        }
                      />
                    </InvoiceFieldWrapper>
                  ))}
                </TableCell>

                {/* Value */}
                <TableCell sx={{ verticalAlign: "top" }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <InvoiceFieldWrapper
                      key={ci._id || `val-${ciIndex}`}
                      isLast={ciIndex === invoicesToRender.length - 1}
                    >
                      <TextField
                        size="small"
                        variant="outlined"
                        sx={{ ...textFieldStyles, width: "100%" }}
                        disabled={!isEditing}
                        type="number"
                        inputProps={{ min: 0 }}
                        value={ci.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          onInvoiceChange(groupIndex, ciIndex, "value", value);
                        }}
                      />
                    </InvoiceFieldWrapper>
                  ))}
                </TableCell>

                {/* No. of Packages */}
                <TableCell sx={{ verticalAlign: "top" }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <InvoiceFieldWrapper
                      key={ci._id || `nop-${ciIndex}`}
                      isLast={ciIndex === invoicesToRender.length - 1}
                    >
                      <TextField
                        size="small"
                        variant="outlined"
                        sx={{ ...textFieldStyles, width: "100%" }}
                        disabled={!isEditing}
                        type="number"
                        inputProps={{ min: 0 }}
                        value={ci.nop ?? ""}
                        onChange={(e) =>
                          onInvoiceChange(
                            groupIndex,
                            ciIndex,
                            "nop",
                            e.target.value
                          )
                        }
                      />
                    </InvoiceFieldWrapper>
                  ))}
                </TableCell>

                {/* Gross Wt. */}
                <TableCell sx={{ verticalAlign: "top" }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <InvoiceFieldWrapper
                      key={ci._id || `gross-${ciIndex}`}
                      isLast={ciIndex === invoicesToRender.length - 1}
                    >
                      <TextField
                        size="small"
                        variant="outlined"
                        sx={{ ...textFieldStyles, width: "100%" }}
                        disabled={!isEditing}
                        type="number"
                        inputProps={{ min: 0 }}
                        value={ci.gross_weight ?? ""}
                        onChange={(e) =>
                          onInvoiceChange(
                            groupIndex,
                            ciIndex,
                            "gross_weight",
                            e.target.value
                          )
                        }
                      />
                    </InvoiceFieldWrapper>
                  ))}
                </TableCell>

                {/* Net Wt. */}
                <TableCell sx={{ verticalAlign: "top" }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <InvoiceFieldWrapper
                      key={ci._id || `net-${ciIndex}`}
                      isLast={ciIndex === invoicesToRender.length - 1}
                    >
                      <TextField
                        size="small"
                        variant="outlined"
                        sx={{ ...textFieldStyles, width: "100%" }}
                        disabled={!isEditing}
                        type="number"
                        inputProps={{ min: 0 }}
                        value={ci.net_weight ?? ""}
                        onChange={(e) =>
                          onInvoiceChange(
                            groupIndex,
                            ciIndex,
                            "net_weight",
                            e.target.value
                          )
                        }
                      />
                    </InvoiceFieldWrapper>
                  ))}
                </TableCell>

                {/* Cons. Wt. */}
                <TableCell sx={{ verticalAlign: "top" }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <InvoiceFieldWrapper
                      key={ci._id || `cons-${ciIndex}`}
                      isLast={ciIndex === invoicesToRender.length - 1}
                    >
                      <TextField
                        size="small"
                        variant="outlined"
                        sx={{ ...textFieldStyles, width: "100%" }}
                        disabled={!isEditing}
                        type="number"
                        inputProps={{ min: 0 }}
                        value={ci.considered_weight ?? ""}
                        onChange={(e) =>
                          onInvoiceChange(
                            groupIndex,
                            ciIndex,
                            "considered_weight",
                            e.target.value
                          )
                        }
                      />
                    </InvoiceFieldWrapper>
                  ))}
                </TableCell>

                {/* Delivery No. */}
                <TableCell sx={{ verticalAlign: "top" }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <InvoiceFieldWrapper
                      key={ci._id || `del-${ciIndex}`}
                      isLast={ciIndex === invoicesToRender.length - 1}
                    >
                      <TextField
                        size="small"
                        variant="outlined"
                        sx={{ ...textFieldStyles, width: "100%" }}
                        disabled={!isEditing}
                        value={ci.others?.delivery_no || "-"}
                        onChange={(e) =>
                          onInvoiceChange(
                            groupIndex,
                            ciIndex,
                            "delivery_no",
                            e.target.value
                          )
                        }
                      />
                    </InvoiceFieldWrapper>
                  ))}
                </TableCell>

                {/* Actions */}
                {isEditing && (
                  <TableCell sx={{ verticalAlign: "top" }}>
                    {invoicesToRender.map((ci: any, ciIndex: number) => (
                      <InvoiceFieldWrapper
                        key={ci._id || `act-${ciIndex}`}
                        isLast={ciIndex === invoicesToRender.length - 1}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            size="small"
                            onClick={() => onRemoveRow(groupIndex, ciIndex)}
                            disabled={invoicesToRender.length <= 1}
                          >
                            <RemoveCircleOutlineIcon
                              color={
                                invoicesToRender.length <= 1
                                  ? "disabled"
                                  : "error"
                              }
                            />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => onAddRow(groupIndex)}
                          >
                            <AddCircleOutlineIcon color="primary" />
                          </IconButton>
                        </Box>
                      </InvoiceFieldWrapper>
                    ))}
                  </TableCell>
                )}

                {/* More Info Menu */}
                <TableCell sx={{ verticalAlign: "top" }} align="center">
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <InvoiceFieldWrapper
                      key={ci._id || `more-${ciIndex}`}
                      isLast={ciIndex === invoicesToRender.length - 1}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, ci)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </InvoiceFieldWrapper>
                  ))}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose}>
        {hasMoreInfo ? (
          [
            currentInvoice?.others?.bill_doc && (
              <MenuItem key="bill_doc" disabled>
                Billing Doc: {currentInvoice.others.bill_doc}
              </MenuItem>
            ),
            currentInvoice?.others?.delivery_no && (
              <MenuItem key="delivery_no" disabled>
                DELIVERY NO: {currentInvoice.others.delivery_no}
              </MenuItem>
            ),
            currentInvoice?.others?.t_code && (
              <MenuItem key="t_code" disabled>
                T Code: {currentInvoice.others.t_code}
              </MenuItem>
            ),
          ]
        ) : (
          <MenuItem sx={{ paddingTop: "0px", paddingBottom: "0px" }} disabled>
            No other data to show
          </MenuItem>
        )}
      </Menu>

      {isEditing && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <Button
            variant="contained"
            onClick={onSave}
            sx={{
              backgroundColor: "#4F46E5",
              textTransform: "capitalize",
              "&:hover": { backgroundColor: "#4338ca" },
            }}
          >
            Submit
          </Button>
        </Box>
      )}
    </TableContainer>
  );
};

export default InvoiceTable;
