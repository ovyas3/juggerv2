import React, { useState } from 'react';
import styles from './IncreasePriceModal.module.css';
import { useTranslation } from 'react-i18next';

interface DealerType {
  value: string;
  name: string;
}

interface IncreasePriceModalProps {
  show: boolean;
  shipmentId: string;
  onClose: () => void;
  onSubmit: (dealerType: string) => Promise<void>;
  isLoading?: boolean;
}

const IncreasePriceModal: React.FC<IncreasePriceModalProps> = ({
  show,
  shipmentId,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [selectedDealerType, setSelectedDealerType] = useState<string>('');
  
  // These would typically come from props or API
  const dealerTypes: DealerType[] = [
    { value: 'dealer1', name: t('DEALER_TYPES.dealer1') },
    { value: 'dealer2', name: t('DEALER_TYPES.dealer2') },
    // Add more dealer types as needed
  ];

  const handleSubmit = async () => {
    if (!selectedDealerType) return;
    await onSubmit(selectedDealerType);
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.label}>
            {t('MYSHIPMENTS.recalculate_freight')}
          </div>
          <div className={styles.close} onClick={onClose}>
            <span className="material-icons" style={{ cursor: 'pointer' }}>
              close
            </span>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.inputContainer}>
            <div className={styles.title}>
              {t('MYSHIPMENTS.select_dealer_type')}
            </div>
            <select 
              className={styles.selectInput}
              value={selectedDealerType}
              onChange={(e) => setSelectedDealerType(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select Dealer Type</option>
              {dealerTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.submitButton}>
            <button 
              className={styles.button} 
              onClick={handleSubmit}
              disabled={!selectedDealerType || isLoading}
            >
              {isLoading ? (
                <div className={styles.spinner}></div>
              ) : (
                t('PRINT_LR.submit')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncreasePriceModal;