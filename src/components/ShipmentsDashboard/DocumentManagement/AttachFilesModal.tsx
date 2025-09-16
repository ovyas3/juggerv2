import React, { useState, useRef, ChangeEvent } from "react";
import styles from "./AttachFilesModal.module.css";
import { useSnackbar } from "@/hooks/snackBar";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import { httpsPost } from "@/utils/Communication";

interface AttachFilesModalProps {
  show: boolean;
  onClose: () => void;
  onAttach: () => void;
  shipmentId: string;
  isLoading?: boolean;
  sin?: string;
}

const AttachFilesModal: React.FC<AttachFilesModalProps> = ({
  show,
  onClose,
  onAttach,
  shipmentId,
  isLoading = false,
  sin,
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showMessage } = useSnackbar();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleAttach = async () => {
    if (!files || files.length === 0) {
      showMessage("Please select at least one file", "error");
      return;
    }

    const validTypes = ["image/jpeg", "image/png"];
    const invalidFiles = Array.from(files).filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      showMessage("Only JPG and PNG files are allowed", "error");
      return;
    }

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      const blob = new Blob([file], { type: file.type });
      formData.append("doc", blob, file.name);
    });

    try {
      setIsUploading(true);
      const response = await httpsPost(
        `shipment/approval_doc/${shipmentId}`,
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        },
        5
      );

      if (response.statusCode === 200) {
        showMessage("Files uploaded successfully", "success");
        onAttach();
        onClose();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setFiles(null);
      } else {
        showMessage(response.message || "Failed to upload files", "error");
      }
    } catch (error: any) {
      console.error("Error uploading files:", error);
      showMessage(error.message || "Failed to upload files", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {(isLoading || isUploading) && (
          <div className={styles.loader}>
            <div className={styles.load}>
              <div className={styles.spinner}></div>
            </div>
          </div>
        )}
        <div className={styles.section}>
          <ModalHeader
            title={`Upload Approval Documents - #${sin}`}
            onClose={onClose}
          />
          <div className={styles.commentSection}>
            <div className={styles.uploadFile}>
              <input
                type="file"
                ref={fileInputRef}
                className={styles.inputField}
                style={{ display: "none" }}
                onChange={handleFileChange}
                multiple
              />
              <button
                className={styles.browseButton}
                onClick={handleClickUpload}
                type="button"
                tabIndex={0}
                disabled={isUploading}
              >
                Choose Files
              </button>
              {files && (
                <div className={styles.selectedFiles}>
                  {Array.from(files).map((file, idx) => (
                    <div key={idx} className={styles.fileItem}>
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            className={`${styles.submitButton} ${
              !files ? styles.disabled : ""
            }`}
            onClick={!isUploading ? handleAttach : undefined}
          >
            <div className={styles.button}>
              {isUploading ? "Uploading..." : "Upload Files"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachFilesModal;
