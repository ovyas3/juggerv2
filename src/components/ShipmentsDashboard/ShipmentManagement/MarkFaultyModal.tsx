// MarkFaultyModal.tsx
import React, { useState } from 'react';
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from '@/utils/Communication';
import styles from './MarkFaultyModal.module.css';
import Image from 'next/image'
import GPSFaultyIcon from "../../../assets/gps_faullty_icon.svg";
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

const MarkFaultyModal: React.FC<{
  show: boolean;
  vehicleNumber: string;
  gpsProvider: string;
  sin: string;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ show, vehicleNumber, gpsProvider, sin, onClose, onSuccess }) => {
  const { showMessage } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkFaulty = async () => {
    if (!vehicleNumber) {
      showMessage('Vehicle number is required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await httpsPost(
        'v1/markFaulty/otherDevices',
        { vehicle_no: vehicleNumber },
        {},
        4
      );

      if (response.statusCode === 200) {
        showMessage(
          `${gpsProvider} Marked as Faulty for Vehicle ${vehicleNumber}`,
          'success'
        );
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      showMessage(
        error.message || 'Failed to mark device as faulty',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.dialogMain} onClick={e => e.stopPropagation()}>
        <ModalHeader
        title={`Mark Fault Device - #${sin}`}
        onClose={onClose}
        />

        <div className={styles.dialogHeader}>
          <Image src={GPSFaultyIcon} alt="Faulty Device" width={24} height={24} />
        </div>

        <div className={styles.dialogBody}>
          <div className={styles.note}>
            {/* {gpsProvider && (
              <div className={styles.gpsProvider}>
                GPS Provider: {gpsProvider}
              </div>
            )} */}
            <p>Are you sure you want to mark this device as faulty?</p>
          </div>
        </div>

        <div className={styles.dialogFooter}>
          <button
            className={styles.confirmButton}
            onClick={handleMarkFaulty}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Yes'}
          </button>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isLoading}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkFaultyModal;