import React from 'react';
import { RefreshCw, RotateCw, Send, FileText, Upload } from 'lucide-react';
import styles from './HeaderActions.module.css';

interface HeaderActionsProps {
  onFetchShipments: () => void;
  onUpdateVehicleArrival: () => void;
  onSendEPOD: () => void;
  onFetchInvoiceDetails: () => void;
  onBulkUpload: () => void;
  isTechnova?: boolean;
  isLoading?: boolean;
  hasSelectedShipments?: boolean;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  onFetchShipments,
  onUpdateVehicleArrival,
  onSendEPOD,
  onFetchInvoiceDetails,
  onBulkUpload,
  isTechnova = false,
  isLoading = false,
  hasSelectedShipments = false
}) => {

  return (
    <div className={styles.headerActions}>
      {/* {isTechnova && ( */}
        <>
          <button
            className={styles.matStrokedButton}
            onClick={onFetchShipments}
            disabled={isLoading}
          >
            <RefreshCw className={styles.lucideIcon} />
            Fetch Shipments 
          </button>
          <button
            className={styles.matStrokedButton}
            onClick={onUpdateVehicleArrival}
            disabled={!hasSelectedShipments || isLoading}
          >
            <RotateCw className={styles.lucideIcon} />
            Update Vehicle Arrival
          </button>
          <button
            className={styles.matStrokedButton}
            onClick={onSendEPOD}
            disabled={!hasSelectedShipments || isLoading}
          >
            <Send className={styles.lucideIcon} />
            Send EPOD Back To JDE
          </button>
          <button
            className={styles.matStrokedButton}
            onClick={onFetchInvoiceDetails}
            disabled={!hasSelectedShipments || isLoading}
          >
            <FileText className={styles.lucideIcon} />
            Fetch Invoice Details
          </button>
        </>
      {/* )} */}
      <button
        className={styles.matStrokedButton}
        onClick={onBulkUpload}
        disabled={isLoading}
      >
        <Upload className={styles.lucideIcon} />
        Bulk Upload
      </button>
    </div>
  );
};

export default HeaderActions;
