import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  Typography,
  Button,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  LocalShipping as TruckIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Shipment, Location } from '../../../ShipmentsDashboard/ShipmentDetails/types';

interface OrderDetailsTabProps {
  shipment: Shipment;
  formatDate: (dateString: string, format?: string) => string;
  roles: {
    owner: boolean;
    fleet: boolean;
    fleet_admin: boolean;
    unit_admin: boolean;
    shipment: boolean;
  };
  onRefresh: () => void;
  onStatusChange?: (status: string) => void;
}

const OrderDetailsTab: React.FC<OrderDetailsTabProps> = ({
  shipment,
  formatDate,
  roles,
  onRefresh,
  onStatusChange,
}) => {
  const { t } = useTranslation();

  // Render location information
  const renderLocation = (location: Location, type: 'pickup' | 'delivery') => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <LocationIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          {location.name}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 1 }}>
        {location.address}
      </Typography>
      {location.contact_person && (
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 3, mb: 1 }}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {location.contact_person}
            {location.contact_number && ` (${location.contact_number})`}
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Render timeline item
  const renderTimelineItem = (title: string, date: string, status?: string) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TimeIcon color="action" fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body2">
          {date ? formatDate(date) : t('common.notAvailable')}
        </Typography>
        {status && (
          <Chip
            label={status}
            size="small"
            sx={{ ml: 1 }}
            color={
              status.toLowerCase() === 'completed'
                ? 'success'
                : status.toLowerCase() === 'in progress'
                ? 'warning'
                : 'default'
            }
          />
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('shipment.orderDetails')}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left column - Shipment Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2, height: '100%', border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              {t('shipment.shipmentInformation')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('shipment.shipmentId')}
                </Typography>
                <Typography variant="body1">{shipment.unique_code}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('shipment.status')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={shipment.shipment_status}
                    color={
                      shipment.shipment_status.toLowerCase() === 'completed'
                        ? 'success'
                        : shipment.shipment_status.toLowerCase() === 'in transit'
                        ? 'primary'
                        : 'default'
                    }
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('shipment.createdAt')}
                </Typography>
                <Typography variant="body1">
                  {formatDate(shipment.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('shipment.updatedAt')}
                </Typography>
                <Typography variant="body1">
                  {formatDate(shipment.updated_at)}
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                {t('shipment.timeline')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {renderTimelineItem(
                t('shipment.estimatedPickup'),
                shipment.pickups[0]?.scheduled_date,
                shipment.pickups[0]?.status
              )}
              {renderTimelineItem(
                t('shipment.estimatedDelivery'),
                shipment.deliveries[0]?.scheduled_date,
                shipment.deliveries[0]?.status
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right column - Driver & Vehicle */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2, height: '100%', border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              {t('shipment.driverAndVehicle')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  {t('shipment.driver')}
                </Typography>
              </Box>
              <Box sx={{ ml: 4 }}>
                <Typography variant="body1">
                  {shipment.driver?.name || t('common.notAssigned')}
                </Typography>
                {shipment.driver?.contact_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                      {shipment.driver.contact_number}
                    </Typography>
                  </Box>
                )}
                {shipment.driver?.license_number && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {t('shipment.license')}: {shipment.driver.license_number}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CarIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  {t('shipment.vehicle')}
                </Typography>
              </Box>
              <Box sx={{ ml: 4 }}>
                <Typography variant="body1">
                  {shipment.vehicle?.registration_number || t('common.notAssigned')}
                </Typography>
                {shipment.vehicle?.vehicle_type && (
                  <Typography variant="body2" color="text.secondary">
                    {shipment.vehicle.vehicle_type}
                    {shipment.vehicle.capacity && ` • ${shipment.vehicle.capacity} kg`}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TruckIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  {t('shipment.tripInfo')}
                </Typography>
              </Box>
              <Grid container spacing={2} sx={{ ml: 0.5 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('shipment.estimatedDistance')}
                  </Typography>
                  <Typography variant="body1">
                    {shipment.estimated_distance ? `${shipment.estimated_distance} km` : t('common.notAvailable')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('shipment.estimatedDuration')}
                  </Typography>
                  <Typography variant="body1">
                    {shipment.estimated_duration ? `${Math.round(shipment.estimated_duration / 60)} hrs` : t('common.notAvailable')}
                  </Typography>
                </Grid>
                {shipment.actual_distance && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('shipment.actualDistance')}
                    </Typography>
                    <Typography variant="body1">
                      {shipment.actual_distance} km
                    </Typography>
                  </Grid>
                )}
                {shipment.actual_duration && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('shipment.actualDuration')}
                    </Typography>
                    <Typography variant="body1">
                      {Math.round(shipment.actual_duration / 60)} hrs
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Pickup Locations */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              {t('shipment.pickupLocations')} ({shipment.pickups.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {shipment.pickups.map((pickup, index) => (
                <Grid item xs={12} md={6} key={pickup._id}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    position: 'relative'
                  }}>
                    <Chip 
                      label={`P${index + 1}`} 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText'
                      }} 
                    />
                    {renderLocation(pickup.location, 'pickup')}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('shipment.scheduled')}
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(pickup.scheduled_date)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('common.status')}
                        </Typography>
                        <Chip 
                          label={pickup.status} 
                          size="small" 
                          color={
                            pickup.status.toLowerCase() === 'completed'
                              ? 'success'
                              : pickup.status.toLowerCase() === 'in progress'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Delivery Locations */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              {t('shipment.deliveryLocations')} ({shipment.deliveries.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {shipment.deliveries.map((delivery: any, index: any) => (
                <Grid item xs={12} md={6} key={delivery._id}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    position: 'relative'
                  }}>
                    <Chip 
                      label={`D${index + 1}`} 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        bgcolor: 'secondary.main',
                        color: 'secondary.contrastText'
                      }} 
                    />
                    {renderLocation(delivery.location, 'delivery')}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('shipment.scheduled')}
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(delivery.scheduled_date)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('common.status')}
                        </Typography>
                        <Chip 
                          label={delivery.status} 
                          size="small" 
                          color={
                            delivery.status.toLowerCase() === 'completed'
                              ? 'success'
                              : delivery.status.toLowerCase() === 'in progress'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </Box>
                    </Box>
                    {delivery.invoices && delivery.invoices.length > 0 && (
                      <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed #e0e0e0' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t('shipment.invoices')} ({delivery.invoices.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {delivery.invoices.map((invoice: any) => (
                            <Chip 
                              key={invoice._id}
                              label={`${invoice.num}`}
                              size="small"
                              variant="outlined"
                              onClick={() => {}}
                              sx={{ cursor: 'pointer' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetailsTab;
