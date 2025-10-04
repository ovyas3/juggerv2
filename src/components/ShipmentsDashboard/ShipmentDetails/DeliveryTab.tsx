// components/ShipmentsDashboard/ShipmentDetails/DeliveryTab.tsx

"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
import pickupStyles from "./PickupTab.module.css";
import CustomDatePicker from "@/components/UI/CustomDatePicker/CustomDatePicker";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPut, httpsPost, httpsGet } from "@/utils/Communication";
import { UserRoles } from "@/hooks/useUserRoles";
import CustomDateTimePicker from "@/components/UI/CustomDateTimePicker/CustomDateTimePicker";
import { format, sub } from "date-fns";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const SimpleDocViewer = ({
  assetUrl,
  onDelete,
}: {
  assetUrl: string;
  onDelete?: () => void;
}) => {
  if (!assetUrl) return null;
  const isImage = /\.(jpeg|jpg|gif|png|svg)$/i.test(assetUrl);
  const isPdf = /\.(pdf)$/i.test(assetUrl);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {onDelete && (
        <IconButton
          onClick={onDelete}
          size="small"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
            zIndex: 1,
          }}
        >
          <CancelIcon fontSize="small" color="error" />
        </IconButton>
      )}
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
            "&:hover": { borderColor: "#4f46e5" },
          }}
        >
          {isImage ? (
            <img
              src={assetUrl}
              alt="document preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : isPdf ? (
            <ArticleIcon sx={{ fontSize: 40, color: "text.secondary" }} />
          ) : (
            <Typography variant="caption" sx={{ p: 1 }}>
              File
            </Typography>
          )}
        </Paper>
      </a>
    </div>
  );
};

const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "dd-MMM-yyyy hh:mm a");
  } catch (e) {
    return "N/A";
  }
};

const packageStatusOptions = [
  { label: "Full", value: "full_checked" },
  { label: "Short", value: "missing_checked" },
  { label: "Damaged", value: "damaged_checked" },
  { label: "Clotted", value: "clotted_checked" },
  { label: "Rejected", value: "rejected_checked" },
  { label: "Carton Damage", value: "carton_damage_checked" },
];

interface InvoiceProduct {
  material_SKU: string;
  batch: string;
  MFG_date: string;
  cost_per_pcs: number;
  pcs_in_case: number;
  total: number;
  missing_cases?: number;
  missing_pcs?: number;
  damaged_cases?: number;
  damaged_pcs?: number;
  clotted_cases?: number;
  clotted_pcs?: number;
  rejected_cases?: number;
  rejected_pcs?: number;
  carton_damage_cases?: number;
  carton_damage_penalty?: number;
}

const PackageStatusTable = ({
  invoice,
  onUpdate,
  isEditable,
  currencySymbol,
  materials,
}: any) => {
  const [tableData, setTableData] = useState<InvoiceProduct[]>([]);
  const { showMessage } = useSnackbar();

  useEffect(() => {
    if (isEditable) {
      setTableData([
        {
          material_SKU: "",
          batch: "",
          MFG_date: "",
          cost_per_pcs: 0,
          pcs_in_case: 0,
          total: 0,
          missing_cases: 0,
          missing_pcs: 0,
          damaged_cases: 0,
          damaged_pcs: 0,
          clotted_cases: 0,
          clotted_pcs: 0,
          rejected_cases: 0,
          rejected_pcs: 0,
          carton_damage_cases: 0,
          carton_damage_penalty: 0,
        },
      ]);
    } else {
      setTableData(invoice.invoice_products || []);
    }
  }, [isEditable, invoice.invoice_products]);

  const handleFieldChange = (
    index: number,
    field: keyof InvoiceProduct,
    value: any
  ) => {
    const updatedData = [...tableData];
    // This is the core fix to allow input
    (updatedData[index][field] as any) = value;
    setTableData(updatedData);
  };

  const handleAddRow = () => {
    setTableData([
      ...tableData,
      {
        material_SKU: "",
        batch: "",
        MFG_date: "",
        cost_per_pcs: 0,
        pcs_in_case: 0,
        total: 0,
        missing_cases: 0,
        missing_pcs: 0,
        damaged_cases: 0,
        damaged_pcs: 0,
        clotted_cases: 0,
        clotted_pcs: 0,
        rejected_cases: 0,
        rejected_pcs: 0,
        carton_damage_cases: 0,
        carton_damage_penalty: 0,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (tableData.length <= 1) {
      showMessage("At least one row must be present.", "warning");
      return;
    }
    const newTableData = tableData.filter((_, i) => i !== index);
    setTableData(newTableData);
    onUpdate(newTableData);
  };

  const getDynamicColumns = useMemo(() => {
    const dynamicColumns = [];
    if (invoice.status.missing_checked) {
      dynamicColumns.push({
        id: "missing",
        label: "Short",
        subColumns: ["Cases/Packages", "Pcs."],
      });
    }
    if (invoice.status.damaged_checked) {
      dynamicColumns.push({
        id: "damaged",
        label: "Damaged",
        subColumns: ["Cases/Packages", "Pcs."],
      });
    }
    if (invoice.status.clotted_checked) {
      dynamicColumns.push({
        id: "clotted",
        label: "Clotted",
        subColumns: ["Cases/Packages", "Pcs."],
      });
    }
    if (invoice.status.rejected_checked) {
      dynamicColumns.push({
        id: "rejected",
        label: "Rejected",
        subColumns: ["Cases/Packages", "Pcs."],
      });
    }
    if (invoice.status.carton_damage_checked) {
      dynamicColumns.push({
        id: "carton_damage",
        label: "Carton Damage",
        subColumns: ["No. of damaged Cartons", "Carton Damage Penalty"],
      });
    }
    return dynamicColumns;
  }, [invoice.status]);

  const baseColumns = [
    {
      id: "material_SKU",
      label: "Material (SKU)",
      subColumns: [],
      width: "150px",
    },
    { id: "batch", label: "Batch", width: "100px" },
    { id: "MFG_date", label: "Manufactured Date", width: "120px" },
    { id: "cost_per_pcs", label: `MRP (${currencySymbol})`, width: "100px" },
    {
      id: "pcs_in_case",
      label: `No. of Pcs.(per case/package)`,
      width: "100px",
    },
  ];

  const finalColumns = [...baseColumns, ...getDynamicColumns];

  // Check if any dynamic columns are selected and if there is data
  const hasData = useMemo(() => {
    if (!invoice.invoice_products || invoice.invoice_products.length === 0) {
      return false;
    }
    return invoice.invoice_products.some((product: InvoiceProduct) =>
      Object.values(product).some((val) => val !== "" && val !== 0)
    );
  }, [invoice.invoice_products]);

  // If not editable and no data, don't render the table
  if (!isEditable && !hasData) {
    return null;
  }

  return (
    <Box mt={2}>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#f9f9f9" }}>
            <TableRow>
              {finalColumns.map((col, colIndex) => (
                <TableCell
                  key={col.id}
                  align="center"
                  colSpan={col.subColumns ? col.subColumns.length : 1}
                  sx={{
                    fontWeight: "bold",
                    width: "100px",
                    color: "#09337e",
                    borderRight: "1px solid #e0e0e0",
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  width: "100px",
                  color: "#09337e",
                  borderRight: "1px solid #e0e0e0",
                }}
              >
                Total ({currencySymbol})
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", width: "80px", color: "#09337e" }}
              >
                Actions
              </TableCell>
            </TableRow>
            {getDynamicColumns.length > 0 && (
              <TableRow>
                {baseColumns.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  />
                ))}
                {getDynamicColumns.map((col) =>
                  col.subColumns.map((subCol, index) => (
                    <TableCell
                      key={`${col.id}-${index}`}
                      align="center"
                      sx={{
                        color: "#09337e",
                        fontWeight: "bold",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      {subCol}
                    </TableCell>
                  ))
                )}
                <TableCell sx={{ borderRight: "1px solid #e0e0e0" }} />
                <TableCell />
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {tableData.map((row: InvoiceProduct, index: number) => (
              <TableRow key={`row-${index}`}>
                <TableCell
                  align="center"
                  sx={{
                    padding: "7px 7px 7px 7px",
                    borderRight: "1px solid #e0e0e0",
                  }}
                >
                  <Autocomplete
                    options={materials?.map((m: any) => m.sku) || []}
                    value={row.material_SKU || ""}
                    onChange={(e, newValue) =>
                      handleFieldChange(index, "material_SKU", newValue)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Select Material"
                      />
                    )}
                    getOptionLabel={(option) => option}
                    readOnly={!isEditable}
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: "#4f46e5",
                        },
                    }}
                  />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ padding: "7px 7px", borderRight: "1px solid #e0e0e0" }}
                >
                  <TextField
                    size="small"
                    value={row.batch || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "batch",
                        e.target.value.replace(/[^a-zA-Z0-9\-]/g, "")
                      )
                    }
                    disabled={!isEditable}
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: "#4f46e5",
                        },
                    }}
                  />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ padding: "7px 7px", borderRight: "1px solid #e0e0e0" }}
                >
                  <TextField
                    size="small"
                    value={row.MFG_date || ""}
                    onChange={(e) =>
                      handleFieldChange(index, "MFG_date", e.target.value)
                    }
                    disabled={!isEditable}
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: "#4f46e5",
                        },
                    }}
                  />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ padding: "7px 7px", borderRight: "1px solid #e0e0e0" }}
                >
                  <TextField
                    type="text"
                    size="small"
                    value={row.cost_per_pcs || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "cost_per_pcs",
                        e.target.value.replace(/[^0-9.]/g, "")
                      )
                    }
                    disabled={!isEditable}
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: "#4f46e5",
                        },
                    }}
                  />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ padding: "7px 7px", borderRight: "1px solid #e0e0e0" }}
                >
                  <TextField
                    type="text"
                    size="small"
                    value={row.pcs_in_case || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "pcs_in_case",
                        e.target.value.replace(/[^0-9.]/g, "")
                      )
                    }
                    disabled={!isEditable}
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: "#4f46e5",
                        },
                    }}
                  />
                </TableCell>
                {/* Dynamic columns based on selected status checkboxes */}
                {invoice.status.missing_checked && (
                  <>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "7px 7px",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      <TextField
                        type="text"
                        size="small"
                        value={row.missing_cases || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "missing_cases",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        disabled={!isEditable}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#4f46e5",
                            },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "7px 7px",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      <TextField
                        type="text"
                        size="small"
                        value={row.missing_pcs || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "missing_pcs",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        disabled={!isEditable}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#4f46e5",
                            },
                        }}
                      />
                    </TableCell>
                  </>
                )}
                {invoice.status.damaged_checked && (
                  <>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "7px 7px",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      <TextField
                        type="text"
                        size="small"
                        value={row.damaged_cases || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "damaged_cases",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        disabled={!isEditable}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#4f46e5",
                            },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "7px 7px",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      <TextField
                        type="text"
                        size="small"
                        value={row.damaged_pcs || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "damaged_pcs",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        disabled={!isEditable}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#4f46e5",
                            },
                        }}
                      />
                    </TableCell>
                  </>
                )}
                {invoice.status.clotted_checked && (
                  <>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "7px 7px",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      <TextField
                        type="text"
                        size="small"
                        value={row.clotted_cases || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "clotted_cases",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        disabled={!isEditable}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#4f46e5",
                            },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "7px 7px",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      <TextField
                        type="text"
                        size="small"
                        value={row.clotted_pcs || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "clotted_pcs",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        disabled={!isEditable}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#4f46e5",
                            },
                        }}
                      />
                    </TableCell>
                  </>
                )}
                {invoice.status.rejected_checked && (
                  <>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "7px 7px",
                        borderRight: "1px solid #e_e_e",
                      }}
                    >
                      <TextField
                        type="text"
                        size="small"
                        value={row.rejected_cases || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "rejected_cases",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        disabled={!isEditable}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#4f46e5",
                            },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "7px 7px",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      <TextField
                        type="text"
                        size="small"
                        value={row.rejected_pcs || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "rejected_pcs",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        disabled={!isEditable}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#4f46e5",
                            },
                        }}
                      />
                    </TableCell>
                  </>
                )}
                {invoice.status.carton_damage_checked && (
                  <>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "7px 7px",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      <TextField
                        type="text"
                        size="small"
                        value={row.carton_damage_cases || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "carton_damage_cases",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        disabled={!isEditable}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#4f46e5",
                            },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "7px 7px",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      <TextField
                        type="text"
                        size="small"
                        value={row.carton_damage_penalty || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "carton_damage_penalty",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        disabled={!isEditable}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#4f46e5",
                            },
                        }}
                      />
                    </TableCell>
                  </>
                )}
                <TableCell
                  align="center"
                  sx={{ padding: "7px 7px", borderRight: "1px solid #e0e0e0" }}
                >
                  {row.total || ""}
                </TableCell>
                <TableCell align="center" sx={{ padding: "7px 7px" }}>
                  <IconButton
                    onClick={() => handleRemoveRow(index)}
                    disabled={!isEditable || tableData.length <= 1}
                  >
                    <RemoveCircleOutlineIcon color="error" />
                  </IconButton>
                  {isEditable && index === tableData.length - 1 && (
                    <IconButton
                      onClick={handleAddRow}
                      color="primary"
                      sx={{ color: "#09337e" }}
                    >
                      <AddCircleIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const DeliveryTab = ({
  shipmentData,
  onDataChange,
  userRoles,
  isShipmentManagement,
  ownFleet,
  isTechnova,
  isEmami,
  isBMWIL,
  materials,
}: {
  shipmentData: any;
  onDataChange: () => void;
  userRoles: UserRoles;
  isShipmentManagement: boolean;
  ownFleet: boolean;
  isTechnova: boolean;
  isEmami: boolean;
  isBMWIL: boolean;
  materials: any[];
}) => {
  const [mappedDeliveries, setMappedDeliveries] = useState<any[]>([]);
  const [isEditingTimestamps, setIsEditingTimestamps] = useState<
    Record<string, boolean>
  >({});
  const [isEditingDcs, setIsEditingDcs] = useState<Record<string, boolean>>({});
  const [isEditingInvoices, setIsEditingInvoices] = useState<
    Record<string, string | null>
  >({});
  // ... inside DeliveryTab component function (where other state variables are declared)
  const [isEpodEditing, setIsEpodEditing] = useState<Record<string, boolean>>(
    {}
  );

  const [editableTimestamps, setEditableTimestamps] = useState<
    Record<string, any>
  >({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<Record<string, HTMLInputElement | null>>({});
  const { showMessage } = useSnackbar();

  const [disapproveDialogState, setDisapproveDialogState] = useState({
    open: false,
    deliveryId: "",
    reason: "",
  });

  const [epodDeleteState, setEpodDeleteState] = useState({
    open: false,
    deliveryId: "",
    epodLink: "",
  });

  const [packageStatusState, setPackageStatusState] = useState<any>({});
  const [invoiceComments, setInvoiceComments] = useState<any>({});
  const [invoiceSubTableData, setInvoiceSubTableData] = useState<any>({});
  const [isEditingDeliveryInvoice, setIsEditingDeliveryInvoice] = useState<
    Record<string, boolean>
  >({});

  const currencySymbol =
    shipmentData?.shippers?.[0]?.country?.currency?.symbol || "₹";
  const uom = shipmentData?.uom || "MT";
  const isCompleted = shipmentData.latest_status === "CPTD";
  const isCancelled = shipmentData.latest_status === "Cancelled";
  const isTransit = shipmentData.latest_status === "ITNS";
  // const canEditDelivery = isShipmentManagement && !isCompleted;

  const canEditDelivery =
    shipmentData.status !== "Cancelled" && !shipmentData.hasCarrierInvoices;
  const canEditAny = isShipmentManagement || canEditDelivery;

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
            invoice: (invoiceDoc.invoice || []).map((inv: any) => ({
              ...inv,
              status: {
                full_checked: inv.status?.includes("FULL") || false,
                missing_checked: inv.status?.includes("SRT") || false,
                damaged_checked: inv.status?.includes("DMG") || false,
                clotted_checked: inv.status?.includes("CTD") || false,
                rejected_checked: inv.status?.includes("REJ") || false,
                carton_damage_checked:
                  inv.status?.includes("CARTON_DMG") || false,
              },
              comments: inv.comments || "",
              invoice_products: inv.invoice_products || [],
            })),
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

      const initialPackageStatus = newMappedDeliveries.reduce(
        (acc: any, delivery: any) => {
          acc[delivery._id] = {};
          delivery.invoices.forEach((invGroup: any) => {
            acc[delivery._id][invGroup._id] = {};
            invGroup.invoice.forEach((inv: any) => {
              acc[delivery._id][invGroup._id][inv.num] = {
                status: inv.status,
                invoice_products: inv.invoice_products,
              };
            });
          });
          return acc;
        },
        {}
      );
      setPackageStatusState(initialPackageStatus);

      // Initialize comments state
      const initialComments = newMappedDeliveries.reduce(
        (acc: any, delivery: any) => {
          delivery.invoices.forEach((invGroup: any) => {
            invGroup.invoice.forEach((inv: any) => {
              acc[inv.num] = inv.comments;
            });
          });
          return acc;
        },
        {}
      );
      setInvoiceComments(initialComments);
    }
  }, [shipmentData]);

  const handleEditToggle = (
    deliveryId: string,
    section: "timestamps" | "docs"
  ) => {
    if (section === "timestamps") {
      setIsEditingTimestamps((prev) => ({
        ...prev,
        [deliveryId]: !prev[deliveryId],
      }));
    } else {
      // This part of the original code seems to be related to editing documents, not timestamps.
      // I'll leave the fix for timestamps and assume docs editing is handled elsewhere if needed.
    }
  };

  const handleInvoiceEditToggle = (deliveryId: string, invoiceGroup: any) => {
    const invNum = invoiceGroup.invoice[0].num;
    const invId = invoiceGroup._id;
    const isCurrentlyEditing = isEditingDeliveryInvoice[deliveryId];

    // Check if the current invoice has any data entered
    const hasData = packageStatusState[deliveryId]?.[invId]?.[
      invNum
    ]?.invoice_products?.some((p: any) =>
      Object.values(p).some((v) => v !== "" && v !== 0)
    );

    setIsEditingDeliveryInvoice((prev) => {
      const newState = {
        ...prev,
        [deliveryId]: !isCurrentlyEditing,
      };

      if (!isCurrentlyEditing) {
        // When starting to edit, ensure there's at least one empty row for each invoice
        const updatedPackageStatusState = JSON.parse(
          JSON.stringify(packageStatusState)
        );
        const currentProducts =
          updatedPackageStatusState[deliveryId][invId][invNum]
            ?.invoice_products || [];
        if (currentProducts.length === 0) {
          updatedPackageStatusState[deliveryId][invId][
            invNum
          ].invoice_products = [
            {
              material_SKU: "",
              batch: "",
              MFG_date: "",
              cost_per_pcs: "",
              pcs_in_case: "",
              total: 0,
              missing_cases: "",
              missing_pcs: "",
              damaged_cases: "",
              damaged_pcs: "",
              clotted_cases: "",
              clotted_pcs: "",
              rejected_cases: "",
              rejected_pcs: "",
              carton_damage_cases: "",
              carton_damage_penalty: "",
            },
          ];
        }
        setPackageStatusState(updatedPackageStatusState);
      } else {
        // When closing edit mode
        if (!hasData) {
          // If no data was entered, reset the status to 'Full'
          setPackageStatusState((prev: any) => {
            const newState = JSON.parse(JSON.stringify(prev));
            newState[deliveryId][invId][invNum].status = {
              full_checked: true,
              missing_checked: false,
              damaged_checked: false,
              clotted_checked: false,
              rejected_checked: false,
              carton_damage_checked: false,
            };
            return newState;
          });
        }
      }
      return newState;
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
        setIsEditingTimestamps((prev) => ({ ...prev, [deliveryId]: false }));
        onDataChange();
      }
    } catch (error: any) {
      showMessage(error.message || "Failed to update delivery times.", "error");
    } finally {
      setIsSaving((prev) => ({ ...prev, [deliveryId]: false }));
    }
  };

  const handlePackageStatusChange = (
    deliveryId: string,
    invoiceGroupId: string,
    invNum: string,
    field: string
  ) => {
    setPackageStatusState((prev: any) => {
      const newState = JSON.parse(JSON.stringify(prev));
      const invoiceStatus = newState[deliveryId][invoiceGroupId][invNum].status;

      invoiceStatus[field] = !invoiceStatus[field];

      // If FULL is checked, disable and uncheck all others
      if (field === "full_checked" && invoiceStatus[field]) {
        Object.keys(invoiceStatus).forEach((key) => {
          if (key !== "full_checked") {
            invoiceStatus[key] = false;
          }
        });
        // Clear all products if "Full" is checked
        newState[deliveryId][invoiceGroupId][invNum].invoice_products = [];
      } else if (field !== "full_checked" && invoiceStatus[field]) {
        // If any other status is checked, uncheck FULL
        invoiceStatus.full_checked = false;
        // If there are no products, add one empty row
        if (
          newState[deliveryId][invoiceGroupId][invNum].invoice_products
            .length === 0
        ) {
          newState[deliveryId][invoiceGroupId][invNum].invoice_products = [
            {
              material_SKU: "",
              batch: "",
              MFG_date: "",
              cost_per_pcs: "",
              pcs_in_case: "",
              total: 0,
              missing_cases: "",
              missing_pcs: "",
              damaged_cases: "",
              damaged_pcs: "",
              clotted_cases: "",
              clotted_pcs: "",
              rejected_cases: "",
              rejected_pcs: "",
              carton_damage_cases: "",
              carton_damage_penalty: "",
            },
          ];
        }
      }

      return newState;
    });
  };

  const handleCommentChange = (invNum: string, comment: string) => {
    setInvoiceComments((prevComments: any) => ({
      ...prevComments,
      [invNum]: comment,
    }));
  };

  const handleSubTableUpdate = (
    deliveryId: string,
    invoiceId: string,
    invNum: string,
    newTableData: any[]
  ) => {
    setPackageStatusState((prev: any) => {
      const newState = JSON.parse(JSON.stringify(prev));
      if (newState[deliveryId][invoiceId][invNum]) {
        newState[deliveryId][invoiceId][invNum].invoice_products = newTableData;
      }
      return newState;
    });
  };

  const handleSaveAll = async (deliveryId: string, invoiceGroup: any) => {
    setIsSaving((prev) => ({ ...prev, [invoiceGroup._id]: true }));

    const invoiceData =
      packageStatusState[deliveryId]?.[invoiceGroup._id]?.[
        invoiceGroup.invoice[0].num
      ];

    if (!invoiceData) {
      showMessage("Could not find invoice data to save.", "error");
      setIsSaving((prev) => ({ ...prev, [invoiceGroup._id]: false }));
      return;
    }

    const status = Object.keys(invoiceData.status)
      .filter((key) => invoiceData.status[key])
      .map((key) => key.replace("_checked", "").toUpperCase());

    const payload = {
      commercial_invoice: {
        comments: invoiceComments[invoiceGroup.invoice[0].num] || "",
        status: status.length > 0 ? status : ["FULL"],
        num: invoiceGroup.invoice[0].num,
        invoice_products: invoiceData.invoice_products || [],
      },
    };

    // Validation logic from your Angular code
    let invalid = false;
    if (status[0] !== "FULL") {
      for (const product of payload.commercial_invoice.invoice_products) {
        if (!product.material_SKU) {
          showMessage("Please select a material for all products.", "error");
          invalid = true;
          break;
        } else if (product.cost_per_pcs < 0) {
          showMessage("Invalid cost per piece.", "error");
          invalid = true;
          break;
        } else if (!product.batch) {
          showMessage("Batch number is required.", "error");
          invalid = true;
          break;
        } else if (!product.MFG_date) {
          showMessage("Manufactured date is required.", "error");
          invalid = true;
          break;
        }
      }
    }
    if (invalid) {
      setIsSaving((prev) => ({ ...prev, [invoiceGroup._id]: false }));
      return;
    }

    try {
      const response = await httpsPut(
        `v1/shipment/update_invoice/${invoiceGroup._id}`,
        payload
      );
      if (response.statusCode === 200) {
        showMessage("Invoice details updated successfully!", "success");
        handleInvoiceEditToggle(deliveryId, invoiceGroup); // Close the editing state for the delivery
        onDataChange();
      }
    } catch (error: any) {
      showMessage(error.message || "Failed to save invoice details.", "error");
    } finally {
      setIsSaving((prev) => ({ ...prev, [invoiceGroup._id]: false }));
    }
  };

  const handleUploadClick = (
    deliveryId: string,
    type: "epod" | "goods",
    invoiceNum?: string
  ) => {
    const refId = `${deliveryId}-${type}-${invoiceNum || "delivery"}`;
    fileInputRef.current?.[refId]?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    deliveryId: string,
    type: "epod" | "goods",
    invoiceNum?: string
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append(type === "epod" ? "epod" : "goods_pics", file);
      if (invoiceNum) {
        formData.append("invoice_num", invoiceNum);
      }
      const endpoint =
        type === "epod"
          ? `v1/carrier_invoice/upload_epod/${deliveryId}`
          : `v2/shipment/epods_goods/${deliveryId}`;

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

  const isCompletedOrCancelled =
    shipmentData.latest_status === "CPTD" ||
    shipmentData.latest_status === "CNCL";
  const isEditingEpodsLocal =
    mappedDeliveries.length > 0
      ? isEpodEditing[mappedDeliveries[0]._id] || false
      : false;

  const handleDeleteEPOD = async (
    deliveryId: string,
    invoiceNum: string,
    epodUrl: string
  ) => {
    if (!epodDeleteState.deliveryId || !epodDeleteState.epodLink) return;

    const payload = {
      delivery: epodDeleteState.deliveryId,
      epodLink: epodDeleteState.epodLink,
      reason: "Deleted by user",
    };
    try {
      await httpsPost(`v1/carrier_invoice/epod/delete`, payload);
      showMessage("EPOD deleted successfully!", "success");
      onDataChange();
      setEpodDeleteState({ open: false, deliveryId: "", epodLink: "" });
    } catch (error: any) {
      showMessage(error.message || "Failed to delete EPOD.", "error");
    }
  };

  const handleEpodDeleteClick = (deliveryId: string, epodLink: string) => {
    setEpodDeleteState({ open: true, deliveryId, epodLink });
  };

  const handleSubTableAddRow = (
    deliveryId: string,
    invoiceId: string,
    invNum: string
  ) => {
    setPackageStatusState((prev: any) => {
      const newState = JSON.parse(JSON.stringify(prev));
      const newInvoiceProducts = [
        ...(newState[deliveryId][invoiceId][invNum]?.invoice_products || []),
        {
          material_SKU: "",
          batch: "",
          MFG_date: "",
          cost_per_pcs: "",
          pcs_in_case: "",
          total: 0,
          missing_cases: "",
          missing_pcs: "",
          damaged_cases: "",
          damaged_pcs: "",
          clotted_cases: "",
          clotted_pcs: "",
          rejected_cases: "",
          rejected_pcs: "",
          carton_damage_cases: "",
          carton_damage_penalty: "",
        },
      ];
      if (newState[deliveryId][invoiceId][invNum]) {
        newState[deliveryId][invoiceId][invNum].invoice_products =
          newInvoiceProducts;
      } else {
        newState[deliveryId][invoiceId][invNum] = {
          ...newState[deliveryId][invoiceId][invNum],
          invoice_products: newInvoiceProducts,
        };
      }
      return newState;
    });
  };

  const handleSubTableRemoveRow = (
    deliveryId: string,
    invoiceId: string,
    invNum: string,
    index: number
  ) => {
    setPackageStatusState((prev: any) => {
      const newState = JSON.parse(JSON.stringify(prev));
      if (newState[deliveryId][invoiceId][invNum]?.invoice_products) {
        const newInvoiceProducts = newState[deliveryId][invoiceId][
          invNum
        ].invoice_products.filter(
          (_: InvoiceProduct, i: number) => i !== index
        );
        newState[deliveryId][invoiceId][invNum].invoice_products =
          newInvoiceProducts;
      }
      return newState;
    });
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
    if (!approve) {
      setDisapproveDialogState({ open: true, deliveryId, reason: "" });
      return;
    }
    const payload = { delivery: deliveryId, approved: true };
    try {
      await httpsPost("v1/shipment/approveEpod", payload);
      showMessage("EPODs approved successfully!", "success");
      onDataChange();
    } catch (error: any) {
      showMessage(error.message || "Failed to approve EPODs.", "error");
    }
  };

  const handleDisapproveEPODWithReason = async () => {
    if (!disapproveDialogState.reason) {
      showMessage("Reason for disapproval is required.", "warning");
      return;
    }
    const payload = {
      delivery: disapproveDialogState.deliveryId,
      approved: false,
      reason: [disapproveDialogState.reason],
    };
    try {
      await httpsPost("v1/shipment/approveEpod", payload);
      showMessage("EPODs disapproved successfully!", "success");
      onDataChange();
      setDisapproveDialogState({ open: false, deliveryId: "", reason: "" });
    } catch (error: any) {
      showMessage(error.message || "Failed to disapprove EPODs.", "error");
    }
  };

  const isEpodApproved = (delivery: any) => delivery.epod_approved === true;
  const isEpodDisapproved = (delivery: any) => delivery.epod_approved === false;
  const isEpodPending = (delivery: any) =>
    delivery.epod_approved === null && !delivery.reject_reason?.length; // Corrected logic
  const hasRejectionReasons = (delivery: any) =>
    delivery.reject_reason && delivery.reject_reason.length > 0;

  const isSalesPerson = userRoles.sales_person;
  const isAccountOwner = userRoles.owner;

  const canToggleEpodEdit = isAccountOwner && !isCompletedOrCancelled;
  const canUploadEpod = useMemo(() => {
    // Check if the user role is not 'sales_person' and the shipment is not completed/cancelled

    const isCompletedOrCancelled =
      shipmentData.latest_status === "CPTD" ||
      shipmentData.latest_status === "CNCL";
    return !isSalesPerson && !isCompletedOrCancelled;
  }, [userRoles, shipmentData]);

  if (!mappedDeliveries.length) {
    return (
      <Typography sx={{ p: 3, textAlign: "center" }}>
        No delivery information available.
      </Typography>
    );
  }

  if (!mappedDeliveries.length) {
    return (
      <Typography sx={{ p: 3, textAlign: "center" }}>
        No delivery information available.
      </Typography>
    );
  }

  const labelStyle = { width: "150px", flexShrink: 0, color: "text.secondary" };
  const valueStyle = { fontWeight: "bold" };

  return (
    <Box>
      {mappedDeliveries.map((delivery: any, index: number) => {
        const isEditingTimestampsLocal = isEditingTimestamps[delivery._id];
        const isEditingInvoicesLocal = isEditingDeliveryInvoice[delivery._id];
        const currentTimestampData = editableTimestamps[delivery._id] || {};
        const isApproved = isEpodApproved(delivery);
        const isCompletedOrCancelled =
          shipmentData.latest_status === "CPTD" ||
          shipmentData.latest_status === "CNCL";

        const isAccountOwner = userRoles.owner;

        // Define the condition for editing Timestamps (Date & Time)
        const canEditTimestamps = isAccountOwner && !isCompletedOrCancelled;
        const isCurrentlyEditingDocs = isEditingDcs[delivery._id];
        // Corrected logic for epod states
        const isPending = isEpodPending(delivery);
        const isDisapproved = isEpodDisapproved(delivery);
        const hasEpods = delivery.epods && delivery.epods.length > 0;
        const showUploadRequestButtons =
          (isBMWIL || ownFleet) && (userRoles.owner || userRoles.fleet);

        return (
          <Box key={delivery._id} className={styles.deliveryPointCard}>
            <Grid container spacing={2} className={styles.infoGridContainer} sx= {{mt : '0px', width: '100%', ml : '0px', border: '1px solid #e0e0e0'}}>
              <Grid item xs={12} md={7} className={styles.infoGridItem} sx ={{width: '50%'}} >
                

                <Box className={styles.header}>
                  {/* NEW ISOLATION WRAPPER */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      height: 24, // Enforce height here too
                      flexShrink: 0 // Prevent the icon container from shrinking
                    }}
                  >
                    <span className={styles.deliveryIcon}>D{index + 1}</span>
                  </Box>
                  {/* END NEW ISOLATION WRAPPER */}
                  
                  <Box>
                    <Typography variant="body1" className={styles.boldText}>
                      {delivery.location?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {delivery.location?.area}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" className={styles.infoRow}>
                  Delivery Date and Time:{" "}
                  <strong className={styles.boldText}>
                    {formatDateTime(delivery.scheduled_at)}
                  </strong>
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

                          {/* REVISED LOGIC: Use canEditTimestamps */}
                          {canEditTimestamps && (
                            <Box
                              sx={{
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            >
                              {isEditingTimestampsLocal ? (
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
                                        sx={{ color: "#20104d" }}
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
                                  // Custom style to match the new grey icon requirement
                                  sx={{ color: "text.secondary" }}
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
                          {isEditingTimestampsLocal ? (
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
                                  Unloading Start
                                </Typography>
                                <Typography variant="body2" sx={valueStyle}>
                                  {delivery.driver_act_unloading_time?.start
                                    ? `: ${formatDateTime(
                                        delivery.driver_act_unloading_time.start
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
                                  Unloading Complete
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
                                    ? `: ${formatDateTime(
                                        delivery.finished_at
                                      )}`
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

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "8px",
              }}
            >
              {showUploadRequestButtons && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: "#4f46e5",
                      "&:hover": { backgroundColor: "#4338ca" },
                      textTransform: "capitalize",
                      boxShadow: "none",
                    }}
                    onClick={() => handleUploadClick(delivery._id, "epod")}
                  >
                    Upload EPOD
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: "#0c6628",
                      "&:hover": { backgroundColor: "#095221" },
                      textTransform: "capitalize",
                      boxShadow: "none",
                    }}
                    onClick={() => handleRequestEPODs(delivery._id)}
                  >
                    Request EPOD
                  </Button>
                </>
              )}
            </div>

            {/* Commercial Invoices Section */}
            {delivery.invoices && delivery.invoices.length > 0 ? (
              delivery.invoices.map((invoiceGroup: any) =>
                invoiceGroup.invoice.map((inv: any, invIndex: number) => {
                  const isEditing = isEditingDeliveryInvoice[delivery._id];
                  const invoiceState =
                    packageStatusState[delivery._id]?.[invoiceGroup._id]?.[
                      inv.num
                    ];
                  const isSubTableVisible =
                    invoiceState &&
                    Object.values(invoiceState.status).some((v) => v) &&
                    !invoiceState.status.full_checked;

                  return (
                    <Box key={inv.num} sx={{ mb: 2 }}>
                      {/* New: P1, P2, P3 Label */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          my: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          className={styles.pickupIcon}
                        >
                          {invoiceGroup.p_label}
                        </Typography>
                        {!isCompleted && canEditDelivery && (
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleInvoiceEditToggle(
                                delivery._id,
                                invoiceGroup
                              )
                            }
                            title={isEditing ? "Close Edit" : "Edit Invoices"}
                            sx={{
                              color: isEditing ? "inherit" : "#grey",
                              width: isEditing ? "20px" : "20px",
                              height: isEditing ? "20px" : "20px",
                            }}
                          >
                            {isEditing ? <CancelIcon /> : <EditIcon />}
                          </IconButton>
                        )}
                      </Box>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          {/* New: Bold and colored header */}
                          <TableHead sx={{ backgroundColor: "#F5F5F5" }}>
                            <TableRow>
                              <TableCell
                                align="center"
                                className={styles.tableHeaderCell}
                                sx={{ color: "#09337e", fontWeight: "bold" }}
                              >
                                <strong>Invoice</strong>
                              </TableCell>
                              <TableCell
                                align="center"
                                className={styles.tableHeaderCell}
                                sx={{ color: "#09337e", fontWeight: "bold" }}
                              >
                                <strong>Packages</strong>
                              </TableCell>
                              <TableCell
                                align="center"
                                className={styles.tableHeaderCell}
                                sx={{ color: "#09337e", fontWeight: "bold" }}
                              >
                                <strong>Value ({currencySymbol})</strong>
                              </TableCell>
                              <TableCell
                                align="center"
                                className={styles.tableHeaderCell}
                                sx={{ color: "#09337e", fontWeight: "bold" }}
                              >
                                <strong>Gross Wt. ({uom})</strong>
                              </TableCell>
                              <TableCell
                                align="center"
                                className={styles.tableHeaderCell}
                                sx={{ color: "#09337e", fontWeight: "bold" }}
                              >
                                <strong>Net Wt. ({uom})</strong>
                              </TableCell>
                              <TableCell
                                align="center"
                                className={styles.tableHeaderCell}
                                sx={{ color: "#09337e", fontWeight: "bold" }}
                              >
                                <strong>Considered Wt. ({uom})</strong>
                              </TableCell>
                              <TableCell
                                align="center"
                                className={styles.tableHeaderCell}
                                sx={{ color: "#09337e", fontWeight: "bold" }}
                              >
                                <strong>Package Status</strong>
                              </TableCell>
                              <TableCell
                                align="center"
                                className={styles.tableHeaderCell}
                                sx={{ color: "#09337e", fontWeight: "bold" }}
                              >
                                <strong>EPODs</strong>
                              </TableCell>
                              {/* <TableCell
                                align="center"
                                className={styles.tableHeaderCell}
                                sx={{ color: "#09337e", fontWeight: "bold" }}
                              >
                                <strong>Actions</strong>
                              </TableCell> */}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell align="center">{inv.num}</TableCell>
                              <TableCell align="center">{inv.nop}</TableCell>
                              <TableCell align="center">{inv.value}</TableCell>
                              <TableCell align="center">
                                {inv.gross_weight}
                              </TableCell>
                              <TableCell align="center">
                                {inv.net_weight}
                              </TableCell>
                              <TableCell align="center">
                                {inv.considered_weight}
                              </TableCell>
                              <TableCell align="left">
                                {isEditing ? (
                                  <Box
                                    className={styles.packageStatusCheckboxes}
                                  >
                                    {packageStatusOptions.map((option) => (
                                      <FormControlLabel
                                        key={option.value}
                                        control={
                                          <Checkbox
                                            size="small"
                                            checked={
                                              !!invoiceState?.status?.[
                                                option.value
                                              ]
                                            }
                                            onChange={() =>
                                              handlePackageStatusChange(
                                                delivery._id,
                                                invoiceGroup._id,
                                                inv.num,
                                                option.value
                                              )
                                            }
                                            disabled={!canEditDelivery}
                                            sx={{
                                              color: "#4f46e5",
                                              "&.Mui-checked": {
                                                color: "#4f46e5",
                                              },
                                            }}
                                          />
                                        }
                                        label={option.label}
                                      />
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography variant="body2">
                                    {Object.keys(invoiceState?.status || {})
                                      .filter((key) => invoiceState.status[key])
                                      .map((key) => key.replace("_checked", ""))
                                      .join(", ") || "Full"}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                    justifyContent: "center",
                                  }}
                                >
                                  {inv.others?.epods?.map(
                                    (epodUrl: string, idx: number) => (
                                      <SimpleDocViewer
                                        key={idx}
                                        assetUrl={epodUrl}
                                        onDelete={() =>
                                          handleDeleteEPOD(
                                            delivery._id,
                                            epodUrl,
                                            inv.num
                                          )
                                        }
                                      />
                                    )
                                  )}
                                  {!inv.others?.epods?.length && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      No EPODs
                                    </Typography>
                                  )}
                                  {isTransit && !inv.others?.epods?.length && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() =>
                                        handleUploadClick(
                                          delivery._id,
                                          "epod",
                                          inv.num
                                        )
                                      }
                                      sx={{
                                        color: "#4f46e5",
                                        borderColor: "#4f46e5",
                                        "&:hover": {
                                          borderColor: "#4338ca",
                                        },
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      Upload
                                    </Button>
                                  )}
                                  <input
                                    type="file"
                                    ref={(el) => {
                                      fileInputRef.current[
                                        `${delivery._id}-epod-${inv.num}`
                                      ] = el;
                                    }}
                                    style={{ display: "none" }}
                                    onChange={(e) =>
                                      handleFileChange(
                                        e,
                                        delivery._id,
                                        "epod",
                                        inv.num
                                      )
                                    }
                                  />
                                </Box>
                              </TableCell>
                              {/* <TableCell align="center">
                                {/* No save icon here anymore */}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {isSubTableVisible && (
                        <PackageStatusTable
                          invoice={invoiceState}
                          onUpdate={(data: any[]) =>
                            handleSubTableUpdate(
                              delivery._id,
                              invoiceGroup._id,
                              inv.num,
                              data
                            )
                          }
                          onAddRow={() =>
                            handleSubTableAddRow(
                              delivery._id,
                              invoiceGroup._id,
                              inv.num
                            )
                          }
                          onRemoveRow={(index: number) =>
                            handleSubTableRemoveRow(
                              delivery._id,
                              invoiceGroup._id,
                              inv.num,
                              index
                            )
                          }
                          isEditable={canEditDelivery && isEditing}
                          currencySymbol={currencySymbol}
                          materials={materials}
                        />
                      )}

                      {/* Comments and Upload section */}
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Comments
                        </Typography>
                        <TextField
                          multiline
                          rows={3}
                          fullWidth
                          value={invoiceComments[inv.num] || ""}
                          onChange={(e) =>
                            handleCommentChange(inv.num, e.target.value)
                          }
                          disabled={!isEditing}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      {/* New: Submit button */}
                      {isEditing && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 2,
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{
                              backgroundColor: "#4f46e5",
                              "&:hover": { backgroundColor: "#4338ca" },
                              textTransform: "capitalize",
                            }}
                            onClick={() =>
                              handleSaveAll(delivery._id, invoiceGroup)
                            }
                            disabled={isSaving[invoiceGroup._id]}
                          >
                            {isSaving[invoiceGroup._id] ? (
                              <CircularProgress size={20} />
                            ) : (
                              "Submit"
                            )}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  );
                })
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
              {/* Damaged/Rejected/Missing Pictures Section (LEFT SIDE) */}
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  padding: "16px",
                  borderRight: { md: "1px solid #E0E0E0" },
                }}
              >
                <Box className={styles.sectionHeader}>
                  <Typography variant="subtitle2">
                    Damaged/Rejected/Missing Pictures
                  </Typography>
                </Box>
                <Box className={styles.galleryBox}>
                  {delivery.goods_pics?.length > 0 ? (
                    delivery.goods_pics.map((pic: string, idx: number) => (
                      <SimpleDocViewer key={idx} assetUrl={pic} />
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      No Pictures found
                    </Typography>
                  )}
                </Box>

                {/* Upload Picture Button - SIMPLIFIED LOGIC */}
                {isEditingEpodsLocal && !isCompletedOrCancelled && (
                  <button
                    className={styles.uploading_picture_button}
                    onClick={() => handleUploadClick(delivery._id, "goods")}
                    style={{ marginTop: "8px" }}
                  >
                    Upload Picture
                  </button>
                )}
              </Grid>

              {/* ePODs Section (RIGHT SIDE) */}
              <Grid item xs={12} md={6} sx={{ padding: "16px" }}>
                <Box className={styles.sectionHeader}>
                  <Typography variant="subtitle2">ePODs</Typography>
                  <Box className={styles.epodApprovalStatus}>
                    {/* Logic for Completed/Cancelled Shipments (Original logic) */}
                    {isCompletedOrCancelled ? (
                      <>
                        {/* EPOD Approval/Disapproval for CPTD/CNCL - This is the block that must be visible */}
                        {hasEpods && (
                          <>
                            {/* 1. EPOD explicitly approved: Show Approved label and Disapprove button */}
                            {delivery.epod_approved === true && (
                              <>
                                <Typography
                                  variant="caption"
                                  className={styles.approvedText}
                                  sx={{ mr: 1 , fontWeight: 'bold'}}
                                >
                                  ePOD are already Approved
                                </Typography>
                                <Button
                                  onClick={() => handleApproveDisapproveEPOD(delivery._id, false)}
                                  size="small"
                                  sx={{ 
                                      backgroundColor: "red", 
                                      color: "white", 
                                      textTransform: 'capitalize', 
                                      padding: '3px 10px',
                                      // ADD THIS TO REMOVE HOVER EFFECT
                                      '&:hover': {
                                          backgroundColor: 'red', // Keep the solid color
                                          boxShadow: 'none',
                                          filter: 'brightness(90%)' // Optional: slightly darken on hover
                                      }
                                  }}
                              >
                                  Disapprove
                              </Button>
                              </>
                            )}

                            {/* 2. EPOD explicitly disapproved: Show Disapproved label (must have reason) and Approve button */}
                            {delivery.epod_approved === false &&
                              hasRejectionReasons(delivery) && (
                                <>
                                  <Tooltip
                                    title={
                                      delivery.reject_reason.join(", ") ||
                                      "No reason provided"
                                    }
                                  >
                                    <Typography
                                      variant="caption"
                                      className={styles.disapprovedText}
                                      sx={{ mr: 1 }}
                                    >
                                      ePOD Disapproved
                                    </Typography>
                                  </Tooltip>
                                  <Button
                                    onClick={() => handleApproveDisapproveEPOD(delivery._id, true)}
                                    size="small"
                                    sx={{
                                      backgroundColor: "green",
                                      color: "white",
                                      textTransform: "capitalize",
                                      padding: "3px 10px",
                                     '&:hover': {
                                          backgroundColor: 'green', // Keep the solid color
                                          boxShadow: 'none',
                                          filter: 'brightness(90%)' // Optional: slightly darken on hover
                                      }
                                    }}
                                  >
                                    Approve
                                  </Button>
                                </>
                              )}
                          </>
                        )}
                        {hasEpods &&
                          (delivery.epod_approved === null ||
                            (delivery.epod_approved === false &&
                              !hasRejectionReasons(delivery))) && (
                            <>
                              <Button
                                onClick={() =>
                                  handleApproveDisapproveEPOD(
                                    delivery._id,
                                    true
                                  )
                                }
                                size="small"
                                sx={{
                                  backgroundColor: "green",
                                  color: "white",
                                  textTransform: "capitalize",
                                  padding: "3px 10px",
                                  '&:hover': {
                                      backgroundColor: 'green', // Keep the solid color
                                      boxShadow: 'none',
                                      filter: 'brightness(90%)' // Optional: slightly darken on hover
                                  }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                  onClick={() => handleApproveDisapproveEPOD(delivery._id, false)}
                                  size="small"
                                  sx={{ 
                                      backgroundColor: "red", 
                                      color: "white", 
                                      textTransform: 'capitalize', 
                                      padding: '3px 10px',
                                      // ADD THIS TO REMOVE HOVER EFFECT
                                      '&:hover': {
                                          backgroundColor: 'red', // Keep the solid color
                                          boxShadow: 'none',
                                          filter: 'brightness(90%)' // Optional: slightly darken on hover
                                      }
                                  }}
                              >
                                  Disapprove
                              </Button>
                            </>
                          )}
                      </>
                    ) : (
                      <>
                        {/* Edit Button controlled by isAccountOwner and shipment status */}
                        {/* The "only sales person" restriction should be added here to control the button visibility itself. */}
                        {canToggleEpodEdit && (
                          <IconButton
                            onClick={() =>
                              setIsEpodEditing((prev) => ({
                                ...prev,
                                [delivery._id]: !prev[delivery._id],
                              }))
                            }
                            size="small"
                            title={
                              isEditingEpodsLocal
                                ? "Close Editing"
                                : "Edit ePODs"
                            }
                            sx={{
                              // Style to make it a simple grey icon button
                              padding: 0,
                              minWidth: "unset",
                              borderRadius: "4px",

                              // Icon color: Red/Error when active (Close), Grey when inactive (Edit)
                              color: isEditingEpodsLocal
                                ? "error.main"
                                : "text.secondary",

                              backgroundColor: "transparent",
                              border: "none",
                              mr: 1,

                              "&:hover": {
                                backgroundColor: isEditingEpodsLocal
                                  ? "rgba(244, 67, 54, 0.08)"
                                  : "rgba(0, 0, 0, 0.04)", // Light hover effect
                              },
                            }}
                          >
                            {/* Toggle Icon: Close when editing, Edit when inactive */}
                            {isEditingEpodsLocal ? (
                              <CancelIcon fontSize="small" />
                            ) : (
                              <EditIcon fontSize="small" />
                            )}
                          </IconButton>
                        )}

                        {/* Show approval/disapproval buttons when NOT editing and EPODs exist */}
                        {!isEditingEpodsLocal && hasEpods && (
                          <>
                            {/* 1. EPOD explicitly approved: Show Approved label and Disapprove button */}
                            {delivery.epod_approved === true && (
                              <>
                                <Typography
                                  variant="caption"
                                  className={styles.approvedText}
                                  sx={{ mr: 1 }}
                                >
                                  ePOD are already Approved
                                </Typography>
                                <Button
                                  onClick={() =>
                                    handleApproveDisapproveEPOD(
                                      delivery._id,
                                      false
                                    )
                                  }
                                  size="small"
                                  sx={{
                                    backgroundColor: "red",
                                    color: "white",
                                    textTransform: "capitalize",
                                    padding: "3px 10px",
                                  }}
                                >
                                  Disapprove
                                </Button>
                              </>
                            )}

                            {/* 2. EPOD explicitly disapproved: Show Disapproved label (must have reason) and Approve button */}
                            {delivery.epod_approved === false &&
                              hasRejectionReasons(delivery) && (
                                <>
                                  <Tooltip
                                    title={
                                      delivery.reject_reason.join(", ") ||
                                      "No reason provided"
                                    }
                                  >
                                    <Typography
                                      variant="caption"
                                      className={styles.disapprovedText}
                                      sx={{ mr: 1 }}
                                    >
                                      ePOD Disapproved
                                    </Typography>
                                  </Tooltip>
                                  <Button
                                    onClick={() =>
                                      handleApproveDisapproveEPOD(
                                        delivery._id,
                                        true
                                      )
                                    }
                                    size="small"
                                    sx={{
                                      backgroundColor: "green",
                                      color: "white",
                                      textTransform: "capitalize",
                                      padding: "3px 10px",
                                    }}
                                  >
                                    Approve
                                  </Button>
                                </>
                              )}
                          </>
                        )}
                        {/* Unresolved state approval buttons when NOT editing and EPODs exist */}
                        {!isEditingEpodsLocal &&
                          hasEpods &&
                          (delivery.epod_approved === null ||
                            (delivery.epod_approved === false &&
                              !hasRejectionReasons(delivery))) && (
                            <>
                              <Button
                                onClick={() =>
                                  handleApproveDisapproveEPOD(
                                    delivery._id,
                                    true
                                  )
                                }
                                size="small"
                                sx={{
                                  backgroundColor: "green",
                                  color: "white",
                                  textTransform: "capitalize",
                                  padding: "3px 10px",
                                  mr: 1,
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() =>
                                  handleApproveDisapproveEPOD(
                                    delivery._id,
                                    false
                                  )
                                }
                                size="small"
                                sx={{
                                  backgroundColor: "red",
                                  color: "white",
                                  textTransform: "capitalize",
                                  padding: "3px 10px",
                                }}
                              >
                                Disapprove
                              </Button>
                            </>
                          )}
                      </>
                    )}
                  </Box>
                </Box>
                <Box className={styles.galleryBox}>
                  {delivery.epods?.length > 0 ? (
                    delivery.epods.map((epod: any, idx: number) => (
                      <SimpleDocViewer
                        key={idx}
                        assetUrl={epod.link}
                        onDelete={() => handleEpodDeleteClick(delivery._id, epod.link)}
                      />
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      No ePODs found
                    </Typography>
                  )}
                </Box>

                {/* EPOD Upload/Replace Button Logic: SIMPLIFIED LOGIC */}
                {isEditingEpodsLocal && !isCompletedOrCancelled && (
                  <button
                    className={styles.uploading_epod_button}
                    onClick={() => handleUploadClick(delivery._id, "epod")}
                    style={{ marginTop: "8px" }}
                  >
                    {delivery.epods?.length > 0
                      ? "Replace EPOD"
                      : "Upload EPOD"}
                  </button>
                )}
              </Grid>
            </Grid>

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
              {/* Documents Grid Item */}
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
                {/* {canEditDelivery && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleUploadClick(delivery._id, "goods")}
                    sx={{
                      mt: 2,
                      backgroundColor: "#4f46e5",
                      "&:hover": { backgroundColor: "#4338ca" },
                      textTransform: "capitalize",
                    }}
                  >
                    Upload Documents
                  </Button>
                )} */}
              </Grid>

              {/* Signature Grid Item */}
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

            {/* Hidden file inputs */}
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

      <Dialog
        open={disapproveDialogState.open}
        onClose={() =>
          setDisapproveDialogState({ open: false, deliveryId: "", reason: "" })
        }
        PaperProps={{
          sx: { width: "450px", height: "300px", borderRadius: "8px" },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#20104d",
            color: "white",
            fontSize: "16px",
            fontWeight: 500,
            padding: "6px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Disapprove EPOD
          <IconButton
            onClick={() =>
              setDisapproveDialogState({
                open: false,
                deliveryId: "",
                reason: "",
              })
            }
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{ p: 3, pt: "20px !important", pb: "0px !important" }}
        >
          <TextareaAutosize
            minRows={3}
            value={disapproveDialogState.reason}
            onChange={(e) =>
              setDisapproveDialogState({
                ...disapproveDialogState,
                reason: e.target.value,
              })
            }
            placeholder="Please give reason for disapproving the ePOD"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              height: "40px",
              borderRadius: "4px",
              borderColor: "#ccc",
              fontFamily: "inherit",
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: "0 8px 8px" }}>
          <Button
            onClick={handleDisapproveEPODWithReason}
            variant="contained"
            sx={{
              textTransform: "capitalize",
              backgroundColor: "#E54131",
              "&:hover": { backgroundColor: "#c43426" },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryTab;
