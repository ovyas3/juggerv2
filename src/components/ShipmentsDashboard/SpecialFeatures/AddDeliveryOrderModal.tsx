import React, { useState } from 'react';
import styles from './AddDeliveryOrderModal.module.css';

interface AddDeliveryOrderModalProps {
  show: boolean;
  shipmentNo: string;
  onSave: (doNumber: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const AddDeliveryOrderModal: React.FC<AddDeliveryOrderModalProps> = ({
  show,
  shipmentNo,
  onSave,
  onClose,
  isLoading = false
}) => {
  const [doNumber, setDoNumber] = useState<string>('');

  const handleSubmit = () => {
    if (!doNumber.trim()) return;
    onSave(doNumber);
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.dialogMain} onClick={(e) => e.stopPropagation()}>
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
              DO Details - {shipmentNo}
            </div>
            <i 
              className={`${styles.materialIcons} ${styles.closeIcon}`} 
              onClick={onClose}
              title="Close"
            >
              clear
            </i>
          </div>
          
          <div className={styles.commentSection}>
            <div className={styles.uploadFile}>
              <div className={styles.fieldLabel}>DO Number</div>
              <div className={styles.reasonsMenu}>
                <div className={styles.input}>
                  <input 
                    type="text" 
                    value={doNumber}
                    onChange={(e) => setDoNumber(e.target.value)}
                    placeholder="Enter DO number"
                    className={styles.inputField}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className={`${styles.submitButton} ${!doNumber.trim() ? styles.disabled : ''}`}
            onClick={handleSubmit}
          >
            <div className={styles.button}>
              Submit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDeliveryOrderModal;