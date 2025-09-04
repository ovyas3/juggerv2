import React, { useState } from 'react';
import styles from './UpdateStatusModal.module.css';

interface StatusOption {
  value: string;
  label: string;
}
interface UpdateStatusModalProps {
    show: boolean;
    shipmentNo: string;
    shipmentDetails: {
      from: {
        location: {
          reference?: string;
          name: string;
          city: string;
        };
      };
      to: {
        location: {
          reference?: string;
          name: string;
          city: string;
        };
      };
    };
    statusOptions: Array<{
      id: string;
      name: string;
    }>;
    onUpdate: (status: string) => void;
    onClose: () => void;
    isLoading?: boolean;
    dIndex?: number;
  }
  
  const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
    show,
    shipmentNo,
    shipmentDetails,
    statusOptions,
    onUpdate,
    onClose,
    isLoading = false,
    dIndex = 1
  }) => {
    const [selectedStatus, setSelectedStatus] = useState<string>('');
  
    if (!show) return null;
  
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.dialogMain} onClick={(e) => e.stopPropagation()}>
          {isLoading && (
            <div className={styles.loader}>
              <div className={styles.load}>
                <div className={styles.spinner}></div>
              </div>
            </div>
          )}
          
          <div className={styles.section}>
            <div className={styles.header}>
              <div className={styles.label}>
                Update Shipment Status - {shipmentNo}
              </div>
              <i className={`${styles.materialIcons} ${styles.closeIcon}`} onClick={onClose}>
                clear
              </i>
            </div>
            
            <div className={styles.commentSection}>
              <div className={styles.uploadFile}>
                <div className={styles.card}>
                  <div className={styles.locTabs}>
                    <div className={styles.locTile}>
                      <div className={styles.icon}>
                        <span>
                          <label className={styles.pickIcon}>P1</label>
                        </span>
                        <span className={styles.location}>
                          {shipmentDetails.from.location.reference && 
                            `${shipmentDetails.from.location.reference} - `}
                          {shipmentDetails.from.location.name} - {shipmentDetails.from.location.city}
                        </span>
                      </div>
                    </div>
                    <div className={styles.locTile}>
                      <div className={styles.icon}>
                        <span>
                          <label className={styles.dropIcon}>D{dIndex}</label>
                        </span>
                        <span className={styles.location}>
                          {shipmentDetails.to.location.reference && 
                            `${shipmentDetails.to.location.reference} - `}
                          {shipmentDetails.to.location.name} - {shipmentDetails.to.location.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
  
                <div className={styles.statusLabel}>Shipment Status</div>
                <div className={styles.reasonsMenu}>
                  <select
                    className={styles.inputSelect}
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">Select status</option>
                    {statusOptions.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div 
              className={`${styles.submitButton} ${!selectedStatus ? styles.disabled : ''}`} 
              onClick={() => selectedStatus && onUpdate(selectedStatus)}
            >
              <div className={styles.button}>
                {isLoading ? 'Updating...' : 'Update Status'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default UpdateStatusModal;