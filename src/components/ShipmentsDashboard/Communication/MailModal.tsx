import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from "@/utils/Communication";
import styles from "./MailModal.module.css";
import ModalHeader from "../../UI/ModalHeader/ModalHeader";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("MAILMODAL");

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

      if (response.statusCode === 200) {
        showMessage("Email sent successfully", "success");
        handleClose();
      } else {
        showMessage(response.message, "error");
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
      <ModalHeader
        title={`Share Tracking URL Via Email - #${shipment.sin}`}
        onClose={onClose}
      />

      <DialogContent className={styles.body}>
        <div className={styles.inputContainer}>
          <div className={styles.label}>{t("emailAddress")}</div>
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
