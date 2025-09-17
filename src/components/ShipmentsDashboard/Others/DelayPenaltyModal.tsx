import React, { useState } from 'react';
import styles from '../ShipmentsDashboard.module.css';

interface DelayData {
  sin: string;
  penalty: number;
  reason?: string;
  status?: string;
  suggested_amount?: string;
}

interface DelayPenaltyModalProps {
  show: boolean;
  delayData: DelayData;
  onClose: () => void;
  onApprove: (status: 'APPROVED' | 'REJECTED') => void;
}

const DelayPenaltyModal: React.FC<DelayPenaltyModalProps> = ({
  show,
  delayData,
  onClose,
  onApprove,
}) => {
  const [checked, setChecked] = useState(false);
  const [suggestedAmount, setSuggestedAmount] = useState(delayData.suggested_amount || '');
  const isPending = delayData.status === 'PENDING';

  if (!show) return null;

  const handleApprove = () => {
    onApprove('APPROVED');
  };

  const handleReject = () => {
    onApprove('REJECTED');
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.delayDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          Delay Penalty
          <i className={styles.materialIcons} onClick={onClose}>close</i>
        </div>
        <div className={styles.section}>
          <div className={styles.text}>Shipment ID: {delayData.sin}</div>
          <div className={styles.penaltyDetails}>
            <div className={styles.penaltyAmount}>
              <div className={styles.title}>Penalty Amount</div>
              <div className={styles.colon}>:</div>
              <div className={styles.box}>₹{delayData.penalty}</div>
            </div>
            <div className={styles.reasonBox}>
              <div className={styles.title}>Reason</div>
              <div className={styles.colon}>:</div>
              <div className={styles.box}>{delayData.reason || 'N/A'}</div>
            </div>
            <div className={styles.reasonBox}>
              <div className={styles.title}>Status</div>
              <div className={styles.colon}>:</div>
              <div className={styles.box}>{delayData.status || 'PENDING'}</div>
            </div>
            {isPending && (
              <>
                <div className={styles.reasonBox}>
                  <div className={styles.title}>Suggested Amount</div>
                  <div className={styles.colon}>:</div>
                  <div className={styles.input}>
                    <input 
                      type="number" 
                      value={suggestedAmount}
                      onChange={(e) => setSuggestedAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.reasonBox}>
                  <div className={styles.title}>Waive Off</div>
                  <div className={styles.colon}>:</div>
                  <div className={styles.checkbox}>
                    <input 
                      type="checkbox" 
                      checked={checked} 
                      onChange={(e) => setChecked(e.target.checked)} 
                    />
                  </div>
                </div>
                <div className={styles.submitButton}>
                  <div 
                    className={`${styles.button} ${styles.leftFloat}`} 
                    onClick={handleReject}
                  >
                    Reject
                  </div>
                  <div 
                    className={`${styles.button} ${styles.rightFloat}`} 
                    onClick={handleApprove}
                  >
                    Approve
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelayPenaltyModal;
