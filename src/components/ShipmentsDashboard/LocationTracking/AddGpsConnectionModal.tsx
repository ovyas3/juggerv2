// src/components/ShipmentsDashboard/Modals/AddGpsConnectionModal.tsx
import React from 'react';
import styles from './AddGpsConnectionModal.module.css';

interface AddGpsConnectionModalProps {
  show: boolean;
  onClose: () => void;
  selectedGps: string[];
  gpsOptions: string[];
  onGpsChange: (selected: string[]) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const AddGpsConnectionModal: React.FC<AddGpsConnectionModalProps> = ({
  show,
  onClose,
  selectedGps,
  gpsOptions,
  onGpsChange,
  onSubmit,
  isLoading = false,
}) => {
  if (!show) return null;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    onGpsChange(selected);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.dialog_title}>Add GPS Connection</div>
          <button className={styles.closeButton} onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.inputContainer}>
            <select 
              multiple 
              className={styles.selectInput}
              value={selectedGps}
              onChange={handleSelectChange}
              disabled={isLoading}
            >
              {gpsOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className={styles.helperText}>Hold Ctrl/Cmd to select multiple options</div>
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.submitButton}
            onClick={onSubmit}
            disabled={isLoading || selectedGps.length === 0}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGpsConnectionModal;