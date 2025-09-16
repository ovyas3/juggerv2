// src/components/ShipmentsDashboard/Modals/LocationDialog.tsx
import { MapPin, X } from "lucide-react";
import styles from "./LocationDialog.module.css";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";

interface LocationDialogProps {
  address: string;
  lastUpdated?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  shipmentId?: string;
}

export function LocationDialog({
  address,
  lastUpdated,
  children,
  isOpen,
  onClose,
  shipmentId,
}: LocationDialogProps) {
  if (!isOpen) {
    return <>{children}</>;
  }

  const toShortDateTime = (date: any, format?: string) => {
    if (!date) return "";
    const dateObj = new Date(date);
    return dateObj.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {children}
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <ModalHeader
            title={`Last Known Location - #${shipmentId}`}
            onClose={onClose}
          />

          <div className={styles.body}>
            <div className={styles.section}>
              <span className={styles.label}>Address</span>
              <p className={styles.value}>
                {address || "No address available"}
              </p>
            </div>
            {lastUpdated && (
              <div className={styles.section}>
                <span className={styles.label}>Last Updated</span>
                <p className={styles.value}>{toShortDateTime(lastUpdated)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
