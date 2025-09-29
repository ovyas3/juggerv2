import React, { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { Upload, Download } from "lucide-react";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from "@/utils/Communication";
import { useUserRoles } from "@/hooks/useUserRoles";

interface BulkEpodUploadProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const BulkEpodUpload: React.FC<BulkEpodUploadProps> = ({
  open,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showMessage } = useSnackbar();
  const userRoles = useUserRoles();

  const handleFileSelect = (file: File | null) => {
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
    } else if (file) {
      showMessage("Please select a valid .csv file.", "warning");
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileSelect(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  };

  const onFileSelectedFromInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFileSelect(event.target.files[0]);
    }
  };

  const downloadSampleFile = useCallback(() => {
    const headers = "S.No.,Invoice Number,ePOD Upload";
    const exampleRow1 = "1,INV123456,Yes";
    const exampleRow2 = "2,INV765432,No";
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleRow1}\n${exampleRow2}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "epod_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);
  
  const handleUpload = async () => {
    if (!userRoles.sales_person) {
      showMessage("You don't have permission to perform this action.", "error");
      return;
    }

    if (!selectedFile) {
      showMessage("Please select a file to upload.", "info");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("epodFile", selectedFile, selectedFile.name);

    try {
      const response = await httpsPost(
        "shipment/bulk-epod-update",
        formData
      );
      if (response.statusCode === 200) {
        showMessage("ePODs updated successfully!", "success");
        onUploadSuccess();
      } else {
        showMessage(response.message || "Failed to update ePODs.", "error");
      }
      handleClose();
    } catch (err: any) {
      showMessage(err.message || "An error occurred during upload.", "error");
      handleClose();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <ModalHeader title="Bulk ePOD Upload" onClose={handleClose} />
      <DialogContent sx={{ padding: '20px 24px', minHeight: 200 }}>
        <Box sx={{ mt: 2 }}>
          <div
            style={{
              border: `2px dashed ${isDragOver ? '#4F46E5' : '#D1D5DB'}`,
              borderRadius: '6px',
              padding: '10px',
              textAlign: 'center',
              color: '#6B7280',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              backgroundColor: isDragOver ? '#e0e7ff' : '#F9FAFB',
              marginBottom: '16px',
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {/* <Upload size={24} style={{ color: '#4F46E5', marginBottom: '8px' }} /> */}
            <Typography variant="body1" sx={{ mt: 1 }}>
              Drag & drop your CSV file here
            </Typography>
            <Typography variant="body2" sx={{ my: 1 }}>
              or
            </Typography>
            <Button
              variant="contained"
              component="span"
              sx={{
                backgroundColor: '#4F46E5 !important',
                color: 'white !important',
                borderRadius: '4px !important',
                padding: '8px 16px !important',
                textTransform: 'none !important',
                fontWeight: '500 !important',
                boxShadow: 'none !important',
                marginTop: '8px',
                '&:hover': {
                  backgroundColor: '#4338CA !important',
                }
              }}
            >
              Choose File
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelectedFromInput}
            accept=".csv"
            style={{ display: "none" }}
          />

          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
              Selected file: <strong>{selectedFile.name}</strong>
            </Typography>
          )}

          <Box sx={{ marginTop: '8px' }}>
            <Typography variant="body2" color="textSecondary">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  downloadSampleFile();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#4F46E5',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                }}
              >
                <Download size={16} style={{ marginRight: 4 }} />
                Download Sample File
              </a>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions 
        sx={{
          padding: '16px 24px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}
      >
        <button
          onClick={handleClose}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            border: '1px solid #D1D5DB',
            borderRadius: '4px',
            background: 'white',
            color: '#4B5563',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            ...(isLoading && { opacity: 0.6, cursor: 'not-allowed' }),
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
          style={{
            padding: '8px 24px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#4F46E5',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '100px',
            ...((!selectedFile || isLoading) && { backgroundColor: '#A5B4FC', cursor: 'not-allowed' }),
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            "Upload"
          )}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkEpodUpload;