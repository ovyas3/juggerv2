import React from 'react';
import styles from './TotalFreightModal.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

interface FreightItem {
  id: string;
  carrier: string;
  amount: number;
  '%OfTotal': string;
  division?: string;
}

interface TotalFreightModalProps {
  show: boolean;
  onClose: () => void;
  totalFreightData: FreightItem[];
  title?: string;
}

const TotalFreightModal: React.FC<TotalFreightModalProps> = ({
  show,
  onClose,
  totalFreightData,
  title = 'Freight Breakdown'
}) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.detailsPopupDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.detailsPopupContainer}>
          <ModalHeader title={title} onClose={onClose} />
          
          <div className={styles.detailsTableContainer}>
            <div className={styles.detailsTableWrapper}>
              <table className={styles.detailsTable}>
                <thead>
                  <tr>
                    <th>Shipment ID</th>
                    <th>Division</th>
                    <th>Carrier</th>
                    <th>Freight Amount (₹)</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {totalFreightData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.division || '-'}</td>
                      <td>{item.carrier}</td>
                      <td>{item.amount.toLocaleString('en-IN')}</td>
                      <td>{item['%OfTotal']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalFreightModal;
