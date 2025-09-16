import React, { useState, useEffect } from "react";
import styles from "./PullFreightModal.module.css";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsGet } from "@/utils/Communication";

interface PullFreightModalProps {
  _id: string;
  show: boolean;
  sin: string;
  vehicleNo: string;
  pickup: string;
  destinations: any;
  onClose: () => void;
  onGetFreight: (data: {
    destination: string;
    freightRate: string;
  }) => Promise<void>;
}

const PullFreightModal: React.FC<PullFreightModalProps> = ({
  _id,
  show,
  sin,
  vehicleNo,
  pickup,
  destinations = [],
  onClose,
  onGetFreight,
}) => {
  const { showMessage } = useSnackbar();
  const [selectedDestination, setSelectedDestination] = useState("");
  const [freightRate, setFreightRate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (show) {
      fetchCities();
    }
  }, [show]);

  const fetchCities = async () => {
    try {
      const response = await httpsGet("v1/shipment/getCities", 7);
      if (response.statusCode === 200) {
        setCities(response.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching cities:", error);
      showMessage(error.error?.message || "Failed to load cities", "error");
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedDestination(value);
    setShowDropdown(true);
  };

  const selectDestination = (city: string) => {
    setSelectedDestination(city);
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (!selectedDestination) {
      showMessage("Please select a delivery location", "error");
      return;
    }

    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        destination: selectedDestination.toLowerCase(),
        shipment: _id,
      }).toString();

      const response = await httpsGet(
        `/freight_rate_route_code/get?${queryParams}`,
        6
      );

      if (response.statusCode !== 200) {
        throw new Error(response.message || "Failed to fetch freight rate");
      }

      onGetFreight({
        destination: selectedDestination,
        freightRate: response.data?.toString() || "",
      });

      onClose();
    } catch (error: any) {
      console.error("Error pulling freight:", error);
      showMessage(error.message || "Failed to fetch freight rate", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialogPullFreight}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title={`Pull Freight with Routes - #${sin}`}
          onClose={onClose}
        />

        <div className={styles.dialog_body}>
          <div className={styles.driverDetailsSec}>
            <div className={styles.mwgContainer}>
              <div className={styles.SearchDetailsSec}>
                <div className={styles.item}>
                  <div className={styles.input}>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={sin}
                      disabled
                      placeholder=" "
                    />
                    <label className={styles.floatingLabel}>SIN</label>
                  </div>
                </div>
                <div className={styles.item}>
                  <div className={styles.input}>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={vehicleNo}
                      disabled
                      placeholder=" "
                    />
                    <label className={styles.floatingLabel}>Vehicle No</label>
                  </div>
                </div>
                <div className={styles.item}>
                  <div className={styles.input}>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={pickup}
                      disabled
                      placeholder=" "
                    />
                    <label className={styles.floatingLabel}>
                      Pickup Location
                    </label>
                  </div>
                </div>
                <div className={styles.item}>
                  <div
                    className={styles.input}
                    style={{ position: "relative" }}
                  >
                    <input
                      type="text"
                      className={styles.inputField}
                      value={selectedDestination}
                      onChange={handleDestinationChange}
                      onFocus={() => setShowDropdown(true)}
                      placeholder=" "
                    />
                    <label className={styles.floatingLabel}>
                      Delivery Location
                    </label>
                    {showDropdown && cities.length > 0 && (
                      <div className={styles.dropdown}>
                        {cities
                          .filter((city) =>
                            city
                              .toLowerCase()
                              .includes(selectedDestination.toLowerCase())
                          )
                          .map((city, index) => (
                            <div
                              key={index}
                              className={styles.dropdownItem}
                              onClick={() => selectDestination(city)}
                            >
                              {city}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.item}>
                  <div className={styles.input}>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={freightRate}
                      onChange={(e) => setFreightRate(e.target.value)}
                      placeholder=" "
                    />
                    <label className={styles.floatingLabel}>
                      Freight Rate (₹)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.dialog_footer}>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Pull Freight"}
          </button>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isLoading}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default PullFreightModal;
