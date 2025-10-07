"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  Paper,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Tooltip,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import styles from "./PickupTab.module.css";
// Assuming CustomDateTimePicker is a defined component
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
  isTechnova: boolean;
  isBMWIL: boolean;
  isJSPL: boolean;
  isEmami: boolean; 
  shipmentData: any; 
}

const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return "DD MMM YYYY, hh:mm";
  try {
    // dayjs will handle various date formats, including ISO strings (which is what your API returns)
    return dayjs(dateString).format("DD MMM YYYY, hh:mm"); 
  } catch (e) {
    return "N/A";
  }
};

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#e0e0e0" },
    "&:hover fieldset": { borderColor: "#c0c0c0" },
    "&.Mui-focused fieldset": { borderColor: "#20104d" },
  },
  "& .MuiInputBase-input": { padding: "8.5px 4px" },
};

const capitalizeFirstLetter = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  groupedInvoices,
  isEditing,
  editableGoodsInfoForPickup,
  onInvoiceChange,
  onGoodsInfoChange,
  onAddRow,
  onSave,
  onRemoveRow,
  isTechnova,
  isEmami,
  isBMWIL,
  isJSPL,
  shipmentData = {},
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
                width: "380px",
                color: "#09337e",
                textAlign: "center",
                backgroundColor: "#F5F5F5",
              }}
            >
              Delivery Location
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "180px", 
                textAlign: "center",
                backgroundColor: "#F5F5F5",
              }}
            >
              Invoice Number
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "120px", 
                textAlign: "center",
                backgroundColor: "#F5F5F5",
              }}
            >
              Value (₹)
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "50px", 
                textAlign: "center",
                backgroundColor: "#F5F5F5",
              }}
            >
              No. of Packages
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "130px", 
                textAlign: "center",
                backgroundColor: "#F5F5F5",
              }}
            >
              Gross Wt. ({shipmentData.uom || 'MT'})
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#09337e",
                width: "130px", 
                textAlign: "center",
                backgroundColor: "#F5F5F5",
              }}
            >
              Net Wt. ({shipmentData.uom || 'MT'})
            </TableCell>
            
            {isTechnova ? (
              <>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "#09337e",
                    width: "130px", 
                    textAlign: "center",
                    backgroundColor: "#F5F5F5",
                  }}
                >
                  Bill To
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "#09337e",
                    width: "150px",
                    textAlign: "center",
                    backgroundColor: "#F5F5F5",
                  }}
                >
                  Bill To Name
                </TableCell>
              </>
            ) : (
              <>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "#09337e",
                    width: "130px", 
                    textAlign: "center",
                    backgroundColor: "#F5F5F5",
                  }}
                >
                  Cons. Wt.({shipmentData.uom || 'MT'})
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "#09337e",
                    width: "130px", 
                    textAlign: "center",
                    backgroundColor: "#F5F5F5",
                  }}
                >
                  Delivery No.
                </TableCell>
              </>
            )}

            {isEditing && (
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#09337e",
                  backgroundColor: "#F5F5F5",
                  width: "80px", 
                  textAlign: "center",
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
                textAlign: "center",
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

            // Determine the source of the invoice info object
            const currentGoodsInfo = isEditing
              ? editableGoodsInfoForPickup[groupIndex] || {}
              : invGroup;
            
            // Define the data to be used for display (outside of edit mode)
            // It prioritizes the editable state if editing is true, otherwise uses the original API object structure.
            const displayEwaybillNumber = isEditing 
                ? currentGoodsInfo.ewaybillNumber 
                : invGroup.ewaybill?.number;
                
            const displayEwaybillExpiry = isEditing 
                ? currentGoodsInfo.ewaybillExpiryDateTime 
                : invGroup.ewaybill?.expire_date;
                
            const displayInvoiceTime = isEditing 
                ? currentGoodsInfo.invoiceDateTime 
                : shipmentData.pickup_date; // Angular defaults to shipment pickup date

            return ( 
              <TableRow key={invGroup.delivery_id?._id || groupIndex} sx={{ '& > td': { verticalAlign: 'top' } }}>
                <TableCell sx={{ padding: '10px 2px 0px 8px ' }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: '8px' }}>
                  <Box 
                      sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          height: 24, 
                          flexShrink: 0, 
                          alignSelf: 'flex-start' 
                      }}
                  >
                      <span className={styles.deliveryIcon}>
                          D{groupIndex + 1}
                      </span>
                  </Box>
                  
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

                  {(isTechnova || isEmami || isBMWIL || isJSPL) &&
                    (() => {
                      const TotalRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="body2" sx={{ width: "100px", flexShrink: 0 }}>{label}</Typography>
                          <Typography variant="body2" sx={{ mx: 1 }}>:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: "bold" }}>{value}</Typography>
                        </Box>
                      );

                      return (
                        <Box
                          sx={{
                            mt: 2,
                            p: 1.5,
                            border: "1px solid #e0e0e0",
                            borderRadius: "4px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Totals
                          </Typography>
                          <TotalRow
                            label="Gross Wt."
                            value={`${(invGroup.total_gross_weight ?? 0).toFixed(2)} ${shipmentData.uom || 'MT'}`}
                          />
                          <TotalRow
                            label="Net Wt."
                            value={`${(invGroup.total_net_weight ?? 0).toFixed(2)} ${shipmentData.uom || 'MT'}`}
                          />
                          <TotalRow
                            label="Cons. Wt."
                            value={`${(invGroup.total_considered_weight ?? 0).toFixed(2)} ${shipmentData.uom || 'MT'}`}
                          />
                          <TotalRow
                            label="Packages"
                            value={invGroup.total_nop ?? 0}
                          />
                          <TotalRow
                            label="Invoices"
                            value={invoicesToRender.length}
                          />
                        </Box>
                      );
                    })()}
                  <TextField
                    multiline
                    rows={2}
                    fullWidth
                    variant="outlined"
                    size="small"
                    label="Comments"
                    sx={{ mt: 1, ...textFieldStyles, mb : 1 }}
                    disabled={!isEditing}
                    value={currentGoodsInfo.comments || ""}
                    onChange={(e) =>
                      onGoodsInfoChange(groupIndex, "comments", e.target.value)
                    }
                  />
                   {/* START: Invoice Time Field */}
                   {isBMWIL && (
                    <Box sx={{ mt: 1, marginBottom: '8px' }}>
                        {isEditing ? (
                            <CustomDateTimePicker
                                label="Invoice Time"
                                value={
                                currentGoodsInfo.invoiceDateTime
                                    ? new Date(currentGoodsInfo.invoiceDateTime)
                                    : null
                                }
                                onChange={(newDate: Date | null) =>
                                    onGoodsInfoChange(
                                        groupIndex,
                                        "invoiceDateTime", 
                                        newDate
                                    )
                                }
                            />
                        ) : (
                            <Box>
                                <Box
                                    sx={{
                                        mt: 1,
                                        pl: 1,
                                        border: "1px solid #e0e0e0",
                                        borderRadius: "4px",
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                      Invoice Time
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDateTime(displayInvoiceTime)}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                   )}
                  {/* END: Invoice Time Field */}

                  <Box sx={{ mt: 1, marginBottom: '8px' }}>
                    {isEditing ? (
                      <TextField
                        label="E-waybill Number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={{ ...textFieldStyles }}
                        value={currentGoodsInfo.ewaybillNumber || ""}
                        onChange={(e) =>
                          onGoodsInfoChange(groupIndex, "ewaybillNumber", e.target.value)
                        }
                      />
                    ) : (
                      <Box
                        sx={{
                          mt: 1,
                          pl: 1,
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          E-waybill Number
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {/* FIX: Use displayEwaybillNumber which checks both editable and original API object */}
                          {displayEwaybillNumber || "—"}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ mt: 1, marginBottom: '8px' }}>
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
                      <Box
                        sx={{
                          mt: 1,
                          pl: 1,
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          E-waybill Expiry
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {/* FIX: Use displayEwaybillExpiry which checks both editable and original API object */}
                          {formatDateTime(displayEwaybillExpiry)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>

                <TableCell sx={{ padding: '6px 2px' }}> 
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <Box key={ci._id || `num-${ciIndex}`} sx={{minHeight: "40px", display: "flex", alignItems: "center", mb: ciIndex === invoicesToRender.length - 1 ? 0 : 2}}>
                      {isEditing ? (
                        <TextField
                          size="small"
                          variant="outlined"
                          fullWidth
                          sx={{ ...textFieldStyles, width: "100%" }}
                          disabled={!isEditing}
                          value={ci.num ?? ""}
                          onChange={(e) =>{
                            const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                            onInvoiceChange(
                              groupIndex,
                              ciIndex,
                              "num",
                              value
                            )
                          }
                            
                          }
                          inputProps={{ style: { textAlign: 'center' } }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ width: "100%", fontWeight: '590', textAlign: 'center' }}>{ci.num ?? "—"}</Typography>
                      )}
                    </Box>
                  ))}
                </TableCell>
                <TableCell sx={{ padding: '6px 2px' }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <Box key={ci._id || `val-${ciIndex}`} sx={{minHeight: "40px", display: "flex", alignItems: "center", mb: ciIndex === invoicesToRender.length - 1 ? 0 : 2}}>
                      {isEditing ? (
                        <TextField
                          size="small"
                          variant="outlined"
                          fullWidth
                          sx={{ ...textFieldStyles, width: "100%" }}
                          disabled={!isEditing}
                          type="number"
                          inputProps={{ min: 0, style: { textAlign: 'center' } }}
                          value={ci.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/^(?!\d*\.?\d*$).*/g, "");
                            onInvoiceChange(groupIndex, ciIndex, "value", value);
                          }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ width: "100%", fontWeight: '590', textAlign: 'center' }}>
                          {Number(ci.value || 0).toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </TableCell>
                <TableCell sx={{ padding: '6px 2px' }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <Box key={ci._id || `nop-${ciIndex}`} sx={{minHeight: "40px", display: "flex", alignItems: "center", mb: ciIndex === invoicesToRender.length - 1 ? 0 : 2}}>
                      {isEditing ? (
                        <TextField
                          size="small"
                          variant="outlined"
                          fullWidth
                          sx={{ ...textFieldStyles, width: "100%" }}
                          disabled={!isEditing}
                          type="number"
                          inputProps={{ min: 0, style: { textAlign: 'center' } }}
                          value={ci.nop ?? ""}
                          onChange={(e) =>{
                            const value = e.target.value.replace(/^(?!\d*\.?\d*$).*/g, "");
                            onInvoiceChange(
                              
                              groupIndex,
                              ciIndex,
                              "nop",
                              value
                            )
                          }
                            
                          }
                        />
                      ) : (
                        <Typography variant="body2" sx={{ width: "100%", fontWeight: '590', textAlign: 'center' }}>{ci.nop ?? "0"}</Typography>
                      )}
                    </Box>
                  ))}
                </TableCell>
                <TableCell sx={{ padding: '6px 2px' }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <Box key={ci._id || `gross-${ciIndex}`} sx={{minHeight: "40px", display: "flex", alignItems: "center", mb: ciIndex === invoicesToRender.length - 1 ? 0 : 2}}>
                      {isEditing ? (
                        <TextField
                          size="small"
                          variant="outlined"
                          fullWidth
                          sx={{ ...textFieldStyles, width: "100%" }}
                          disabled={!isEditing}
                          type="number"
                          inputProps={{ min: 0, style: { textAlign: 'center' } }}
                          value={ci.gross_weight ?? ""}
                          onChange={(e) =>{
                            const value = e.target.value.replace(/^(?!\d*\.?\d*$).*/g, "");
                            onInvoiceChange(
                              groupIndex,
                              ciIndex,
                              "gross_weight",
                              value 
                            )
                          }
                          }
                            
                        />
                      ) : (
                        <Typography variant="body2" sx={{ width: "100%", fontWeight: '590', textAlign: 'center' }}>
                          {Number(ci.gross_weight || 0).toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </TableCell>
                <TableCell sx={{ padding: '6px 2px' }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <Box key={ci._id || `net-${ciIndex}`} sx={{minHeight: "40px", display: "flex", alignItems: "center", mb: ciIndex === invoicesToRender.length - 1 ? 0 : 2}}>
                      {isEditing ? (
                        <TextField
                          size="small"
                          variant="outlined"
                          fullWidth
                          sx={{ ...textFieldStyles, width: "100%" }}
                          disabled={!isEditing}
                          type="number"
                          inputProps={{ min: 0, style: { textAlign: 'center' } }}
                          value={ci.net_weight ?? ""}
                          onChange={(e) =>{
                            const value = e.target.value.replace(/^(?!\d*\.?\d*$).*/g, "");
                            onInvoiceChange(
                              groupIndex,
                              ciIndex,
                              "net_weight",
                              value
                            )
                          } 
                          }
                        />
                      ) : (
                        <Typography variant="body2" sx={{ width: "100%", fontWeight: '590', textAlign: 'center' }}>
                          {Number(ci.net_weight || 0).toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </TableCell>

                {isTechnova ? (
                  <>
                    <TableCell sx={{ padding: '6px 2px' }}>
                      {invoicesToRender.map((ci: any, ciIndex: number) => (
                        <Box key={ci._id || `bill-to-${ciIndex}`} sx={{minHeight: "40px", display: "flex", alignItems: "center", mb: ciIndex === invoicesToRender.length - 1 ? 0 : 2}}>
                          {isEditing ? (
                            <TextField
                              size="small"
                              fullWidth
                              variant="outlined"
                              sx={{ ...textFieldStyles, width: "100%" }}
                              disabled={!isEditing}
                              value={ci.others?.bill_to || ""}
                              onChange={(e) =>
                                onInvoiceChange(
                                  groupIndex,
                                  ciIndex,
                                  "bill_to",
                                  e.target.value
                                )
                              }
                              inputProps={{ style: { textAlign: 'center' } }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ width: "100%", fontWeight: '590', textAlign: 'center' }}>{ci.others?.bill_to || "—"}</Typography>
                          )}
                        </Box>
                      ))}
                    </TableCell>
                    <TableCell sx={{ padding: '6px 2px' }}>
                      {invoicesToRender.map((ci: any, ciIndex: number) => (
                        <Box key={ci._id || `bill-to-name-${ciIndex}`} sx={{minHeight: "40px", display: "flex", alignItems: "center", mb: ciIndex === invoicesToRender.length - 1 ? 0 : 2}}>
                          {isEditing ? (
                            <TextField
                              size="small"
                              fullWidth
                              variant="outlined"
                              sx={{ ...textFieldStyles, width: "100%" }}
                              disabled={!isEditing}
                              value={ci.others?.bill_to_name || ""}
                              onChange={(e) =>
                                onInvoiceChange(
                                  groupIndex,
                                  ciIndex,
                                  "bill_to_name",
                                  e.target.value
                                )
                              }
                              inputProps={{ style: { textAlign: 'center' } }}
                            />
                          ) : (
                            <Tooltip title={capitalizeFirstLetter(ci.others?.bill_to_name || '')} arrow>
                              <Typography variant="body2" sx={{ width: "100%", fontWeight: '590',textAlign: 'center' }}>
                                {ci.others?.bill_to_name
                                  ? `${capitalizeFirstLetter(ci.others.bill_to_name.substring(0, 10))}${ci.others.bill_to_name.length > 10 ? '...' : ''}`
                                  : "—"
                                }
                              </Typography>
                            </Tooltip>
                          )}
                        </Box>
                      ))}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell sx={{ padding: '6px 2px' }}>
                      {invoicesToRender.map((ci: any, ciIndex: number) => (
                        <Box key={ci._id || `cons-${ciIndex}`} sx={{minHeight: "40px", display: "flex", alignItems: "center", mb: ciIndex === invoicesToRender.length - 1 ? 0 : 2}}>
                          {isEditing ? (
                            <TextField
                              size="small"
                              fullWidth
                              variant="outlined"
                              sx={{ ...textFieldStyles, width: "100%" }}
                              disabled={!isEditing}
                              type="number"
                              inputProps={{ min: 0, style: { textAlign: 'center' } }}
                              value={ci.considered_weight ?? ""}
                              onChange={(e) =>{
                                const value = e.target.value.replace(/^(?!\d*\.?\d*$).*/g, "");
                                onInvoiceChange(
                                  groupIndex,
                                  ciIndex,
                                  "considered_weight",
                                  value
                                )
                              }
                              }
                            />
                          ) : (
                            <Typography variant="body2" sx={{ width: "100%", fontWeight: '590', textAlign: 'center' }}>
                              {Number(ci.considered_weight || 0).toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </TableCell>
                    <TableCell sx={{ padding: '6px 2px' }}>
                      {invoicesToRender.map((ci: any, ciIndex: number) => (
                        <Box key={ci._id || `del-${ciIndex}`} sx={{minHeight: "40px", display: "flex", alignItems: "center", mb: ciIndex === invoicesToRender.length - 1 ? 0 : 2}}>
                          {isEditing ? (
                            <TextField
                              size="small"
                              fullWidth
                              variant="outlined"
                              sx={{ ...textFieldStyles, width: "100%" }}
                              disabled={!isEditing}
                              value={ci.others?.delivery_no || ""}
                              onChange={(e) =>{
                                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                                onInvoiceChange(
                                  groupIndex,
                                  ciIndex,
                                  "delivery_no",
                                  value
                                )
                              } 
                              }
                              inputProps={{ style: { textAlign: 'center' } }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ width: "100%", fontWeight: '590', textAlign: 'center' }}>{ci.others?.delivery_no || "—"}</Typography>
                          )}
                        </Box>
                      ))}
                    </TableCell>
                  </>
                )}

                {isEditing && (
                  <TableCell sx={{ padding: '6px 2px' }}>
                    {invoicesToRender.map((ci: any, ciIndex: number) => (
                      <Box key={ci._id || `act-${ciIndex}`} sx={{minHeight: "40px", display: "flex", alignItems: "center", mb: ciIndex === invoicesToRender.length - 1 ? 0 : 2}}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {invoicesToRender.length > 1 && (
                            <IconButton
                              size="small"
                              onClick={() => onRemoveRow(groupIndex, ciIndex)}
                            >
                              <RemoveCircleOutlineIcon color="error" />
                            </IconButton>
                          )}
                          {ciIndex === invoicesToRender.length - 1 && (
                            <IconButton
                              size="small"
                              onClick={() => onAddRow(groupIndex)}
                            >
                              <AddCircleOutlineIcon sx={{ color: "#20104d" }} />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </TableCell>
                )}

                <TableCell sx={{ padding: '6px 2px' }}>
                  {invoicesToRender.map((ci: any, ciIndex: number) => (
                    <Box key={ci._id || `more-${ciIndex}`} sx={{minHeight: "40px", display: "flex", alignItems: "center", mb: ciIndex === invoicesToRender.length - 1 ? 0 : 2}}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, ci)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
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
              backgroundColor: "#20104d",
              textTransform: "capitalize",
              "&:hover": { backgroundColor: "#271950" },
            }}>
            Submit
          </Button>
        </Box>
      )}
    </TableContainer>
  );
};

export default InvoiceTable;