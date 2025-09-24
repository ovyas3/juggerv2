import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './InvoiceTypeModal.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

interface InvoiceItem {
  invoiceType: 'CT' | 'PT';
  invoice: string;
  shippedQty: number | string;
  shippedNop: number | string;
  [key: string]: any; // For any additional properties
}

interface InvoiceTypeModalProps {
  show: boolean; 
  shipmentId: string;
  onClose: () => void;
  onSubmit: () => void;
  onTypeChange: (item: InvoiceItem, newType: 'CT' | 'PT') => void;
  invoiceData: InvoiceItem[];
  loading?: boolean;
}

const InvoiceTypeModal: React.FC<InvoiceTypeModalProps> = ({
  show,
  shipmentId,
  onClose,
  onSubmit,
  onTypeChange,
  invoiceData,
  loading = false,
}) => {
  const { t } = useTranslation();
  if (!show) return null;



  const columns = [
    { key: 'sno', label: 'S.No.' },
    { key: 'invoice_type', label: 'Invoice Type' },
    { key: 'invoice', label: 'Invoice' },
    { key: 'shippedQuantity', label: 'Shipped Quantity (MT)' },
    { key: 'shippedNoOfPieces', label: 'Shipped No Of Pieces' },
    { key: 'actions', label: 'Action' },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <ModalHeader
          title='Update Invoice Type'
          onClose={onClose}
        />

        <div className={styles.content}>
            <div className={styles.tableHeader}>
              <div className={styles.label}>Invoices</div>
            </div>
          <div className={styles.tableContainer}>
            
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {columns.map(column => (
                      <th key={column.key} className={styles.tableHeaderCell}>
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.map((item, index) => (
                    <tr key={index} className={styles.tableRow}>
                      <td className={styles.tableCell}>{index + 1}</td>
                      <td className={styles.tableCell}>{item.invoiceType}</td>
                      <td className={styles.tableCell}>{item.invoice}</td>
                      <td className={styles.tableCell}>{item.shippedQty}</td>
                      <td className={styles.tableCell}>{item.shippedNop}</td>
                      <td className={styles.tableCell}>
                        {item.invoiceType === 'CT' ? (
                          <button
                            className={styles.typeButton}
                            onClick={() => onTypeChange(item, 'PT')}
                            disabled={loading}
                          >
                            Mark as PT
                          </button>
                        ) : (
                          <button
                            className={styles.typeButton}
                            onClick={() => onTypeChange(item, 'CT')}
                            disabled={loading}
                          >
                            Mark as CT
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              className={styles.submitButton}
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loading} />
              ) : (
                t('Submit')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTypeModal;