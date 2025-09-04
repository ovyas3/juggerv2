import React, { useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import styles from './ShareModal.module.css';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  trackingUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, trackingUrl }) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = () => {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(trackingUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      classes={{
        paper: styles.dialogPaper
      }}
    >
      <DialogTitle className={styles.head}>
        <div className={styles.label}>
          Share Tracking
          <IconButton
            aria-label="close"
            onClick={onClose}
            className={styles.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.body}>
        <div className={styles.inputContainer}>
          <div className={styles.label}>Share Tracking URL</div>
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
              {copied && <span className={styles.copiedText}>Copied!</span>}
            </IconButton>
            <IconButton onClick={handleWhatsAppShare} className={styles.whatsappButton}>
              <WhatsAppIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
