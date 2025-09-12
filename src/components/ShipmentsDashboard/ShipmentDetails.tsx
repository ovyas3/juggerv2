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
  useMediaQuery,
  Button,
  LinearProgress
} from '@mui/material';
import {
  LocalShipping as ShipmentIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Directions as NavigateIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  LocalAtm as PaymentIcon,
  Receipt as DocumentIcon,
  Warning as WarningIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocalMall as PackageIcon,
  Scale as WeightIcon,
  Straighten as DimensionsIcon,
  LocalOffer as TypeIcon
} from '@mui/icons-material';
import { format, parseISO, isAfter, differenceInHours } from 'date-fns';
import { Shipment, ShipmentStatus, ShipmentEvent, Material } from './types';
import styles from './ShipmentDetails.module.css';

interface ShipmentDetailsProps {
  shipment: Shipment;
  onClose: () => void;
  onEdit?: () => void;
  onRefresh?: () => void;
  showActions?: boolean;
}

const ShipmentDetails: React.FC<ShipmentDetailsProps> = ({
  shipment,
  onClose,
  onEdit,
  onRefresh,
  showActions = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const statusColors = {
    pending: '#FFC107',
    in_transit: '#2196F3',
    delivered: '#4CAF50',
    cancelled: '#F44336',
    on_hold: '#FF9800',
    in_progress: '#3F51B5',
    completed: '#4CAF50',
  };

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon fontSize="small" />;
      case 'in_transit':
        return <ShipmentIcon fontSize="small" />;
      case 'cancelled':
        return <WarningIcon fontSize="small" />;
      case 'on_hold':
        return <WarningIcon fontSize="small" />;
      case 'in_progress':
        return <InfoIcon fontSize="small" />;
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const isDelayed = shipment.estimatedDeliveryDate && 
    isAfter(new Date(), parseISO(shipment.estimatedDeliveryDate));

  const getProgressValue = () => {
    if (!shipment.startDate || !shipment.estimatedDeliveryDate) return 0;
    
    const start = new Date(shipment.startDate).getTime();
    const end = new Date(shipment.estimatedDeliveryDate).getTime();
    const now = new Date().getTime();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    return ((now - start) / (end - start)) * 100;
  };

  const renderMaterialItem = (material: Material, index: number) => (
    <div key={index} className={styles.materialItem}>
      <div className={styles.materialName}>{material.name}</div>
      <div className={styles.materialDetails}>
        {material.quantity && (
          <span className={styles.materialDetail}>
            Qty: {material.quantity} {material.unit || 'units'}
          </span>
        )}
        {material.weight && (
          <span className={styles.materialDetail}>
            Weight: {material.weight} kg
          </span>
        )}
        {material.volume && (
          <span className={styles.materialDetail}>
            Volume: {material.volume} m³
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Paper className={styles.container} elevation={3}>
      {/* Header */}
      <Box className={styles.header}>
        <Box className={styles.headerContent}>
          <Box className={styles.shipmentHeader}>
            <ShipmentIcon className={styles.shipmentIcon} />
            <Box>
              <Typography variant="h6" className={styles.shipmentNumber}>
                {shipment.shipmentNumber}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <Chip
                  label={shipment.status.replace('_', ' ')}
                  size="small"
                  style={{
                    backgroundColor: statusColors[shipment.status as keyof typeof statusColors] || '#666',
                    color: '#fff',
                    textTransform: 'capitalize',
                    fontWeight: 500,
                  }}
                  icon={getStatusIcon(shipment.status as ShipmentStatus)}
                />
                {isDelayed && (
                  <Chip
                    label="Delayed"
                    size="small"
                    color="error"
                    variant="outlined"
                    icon={<WarningIcon fontSize="small" />}
                  />
                )}
                {shipment.priority === 'high' && (
                  <Chip
                    label="High Priority"
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>
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
        
        {shipment.estimatedDeliveryDate && (
          <Box className={styles.deliveryInfo}>
            <Typography variant="body2" color="textSecondary">
              {isDelayed ? 'Delayed' : 'Estimated'} Delivery: 
              <span className={isDelayed ? styles.delayedText : ''}>
                {format(parseISO(shipment.estimatedDeliveryDate), 'PPpp')}
              </span>
              {isDelayed && shipment.delayReason && (
                <span className={styles.delayReason}>({shipment.delayReason})</span>
              )}
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Progress Bar */}
      <Box className={styles.progressContainer}>
        <LinearProgress 
          variant="determinate" 
          value={getProgressValue()} 
          className={styles.progressBar}
        />
        <Box className={styles.progressLabels}>
          <Typography variant="caption">
            {shipment.startDate ? format(parseISO(shipment.startDate), 'MMM d') : '--'}
          </Typography>
          <Typography variant="caption">
            {shipment.estimatedDeliveryDate ? format(parseISO(shipment.estimatedDeliveryDate), 'MMM d') : '--'}
          </Typography>
        </Box>
      </Box>
      
      {/* Route Information */}
      <Box className={styles.section}>
        <List dense>
          <ListItem>
            <ListItemIcon className={styles.listIcon}>
              <LocationIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Origin"
              secondary={shipment.origin.address || 'N/A'} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon className={styles.listIcon}>
              <LocationIcon color="secondary" />
            </ListItemIcon>
            <ListItemText 
              primary="Destination"
              secondary={shipment.destination.address || 'N/A'} 
            />
          </ListItem>
          {shipment.currentLocation && (
            <ListItem>
              <ListItemIcon className={styles.listIcon}>
                <LocationIcon style={{ color: '#4CAF50' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Current Location"
                secondary={shipment.currentLocation.address || 
                  `${shipment.currentLocation.lat.toFixed(6)}, ${shipment.currentLocation.lng.toFixed(6)}`} 
              />
            </ListItem>
          )}
        </List>
      </Box>
      
      <Divider />
      
      {/* Shipment Details */}
      <Box className={styles.section}>
        <Typography variant="subtitle2" className={styles.sectionTitle}>
          Shipment Details
        </Typography>
        <List dense>
          {shipment.customerName && (
            <ListItem>
              <ListItemIcon className={styles.listIcon}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Customer" 
                secondary={shipment.customerName} 
              />
            </ListItem>
          )}
          {shipment.referenceNumber && (
            <ListItem>
              <ListItemIcon className={styles.listIcon}>
                <AssignmentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Reference" 
                secondary={shipment.referenceNumber} 
              />
            </ListItem>
          )}
          {shipment.customerReference && (
            <ListItem>
              <ListItemIcon className={styles.listIcon}>
                <TagIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Customer Reference" 
                secondary={shipment.customerReference} 
              />
            </ListItem>
          )}
          {shipment.type && (
            <ListItem>
              <ListItemIcon className={styles.listIcon}>
                <TypeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Type" 
                secondary={shipment.type.toUpperCase()} 
              />
            </ListItem>
          )}
          {shipment.totalWeight && (
            <ListItem>
              <ListItemIcon className={styles.listIcon}>
                <WeightIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Total Weight" 
                secondary={`${shipment.totalWeight} kg`} 
              />
            </ListItem>
          )}
          {shipment.totalVolume && (
            <ListItem>
              <ListItemIcon className={styles.listIcon}>
                <DimensionsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Total Volume" 
                secondary={`${shipment.totalVolume} m³`} 
              />
            </ListItem>
          )}
        </List>
      </Box>
      
      {/* Materials */}
      {shipment.materials && shipment.materials.length > 0 && (
        <>
          <Divider />
          <Box className={styles.section}>
            <Typography variant="subtitle2" className={styles.sectionTitle}>
              Materials ({shipment.materials.length})
            </Typography>
            <div className={styles.materialsList}>
              {shipment.materials.map((material, index) => renderMaterialItem(material, index))}
            </div>
          </Box>
        </>
      )}
      
      {/* Timeline */}
      {shipment.events && shipment.events.length > 0 && (
        <>
          <Divider />
          <Box className={styles.section}>
            <Typography variant="subtitle2" className={styles.sectionTitle}>
              Shipment Timeline
            </Typography>
            <div className={styles.timeline}>
              {shipment.events.map((event, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineDot} style={{ backgroundColor: statusColors[event.type as keyof typeof statusColors] || '#666' }} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineTitle}>
                        {event.description}
                      </span>
                      <span className={styles.timelineTime}>
                        {format(parseISO(event.timestamp), 'PPpp')}
                      </span>
                    </div>
                    {event.location && (
                      <div className={styles.timelineLocation}>
                        <LocationIcon fontSize="inherit" />
                        {event.location.address || 
                          `${event.location.lat?.toFixed(6)}, ${event.location.lng?.toFixed(6)}`}
                      </div>
                    )}
                    {event.notes && (
                      <div className={styles.timelineNotes}>
                        {event.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Box>
        </>
      )}
      
      {/* Actions */}
      {showActions && (
        <>
          <Divider />
          <Box className={styles.actions}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<HistoryIcon />}
              className={styles.actionButton}
            >
              History
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<NavigateIcon />}
              className={styles.actionButton}
            >
              Track
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<DocumentIcon />}
              className={styles.actionButton}
            >
              Documents
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ShipmentDetails;
