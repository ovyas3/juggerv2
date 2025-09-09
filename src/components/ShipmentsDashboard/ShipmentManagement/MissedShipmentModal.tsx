// MissedShipmentModal.tsx
import React, { useState } from 'react';
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from '@/utils/Communication';
import styles from './MissedShipmentModal.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

interface MissedShipmentModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MissedShipmentModal: React.FC<MissedShipmentModalProps> = ({
  show,
  onClose,
  onSuccess
}) => {
  const { showMessage } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    doNumber: '',
    vehicleNumber: '',
    registrationNumber: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    const { doNumber, vehicleNumber, registrationNumber } = formData;
    
    if (!doNumber || !vehicleNumber || !registrationNumber) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const response = await httpsPost(
        'v1/utility/pullMissedShipmentJSPL',
        {
          do_numbers: doNumber,
          vehicle_no: vehicleNumber,
          registration_number: registrationNumber
        },
        {},
        4
      );

      if (response.statusCode === 200) {
        showMessage('Missed Shipment Added', 'success');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || 'Failed to add missed shipment',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

         <ModalHeader title="Missed Shipment" onClose={onClose} />

        <div className={styles.body}>
          <div className={styles.formGroup}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                name="doNumber"
                value={formData.doNumber}
                onChange={handleInputChange}
                className={styles.inputField}
                required
              />
              <label className={styles.floatingLabel}>DO number</label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                className={styles.inputField}
                required
              />
              <label className={styles.floatingLabel}>Vehicle Number</label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className={styles.inputField}
                required
              />
              <label className={styles.floatingLabel}>Registration Number</label>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissedShipmentModal;