import React from 'react';
import styles from './ConfirmationDialog.module.css';
import ModalHeader from '../ModalHeader/ModalHeader';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <ModalHeader title={title} onClose={onCancel} />
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={onCancel}
              disabled={isProcessing}
            >
              {cancelText}
            </button>
            <button
              className={`${styles.button} ${styles.confirmButton}`}
              onClick={onConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
