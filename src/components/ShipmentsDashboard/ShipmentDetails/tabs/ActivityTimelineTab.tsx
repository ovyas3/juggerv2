import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  AssignmentLate as AssignmentLateIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent, TimelineOppositeContent } from '@mui/lab';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTimelineTabProps {
  activities: Array<{
    _id: string;
    type: string;
    status: string;
    timestamp: string;
    user?: {
      name: string;
      role?: string;
    };
    details?: string;
    location?: {
      name: string;
      address?: string;
    };
    documents?: Array<{
      _id: string;
      name: string;
      url: string;
      type: string;
    }>;
  }>;
  formatDate: (dateString: string, format?: string) => string;
  onRefresh: () => void;
}

const ActivityTimelineTab: React.FC<ActivityTimelineTabProps> = ({
  activities = [],
  formatDate,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Get icon for activity type
  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case 'shipment_created':
        return <AssignmentIcon style={{ color: theme.palette.primary.main }} />;
      case 'pickup':
        return status === 'completed' 
          ? <AssignmentTurnedInIcon style={{ color: theme.palette.success.main }} /> 
          : <AssignmentIcon style={{ color: theme.palette.warning.main }} />;
      case 'delivery':
        return status === 'completed' 
          ? <AssignmentTurnedInIcon style={{ color: theme.palette.success.main }} /> 
          : <AssignmentIcon style={{ color: theme.palette.info.main }} />;
      case 'status_change':
        return <CheckCircleIcon style={{ color: theme.palette.success.main }} />;
      case 'document_uploaded':
        return <AssignmentIcon style={{ color: theme.palette.secondary.main }} />;
      case 'issue_reported':
        return <WarningIcon style={{ color: theme.palette.error.main }} />;
      case 'delay':
        return <ScheduleIcon style={{ color: theme.palette.warning.main }} />;
      default:
        return <InfoIcon style={{ color: theme.palette.grey[500] }} />;
    }
  };

  // Get color for activity status
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
      case 'in_transit':
      case 'picked_up':
        return 'info';
      case 'pending':
      case 'scheduled':
        return 'warning';
      case 'delayed':
      case 'cancelled':
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format activity title based on type and status
  const formatActivityTitle = (activity: any) => {
    const { type, status, location } = activity;
    
    switch (type) {
      case 'shipment_created':
        return t('activity.shipmentCreated');
      case 'pickup':
        return status === 'completed' 
          ? t('activity.pickupCompleted', { location: location?.name })
          : t('activity.pickupScheduled', { location: location?.name });
      case 'delivery':
        return status === 'completed'
          ? t('activity.deliveryCompleted', { location: location?.name })
          : t('activity.deliveryScheduled', { location: location?.name });
      case 'status_change':
        return t('activity.statusChanged', { status: t(`status.${status}`) });
      case 'document_uploaded':
        return t('activity.documentUploaded');
      case 'issue_reported':
        return t('activity.issueReported');
      case 'delay':
        return t('activity.delayed');
      default:
        return type;
    }
  };

  // Format activity details
  const formatActivityDetails = (activity: any) => {
    const { type, details, user, location } = activity;
    
    let result = [];
    
    if (user?.name) {
      result.push(t('activity.byUser', { user: user.name }));
    }
    
    if (details) {
      result.push(details);
    }
    
    if (location?.address && !details?.includes(location.address)) {
      result.push(location.address);
    }
    
    return result.join(' • ');
  };

  // Group activities by date
  const groupActivitiesByDate = () => {
    const groups: Record<string, typeof activities> = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    
    return groups;
  };

  const groupedActivities = groupActivitiesByDate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('shipment.activityTimeline')}
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

      {Object.entries(groupedActivities).length > 0 ? (
        <Timeline position="alternate">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <React.Fragment key={date}>
              <Box sx={{ textAlign: 'center', my: 2 }}>
                <Chip 
                  label={new Date(date).toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  sx={{ 
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    fontWeight: 'medium'
                  }}
                />
              </Box>
              
              {dateActivities.map((activity, index) => (
                <TimelineItem key={activity._id}>
                  <TimelineOppositeContent
                    sx={{ m: 'auto 0', px: 2, flex: 0.15 }}
                    color="text.secondary"
                    variant="body2"
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="caption">
                        {formatDate(activity.timestamp, 'h:mm a')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </Typography>
                    </Box>
                  </TimelineOppositeContent>
                  
                  <TimelineSeparator>
                    <TimelineDot color={getStatusColor(activity.status)}>
                      {getActivityIcon(activity.type, activity.status)}
                    </TimelineDot>
                    {index < dateActivities.length - 1 && (
                      <TimelineConnector />
                    )}
                  </TimelineSeparator>
                  
                  <TimelineContent sx={{ py: 2, px: 2 }}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        borderLeft: `4px solid ${theme.palette.primary.main}`
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                            {formatActivityTitle(activity)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatActivityDetails(activity)}
                          </Typography>
                        </Box>
                        {activity.status && (
                          <Chip
                            label={t(`status.${activity.status}`)}
                            size="small"
                            color={getStatusColor(activity.status) as any}
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      {activity.documents && activity.documents.length > 0 && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            {t('common.attachments')}:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {activity.documents.map(doc => (
                              <Chip
                                key={doc._id}
                                icon={<AssignmentIcon fontSize="small" />}
                                label={doc.name}
                                size="small"
                                variant="outlined"
                                onClick={() => window.open(doc.url, '_blank')}
                                sx={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </React.Fragment>
          ))}
        </Timeline>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 300,
          textAlign: 'center',
          p: 3
        }}>
          <InfoIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('activity.noActivitiesFound')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('activity.noActivitiesDescription')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ActivityTimelineTab;
