import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DateTime } from 'luxon';
import TabPanel from './TabPanel';
import OrderDetailsTab from './tabs/OrderDetailsTab';
import ActivityTimelineTab from './tabs/ActivityTimelineTab';
import PickupTab from './tabs/PickupTab';
import DeliveryTab from './tabs/DeliveryTab';
import FreightTab from './tabs/FreightTab';
import LRTab from './tabs/LRTab';
import ChartTab from './tabs/ChartTab';
import MaterialsTab from './tabs/MaterialsTab';
import EventLogTab from './tabs/EventLogTab';
import BillToTab from './tabs/BillToTab';
import { Shipment, ShipmentDetailsProps } from './types';

const ShipmentDetails: React.FC<ShipmentDetailsProps> = ({
  open,
  onClose,
  shipment,
  loading = false,
  isMYKL = false,
  isTechnova = false,
  isRSPL = false,
  isBMWIL = false,
  own_fleet = false,
  showFreight = false,
  type = 'default',
  roles = {
    owner: false,
    fleet: false,
    fleet_admin: false,
    unit_admin: false,
    shipment: false,
  },
  onRefresh,
  onUpdateStatus,
  onUploadDocument,
  onAddComment,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  // State for pickup/delivery sub-tabs
  const [pickupTab, setPickupTab] = useState(0);
  const [deliveryTab, setDeliveryTab] = useState(0);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle pickup tab change
  const handlePickupTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setPickupTab(newValue);
  };

  // Handle delivery tab change
  const handleDeliveryTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setDeliveryTab(newValue);
  };

  // Close handler
  const handleClose = () => {
    onClose();
    // Reset tabs when closing
    setActiveTab(0);
    setPickupTab(0);
    setDeliveryTab(0);
  };

  // Format date
  const formatDate = (dateString: string, format = 'dd MMM yyyy, hh:mm a') => {
    if (!dateString) return '';
    return DateTime.fromISO(dateString).toFormat(format);
  };

  // Refresh handler
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // Update status handler
  const handleStatusUpdate = (status: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(status);
    }
  };

  // Upload document handler
  const handleUploadDocument = (file: File, type: string, referenceId: string) => {
    if (onUploadDocument) {
      onUploadDocument(file, type, referenceId);
    }
  };

  // Add comment handler
  const handleAddComment = (comment: string, referenceId: string) => {
    if (onAddComment) {
      onAddComment(comment, referenceId);
    }
  };

  // Effect to reset tabs when shipment changes
  useEffect(() => {
    if (shipment) {
      setActiveTab(0);
      setPickupTab(0);
      setDeliveryTab(0);
    }
  }, [shipment]);

  if (!shipment) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      aria-labelledby="shipment-details-dialog"
      sx={{
        '& .MuiDialog-paper': {
          height: isMobile ? '100%' : '90%',
          maxHeight: isMobile ? '100%' : '90%',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box>
            <Box sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
              {t('shipment.shipmentId')} #{shipment.unique_code}
            </Box>
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {shipment.shipment_status}
            </Box>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Main Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="shipment details tabs"
                sx={{
                  minHeight: '48px',
                  '& .MuiTab-root': {
                    minHeight: '48px',
                  },
                }}
              >
                <Tab label={t('shipment.tabs.orderDetails')} id="order-details-tab" />
                <Tab label={t('shipment.tabs.activityTimeline')} id="activity-timeline-tab" />
                <Tab label={t('shipment.tabs.pickup')} id="pickup-tab" />
                {isMYKL && <Tab label={t('shipment.tabs.securityAppStages')} id="security-app-stages-tab" />}
                <Tab label={t('shipment.tabs.delivery')} id="delivery-tab" />
                {!own_fleet && showFreight && <Tab label={t('shipment.tabs.freight')} id="freight-tab" />}
                {type === '4pl' && showFreight && <Tab label={t('shipment.tabs.fourPlInvoice')} id="4pl-invoice-tab" />}
                <Tab label={t('shipment.tabs.lr')} id="lr-tab" />
                {isTechnova && <Tab label={t('shipment.tabs.chart')} id="chart-tab" />}
                {(shipment.deliveries?.[0]?.invoices?.length > 0 || isRSPL) && (
                  <Tab label={t('shipment.tabs.materials')} id="materials-tab" />
                )}
                {isMYKL && <Tab label={t('shipment.tabs.eventLog')} id="event-log-tab" />}
                {isTechnova && <Tab label={t('shipment.tabs.billTo')} id="bill-to-tab" />}
              </Tabs>
            </Box>

            {/* Tab Panels */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {/* Order Details Tab */}
              <TabPanel value={activeTab} index={0}>
                <OrderDetailsTab 
                  shipment={shipment} 
                  formatDate={formatDate} 
                  roles={roles}
                  onRefresh={handleRefresh}
                />
              </TabPanel>

              {/* Activity Timeline Tab */}
              <TabPanel value={activeTab} index={1}>
                <ActivityTimelineTab 
                  trails={shipment.trails} 
                  formatDate={formatDate} 
                />
              </TabPanel>

              {/* Pickup Tab */}
              <TabPanel value={activeTab} index={2}>
                <PickupTab 
                  pickups={shipment.pickups} 
                  tabValue={pickupTab} 
                  onTabChange={handlePickupTabChange} 
                  formatDate={formatDate}
                  onUploadDocument={handleUploadDocument}
                  onAddComment={handleAddComment}
                  roles={roles}
                />
              </TabPanel>

              {/* Delivery Tab */}
              <TabPanel value={activeTab} index={isMYKL ? 4 : 3}>
                <DeliveryTab 
                  deliveries={shipment.deliveries} 
                  tabValue={deliveryTab} 
                  onTabChange={handleDeliveryTabChange} 
                  formatDate={formatDate}
                  onUploadDocument={handleUploadDocument}
                  onAddComment={handleAddComment}
                  roles={roles}
                  isBMWIL={isBMWIL}
                />
              </TabPanel>

              {/* Freight Tab */}
              {!own_fleet && showFreight && (
                <TabPanel value={activeTab} index={isMYKL ? 5 : 4}>
                  <FreightTab 
                    shipmentId={shipment._id} 
                    formatDate={formatDate} 
                    roles={roles}
                  />
                </TabPanel>
              )}

              {/* 4PL Invoice Tab */}
              {type === '4pl' && showFreight && (
                <TabPanel value={activeTab} index={isMYKL ? 6 : 5}>
                  <div>4PL Invoice Content</div>
                </TabPanel>
              )}

              {/* LR Tab */}
              <TabPanel 
                value={activeTab} 
                index={type === '4pl' && showFreight 
                  ? (isMYKL ? 7 : 6) 
                  : (!own_fleet && showFreight ? (isMYKL ? 6 : 5) : (isMYKL ? 5 : 4))
                }
              >
                <LRTab 
                  shipment={shipment} 
                  formatDate={formatDate} 
                  roles={roles}
                />
              </TabPanel>

              {/* Chart Tab */}
              {isTechnova && (
                <TabPanel 
                  value={activeTab} 
                  index={type === '4pl' && showFreight 
                    ? (isMYKL ? 8 : 7) 
                    : (!own_fleet && showFreight ? (isMYKL ? 7 : 6) : (isMYKL ? 6 : 5))
                  }
                >
                  <ChartTab shipmentId={shipment._id} />
                </TabPanel>
              )}

              {/* Materials Tab */}
              {(shipment.deliveries?.[0]?.invoices?.length > 0 || isRSPL) && (
                <TabPanel 
                  value={activeTab} 
                  index={isTechnova 
                    ? (type === '4pl' && showFreight ? 9 : 8)
                    : (type === '4pl' && showFreight ? 8 : 7)
                  }
                >
                  <MaterialsTab 
                    invoices={shipment.deliveries.flatMap(d => d.invoices)} 
                    formatDate={formatDate} 
                  />
                </TabPanel>
              )}

              {/* Event Log Tab */}
              {isMYKL && (
                <TabPanel 
                  value={activeTab} 
                  index={isTechnova 
                    ? (type === '4pl' && showFreight ? 10 : 9)
                    : (type === '4pl' && showFreight ? 9 : 8)
                  }
                >
                  <EventLogTab shipmentId={shipment._id} formatDate={formatDate} />
                </TabPanel>
              )}

              {/* Bill To Tab */}
              {isTechnova && (
                <TabPanel 
                  value={activeTab} 
                  index={isMYKL 
                    ? (type === '4pl' && showFreight ? 11 : 10)
                    : (type === '4pl' && showFreight ? 10 : 9)
                  }
                >
                  <BillToTab 
                    invoices={shipment.deliveries.flatMap(d => d.invoices)} 
                    formatDate={formatDate} 
                  />
                </TabPanel>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentDetails;
