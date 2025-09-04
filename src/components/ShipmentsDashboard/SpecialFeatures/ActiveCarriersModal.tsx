import React from 'react';
import styles from '../ShipmentsDashboard.module.css';

interface CarrierData {
  carrier: string;
  sin: string;
  totalFreight: number;
}

interface ActiveCarriersModalProps {
  show: boolean;
  carriers: CarrierData[];
  onClose: () => void;
}

const ActiveCarriersModal: React.FC<ActiveCarriersModalProps> = ({
  show,
  carriers,
  onClose,
}) => {
  if (!show) return null;

  const totalFreight = carriers.reduce((sum, item) => sum + item.totalFreight, 0);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.detailsPopupDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.detailsPopupContainer}>
          <div className={styles.popupHeader}>
            <h2>Active Carriers</h2>
            <button onClick={onClose}>✕</button>
          </div>
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.label}>Total Carriers</div>
              <div className={styles.value}>{carriers.length}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.label}>Total Freight</div>
              <div className={styles.value}>₹{totalFreight.toLocaleString()}</div>
            </div>
          </div>
          <div className={styles.detailsTableContainer}>
            <table className={styles.detailsTable}>
              <thead>
                <tr>
                  <th>Carrier</th>
                  <th>Shipment ID</th>
                  <th>Total Freight</th>
                </tr>
              </thead>
              <tbody>
                {carriers.map((item, index) => (
                  <tr key={index}>
                    <td>{item.carrier}</td>
                    <td>{item.sin}</td>
                    <td>₹{item.totalFreight.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveCarriersModal;
