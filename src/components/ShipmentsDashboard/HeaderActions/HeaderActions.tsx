// HeaderActions.tsx
import React, { useEffect, useRef, useState } from "react";
import { RefreshCw, RotateCw, Send, FileText, Upload, MoreHorizontal, AlertCircle } from "lucide-react";
import styles from "./HeaderActions.module.css";
import BulkUpload from "../SpecialFeatures/BulkUpload";

interface HeaderActionsProps {
  onFetchShipments: () => void;
  onUpdateVehicleArrival: () => void;
  onSendEPOD: () => void;
  onFetchInvoiceDetails: () => void;
  onBulkUpload: () => void;
  isTechnova?: boolean;
  isLoading?: boolean;
  hasSelectedShipments?: boolean;
  onMissedShipment?: () => void; 
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  onFetchShipments,
  onUpdateVehicleArrival,
  onSendEPOD,
  onFetchInvoiceDetails,
  onBulkUpload,
  isTechnova = false,
  isLoading = false,
  hasSelectedShipments = false,
  onMissedShipment,
}) => {
  const [open, setOpen] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadType, setBulkUploadType] = useState<"shipment">("shipment");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleBulkUpload = () => {
    setBulkUploadType("shipment");
    setShowBulkUpload(true);
  };

  return (
    <div className={styles.headerActions} data-technova={isTechnova} ref={rootRef}>
      <div className={styles.dropdown}>
        <button
          type="button"
          className={`${styles.matStrokedButton} ${styles.otherActionsButton}`}
          onClick={() => setOpen(v => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={isLoading}
        >
          <MoreHorizontal className={styles.lucideIcon} />
          Other Actions
        </button>

        {open && (
          <div className={styles.menu} role="menu">
            <button
              className={styles.menuItem}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onFetchShipments();
              }}
              disabled={isLoading}
            >
              <RefreshCw className={styles.lucideIcon} />
              Fetch Shipments
            </button>

            <button
              className={styles.menuItem}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onUpdateVehicleArrival();
              }}
              disabled={!hasSelectedShipments || isLoading}
            >
              <RotateCw className={styles.lucideIcon} />
              Update Vehicle Arrival
            </button>

            <button
              className={styles.menuItem}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSendEPOD();
              }}
              disabled={!hasSelectedShipments || isLoading}
            >
              <Send className={styles.lucideIcon} />
              Send EPOD Back To JDE
            </button>

            <button
              className={styles.menuItem}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onFetchInvoiceDetails();
              }}
              disabled={!hasSelectedShipments || isLoading}
            >
              <FileText className={styles.lucideIcon} />
              Fetch Invoice Details
            </button>
            <button
              className={styles.menuItem}
              role="menuitem"
              onClick={handleBulkUpload}
              disabled={isLoading}
            >
              <Upload className={styles.lucideIcon} />
              Bulk Upload
            </button>
            <button
              className={styles.menuItem}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onMissedShipment && onMissedShipment();
              }}
              disabled={!hasSelectedShipments || isLoading}
            >
              <AlertCircle className={styles.lucideIcon} />
              Missed Shipment
            </button>
          </div>
        )}
      </div>


      {showBulkUpload && (
        <BulkUpload
          open={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          type={bulkUploadType}
        />
      )}
    </div>
  );
};

export default HeaderActions;
