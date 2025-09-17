import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  IconButton,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTime } from 'luxon';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format, parseISO } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useSnackbar } from '@/hooks/snackBar';
import { httpsGet, httpsPut, httpsPost } from '@/utils/Communication';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

declare global {
  interface Window {
    google: any;
  }
}

interface Location {
  _id: string;
  name: string;
  area: string;
  geo_point: {
    coordinates: [number, number];
  };
  polylines: string[];
  reference?: string;
}

interface Delivery {
  _id: string;
  location: Location;
}

interface Shipment {
  sin: string;
  _id: string;
  to: Delivery[];
  from: any[];
  pickDate: string;
  deliverDate: string;
  unique_code: string;
}

interface GeofenceEditorProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment;
  onSuccess?: () => void;
}

const GeofenceEditor: React.FC<GeofenceEditorProps> = ({ 
  open, 
  onClose, 
  shipment,
  onSuccess 
}) => {
  const { showMessage } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [arrivedAt, setArrivedAt] = useState<Date | null>(null);
  const [finishedAt, setFinishedAt] = useState<Date | null>(null);
  const [arrivedTime, setArrivedTime] = useState<string>('');
  const [finishedTime, setFinishedTime] = useState<string>('');
  const [locality, setLocality] = useState('');
  const [dateOptions, setDateOptions] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [areaDetails, setAreaDetails] = useState({
    area: '',
    locality: '',
    latitude: 0,
    longitude: 0,
    pincode: ''
  });

  // Refs for map and markers
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const drawingManagerRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const flightPathRef = useRef<any>(null);
  const coordinatesRef = useRef<any[]>([]);
  const coordinatesWithDateRef = useRef<any[]>([]);
  const pathRef = useRef<any[]>([]);
  const deleteFenceRef = useRef<boolean>(false);
  const gpsDataRef = useRef<any[]>([]);

  // Initialize map when component mounts or selected delivery changes
  useEffect(() => {
    if (open && mapRef.current && shipment.to?.length) {
      initializeMap();
      setSelectedDelivery(shipment.to[0]);
      
      // Initialize date options
      const pickupDate = DateTime.fromISO(shipment.pickDate);
      const deliveryDate = DateTime.fromISO(shipment.deliverDate);
      const minDate = deliveryDate.plus({ days: 6 });
      const currentDate = DateTime.local();
      const endDate = minDate > currentDate ? currentDate : minDate;
      
      const options: string[] = [];
      let currentDateObj = pickupDate;
      
      while (currentDateObj <= endDate) {
        options.push(currentDateObj.toFormat('dd-MM-yyyy'));
        currentDateObj = currentDateObj.plus({ days: 1 });
      }
      
      setDateOptions(options);
      setSelectedDate(options[0] || '');
      
      // Initialize area details
      if (shipment.to[0]?.location) {
        const loc = shipment.to[0].location;
        const locality = loc.area?.split(',')[1]?.trim() || '';
        setLocality(locality);
        setAreaDetails((prev:any) => ({
          ...prev,
          area: loc.area || '',
          locality: locality,
          latitude: loc.geo_point?.coordinates[1] || 0,
          longitude: loc.geo_point?.coordinates[0] || 0
        }));
      }
    }
    
    return () => {
      // Cleanup map when component unmounts
      if (mapInstance.current) {
        const mapElement = mapRef.current;
        if (mapElement) {
          mapElement.innerHTML = '';
        }
      }
    };
  }, [open, shipment]);

  // Initialize Google Map
  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;
    
    const initialLocation = shipment.to[0]?.location?.geo_point?.coordinates || [0, 0];
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: initialLocation[1], lng: initialLocation[0] },
      zoom: 12,
      mapTypeControl: true,
      scaleControl: false,
      streetViewControl: false,
      zoomControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU
      },
      mapTypeId: 'roadmap'
    });
    
    mapInstance.current = map;
    
    // Initialize drawing manager
    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [window.google.maps.drawing.OverlayType.POLYGON]
      },
      polygonOptions: {
        strokeWeight: 1,
        strokeColor: '#2962FF',
        clickable: false,
        editable: true
      }
    });
    
    drawingManager.setMap(map);
    drawingManagerRef.current = drawingManager;
    
    // Add event listener for polygon completion
    window.google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {
      if (event.type === 'polygon') {
        if (polygonRef.current) {
          polygonRef.current.setMap(null);
        }
        
        const polygon = event.overlay;
        polygonRef.current = polygon;
        
        // Get polygon coordinates
        const coordinates = polygon.getPath().getArray().map((point: any) => ({
          lat: point.lat(),
          lng: point.lng()
        }));
        
        pathRef.current = coordinates;
        drawingManager.setMap(null);
      }
    });
    
    // Plot initial data
    if (shipment.to[0]?.location?.polylines) {
      plotPolyLine(shipment.to[0].location.polylines);
    }
    
    placePickupsAndDrops();
  };
  
  // Plot polyline on the map
  const plotPolyLine = (polylines: string[]) => {
    if (!window.google || !mapInstance.current) return;
    
    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    
    if (polylines && polylines.length) {
      const path = window.google.maps.geometry.encoding.decodePath(polylines[0]);
      
      const polyline = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#7a00ff',
        strokeOpacity: 0.8,
        strokeWeight: 2
      });
      
      polyline.setMap(mapInstance.current);
      polylineRef.current = polyline;
    }
  };
  
  // Place pickup and drop markers
  const placePickupsAndDrops = () => {
    if (!window.google || !mapInstance.current) return;
    
    // Clear existing markers
    clearMarkers();
    
    // Add pickup markers
    shipment.from.forEach((location: any, index: number) => {
      if (location.location?.geo_point?.coordinates) {
        const [lng, lat] = location.location.geo_point.coordinates;
        
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance.current,
          icon: {
            url: '/assets/Pickup.svg',
            scaledSize: new window.google.maps.Size(30, 30)
          },
          label: {
            text: `P${index + 1}`,
            color: '#ffffff'
          }
        });
        
        markersRef.current.push(marker);
      }
    });
    
    // Add drop markers
    shipment.to.forEach((delivery: any, index: number) => {
      if (delivery.location?.geo_point?.coordinates) {
        const [lng, lat] = delivery.location.geo_point.coordinates;
        
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance.current,
          icon: {
            url: '/assets/Drop.svg',
            scaledSize: new window.google.maps.Size(30, 30)
          },
          label: {
            text: `D${index + 1}`,
            color: '#ffffff'
          },
          draggable: true
        });
        
        // Add drag end listener
        marker.addListener('dragend', () => {
          const newPosition = marker.getPosition();
          if (newPosition) {
            getReverseGeocodingData(newPosition.lat(), newPosition.lng());
          }
        });
        
        markersRef.current.push(marker);
      }
    });
  };
  
  // Clear all markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
  };
  
  // Handle delivery location selection
  const handleDeliverySelect = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    clearPolygon();
    
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(null);
      initializeDrawingManager();
    }
    
    setArrivedAt(null);
    setFinishedAt(null);
    
    if (delivery.location) {
      const loc = delivery.location;
      const locality = loc.area?.split(',')[1]?.trim() || '';
      setLocality(locality);
      setAreaDetails((prev:any) => ({
        ...prev,
        area: loc.area || '',
        locality: locality,
        latitude: loc.geo_point?.coordinates[1] || 0,
        longitude: loc.geo_point?.coordinates[0] || 0
      }));
      
      // Center map on selected delivery
      if (mapInstance.current && loc.geo_point?.coordinates) {
        const [lng, lat] = loc.geo_point.coordinates;
        mapInstance.current.setCenter({ lat, lng });
        mapInstance.current.setZoom(12);
      }
      
      // Plot polyline if available
      if (loc.polylines) {
        plotPolyLine(loc.polylines);
      }
    }
  };
  
  // Initialize drawing manager
  const initializeDrawingManager = () => {
    if (!window.google || !mapInstance.current) return;
    
    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [window.google.maps.drawing.OverlayType.POLYGON]
      },
      polygonOptions: {
        strokeWeight: 1,
        strokeColor: '#2962FF',
        clickable: false,
        editable: true
      }
    });
    
    drawingManager.setMap(mapInstance.current);
    drawingManagerRef.current = drawingManager;
    
    // Add event listener for polygon completion
    window.google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {
      if (event.type === 'polygon') {
        if (polygonRef.current) {
          polygonRef.current.setMap(null);
        }
        
        const polygon = event.overlay;
        polygonRef.current = polygon;
        
        // Get polygon coordinates
        const coordinates = polygon.getPath().getArray().map((point: any) => ({
          lat: point.lat(),
          lng: point.lng()
        }));
        
        pathRef.current = coordinates;
        drawingManager.setMap(null);
      }
    });
  };
  
  // Clear polygon from map
  const clearPolygon = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    
    deleteFenceRef.current = true;
  };
  
  // Get reverse geocoding data for coordinates
  const getReverseGeocodingData = (lat: number, lng: number) => {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };
    
    geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const addressComponents = results[0].address_components;
        
        // Find locality and area from address components
        let locality = '';
        let area = '';
        let pincode = '';
        
        addressComponents.forEach((component: any) => {
          if (component.types.includes('locality')) {
            locality = component.long_name;
          } else if (component.types.includes('sublocality_level_1')) {
            area = component.long_name;
          } else if (component.types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });
        
        setAreaDetails({
          area: results[0].formatted_address,
          locality,
          latitude: lat,
          longitude: lng,
          pincode
        });
        
        setLocality(area || locality);
      }
    });
  };
  
  // Handle path selection by date
  const handleGetPath = async () => {
    if (!selectedDate || !shipment._id) return;
    
    try {
      setLoading(true);
      
      const from = DateTime.fromFormat(selectedDate, 'dd-MM-yyyy').startOf('day').toUTC().toMillis();
      const to = DateTime.fromFormat(selectedDate, 'dd-MM-yyyy').endOf('day').toUTC().toMillis();
      
      const response = await httpsGet(`v1/shipment/path?shipment=${shipment._id}&from=${from}&to=${to}`);
      
      if (response.statusCode === 200 && response.data?.gps?.length) {
        gpsDataRef.current = response.data.gps;
        drawPath();
      }
    } catch (error) {
      console.error('Error fetching path:', error);
      showMessage('Failed to fetch path data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Draw path on map
  const drawPath = () => {
    if (!window.google || !mapInstance.current || !gpsDataRef.current.length) return;
    
    // Clear existing path
    if (flightPathRef.current) {
      flightPathRef.current.setMap(null);
      flightPathRef.current = null;
    }
    
    const coordinates = gpsDataRef.current
      .filter((point: any) => point.geo_point?.coordinates)
      .map((point: any) => ({
        lat: point.geo_point.coordinates[1],
        lng: point.geo_point.coordinates[0],
        date: point.created_at || point.last_call_at,
        speed: point.speed
      }));
    
    if (!coordinates.length) return;
    
    // Create polyline for the path
    const flightPath = new window.google.maps.Polyline({
      path: coordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    
    flightPath.setMap(mapInstance.current);
    flightPathRef.current = flightPath;
    
    // Add a marker for the last position
    const lastPoint = coordinates[coordinates.length - 1];
    const marker = new window.google.maps.Marker({
      position: { lat: lastPoint.lat, lng: lastPoint.lng },
      map: mapInstance.current,
      icon: {
        url: '/assets/location_pin_icon_large.svg',
        scaledSize: new window.google.maps.Size(30, 30)
      }
    });
    
    markersRef.current.push(marker);
    
    // Fit bounds to show the entire path
    const bounds = new window.google.maps.LatLngBounds();
    coordinates.forEach((coord: any) => bounds.extend(coord));
    mapInstance.current.fitBounds(bounds);
    
    // Check if points are inside the polygon (if any)
    if (pathRef.current?.length) {
      checkPointsInPolygon(coordinates);
    }
  };
  
  // Check if points are inside the polygon
  const checkPointsInPolygon = (points: any[]) => {
    if (!window.google || !pathRef.current?.length) return;
    
    // Create a polygon from the path
    const polygon = new window.google.maps.Polygon({
      paths: pathRef.current
    });
    
    // Find points inside the polygon
    const pointsInside = points.filter(point => 
      window.google.maps.geometry.poly.containsLocation(
        new window.google.maps.LatLng(point.lat, point.lng),
        polygon
      ) && !point.speed // Only consider points where speed is 0
    );
    
    if (pointsInside.length > 10) {
      const entry = pointsInside[0];
      setArrivedAt(new Date(entry.date));
      
      // Format time as HH:MM AM/PM
      const date = new Date(entry.date);
      setArrivedTime(date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
      
      // Find exit point (last point in the polygon)
      const exit = pointsInside[pointsInside.length - 1];
      const exitIndex = points.findIndex(p => p.lat === exit.lat && p.lng === exit.lng);
      
      // Check if there are points after exiting the polygon
      if (exitIndex < points.length - 1) {
        // Find the next point with speed > 0 (vehicle started moving again)
        const remainingPoints = points.slice(exitIndex + 1);
        const nextMovingPoint = remainingPoints.find(p => p.speed > 0);
        
        if (nextMovingPoint) {
          setFinishedAt(new Date(nextMovingPoint.date));
          setFinishedTime(new Date(nextMovingPoint.date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }));
        }
      }
    }
  };
  
  // Handle update location
  const handleUpdateLocation = async () => {
    if (!selectedDelivery) return;
    
    try {
      setLoading(true);
      
      // Prepare location data
      const locationData: any = {
        id: selectedDelivery.location._id,
        area: areaDetails.area,
        locality: areaDetails.locality,
        geo_point: {
          type: 'Point',
          coordinates: [areaDetails.longitude, areaDetails.latitude]
        },
        pincode: areaDetails.pincode
      };
      
      // Add polygon data if available
      if (pathRef.current?.length) {
        locationData.polygon = {
          type: 'Polygon',
          coordinates: [pathRef.current.map(coord => [coord.lng, coord.lat])]
        };
      } else if (deleteFenceRef.current) {
        locationData.deleteFence = true;
      }
      
      // Update location
      const response = await httpsPost('v2/location/update', locationData);
      
      if (response.statusCode === 200) {
        showMessage('Location updated successfully', 'success');
        
        // Update arrival and departure times if available
        if (arrivedAt && arrivedTime) {
          await updateArrivalTime();
        }
        
        if (finishedAt && finishedTime) {
          await updateDepartureTime();
        }
        
        onClose();
        if (onSuccess) onSuccess();
      } else {
        throw new Error(response.message || 'Failed to update location');
      }
    } catch (error: any) {
      console.error('Error updating location:', error);
      showMessage(error.message || 'Failed to update location', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Update arrival time
  const updateArrivalTime = async () => {
    if (!selectedDelivery || !arrivedAt || !arrivedTime) return;
    
    try {
      // Parse time string (e.g., "02:30 PM")
      const [time, period] = arrivedTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      // Set time on the arrivedAt date
      const arrivalDate = new Date(arrivedAt);
      arrivalDate.setHours(hours, minutes, 0, 0);
      
      const payload = {
        drop: selectedDelivery._id,
        shipment: shipment._id,
        reason: 'Marked drop arrived because driver has entered the location',
        arrived_at: arrivalDate.toISOString()
      };
      
      const response = await httpsPut('shipment/drop_arrived', payload);
      
      if (response.statusCode !== 200) {
        throw new Error('Failed to update arrival time');
      }
      
      showMessage('Arrival time updated successfully', 'success');
    } catch (error) {
      console.error('Error updating arrival time:', error);
      throw error;
    }
  };
  
  // Update departure time
  const updateDepartureTime = async () => {
    if (!selectedDelivery || !finishedAt || !finishedTime) return;
    
    try {
      // Parse time string (e.g., "02:30 PM")
      const [time, period] = finishedTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      // Set time on the finishedAt date
      const finishDate = new Date(finishedAt);
      finishDate.setHours(hours, minutes, 0, 0);
      
      const payload = {
        shipment_id: shipment._id,
        reason: 'Completed because driver has exited the location',
        arrived_at: arrivedAt?.toISOString() || new Date().toISOString(),
        finished_at: finishDate.toISOString()
      };
      
      const response = await httpsPut('shipment/complete', payload);
      
      if (response.statusCode !== 200) {
        throw new Error('Failed to update departure time');
      }
      
      showMessage('Departure time updated successfully', 'success');
    } catch (error) {
      console.error('Error updating departure time:', error);
      throw error;
    }
  };
  
  // Handle remove geofence
  const handleRemoveGeofence = () => {
    clearPolygon();
    deleteFenceRef.current = true;
    showMessage('Geofence removed. Click Update Location to save changes.', 'info');
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: { 
          width: '928px',
          maxWidth: '95vw',
          height: '642px',
          maxHeight: '95vh',
          margin: 0,
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      {/* <DialogTitle 
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '80px',
          padding: '0 24px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fff',
          '& .MuiTypography-root': {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#42454E'
          }
        }}
      >
        Update Delivery Location
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle> */}

      <ModalHeader 
        title={`Update Delivery Location - #${shipment.sin}`}
        onClose={onClose}
      />
      
      <DialogContent 
        sx={{
          display: 'flex',
          padding: 0,
          height: 'calc(100% - 80px)',
          '&.MuiDialogContent-root': {
            padding: 0
          }
        }}
      >
        {/* Left side - Map */}
        <div 
          ref={mapRef}
          style={{
            flex: '0.56',
            height: '100%',
            position: 'relative'
          }}
        >
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1000
            }}>
              <CircularProgress />
            </div>
          )}
        </div>
        
        {/* Right side - Controls */}
        <div 
          style={{
            flex: '0.44',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            backgroundColor: '#fff',
            overflowY: 'auto'
          }}
        >
          {/* Delivery Location Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <FormControl fullWidth size="small">
              <InputLabel id="delivery-location-label">Select Delivery Location</InputLabel>
              <Select
                labelId="delivery-location-label"
                value={selectedDelivery?._id || ''}
                onChange={(e) => {
                  const delivery = shipment.to.find(d => d._id === e.target.value);
                  if (delivery) {
                    handleDeliverySelect(delivery);
                  }
                }}
                label="Select Delivery Location"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#DFE3EB'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#DFE3EB'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2962FF'
                  }
                }}
              >
                {shipment.to.map((delivery, index) => (
                  <MenuItem key={delivery._id} value={delivery._id}>
                    {delivery.location.reference 
                      ? `${delivery.location.reference} - ${delivery.location.name}`
                      : delivery.location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          
          {/* Date Selection and Get Path Button */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '20px',
            gap: '12px'
          }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="date-select-label">Select a Date</InputLabel>
              <Select
                labelId="date-select-label"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                label="Select a Date"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#DFE3EB'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#DFE3EB'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2962FF'
                  }
                }}
              >
                {dateOptions.map((date) => (
                  <MenuItem key={date} value={date}>
                    {date}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              onClick={handleGetPath}
              sx={{
                border: '1px solid #DFE3EB',
                backgroundColor: '#FFFFFF',
                color: '#42454E',
                textTransform: 'none',
                fontSize: '14px',
                padding: '8px 12px',
                '&:hover': {
                  backgroundColor: '#F5F7FA',
                  borderColor: '#DFE3EB'
                }
              }}
              startIcon={
                <img 
                  src="/assets/get_path.svg" 
                  alt="Get Path" 
                  style={{ width: '16px', height: '16px' }} 
                />
              }
            >
              Get Path
            </Button>
          </div>
          
          {/* Arrived and Finished Times */}
          <div style={{
            backgroundColor: '#F0F3F9',
            padding: '16px',
            borderRadius: '4px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Arrived At */}
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{
                width: '80px',
                fontSize: '14px',
                color: '#42454E'
              }}>
                Arrived at
              </span>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={arrivedAt}
                  onChange={(date) => setArrivedAt(date)}
                //   renderInput={(params: any) => (
                //     <TextField 
                //       {...params} 
                //       size="small" 
                //       sx={{ 
                //         width: '140px',
                //         '& .MuiOutlinedInput-root': {
                //           height: '36px',
                //           '& input': {
                //             padding: '8px 12px',
                //             fontSize: '14px',
                //             color: '#131722'
                //           },
                //           '& fieldset': {
                //             borderColor: '#DFE3EB'
                //           },
                //           '&:hover fieldset': {
                //             borderColor: '#DFE3EB'
                //           },
                //           '&.Mui-focused fieldset': {
                //             borderColor: '#2962FF'
                //           }
                //         }
                //       }}
                //       placeholder="Date"
                //     />
                //   )}
                />
                
                <TimePicker
                  value={arrivedTime ? new Date(`1970-01-01T${arrivedTime}`) : null}
                  onChange={(time) => {
                    if (time) {
                      const hours = time.getHours();
                      const minutes = time.getMinutes();
                      const period = hours >= 12 ? 'PM' : 'AM';
                      const displayHours = hours % 12 || 12;
                      setArrivedTime(`${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`);
                    } else {
                      setArrivedTime('');
                    }
                  }}
                //   renderInput={(params: any) => (
                //     <TextField 
                //       {...params} 
                //       size="small" 
                //       sx={{ 
                //         width: '100px',
                //         marginLeft: '8px',
                //         '& .MuiOutlinedInput-root': {
                //           height: '36px',
                //           '& input': {
                //             padding: '8px 12px',
                //             fontSize: '14px',
                //             color: '#131722'
                //           },
                //           '& fieldset': {
                //             borderColor: '#DFE3EB'
                //           },
                //           '&:hover fieldset': {
                //             borderColor: '#DFE3EB'
                //           },
                //           '&.Mui-focused fieldset': {
                //             borderColor: '#2962FF'
                //           }
                //         }
                //       }}
                //       placeholder="Time"
                //     />
                //   )}
                />
              </LocalizationProvider>
            </div>
            
            {/* Finished At */}
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{
                width: '80px',
                fontSize: '14px',
                color: '#42454E'
              }}>
                Finished at
              </span>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={finishedAt}
                  onChange={(date) => setFinishedAt(date)}
                //   renderInput={(params: any) => (
                //     <TextField 
                //       {...params} 
                //       size="small" 
                //       sx={{ 
                //         width: '140px',
                //         '& .MuiOutlinedInput-root': {
                //           height: '36px',
                //           '& input': {
                //             padding: '8px 12px',
                //             fontSize: '14px',
                //             color: '#131722'
                //           },
                //           '& fieldset': {
                //             borderColor: '#DFE3EB'
                //           },
                //           '&:hover fieldset': {
                //             borderColor: '#DFE3EB'
                //           },
                //           '&.Mui-focused fieldset': {
                //             borderColor: '#2962FF'
                //           }
                //         }
                //       }}
                //       placeholder="Date"
                //     />
                //   )}
                />
                
                <TimePicker
                  value={finishedTime ? new Date(`1970-01-01T${finishedTime}`) : null}
                  onChange={(time) => {
                    if (time) {
                      const hours = time.getHours();
                      const minutes = time.getMinutes();
                      const period = hours >= 12 ? 'PM' : 'AM';
                      const displayHours = hours % 12 || 12;
                      setFinishedTime(`${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`);
                    } else {
                      setFinishedTime('');
                    }
                  }}
                //   renderInput={(params: any) => (
                //     <TextField 
                //       {...params} 
                //       size="small" 
                //       sx={{ 
                //         width: '100px',
                //         marginLeft: '8px',
                //         '& .MuiOutlinedInput-root': {
                //           height: '36px',
                //           '& input': {
                //             padding: '8px 12px',
                //             fontSize: '14px',
                //             color: '#131722'
                //           },
                //           '& fieldset': {
                //             borderColor: '#DFE3EB'
                //           },
                //           '&:hover fieldset': {
                //             borderColor: '#DFE3EB'
                //           },
                //           '&.Mui-focused fieldset': {
                //             borderColor: '#2962FF'
                //           }
                //         }
                //       }}
                //       placeholder="Time"
                //     />
                //   )}
                />
              </LocalizationProvider>
            </div>
          </div>
          
          {/* Location Details */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '12px 16px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            border: '1px solid #F0F3F9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ color: '#2962FF', marginRight: '12px' }} />
              <div>
                <div style={{
                  fontSize: '16px',
                  color: '#42454E',
                  fontWeight: 500,
                  marginBottom: '6px'
                }}>
                  {locality || 'Location not specified'}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#71747A'
                }}>
                  {areaDetails.area || 'Area not specified'}
                </div>
              </div>
            </div>
            
            <IconButton 
              onClick={handleRemoveGeofence}
              size="small"
              sx={{
                color: '#E53935',
                '&:hover': {
                  backgroundColor: 'rgba(229, 57, 53, 0.08)'
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </div>
          
          {/* Update Location Button */}
          <Button
            variant="contained"
            onClick={handleUpdateLocation}
            disabled={loading}
            sx={{
              width: '100%',
              height: '44px',
              backgroundColor: '#2962FF',
              color: '#FFFFFF',
              borderRadius: '4px',
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#1E4B9A'
              },
              '&.Mui-disabled': {
                backgroundColor: '#E0E0E0',
                color: '#9E9E9E'
              }
            }}
          >
            {loading ? 'Updating...' : 'UPDATE LOCATION'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeofenceEditor;
