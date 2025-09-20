import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import styles from "./CompleteShipmentModal.module.css";
import ModalHeader from "../../UI/ModalHeader/ModalHeader";
import { httpsGet, httpsPost, httpsPut } from "@/utils/Communication";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";
import { useSnackbar } from "@/hooks/snackBar";

interface CompleteShipmentModalProps {
  show: boolean;
  onClose: () => void;
  shipment: {
    _id: string;
    sin: string;
    from?: string;
    to?: string;
    shipmentType?: string;
    drop?: any;
  };
  isLoading?: boolean;
  fetchShipments: () => void;
  setShowCompleteShipmentModal: (show: boolean) => void;
}

interface DateTimeState {
  date: Date | null;
  time: string;
  date_time: string;
}

export const CompleteShipmentModal: React.FC<CompleteShipmentModalProps> = ({
  show,
  onClose,
  shipment,
  isLoading = false,
  fetchShipments,
  setShowCompleteShipmentModal,
}) => {
  const { showMessage } = useSnackbar();
  const [reason, setReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [isProceeding, setIsProceeding] = useState(false);
  const [reasons, setReasons] = useState<string[]>(["Other"]);
  const [isJSPL, setIsJSPL] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const now = new Date();
  const [arrival, setArrival] = useState<DateTimeState>({
    date: now,
    time: now
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .slice(0, 5),
    date_time: now.toISOString(),
  });

  const [completion, setCompletion] = useState<DateTimeState>({
    date: now,
    time: now
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .slice(0, 5),
    date_time: now.toISOString(),
  });

  const [unloadingStart, setUnloadingStart] = useState<DateTimeState>({
    date: null,
    time: "",
    date_time: "",
  });

  const [unloadingEnd, setUnloadingEnd] = useState<DateTimeState>({
    date: null,
    time: "",
    date_time: "",
  });

  const isTechnova = true;
  const showUnloadingFields = isTechnova && shipment.shipmentType !== "arrived";

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const shipperData = JSON.parse(
          localStorage.getItem("shippers") || "[]"
        );
        const isJSPLFlag =
          shipperData[0]?.parent_name?.includes("JSP") ||
          shipperData[0]?.parent_name?.includes("JSPL Angul") ||
          shipperData[0]?.parent_name?.includes("JSPL");
        setIsJSPL(isJSPLFlag);

        const url = isJSPLFlag
          ? "constants/get_reasons?name=jspl_shipment_complete_reasons"
          : "constants/get_reasons?name=shipment";

        const response = await httpsGet(url);
        if (response.statusCode === 200 && response.data?.[0]?.reason) {
          setReasons([...response.data[0].reason, "Other"]);
        }
      } catch (error) {
        console.error("Error fetching reasons:", error);
      }
    };

    if (show) {
      fetchReasons();
    }
  }, [show]);

    useEffect(() => {
    if (show) {
      setReason("");
      setSelectedReason("");
      setShowReasonInput(false);
      setIsProceeding(false);
      setIsJSPL(false);
      setIsSubmitting(false);

      const now = new Date();
      setArrival({
        date: now,
        time: now
          .toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          .slice(0, 5),
        date_time: now.toISOString(),
      });
      setCompletion({
        date: now,
        time: now
          .toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          .slice(0, 5),
        date_time: now.toISOString(),
      });
      setUnloadingStart({
        date: null,
        time: "",
        date_time: "",
      });
      setUnloadingEnd({
        date: null,
        time: "",
        date_time: "",
      });
    }
  }, [show]);

  // --- Date/time logic ---
const handleDateChange = (
  date: Date | null,
  type: "arrival" | "completion" | "unloadingStart" | "unloadingEnd"
) => {
  let timeString = "";
  if (date) {
    // Extract time from the picked date
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    timeString = `${hours}:${minutes}`;
  }

  const dateTime = combineDateTime(date, timeString);

  const updateObj = {
    date,
    time: timeString,
    date_time: dateTime ? dateTime.toISOString() : "",
  };

  switch (type) {
    case "arrival":
      setArrival(updateObj);
      break;
    case "completion":
      setCompletion(updateObj);
      break;
    case "unloadingStart":
      setUnloadingStart(updateObj);
      break;
    case "unloadingEnd":
      setUnloadingEnd(updateObj);
      break;
  }
};

  const handleTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "arrival" | "completion" | "unloadingStart" | "unloadingEnd"
  ) => {
    const time = e.target.value;
    const date =
      type === "arrival"
        ? arrival.date
        : type === "completion"
        ? completion.date
        : type === "unloadingStart"
        ? unloadingStart.date
        : unloadingEnd.date;

    const dateTime = combineDateTime(date, time);

    const updateObj = {
      date,
      time,
      date_time: dateTime ? dateTime.toISOString() : "",
    };

    switch (type) {
      case "arrival":
        setArrival(updateObj);
        break;
      case "completion":
        setCompletion(updateObj);
        break;
      case "unloadingStart":
        setUnloadingStart(updateObj);
        break;
      case "unloadingEnd":
        setUnloadingEnd(updateObj);
        break;
    }
  };

const combineDateTime = (
  date: Date | null,
  timeString: string
): Date | null => {
  if (!date) return null;
  // If timeString is empty, default to 00:00
  const [hours, minutes] = (timeString || "00:00").split(":").map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  newDate.setSeconds(0, 0);
  return newDate;
};

  // --- Reason logic ---
  const handleReasonChange =  (value: string) => {
    setSelectedReason(value);
    setShowReasonInput(value === "Other");
    if (value !== "Other") setReason("");
  };

  // --- Validation and submit logic (Angular parity) ---
  const handleSubmit = async () => {
    console.log("unloadingStart", unloadingStart);
    console.log("unloadingEnd", unloadingEnd);
    console.log("isProceeding", isProceeding);

    if (isSubmitting) return; // Prevent multiple submissions
    // Completion time required if not "arrived"
    if (shipment.shipmentType !== "arrived" && !completion.date_time) {
      showMessage("Please select a completion date", "error");
      return;
    }
    // Arrival time required
    if (!arrival.date_time) {
      showMessage("Please select an arrival date", "error");
      return;
    }
    // Arrival cannot be after completion
    if (
      shipment.shipmentType !== "arrived" &&
      arrival.date_time &&
      completion.date_time &&
      new Date(arrival.date_time) > new Date(completion.date_time)
    ) {
      showMessage("Arrival Time cannot be greater than Completion Time", "error");
      return;
    }
    // Completion cannot be in the future
    if (
      shipment.shipmentType !== "arrived" &&
      completion.date_time &&
      new Date(completion.date_time) > new Date()
    ) {
      showMessage("Completion Time cannot be greater than current time", "error");
      return;
    }
    // Unloading fields logic
   // ...inside handleSubmit...
if (
  showUnloadingFields &&
  (!unloadingStart.date_time || !unloadingEnd.date_time) &&
  !isProceeding
) {
  showMessage(
    "You must check the box to proceed without unloading date/time.",
    "error"
  );
  return;
}
    // Reason required and must be > 3 chars
    if (!selectedReason && !reason) {
      showMessage("Please select a reason", "error");
      return;
    } else if (
      (reason && reason.trim().length <= 3) ||
      (selectedReason && selectedReason.trim().length <= 3)
    ) {
      showMessage("Reason must be more than 3 characters", "error");
      return;
    }

    // --- Prepare data as per Angular logic ---
    let submitData: any = {
      shipment_id: shipment._id,
      arrived_at: arrival.date_time,
      finished_at:
        shipment.shipmentType !== "arrived" ? completion.date_time : undefined,
      drop: shipment.drop, // Add drop if needed
      unloading_at: {
        start: unloadingStart.date_time,
        end: unloadingEnd.date_time,
      },
      reason: showReasonInput ? reason : selectedReason,
    };
  
    if (shipment.shipmentType === "arrived") {
      submitData.shipment = shipment._id;
      delete submitData.shipment_id;
      delete submitData.finished_at;
    }
    if (shipment.shipmentType === "complete") {
      delete submitData.shipment;
      delete submitData.drop;
    }
  
    try {
      setIsSubmitting(true);
      const url =
        shipment.shipmentType === "complete"
          ? "shipment/complete"
          : "shipment/drop_arrived";
      const response = await httpsPut(url, submitData, {}, 4);
  
      if (response.statusCode === 200 || response === "yes") {
        showMessage("Shipment completed successfully", "success");
        setIsSubmitting(false);
        setShowCompleteShipmentModal(false);
        fetchShipments();
      } else {
        showMessage(response.message || "Failed to complete shipment", "error");
        setIsSubmitting(false);
      }
    } catch (error: any) {
      showMessage(error.message || "Error completing shipment", "error");
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.dialogMain}>
       <ModalHeader
  title={
    shipment.shipmentType === "arrived"
      ? `Mark as Arrived - #${shipment.sin}`
      : `Complete Shipment - #${shipment.sin}`
  }
  onClose={onClose}
/>

        <div className={styles.section}>
          {(shipment.from || shipment.to) && (
            <div className={styles.location}>
              {shipment.from && (
                <div className={styles.rateInfo}><span className={styles.from}>From:</span> {shipment.from}</div>
              )}
              {shipment.to && (
                <div className={styles.rateInfo}><span className={styles.to}>To:</span> {shipment.to}</div>
              )}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Arrived At:</label>
            <div className={styles.inputGroup}>
              <DatePicker
                value={arrival.date ? dayjs(arrival.date) : null}
                onChange={(date) =>
                  handleDateChange(date?.toDate() || null, "arrival")
                }
                showTime
                format="DD/MM/YYYY HH:mm"
                className={styles.dateInput}
                disabled={isLoading}
              />
            </div>
          </div>

          {shipment.shipmentType !== "arrived" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Completed At:</label>
              <div className={styles.inputGroup}>
                <DatePicker
                  value={completion.date ? dayjs(completion.date) : null}
                  onChange={(date) =>
                    handleDateChange(date?.toDate() || null, "completion")
                  }
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  className={styles.dateInput}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {showUnloadingFields && (
            <div className={styles.unloadingSection}>
              <div className={styles.unloadingTitle}>Unloading</div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Start:</label>
                <div className={styles.inputGroup}>
                  <DatePicker
                    value={
                      unloadingStart.date ? dayjs(unloadingStart.date) : null
                    }
                    onChange={(date) =>
                      handleDateChange(date?.toDate() || null, "unloadingStart")
                    }
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    className={styles.dateInput}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>End:</label>
                <div className={styles.inputGroup}>
                  <DatePicker
                    value={unloadingEnd.date ? dayjs(unloadingEnd.date) : null}
                    onChange={(date) =>
                      handleDateChange(date?.toDate() || null, "unloadingEnd")
                    }
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    className={styles.dateInput}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="proceedCheckbox"
                  checked={isProceeding}
                  onChange={(e) => setIsProceeding(e.target.checked)}
                  className={styles.checkbox}
                  disabled={isLoading}
                />
                <label
                  htmlFor="proceedCheckbox"
                  className={styles.checkboxLabel}
                >
                  Unloading start and end date/time are missing. Do you still
                  want to proceed?
                </label>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Reason:</label>
            <Select
              value={selectedReason}
              onValueChange={handleReasonChange}
              disabled={isLoading}
            >
              <SelectTrigger className={styles.select}>
                <SelectValue
                  placeholder="Select a reason"
                  className={styles.selectValue}
                />
              </SelectTrigger>
              <SelectContent className={styles.selectContent}>
                {reasons.map((reason) => (
                  <SelectItem
                    key={reason}
                    value={reason}
                    className={styles.selectItem}
                  >
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showReasonInput && (
            <div className={styles.formGroup}>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please specify the reason"
                className={styles.textarea}
                rows={3}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            className={`${styles.button} ${styles.secondaryButton}`}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteShipmentModal;