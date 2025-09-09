import React, { useState } from 'react';
import { RefreshCw, RotateCw, Send, FileText, Upload } from 'lucide-react';
import styles from './HeaderActions.module.css';
import BulkUpload from '../SpecialFeatures/BulkUpload';

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
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadType, setBulkUploadType] = useState('shipment');

  const handleBulkUpload = () => {
    setBulkUploadType('shipment');
    setShowBulkUpload(true);
  };

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
        onClick={handleBulkUpload}
        disabled={isLoading}
      >
        <Upload className={styles.lucideIcon} />
        Bulk Upload
      </button>

      {showBulkUpload && (
  <BulkUpload
    open={showBulkUpload}
    onClose={() => setShowBulkUpload(false)}
    type="shipment"
  />
)}
    </div>
  );
};

export default HeaderActions;
