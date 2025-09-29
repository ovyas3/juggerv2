import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { httpsGet, httpsPost } from '@/utils/Communication';
import { useSnackbar } from '@/hooks/snackBar';
import styles from './EditLocationsModal.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';
import { DateTime } from 'luxon';
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { createPortal } from 'react-dom';
import * as turf from '@turf/turf';

interface Location {
  _id?: string;
  loc_id?: string;
  name: string;
  area: string;
  city: any;
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
  elementOrderId: string;
  currentLocation?: number[];
  onEditSuccess: () => void;
  combinedLocation?: string; // Add this
  pickupCity?: string; // Add this
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [pickupFromDate, setPickupFromDate] = useState<Date | null>(null);
  const [location, setLocation] = useState<{ withEntity: string }>({ 
    withEntity: initialCombinedLocation 
  });
  const [vehicleLocations, setVehicleLocations] = useState<Location[]>([]);
  const [proximityPickupLocations, setProximityPickupLocations] = useState<ProximityLocation[]>([]);
  const [nearestPickup, setNearestPickup] = useState<Location | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [shipperPrefsState, setShipperPrefs] = useState<ShipperPrefs>({
    locations: [],
    deliveryLocations: []
  });
  const [isInputFocused, setIsInputFocused] = useState(false);

  console.log("elementOrderId86432374927836457", elementOrderId)

  useEffect(() => {
    // Load shipper preferences
    if (shipperPrefs && (shipperPrefs.locations?.length > 0 || shipperPrefs.deliveryLocations?.length > 0)) {
      setShipperPrefs(shipperPrefs);
    } else if (elementOrderId) {
      // If no shipperPrefs provided or empty, fetch them
      getShipperPrefs();
    }
    
    // Initialize with existing location data
    if (initialCombinedLocation) {
      console.log('Setting initial location:', initialCombinedLocation);
      setLocation({ withEntity: initialCombinedLocation });
      
      // We'll find and set the selected location after shipper prefs are loaded
    }
    
    // Fetch proximity locations if pickup city is provided
    if (initialPickupCity) {
      fetchProximityLocations(initialPickupCity);
    }
  }, [elementOrderId, initialCombinedLocation, initialPickupCity]);
  
  // Separate effect to handle existing location selection after data is loaded
  useEffect(() => {
    if (initialCombinedLocation && (shipperPrefsState.locations.length > 0 || shipperPrefsState.deliveryLocations.length > 0)) {
      const allLocations = addLocationsType === 'pickup' 
        ? shipperPrefsState.locations 
        : shipperPrefsState.deliveryLocations;
      
      const existingLocation = allLocations.find(loc => {
        const locationText = `${loc.name} - ${loc.area}${loc.city ? ` - ${loc.city}` : ''}`;
        return locationText === initialCombinedLocation;
      });
      
      if (existingLocation) {
        console.log('Found existing location:', existingLocation);
        setSelectedLocation(existingLocation);
      }
    }
  }, [initialCombinedLocation, shipperPrefsState, addLocationsType]);

  useEffect(() => {
    if (shipperPrefs?.locations?.length > 0) {
      const locations = shipperPrefs.locations.map(loc => ({
        l: loc,
        fence: loc.geo_fence ? turf.polygon(loc.geo_fence.coordinates) : null
      }));
      console.log('Loaded proximity locations:', locations);
      setProximityPickupLocations(locations);
    }
  }, [shipperPrefs]);

  useEffect(() => {
    if (initialCombinedLocation) {
      console.log('Setting initial location:', initialCombinedLocation);
      setLocation({ withEntity: initialCombinedLocation });
      
      // Try to find and set the selectedLocation from shipperPrefs
      const allLocations = [
        ...(shipperPrefs?.locations || []),
        ...(shipperPrefs?.deliveryLocations || [])
      ];
      
      // Try different matching strategies
      const foundLocation = allLocations.find(loc => {
        // Try exact match first
        if (loc.name === initialCombinedLocation) return true;
        
        // Try partial match (in case of extra/missing spaces or special characters)
        const cleanName = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
        if (cleanName(loc.name) === cleanName(initialCombinedLocation)) return true;
        
        // Try matching parts of the name
        const nameParts = initialCombinedLocation.split(/[\s-]/).filter(Boolean);
        return nameParts.some(part => 
          part.length > 3 && // Only check meaningful parts
          loc.name.toLowerCase().includes(part.toLowerCase())
        );
      });
      
      if (foundLocation) {
        console.log('Found matching location in prefs:', foundLocation);
        setSelectedLocation(foundLocation);
      } else {
        console.log('No matching location found in prefs for:', initialCombinedLocation);
        console.log('Available locations:', allLocations.map(l => l.name));
      }
    }
  }, [initialCombinedLocation, shipperPrefs]);

  const fetchProximityLocations = async (city: any) => {
    try {
      const pathWithParams = `location/city_proximity?city=${encodeURIComponent(city)}`;
      const response = await httpsGet(pathWithParams, 4);
     
      if (response.statusCode === 200) {
        const locations = response.data.map((l: any) => ({
          ...l,
          area: l.area || '',
          city: l.city || city
        }));
        setProximityPickupLocations(locations);
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

  const selectLocationChange = (selectedLoc: Location) => {
    console.log('Location selected:', selectedLoc);
    
    setSelectedLocation(selectedLoc);
    
    // Format the display text consistently
    const displayText = `${selectedLoc.name} - ${selectedLoc.area}${selectedLoc.city ? ` - ${selectedLoc.city}` : ''}`;
    setLocation({ withEntity: displayText });
    
    // Hide dropdown after selection
    setIsInputFocused(false);
  };
  

  const calculateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };
  
  useEffect(() => {
    if (isInputFocused) {
      calculateDropdownPosition();
    }
  }, [isInputFocused]);
  

  // Simplified getLoc function to match Angular implementation
  const getLoc = () => {
    console.log('getLoc called with currentLocation:', currentLocation);
    
    const nearest = getPickupLocationByCurrentLocation();
    console.log('Nearest location found:', nearest);
    
    if (nearest?._id) {
      console.log('Setting selected location to:', nearest);
      setSelectedLocation(nearest);
      setLocation({ withEntity: nearest.name || '' });
    } else {
      console.log('No location found in proximity');
      showMessage('No location found, try again', 'error');
    }
  };

  // Simplified getPickupLocationByCurrentLocation function
  const getPickupLocationByCurrentLocation = (): Location | null => {
    if (!currentLocation || currentLocation.length === 0 || !proximityPickupLocations?.length) {
      return null;
    }

    try {
      const pointFeature = turf.point([currentLocation[1], currentLocation[0]]); // [lng, lat]
      
      for (const location of proximityPickupLocations) {
        if (!location.fence) continue;
        
        const polygon = turf.polygon(location.fence.coordinates);
        const inside = turf.booleanPointInPolygon(pointFeature, polygon);
        
        if (inside && location.l) {
          return location.l;
        }
      }
    } catch (error) {
      console.error('Error in getPickupLocationByCurrentLocation:', error);
    }
    
    return null;
  };

  // Update the form submission to use selectedLocation._id
  const editLocationsSubmit = async () => {
    if (!selectedLocation?._id) {
      showMessage('Please select a valid location', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = addLocationsType === 'pickup' ? 'shipment/editPick' : 'shipment/editDelivery';
      const payload = {
        shipment_id: shipmentId,
        location_id: selectedLocation._id,
        ...(addLocationsType === 'pickup' && { pickup_id: pickupId }),
        ...(addLocationsType === 'delivery' && { delivery_id: deliveryId })
      };

      const response = await httpsPost(apiUrl, payload, 4);
      
      if (response.statusCode === 200) {
        showMessage('Location updated successfully', 'success');
        onEditSuccess();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to update location');
      }
    } catch (error: any) {
      console.error('Error updating location:', error);
      showMessage(error.message || 'Error updating location', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getLocation = async () => {
    if (!pickupFromDate) {
      showMessage('Please select a date first', 'error');
      return;
    }

    setIsFetching(true);
    try {
      const dateStr = encodeURIComponent(pickupFromDate.toISOString());
      const response = await httpsGet(
        `location/getVehicleCoordinates?shipment=${shipmentId}&from=${dateStr}`,
        4
      );

      if (response.statusCode === 200) {
        setVehicleLocations(response.data);
        setIsDataFetched(true);
        
        // Find nearest pickup location if current location is available
        if (currentLocation && currentLocation.length === 2 && response.data.length > 0) {
          setNearestPickup(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicle location:', error);
      showMessage('Failed to fetch vehicle location', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const renderLocationInput = () => {
    console.log('renderLocationInput - current location.withEntity:', location.withEntity);
    console.log('renderLocationInput - selectedLocation:', selectedLocation);
    
    // Use fetched data only if it exists AND has items, otherwise use shipper prefs
    const locations = (isDataFetched && vehicleLocations.length > 0) ? vehicleLocations : 
      (addLocationsType === 'pickup' ? shipperPrefsState.locations : shipperPrefsState.deliveryLocations);
      
    const label = addLocationsType === 'pickup' ? 'Pickup Location' : 'Delivery Location';
    const showLabel = location.withEntity || isInputFocused;
  
    return (
      <div className={styles.didFloatingLabelContent}>
        <input
          ref={inputRef}
          type="text"
          className={`${styles.inputField} ${styles.didFloatingInput}`}
          value={location.withEntity}
          onChange={(e) => setLocation({ withEntity: e.target.value })}
          onFocus={() => {
            setIsInputFocused(true);
            calculateDropdownPosition();
          }}
          onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
          placeholder=" "
        />
        <label className={`${styles.didFloatingLabel} ${showLabel ? styles.floating : ''}`}>
          {label}
        </label>
        
        {(location.withEntity || isInputFocused) && createPortal(
          <div 
            className={styles.locationDropdownPortal}
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 9999
            }}
          >
            {locations
              .filter(loc => {
                const locationText = `${loc.name} - ${loc.area}${loc.city ? ` - ${loc.city}` : ''}`;
                const matchesSearch = locationText.toLowerCase().includes(location.withEntity?.toLowerCase() || '');
                
                const isNotSelected = !selectedLocation || 
                  (loc._id || loc.loc_id) !== (selectedLocation._id || selectedLocation.loc_id);
                
                return matchesSearch && isNotSelected;
              })
              .map((loc) => (
                <div 
                  key={loc._id || loc.loc_id}
                  className={styles.locationItem}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectLocationChange(loc);
                  }}
                >
                  <b>{loc.name}</b> - {loc.area} {loc.city ? `- ${loc.city}` : ''}
                </div>
              ))}
          </div>,
          document.body
        )}
      </div>
    );
  };
  
  
  

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <ModalHeader 
          title={`${addLocationsType === 'pickup' ? 'Edit Pickup Location' : 'Edit Delivery Location'} - #${orderNumber}`}
          onClose={onClose}
        />
        
        <div className={styles.modalBody}>

          <div className={styles.datePicker}>
            <DatePicker
              value={pickupFromDate ? dayjs(pickupFromDate) : null}
              onChange={(date) => {
                setPickupFromDate(date ? date.toDate() : null);
              }}
              format="DD/MM/YYYY"
              className={styles.dateInput}
              placeholder="Select date"
              style={{ width: '100%' }}
            />
          </div>

          <div className={styles.locationSection}>
            {renderLocationInput()}
            
            {nearestPickup && (
              <div className={styles.nearestLocation}>
                Vehicle is inside - {nearestPickup.name} - {nearestPickup.area}
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={pickupFromDate ? getLocation : getLoc}
              disabled={isFetching}
            >
              {addLocationsType === 'pickup' ? (isFetching ? 'Fetching...' : 'Fetch Pickup') : (isFetching ? 'Fetching...' : 'Fetch Delivery')}
            </button>
            <button 
              className={`${styles.button} ${styles.primary}`}
              onClick={editLocationsSubmit}
              disabled={!selectedLocation || isLoading}
            >
              {isLoading ? 'Editing...' : 'Edit'}
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLocationsModal;
