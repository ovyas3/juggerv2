// Common types for location data
export interface Location {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    lastUpdated?: string;
    formattedAddress?: string;
  }
  
  // Driver information
  export interface Driver {
    id: string;
    name: string;
    contactNumber: string;
    licenseNumber?: string;
    email?: string;
    status?: 'active' | 'inactive' | 'on_leave';
  }
  
  // Vehicle status types
  export type VehicleStatus = 
    | 'in_shipment' 
    | 'available' 
    | 'maintenance' 
    | 'offline' 
    | 'inactive' 
    | string;
  
  // Vehicle information
  export interface Vehicle {
    id: string;
    vehicleNumber: string;
    type: string;
    model?: string;
    year?: number;
    capacity?: number;
    status: VehicleStatus;
    lastUpdated: string;
    odometerReading?: number;
    fuelLevel?: number;
    speed?: number;
    heading?: number;
    driver?: Driver;
    location?: Location;
    currentTripId?: string;
    manufacturer?: string;
    registrationNumber?: string;
    insuranceExpiry?: string;
    lastServiceDate?: string;
    nextServiceDue?: string;
    averageFuelConsumption?: number;
    maxSpeed?: number;
    currentLocation?: {
      coordinates: {
        lat: number;
        lng: number;
      };
      timestamp: string;
      speed?: number;
      heading?: number;
    };
  }
  
  // Shipment status types
  export type ShipmentStatus = 
    | 'pending' 
    | 'in_transit' 
    | 'delivered' 
    | 'cancelled' 
    | 'on_hold' 
    | 'in_progress' 
    | 'completed' 
    | string;
  
  // Shipment type
  export type ShipmentType = 
    | 'ftl' 
    | 'ltl' 
    | 'express' 
    | 'hazardous' 
    | 'perishable' 
    | 'fragile' 
    | string;
  
  // Material information
  export interface Material {
    id: string;
    name: string;
    code?: string;
    description?: string;
    weight?: number;
    volume?: number;
    quantity: number;
    unit?: string;
    isHazardous?: boolean;
    requiresSpecialHandling?: boolean;
    temperatureRange?: {
      min: number;
      max: number;
      unit?: 'C' | 'F';
    };
  }
  
  // Document information
  export interface Document {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
    size?: number;
    mimeType?: string;
    isVerified?: boolean;
  }
  
  // Shipment information
  export interface Shipment {
    id: string;
    shipmentNumber: string;
    referenceNumber?: string;
    status: ShipmentStatus;
    type: ShipmentType;
    origin: Location;
    destination: Location;
    currentLocation?: Location;
    distance?: number; // in kilometers
    estimatedDuration?: number; // in minutes
    actualDuration?: number; // in minutes
    startDate?: string;
    endDate?: string;
    estimatedDeliveryDate?: string;
    actualDeliveryDate?: string;
    vehicleId?: string;
    driverId?: string;
    materials: Material[];
    documents: Document[];
    specialInstructions?: string;
    createdAt: string;
    updatedAt: string;
    totalWeight?: number;
    totalVolume?: number;
    customerName?: string;
    customerReference?: string;
    value?: number;
    currency?: string;
    priority?: 'low' | 'medium' | 'high';
    temperatureControl?: {
      required: boolean;
      minTemp?: number;
      maxTemp?: number;
      unit?: 'C' | 'F';
    };
    events?: ShipmentEvent[];
    trackingHistory?: TrackingPoint[];
    assignedVehicle?: Vehicle;
    assignedDriver?: Driver;
    isTrackable?: boolean;
    lastTrackedAt?: string;
    nextCheckpoint?: string;
    delayReason?: string;
    delayMinutes?: number;
    isDelayed?: boolean;
    signatureRequired?: boolean;
    signatureUrl?: string;
    proofOfDelivery?: {
      receivedBy: string;
      receivedAt: string;
      notes?: string;
      images?: string[];
    };
    rating?: number;
    feedback?: string;
    isReturn?: boolean;
    originalShipmentId?: string;
    returnReason?: string;
    isHazardous?: boolean;
    requiresSpecialHandling?: boolean;
    isFragile?: boolean;
    isPerishable?: boolean;
    isOversized?: boolean;
    isOverweight?: boolean;
    customsInfo?: {
      required: boolean;
      customsValue?: number;
      currency?: string;
      hsCode?: string;
      description?: string;
      originCountry?: string;
      destinationCountry?: string;
      documents?: Document[];
    };
    billingInfo?: {
      invoiceNumber?: string;
      poNumber?: string;
      paymentStatus?: 'pending' | 'partial' | 'paid' | 'overdue';
      paymentTerms?: string;
      paymentDueDate?: string;
      totalAmount?: number;
      currency?: string;
      taxAmount?: number;
      discountAmount?: number;
      shippingCost?: number;
      otherCharges?: number;
      notes?: string;
    };
    tags?: string[];
    metadata?: Record<string, any>;
  }
  
  // Shipment event types
  export type ShipmentEventType = 
    | 'created' 
    | 'dispatched' 
    | 'in_transit' 
    | 'delayed' 
    | 'out_for_delivery' 
    | 'delivered' 
    | 'exception' 
    | 'cancelled' 
    | 'on_hold' 
    | 'damaged' 
    | 'returned' 
    | 'customs_hold' 
    | 'weather_delay' 
    | 'vehicle_breakdown' 
    | 'traffic_delay' 
    | 'documentation_issue' 
    | string;
  
  // Shipment event
  export interface ShipmentEvent {
    id: string;
    type: ShipmentEventType;
    timestamp: string;
    location?: Location;
    description: string;
    userId?: string;
    userName?: string;
    metadata?: Record<string, any>;
    isMilestone?: boolean;
    isException?: boolean;
    isCustomerNotified?: boolean;
    notes?: string;
    images?: string[];
    documents?: Document[];
    estimatedTimeToNextEvent?: number; // in minutes
    actualTimeToNextEvent?: number; // in minutes
    delayReason?: string;
    delayMinutes?: number;
    vehicleId?: string;
    driverId?: string;
    temperature?: number;
    humidity?: number;
    shockDetected?: boolean;
    lightExposure?: boolean;
    tiltDetected?: boolean;
    pressure?: number;
    batteryLevel?: number;
    signalStrength?: number;
    gpsAccuracy?: number;
    isManualEntry?: boolean;
    verifiedBy?: string;
    verificationTimestamp?: string;
    verificationNotes?: string;
    relatedEvents?: string[];
    customFields?: Record<string, any>;
  }
  
  // Tracking point
  export interface TrackingPoint {
    timestamp: string;
    location: Location;
    status: ShipmentStatus;
    eventType?: ShipmentEventType;
    eventId?: string;
    speed?: number;
    heading?: number;
    odometerReading?: number;
    fuelLevel?: number;
    temperature?: number;
    batteryLevel?: number;
    accuracy?: number;
    isMoving?: boolean;
    activityType?: string;
    activityConfidence?: number;
    metadata?: Record<string, any>;
  }
  
  // Filter options for shipments
  export interface ShipmentFilters {
    status?: string[];
    type?: string[];
    origin?: string[];
    destination?: string[];
    vehicleId?: string[];
    driverId?: string[];
    customerId?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    searchQuery?: string;
    isTrackable?: boolean;
    isDelayed?: boolean;
    priority?: string[];
    materialType?: string[];
    requiresSpecialHandling?: boolean;
    isHazardous?: boolean;
    isFragile?: boolean;
    isPerishable?: boolean;
    isOversized?: boolean;
    isOverweight?: boolean;
    temperatureControlled?: boolean;
    customFields?: Record<string, any>;
  }
  
  // Map view options
  export interface MapViewOptions {
    showVehicles: boolean;
    showShipments: boolean;
    showRoutes: boolean;
    showTraffic: boolean;
    showSatellite: boolean;
    showLabels: boolean;
    showHeatmap: boolean;
    showGrid: boolean;
    showMarkers: boolean;
    showInfoWindows: boolean;
    showClusters: boolean;
    showGeofences: boolean;
    showWaypoints: boolean;
    showStops: boolean;
    showHazards: boolean;
    showWeather: boolean;
    showTrafficIncidents: boolean;
    showPOIs: boolean;
    showLandmarks: boolean;
    showTolls: boolean;
    showRestAreas: boolean;
    showFuelStations: boolean;
    showParking: boolean;
    showWeighStations: boolean;
    showBorderCrossings: boolean;
    showCustomLayers: boolean;
    show3DBuildings: boolean;
    showTerrain: boolean;
    showTransit: boolean;
    showBicycle: boolean;
    showPedestrian: boolean;
    showIndoor: boolean;
    showOutdoor: boolean;
    showIndoorLevelPicker: boolean;
    showBuildingNames: boolean;
    showPointOfInterest: boolean;
    showTransitStations: boolean;
    showTransitLines: boolean;
    showTransitStops: boolean;
    showTransitRoutes: boolean;
    showTransitSchedules: boolean;
    showTransitAlerts: boolean;
    showTransitIncidents: boolean;
    showTransitServiceAlerts: boolean;
    showTransitTripUpdates: boolean;
    showTransitVehiclePositions: boolean;
    showTransitShapes: boolean;
    showTransitAgencies: boolean;
    showTransitRoutesForAgency: boolean;
    showTransitStopsForRoute: boolean;
    showTransitTripsForRoute: boolean;
    showTransitStopTimesForTrip: boolean;
    showTransitShapesForTrip: boolean;
    showTransitVehiclesForTrip: boolean;
    showTransitAlertsForAgency: boolean;
    showTransitAlertsForRoute: boolean;
    showTransitAlertsForStop: boolean;
    showTransitAlertsForTrip: boolean;
    showTransitAlertsForRouteType: boolean;
    showTransitAlertsForAgencyAndRoute: boolean;
    showTransitAlertsForAgencyAndStop: boolean;
    showTransitAlertsForAgencyAndTrip: boolean;
    showTransitAlertsForAgencyAndRouteType: boolean;
    showTransitAlertsForRouteAndStop: boolean;
    showTransitAlertsForRouteAndTrip: boolean;
    showTransitAlertsForRouteAndRouteType: boolean;
    showTransitAlertsForStopAndTrip: boolean;
    showTransitAlertsForStopAndRouteType: boolean;
    showTransitAlertsForTripAndRouteType: boolean;
    showTransitAlertsForAgencyAndRouteAndStop: boolean;
    showTransitAlertsForAgencyAndRouteAndTrip: boolean;
    showTransitAlertsForAgencyAndRouteAndRouteType: boolean;
    showTransitAlertsForAgencyAndStopAndTrip: boolean;
    showTransitAlertsForAgencyAndStopAndRouteType: boolean;
    showTransitAlertsForAgencyAndTripAndRouteType: boolean;
    showTransitAlertsForRouteAndStopAndTrip: boolean;
    showTransitAlertsForRouteAndStopAndRouteType: boolean;
    showTransitAlertsForRouteAndTripAndRouteType: boolean;
    showTransitAlertsForStopAndTripAndRouteType: boolean;
    showTransitAlertsForAgencyAndRouteAndStopAndTrip: boolean;
    showTransitAlertsForAgencyAndRouteAndStopAndRouteType: boolean;
    showTransitAlertsForAgencyAndRouteAndTripAndRouteType: boolean;
    showTransitAlertsForAgencyAndStopAndTripAndRouteType: boolean;
    showTransitAlertsForRouteAndStopAndTripAndRouteType: boolean;
    showTransitAlertsForAgencyAndRouteAndStopAndTripAndRouteType: boolean;
  }
  