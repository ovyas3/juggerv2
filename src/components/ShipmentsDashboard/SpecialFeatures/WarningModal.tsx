import React, { useState } from 'react';
import styles from './WarningModal.module.css';

interface WarningModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: (reassignType: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const WarningModal: React.FC<WarningModalProps> = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [reassignType, setReassignType] = useState<string>('driver');

  if (!show) return null;

  return (
    <div className={styles.warningOverlay}>
      <div className={styles.warningContainer}>
        <div className={styles.section}>
          <div className={styles.header}>
            <div className={styles.label}>
              {title}
              <i className={`${styles.materialIcons} ${styles.closeIcon}`} onClick={onCancel}>
                clear
              </i>
            </div>
          </div>
          <div className={styles.text}>
            {message}
            <div className={styles.reassignRadioSection}>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="driver"
                  name="reassign-type"
                  checked={reassignType === 'driver'}
                  onChange={() => setReassignType('driver')}
                />
                <label htmlFor="driver">Reassign Driver</label>
              </div>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="vehicle"
                  name="reassign-type"
                  checked={reassignType === 'vehicle'}
                  onChange={() => setReassignType('vehicle')}
                />
                <label htmlFor="vehicle">Reassign Vehicle</label>
              </div>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="both"
                  name="reassign-type"
                  checked={reassignType === 'both'}
                  onChange={() => setReassignType('both')}
                />
                <label htmlFor="both">Both Driver & Vehicle</label>
              </div>
            </div>
          </div>
          <div className={styles.submitButton} onClick={() => onConfirm(reassignType)}>
            <button className={styles.button} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;