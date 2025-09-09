import React, { useEffect, useState } from 'react';
import styles from './IncreasePriceModal.module.css';
import CloseIcon from '@mui/icons-material/Close';
import ModalHeader from '../../UI/ModalHeader/ModalHeader';

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
  const [selectedDealerType, setSelectedDealerType] = useState<string>('');
  const [dealerTypes, setDealerTypes] = useState<DealerType[]>([{ name: 'Carrier', value: 'carrier' }]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const shipperData = JSON.parse(localStorage.getItem('shippers') || '[]');
        if (shipperData.length > 0) {
          const userType = shipperData[0].type || 'normal';
          setDealerTypes(
            userType === '4pl' 
              ? [
                  { name: 'Carrier', value: 'carrier' },
                  { name: 'Client', value: 'client' }
                ]
              : [
                  { name: 'Carrier', value: 'carrier' }
                ]
          );
        }
      } catch (error) {
        console.error('Error parsing shipper data:', error);
      }
    }
  }, []);


  const handleSubmit = async () => {
    if (!selectedDealerType) return;
    await onSubmit(selectedDealerType);
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
      <ModalHeader 
        title="Recalculate Freight" 
        onClose={onClose} 
      />
        <div className={styles.body}>
          <div className={styles.inputContainer}>
            <div className={styles.title}>
              Select Dealer Type
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
                'Submit'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncreasePriceModal;