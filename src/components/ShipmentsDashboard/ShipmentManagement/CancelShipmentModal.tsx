import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, SelectChangeEvent, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from '@/hooks/snackBar';
import { httpsGet, httpsPost } from '@/utils/Communication';
import styles from './CancelShipmentModal.module.css';

interface CancelShipmentModalProps {
  open: boolean;
  onClose: () => void;
  shipment: {
    _id: string;
    sin: string;
  };
  onCancelSuccess: () => void;
}

const CancelShipmentModal: React.FC<CancelShipmentModalProps> = ({
  open,
  onClose,
  shipment,
  onCancelSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showCustomReason, setShowCustomReason] = useState(false);
  const { showMessage } = useSnackbar();

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const response = await httpsGet('constants/get_reasons?name=shipment');
        if (response.data.statusCode === 200) {
          const reasonsList = [...response.data.data[0].reason, 'Other'];
          setReasons(reasonsList);
        }
      } catch (error: any) {
        showMessage(error.response?.data?.message || 'Failed to load cancellation reasons', 'error');
      }
    };

    if (open) {
      fetchReasons();
    }
  }, [open, showMessage]);

  const handleReasonChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedReason(value);
    setShowCustomReason(value === 'Other');
    if (value !== 'Other') {
      setCustomReason('');
    }
  };

  const handleSubmit = async () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    
    if (!reason) {
      showMessage('Please select or enter a reason', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await httpsPost('shipment/cancel_one', {
        shipmentId: shipment._id,
        reason,
      });

      if (response.data.statusCode === 200) {
        showMessage('Shipment cancelled successfully', 'success');
        onCancelSuccess();
        handleClose();
      }
    } catch (error: any) {
      showMessage(error.response?.data?.message || 'Failed to cancel shipment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setShowCustomReason(false);
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
        Cancel Shipment #{shipment?.sin}
        <button className={styles.closeButton} onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </button>
      </DialogTitle>
      
      <DialogContent className={styles.section}>
        <div className={styles.reasonsMenu}>
          <Select
            value={selectedReason}
            onChange={handleReasonChange}
            displayEmpty
            fullWidth
            disabled={loading}
            className={styles.select}
          >
            <MenuItem value="" disabled>
              Select a reason
            </MenuItem>
            {reasons.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </Select>
        </div>

        {showCustomReason && (
          <div className={styles.reasonBox}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Please specify the reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              disabled={loading}
              variant="outlined"
            />
          </div>
        )}
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button 
          onClick={handleClose} 
          className={styles.cancelButton}
          disabled={loading}
        >
          Close
        </Button>
        <Button 
          onClick={handleSubmit} 
          className={styles.submitButton}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Cancelling...' : 'Confirm Cancellation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelShipmentModal;
