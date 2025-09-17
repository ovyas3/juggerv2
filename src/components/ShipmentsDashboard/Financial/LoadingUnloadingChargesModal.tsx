import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LoadingUnloadingChargesModal.module.css';

interface LoadingUnloadingChargesModalProps {
  onClose: () => void;
  onSubmit: (amount: number, type: 'inbound' | 'outbound') => void;
  loadingType: 'inbound' | 'outbound';
  loadUnloadHeader: string;
  loading?: boolean;
}

const LoadingUnloadingChargesModal: React.FC<LoadingUnloadingChargesModalProps> = ({
  onClose,
  onSubmit,
  loadingType,
  loadUnloadHeader,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(Number(amount), loadingType);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            {t('MYSHIPMENTS.sin')} #{loadUnloadHeader}
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="number"
              className={styles.inputField}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder=" "
              required
              disabled={loading}
            />
            <label className={styles.floatingLabel}>
              {loadingType === 'outbound' 
                ? t('Add Loading Charges') 
                : t('Add Unloading Charges')}
            </label>
          </div>

          <div className={styles.footer}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading || !amount}
            >
              {loading ? (
                <span className={styles.loading} />
              ) : (
                t('Submit')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoadingUnloadingChargesModal;