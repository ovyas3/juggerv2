import React, { useState, useEffect } from "react";
import styles from "./AddGpsConnectionModal.module.css";
import { httpsGet, httpsPost } from "@/utils/Communication";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import Loader from "@/components/UI/Loader/Loader";
import { MultiSelect } from "@/components/UI/MultiSelect/MultiSelect";
import { useSnackbar } from "@/hooks/snackBar";

interface GpsOption {
  label: string;
  value: string;
}

interface AddGpsConnectionModalProps {
  show: boolean;
  onClose: () => void;
  selectedGps: string[];
  onGpsChange: (selected: string[]) => void;
  driverType: "temporary" | "own";
  attachedDriverId?: string;
  vehicleId?: string;
  onSuccess?: () => void;
  isLoading?: boolean;
  sin?: string;
}

const AddGpsConnectionModal: React.FC<AddGpsConnectionModalProps> = ({
  show,
  onClose,
  selectedGps,
  onGpsChange,
  driverType,
  attachedDriverId,
  vehicleId,
  onSuccess,
  isLoading = false,
  sin,
}) => {
  const { showMessage } = useSnackbar();
  const [gpsOptions, setGpsOptions] = useState<GpsOption[]>([]);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGpsOptions = async () => {
      if (!show) return;

      setIsLoadingGps(true);
      setError(null);

      try {
        const response = await httpsGet("settings/constants", 4);
        if (response.statusCode === 200 && response?.data?.gps) {
          const options = response.data.gps.map(
            (gps: { name: string; value: string }) => ({
              label: gps.name,
              value: gps.value,
            })
          );
          setGpsOptions(options);
        } else {
          setError("Failed to load GPS options.");
        }
      } catch (err) {
        console.error("Failed to fetch GPS options:", err);
        setError("Failed to load GPS options. Please try again later.");
      } finally {
        setIsLoadingGps(false);
      }
    };

    fetchGpsOptions();
  }, [show]);

  const handleSubmit = async () => {
    if (!selectedGps.length) {
      showMessage("Please select at least one GPS provider", "error");
      return;
    }

    setIsSubmitting(true);
    const provider = selectedGps.join(", ");

    try {
      let payload;
      if (driverType === "temporary") {
        if (!attachedDriverId) {
          throw new Error("Driver ID is required for temporary drivers");
        }
        payload = {
          attachedDriverId,
          gps: provider.toLowerCase(),
        };
      } else if (driverType === "own") {
        if (!vehicleId) {
          throw new Error("Vehicle ID is required");
        }
        payload = {
          vehicleId,
          gps: provider.toLowerCase(),
        };
      } else {
        throw new Error("Invalid driver type");
      }

      const response = await httpsPost(
        "vehicle/addGpsConnection",
        payload,
        {},
        4
      );

      if (response.statusCode === 200) {
        showMessage("GPS added successfully", "success");
        onGpsChange([]);
        onClose();
        onSuccess?.();
      } else {
        throw new Error(response.message || "Failed to add GPS connection");
      }
    } catch (error: any) {
      console.error("Error adding GPS connection:", error);
      showMessage(
        error.message || "An error occurred while adding GPS connection",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <ModalHeader title={`Add GPS Connection - #${sin}`} onClose={onClose} />

        <div className={styles.body}>
          {isLoadingGps ? (
            <Loader />
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <>
              <div className={styles.inputContainer}>
                <MultiSelect
                  options={gpsOptions.map((opt) => ({
                    id: opt.value,
                    label: opt.label,
                    selected: selectedGps.includes(opt.value),
                  }))}
                  onChange={(updatedOptions) => {
                    onGpsChange(
                      updatedOptions
                        .filter((opt) => opt.selected)
                        .map((opt) => opt.id)
                    );
                  }}
                  label="Select Provider"
                />
              </div>

              <div className={styles.buttonContainer}>
                <button
                  className={`${styles.button} ${styles.cancelButton}`}
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className={`${styles.button} ${styles.submitButton}`}
                  onClick={handleSubmit}
                  disabled={
                    isLoading || selectedGps.length === 0 || isSubmitting
                  }
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddGpsConnectionModal;
