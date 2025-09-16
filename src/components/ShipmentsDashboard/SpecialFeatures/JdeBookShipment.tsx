import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Radio,
  FormControlLabel,
  Checkbox,
  TextField,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { httpsPost } from "@/utils/Communication";
import { DateTime } from "luxon";
import dayjs from "dayjs";
import { useSnackbar } from "@/hooks/snackBar";
import styles from "./JdeBookShipment.module.css";
import { X } from "lucide-react";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";

interface JdeBookShipmentProps {
  open: boolean;
  onClose: () => void;
  ltl: boolean;
  onSuccess: () => void;
}

interface TransporterData {
  transporterCode: string;
  transporterName: string;
  vehicle_type: string;
  serialNumbers: string[];
}

interface SerialData {
  serialNumber: string;
  invoiceNumbers: string[];
}

const JdeBookShipment: React.FC<JdeBookShipmentProps> = ({
  open,
  onClose,
  ltl,
  onSuccess,
}) => {
  const { showMessage } = useSnackbar();
  const [isUnplanned, setIsUnplanned] = useState<boolean>(true);
  const [pickupDate, setPickupDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [searchLoader, setSearchLoader] = useState<boolean>(false);
  const [searchFlag, setSearchFlag] = useState<boolean>(false);
  const [submitFlag, setSubmitFlag] = useState<boolean>(false);
  const [isBackToPickup, setIsBackToPickup] = useState<boolean>(false);

  const [dataToShow, setDataToShow] = useState<TransporterData[]>([]);
  const [invoicesToShow, setInvoicesToShow] = useState<SerialData[]>([]);
  const [selectedTransporter, setSelectedTransporter] = useState<string>("");
  const [selectedSerial, setSelectedSerial] = useState<string>("");
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(
    new Set()
  );

  const serialNumbers =
    dataToShow.find((t) => t.transporterCode === selectedTransporter)
      ?.serialNumbers || [];
  const invoices =
    invoicesToShow.find((s) => s.serialNumber === selectedSerial)
      ?.invoiceNumbers || [];
  const invoiceForUnplanned = isUnplanned;

  const handleSearch = async () => {
    if (!pickupDate) {
      showMessage("Please select a date", "error");
      return;
    }

    setSearchLoader(true);
    setSearchFlag(false);
    setSubmitFlag(false);
    setLoading(true);

    const url = isUnplanned
      ? "jde/unplannedShipment/fetch"
      : "jde/secondaryShipment/fetch";

    try {
      const payload = {
        pickup_date: pickupDate.toISOString(),
      };

      const response = await httpsPost(url, payload);

      if (response.statusCode === 200) {
        const result = response.data;
        const formattedData = result.map((item: any) => ({
          transporterCode: item.transporterCode,
          transporterName: item.transporterName,
          vehicle_type: item.vehicle_type,
          serialNumbers: item.serialNumbers,
        }));

        setDataToShow(formattedData);

        if (formattedData.length > 0) {
          setSelectedTransporter(formattedData[0].transporterCode);
          setSearchFlag(true);
        } else {
          showMessage("No Shipment Present for this date!", "warning");
        }
      }
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Error fetching data",
        "error"
      );
      onClose();
    } finally {
      setSearchLoader(false);
      setLoading(false);
    }
  };

  const handleSubmitSearch = async () => {
    if (!pickupDate) {
      showMessage("Please select a date", "error");
      return;
    }

    setLoading(true);
    const url = isUnplanned
      ? "jde/unplannedShipment/fetch"
      : "jde/secondaryShipment/fetch";

    try {
      const payload = {
        pickup_date: DateTime.fromJSDate(pickupDate).toFormat("dd/MM/yyyy"),
        transporters: dataToShow
          .filter((transporter) =>
            transporter.serialNumbers.some((sn) => selectedSerials.has(sn))
          )
          .map((transporter) => ({
            transporterCode: transporter.transporterCode,
            transporterName: transporter.transporterName,
            serialNumbers: transporter.serialNumbers.filter((sn) =>
              selectedSerials.has(sn)
            ),
          })),
      };

      const response = await httpsPost(url, payload);

      if (response.statusCode === 200) {
        const result = response.data;
        const formattedData = result.map((item: any) => ({
          serialNumber: item.serialNumber,
          invoiceNumbers: item.invoiceNumbers,
        }));

        setInvoicesToShow(formattedData);

        if (formattedData.length > 0) {
          setSelectedSerial(formattedData[0].serialNumber);
          setSubmitFlag(true);
        }
      }
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Error submitting search",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookShipment = async () => {
    if (!pickupDate) {
      showMessage("Please select a date", "error");
      return;
    }

    setLoading(true);
    const url = invoiceForUnplanned
      ? "/v1/jde/unplannedShipment/bookShipment"
      : "/v1/jde/secondaryShipment/bookShipment";

    try {
      const payload = {
        pickup_date: DateTime.fromJSDate(pickupDate).toFormat("dd/MM/yyyy"),
        is_back_to_pickup: isBackToPickup,
        transporters: dataToShow
          .filter((transporter) =>
            transporter.serialNumbers.some((sn) => selectedSerials.has(sn))
          )
          .map((transporter) => ({
            transporterCode: transporter.transporterCode,
            transporterName: transporter.transporterName,
            vehicle_type: transporter.vehicle_type,
            serialNumbers: transporter.serialNumbers.filter((sn) =>
              selectedSerials.has(sn)
            ),
          })),
      };

      const response = await httpsPost(url, payload);

      if (response.statusCode === 200) {
        showMessage("Shipment Booked!", "success");
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Error booking shipment",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTransporter = (transporterCode: string) => {
    setSelectedTransporter(transporterCode);
  };

  const handleSelectSerial = (serialNumber: string) => {
    setSelectedSerial(serialNumber);
  };

  const handleToggleSerial = (serialNumber: string) => {
    const newSelectedSerials = new Set(selectedSerials);
    if (newSelectedSerials.has(serialNumber)) {
      newSelectedSerials.delete(serialNumber);
    } else {
      newSelectedSerials.add(serialNumber);
    }
    setSelectedSerials(newSelectedSerials);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allSerials = new Set<string>();
      dataToShow.forEach((transporter) => {
        transporter.serialNumbers.forEach((serial) => allSerials.add(serial));
      });
      setSelectedSerials(allSerials);
    } else {
      setSelectedSerials(new Set());
    }
  };

  const handleClose = () => {
    setDataToShow([]);
    setInvoicesToShow([]);
    setSelectedTransporter("");
    setSelectedSerial("");
    setSelectedSerials(new Set());
    setSearchFlag(false);
    setSubmitFlag(false);
    setPickupDate(new Date());
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.container}
      // style={{maxWidth: "400px"}}
    >
      <ModalHeader title="Fetch & Book Shipment`s" onClose={onClose} />

      <DialogContent>
        <Box className={styles.header}>
          <FormControlLabel
            control={
              <Radio
                checked={isUnplanned}
                onChange={() => setIsUnplanned(true)}
                value="unplanned"
                name="shipment-type"
                color="primary"
              />
            }
            label="Unplanned Shipment"
          />
          <FormControlLabel
            control={
              <Radio
                checked={!isUnplanned}
                onChange={() => setIsUnplanned(false)}
                value="secondary"
                name="shipment-type"
                color="primary"
              />
            }
            label="Secondary Shipment"
          />
        </Box>

        <div className={styles.datePickerContainer}>
          <DatePicker
            style={{ width: "200px", marginRight: "8px", height: "40px" }}
            placeholder="Select Pickup Date"
            value={pickupDate ? dayjs(pickupDate) : null}
            onChange={(date) => setPickupDate(date ? date.toDate() : null)}
            format="DD/MM/YYYY"
            popupStyle={{ zIndex: 99999 }}
          />
          <button
            // type="primary"
            // icon={<SearchOutlined />}
            onClick={handleSearch}
            // loading={searchLoader}
            disabled={loading || searchLoader}
            className={styles.searchButton}
          >
            {searchLoader ? <CircularProgress size={24} /> : "Search"}
          </button>
        </div>

        {searchFlag && !submitFlag && (
          <>
            <Box className={styles.contentBox}>
              <Typography variant="subtitle1" gutterBottom>
                Select Serial Numbers
              </Typography>
              <Box className={styles.serialList}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        serialNumbers.length > 0 &&
                        serialNumbers.every((sn) => selectedSerials.has(sn))
                      }
                      onChange={(e) => {
                        const newSelectedSerials = new Set(selectedSerials);
                        if (e.target.checked) {
                          serialNumbers.forEach((sn) =>
                            newSelectedSerials.add(sn)
                          );
                        } else {
                          serialNumbers.forEach((sn) =>
                            newSelectedSerials.delete(sn)
                          );
                        }
                        setSelectedSerials(newSelectedSerials);
                      }}
                      size="small"
                    />
                  }
                  label="Select All"
                  className={styles.serialItem}
                />

                {serialNumbers.map((serial) => (
                  <Box key={serial} className={styles.serialItem}>
                    <Checkbox
                      checked={selectedSerials.has(serial)}
                      onChange={() => handleToggleSerial(serial)}
                      size="small"
                      className={styles.serialCheckbox}
                    />
                    <Typography className={styles.serialNumber}>
                      {serial}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box className={styles.submitButton}>
              <Button
                variant="contained"
                onClick={handleSubmitSearch}
                disabled={selectedSerials.size === 0}
              >
                Submit
              </Button>
            </Box>
          </>
        )}

        {submitFlag && (
          <>
            <Box className={styles.header}>
              <Typography variant="subtitle2">Serial Numbers</Typography>
              <Typography variant="subtitle2">Invoices</Typography>
            </Box>

            <Box className={styles.serialInvoicesContainer}>
              <Box className={styles.serialColumn}>
                {invoicesToShow.map((item) => (
                  <Box
                    key={item.serialNumber}
                    onClick={() => handleSelectSerial(item.serialNumber)}
                    className={`${styles.serialItemSelectable} ${
                      selectedSerial === item.serialNumber
                        ? styles.serialItemSelected
                        : ""
                    }`}
                  >
                    {item.serialNumber}
                  </Box>
                ))}
              </Box>

              <Box className={styles.invoiceColumn}>
                {invoices.length > 0 ? (
                  invoices.map((invoice, index) => (
                    <Box key={index} className={styles.invoiceItem}>
                      {invoice}
                    </Box>
                  ))
                ) : (
                  <Typography color="textSecondary">
                    No invoices available
                  </Typography>
                )}
              </Box>
            </Box>

            <Box className={styles.footer}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isBackToPickup}
                    onChange={(e) => setIsBackToPickup(e.target.checked)}
                  />
                }
                label="Make First Pickup as Last Delivery"
              />

              <Button
                variant="contained"
                onClick={handleBookShipment}
                disabled={loading}
              >
                {loading ? "Processing..." : "Book Shipment"}
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JdeBookShipment;
