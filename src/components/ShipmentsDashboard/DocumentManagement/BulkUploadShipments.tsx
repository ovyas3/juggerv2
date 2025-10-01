import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import { httpsPost } from "@/utils/Communication";
import { useSnackbar } from "@/hooks/snackBar";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./BulkUploadShipments.module.css";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";

interface BulkUploadShipmentsProps {
  open: boolean;
  onClose: (data?: { statusCode: number }) => void;
  type:
    | "order"
    | "shipment"
    | "commercial_invoice"
    | "commercial_invoice_Tcode";
  onSuccess?: () => void;
  shipmentId?: string;
  sin?: string;
}

const BulkUploadShipments: React.FC<BulkUploadShipmentsProps> = ({
  open,
  onClose,
  type,
  onSuccess,
  shipmentId,
  sin,
}) => {
  console.log("type", type);
  const { showMessage } = useSnackbar();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showMessage("Please select a CSV file to upload", "error");
      return;
    }

    const formData = new FormData();
    formData.append("invoices", file);

    setIsUploading(true);
    setShowLoader(true);

    try {
      const endpoint = shipmentId
        ? `shipment/invoice_info/bulk_upload/${shipmentId}`
        : "shipment/invoice_info/bulk_upload";

      const response = await httpsPost(endpoint, formData, {}, 4, true);

      if (response.statusCode === 200) {
        showMessage("Documents uploaded successfully", "success");
        onClose({ statusCode: 200 });
        onSuccess?.();
      } else {
        showMessage(response.message || "Failed to upload file", "error");
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      showMessage(
        error.message || "An error occurred while uploading the file",
        "error"
      );
    } finally {
      setIsUploading(false);
      setShowLoader(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "order":
        return "Bulk Upload Orders";
      case "shipment":
        return "Bulk Upload Shipments";
      case "commercial_invoice":
        return "Bulk Upload Commercial Invoices";
      case "commercial_invoice_Tcode":
        return "Bulk Upload Commercial Invoices (Tcode)";
      default:
        return "Bulk Upload";
    }
  };
  const modalTitle = sin ? `${getTitle()} - #${sin}` : getTitle();
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: "8px",
          position: "relative",
          minHeight: "300px",
        },
      }}
    >
      {showLoader && (
        <div className={styles.loader}>
          <div className={styles.load}>
            <CircularProgress />
          </div>
        </div>
      )}
 <ModalHeader title={modalTitle} onClose={handleClose} /> {/* <--- CHANGED/ADDED */}
      {/* <Box className={styles.header}>
        <div className={styles.label}>
          {getTitle()} - #{sin}
          <IconButton
            onClick={handleClose}
            size="small"
            style={{ position: "absolute", right: "8px", top: "8px" }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </Box> */}

      <DialogContent className={styles.section}>
        <div className={styles.uploadFile}>
          <input
            ref={fileInputRef}
            className={styles.inputField}
            accept=".csv"
            name="csv"
            id="csv"
            onChange={handleFileChange}
            type="file"
            disabled={isUploading}
          />
          <br />
          <span className={styles.csvOnly}>( Only .csv files )</span>
        </div>

        <div className={styles.download}>
          <a
            href={sampleLinks[type]}
            target="_blank"
            rel="noopener noreferrer"
            download="sample.csv"
          >
            Download Sample
          </a>
        </div>

        <div className={styles.submitButton}>
          <button
            className={styles.button}
            onClick={handleUpload}
            disabled={isUploading || !file}
          >
            {isUploading ? "Uploading..." : "Submit"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadShipments;
