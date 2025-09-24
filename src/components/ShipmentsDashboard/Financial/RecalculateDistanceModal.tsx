import React, { useState, useEffect } from "react";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import styles from "./RecalculateDistanceModal.module.css";
import { httpsPost } from "@/utils/Communication";
import { useSnackbar } from "@/hooks/snackBar";

interface RecalculateDistanceModalProps {
  show: boolean;
  onClose: () => void;
  shipmentId: string;
  sin?: string;
  pickupAddresses: string[];
  deliveryAddresses: string[];
}

const RecalculateDistanceModal: React.FC<RecalculateDistanceModalProps> = ({
  show,
  onClose,
  shipmentId,
  sin = "",
  pickupAddresses = [],
  deliveryAddresses = [],
}) => {
  const { showMessage } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const recalculateDistance = async () => {
    try {
      setIsLoading(true);
      const payload = { shipment: shipmentId };
      const response = await httpsPost("v1/utility/calculateETA", payload);

      if (response.statusCode === 200) {
        showMessage("Distance recalculated successfully", "success");
        onClose();
      } else {
        throw new Error(response.message || "Failed to recalculate distance");
      }
    } catch (error: any) {
      console.error("Error recalculating distance:", error);
      showMessage(error.message || "Error recalculating distance", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          title={`Recalculate Distance - #${sin}`}
          onClose={onClose}
        />

        <div className={styles.modalBody}>
          {/* <div className={styles.sinNumber}>
            <p>SIN: {sin || "Not available"}</p>
          </div> */}

          <div className={styles.addressesContainer}>
            <div className={styles.addressBox}>
              <div className={styles.addressContent}>
                {pickupAddresses.length > 0 ? (
                  pickupAddresses.map((address, index) => (
                    <div key={`pickup-${index}`} className={styles.addressItem}>
                      <div
                        className={styles.addressBadge}
                        style={{ backgroundColor: "#0b7d2e" }}
                      >
                        P{index + 1}
                      </div>
                      <div className={styles.addressText}>{address}</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noAddress}>
                    No pickup addresses available
                  </div>
                )}
              </div>
            </div>

            <div className={styles.addressBox}>
              <div className={styles.addressContent}>
                {deliveryAddresses.length > 0 ? (
                  deliveryAddresses.map((address, index) => (
                    <div
                      key={`delivery-${index}`}
                      className={styles.addressItem}
                    >
                      <div
                        className={styles.addressBadge}
                        style={{ backgroundColor: "#d8511f" }}
                      >
                        D{index + 1}
                      </div>
                      <div className={styles.addressText}>{address}</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noAddress}>
                    No delivery addresses available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* <div className={styles.buttonContainer}>
            <button 
              className={styles.recalculateButton}
              onClick={recalculateDistance}
              disabled={isLoading}
            >
              {isLoading ? 'Recalculating...' : 'Recalculate Distance'}
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default RecalculateDistanceModal;
