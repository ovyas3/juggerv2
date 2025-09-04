import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './MarkAsArrivedModal.module.css';

interface MarkAsArrivedModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: {
    arrived_at: string;
    reason?: string;
  }) => void;
  shipment: {
    _id: string;
    orderNo?: string;
    from?: string;
    to?: string;
  };
  isLoading?: boolean;
}

interface DateTimeState {
  date: Date | null;
  time: string;
  date_time: string;
}

const MarkAsArrivedModal: React.FC<MarkAsArrivedModalProps> = ({
  show,
  onClose,
  onSubmit,
  shipment,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reasons, setReasons] = useState<string[]>(['Other']);
  
  const now = new Date();
  const [arrival, setArrival] = useState<DateTimeState>({
    date: now,
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    date_time: now.toISOString(),
  });

  // Fetch reasons from API
  useEffect(() => {
    // TODO: Replace with actual API call
    // fetchReasons();
  }, []);

  const handleDateTimeChange = (date: Date | null, field: 'date' | 'time') => {
    if (!date) return;
    
    const newArrival = { ...arrival };
    
    if (field === 'date') {
      newArrival.date = date;
      // Update time to maintain the existing time
      const [hours, minutes] = newArrival.time.split(':');
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    } else {
      // Handle time change
      const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      newArrival.time = timeString;
      
      if (newArrival.date) {
        const [hours, minutes] = timeString.split(':');
        const newDate = new Date(newArrival.date);
        newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        newArrival.date = newDate;
      }
    }
    
    newArrival.date_time = newArrival.date?.toISOString() || '';
    setArrival(newArrival);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedReason(value);
    setShowReasonInput(value === 'Other');
  };

  const handleSubmit = () => {
    if (!arrival.date_time) {
      // TODO: Show error
      return;
    }

    if (reasons.length > 1 && !selectedReason) {
      // TODO: Show error - reason is required
      return;
    }

    const finalReason = showReasonInput ? reason : selectedReason;
    
    onSubmit({
      arrived_at: arrival.date_time,
      ...(finalReason && { reason: finalReason })
    });
  };

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          {shipment.orderNo ? `#${shipment.orderNo}` : 'Mark as Arrived'}
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.rateData}>
            {shipment.from && (
              <div className={styles.rateBox}>
                From: {shipment.from || 'N/A'}
              </div>
            )}
            {shipment.to && (
              <div className={styles.rateBox}>
                To: {shipment.to || 'N/A'}
              </div>
            )}
          </div>

          <div className={styles.dateTimeSection}>
            <div className={styles.dateTimeInput}>
              <label>Arrived At:</label>
              <div className={styles.dateTimePicker}>
                <DatePicker
                  selected={arrival.date}
                  onChange={(date) => handleDateTimeChange(date, 'date')}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className={styles.dateInput}
                />
                <CalendarIcon className={styles.calendarIcon} />
              </div>
            </div>
          </div>

          {reasons.length > 0 && (
            <div className={styles.reasonSection}>
              <label>Reason:</label>
              <select 
                value={selectedReason}
                onChange={handleReasonChange}
                className={styles.reasonSelect}
              >
                <option value="">Select a reason</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              
              {showReasonInput && (
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please specify the reason"
                  className={styles.reasonTextarea}
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
              {isLoading ? 'Submitting...' : 'Mark as Arrived'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAsArrivedModal;
