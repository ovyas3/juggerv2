'use client';

import type React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import * as L from "leaflet";
import { MapPin, Truck, Settings, Layers, ZoomIn, ZoomOut, Maximize, Palette } from "lucide-react";
import styles from "./KeplerMapView.module.css";
import type { Icon as LeafletIcon, DivIcon as LeafletDivIcon, Map as LeafletMap } from "leaflet";
import type { LatLngExpression } from "leaflet";
import { Vehicle, StageInfo } from '../../InPlantDashboard';

// Dynamically import Leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

interface KeplerMapViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onVehicleSelect: (vehicle: Vehicle) => void;
  stages: StageInfo[];
}

interface PlantLocation {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
  stageId?: string;
  type: 'stage' | 'building' | 'parking';
}

const KeplerMapView: React.FC<KeplerMapViewProps> = ({
  vehicles,
  selectedVehicle,
  onVehicleSelect,
  stages
}) => {
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapZoom, setMapZoom] = useState(16);
  const [showStageLabels, setShowStageLabels] = useState(true);
  const [showVehiclePaths, setShowVehiclePaths] = useState(true);
  const [selectedMapStyle, setSelectedMapStyle] = useState("light");
  const [showMapStyleSelector, setShowMapStyleSelector] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);

  // Plant center coordinates (example: Mumbai location)
  const plantCenter: [number, number] = [19.0760, 72.8777];

  // Map styles configuration similar to triptracker
  const mapStyles = [
    { id: "none", name: "No Basemap", url: "", color: "#000000" },
    { id: "dark", name: "DarkMatter", url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", color: "#2c3e50" },
    { id: "light", name: "Positron", url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", color: "#f8f9fa" },
    { id: "voyager", name: "Voyager", url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png", color: "#e8f4f8" },
    { id: "satellite", name: "Satellite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", color: "#4a5568" },
    { id: "osm-light", name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", color: "#ffffff" }
  ];

  const getCurrentMapUrl = () => {
    if (selectedMapStyle === "none") return "";
    if (isSatelliteView) return mapStyles.find((s) => s.id === "satellite")?.url || "";
    return mapStyles.find((s) => s.id === selectedMapStyle)?.url || mapStyles.find((s) => s.id === "light")?.url || "";
  };

  // Mock plant locations relative to center
  const plantLocations: PlantLocation[] = [
    {
      id: 'ext-parking',
      name: 'External Parking',
      coordinates: [plantCenter[0] - 0.002, plantCenter[1] - 0.003],
      stageId: 'EXT_PARKING',
      type: 'parking'
    },
    {
      id: 'entry-gate',
      name: 'Entry Gate',
      coordinates: [plantCenter[0] - 0.001, plantCenter[1] - 0.001],
      stageId: 'ENTRY_GATE',
      type: 'stage'
    },
    {
      id: 'weighbridge',
      name: 'Weighbridge',
      coordinates: [plantCenter[0], plantCenter[1]],
      stageId: 'WEIGHING',
      type: 'stage'
    },
    {
      id: 'loading-bay-1',
      name: 'Loading Bay 1',
      coordinates: [plantCenter[0] + 0.001, plantCenter[1] + 0.001],
      stageId: 'LOADING',
      type: 'stage'
    },
    {
      id: 'loading-bay-2',
      name: 'Loading Bay 2',
      coordinates: [plantCenter[0] + 0.001, plantCenter[1] + 0.0015],
      stageId: 'LOADING',
      type: 'stage'
    },
    {
      id: 'loading-bay-3',
      name: 'Loading Bay 3',
      coordinates: [plantCenter[0] + 0.001, plantCenter[1] + 0.002],
      stageId: 'LOADING',
      type: 'stage'
    },
    {
      id: 'weight-out',
      name: 'Weight Out',
      coordinates: [plantCenter[0] + 0.002, plantCenter[1] + 0.001],
      stageId: 'WEIGHT_OUT',
      type: 'stage'
    },
    {
      id: 'gate-out',
      name: 'Gate Out',
      coordinates: [plantCenter[0] + 0.003, plantCenter[1] + 0.002],
      stageId: 'GATE_OUT',
      type: 'stage'
    },
    {
      id: 'warehouse',
      name: 'Warehouse',
      coordinates: [plantCenter[0] + 0.001, plantCenter[1] - 0.002],
      type: 'building'
    },
    {
      id: 'office',
      name: 'Office Building',
      coordinates: [plantCenter[0] - 0.001, plantCenter[1] + 0.003],
      type: 'building'
    }
  ];

  // Get vehicle position based on current stage
  const getVehiclePosition = useCallback((vehicle: Vehicle): [number, number] => {
    const location = plantLocations.find(loc => loc.stageId === vehicle.currentStage.stageId);
    if (location) {
      // Add small random offset for vehicles at same stage
      const offset = parseInt(vehicle.id.slice(-1)) * 0.0001;
      return [
        location.coordinates[0] + (offset % 3) * 0.0001,
        location.coordinates[1] + (offset % 2) * 0.0001
      ];
    }
    return plantCenter;
  }, [plantLocations]);

  // Create custom icons
  const createVehicleIcon = useCallback((vehicle: Vehicle, isSelected: boolean) => {
    const color = getVehicleStatusColor(vehicle.overallStatus);
    const size = isSelected ? 40 : 32;

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ${isSelected ? 'box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3);' : ''}
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10V6c0-2-2-4-4-4H4c-2 0-4 2-4 4v10c0 1.1.9 2 2 2h2c0 1.7 1.3 3 3 3s3-1.3 3-3h6c0 1.7 1.3 3 3 3s3-1.3 3-3zM7 19c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm0-3c-1.1 0-2-.9-2-2H3V6c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v8h-2c0 1.1-.9 2-2 2H7zm10 3c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
          </svg>
        </div>
      `,
      className: 'vehicle-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  }, []);

  const createStageIcon = useCallback((stage: PlantLocation, vehicleCount: number) => {
    const stageInfo = stages.find(s => s.stageId === stage.stageId);
    const healthColor = stageInfo?.healthStatus === 'critical' ? '#DC2626' :
                       stageInfo?.healthStatus === 'warning' ? '#F59E0B' : '#10B981';

    return L.divIcon({
      html: `
        <div style="
          background: white;
          border: 3px solid ${healthColor};
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          text-align: center;
          min-width: 80px;
        ">
          <div style="font-size: 12px; font-weight: bold; color: #374151; margin-bottom: 4px;">
            ${stage.name}
          </div>
          <div style="
            background: ${healthColor};
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            margin: 0 auto;
          ">
            ${vehicleCount}
          </div>
        </div>
      `,
      className: 'stage-marker',
      iconSize: [80, 50],
      iconAnchor: [40, 25]
    });
  }, [stages]);

  const getVehicleStatusColor = (status: Vehicle['overallStatus']): string => {
    switch (status) {
      case 'on_track': return '#10B981';
      case 'at_risk': return '#F59E0B';
      case 'delayed': return '#DC2626';
      case 'completed': return '#6B7280';
      case 'on_hold': return '#111827';
      default: return '#3B82F6';
    }
  };

  const handleMapZoom = useCallback((zoomIn: boolean) => {
    if (mapRef.current) {
      const newZoom = zoomIn ? mapZoom + 1 : mapZoom - 1;
      mapRef.current.setZoom(newZoom);
      setMapZoom(newZoom);
    }
  }, [mapZoom]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  return (
    <div className={`${styles.mapContainer} ${isFullscreen ? styles.fullscreen : ''}`}>
      {/* Map Controls */}
      <div className={styles.mapControls}>
        <div className={styles.controlGroup}>
          <button
            className={styles.controlBtn}
            onClick={() => setShowMapStyleSelector(!showMapStyleSelector)}
            title="Map Styles"
          >
            <Palette size={16} />
          </button>
          <button
            className={styles.controlBtn}
            onClick={() => setIsSatelliteView(!isSatelliteView)}
            title="Toggle Satellite View"
          >
            <Layers size={16} />
          </button>
          <button
            className={styles.controlBtn}
            onClick={() => setShowStageLabels(!showStageLabels)}
            title="Toggle Stage Labels"
          >
            <MapPin size={16} />
          </button>
          <button
            className={styles.controlBtn}
            onClick={() => setShowVehiclePaths(!showVehiclePaths)}
            title="Toggle Vehicle Paths"
          >
            <Truck size={16} />
          </button>
        </div>

        <div className={styles.controlGroup}>
          <button
            className={styles.controlBtn}
            onClick={() => handleMapZoom(true)}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            className={styles.controlBtn}
            onClick={() => handleMapZoom(false)}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            className={styles.controlBtn}
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
          >
            <Maximize size={16} />
          </button>
        </div>
      </div>

      {/* Map Style Selector */}
      {showMapStyleSelector && (
        <div className={styles.styleSelector}>
          <div className={styles.styleSelectorHeader}>
            <span>Map Styles</span>
            <button
              className={styles.closeBtn}
              onClick={() => setShowMapStyleSelector(false)}
            >
              ×
            </button>
          </div>
          <div className={styles.styleList}>
            {mapStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedMapStyle(style.id)}
                className={`${styles.styleItem} ${selectedMapStyle === style.id ? styles.styleItemActive : ""}`}
              >
                <div className={styles.styleSwatch} style={{ backgroundColor: style.color }} />
                <span className={styles.styleName}>{style.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={plantCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className={styles.leafletMap}
        zoomControl={false}
        attributionControl={false}
        key={isFullscreen ? "fullscreen" : "normal"}
      >
        {selectedMapStyle !== "none" && (
          <TileLayer
            url={getCurrentMapUrl()}
            attribution={
              selectedMapStyle === "satellite" || isSatelliteView
                ? '© Esri'
                : '© OpenStreetMap contributors'
            }
          />
        )}

        {/* Stage Locations */}
        {showStageLabels && plantLocations
          .filter(location => location.stageId)
          .map(location => {
            const vehicleCount = vehicles.filter(v => v.currentStage.stageId === location.stageId).length;
            return (
              <Marker
                key={location.id}
                position={location.coordinates}
                icon={createStageIcon(location, vehicleCount)}
              >
                <Popup>
                  <div className={styles.stagePopup}>
                    <h4>{location.name}</h4>
                    <p>Vehicles: {vehicleCount}</p>
                    {location.stageId && (
                      <p>Status: {stages.find(s => s.stageId === location.stageId)?.healthStatus || 'normal'}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })
        }

        {/* Vehicles */}
        {vehicles.map(vehicle => {
          const position = getVehiclePosition(vehicle);
          const isSelected = selectedVehicle?.id === vehicle.id;

          return (
            <Marker
              key={vehicle.id}
              position={position}
              icon={createVehicleIcon(vehicle, isSelected)}
              eventHandlers={{
                click: () => onVehicleSelect(vehicle)
              }}
            >
              <Popup>
                <div className={styles.vehiclePopup}>
                  <h4>{vehicle.vehicleNumber}</h4>
                  <p><strong>Status:</strong> {vehicle.overallStatus.replace('_', ' ')}</p>
                  <p><strong>Location:</strong> {vehicle.currentStage.stageName}</p>
                  <p><strong>Duration:</strong> {Math.floor(vehicle.currentStage.duration / 60)}h {vehicle.currentStage.duration % 60}m</p>
                  <p><strong>Driver:</strong> {vehicle.driver.name}</p>
                  <p><strong>Carrier:</strong> {vehicle.carrier.name}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Vehicle Paths */}
        {showVehiclePaths && vehicles.map(vehicle => {
          const currentPos = getVehiclePosition(vehicle);
          const currentStageIndex = stages.findIndex(s => s.stageId === vehicle.currentStage.stageId);

          if (currentStageIndex < stages.length - 1) {
            const nextStage = stages[currentStageIndex + 1];
            const nextLocation = plantLocations.find(loc => loc.stageId === nextStage.stageId);

            if (nextLocation) {
              return (
                <Polyline
                  key={`path-${vehicle.id}`}
                  positions={[currentPos, nextLocation.coordinates]}
                  pathOptions={{
                    color: getVehicleStatusColor(vehicle.overallStatus),
                    weight: 3,
                    opacity: 0.6,
                    dashArray: "10,10"
                  }}
                />
              );
            }
          }
          return null;
        })}
      </MapContainer>

      {/* Map Stats */}
      <div className={styles.mapStats}>
        <div className={styles.statItem}>
          <span>Total Vehicles: {vehicles.length}</span>
        </div>
        <div className={styles.statItem}>
          <span>Delayed: {vehicles.filter(v => v.overallStatus === 'delayed').length}</span>
        </div>
        <div className={styles.statItem}>
          <span>On Track: {vehicles.filter(v => v.overallStatus === 'on_track').length}</span>
        </div>
      </div>
    </div>
  );
};

export default KeplerMapView;