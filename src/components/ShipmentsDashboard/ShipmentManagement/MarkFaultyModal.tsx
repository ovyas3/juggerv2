// src/components/ShipmentsDashboard/Modals/MarkFaultyModal.tsx
import React from 'react';
import styles from './MarkFaultyModal.module.css';

interface MarkFaultyModalProps {
  show: boolean;
  gpsProvider: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const MarkFaultyModal: React.FC<MarkFaultyModalProps> = ({
  show,
  gpsProvider,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <img src="/assets/gps_faullty_icon.svg" alt="Faulty GPS" className={styles.icon} />
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.message}>
            {gpsProvider && (
              <div className={styles.gpsProvider}>GPS Provider: {gpsProvider}</div>
            )}
            <p>Are you sure you want to mark this device as faulty?</p>
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isLoading}
          >
            No
          </button>
          <button 
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Yes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkFaultyModal;