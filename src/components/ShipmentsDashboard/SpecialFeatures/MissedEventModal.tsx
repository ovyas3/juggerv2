import React, { useState, useEffect } from "react";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from "@/utils/Communication";
import styles from "./MissedEventModal.module.css";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";

interface MissedEvent {
  name: string;
  value: string;
}

interface MissedEventModalProps {
  show: boolean;
  shipmentId: string;
  onClose: () => void;
  onSuccess?: () => void;
  sin: string;
}

const MissedEventModal: React.FC<MissedEventModalProps> = ({
  show,
  shipmentId,
  onClose,
  onSuccess,
  sin,
}) => {
  const { showMessage } = useSnackbar();

  // State variables matching Angular component
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [missedEvents, setMissedEvents] = useState<MissedEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [doNumber, setDoNumber] = useState("");
  const [eventData, setEventData] = useState("");

  // Missed events array matching Angular code
  const missed: MissedEvent[] = [
    { name: "Parking Out", value: "PO" },
    { name: "Gate In", value: "GI" },
    { name: "Tare Weight", value: "TW" },
    { name: "Gross Weight", value: "GW" },
    { name: "Post Goods", value: "PG" },
    { name: "Test Certificate", value: "TC" },
    { name: "Invoice", value: "IV" },
    { name: "Lorry Receipt", value: "LR" },
    { name: "E-way Bill", value: "EW" },
    { name: "Gate Out", value: "GO" },
  ];

  useEffect(() => {
    setMissedEvents(missed);
  }, []);

  // Reset function matching Angular closeMissedEvent
  const resetModal = () => {
    setSelectedEvent("");
    setDoNumber("");
    setEventData("");
    setIsLoading(false);
    setIsFetching(false);
  };

  // Handle close matching Angular closeMissedEvent function
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Fetch function matching Angular showdata function
  const handleFetch = async () => {
    if (!selectedEvent) {
      showMessage("Please select an event", "error");
      return;
    }

    try {
      setIsFetching(true);

      type Payload = {
        event: string;
        shipment: string;
        OD_number?: string;
        display: boolean;
      };

      const payload: Payload = {
        event: selectedEvent,
        shipment: shipmentId,
        display: true,
      };

      // Add DO number if provided (matching Angular logic)
      if (doNumber) {
        payload.OD_number = doNumber;
      }

      const response = await httpsPost(
        "v1/utility/pullMissedEventsJSPL",
        payload,
        {},
        4
      );

      // Format response data matching Angular JSON.stringify logic
      setEventData(JSON.stringify(response.data || {}, null, 2));
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Failed to fetch event data",
        "error"
      );
    } finally {
      setIsFetching(false);
    }
  };

  // Submit function matching Angular addMissedEvents function
  const handleSubmit = async () => {
    if (!selectedEvent) {
      showMessage("Please select an event", "error");
      return;
    }

    // Validation for IV event requiring DO number (matching Angular validation)
    if (selectedEvent === "IV" && !doNumber) {
      showMessage("DO Number is Mandatory for IV", "error");
      return;
    }

    try {
      setIsLoading(true);

      type Payload = {
        event: string;
        shipment: string;
        OD_number?: string;
        display: boolean;
      };

      const payload: Payload = {
        event: selectedEvent,
        shipment: shipmentId,
        display: false,
      };

      // Add DO number if provided (matching Angular ternary logic)
      if (doNumber) {
        payload.OD_number = doNumber;
      }

      const response = await httpsPost(
        "v1/utility/pullMissedEventsJSPL",
        payload,
        {},
        4
      );

      if (response.statusCode === 200) {
        showMessage("Missed Event Added", "success");
        onSuccess?.();
        handleClose();
      }
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Failed to add missed event",
        "error"
      );
      handleClose(); // Match Angular error handling that calls closeMissedEvent
    } finally {
      setIsLoading(false);
    }
  };

  // Reset states when modal opens/closes
  useEffect(() => {
    if (show) {
      resetModal();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.dialogMissedEvent}>
        <ModalHeader title="Missed Events" onClose={handleClose} />

        <div className={styles.dialogBody}>
          {/* Missed Event Selection */}
          <div className={styles.driverDetailsSec}>
            <div className={styles.mwgContainer}>
              <div className={styles.searchDetailsSec}>
                <div className={styles.item}>
                  <div className={styles.input}>
                    <Select
                      value={selectedEvent}
                      onValueChange={setSelectedEvent}
                      disabled={isLoading || isFetching}
                    >
                      <SelectTrigger className={styles.select}>
                        <SelectValue
                          placeholder="Select Missed Event"
                          className={styles.selectValue}
                        />
                      </SelectTrigger>
                      <SelectContent className={styles.selectContent} style={{
    overflowY: 'auto',
    scrollbarWidth: 'auto',
    msOverflowStyle: 'auto'
  }} >
                        {missedEvents.map((event) => (
                          <SelectItem
                            key={event.value}
                            value={event.value}
                            className={styles.selectItem}
                          >
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <label className={styles.floatingLabel}>Missed Event</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DO Number Input */}
          <div className={styles.driverDetailsSec}>
            <div className={styles.mwgContainer}>
              <div className={styles.searchDetailsSec}>
                <div className={styles.item}>
                  <div className={styles.input}>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={doNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^[0-9]+$/.test(value)) {
                          setDoNumber(value);
                        }
                      }}
                      maxLength={20}
                      placeholder=" "
                      disabled={isLoading || isFetching}
                    />
                    <label className={styles.floatingLabel}>DO number</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning message matching Angular template */}
            <div
              style={{
                fontFamily: "Inter",
                paddingLeft: "8px",
                paddingBottom: "20px",
                fontSize: "10px",
                color: "red",
              }}
            >
              DO Number is Mandatory for IV
            </div>
          </div>

          {/* Fetch Section */}
          <div className={styles.fetchSection}>
            <button
              className={styles.fetchBtn}
              onClick={handleFetch}
              disabled={isLoading || isFetching || !selectedEvent}
            >
              {isFetching ? "Fetching..." : "Fetch"}
            </button>

            {/* Event Data Textarea */}
            <div style={{ paddingTop: "20px" }}>
              <textarea
                value={eventData}
                readOnly
                style={{
                  width: "450px",
                  height: "108px",
                  border: "1px solid black",
                  textAlign: "left" as const,
                  background: "#FFFFFF",
                  opacity: 1,
                  padding: "8px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer with Submit Button */}
        <div className={styles.dialogFooter}>
          <button
            className={styles.dialogFooterBtn}
            onClick={handleSubmit}
            disabled={isLoading || isFetching || !selectedEvent}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissedEventModal;
