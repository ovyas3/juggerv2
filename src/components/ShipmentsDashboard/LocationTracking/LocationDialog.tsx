// src/components/ShipmentsDashboard/Modals/LocationDialog.tsx
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { MapPin, X } from "lucide-react";
import styles from "./LocationDialog.module.css";

interface LocationDialogProps {
  address: string;
  lastUpdated?: string;
  children: React.ReactNode;
}



export function LocationDialog({ address, lastUpdated, children }: LocationDialogProps) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className={`lastKnownDialog ${styles.dialogContent}`}>
        <div className={styles.headerRow}>
          <div className={styles.titleIcon}>
            <MapPin className={styles.icon} />
            <DialogTitle className={styles.title}>Last Known Location</DialogTitle>
          </div>
          <DialogClose asChild>
            <button className={styles.closeButton} aria-label="Close">
              <X size={20} />
            </button>
          </DialogClose>
        </div>
        <div className={styles.body}>
          <div className={styles.section}>
            <span className={styles.label}>Address</span>
            <p className={styles.value}>{address || 'No address available'}</p>
          </div>
          {lastUpdated && (
            <div className={styles.section}>
              <span className={styles.label}>Last Updated</span>
              <p className={styles.value}>
                {new Date(lastUpdated).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
      </Dialog>
    );
  }