import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from "@/utils/Communication";
import styles from "./MailModal.module.css";

interface MailModalProps {
  open: boolean;
  onClose: () => void;
  shipment: {
    _id: string;
    sin: string;
  };
}

const MailModal: React.FC<MailModalProps> = ({ open, onClose, shipment }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showMessage } = useSnackbar();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      showMessage("Please enter an email address", "error");
      return;
    }

    const emailArray = email.split(",").map((e) => e.trim());
    const invalidEmails = emailArray.filter((e) => !validateEmail(e));

    if (invalidEmails.length > 0) {
      showMessage(`Invalid email format: ${invalidEmails.join(", ")}`, "error");
      return;
    }

    try {
      setLoading(true);
      const response = await httpsPost("shipment/send_track_link", {
        shipment_id: shipment._id,
        email_Ids: emailArray,
      });

      if (response.data.statusCode === 200) {
        showMessage("Email sent successfully", "success");
        handleClose();
      }
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Failed to send email",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? handleClose : undefined}
      maxWidth="sm"
      fullWidth
      classes={{ paper: styles.dialogPaper }}
    >
      <DialogTitle className={styles.header}>
        <div className={styles.label}>
          Send Tracking Link
          <IconButton
            aria-label="close"
            onClick={handleClose}
            disabled={loading}
            className={styles.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={styles.body}>
        <div className={styles.inputContainer}>
          <div className={styles.label}>Email Address</div>
          <div className={styles.inputWrapper}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Enter email addresses (comma-separated for multiple)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={styles.input}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendEmail();
                }
              }}
            />
            <IconButton
              onClick={handleSendEmail}
              disabled={loading}
              className={styles.mailButton}
            >
              {loading ? <CircularProgress size={24} /> : <EmailIcon />}
            </IconButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MailModal;
