import React from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Chip, 
  IconButton, 
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Person as DriverIcon,
  Speed as SpeedIcon,
  LocalGasStation as FuelIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Event as EventIcon,
  Build as MaintenanceIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Directions as NavigateIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  AvTimer as OdometerIcon,
  CalendarToday as CalendarIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  Build
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Vehicle, VehicleStatus } from './types';
import styles from './VehicleDetails.module.css';

interface VehicleDetailsProps {
  vehicle: Vehicle;
  onClose: () => void;
  onEdit?: () => void;
  onRefresh?: () => void;
  showActions?: boolean;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({
  vehicle,
  onClose,
  onEdit,
  onRefresh,
  showActions = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const statusColors = {
    in_shipment: '#2196F3',
    available: '#4CAF50',
    maintenance: '#FF9800',
    offline: '#9E9E9E',
    inactive: '#F44336',
  };

  const getStatusIcon = (status: VehicleStatus) => {
    switch (status) {
      case 'in_shipment':
        return <ShippingIcon fontSize="small" />;
      case 'available':
        return <CheckCircleIcon fontSize="small" />;
      case 'maintenance':
        return <Build fontSize="small" />;
      case 'offline':
        return <WarningIcon fontSize="small" />;
      case 'inactive':
        return <WarningIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  return (
    <Paper className={styles.container} elevation={3}>
      {/* Header */}
      <Box className={styles.header}>
        <Box className={styles.headerContent}>
          <Box className={styles.vehicleHeader}>
            <CarIcon className={styles.vehicleIcon} />
            <Box>
              <Typography variant="h6" className={styles.vehicleNumber}>
                {vehicle.vehicleNumber}
              </Typography>
              <Chip
                label={vehicle.status.replace('_', ' ')}
                size="small"
                style={{
                  backgroundColor: statusColors[vehicle.status as keyof typeof statusColors] || '#666',
                  color: '#fff',
                  textTransform: 'capitalize',
                  fontWeight: 500,
                }}
                icon={getStatusIcon(vehicle.status as VehicleStatus)}
              />
            </Box>
          </Box>
          <Box className={styles.headerActions}>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={onRefresh}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={onEdit}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Close">
              <IconButton size="small" onClick={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="body2" color="textSecondary" className={styles.lastUpdated}>
          Last updated: {format(new Date(vehicle.lastUpdated), 'PPpp')}
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Vehicle Info */}
      <Box className={styles.section}>
        <Typography variant="subtitle2" className={styles.sectionTitle}>
          Vehicle Information
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon className={styles.listIcon}>
              <AssignmentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Registration Number" 
              secondary={vehicle.registrationNumber || 'N/A'} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon className={styles.listIcon}>
              <CarIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Type" 
              secondary={vehicle.type || 'N/A'} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon className={styles.listIcon}>
              <CarIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Model" 
              secondary={vehicle.model || 'N/A'} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon className={styles.listIcon}>
              <CalendarIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Year" 
              secondary={vehicle.year || 'N/A'} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon className={styles.listIcon}>
              <OdometerIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Odometer" 
              secondary={vehicle.odometerReading ? `${vehicle.odometerReading.toLocaleString()} km` : 'N/A'} 
            />
          </ListItem>
        </List>
      </Box>
      
      {/* Driver Info */}
      {vehicle.driver && (
        <>
          <Divider />
          <Box className={styles.section}>
            <Typography variant="subtitle2" className={styles.sectionTitle}>
              Driver Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon className={styles.listIcon}>
                  <DriverIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Name" 
                  secondary={vehicle.driver.name || 'N/A'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon className={styles.listIcon}>
                  <PhoneIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Contact" 
                  secondary={
                    <a href={`tel:${vehicle.driver.contactNumber}`} className={styles.link}>
                      {vehicle.driver.contactNumber || 'N/A'}
                    </a>
                  } 
                />
              </ListItem>
              {vehicle.driver.email && (
                <ListItem>
                  <ListItemIcon className={styles.listIcon}>
                    <EmailIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={
                      <a href={`mailto:${vehicle.driver.email}`} className={styles.link}>
                        {vehicle.driver.email}
                      </a>
                    } 
                  />
                </ListItem>
              )}
              {vehicle.driver.licenseNumber && (
                <ListItem>
                  <ListItemIcon className={styles.listIcon}>
                    <AssignmentIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="License" 
                    secondary={vehicle.driver.licenseNumber} 
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </>
      )}
      
      {/* Location & Status */}
      <Divider />
      <Box className={styles.section}>
        <Typography variant="subtitle2" className={styles.sectionTitle}>
          Current Status & Location
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon className={styles.listIcon}>
              <LocationIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Location" 
              secondary={
                vehicle.location?.address || 
                (vehicle.location ? 
                  `${vehicle.location.lat.toFixed(6)}, ${vehicle.location.lng.toFixed(6)}` : 
                  'Location not available'
                )
              } 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon className={styles.listIcon}>
              <SpeedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Speed" 
              secondary={vehicle.speed ? `${vehicle.speed} km/h` : 'N/A'} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon className={styles.listIcon}>
              <FuelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Fuel Level" 
              secondary={vehicle.fuelLevel !== undefined ? `${vehicle.fuelLevel}%` : 'N/A'} 
            />
          </ListItem>
        </List>
      </Box>
      
      {/* Maintenance Info */}
      {(vehicle.lastServiceDate || vehicle.nextServiceDue) && (
        <>
          <Divider />
          <Box className={styles.section}>
            <Typography variant="subtitle2" className={styles.sectionTitle}>
              Maintenance
            </Typography>
            <List dense>
              {vehicle.lastServiceDate && (
                <ListItem>
                  <ListItemIcon className={styles.listIcon}>
                    <EventIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Last Service" 
                    secondary={format(new Date(vehicle.lastServiceDate), 'PP')} 
                  />
                </ListItem>
              )}
              {vehicle.nextServiceDue && (
                <ListItem>
                  <ListItemIcon className={styles.listIcon}>
                    <EventIcon fontSize="small" color={new Date(vehicle.nextServiceDue) < new Date() ? 'error' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Next Service Due" 
                    secondary={
                      <span className={new Date(vehicle.nextServiceDue) < new Date() ? styles.overdue : ''}>
                        {format(new Date(vehicle.nextServiceDue), 'PP')}
                      </span>
                    } 
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </>
      )}
      
      {/* Actions */}
      {showActions && (
        <>
          <Divider />
          <Box className={styles.actions}>
            <Tooltip title="View History">
              <IconButton size="small" className={styles.actionButton}>
                <HistoryIcon fontSize="small" />
                <span className={styles.actionLabel}>History</span>
              </IconButton>
            </Tooltip>
            <Tooltip title="Navigate To">
              <IconButton size="small" className={styles.actionButton}>
                <NavigateIcon fontSize="small" />
                <span className={styles.actionLabel}>Navigate</span>
              </IconButton>
            </Tooltip>
            <Tooltip title="Service History">
              <IconButton size="small" className={styles.actionButton}>
                <MaintenanceIcon fontSize="small" />
                <span className={styles.actionLabel}>Service</span>
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default VehicleDetails;
