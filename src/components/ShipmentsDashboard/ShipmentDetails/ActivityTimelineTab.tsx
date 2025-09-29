// components/ShipmentsDashboard/ShipmentDetails/ActivityTimelineTab.tsx
import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import styles from "./ActivityTimelineTab.module.css";

// The component now accepts an onOpenMap function prop
const ActivityTimelineTab = ({
  shipmentData,
  onOpenMap,
}: {
  shipmentData: any;
  onOpenMap: (eventData: any) => void;
}) => {
  const timeline = shipmentData?.trails || [];

  const getUserInfo = (who: any) => {
    if (!who) return { name: "System", role: "" };
    if (who.driver) return { name: who.driver.name, role: "Driver" };
    if (who.attached_driver)
      return { name: who.attached_driver.name, role: "Driver" };
    if (who.carrier_user)
      return { name: who.carrier_user.name, role: "Carrier" };
    if (who.shipper_user)
      return { name: who.shipper_user.name, role: "Shipper" };
    if (who.organization_user)
      return { name: who.organization_user.name, role: "Client" };
    return { name: "N/A", role: "" };
  };

  return (
    <Box className={styles.timelineContainer}>
      {timeline.length > 0 ? (
        timeline.map((event: any, index: number) => {
          const userInfo = getUserInfo(event.who);
          const isLast = index === timeline.length - 1;
          const eventDate = new Date(event.created_at);
          let formattedDateTime = new Intl.DateTimeFormat("en-GB", {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
          }).format(eventDate).replace(/, /g, ' | ').replace(' at', ' |');

          // Capitalize only AM/PM
          formattedDateTime = formattedDateTime.replace(/ (am|pm)$/i, (match) => match.toUpperCase());

          // Check if location data exists for the event
          const hasLocation = event.latitude && event.longitude;

          return (
            <Box key={event._id || index} className={styles.event}>
              <Box className={styles.timestamp}>
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap', fontWeight: '550', fontColor: 'black' }}>
                  {formattedDateTime}
                </Typography>
              </Box>

              <Box className={styles.timelineGraphic}>
                <Box className={styles.dot} />
                {!isLast && <Box className={styles.line} />}
              </Box>

              <Box className={styles.eventContent}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="subtitle2">
                    {userInfo.name}
                    {userInfo.role && ` (${userInfo.role})`}
                  </Typography>

                  {/* --- NEW: Conditionally render the map icon --- */}
                  {hasLocation && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onOpenMap(event)}
                      sx={{ ml: 1 }}
                      title="View Location on Map"
                    >
                      <LocationOnIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    backgroundColor: "#F5F5F5",
                    fontSize: "0.75rem",
                    p: 1,
                    borderRadius: 6,
                    mt: 0.5,
                    display: "inline-block",
                    padding: "3px",
                  }}
                  color="text.secondary"
                >
                  {event.comments}
                </Typography>
              </Box>
            </Box>
          );
        })
      ) : (
        <Typography sx={{ textAlign: "center", p: 4 }}>
          No activity timeline available.
        </Typography>
      )}
    </Box>
  );
};

export default ActivityTimelineTab;
