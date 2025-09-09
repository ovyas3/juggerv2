// MissedEventModal.tsx
import React, { useState, useEffect } from 'react';
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from '@/utils/Communication';
import styles from './MissedEventModal.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

interface MissedEvent {
  name: string;
  value: string;
}

interface MissedEventModalProps {
  show: boolean;
  shipmentId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const MissedEventModal: React.FC<MissedEventModalProps> = ({
  show,
  shipmentId,
  onClose,
  onSuccess
}) => {
  const { showMessage } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [missedEvents, setMissedEvents] = useState<MissedEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [doNumber, setDoNumber] = useState<string>('');
  const [eventData, setEventData] = useState<string>('');

  // Mock data - replace with actual API call if needed
  const mockMissedEvents = [
    { name: 'Event 1', value: 'event_1' },
    { name: 'Event 2', value: 'event_2' },
    { name: 'Event 3', value: 'event_3' }
  ];

  useEffect(() => {
    // Fetch missed events if needed
    setMissedEvents(mockMissedEvents);
  }, []);

  const handleFetch = async () => {
    if (!selectedEvent) {
      showMessage('Please select an event', 'error');
      return;
    }

    try {
      setIsFetching(true);
      const response = await httpsPost(
        'v1/utility/pullMissedEventsJSPL',
        {
          event: selectedEvent,
          shipment: shipmentId,
          OD_number: doNumber || undefined,
          display: true
        },
        {},
        4
      );

      setEventData(JSON.stringify(response.data || {}, null, 2));
    } catch (error: any) {
      showMessage(error.response?.data?.message || 'Failed to fetch event data', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEvent) {
      showMessage('Please select an event', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const response = await httpsPost(
        'v1/utility/pullMissedEventsJSPL',
        {
          event: selectedEvent,
          shipment: shipmentId,
          OD_number: doNumber || undefined,
          display: false
        },
        {},
        4
      );

      if (response.statusCode === 200) {
        showMessage('Missed Event Added', 'success');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      showMessage(error.response?.data?.message || 'Failed to add missed event', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <ModalHeader title="Missed Events" onClose={onClose} />

        <div className={styles.body}>
          <div className={styles.formGroup}>
            <div className={styles.inputContainer}>
              <select
                className={styles.selectField}
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                disabled={isLoading || isFetching}
              >
                <option value="">Select Missed Event</option>
                {missedEvents.map((event) => (
                  <option key={event.value} value={event.value}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.inputField}
                value={doNumber}
                onChange={(e) => setDoNumber(e.target.value)}
                placeholder=" "
                disabled={isLoading || isFetching}
              />
              <label className={styles.floatingLabel}>DO number</label>
              {selectedEvent === 'IV' && !doNumber && (
                <div className={styles.warningText}>Do Number is Mandatory for IV</div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <button
              className={styles.fetchButton}
              onClick={handleFetch}
              disabled={!selectedEvent || isFetching || isLoading}
            >
              {isFetching ? 'Fetching...' : 'Fetch'}
            </button>
          </div>

          {eventData && (
            <div className={styles.dataContainer}>
              <textarea
                className={styles.dataTextarea}
                value={eventData}
                readOnly
                rows={8}
              />
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={!selectedEvent || isLoading || isFetching}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissedEventModal;