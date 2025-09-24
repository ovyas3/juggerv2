import React, { useEffect, useMemo } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { MapVehicle, MapShipment } from './mapViewTypes';

interface MapMarkersProps {
  map: google.maps.Map | null;
  vehicles: MapVehicle[];
  shipments: MapShipment[];
  onVehicleClick?: (vehicle: MapVehicle) => void;
  onShipmentClick?: (shipment: MapShipment) => void;
  showVehicles?: boolean;
  showShipments?: boolean;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  map,
  vehicles = [],
  shipments = [],
  onVehicleClick,
  onShipmentClick,
  showVehicles = true,
  showShipments = true,
}) => {
  // Default icons
  const defaultIcons = useMemo(() => ({
    vehicle: {
      url: '/assets/truck.svg',
      scaledSize: new google.maps.Size(30, 30),
      anchor: new google.maps.Point(15, 15)
    },
    shipment: {
      url: '/assets/package-icon.svg',
      scaledSize: new google.maps.Size(30, 30),
      anchor: new google.maps.Point(15, 15)
    }
  }), []);

  // Filter and prepare markers
  const vehicleMarkers = useMemo(() => {
    if (!showVehicles) return [];
    
    return vehicles
      .filter(vehicle => vehicle.location?.lat && vehicle.location?.lng)
      .map((vehicle, index) => ({
        id: `vehicle-${vehicle.vehicleNumber || index}`,
        position: {
          lat: vehicle.location!.lat,
          lng: vehicle.location!.lng
        },
        title: vehicle.vehicleNumber || 'Vehicle',
        icon: defaultIcons.vehicle,
        onClick: () => onVehicleClick?.(vehicle),
        data: vehicle
      }));
  }, [vehicles, showVehicles, defaultIcons.vehicle, onVehicleClick]);

  const shipmentMarkers = useMemo(() => {
    if (!showShipments) return [];
    
    return shipments
      .filter(shipment => shipment.currentLocation?.lat && shipment.currentLocation?.lng)
      .map((shipment, index) => ({
        id: `shipment-${shipment.shipmentNumber || index}`,
        position: {
          lat: shipment.currentLocation!.lat,
          lng: shipment.currentLocation!.lng
        },
        title: shipment.shipmentNumber || 'Shipment',
        icon: defaultIcons.shipment,
        onClick: () => onShipmentClick?.(shipment),
        data: shipment
      }));
  }, [shipments, showShipments, defaultIcons.shipment, onShipmentClick]);

  // Fit bounds to show all markers when map or markers change
  useEffect(() => {
    if (!map || (!vehicleMarkers.length && !shipmentMarkers.length)) return;

    const bounds = new google.maps.LatLngBounds();
    
    vehicleMarkers.forEach(marker => {
      bounds.extend(marker.position);
    });
    
    shipmentMarkers.forEach(marker => {
      bounds.extend(marker.position);
    });
    
    // Only fit bounds if we have valid bounds
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  }, [map, vehicleMarkers, shipmentMarkers]);

  // Render all markers
  const allMarkers = [...vehicleMarkers, ...shipmentMarkers];

  return (
    <>
      {allMarkers.map(marker => (
        <Marker
          key={marker.id}
          position={marker.position}
          title={marker.title}
          icon={marker.icon}
          onClick={marker.onClick}
        />
      ))}
    </>
  );
};

export default MapMarkers;
