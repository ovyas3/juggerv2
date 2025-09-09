import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, SelectChangeEvent, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from '@/hooks/snackBar';
import { httpsGet, httpsPost } from '@/utils/Communication';
import styles from './CancelShipmentModal.module.css';
import ModalHeader from '../../UI/ModalHeader/ModalHeader';

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
        setLoading(true);
        const response = await httpsGet('constants/get_reasons?name=shipment');
        console.log(response);
        if (response.statusCode === 200) {
          console.log("response.data", response.data)
          // Extract reasons from the first item in the data array
          const reasonsList = [...(response.data[0].reason || []), 'Other'];
          setReasons(reasonsList);
        } else {
          setLoading(false);
          showMessage('No cancellation reasons found', 'error');
        }
      } catch (error: any) {
        setLoading(false);
        console.error('Error fetching cancellation reasons:', error);
        // Fallback to default reasons on error
        setReasons([]);
        showMessage('Failed to load cancellation reasons.', 'error');
      } finally {
        setLoading(false);
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

      if (response.statusCode === 200) {
        showMessage('Shipment cancelled successfully', 'success');
        onCancelSuccess();
        handleClose();
        onClose();
      }
    } catch (error: any) {
      showMessage(error.message || 'Failed to cancel shipment', 'error');
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
      <ModalHeader 
        title={`Cancel Shipment - #${shipment?.sin}`}
        onClose={handleClose}
      />
      
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

      <div className={styles.actions}>
        <button 
          onClick={handleClose} 
          className={styles.cancelButton}
          disabled={loading}
        >
          Close
        </button>
        <button 
          onClick={handleSubmit} 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Cancelling...' : 'Submit'}
        </button>
      </div>
    </Dialog>
  );
};

export default CancelShipmentModal;
