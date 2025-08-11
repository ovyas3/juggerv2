"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Switch,
  TextField,
  Grid,
  FormControlLabel,
  Chip,
  Divider,
  Container,
  Button,
  IconButton,
  Modal,
  Tooltip,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useSnackbar } from "@/hooks/snackBar";

interface TripClosureTabProps {
  CustomDropdown: any;
}

export default function TripClosureTab({
  CustomDropdown,
}: TripClosureTabProps) {
  const [gpsAutoClose, setGpsAutoClose] = useState(false);
  const [gpsWithoutGeofenceOption, setGpsWithoutGeofenceOption] =
    useState("proximity");
  const [gpsProximityDistance, setGpsProximityDistance] = useState("");
  const [gpsClosureMethod, setGpsClosureMethod] = useState("");
  const [gpsTimeThreshold, setGpsTimeThreshold] = useState("");

  const [simAutoClose, setSimAutoClose] = useState(false);
  const [simWithoutGeofenceOption, setSimWithoutGeofenceOption] =
    useState("proximity");
  const [simProximityDistance, setSimProximityDistance] = useState("");
  const [simClosureMethod, setSimClosureMethod] = useState("");
  const [simTimeThreshold, setSimTimeThreshold] = useState("");
  const [trackingConfigData, setTrackingConfigData] = useState([]);
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<any>(null);
  const [popupAnchorEl, setPopupAnchorEl] = useState<any>(null);

  const geofenceOptions = [
    { value: "proximity", label: "Proximity" },
    { value: "pincode", label: "Pincode" },
  ];

  const closureMethodOptions = [
    { value: "epod", label: "ePOD Only" },
    { value: "time", label: "Time Threshold Only" },
    { value: "either", label: "Either (ePOD or Time)" },
  ];

  const handleOpenPopup = (event: any, content: any) => {
    setPopupContent(content);
    setPopupAnchorEl(event.currentTarget);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setPopupContent(null);
    setPopupAnchorEl(null);
  };

  const getTrackingSettings = async () => {
    const response = await httpsGet("trip_closure_settings/get", 0, router);
    if (response.statusCode === 200) {
      const trackingSettingsData = response?.data;
      if (trackingSettingsData?.length) {
        setTrackingConfigData(trackingSettingsData);
      } else {
        setTrackingConfigData([]);
      }
    } else {
      showMessage("Failed to fetch Trip Closure Settings", "error");
    }
  };

  useEffect(() => {
    getTrackingSettings();
  }, []);

  const editTrackingSettingsConfiguration = async () => {
    const buildPayload = (trackingType: any) => {
      const configData: any = trackingConfigData.find(
        (config: any) => config.tracking === trackingType
      );
      const autoClose = trackingType === "GPS" ? gpsAutoClose : simAutoClose;
      const withoutGeofenceOption =
        trackingType === "GPS"
          ? gpsWithoutGeofenceOption
          : simWithoutGeofenceOption;
      const proximityDistance =
        trackingType === "GPS" ? gpsProximityDistance : simProximityDistance;
      const closureMethod =
        trackingType === "GPS" ? gpsClosureMethod : simClosureMethod;
      const timeThreshold =
        trackingType === "GPS" ? gpsTimeThreshold : simTimeThreshold;

      if (withoutGeofenceOption === "proximity" && !proximityDistance) {
        showMessage(
          `Proximity distance is required for ${trackingType} Proximity setting`,
          "error"
        );
        return null;
      }

      if (
        autoClose &&
        (closureMethod === "time" || closureMethod === "either") &&
        !timeThreshold
      ) {
        showMessage(
          `Time Threshold is required for ${trackingType} Time-based closure`,
          "error"
        );
        return null;
      }

      let triggers: any = [];
      if (autoClose) {
        if (closureMethod === "epod") {
          triggers = ["EPOD"];
        } else if (closureMethod === "time") {
          triggers = ["TIME"];
        } else if (closureMethod === "either") {
          triggers = ["EPOD", "TIME"];
        }
      }

      const payload: any = {
        tracking: trackingType,
        trip_type: "WGF",
        sub_type: withoutGeofenceOption === "proximity" ? "PRX" : "PNC",
        value:
          withoutGeofenceOption === "proximity" ? Number(proximityDistance) : 0,
        auto_closer: {
          enabled: autoClose,
          triggers: triggers,
          threshold_time:
            autoClose &&
            (closureMethod === "time" || closureMethod === "either")
              ? Number(timeThreshold)
              : 0,
        },
      };

      if (configData && configData._id) {
        payload.closure_id = configData._id;
      }

      return payload;
    };

    const gpsPayload = buildPayload("GPS");
    if (!gpsPayload) {
      return;
    }

    const simPayload = buildPayload("SIM");
    if (!simPayload) {
      return;
    }

    const payloads = [gpsPayload, simPayload];

    const response = await httpsPost(
      "trip_closure_settings/add/edit",
      payloads,
      router,
      0
    );
    if (response.statusCode === 200) {
      getTrackingSettings();
      showMessage("Trip Closure Settings Configuration Success", "success");
    } else {
      showMessage("Failed to configure Trip Closure Settings", "error");
    }
  };

  useEffect(() => {
    if (trackingConfigData.length > 0) {
      trackingConfigData.forEach((config: any) => {
        if (config.tracking === "GPS") {
          setGpsAutoClose(config.auto_closer.enabled);
          if (config.sub_type === "PRX") {
            setGpsWithoutGeofenceOption("proximity");
            setGpsProximityDistance(config.value.toString());
          } else if (config.sub_type === "PNC") {
            setGpsWithoutGeofenceOption("pincode");
            setGpsProximityDistance("");
          }

          if (
            config.auto_closer.triggers.includes("EPOD") &&
            config.auto_closer.triggers.includes("TIME")
          ) {
            setGpsClosureMethod("either");
            setGpsTimeThreshold(config.auto_closer.threshold_time.toString());
          } else if (config.auto_closer.triggers.includes("EPOD")) {
            setGpsClosureMethod("epod");
            setGpsTimeThreshold("");
          } else if (config.auto_closer.triggers.includes("TIME")) {
            setGpsClosureMethod("time");
            setGpsTimeThreshold(config.auto_closer.threshold_time.toString());
          }
        } else if (config.tracking === "SIM") {
          setSimAutoClose(config.auto_closer.enabled);
          if (config.sub_type === "PRX") {
            setSimWithoutGeofenceOption("proximity");
            setSimProximityDistance(config.value.toString());
          } else if (config.sub_type === "PNC") {
            setSimWithoutGeofenceOption("pincode");
            setSimProximityDistance("");
          }

          if (
            config.auto_closer.triggers.includes("EPOD") &&
            config.auto_closer.triggers.includes("TIME")
          ) {
            setSimClosureMethod("either");
            setSimTimeThreshold(config.auto_closer.threshold_time.toString());
          } else if (config.auto_closer.triggers.includes("EPOD")) {
            setSimClosureMethod("epod");
            setSimTimeThreshold("");
          } else if (config.auto_closer.triggers.includes("TIME")) {
            setSimClosureMethod("time");
            setSimTimeThreshold(config.auto_closer.threshold_time.toString());
          }
        }
      });
    }
  }, [trackingConfigData]);

  const gpsDetectionLogic = [
    {
      label: "1st",
      color: "primary.main",
      title: "Preference: Geofence (Polygonal)",
      desc: "If a polygonal geofence is present at the delivery location, the system will use it for arrival detection",
      show: true,
    },
    {
      label: "2nd",
      color: "grey.400",
      title: "Preference: Without Geofence Options",
      desc: "If no geofence is present, system uses one of the configured fallback options below",
      show: true,
    },
  ];

  const simDetectionLogic = [
    {
      label: "1",
      color: "primary.main",
      title: "Proximity",
      desc: "Distance calculated from delivery location coordinates",
      show: true,
    },
    {
      label: "2",
      color: "grey.400",
      title: "Pincode",
      desc: "Uses delivery location pincode boundary",
      show: true,
    },
  ];

  const renderPopupContent = (content: any) => (
    <Box
      sx={{
        p: 3,
        bgcolor: "background.paper",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        width: 400,
        position: 'absolute',
        top: popupAnchorEl ? popupAnchorEl.getBoundingClientRect().top + window.scrollY : 0,
        left: popupAnchorEl ? popupAnchorEl.getBoundingClientRect().left + window.scrollX - 410 : 0,
        zIndex: 1300,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 2, fontSize: "14px" }}
      >
        {content.tracking === "GPS"
          ? "Detection Logic Priority"
          : "Detection Logic (Without Geofence)"}
      </Typography>
      {content.tracking === "SIM" && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, fontSize: "14px" }}
        >
          SIM tracking operates without geofence dependency and uses the
          following options:
        </Typography>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {content.detectionLogic.map(
          (logic: any, i: any) =>
            logic.show && (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Chip
                  label={logic.label}
                  size="small"
                  sx={{
                    bgcolor: logic.color,
                    color: "white",
                    fontWeight: 600,
                    minWidth: content.tracking === "GPS" ? 40 : 32,
                    fontSize: "12px",
                  }}
                />
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500, fontSize: "14px" }}
                  >
                    {logic.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "14px" }}
                  >
                    {logic.desc}
                  </Typography>
                </Box>
              </Box>
            )
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ mx: "auto", p: 2 }}>
        <Grid container spacing={3}>
          {[
            {
              tracking: "GPS",
              icon: (
                <LocationOnIcon sx={{ color: "primary.main", fontSize: 20 }} />
              ),
              title: "GPS Tracking Configuration",
              detectionLogic: gpsDetectionLogic,
              withoutGeofenceLabel: "Without Geofence Configuration",
              dropdownLabel: "Fallback Option",
              dropdownValue: gpsWithoutGeofenceOption,
              setDropdownValue: setGpsWithoutGeofenceOption,
              dropdownOptions: geofenceOptions,
              proximityValue: gpsProximityDistance,
              setProximityValue: setGpsProximityDistance,
              autoClose: gpsAutoClose,
              setAutoClose: setGpsAutoClose,
              autoCloseLabel:
                "Enable automatic trip closure for GPS-tracked vehicles",
              closureMethod: gpsClosureMethod,
              setClosureMethod: setGpsClosureMethod,
              closureMethodOptions: closureMethodOptions,
              timeThreshold: gpsTimeThreshold,
              setTimeThreshold: setGpsTimeThreshold,
            },
            {
              tracking: "SIM",
              icon: (
                <PhoneAndroidIcon
                  sx={{ color: "primary.main", fontSize: 20 }}
                />
              ),
              title: "SIM Tracking Configuration",
              detectionLogic: simDetectionLogic,
              withoutGeofenceLabel: "Configuration Settings",
              dropdownLabel: "Detection Option",
              dropdownValue: simWithoutGeofenceOption,
              setDropdownValue: setSimWithoutGeofenceOption,
              dropdownOptions: geofenceOptions,
              proximityValue: simProximityDistance,
              setProximityValue: setSimProximityDistance,
              autoClose: simAutoClose,
              setAutoClose: setSimAutoClose,
              autoCloseLabel:
                "Enable automatic trip closure for SIM-tracked vehicles",
              closureMethod: simClosureMethod,
              setClosureMethod: setSimClosureMethod,
              closureMethodOptions: closureMethodOptions,
              timeThreshold: simTimeThreshold,
              setTimeThreshold: setSimTimeThreshold,
            },
          ].map((config, idx) => (
            <Grid item xs={12} md={6} key={config.tracking}>
              <Paper
                sx={{
                  p: 3,
                  border: "1px solid #e0e0e0",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  {config.icon}
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    {config.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    flexGrow: 1,
                  }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: "#f8f9fa",
                      border: "1px solid #e9ecef",
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, fontSize: "14px" }}
                      >
                        {config.tracking === "GPS"
                          ? "Detection Logic Priority"
                          : "Detection Logic (Without Geofence)"}
                      </Typography>
                      <Tooltip title="View Detection Logic Details">
                        <IconButton onClick={(e) => handleOpenPopup(e, config)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>

                  <Paper sx={{ p: 3, border: "1px solid #e0e0e0" }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 3, fontSize: "14px" }}
                    >
                      {config.withoutGeofenceLabel}
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            width: "100%",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#374151",
                            }}
                          >
                            {config.dropdownLabel}
                          </Typography>
                          <CustomDropdown
                            value={config.dropdownValue}
                            onChange={config.setDropdownValue}
                            options={config.dropdownOptions}
                            placeholder={
                              config.tracking === "GPS"
                                ? "Select fallback option"
                                : "Select detection option"
                            }
                            minWidth={config.tracking === "GPS" ? 250 : 220}
                            sx={{
                              "& .MuiInputBase-root": {
                                height: "40px",
                                fontSize: "14px",
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                      {config.dropdownValue === "proximity" && (
                        <Grid item xs={12} md={6} sx={{ marginTop: "28px" }}>
                          <TextField
                            fullWidth
                            label="Proximity Distance (meters)"
                            type="number"
                            value={config.proximityValue}
                            onChange={(e) =>
                              config.setProximityValue(e.target.value)
                            }
                            helperText="Distance calculated from delivery location coordinates"
                            sx={{
                              "& .MuiInputBase-root": {
                                height: "40px",
                                fontSize: "14px",
                              },
                              "& .MuiInputLabel-root": { fontSize: "14px" },
                              "& .MuiFormHelperText-root": { fontSize: "12px" },
                            }}
                          />
                        </Grid>
                      )}
                      {config.dropdownValue === "pincode" && (
                        <Grid item xs={12}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: "italic", fontSize: "14px" }}
                          >
                            <strong>Pincode-based Detection:</strong> Uses the
                            delivery location pincode area for arrival
                            detection. The system will trigger closure when the
                            vehicle enters the pincode boundary.
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>

                  <Divider />

                  <Paper sx={{ p: 3, border: "1px solid #e0e0e0" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, fontSize: "14px" }}
                        >
                          Automatic Shipment Closure
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "14px" }}
                        >
                          {config.autoCloseLabel}
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.autoClose}
                            onChange={(e) =>
                              config.setAutoClose(e.target.checked)
                            }
                            color="primary"
                          />
                        }
                        label=""
                      />
                    </Box>
                    {config.autoClose && (
                      <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              width: "100%",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#374151",
                              }}
                            >
                              Closure Trigger
                            </Typography>
                            <CustomDropdown
                              value={config.closureMethod}
                              onChange={config.setClosureMethod}
                              options={config.closureMethodOptions}
                              placeholder="Select closure trigger"
                              minWidth={200}
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: "40px",
                                  fontSize: "14px",
                                },
                              }}
                            />
                          </Box>
                        </Grid>
                        {config.closureMethod !== "epod" &&
                          config.closureMethod !== "" && (
                            <Grid
                              item
                              xs={12}
                              md={6}
                              sx={{ marginTop: "28px" }}
                            >
                              <TextField
                                fullWidth
                                label="Time Threshold (minutes)"
                                type="number"
                                value={config.timeThreshold}
                                onChange={(e) =>
                                  config.setTimeThreshold(e.target.value)
                                }
                                sx={{
                                  "& .MuiInputBase-root": {
                                    height: "40px",
                                    fontSize: "14px",
                                  },
                                  "& .MuiInputLabel-root": { fontSize: "14px" },
                                }}
                              />
                            </Grid>
                          )}
                      </Grid>
                    )}
                  </Paper>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 0,
          borderTop: "1px solid #e0e0e0",
          mt: "auto",
          position: "fixed",
          bottom: 0,
          width: "calc(100vw - 64px)",
          maxWidth: "auto",
          left: "64px",
        }}
      >
        <Container
          sx={{
            px: 3,
            py: 2,
            maxWidth: "auto !important",
            "&.MuiContainer-root": {
              maxWidth: "auto !important",
              marginRight: 0,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              maxWidth: "auto",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => editTrackingSettingsConfiguration()}
              sx={{
                px: 4,
                py: 1.5,
                bgcolor: "primary.main",
                fontSize: "14px",
                maxWidth: "auto",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              Save Configuration
            </Button>
          </Box>
        </Container>
      </Paper>
      {popupOpen && (
        <Modal
          open={popupOpen}
          onClose={handleClosePopup}
          aria-labelledby="detection-logic-popup"
          aria-describedby="detection-logic-details"
          closeAfterTransition
          slotProps={{
            backdrop: {
              onClick: handleClosePopup,
              style: { backgroundColor: 'transparent' },
            },
          }}
        >
          {renderPopupContent(popupContent)}
        </Modal>
      )}
    </>
  );
}