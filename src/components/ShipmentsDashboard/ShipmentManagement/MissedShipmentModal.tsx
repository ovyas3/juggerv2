import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MissedShipmentModal.module.css';

interface MissedShipmentModalProps {
  onClose: () => void;
  onSubmit: (data: { doNumber: string; vehicleNumber: string; regNumber: string }) => void;
  loading?: boolean;
}

const MissedShipmentModal: React.FC<MissedShipmentModalProps> = ({
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    doNumber: '',
    vehicleNumber: '',
    regNumber: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.dialogTitle}>
            {t('MYSHIPMENTS.missedShipment')}
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="doNumber"
                className={styles.inputField}
                value={formData.doNumber}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <label className={styles.floatingLabel}>
                {t('DO number')}
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="vehicleNumber"
                className={styles.inputField}
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <label className={styles.floatingLabel}>
                {t('Vehicle Number')}
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="regNumber"
                className={styles.inputField}
                value={formData.regNumber}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <label className={styles.floatingLabel}>
                {t('Registration Number')}
              </label>
            </div>
          </div>

          <div className={styles.footer}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? t('common.submitting') : t('Submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MissedShipmentModal;
