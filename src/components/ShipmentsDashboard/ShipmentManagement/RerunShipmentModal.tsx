import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import styles from "./RerunShipmentModal.module.css";
import { httpsPost } from "@/utils/Communication"; // Adjust import as needed
import { useSnackbar } from "@/hooks/snackBar";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";

interface RerunShipmentModalProps {
  show: boolean;
  shipmentId: any;
  onClose: () => void;
  // onSubmit is now optional or can be removed if not needed
}

const statusOptions = [
  { value: "ACPT", label: "Accept" },
  { value: "ITNS", label: "In Transit" },
];

const RerunShipmentModal: React.FC<RerunShipmentModalProps> = ({
  show,
  shipmentId,
  onClose,
}) => {
  const { showMessage } = useSnackbar();
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!status) {
      showMessage("Please select Status", "error");
      return;
    }
    
    if (!fromDate || !toDate) {
      showMessage("Please select both From and To dates", "error");
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        shipment: shipmentId,
        status,
        startTime: fromDate.format('YYYY-MM-DD'),
        endTime: toDate.format('YYYY-MM-DD'),
      };
      
      const rerunResp = await httpsPost("re/run", payload, {}, 4);
      if (rerunResp.statusCode === 200) {
        showMessage("Shipment rerun successfully", "success");
        onClose();
      } else {
        showMessage(rerunResp.message || "Failed to rerun shipment", "error");
      }
    } catch (err: any) {
      showMessage(err.message || "Failed to rerun shipment", "error");
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current: dayjs.Dayjs) => {
    // Can not select days before today and after today
    return current && current > dayjs().endOf('day');
  };

  return (
    <Dialog open={show} onClose={onClose} maxWidth="xs" fullWidth>
      <ModalHeader
        title="Recalculate Customer Gate In/Out"
        onClose={onClose}
      />
      <DialogContent>
        <div className={styles.rerunMain}>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as string)}
            displayEmpty
            className={styles.selectField}
            fullWidth
          >
            <MenuItem value="" disabled>
              Select Status
            </MenuItem>
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <div className={styles.dateRangeContainer}>
            <div className={styles.datePickerWrapper}>
              <label className={styles.dateLabel}>From Date</label>
              <DatePicker
                className={styles.datePicker}
                value={fromDate}
                onChange={(date) => setFromDate(date)}
                format="DD/MM/YYYY"
                disabledDate={disabledDate}
                placeholder="Select date"
                popupStyle={{ zIndex: 99999 }}
              />
            </div>
            
            <div className={styles.datePickerWrapper}>
              <label className={styles.dateLabel}>To Date</label>
              <DatePicker
                className={styles.datePicker}
                value={toDate}
                onChange={(date) => setToDate(date)}
                format="DD/MM/YYYY"
                disabledDate={(current) => {
                  // Can't select dates before fromDate or after today
                  if (fromDate) {
                    return current && (current < fromDate.startOf('day') || current > dayjs().endOf('day'));
                  }
                  return current && current > dayjs().endOf('day');
                }}
                placeholder="Select date"
                disabled={!fromDate}
                popupStyle={{ zIndex: 99999 }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <button
          // variant="contained"
          // color="primary"
          className={styles.rerunBtn}
          onClick={handleSubmit}
          disabled={!status || !fromDate || !toDate || loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default RerunShipmentModal;