import React, { useState } from 'react';
import styles from '../ShipmentsDashboard.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';
import { httpsPost } from '@/utils/Communication';
import { useSnackbar } from "@/hooks/snackBar";

interface AddRoambeeModalProps {
  show: boolean;
  shipmentNo: string;
  shipmentId: string;
  onClose: () => void;
  onSuccess?: () => void;
  isLoading?: boolean;
}

const AddRoambeeModal: React.FC<AddRoambeeModalProps> = ({
  show,
  shipmentNo,
  shipmentId,
  onClose,
  onSuccess,
  isLoading = false
}) => {
  const [roambeeId, setRoambeeId] = useState('');
  const { showMessage } = useSnackbar();
  const [isSubmittingRoambee, setIsSubmittingRoambee] = useState(false);

  const handleSubmit = async () => {
    if (!shipmentNo) return;

    if (!roambeeId.trim()) {
      showMessage("Please enter a Roambee ID", "error");
      return;
    }

    try {
      setIsSubmittingRoambee(true);
      // Replace with your actual API endpoint
      const response = await httpsPost("shipment/add_roambee_id", {
        shipment: shipmentId,
        roambee_id: roambeeId,
      });

      if (response.statusCode === 200) {
        showMessage("Roambee ID added successfully", "success");
        onClose();
        onSuccess?.();
      }
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Failed to add Roambee ID",
        "error"
      );
    } finally {
      setIsSubmittingRoambee(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.dialogMain} style={{ width: "460px" }} onClick={e => e.stopPropagation()}>
        {isLoading && (
          <div className={styles.loader}>
            <div className={styles.load}>
              <div className={styles.spinner}></div>
            </div>
          </div>
        )}
        <div className={styles.section}>
          <ModalHeader title={`Add Roambee ID - #${shipmentNo}`} onClose={onClose} />
          
          {/* The main content area for the form */}
          <div className={styles.commentSection}>
            <div className={styles.uploadFile}>
              <div className={styles.inputLabel}>Roambee ID</div>
              <div className={styles.inputContainer} style={{ width: "97%", float: "none" }}>
                <input
                  type="text"
                  value={roambeeId}
                  onChange={(e) => setRoambeeId(e.target.value)}
                  className={styles.inputField}
                  disabled={isLoading || isSubmittingRoambee}
                  placeholder="Enter Roambee ID"
                />
              </div>
            </div>
          </div>

          {/* Actions container for the submit button */}
          <div className={styles.actionsContainer}>
            <button
              className={`${styles.submitButton} ${!roambeeId.trim() || isSubmittingRoambee ? styles.disabled : ''}`}
              onClick={handleSubmit}
              disabled={!roambeeId.trim() || isSubmittingRoambee}
              style={{ marginTop: "-20px" }}
            >
              {isSubmittingRoambee ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRoambeeModal;
