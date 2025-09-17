import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import styles from "./CompleteShipmentModal.module.css";
import ModalHeader from "../../UI/ModalHeader/ModalHeader";
import { httpsGet } from "@/utils/Communication";
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
  onSubmit: (data: {
    arrived_at: string;
    finished_at?: string;
    start?: string;
    end?: string;
    reason: string;
  }) => void;
  shipment: {
    _id: string;
    sin: string;
    from?: string;
    to?: string;
    shipmentType?: string;
  };
  isLoading?: boolean;
}

interface DateTimeState {
  date: Date | null;
  time: string;
  date_time: string;
}

export const CompleteShipmentModal: React.FC<CompleteShipmentModalProps> = ({
  show,
  onClose,
  onSubmit,
  shipment,
  isLoading = false,
}) => {
  const { showMessage } = useSnackbar();
  const [reason, setReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [isProceeding, setIsProceeding] = useState(false);
  const [reasons, setReasons] = useState<string[]>(["Other"]);
  const [isJSPL, setIsJSPL] = useState(false);

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

  const handleDateChange = (
    date: Date | null,
    type: "arrival" | "completion" | "unloadingStart" | "unloadingEnd"
  ) => {
    const timeString =
      type === "arrival"
        ? arrival.time
        : type === "completion"
        ? completion.time
        : type === "unloadingStart"
        ? unloadingStart.time
        : unloadingEnd.time;

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
    if (!date || !timeString) return null;

    const [hours, minutes] = timeString.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    return newDate;
  };

  const handleSubmit = () => {
    if (shipment.shipmentType !== "arrived" && !completion.date_time) {
      showMessage("Please select a completion date", "error");
      return;
    }

    if (!arrival.date_time) {
      showMessage("Please select an arrival date", "error");
      return;
    }

    if (
      showUnloadingFields &&
      !isProceeding &&
      (!unloadingStart.date_time || !unloadingEnd.date_time)
    ) {
      showMessage("Please select unloading start and end dates", "error");
      return;
    }

    if (!selectedReason && !reason) {
      showMessage("Please select a reason", "error");
      return;
    }

    const submitData = {
      arrived_at: arrival.date_time,
      finished_at:
        shipment.shipmentType !== "arrived" ? completion.date_time : undefined,
      start: unloadingStart.date_time,
      end: unloadingEnd.date_time,
      reason: reason || selectedReason,
    };

    onSubmit(submitData);
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.dialogMain}>
        <ModalHeader
          title={`Complete Shipment - #${shipment.sin}`}
          onClose={onClose}
        />

        <div className={styles.section}>
          {(shipment.from || shipment.to) && (
            <div className={styles.formGroup}>
              {shipment.from && (
                <div className={styles.rateInfo}>From: {shipment.from}</div>
              )}
              {shipment.to && (
                <div className={styles.rateInfo}>To: {shipment.to}</div>
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
              onValueChange={(value) => {
                setSelectedReason(value);
                setShowReasonInput(value === "Other");
              }}
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
