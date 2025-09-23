import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { httpsGet, httpsPost } from '@/utils/Communication';
import { useSnackbar } from '@/hooks/snackBar';
import styles from './EditLocationsModal.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';
import { DateTime } from 'luxon';
// Uncomment when turf is installed
// import * as turf from '@turf/turf';

interface Location {
  _id?: string;
  loc_id?: string;
  name: string;
  area: string;
  city: string;
  geo_fence?: {
    coordinates: number[][][];
  };
  geo_point?: {
    coordinates: number[];
  };
}

interface ShipperPrefs {
  locations: Location[];
  deliveryLocations: Location[];
}

interface EditLocationsModalProps {
  show: boolean;
  onClose: () => void;
  addLocationsType: 'pickup' | 'delivery';
  shipmentId: string;
  shipperPrefs: ShipperPrefs;
  orderNumber: string;
  pickupId?: string;
  deliveryId?: string;
  elementOrderId?: string;
  currentLocation?: number[];
  onEditSuccess: () => void;
  combinedLocation?: string;
  pickupCity?: string;
}

interface ProximityLocation {
  l: Location;
  fence: any;
}

const EditLocationsModal: React.FC<EditLocationsModalProps> = ({
  show,
  onClose,
  addLocationsType,
  shipmentId,
  shipperPrefs,
  orderNumber,
  pickupId,
  deliveryId,
  elementOrderId,
  currentLocation,
  onEditSuccess,
  combinedLocation: initialCombinedLocation = '',
  pickupCity: initialPickupCity = '',
}) => {
  const { t } = useTranslation();
  const { showMessage } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [pickupFromDate, setPickupFromDate] = useState<Date | null>(null);
  const [location, setLocation] = useState<{ withEntity: string }>({ 
    withEntity: initialCombinedLocation 
  });
  const [vehicleLocations, setVehicleLocations] = useState<Location[]>([]);
  const [proximityPickupLocations, setProximityPickupLocations] = useState<ProximityLocation[]>([]);
  const [nearestPickup, setNearestPickup] = useState<Location | null>(null);
  const [getlocationsId, setGetLocationsId] = useState<string>('');
  const [showLocations, setShowLocations] = useState(false);
  const [shipperPrefsState, setShipperPrefs] = useState<ShipperPrefs>({
    locations: [],
    deliveryLocations: []
  });

  // Initialize with props
  useEffect(() => {
    if (shipperPrefs) {
      setShipperPrefs(shipperPrefs);
    }
    if (initialPickupCity) {
      fetchProximityLocations(initialPickupCity);
    }
    if (initialCombinedLocation) {
      setLocation({ withEntity: initialCombinedLocation });
    }
  }, [initialPickupCity, initialCombinedLocation, shipperPrefs]);

  const fetchProximityLocations = async (city: string) => {
    try {
      const pathWithParams = `location/city_proximity?city=${encodeURIComponent(city)}`;
      const response = await httpsGet(pathWithParams, 4);
     
      if (response.statusCode === 200) {
        // Uncomment when turf is installed
        // const locations = response.data.map((l: any) => {
        //   const fence = turf.polygon(l.geo_fence.coordinates.map((p: number[][]) => p.reverse()));
        //   return {
        //     fence,
        //     l: {
        //       ...l,
        //       area: l.area || '',
        //       city: l.city || city
        //     }
        //   };
        // });
        // setProximityPickupLocations(locations);
      }
    } catch (error) {
      console.error('Error fetching proximity locations:', error);
      showMessage('Failed to load nearby locations', 'error');
    }
  };

  const getShipperPrefs = async () => {
    if (!elementOrderId) return;
    
    setIsLoading(true);
    try {
      const response = await httpsGet(`org_pref?organization=${elementOrderId}`, 4);
      if (response.statusCode === 200) {
        const supplier = JSON.parse(localStorage.getItem('shippers') || '{}');
        let locationData = [...(response.data.locations || [])];
        
        // Filter based on supplier if type is 'supplier'
        const locations = supplier?._id 
          ? locationData.filter((x: any) => x.shipper === supplier._id)
          : locationData;
          
        const deliveryLocations = supplier?._id
          ? locationData.filter((x: any) => x.shipper !== supplier._id)
          : locationData;

        setShipperPrefs({
          locations,
          deliveryLocations
        });
      }
    } catch (error: any) {
      showMessage(error.error?.message || 'Failed to load shipper preferences', 'error');
      if (error.statusCode === 401) {
        // Handle logout if needed
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectLocationChange = (selectedLocation: Location) => {
    setLocation({ withEntity: `${selectedLocation.name} - ${selectedLocation.area}` });
    setGetLocationsId(selectedLocation._id || selectedLocation.loc_id || '');
    setShowLocations(false);
  };

  const editLocationsSubmit = async () => {
    if (!getlocationsId) {
      showMessage('Please select a location', 'error');
      return;
    }

    const apiUrl = addLocationsType === 'pickup' ? 'shipment/editPick' : 'shipment/editDelivery';
    const payload: any = {
      shipment_id: shipmentId,
      location_id: getlocationsId
    };

    if (addLocationsType === 'pickup' && pickupId) {
      payload.pickup_id = pickupId;
    } else if (addLocationsType === 'delivery' && deliveryId) {
      payload.delivery_id = deliveryId;
    }

    setIsLoading(true);
    try {
      const response = await httpsPost(apiUrl, payload, 4);
      if (response.statusCode === 200) {
        showMessage(
          `${addLocationsType === 'pickup' ? 'Pickup' : 'Delivery'} Location Edited Successfully`,
          'success'
        );
        onEditSuccess();
        onClose();
      }
    } catch (error: any) {
      showMessage(error.error?.message || 'Failed to update location', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getLocation = async () => {
    if (!pickupFromDate) {
      showMessage('Please select a date first', 'error');
      return;
    }
    
    const fromDate = DateTime.fromJSDate(pickupFromDate).endOf('day').minus({ hours: 5, minutes: 30 }).toJSDate();
    const payload = {
      shipment: shipmentId,
      from: fromDate,
    };

    try {
      const response = await httpsGet('v1/location/getVehicleCoordinates', 4);
      if (response.statusCode === 200) {
        setVehicleLocations(response.data);
        if (response.data && response.data.length > 0) {
          setIsDataFetched(true);
          setPickupFromDate(null);
          setNearestPickup(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicle coordinates:', error);
      showMessage('Failed to fetch vehicle coordinates', 'error');
    }
  };

  const getLoc = () => {
    const nearest = getPickupLocationByCurrentLocation();
    if (nearest) {
      setNearestPickup(nearest);
      if (nearest._id) {
        setGetLocationsId(nearest._id);
        setLocation({ withEntity: `${nearest.name} - ${nearest.area}` });
      }
    } else {
      showMessage('No location found, try again', 'error');
    }
  };

  const getPickupLocationByCurrentLocation = (): Location | null => {
    if (!currentLocation || !proximityPickupLocations.length) return null;

    // Uncomment when turf is installed
    // const pointFeature = turf.point([...currentLocation].reverse());
    // for (const location of proximityPickupLocations) {
    //   const inside = turf.booleanPointInPolygon(pointFeature, location.fence);
    //   if (inside) {
    //     return location.l;
    //   }
    // }
    return null;
  };

  const filteredLocations = (isDataFetched ? vehicleLocations : 
    addLocationsType === 'pickup' ? 
      proximityPickupLocations.map(p => p.l) : 
      shipperPrefsState.deliveryLocations
  ).filter(loc => 
    `${loc.name} - ${loc.area}`.toLowerCase().includes(location.withEntity.toLowerCase())
  );

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <ModalHeader 
          title={`${addLocationsType === 'pickup' ? t('MYSHIPMENTS.editPickup') : t('MYSHIPMENTS.editDelivery')} / ${t('MYSHIPMENTS.shipperIn')} : ${orderNumber}`}
          onClose={onClose}
        />

        <div className={styles.body}>
          {isLoading && (
            <div className={styles.loader}>
              <div className={styles.load}></div>
            </div>
          )}

          <div className={styles.filters}>
            <div className={styles.dateInputContainer}>
              <input
                type="date"
                className={styles.dateInput}
                value={pickupFromDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setPickupFromDate(e.target.value ? new Date(e.target.value) : null)}
              />
              <span className={styles.calendarIcon}>
                <img src="/assets/calender-icon.svg" alt="Calendar" />
              </span>
            </div>
          </div>

          <div className={styles.locationSection}>
            <div className={styles.locationSelect}>
              <input
                type="text"
                className={styles.locationInput}
                placeholder=" "
                value={location.withEntity}
                onChange={(e) => {
                  setLocation({ withEntity: e.target.value });
                  setShowLocations(true);
                }}
                onFocus={() => setShowLocations(true)}
              />
              <label className={styles.floatingLabel}>
                {addLocationsType === 'pickup' 
                  ? t('MYSHIPMENTS.pickupLocation') 
                  : t('MYSHIPMENTS.deliveryLocation')}
              </label>
              
              {showLocations && filteredLocations.length > 0 && (
                <div className={styles.locationDropdown}>
                  {filteredLocations.map((loc) => (
                    <div
                      key={loc._id || loc.loc_id}
                      className={styles.locationOption}
                      onClick={() => {
                        selectLocationChange(loc);
                        setShowLocations(false);
                      }}
                    >
                      <b>{loc.name}</b> - {loc.area}
                      {loc.city && ` - ${loc.city}`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {nearestPickup && (
              <div className={styles.nearestLocation}>
                <div className={styles.details}>
                  Vehicle is inside - {nearestPickup.name} - {nearestPickup.area}
                </div>
              </div>
            )}
          </div>

          <div className={styles.buttons}>
            <button
              className={`${styles.button} ${styles.submitButton}`}
              onClick={editLocationsSubmit}
              disabled={isLoading}
            >
              {isLoading ? t('common.updating') : t('DASHBOARD.edit')}
            </button>
            <button
              className={`${styles.button} ${styles.fetchButton}`}
              onClick={pickupFromDate ? getLocation : getLoc}
              disabled={isLoading}
            >
              {addLocationsType === 'pickup' ? 'Fetch Pickup' : 'Fetch Delivery'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLocationsModal;