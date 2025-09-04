// src/components/ShipmentsDashboard/Modals/MissedEventModal.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MissedEventModal.module.css';

interface MissedEvent {
  name: string;
  value: string;
}

interface MissedEventModalProps {
  show: boolean;
  onClose: () => void;
  onFetch: () => void;
  onSubmit: () => void;
  missedEvents: string;
  setMissedEvents: (value: string) => void;
  missedEventDoNumber: string;
  setMissedEventDoNumber: (value: string) => void;
  dataMissedEvents: string;
  setDataMissedEvents: (value: string) => void;
  selectedMissedEvent: string;
  setSelectedMissedEvent: (value: string) => void;
  missed: MissedEvent[];
  isLoading?: boolean;
}

const MissedEventModal: React.FC<MissedEventModalProps> = ({
  show,
  onClose,
  onFetch,
  onSubmit,
  missedEvents,
  setMissedEvents,
  missedEventDoNumber,
  setMissedEventDoNumber,
  dataMissedEvents,
  setDataMissedEvents,
  selectedMissedEvent,
  setSelectedMissedEvent,
  missed,
  isLoading = false
}) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.dialog_title}>Missed Events</div>
          <button className={styles.closeButton} onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.driverDetailsSec}>
            <div className={styles.inputContainer}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  className={styles.inputField}
                  value={missedEvents}
                  onChange={(e) => setMissedEvents(e.target.value)}
                  placeholder=" "
                />
                <label className={styles.floatingLabel}>
                  {t('Missed Event')}
                </label>
                <div className={styles.dropdown}>
                  {missed
                    .filter(option => 
                      option.name.toLowerCase().includes(missedEvents.toLowerCase())
                    )
                    .map(option => (
                      <div 
                        key={option.value}
                        className={styles.dropdownItem}
                        onClick={() => {
                          setMissedEvents(option.name);
                          setSelectedMissedEvent(option.value);
                        }}
                      >
                        {option.name}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.driverDetailsSec}>
            <div className={styles.inputContainer}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  className={styles.inputField}
                  value={missedEventDoNumber}
                  onChange={(e) => setMissedEventDoNumber(e.target.value)}
                  placeholder=" "
                />
                <label className={styles.floatingLabel}>
                  {t('DO number')}
                </label>
              </div>
            </div>
          </div>

          <div className={styles.driverDetailsSec}>
            <div className={styles.note}>
              <div className={styles.warningText}>
                Do Number is Mandatory for IV
              </div>
              <button 
                className={styles.fetchButton}
                onClick={onFetch}
                disabled={isLoading}
              >
                {isLoading ? 'Fetching...' : t('Fetch')}
              </button>
              <div className={styles.textareaContainer}>
                <textarea
                  className={styles.textarea}
                  value={dataMissedEvents}
                  onChange={(e) => setDataMissedEvents(e.target.value)}
                  placeholder="Enter details here..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.submitButton}
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : t('Submit')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissedEventModal;