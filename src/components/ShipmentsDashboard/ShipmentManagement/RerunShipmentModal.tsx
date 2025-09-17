import React, { useState } from 'react';
import styles from '../ShipmentsDashboard.module.css';

interface RerunShipmentModalProps {
  show: boolean;
  shipmentSIN: string;
  onClose: () => void;
  onSubmit: (data: {
    status: string;
    fromDate: string;
    toDate: string;
  }) => void;
}

const RerunShipmentModal: React.FC<RerunShipmentModalProps> = ({
  show,
  shipmentSIN,
  onClose,
  onSubmit,
}) => {
  const [status, setStatus] = useState('ITNS');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  if (!show) return null;

  const handleSubmit = () => {
    onSubmit({
      status,
      fromDate,
      toDate,
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.dialogMain} onClick={(e) => e.stopPropagation()}>
        <div className={styles.section}>
          <div className={styles.header}>
            <div className={styles.label}>Rerun Shipment</div>
            <i className={styles.materialIcons} onClick={onClose}>close</i>
          </div>
          <div className={styles.commentSection}>
            <div className={styles.inputValues}>
              <label>SIN</label>
              <input type="text" value={shipmentSIN} readOnly />
            </div>
            <div className={styles.inputValues}>
              <label>Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ITNS">In Transit</option>
                <option value="SP">Towards Pickup</option>
                <option value="AP">At Pickup</option>
              </select>
            </div>
            <div className={styles.inputValues}>
              <label>From Date</label>
              <input 
                type="datetime-local" 
                onChange={(e) => setFromDate(e.target.value)} 
              />
            </div>
            <div className={styles.inputValues}>
              <label>To Date</label>
              <input 
                type="datetime-local" 
                onChange={(e) => setToDate(e.target.value)} 
              />
            </div>
          </div>
          <div className={styles.submitButton}>
            <div className={styles.button} onClick={handleSubmit}>
              Submit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RerunShipmentModal;
