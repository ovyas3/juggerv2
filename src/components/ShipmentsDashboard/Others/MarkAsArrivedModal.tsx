import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import styles from "./MarkAsArrivedModal.module.css";
import { httpsGet } from "@/utils/Communication";
import { useSnackbar } from "@/hooks/snackBar";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";

interface MarkAsArrivedModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: { arrived_at: string; reason?: string }) => void;
  shipment: {
    _id: string;
    orderNo?: string;
    from?: string;
    to?: string;
  };
  isLoading?: boolean;
}

interface DateTimeState {
  date: dayjs.Dayjs | null;
  date_time: string;
}

const MarkAsArrivedModal: React.FC<MarkAsArrivedModalProps> = ({
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
  const [reasons, setReasons] = useState<string[]>(["Other"]);
  const [isLoadingReasons, setIsLoadingReasons] = useState(false);

  const now = dayjs();
  const [arrival, setArrival] = useState<DateTimeState>({
    date: now,
    date_time: now.toISOString(),
  });

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        setIsLoadingReasons(true);

        const response = await httpsGet(
          "constants/get_reasons?name=shipment",
          4
        );

        if (response.statusCode == 200) {
          if (response.data[0]?.reason) {
            setReasons([...response.data[0].reason, "Other"]);
          }
        } else {
          showMessage("Failed to load reasons.", "error");
        }
      } catch (error) {
        console.error("Error fetching reasons:", error);
      } finally {
        setIsLoadingReasons(false);
      }
    };

    if (show) {
      fetchReasons();
    }
  }, [show]);

  const handleDateTimeChange = (date: dayjs.Dayjs | null) => {
    if (!date) return;

    const newArrival = { ...arrival };
    newArrival.date = date;
    newArrival.date_time = date.toISOString();
    setArrival(newArrival);
  };

  const handleReasonChange = (value: string) => {
    setSelectedReason(value);
    setShowReasonInput(value === "Other");
  };

  const handleSubmit = () => {
    if (!arrival.date_time) {
      return;
    }

    if (reasons.length > 1 && !selectedReason) {
      return;
    }

    const finalReason = showReasonInput ? reason : selectedReason;

    onSubmit({
      arrived_at: arrival.date_time,
      ...(finalReason && { reason: finalReason }),
    });
  };

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <ModalHeader
          title={`Mark as Arrived - #${shipment.orderNo}`}
          onClose={onClose}
        />

        <div className={styles.content}>
          <div className={styles.rateData}>
            {shipment.from && (
              <div className={styles.rateBox}>
                From: {shipment.from || "N/A"}
              </div>
            )}
            {shipment.to && (
              <div className={styles.rateBox}>To: {shipment.to || "N/A"}</div>
            )}
          </div>

          <div className={styles.dateTimeSection}>
            <div className={styles.dateTimeInput}>
              <label>Arrived At:</label>
              <div className={styles.dateTimePicker}>
                <DatePicker
                  value={arrival.date}
                  onChange={handleDateTimeChange}
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  className={styles.dateInput}
                />
              </div>
            </div>
          </div>

          {reasons.length > 0 && (
            <div className={styles.reasonSection}>
              <label htmlFor="reason">Reason:</label>
              <Select
                value={selectedReason}
                onValueChange={handleReasonChange}
                disabled={isLoadingReasons}
              >
                <SelectTrigger className={styles.select}>
                  <SelectValue placeholder="Select a reason" />
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

              {showReasonInput && (
                <textarea
                  className={styles.reasonTextarea}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please specify the reason"
                />
              )}
            </div>
          )}

          <div className={styles.actions}>
            <button
              onClick={onClose}
              className={`${styles.button} ${styles.cancelButton}`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`${styles.button} ${styles.submitButton}`}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Mark as Arrived"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAsArrivedModal;
