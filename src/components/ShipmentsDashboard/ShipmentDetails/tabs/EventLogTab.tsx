import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';

// Define the event log interface
export interface EventLog {
  event_category: string;
  event_name: string;
  eventTime: string;
  [key: string]: any; // for additional properties
}

interface EventLogTabProps {
  eventLogs: EventLog[];
  loading: boolean;
  isMYKL?: boolean;
}

const EventLogTab: React.FC<EventLogTabProps> = ({
  eventLogs = [],
  loading = false,
  isMYKL = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Show empty state if not MYKL or no event logs
  if (!isMYKL) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="textSecondary">
          {t('shipment.eventLogsNotAvailable')}
        </Typography>
      </Box>
    );
  }

  // Show empty state if no event logs
  if (eventLogs.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <EventNoteIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {t('shipment.noEventLogs')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {t('shipment.noEventLogsDescription')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        <EventNoteIcon color="primary" sx={{ mr: 1 }} />
        {t('shipment.sapSmartTruckEventLogs')}
      </Typography>
      
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}>
                  {t('shipment.event')}
                </TableCell>
                <TableCell sx={{
                  fontWeight: 'bold',
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}>
                  {t('shipment.eventDescription')}
                </TableCell>
                <TableCell sx={{
                  fontWeight: 'bold',
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}>
                  {t('shipment.eventTimestamp')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventLogs.map((event, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:nth-of-type(odd)': { 
                      backgroundColor: theme.palette.action.hover 
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    },
                  }}
                >
                  <TableCell>{event.event_category}</TableCell>
                  <TableCell>{event.event_name}</TableCell>
                  <TableCell>{event.eventTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Box mt={2} textAlign="right">
        <Typography variant="caption" color="textSecondary">
          {t('shipment.totalEvents', { count: eventLogs.length })}
        </Typography>
      </Box>
    </Box>
  );
};

export default EventLogTab;
