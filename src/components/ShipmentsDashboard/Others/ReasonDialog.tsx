import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { httpsGet, httpsPost } from "@/utils/Communication";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import styles from "./ReasonDialog.module.css";
import { useSnackbar } from "@/hooks/snackBar";
import { format } from "date-fns";

interface ReasonHistory {
  updated_at: string;
  remark?: string;
  reason?: string;
  updated_by?: string;
  created_at?: string;
  [key: string]: any;
}

interface ReasonGroup {
  name: string;
  groupValues: string[];
}

interface ReasonDialogProps {
  open: boolean;
  onClose: () => void;
  type: "delay" | "gps";
  shipmentId: string;
  sin: string;
  onSuccess: () => void;
  history?: ReasonHistory[]; 
}

const ReasonDialog: React.FC<ReasonDialogProps> = ({
  open,
  onClose,
  type,
  shipmentId,
  sin,
  onSuccess,
  history: initialHistory = [], 
}) => {
  const { t } = useTranslation();
  const { showMessage } = useSnackbar();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [notify, setNotify] = useState<boolean>(false);
  const [reasons, setReasons] = useState<ReasonGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const isDelayReason = type === "delay";
  const historyLabel = isDelayReason
    ? "Delay Reason History"
    : "GPS Disconnection Reason History";
  const apiEndpoint = isDelayReason ? "delay-reason" : "gps-disconnect-reason";
  const historyKey = isDelayReason ? "remark" : "reason";

  const sortedHistory = [...initialHistory]
    .map((item: any) => ({
      ...item,
      updated_at: item.updated_at || item.created_at,
    }))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  useEffect(() => {
    if (open) {
      fetchReasons();
    }
  }, [open]);

  const fetchReasons = async () => {
    try {
      setLoading(true);
      const endpoint = isDelayReason
        ? "constants/get_reasons?name=jspl_delay_reasons"
        : "constants/get_reasons?name=gps_disconnection_reasons";

      const response = await httpsGet(endpoint);

      if (response.statusCode === 200 && response.data) {
        const reasonsData = Object.entries(response.data[0].reason).map(
          ([groupName, groupValues]) => ({
            name: groupName,
            groupValues: groupValues as string[],
          })
        );

        setReasons([
          ...reasonsData,
          { name: "Other", groupValues: ["Others"] },
        ]);
      }
    } catch (error) {
      console.error(`Error fetching ${apiEndpoint} types:`, error);
      showMessage("Failed to fetch reasons", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    const endpoint = isDelayReason
      ? "shipment/delay_reason"
      : "shipment/gps_disconnection_reason";

    try {
      setLoading(true);
      const reason = selectedReason === "Others" ? otherReason : selectedReason;

      const response = await httpsPost(
        endpoint,
        {
          reason,
          _id: shipmentId,
          ...(isDelayReason && { notify }),
        },
        4
      );

      if (response.statusCode === 200) {
        showMessage("Reason updated successfully", "success");
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error(`Error submitting ${endpoint}:`, error);
      showMessage("Failed to update reason", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy hh:mm a");
    } catch (e) {
      return dateString;
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          title={t(
            isDelayReason
              ? `Delay Reason History - #${sin}`
              : `GPS Disconnection Reason History - #${sin}`
          )}
          onClose={onClose}
        />

        <div className={styles.content}>
          <div className={styles.formSection}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {isDelayReason
                  ? "Select Delay Reason"
                  : "Select GPS Disconnection Reason"}
              </label>
              <select
                className={styles.select}
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                disabled={loading}
              >
                <option value="">Select a reason</option>
                {reasons.map((group, i) => (
                  <optgroup key={i} label={group.name}>
                    {group.groupValues.map((reason, j) => (
                      <option key={`${i}-${j}`} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="Others">Others</option>
              </select>

              {selectedReason === "Others" && (
                <div className={styles.otherReasonContainer}>
                  <input
                    type="text"
                    className={styles.otherReasonInput}
                    placeholder="Please specify reason"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {isDelayReason && (
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id="notifyCheckbox"
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                    disabled={loading}
                  />
                  <label
                    htmlFor="notifyCheckbox"
                    className={styles.checkboxLabel}
                  >
                    Notify Customer
                  </label>
                </div>
              )}

              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !selectedReason ||
                  (selectedReason === "Others" && !otherReason)
                }
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          {sortedHistory.length > 0 && (
            <div className={styles.historySection}>
              <h3 className={styles.historyTitle}>{historyLabel}</h3>
              <div className={styles.historyTableContainer}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Date & Time</th>
                      <th>Reasons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHistory.map((item, index: number) => (
                      <tr key={index} className={styles.historyRow}>
                        <td>{index + 1}</td>
                        <td>{formatDate(item.updated_at)}</td>
                        <td>{item[historyKey] || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReasonDialog;