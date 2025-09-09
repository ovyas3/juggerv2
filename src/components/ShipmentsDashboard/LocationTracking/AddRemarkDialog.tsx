import React, { useState } from 'react';
import { httpsPost } from '@/utils/Communication';
import { useSnackbar } from '@/hooks/snackBar';
import styles from './AddRemarkDialog.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

interface AddRemarkDialogProps {
  show: boolean;
  onClose: () => void;
  shipmentId: string;
  onRemarkAdded: () => void;
}

const AddRemarkDialog: React.FC<AddRemarkDialogProps> = ({
  show,
  onClose,
  shipmentId,
  onRemarkAdded
}) => {
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const snackbar = useSnackbar();

  const handleSubmit = async () => {
    if (!remark.trim()) {
      snackbar.showMessage('Please enter a remark', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await httpsPost('shipment/remarks', {
        shipment_id: shipmentId,
        remark: remark.trim(),
        type: 'general'
      });

      if (response.statusCode === 200) {
        snackbar.showMessage('Remark added successfully', 'success');
        setRemark('');
        onRemarkAdded();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to add remark');
      }
    } catch (error: any) {
      console.error('Error adding remark:', error);
      snackbar.showMessage(
        error.message || 'Failed to add remark. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <ModalHeader 
          title="Add Remark" 
          onClose={onClose} 
        />
        
        <div className={styles.body}>
          <div className={styles.inputGroup}>
            <label htmlFor="remark">Remark</label>
            <textarea
              id="remark"
              className={styles.textarea}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter your remark here..."
              rows={5}
              disabled={isSubmitting}
            />
          </div>
          
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className={`${styles.button} ${styles.submitButton}`}
              onClick={handleSubmit}
              disabled={isSubmitting || !remark.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRemarkDialog;
