import React, { useRef, useState } from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import styles from './ShareModal.module.css';
import ModalHeader from '../../UI/ModalHeader/ModalHeader';
import { useSnackbar } from "@/hooks/snackBar";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  trackingUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, trackingUrl }) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showMessage } = useSnackbar();

  const copyToClipboard = () => {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      showMessage("Copied to clipboard", "success");
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(trackingUrl)}`;
    window.open(url, '_blank');
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialogPaper}>
        <ModalHeader 
          title="Share Tracking" 
          onClose={onClose} 
        />
        <div className={styles.body}>
          <div className={styles.inputContainer}>
            {/* <div className={styles.label}>Share Tracking URL</div> */}
            <div className={styles.label}>Tracking URL:</div>
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                value={trackingUrl}
                readOnly
                className={styles.input}
              />
              <IconButton onClick={copyToClipboard} className={styles.copyButton}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={handleWhatsAppShare} className={styles.whatsappButton}>
                <WhatsAppIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
