// These types are available globally when using @react-google-maps/api
type LatLngBounds = google.maps.LatLngBounds;
type LatLngLiteral = google.maps.LatLngLiteral;
type LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral;
type MapTypeId = google.maps.MapTypeId;

export enum VehicleStatus {
  IDLE = 'idle',
  IN_TRANSIT = 'in_transit',
  LOADING = 'loading',
  UNLOADING = 'unloading',
  MAINTENANCE = 'maintenance',
  OFF_DUTY = 'off_duty',
  DELAYED = 'delayed',
  MOVING = 'moving',
  STOPPED = 'stopped',
  OFFLINE = 'offline',
  AVAILABLE = 'available',
  AT_PICKUP = 'at_pickup',
  AT_DELIVERY = 'at_delivery',
}

export enum ShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
  ASSIGNED = 'assigned',
  AT_PICKUP = 'at_pickup',
  AT_DELIVERY = 'at_delivery',
  PARTIALLY_DELIVERED = 'partially_delivered',
  DELIVERY_ATTEMPTED = 'delivery_attempted',
  RETURNED = 'returned',
  COMPLETED = 'completed',
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  timestamp?: Date;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface MapVehicle {
  driverMobile: any;
  id: string;
  vehicleNumber: string;
  location?: Location;
  status: VehicleStatus;
  speed?: number;
  heading?: number;
  lastUpdated?: Date;
  driverName?: string;
  capacity?: number;
  currentLoad?: number;
  fuelLevel?: number;
  nextMaintenance?: Date;
  driver?: {
    id: string;
    name: string;
    phone?: string;
    licenseNumber?: string;
  };
  currentShipmentId?: string;
  nextStop?: Location & { name?: string; eta?: Date };
  odometer?: number;
  engineHours?: number;
  alerts?: {
    id: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    acknowledged: boolean;
    vehicleId?: string;
    shipmentId?: string;
    location?: Location;
  }[];
  iconUrl?: string;
  color?: string;
  label?: string;
  metadata?: Record<string, any>;
}

export interface MapShipment {
  id: string;
  shipmentNumber: string;
  status: ShipmentStatus;
  currentLocation?: Location;
  source: {
    location: Location;
    name: string;
    address: string;
  };
  destination: {
    location: Location;
    name: string;
    address: string;
  };
  estimatedArrival?: Date;
  actualArrival?: Date;
  estimatedDeparture?: Date;
  actualDeparture?: Date;
  vehicleId?: string;
  vehicleNumber?: string;
  driver?: {
    id: string;
    name: string;
    phone?: string;
  };
  waypoints?: Array<Location & { name?: string; completed?: boolean }>;
  distance?: number; // in kilometers
  alerts?: {
    id: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    acknowledged: boolean;
    vehicleId?: string;
    shipmentId?: string;
    location?: Location;
  }[];
  progress?: number; // 0-100
  stops?: Array<{
    location: Location;
    name: string;
    type: 'pickup' | 'delivery' | 'stop';
    sequence: number;
    completed: boolean;
    arrivalTime?: Date;
    departureTime?: Date;
    plannedArrival?: Date;
    plannedDeparture?: Date;
  }>;
  metadata?: Record<string, any>;
}

export interface MapViewOptions {
  center: LatLngLiteral;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  mapTypeId?: any;
  styles?: google.maps.MapTypeStyle[];
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
  gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
  restriction?: {
    latLngBounds: LatLngBounds | LatLngBoundsLiteral;
    strictBounds?: boolean;
  };
  fitToMarkers?: boolean;
  padding?: number | google.maps.Padding;
  showVehicles?: boolean;
  showShipments?: boolean;
  showRoutes?: boolean;
  showWaypoints?: boolean;
  showGeofences?: boolean;
  showTraffic?: boolean;
  showTransit?: boolean;
  showLabels?: boolean;
  showAlerts?: boolean;
  clusterMarkers?: boolean;
  clusterOptions?: {
    gridSize?: number;
    maxZoom?: number;
    imagePath?: string;
    imageExtension?: string;
    imageSizes?: number[];
    calculator?: (markers: any[], numStyles: number) => any;
    averageCenter?: boolean;
    minimumClusterSize?: number;
  };
}

export interface MapFilterOptions {
  searchQuery: string;
  vehicleTypes: string[];
  statuses: Array<VehicleStatus | ShipmentStatus | string>;
  showOnlyWithAlerts: boolean;
  showOnlyDelayed: boolean;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  customFilters?: Record<string, any>;
  showVehicles: boolean;
  showShipments: boolean;
  vehicleStatuses?: VehicleStatus[];
  shipmentStatuses?: ShipmentStatus[];
}

export const DEFAULT_VIEW_OPTIONS: MapViewOptions = {
  center: { lat: 20.5937, lng: 78.9629 }, // Center of India
  zoom: 5,
  minZoom: 3,
  maxZoom: 18,
  mapTypeId: 'ROADMAP',
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  gestureHandling: 'auto',
  fitToMarkers: true,
  showVehicles: true,
  showShipments: true,
  showRoutes: true,
  showWaypoints: true,
  showGeofences: true,
  showTraffic: false,
  showTransit: false,
  showLabels: true,
  showAlerts: true,
  clusterMarkers: true,
  clusterOptions: {
    gridSize: 60,
    maxZoom: 15,
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
    imageExtension: 'png',
    imageSizes: [53, 56, 66, 78, 90],
    averageCenter: true,
    minimumClusterSize: 2,
  },
};

export const DEFAULT_FILTER_OPTIONS: MapFilterOptions = {
  searchQuery: '',
  vehicleTypes: [],
  statuses: [],
  showOnlyWithAlerts: false,
  showOnlyDelayed: false,
  dateRange: {
    start: null,
    end: null,
  },
  customFilters: {},
  showVehicles: true,
  showShipments: true,
  vehicleStatuses: [],
  shipmentStatuses: [],
};

// Utility types for marker rendering
export interface MapMarker<T = any> {
  id: string;
  position: LatLngLiteral;
  title?: string;
  icon?: string | google.maps.Icon | google.maps.Symbol;
  label?: string | google.maps.MarkerLabel;
  onClick?: () => void;
  data?: T;
}

export interface MapPolyline {
  path: LatLngLiteral[] | LatLngLiteral[][];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  geodesic?: boolean;
  clickable?: boolean;
  zIndex?: number;
  onClick?: (e: google.maps.MapMouseEvent) => void;
}

export interface MapPolygon {
  paths: LatLngLiteral[] | LatLngLiteral[][] | LatLngLiteral[][][];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
  clickable?: boolean;
  zIndex?: number;
  onClick?: (e: google.maps.MapMouseEvent) => void;
}

export interface MapCircle {
  center: LatLngLiteral;
  radius: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
  clickable?: boolean;
  zIndex?: number;
  onClick?: (e: google.maps.MapMouseEvent) => void;
}
