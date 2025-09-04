import React from 'react';
import styles from './LocationModal.module.css';
import CloseIcon from '@mui/icons-material/Close';

interface Location {
  location: {
    name: string;
    city: string;
    reference?: string;
    _id: string;
  };
  scheduledDate?: string;
  actualDate?: string;
  finished_at?: string;
}

interface LocationModalProps {
  show: boolean;
  type: 'Pickup' | 'Delivery';
  locations: Location[];
  onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({
  show,
  type,
  locations,
  onClose,
}) => {
  if (!show) return null;

  const getDateText = (location: Location) => {
    if (location.actualDate) {
      return (
        <div className={styles.dateText}>
          <span>Actual: {location.actualDate}</span>
          {location.scheduledDate && (
            <span className={styles.scheduledDate}>({location.scheduledDate})</span>
          )}
        </div>
      );
    }
    return location.scheduledDate ? (
      <div className={styles.dateText}>{location.scheduledDate}</div>
    ) : null;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h4 className={styles.title}>{type} Locations</h4>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseIcon style={{ fontSize: 18 }} />
          </button>
        </div>

        <div className={styles.body}>
          {locations.map((loc, index) => (
            <div key={loc.location._id} className={styles.locationItem}>
              <div 
                className={`${styles.locationIcon} ${
                  type === 'Pickup' ? styles.pickupIcon : styles.deliveryIcon
                }`}
              >
                {type === 'Pickup' ? `P${index + 2}` : `D${index + 2}`}
              </div>
              <div className={styles.locationDetails}>
                <div className={styles.locationName}>
                  {loc.location.reference ? `${loc.location.reference} - ` : ''}
                  {loc.location.name} - {loc.location.city}
                </div>
                {getDateText(loc)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
