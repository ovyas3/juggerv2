// components/ShipmentsDashboard/ShipmentDetails/EventLogsTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  CircularProgress,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { format } from "date-fns";
import { httpsGet } from "@/utils/Communication";
import { useSnackbar } from "@/hooks/snackBar";

interface EventLog {
  event_category: string;
  event_name: string;
  eventTime: string;
}

// NOTE: Updated prop definition to reflect what is actually passed from ShipmentDetails.tsx
interface EventLogsTabProps {
  shipmentData: any; // The whole shipment data object is passed
  isMYKL: boolean;     // isMYKL is passed as a separate boolean
}

// Function to format a timestamp into a readable string
const formatEventTime = (timestamp: string | number): string => {
  try {
    return format(new Date(timestamp), "dd-MMM-yyyy hh:mm a");
  } catch (e) {
    return "N/A";
  }
};

const EventLogsTab: React.FC<EventLogsTabProps> = ({
  shipmentData,
  isMYKL,
}) => {
  // Extract shipmentId from shipmentData for use in the API call
  const shipmentId = shipmentData?._id;

  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showMessage } = useSnackbar();

  // Fetches event logs when the component mounts or shipmentId changes.
  useEffect(() => {
    // Use the extracted shipmentId for conditional checks
    if (!isMYKL || !shipmentId) {
      setIsLoading(false);
      setEventLogs([]);
      return;
    }

    const fetchEventLogs = async () => {
      setIsLoading(true);
      try {
        // Use the extracted shipmentId in the API endpoint
        const response = await httpsGet(`events/${shipmentId}`);

        if (response.statusCode === 200 && Array.isArray(response.data)) {
          const formattedLogs: EventLog[] = response.data.map((event: any) => ({
            event_category: event.event_category || 'N/A',
            event_name: event.event_name || 'N/A',
            // Ensure event_timestamp exists before formatting
            eventTime: event.event_timestamp ? formatEventTime(event.event_timestamp) : 'N/A',
          }));
          setEventLogs(formattedLogs);
        } else {
          setEventLogs([]);
        }
      } catch (error: any) {
        showMessage(error.message || 'Failed to fetch event logs.', 'error');
        setEventLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventLogs();
  }, [shipmentId, isMYKL]); // Dependency array uses the extracted shipmentId

  if (!isMYKL) {
    return null; // Don't render if it's not the designated client
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography>Loading SAP-SmarTruck Event Logs...</Typography>
      </Box>
    );
  }

  return (
    <Box className="body-section">
      <Box className="toggleViewMain materials">
        <Typography variant="h6" className="materil-title" sx={{ mb: 1 }}>
          SAP-SmarTruck Event Logs
        </Typography>
        <Box className="material-body">
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '20%' , textAlign: 'center', color: '#09337e'}}>Event</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '50%' , textAlign: 'center', color: '#09337e'}}>Event Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '30%', textAlign: 'center', color: '#09337e' }}>Event TimeStamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eventLogs.length > 0 ? (
                  eventLogs.map((event, i) => (
                    <TableRow key={i}>
                      <TableCell sx = {{ textAlign: 'center', width: '20%', whiteSpace: 'wrap'}}>{event.event_category || 'N/A'}</TableCell>
                      <TableCell sx = {{ textAlign: 'center' }}>{event.event_name || 'N/A'}</TableCell>
                      <TableCell sx = {{ textAlign: 'center' }}>{event.eventTime || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No event logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default EventLogsTab;