import React from 'react';
import styles from '../ShipmentsDashboard.module.css';

interface FreightItem {
  id: string;
  carrier: string;
  amount: number;
  percent: string;
}

interface TotalFreightModalProps {
  show: boolean;
  onClose: () => void;
  totalFreightData: FreightItem[];
}

const TotalFreightModal: React.FC<TotalFreightModalProps> = ({
  show,
  onClose,
  totalFreightData
}) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.detailsPopupDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.detailsPopupContainer}>
          <div className={styles.popupHeader}>
            <h2>Total Freight Breakdown</h2>
            <button onClick={onClose}>
              ✕
            </button>
          </div>
          <div className={styles.detailsTableContainer}>
            <table className={styles.detailsTable}>
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Carrier</th>
                  <th>Freight Amount (₹)</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {totalFreightData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.carrier}</td>
                    <td>{item.amount.toLocaleString()}</td>
                    <td>{item.percent}</td>
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

export default TotalFreightModal;
