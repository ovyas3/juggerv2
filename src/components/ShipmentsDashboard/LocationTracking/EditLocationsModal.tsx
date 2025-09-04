import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './EditLocationsModal.module.css';

interface Location {
  _id?: string;
  loc_id?: string;
  name: string;
  area: string;
  city?: string;
}

interface ShipperPrefs {
  locations: Location[];
  deliveryLocations: Location[];
}

interface EditLocationsModalProps {
  show: boolean;
  onClose: () => void;
  addLocationsType: 'pickup' | 'delivery';
  orderNumber: string;
  shipperPrefs: ShipperPrefs;
  onEditSubmit: (location: Location, date: Date | null) => void;
  onFetchLocation: (date: Date | null) => Promise<Location[]>;
  nearestPickup?: any;
}

const EditLocationsModal: React.FC<EditLocationsModalProps> = ({
  show,
  onClose,
  addLocationsType,
  orderNumber,
  shipperPrefs,
  onEditSubmit,
  onFetchLocation,
  nearestPickup,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleLocations, setVehicleLocations] = useState<Location[]>([]);
  const [showLocations, setShowLocations] = useState(false);

  if (!show) return null;

  const locations = isDataFetched ? vehicleLocations : 
    addLocationsType === 'pickup' ? shipperPrefs.locations : shipperPrefs.deliveryLocations;

  const filteredLocations = locations.filter(loc => 
    `${loc.name} - ${loc.area}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setSearchQuery(`${location.name} - ${location.area}`);
    setShowLocations(false);
  };

  const handleFetchLocations = async () => {
    if (!selectedDate) return;
    
    setIsLoading(true);
    try {
      const locations = await onFetchLocation(selectedDate);
      setVehicleLocations(locations);
      setIsDataFetched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedLocation) return;
    onEditSubmit(selectedLocation, selectedDate);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.dialogTitle}>
            {t(`MYSHIPMENTS.${addLocationsType === 'pickup' ? 'editPickup' : 'editDelivery'}`)}
            {t('MYSHIPMENTS.shipperIn')}: {orderNumber}
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.datePicker}>
            <input
              type="date"
              className={styles.dateInput}
              value={selectedDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
            />
          </div>

          <div className={styles.locationSelect}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.inputField}
                placeholder=" "
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowLocations(true);
                }}
                onFocus={() => setShowLocations(true)}
              />
              <label className={styles.floatingLabel}>
                {t(`MYSHIPMENTS.${addLocationsType}Location`)}
              </label>
              
              {showLocations && filteredLocations.length > 0 && (
                <div className={styles.dropdown}>
                  {filteredLocations.map((location) => (
                    <div 
                      key={location._id || location.loc_id}
                      className={styles.dropdownItem}
                      onClick={() => handleLocationSelect(location)}
                    >
                      <span>
                        <b>{location.name}</b> - {location.area}
                        {location.city && ` - ${location.city}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {nearestPickup && (
            <div className={styles.nearestLocation}>
              Vehicle is inside - {nearestPickup.name} - {nearestPickup.area}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button 
            className={`${styles.button} ${styles.editButton}`}
            onClick={handleSubmit}
            disabled={!selectedLocation || isLoading}
          >
            {t('DASHBOARD.edit')}
          </button>
          <button 
            className={`${styles.button} ${styles.fetchButton}`}
            onClick={handleFetchLocations}
            disabled={!selectedDate || isLoading}
          >
            {isLoading ? (
              <span className={styles.loader}></span>
            ) : (
              `Fetch ${addLocationsType === 'pickup' ? 'Pickup' : 'Delivery'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLocationsModal;
