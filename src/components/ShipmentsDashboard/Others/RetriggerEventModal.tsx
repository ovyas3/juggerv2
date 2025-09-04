import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './RetriggerEventModal.module.css';

interface ShipmentData {
  others?: {
    SAPShipmentDocNum?: string;
    ShipmentCost?: string;
    Invoice?: string;
  };
}

interface RetriggerEventModalProps {
  onClose: () => void;
  onRetrigger: (eventType: number, eventData: string | null) => void;
  selectedShipment: ShipmentData | null;
  loading?: boolean;
}

const RetriggerEventModal: React.FC<RetriggerEventModalProps> = ({
  onClose,
  onRetrigger,
  selectedShipment,
  loading = false,
}) => {
  const { t } = useTranslation();

  const events = [
    {
      id: 1,
      name: 'Vehicle Data Updatation',
      dataKey: 'SAPShipmentDocNum',
      label: 'SAP Shipment Doc Number'
    },
    {
      id: 2,
      name: 'Shipment Cost Updatation',
      dataKey: 'ShipmentCost',
      label: 'Shipment Cost'
    },
    {
      id: 3,
      name: 'Commercial Invoice Updatation',
      dataKey: 'Invoice',
      label: 'Invoice'
    }
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.dialogTitle}>
            {t('MYSHIPMENTS.missedShipment')}
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}><b>Event</b></th>
                <th className={styles.tableHeader}><b>Event Data Present</b></th>
                <th className={styles.tableHeader}><b>Action</b></th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => {
                const eventData = selectedShipment?.others?.[event.dataKey as keyof typeof selectedShipment.others] || '';
                return (
                  <tr key={event.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{event.name}</td>
                    <td className={styles.tableCell}>{eventData || '-'}</td>
                    <td className={styles.tableCell}>
                      <button
                        className={styles.retriggerButton}
                        onClick={() => onRetrigger(event.id, eventData || null)}
                        disabled={loading || !eventData}
                      >
                        {loading ? (
                          <span className={styles.loading} />
                        ) : (
                          'Re-Trigger'
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RetriggerEventModal;
