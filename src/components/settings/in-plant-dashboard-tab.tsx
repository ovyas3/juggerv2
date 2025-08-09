import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  InputAdornment,
  Switch,
  FormControlLabel,
  Container,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackBar";

interface KpiMetric {
  _id: string;
  from: string;
  to: string;
  value: {
    target: number;
    good: number;
    average: number;
  };
  active: boolean;
  isNew: boolean;
}

export default function InPlantDashboardTab() {
  const [kpiMetrics, setKpiMetrics] = useState<KpiMetric[]>([]);
  const router = useRouter();
  const { showMessage } = useSnackbar();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    metricId: string | null;
    metricName: string;
  }>({
    open: false,
    metricId: null,
    metricName: "",
  });

  const EventOptions = [
    { value: "", label: "Select from event" },
    { value: "PO", label: "Parking Out" },
    { value: "GI", label: "Gate In" },
    { value: "TW", label: "Tare Weight" },
    { value: "GW", label: "Gross Weight" },
    { value: "PG", label: "Post Goods" },
    { value: "TC", label: "Test Certificate" },
    { value: "IV", label: "Invoice" },
    { value: "LR", label: "Lorry Receipt" },
    { value: "EW", label: "E-way Bill" },
    { value: "GO", label: "Gate Out" },
  ];

  const addKpiMetric = () => {
    const newMetric: KpiMetric = {
      _id: Date.now().toString(),
      from: "",
      to: "",
      value: {
        target: 0,
        good: 0,
        average: 0,
      },
      active: true,
      isNew: true,
    };
    setKpiMetrics([...kpiMetrics, newMetric]);
  };

  const handleDeleteClick = (_id: string) => {
    const metric = kpiMetrics.find((m) => m._id === _id);
    if (metric) {
      setDeleteDialog({
        open: true,
        metricId: _id,
        metricName: `${metric.from} → ${metric.to}`,
      });
    }
  };

  const confirmDelete = () => {
    if (deleteDialog.metricId) {
      setKpiMetrics(
        kpiMetrics.filter((metric) => metric._id !== deleteDialog.metricId)
      );
    }
    setDeleteDialog({ open: false, metricId: null, metricName: "" });
  };

  const updateMetric = (
    _id: string,
    field: string,
    value: string | boolean | number
  ) => {
    setKpiMetrics((prevMetrics) =>
      prevMetrics.map((metric) => {
        if (metric._id === _id) {
          if (field in metric.value) {
            return {
              ...metric,
              value: {
                ...metric.value,
                [field]: value,
              },
            };
          }
          return { ...metric, [field]: value };
        }
        return metric;
      })
    );
  };

  const validateAndSetMetric = (_id: string, field: string, value: string) => {
    let newValue: number | string = value;
    if (value === "") {
      newValue = 0;
    } else {
      newValue = parseFloat(value);
      if (isNaN(newValue)) {
        return;
      }
    }

    setKpiMetrics((prevMetrics) =>
      prevMetrics.map((metric) => {
        if (metric._id === _id) {
          if (field in metric.value) {
            return {
              ...metric,
              value: {
                ...metric.value,
                [field]: newValue,
              },
            };
          }
        }
        return metric;
      })
    );
  };

  const getFieldError = (metric: KpiMetric, field: string) => {
    const target = metric.value.target;
    const minorDelay = metric.value.good;
    const significantDelay = metric.value.average;

    if (field === "target" && (isNaN(target) || target < 0)) {
      return "Invalid value";
    }

    if (field === "good" && (isNaN(minorDelay) || minorDelay <= target)) {
      return "Must be > Target";
    }

    if (
      field === "average" &&
      (isNaN(significantDelay) || significantDelay <= minorDelay)
    ) {
      return "Must be > Minor Delay";
    }

    return "";
  };

  const hasErrors = kpiMetrics.some(
    (metric) =>
      getFieldError(metric, "target") ||
      getFieldError(metric, "good") ||
      getFieldError(metric, "average") ||
      !metric.from ||
      !metric.to
  );

  const getInPlantMetrics = async () => {
    const response = await httpsGet(
      "inplant_dashboard_settings/get",
      0,
      router
    );
    if (response.statusCode === 200) {
      const inPlantMetricsData = response?.data;
      if (inPlantMetricsData?.length) {
        const transformedData = inPlantMetricsData.map((item: any) => ({
          ...item,
          value: {
            target: item.value.target,
            good: item.value.good,
            average: item.value.average,
          },
          isNew: false,
        }));
        setKpiMetrics(transformedData);
      }
    }
  };

  const editInPlantMetrics = async () => {
    const payload = kpiMetrics.map((metric) => {
      const { _id, isNew, value, ...rest } = metric;
      const basePayload = {
        from: rest.from,
        to: rest.to,
        target: value.target,
        good: value.good,
        average: value.average,
        poor: 0,
        active: rest.active,
      };

      return isNew ? basePayload : { ...basePayload, inplant_setting_id: _id };
    });

    const response = await httpsPost(
      "inplant_dashboard_settings/add/edit",
      payload,
      router,
      0
    );
    if (response.statusCode === 200) {
      showMessage("In-Plant Metrics Configuration Success", "success");
      getInPlantMetrics();
    } else {
      showMessage("In-Plant Metrics Configuration Failed", "error");
    }
  };

  useEffect(() => {
    getInPlantMetrics();
  }, []);

  return (
    <>
      <Box sx={{ mx: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontSize: "14px", mb: 2 }}
            >
              Performance Legend
            </Typography>
            <Grid container spacing={2} alignItems="stretch">
              {[
                {
                  color: "#4caf50",
                  label: "On Time",
                  description: "< Target time (no threshold required)",
                },
                {
                  color: "#ff9800",
                  label: "Minor Delay",
                  description:
                    "Occurs when the actual time exceeds the target time but is within the configured Minor Delay threshold (in hours) of the target time.",
                },
                {
                  color: "#ff5722",
                  label: "Significant Delay",
                  description:
                    "Occurs when the actual time exceeds the Minor Delay threshold but is less than or equal to the Significant Delay threshold (both configured as hours).",
                },
                {
                  color: "#f44336",
                  label: "Severe Delay",
                  description:
                    "Occurs when the actual time exceeds the Significant Delay threshold.",
                },
              ].map((item, idx) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  key={item.label}
                  sx={{ display: "flex" }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      flex: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: item.color,
                          borderRadius: "50%",
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, fontSize: "14px" }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "14px" }}
                    >
                      {item.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontSize: "14px", mb: 2 }}
            >
              Event-to-Event Metrics Configuration
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "14px" }}
              >
                Configure performance metrics for monitoring event-to-event
                durations and their delay thresholds.
              </Typography>
            </Box>

            <TableContainer
              component={Paper}
              sx={{ border: "1px solid #e0e0e0" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "14px" }}
                    >
                      S.No.
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "14px" }}
                    >
                      From Event
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "14px" }}
                    >
                      To Event
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "14px" }}
                    >
                      Target (hours)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "14px" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: "#ff9800",
                            borderRadius: "50%",
                          }}
                        />
                        <span>Minor Delay (hours)</span>
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "14px" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: "#ff5722",
                            borderRadius: "50%",
                          }}
                        />
                        <span>Significant Delay (hours)</span>
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "14px" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: "#f44336",
                            borderRadius: "50%",
                          }}
                        />
                        <span>Severe Delay (hours)</span>
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "14px" }}
                    >
                      Active
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "14px" }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kpiMetrics.map((metric, idx) => (
                    <TableRow key={metric._id} hover>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 500, fontSize: "14px" }}
                      >
                        {idx + 1}
                      </TableCell>
                      <TableCell align="center">
                        <FormControl sx={{ minWidth: 180 }} size="small">
                          <Select
                            value={metric.from}
                            onChange={(e) =>
                              updateMetric(metric._id, "from", e.target.value)
                            }
                            displayEmpty
                            inputProps={{ "aria-label": "Without label" }}
                            sx={{
                              fontSize: "14px",
                              textAlign: "left",
                              "& .MuiSelect-select": {
                                p: 1.5,
                              },
                            }}
                            error={!metric.from}
                          >
                            <MenuItem value="">
                              <em>Select from event</em>
                            </MenuItem>
                            {EventOptions.filter((opt) => opt.value !== "").map(
                              (option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <FormControl sx={{ minWidth: 180 }} size="small">
                          <Select
                            value={metric.to}
                            onChange={(e) =>
                              updateMetric(metric._id, "to", e.target.value)
                            }
                            displayEmpty
                            inputProps={{ "aria-label": "Without label" }}
                            sx={{
                              fontSize: "14px",
                              textAlign: "left",
                              "& .MuiSelect-select": {
                                p: 1.5,
                              },
                            }}
                            error={!metric.to}
                          >
                            <MenuItem value="">
                              <em>Select to event</em>
                            </MenuItem>
                            {EventOptions.filter((opt) => opt.value !== "").map(
                              (option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          size="small"
                          type="text"
                          value={
                            isNaN(metric.value.target) ? "" : metric.value.target
                          }
                          onChange={(e) =>
                            validateAndSetMetric(
                              metric._id,
                              "target",
                              e.target.value
                            )
                          }
                          error={!!getFieldError(metric, "target")}
                          helperText={getFieldError(metric, "target")}
                          sx={{
                            width: 100,
                            "& .MuiInputBase-root": {
                              height: "40px",
                              fontSize: "14px",
                              textAlign: "center",
                            },
                          }}
                          inputProps={{ style: { textAlign: "center" } }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          size="small"
                          type="text"
                          value={
                            isNaN(metric.value.good) ? "" : metric.value.good
                          }
                          onChange={(e) =>
                            validateAndSetMetric(
                              metric._id,
                              "good",
                              e.target.value
                            )
                          }
                          error={!!getFieldError(metric, "good")}
                          helperText={getFieldError(metric, "good")}
                          sx={{
                            width: 100,
                            "& .MuiInputBase-root": {
                              height: "40px",
                              fontSize: "14px",
                              textAlign: "center",
                            },
                          }}
                          inputProps={{ style: { textAlign: "center" } }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          size="small"
                          type="text"
                          value={
                            isNaN(metric.value.average) ? "" : metric.value.average
                          }
                          onChange={(e) =>
                            validateAndSetMetric(
                              metric._id,
                              "average",
                              e.target.value
                            )
                          }
                          error={!!getFieldError(metric, "average")}
                          helperText={getFieldError(metric, "average")}
                          sx={{
                            width: 100,
                            "& .MuiInputBase-root": {
                              height: "40px",
                              fontSize: "14px",
                              textAlign: "center",
                            },
                          }}
                          inputProps={{ style: { textAlign: "center" } }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {metric.value.average >= metric.value.good &&
                          metric.value.good >= metric.value.target &&
                          !isNaN(metric.value.average) && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                justifyContent: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  bgcolor: "#f44336",
                                  borderRadius: "50%",
                                }}
                              />
                              <span>&gt; Significant Delay</span>
                            </Box>
                          )}
                        {!(
                          metric.value.average >= metric.value.good &&
                          metric.value.good >= metric.value.target &&
                          !isNaN(metric.value.average)
                        ) && "-"}
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={metric.active}
                          onChange={(e) =>
                            updateMetric(metric._id, "active", e.target.checked)
                          }
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(metric._id)}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: "center", py: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addKpiMetric}
                        sx={{
                          borderStyle: "dashed",
                          color: "text.secondary",
                          borderColor: "grey.300",
                          fontSize: "14px",
                          "&:hover": {
                            borderColor: "grey.400",
                            bgcolor: "grey.50",
                          },
                        }}
                      >
                        Add New Event-to-Event Metric
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Dialog
            open={deleteDialog.open}
            onClose={() =>
              setDeleteDialog({ open: false, metricId: null, metricName: "" })
            }
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontSize: "14px" }}>
              Delete Performance Metric
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ fontSize: "14px" }}>
                Are you sure you want to delete the metric &quot;
                {deleteDialog.metricName}&quot;? This action cannot be undone
                and will remove all associated performance data.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() =>
                  setDeleteDialog({
                    open: false,
                    metricId: null,
                    metricName: "",
                  })
                }
                color="inherit"
                sx={{ fontSize: "14px" }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                color="error"
                variant="contained"
                sx={{ fontSize: "14px" }}
              >
                Delete Metric
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
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
              onClick={() => editInPlantMetrics()}
              disabled={hasErrors}
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
    </>
  );
}