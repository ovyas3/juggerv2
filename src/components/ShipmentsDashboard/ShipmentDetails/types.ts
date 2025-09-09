import { ReactNode } from 'react';

export interface Location {
  _id: string;
  name: string;
  address: string;
  contact_person?: string;
  contact_number?: string;
  coordinates?: [number, number];
}

export interface Document {
  url: string;
  type: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface Invoice {
  _id: string;
  num: string;
  date: string;
  value: number;
  status: string;
  type: string;
  e_waybill_no?: string;
  e_waybill_expiry?: string;
  documents?: Document[];
  // Add other invoice properties as needed
}

export interface Pickup {
  _id: string;
  location: Location;
  scheduled_date: string;
  actual_date?: string;
  status: string;
  documents: Document[];
  comments: string;
  // Add other pickup properties
}

export interface Delivery {
  _id: string;
  location: Location;
  scheduled_date: string;
  actual_date?: string;
  status: string;
  invoices: Invoice[];
  documents: Document[];
  comments: string;
  // Add other delivery properties
}

export interface Driver {
  _id: string;
  name: string;
  contact_number: string;
  license_number?: string;
}

export interface Vehicle {
  _id: string;
  registration_number: string;
  vehicle_type?: string;
  capacity?: number;
}

export interface Trail {
  _id: string;
  user: string;
  user_type: string;
  comment: string;
  date: string;
  driver_location?: {
    coordinates: [number, number];
    address?: string;
  };
}

export interface Shipment {
  _id: string;
  unique_code: string;
  shipment_status: string;
  created_at: string;
  updated_at: string;
  pickups: Pickup[];
  deliveries: Delivery[];
  driver: Driver;
  vehicle: Vehicle;
  trails: Trail[];
  estimated_distance?: number;
  actual_distance?: number;
  estimated_duration?: number;
  actual_duration?: number;
  // Add other shipment properties
}

export interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

export interface ShipmentDetailsProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  loading?: boolean;
  // Feature flags
  isMYKL?: boolean;
  isTechnova?: boolean;
  isRSPL?: boolean;
  isBMWIL?: boolean;
  own_fleet?: boolean;
  showFreight?: boolean;
  type?: '4pl' | 'default';
  // User roles
  roles?: {
    owner: boolean;
    fleet: boolean;
    fleet_admin: boolean;
    unit_admin: boolean;
    shipment: boolean;
  };
  // Callbacks
  onRefresh?: () => void;
  onUpdateStatus?: (status: string) => void;
  onUploadDocument?: (file: File, type: string, referenceId: string) => void;
  onAddComment?: (comment: string, referenceId: string) => void;
}
