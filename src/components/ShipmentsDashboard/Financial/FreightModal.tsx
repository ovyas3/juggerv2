import React from 'react';
import styles from '../ShipmentsDashboard.module.css';

interface FreightData {
  id: string;
  carrier: string;
  amount: number;
  percent?: string;
}

interface FreightModalProps {
  show: boolean;
  title: string;
  data: FreightData[];
  showPercentage?: boolean;
  onClose: () => void;
}

const FreightModal: React.FC<FreightModalProps> = ({
  show,
  title,
  data,
  showPercentage = false,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.detailsPopupDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.detailsPopupContainer}>
          <div className={styles.popupHeader}>
            <h2>{title}</h2>
            <button onClick={onClose}>✕</button>
          </div>
          <div className={styles.detailsTableContainer}>
            <table className={styles.detailsTable}>
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Carrier</th>
                  <th>Freight Amount (₹)</th>
                  {showPercentage && <th>% of Total</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.carrier}</td>
                    <td>{item.amount.toLocaleString()}</td>
                    {showPercentage && <td>{item.percent}</td>}
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

export default FreightModal;
