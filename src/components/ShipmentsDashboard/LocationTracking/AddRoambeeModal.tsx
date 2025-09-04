import React, { useState } from 'react';
import styles from '../ShipmentsDashboard.module.css';

interface AddRoambeeModalProps {
  show: boolean;
  shipmentNo: string;
  onClose: () => void;
  onSubmit: (roambeeId: string) => void;
  isLoading?: boolean;
}

const AddRoambeeModal: React.FC<AddRoambeeModalProps> = ({
  show,
  shipmentNo,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [roambeeId, setRoambeeId] = useState('');

  const handleSubmit = () => {
    if (!roambeeId.trim()) return;
    onSubmit(roambeeId);
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.dialogMain} onClick={e => e.stopPropagation()}>
        {isLoading && (
          <div className={styles.loader}>
            <div className={styles.load}>
              <div className={styles.spinner}></div>
            </div>
          </div>
        )}
        <div className={styles.section}>
          <div className={styles.header}>
            <div className={styles.label}>
              Add Roambee ID - {shipmentNo}
            </div>
            <i className={`${styles.materialIcons} ${styles.closeIcon}`} onClick={onClose}>
              clear
            </i>
          </div>
          <div className={styles.commentSection}>
            <div className={styles.uploadFile}>
              <div className={styles.inputLabel}>Roambee ID</div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={roambeeId}
                  onChange={(e) => setRoambeeId(e.target.value)}
                  className={styles.inputField}
                  disabled={isLoading}
                  placeholder="Enter Roambee ID"
                />
              </div>
            </div>
          </div>
          <div 
            className={`${styles.submitButton} ${!roambeeId.trim() ? styles.disabled : ''}`} 
            onClick={handleSubmit}
          >
            <div className={styles.button}>
              {isLoading ? 'Submitting...' : 'Submit'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRoambeeModal;