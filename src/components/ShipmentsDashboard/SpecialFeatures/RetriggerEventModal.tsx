// RetriggerEventModal.tsx
import React, { useState } from 'react';
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from '@/utils/Communication';
import styles from './RetriggerEventModal.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

interface RetriggerEventModalProps {
  show: boolean;
  shipment: {
    _id: string;
    others?: {
      SAPShipmentDocNum?: string;
      ShipmentCost?: string;
      Invoice?: string;
    };
  };
  onClose: () => void;
  onSuccess?: () => void;
}

const RetriggerEventModal: React.FC<RetriggerEventModalProps> = ({
  show,
  shipment,
  onClose,
  onSuccess
}) => {
  const { showMessage } = useSnackbar();
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
  const [showConfirm, setShowConfirm] = useState<{
    show: boolean;
    type: number | null;
    message: string;
  }>({ show: false, type: null, message: '' });

  const events = [
    {
      id: 1,
      name: 'Vehicle Data Updation',
      data: shipment.others?.SAPShipmentDocNum || '',
      endpoint: '/v1/sendAllocationData'
    },
    {
      id: 2,
      name: 'Shipment Cost Updation',
      data: shipment.others?.ShipmentCost || '',
      endpoint: '/v1/sendShipCostData'
    },
    {
      id: 3,
      name: 'Commercial Invoice Updation',
      data: shipment.others?.Invoice || '',
      endpoint: '/v1/sendInvoiceData'
    }
  ];

  const handleRetriggerClick = (type: number, data: string) => {
    if (data) {
      setShowConfirm({
        show: true,
        type,
        message: `Data already present for this event - ${data}. Do you want to Proceed?`
      });
    } else {
      retriggerEvent(type, true);
    }
  };

  const retriggerEvent = async (type: number, shouldTrigger: boolean) => {
    setShowConfirm({ show: false, type: null, message: '' });
    
    if (!shouldTrigger) {
      onClose();
      return;
    }

    const event = events.find(e => e.id === type);
    if (!event) return;

    try {
      setIsLoading(prev => ({ ...prev, [type]: true }));
      const response = await httpsPost(
        event.endpoint,
        { shipment_id: shipment._id },
        {},
        4
      );

      if (response.statusCode === 200) {
        showMessage('Event re-triggered successfully', 'success');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Error retriggering event:', error);
      showMessage(
        error.response?.data?.message || 'Failed to retrigger event',
        'error'
      );
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <ModalHeader title="Missed Events" onClose={onClose} />

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Event</th>
                <th>Event Data Present</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{event.data || '-'}</td>
                  <td>
                    <button
                      className={styles.retriggerButton}
                      onClick={() => handleRetriggerClick(event.id, event.data)}
                      disabled={isLoading[event.id]}
                    >
                      {isLoading[event.id] ? 'Processing...' : 'Re-Trigger'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm.show && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmMessage}>{showConfirm.message}</div>
            <div className={styles.confirmButtons}>
              <button
                className={styles.confirmButton}
                onClick={() => showConfirm.type && retriggerEvent(showConfirm.type, true)}
              >
                Yes
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirm({ show: false, type: null, message: '' })}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetriggerEventModal;