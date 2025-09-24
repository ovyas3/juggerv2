import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  FormHelperText,
} from "@mui/material";
import { Upload, X, Download } from "lucide-react";
import styles from "./BulkUpload.module.css";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsGet, httpsPost } from "@/utils/Communication";

interface Organization {
  _id: string;
  name: string;
  id?: string; // For backward compatibility
}

interface BulkUploadProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
  type:
    | "order"
    | "shipment"
    | "commercial_invoice"
    | "commercial_invoice_Tcode";
}

const BulkUpload: React.FC<BulkUploadProps> = ({
  open,
  onClose,
  type,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shipperType, setShipperType] = useState<string>("normal");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showMessage } = useSnackbar();

  // Sample file download links
  const sampleLinks = {
    order:
      "https://docs.google.com/spreadsheets/d/1RtK3Y96Y8FjimQ0nlRXwmCfLKyzdDWJfaz4srpnFxvs/edit?usp=sharing",
    shipment:
      "https://docs.google.com/spreadsheets/d/1RFcx3RJbKI1qZ6OQ_WW-d2UKjffDx9RR-uXw1JPNhdY/edit#gid=182892430",
    commercial_invoice:
      "https://docs.google.com/spreadsheets/d/1dapcJ4y5hE_3TMwMdkQVs9OwPilNcqkJiDqJQV1ewLY/edit?usp=sharing",
    commercial_invoice_Tcode:
      "https://docs.google.com/spreadsheets/d/1dapcJ4y5hE_3TMwMdkQVs9OwPilNcqkJiDqJQV1ewLY/edit?usp=sharing",
  };

  const getOrganizations = async () => {
    setLoading(true);
    try {
      const response = await httpsGet("shipper_pref", 4);
      if (response.statusCode === 200 && response.data?.organizations?.length) {
        setOrganizations(response.data.organizations);
        if (shipperType !== "4pl" && response.data.organizations.length > 0) {
          setSelectedOrg(response.data.organizations[0]);
        }
      }
    } catch (error) {
      showMessage("Failed to load organizations", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();

    try {
      if (type === "order") {
        formData.append("orders", selectedFile!, selectedFile!.name);
        const response = await httpsPost(
          `v2/shipment/create_bulk/${selectedOrg?._id}`,
          formData,
          {},
          4
        );
        if (response.statusCode === 200) {
          showMessage("Bulk upload completed successfully", "success");
          onSuccess?.(response.data);
          handleClose();
        }
      } else {
        let url = "shipment/create_bulk";

        if (type === "shipment") {
          formData.append("shipments", selectedFile!, selectedFile!.name);
          if (selectedOrg) {
            formData.append("organization", selectedOrg._id);
          }
        } else if (type === "commercial_invoice") {
          url = "v1/update_commercial_invoices/bulk";
          formData.append(
            "commercial_invoices",
            selectedFile!,
            selectedFile!.name
          );
        } else if (type === "commercial_invoice_Tcode") {
          url = "/v1/upload_bmwisl_commercial_invoices_tcode/bulk";
          formData.append(
            "commercial_invoices",
            selectedFile!,
            selectedFile!.name
          );
        }

        const response = await httpsPost(url, formData, {}, 4);
        if (response.statusCode === 200) {
          showMessage("Bulk upload completed successfully", "success");
          onSuccess?.(response.data);
          handleClose();
        }
      }
    } catch (error: any) {
      showMessage(error.response?.data?.message || "Upload failed", "error");
      // Reset form on error
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    if (
      type !== "commercial_invoice" &&
      type !== "commercial_invoice_Tcode" &&
      !selectedOrg
    ) {
      showMessage("Please select an client", "error");
      return false;
    }

    if (!selectedFile) {
      showMessage("Please select a file to upload", "error");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (open) {
      getOrganizations();
      // Get shipper type from localStorage if available
      const shipperData = localStorage.getItem("shippers");
      if (shipperData) {
        try {
          const parsed = JSON.parse(shipperData);
          setShipperType(parsed[0]?.type || "normal");
        } catch (e) {
          console.error("Error parsing shipper data:", e);
        }
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <ModalHeader
        title={`Bulk Upload ${
          type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")
        }`}
        onClose={handleClose}
      />
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {type !== "commercial_invoice" &&
            type !== "commercial_invoice_Tcode" && (
              <FormControl fullWidth sx={{ mb: 3 }} error={!selectedOrg}>
                <InputLabel 
                 id="organization-label"
                 sx={{ backgroundColor: 'background.paper', px: 0.5, zIndex: 1 }}
                >
                  Select Client <span style={{ color: "red" }}>*</span>
                </InputLabel>
                <Select
                  labelId="organization-label"
                  value={selectedOrg?._id || ""}
                  onChange={(e) => {
                    const org = organizations.find(
                      (o) => o._id === e.target.value
                    );
                    setSelectedOrg(org || null);
                  }}
                  label="Organization"
                  disabled={loading}
                  sx={{
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(79,70,229,0.2)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0,0,0,0.23)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4f46e5',
                    },
                    '& .MuiSelect-select': {
                      minHeight: 0,
                      paddingTop: 1.2,
                      paddingBottom: 1.2,
                    },
                  }}
                >
                  {organizations.map((org) => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
                {!selectedOrg && (
                  <FormHelperText>Please select an organization</FormHelperText>
                )}
              </FormControl>
            )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
          />

          <Button
            variant="outlined"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
            startIcon={<Upload size={18} />}
            className={styles.fileInputLabel}
            sx={{
              mb: 2,
              backgroundColor: "#EDE7F6",
              color: "#5E35B1",
              border: "1px solid #4f46e5",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#4f46e5",
                color: "white",
                border: "1px solid #4f46e5",
              },
            }}
            disabled={loading}
          >
            {selectedFile ? selectedFile.name : "Choose File"}
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Download sample file:{" "}
              <a
                href={sampleLinks[type]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                <Download size={16} style={{ marginRight: 4 }} />
                {type === "order"
                  ? "Order Template"
                  : type === "shipment"
                  ? "Download Template Sample"
                  : "Commercial Invoice Template"}
              </a>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <button
          onClick={handleClose}
          disabled={loading}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={
            loading ||
            !selectedFile ||
            ((type === "order" || type === "shipment") && !selectedOrg)
          }
          className={styles.submitButton}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkUpload;
