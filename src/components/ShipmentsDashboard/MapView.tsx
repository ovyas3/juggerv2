// MapView.tsx
import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { GoogleMap, Marker, InfoWindow, Polygon } from '@react-google-maps/api';
import MarkerClusterer from '@googlemaps/markerclustererplus';
import styles from './MapView.module.css';
import {
  MapVehicle,
  MapShipment,
  MapViewOptions,
  MapFilterOptions,
  DEFAULT_VIEW_OPTIONS,
  DEFAULT_FILTER_OPTIONS,
} from './mapViewTypes';

// Vehicle Icons - matching your Angular implementation
const vehicleIcons = {
  free: {
    name: 'Free Truck',
    url: 'assets/Group_19511.svg',
    scaledSize: new google.maps.Size(30, 30),
    labelOrigin: new google.maps.Point(20, -10),
  },
  in_shipment: {
    name: 'In Transit',
    url: 'assets/Group_19527.svg',
    scaledSize: new google.maps.Size(30, 30),
    labelOrigin: new google.maps.Point(20, -10),
  },
  at_pickup: {
    name: 'At Pickup',
    url: 'assets/Group_19531.svg',
    scaledSize: new google.maps.Size(30, 30),
    labelOrigin: new google.maps.Point(20, -10),
  },
  towards_pickup: {
    name: 'Towards Pickup',
    url: 'assets/Group_19524.svg',
    scaledSize: new google.maps.Size(30, 30),
    labelOrigin: new google.maps.Point(20, -10),
  },
  at_delivery: {
    name: 'At Delivery',
    url: 'assets/Group 19547.svg',
    scaledSize: new google.maps.Size(30, 30),
    labelOrigin: new google.maps.Point(20, -10),
  },
  stop: {
    url: 'assets/stop.svg',
    scaledSize: new google.maps.Size(30, 30),
    labelOrigin: new google.maps.Point(20, -10),
  },
};

// Event Stage Icons - matching your Angular implementation
const eventStageIcons = {
  PO: { url: 'assets/parkingout.svg', scaledSize: new google.maps.Size(30, 30) },
  GI: { url: 'assets/gate_in.svg', scaledSize: new google.maps.Size(30, 30) },
  TW: { url: 'assets/tare_weight.svg', scaledSize: new google.maps.Size(30, 30) },
  GW: { url: 'assets/gross_weight.svg', scaledSize: new google.maps.Size(30, 30) },
  PG: { url: 'assets/ewaybill.svg', scaledSize: new google.maps.Size(30, 30) },
  TC: { url: 'assets/test_certificate.svg', scaledSize: new google.maps.Size(30, 30) },
  IV: { url: 'assets/invoice.svg', scaledSize: new google.maps.Size(30, 30) },
  EW: { url: 'assets/post_goods.svg', scaledSize: new google.maps.Size(30, 30) },
};

// Delay Icons - matching your Angular implementation
const delayIcons = {
  onTime: { url: 'assets/on_time.svg', scaledSize: new google.maps.Size(30, 30) },
  twoToFour: { url: 'assets/two_fours_hrs.svg', scaledSize: new google.maps.Size(30, 30) },
  fourToEight: { url: 'assets/four_eight_hrs.svg', scaledSize: new google.maps.Size(30, 30) },
  eightToTwelve: { url: 'assets/eight_twelve_hrs.svg', scaledSize: new google.maps.Size(30, 30) },
  twelveToSixteen: { url: 'assets/twelve_sixteen_hrs.svg', scaledSize: new google.maps.Size(30, 30) },
  sixteenToTwenty: { url: 'assets/sixteen_twenty_hrs.svg', scaledSize: new google.maps.Size(30, 30) },
  beyondTwenty: { url: 'assets/beyond_20.svg', scaledSize: new google.maps.Size(30, 30) },
};

interface MapViewProps {
  vehicles?: MapVehicle[];
  shipments?: MapShipment[];
  viewOptions?: Partial<MapViewOptions>;
  filterOptions?: Partial<MapFilterOptions>;
  polygons?: any[];
  onFilterChange?: (filters: MapFilterOptions) => void;
  onVehicleClick?: (vehicle: MapVehicle) => void;
  onShipmentClick?: (shipment: MapShipment) => void;
  onMapClick?: (latlng: google.maps.LatLngLiteral) => void;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds | null) => void;
  onZoomChanged?: (zoom: number) => void;
  loadingElement?: React.ReactNode;
  errorElement?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isVisible?: boolean;
  showClustering?: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  vehicles = [],
  shipments = [],
  viewOptions: propViewOptions = {},
  filterOptions: propFilterOptions = {},
  polygons = [],
  onFilterChange,
  onVehicleClick,
  onShipmentClick,
  onMapClick,
  onBoundsChanged,
  onZoomChanged,
  loadingElement = (
    <Box className={styles.loadingContainer}>
      <CircularProgress size={40} />
      <Typography variant="body2" sx={{ mt: 1 }}>
        Loading map...
      </Typography>
    </Box>
  ),
  errorElement = (
    <Box className={styles.errorContainer}>
      <Typography variant="body1">Error Loading Map</Typography>
    </Box>
  ),
  className = '',
  style = {},
  isVisible = true,
  showClustering = false,
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  const viewOptions = useMemo(
    () => ({ ...DEFAULT_VIEW_OPTIONS, ...propViewOptions }),
    [propViewOptions]
  );

  const filterOptions = useMemo(
    () => ({ ...DEFAULT_FILTER_OPTIONS, ...propFilterOptions }),
    [propFilterOptions]
  );

  // Map options - matching your Angular implementation
  const mapOptions = useMemo(() => ({
    mapTypeId: 'terrain',
    mapTypeControl: true,
    scaleControl: false,
    streetViewControl: false,
    zoomControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
    },
    styles: [
      {
        featureType: "all",
        elementType: "geometry",
        stylers: [{ color: "#f5f5f5" }]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#c9c9c9" }]
      }
    ]
  }), []);

  // Filter vehicles based on filter options
  const filteredVehicles = useMemo(() => {
    if (!viewOptions.showVehicles) return [];
    
    return vehicles.filter(vehicle => {
      if (!vehicle.location?.lat || !vehicle.location?.lng) return false;
      
      if (filterOptions.vehicleStatuses && filterOptions.vehicleStatuses.length > 0) {
        return filterOptions.vehicleStatuses.includes(vehicle.status);
      }
      
      return true;
    });
  }, [vehicles, viewOptions.showVehicles, filterOptions.vehicleStatuses]);

  // Filter shipments based on filter options
  const filteredShipments = useMemo(() => {
    if (!viewOptions.showShipments) return [];
    
    return shipments.filter(shipment => {
      if (!shipment.currentLocation?.lat || !shipment.currentLocation?.lng) return false;
      
      if (filterOptions.shipmentStatuses && filterOptions.shipmentStatuses.length > 0) {
        return filterOptions.shipmentStatuses.includes(shipment.status);
      }
      
      return true;
    });
  }, [shipments, viewOptions.showShipments, filterOptions.shipmentStatuses]);

  // Get vehicle icon based on status - matching your Angular logic
  const getVehicleIcon = useCallback((vehicle: any) => {
    let iconKey = 'free';
    
    if (vehicle.status === 'in_shipment' || vehicle.status === 'ITNS') {
      iconKey = 'in_shipment';
    } else if (vehicle.status === 'at_pickup' || vehicle.status === 'SP') {
      iconKey = 'at_pickup';
    } else if (vehicle.status === 'towards_pickup') {
      iconKey = 'towards_pickup';
    } else if (vehicle.status === 'at_delivery' || vehicle.status === 'ALD') {
      iconKey = 'at_delivery';
    }

    return vehicleIcons['in_shipment'] || vehicleIcons.free;
  }, []);

  // Get delay icon based on delay hours
  const getDelayIcon = useCallback((delayHours: number) => {
    if (delayHours <= 2) return delayIcons.onTime;
    if (delayHours <= 4) return delayIcons.twoToFour;
    if (delayHours <= 8) return delayIcons.fourToEight;
    if (delayHours <= 12) return delayIcons.eightToTwelve;
    if (delayHours <= 16) return delayIcons.twelveToSixteen;
    if (delayHours <= 20) return delayIcons.sixteenToTwenty;
    return delayIcons.beyondTwenty;
  }, []);

  // Create info window content - matching your Angular template
  const createInfoWindowContent = useCallback((item: MapVehicle | MapShipment, type: 'vehicle' | 'shipment') => {
    if (type === 'vehicle') {
      const vehicle = item as MapVehicle;
      return `
        <div style="min-width: 300px; padding: 12px; font-family: Inter, sans-serif;">
          <div style="border-bottom: 1px solid #dfe3eb; padding-bottom: 10px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <strong style="font-size: 16px; color: #334155;">${vehicle.vehicleNumber || 'N/A'}</strong>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 12px;">Vehicle Name:</span>
            <span style="font-weight: 500; margin-left: 8px;">${vehicle.vehicleNumber || 'N/A'}</span>
          </div>
          
          <div style="margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 12px;">Status:</span>
            <span style="font-weight: 500; margin-left: 8px;">${vehicle.status || 'N/A'}</span>
          </div>
          
          <div style="margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 12px;">Driver:</span>
            <span style="font-weight: 500; margin-left: 8px;">${vehicle.driverName || 'N/A'}</span>
          </div>
          
          ${vehicle.driverMobile ? `
            <div style="margin-bottom: 8px;">
              <span style="color: #64748b; font-size: 12px;">Mobile:</span>
              <span style="font-weight: 500; margin-left: 8px;">${vehicle.driverMobile}</span>
            </div>
          ` : ''}
          
          ${vehicle.lastUpdated ? `
            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #f1f5f9;">
              <span style="color: #64748b; font-size: 11px;">Last Update: ${vehicle.lastUpdated.toLocaleString()}</span>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      const shipment = item as MapShipment;
      return `
        <div style="min-width: 300px; padding: 12px; font-family: Inter, sans-serif;">
          <div style="border-bottom: 1px solid #dfe3eb; padding-bottom: 10px; margin-bottom: 12px;">
            <strong style="font-size: 16px; color: #334155;">${shipment.shipmentNumber || 'Shipment'}</strong>
          </div>
          
          <div style="margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 12px;">Status:</span>
            <span style="font-weight: 500; margin-left: 8px;">${shipment.status}</span>
          </div>
          
          <div style="margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 12px;">From:</span>
            <span style="font-weight: 500; margin-left: 8px;">${shipment.source.name}</span>
          </div>
          
          <div style="margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 12px;">To:</span>
            <span style="font-weight: 500; margin-left: 8px;">${shipment.destination.name}</span>
          </div>
          
          ${shipment.estimatedArrival ? `
            <div style="margin-bottom: 8px;">
              <span style="color: #64748b; font-size: 12px;">ETA:</span>
              <span style="font-weight: 500; margin-left: 8px;">${shipment.estimatedArrival.toLocaleString()}</span>
            </div>
          ` : ''}
        </div>
      `;
    }
  }, []);

  // Handle map load
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Google Maps instance loaded successfully');
    mapRef.current = map;
    setIsMapReady(true);

    // Initialize marker clusterer if enabled
    if (showClustering && window.google?.maps) {
      markerClustererRef.current = new MarkerClusterer(map, [], {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        gridSize: 60,
        maxZoom: 15,
      });
    }

    // Apply initial view
    if (viewOptions.center) {
      map.setCenter(viewOptions.center);
    }
    
    if (viewOptions.zoom) {
      map.setZoom(viewOptions.zoom);
    }
  }, [viewOptions.center, viewOptions.zoom, showClustering]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    mapMarkers.forEach(marker => {
      marker.setMap(null);
    });
    setMapMarkers([]);
    
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
    }
  }, [mapMarkers]);

  // Create markers for vehicles and shipments
  const createMarkers = useCallback(() => {
    if (!mapRef.current || !isMapReady) return;

    clearMarkers();
    const newMarkers: google.maps.Marker[] = [];

    // Create vehicle markers
    filteredVehicles.forEach((vehicle) => {
      if (!vehicle.location?.lat || !vehicle.location?.lng) return;

      const icon = getVehicleIcon(vehicle);
      const marker = new google.maps.Marker({
        position: { lat: vehicle.location.lat, lng: vehicle.location.lng },
        map: mapRef.current,
        title: vehicle.vehicleNumber || 'Vehicle',
        icon: {
          url: icon.url,
          scaledSize: icon.scaledSize,
          labelOrigin: icon.labelOrigin,
        },
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedMarker({ ...vehicle, type: 'vehicle' });
        setInfoWindowOpen(true);
        onVehicleClick?.(vehicle);
      });

      newMarkers.push(marker);
    });

    // Create shipment markers
    filteredShipments.forEach((shipment) => {
      if (!shipment.currentLocation?.lat || !shipment.currentLocation?.lng) return;

      const marker = new google.maps.Marker({
        position: { lat: shipment.currentLocation.lat, lng: shipment.currentLocation.lng },
        map: mapRef.current,
        title: shipment.shipmentNumber || 'Shipment',
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
          rotation: 45,
        },
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedMarker({ ...shipment, type: 'shipment' });
        setInfoWindowOpen(true);
        onShipmentClick?.(shipment);
      });

      newMarkers.push(marker);
    });

    setMapMarkers(newMarkers);

    // Add markers to cluster if enabled
    if (showClustering && markerClustererRef.current) {
      markerClustererRef.current.addMarkers(newMarkers);
    }

    // Fit map to show all markers
    if (newMarkers.length > 0 && viewOptions.fitToMarkers) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      mapRef.current?.fitBounds(bounds, 30);
    }
  }, [filteredVehicles, filteredShipments, isMapReady, getVehicleIcon, clearMarkers, onVehicleClick, onShipmentClick, showClustering, viewOptions.fitToMarkers]);

  // Create markers when data changes
  useEffect(() => {
    createMarkers();
  }, [createMarkers]);

  // Handle map resize when visibility changes
  useEffect(() => {
    if (isVisible && isMapReady && mapRef.current) {
      const timer = setTimeout(() => {
        if (mapRef.current) {
          google.maps.event.trigger(mapRef.current, 'resize');
          if (viewOptions.center) {
            mapRef.current.setCenter(viewOptions.center);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isMapReady, viewOptions.center]);

  // Check if Google Maps API is loaded
  const isGoogleMapsLoaded = useMemo(() => {
    const loaded = typeof window !== 'undefined' && !!(window as any).google?.maps;
    console.log('Google Maps API loaded:', loaded);
    return loaded;
  }, []);

  if (!isGoogleMapsLoaded) {
    console.log('Google Maps API not loaded, showing loading state');
    return (
      <div className={`${styles.container} ${className}`} style={style}>
        {loadingElement}
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`} style={style}>
      <div className={styles.map}>
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={{ lat: viewOptions.center.lat, lng: viewOptions.center.lng }}
          zoom={viewOptions.zoom}
          options={mapOptions}
          onLoad={handleMapLoad}
          onClick={(e) => {
            if (onMapClick && e.latLng) {
              onMapClick({
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              });
            }
            setInfoWindowOpen(false);
          }}
          onZoomChanged={() => {
            if (mapRef.current) {
              onZoomChanged?.(mapRef.current.getZoom() || 12);
            }
          }}
          onBoundsChanged={() => {
            if (mapRef.current) {
              onBoundsChanged?.(mapRef.current.getBounds() || null);
            }
          }}
        >
          {/* Render polygons if provided */}
          {polygons.map((polygon, index) => (
            <Polygon
              key={index}
              paths={polygon.coordinates}
              options={{
                strokeColor: '#2962Ff',
                strokeWeight: 1,
                fillColor: '#2962Ff',
                fillOpacity: 0.2,
              }}
            />
          ))}

          {/* Info Window */}
          {selectedMarker && infoWindowOpen && (
            <InfoWindow
              position={
                selectedMarker.type === 'vehicle'
                  ? { lat: selectedMarker.location.lat, lng: selectedMarker.location.lng }
                  : { lat: selectedMarker.currentLocation.lat, lng: selectedMarker.currentLocation.lng }
              }
              onCloseClick={() => {
                setInfoWindowOpen(false);
                setSelectedMarker(null);
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: createInfoWindowContent(selectedMarker, selectedMarker.type),
                }}
              />
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default MapView;
