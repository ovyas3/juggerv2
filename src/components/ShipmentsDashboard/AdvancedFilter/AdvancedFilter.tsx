import React, { useState } from "react";
import styles from "./AdvancedFilter.module.css";
import {
  TextField,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  InputAdornment,
  SelectChangeEvent,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";

// --- Interfaces ---
interface Organisation {
  _id: string;
  name: string;
}
interface Material {
  _id: string;
  name: string;
}
interface Location {
  _id: string;
  name: string;
  area: string;
}
interface Carrier {
  _id: string;
  parent_name: string;
  name: string;
}
interface Segmentation {
  _id: string;
  name: string;
}
interface ShipStatus {
  value: string;
  name: string;
}

interface AdvancedFilterProps {
  userType: string;
  organizations: Organisation[];
  materialsArray: Material[];
  allCarriers: Carrier[];
  segmentations: Segmentation[];
  pickLocations: Location[];
  deliverLocations: Location[];
  shipStatus: ShipStatus[];
  onApply: (filters: Partial<FilterPayload>) => void;
  onClear: () => void;
  onClose: () => void;
}

interface FilterPayload {
  organizations: string[];
  materials: string[];
  invoice_no: string;
  lr_no: string;
  SIN: string;
  status: string[];
  project_code: string;
  ppd_no: string;
  pickups: string[];
  carriers: string[];
  commercial_invoice: boolean | null;
  deliveries: string[];
  from: string;
  to: string;
  trans_vehicle: boolean;
  sale_order: string;
  purchase_order: string;
  segmentations: string[];
  nonTracking: boolean;
  vehicle_no: string;
  mobile: string;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  userType,
  organizations = [],
  materialsArray = [],
  allCarriers = [],
  segmentations = [],
  pickLocations = [],
  deliverLocations = [],
  shipStatus = [],
  onApply,
  onClear,
  onClose,
}) => {
  // --- State for all filter values ---
  const [selectedOrganisation, setSelectedOrganisation] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [lrNumber, setLrNumber] = useState("");
  const [shipmentSin, setShipmentSin] = useState("");
  const [shipmentStatusValue, setShipmentStatusValue] = useState<string[]>([]);
  const [projectCode, setProjectCode] = useState("");
  const [ppdNo, setPpdNo] = useState("");
  const [selectedPickups, setSelectedPickups] = useState<string[]>([]);
  const [carrierSearch, setCarrierSearch] = useState("");
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [commercialInvoice, setCommercialInvoice] = useState<string>("");
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [transVehicle, setTransVehicle] = useState("");
  const [saleOrder, setSaleOrder] = useState("");
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [selectedSegmentations, setSelectedSegmentations] = useState<string[]>(
    []
  );
  const [nonTracking, setNonTracking] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [mobile, setMobile] = useState("");

  // --- Derived state for filtering dropdowns ---
  const filteredPickLocations = pickLocations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(filterFrom.toLowerCase()) ||
      loc.area.toLowerCase().includes(filterFrom.toLowerCase())
  );
  const filteredDeliverLocations = deliverLocations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(filterTo.toLowerCase()) ||
      loc.area.toLowerCase().includes(filterTo.toLowerCase())
  );
  const filteredCarriers = allCarriers.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(carrierSearch.toLowerCase()) ||
      carrier.parent_name.toLowerCase().includes(carrierSearch.toLowerCase())
  );

  // --- Event Handlers ---
  const handleApply = () => {
    const filters: Partial<FilterPayload> = {
      organizations: selectedOrganisation ? [selectedOrganisation] : undefined,
      materials: selectedMaterials.length > 0 ? selectedMaterials : undefined,
      invoice_no: invoiceNo || undefined,
      lr_no: lrNumber || undefined,
      SIN: shipmentSin || undefined,
      status: shipmentStatusValue.length > 0 ? shipmentStatusValue : undefined,
      project_code: projectCode || undefined,
      ppd_no: ppdNo || undefined,
      pickups: selectedPickups.length > 0 ? selectedPickups : undefined,
      carriers: selectedCarriers.length > 0 ? selectedCarriers : undefined,
      commercial_invoice:
        commercialInvoice === "" ? undefined : commercialInvoice === "true",
      deliveries:
        selectedDeliveries.length > 0 ? selectedDeliveries : undefined,
      from: fromDate?.toISOString() || undefined,
      to: toDate?.toISOString() || undefined,
      trans_vehicle: transVehicle === "Trans" ? true : undefined,
      sale_order: saleOrder || undefined,
      purchase_order: purchaseOrder || undefined,
      segmentations:
        selectedSegmentations.length > 0 ? selectedSegmentations : undefined,
      nonTracking:
        nonTracking === "" ? undefined : nonTracking === "Not Tracking",
      vehicle_no: vehicleNo || undefined,
      mobile: mobile || undefined,
    };

    // Create a new object with only the defined properties
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined)
    ) as Partial<FilterPayload>;

    onApply(cleanFilters);
  };

  const handleClear = () => {
    setSelectedOrganisation("");
    setSelectedMaterials([]);
    setInvoiceNo("");
    setLrNumber("");
    setShipmentSin("");
    setShipmentStatusValue([]);
    setProjectCode("");
    setPpdNo("");
    setSelectedPickups([]);
    setCarrierSearch("");
    setSelectedCarriers([]);
    setCommercialInvoice("");
    setSelectedDeliveries([]);
    setFromDate(null);
    setToDate(null);
    setTransVehicle("");
    setSaleOrder("");
    setPurchaseOrder("");
    setSelectedSegmentations([]);
    setNonTracking("");
    setFilterFrom("");
    setFilterTo("");
    setVehicleNo("");
    setMobile("");
    onClear();
  };

  // Generic handler for multi-select dropdowns
  const handleMultiSelectChange = (
    event: SelectChangeEvent<string[]>,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const {
      target: { value },
    } = event;
    setter(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className={styles.advancedSearchSection}>
        <div className={styles.searchHeader}>
          <span>Advanced Filter</span>
          <button onClick={onClose} className={styles.closeBtn}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.searchBody}>
          <div className={styles.filterSection}>
            <label className={styles.label}>Material</label>
            <Select
              multiple
              value={selectedMaterials}
              onChange={(e) =>
                handleMultiSelectChange(
                  e as SelectChangeEvent<string[]>,
                  setSelectedMaterials
                )
              }
              className={styles.inputSelect}
              renderValue={(selected) => `${selected.length} selected`}
              displayEmpty
            >
              {materialsArray.map((material) => (
                <MenuItem key={material._id} value={material._id}>
                  <Checkbox
                    checked={selectedMaterials.indexOf(material._id) > -1}
                  />
                  <ListItemText primary={material.name} />
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Invoice</label>
            <input
              type="text"
              className={styles.inputField}
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </div>
          <div className={styles.filterSection}>
            <label className={styles.label}>LR No</label>
            <input
              type="text"
              className={styles.inputField}
              value={lrNumber}
              onChange={(e) => setLrNumber(e.target.value)}
            />
          </div>
          <div className={styles.filterSection}>
            <label className={styles.label}>SIN</label>
            <input
              type="text"
              className={styles.inputField}
              value={shipmentSin}
              onChange={(e) => setShipmentSin(e.target.value)}
            />
          </div>
          <div className={styles.filterSection}>
            <label className={styles.label}>Vehicle No</label>
            <input
              type="text"
              className={styles.inputField}
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
            />
          </div>
          <div className={styles.filterSection}>
            <label className={styles.label}>Mobile</label>
            <input
              type="text"
              className={styles.inputField}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Shipment Status</label>
            <Select
              multiple
              value={shipmentStatusValue}
              onChange={(e) =>
                handleMultiSelectChange(
                  e as SelectChangeEvent<string[]>,
                  setShipmentStatusValue
                )
              }
              className={styles.inputSelect}
              renderValue={(selected) => `${selected.length} selected`}
              displayEmpty
            >
              {shipStatus.map((status) => (
                <MenuItem key={status.value} value={status.name}>
                  <Checkbox
                    checked={shipmentStatusValue.indexOf(status.name) > -1}
                  />
                  <ListItemText primary={status.name} />
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Project Code</label>
            <input
              type="text"
              className={styles.inputField}
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
            />
          </div>
          <div className={styles.filterSection}>
            <label className={styles.label}>PPD</label>
            <input
              type="text"
              className={styles.inputField}
              value={ppdNo}
              onChange={(e) => setPpdNo(e.target.value)}
            />
          </div>
          <div className={styles.filterSection}>
            <label className={styles.label}>Sale Order</label>
            <input
              type="text"
              className={styles.inputField}
              value={saleOrder}
              onChange={(e) => setSaleOrder(e.target.value)}
            />
          </div>
          <div className={styles.filterSection}>
            <label className={styles.label}>Purchase Order</label>
            <input
              type="text"
              className={styles.inputField}
              value={purchaseOrder}
              onChange={(e) => setPurchaseOrder(e.target.value)}
            />
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Pickup Locations</label>
            <Select
              multiple
              value={selectedPickups}
              onChange={(e) =>
                handleMultiSelectChange(
                  e as SelectChangeEvent<string[]>,
                  setSelectedPickups
                )
              }
              className={styles.inputSelect}
              renderValue={(selected) => `${selected.length} selected`}
              displayEmpty
            >
              <div className={styles.searchInputWrapper}>
                <input
                  type="text"
                  placeholder="Search..."
                  className={styles.searchInput}
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {filteredPickLocations.map((loc) => (
                <MenuItem key={loc._id} value={loc._id}>
                  <Checkbox checked={selectedPickups.indexOf(loc._id) > -1} />
                  <ListItemText primary={`${loc.name} - ${loc.area}`} />
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Delivery Locations</label>
            <Select
              multiple
              value={selectedDeliveries}
              onChange={(e) =>
                handleMultiSelectChange(
                  e as SelectChangeEvent<string[]>,
                  setSelectedDeliveries
                )
              }
              className={styles.inputSelect}
              renderValue={(selected) => `${selected.length} selected`}
              displayEmpty
            >
              <div className={styles.searchInputWrapper}>
                <input
                  type="text"
                  placeholder="Search..."
                  className={styles.searchInput}
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {filteredDeliverLocations.map((loc) => (
                <MenuItem key={loc._id} value={loc._id}>
                  <Checkbox
                    checked={selectedDeliveries.indexOf(loc._id) > -1}
                  />
                  <ListItemText primary={`${loc.name} - ${loc.area}`} />
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Carriers</label>
            <Select
              multiple
              value={selectedCarriers}
              onChange={(e) =>
                handleMultiSelectChange(
                  e as SelectChangeEvent<string[]>,
                  setSelectedCarriers
                )
              }
              className={`${styles.inputSelect} ${styles.carrierSelected}`}
              renderValue={(selected) => `${selected.length} selected`}
              displayEmpty
            >
              <div className={styles.searchInputWrapper}>
                <input
                  type="text"
                  placeholder="Search carriers"
                  className={styles.searchInput}
                  value={carrierSearch}
                  onChange={(e) => setCarrierSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {filteredCarriers.map((carrier) => (
                <MenuItem key={carrier._id} value={carrier._id}>
                  <Checkbox
                    checked={selectedCarriers.indexOf(carrier._id) > -1}
                  />
                  <ListItemText
                    primary={`${carrier.parent_name} - ${carrier.name}`}
                  />
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>From</label>
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              slots={{
                textField: (params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    className={styles.input}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarTodayIcon className={styles.dateIcon} />
                        </InputAdornment>
                      ),
                    }}
                  />
                ),
              }}
            />
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>To</label>
            <DatePicker
              value={toDate}
              onChange={setToDate}
              minDate={fromDate || undefined}
              slots={{
                textField: (params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    className={styles.input}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarTodayIcon className={styles.dateIcon} />
                        </InputAdornment>
                      ),
                    }}
                  />
                ),
              }}
            />
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Commercial Invoice</label>
            <Select
              value={commercialInvoice}
              onChange={(e) => setCommercialInvoice(e.target.value)}
              className={styles.inputSelect}
              displayEmpty
            >
              <MenuItem value="">
                <em>Select</em>
              </MenuItem>
              <MenuItem value="true">Present</MenuItem>
              <MenuItem value="false">Absent</MenuItem>
            </Select>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Trans Vehicle</label>
            <Select
              value={transVehicle}
              onChange={(e) => setTransVehicle(e.target.value)}
              className={styles.inputSelect}
              displayEmpty
            >
              <MenuItem value="">
                <em>Select</em>
              </MenuItem>
              <MenuItem value="Trans">Trans</MenuItem>
            </Select>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Tracking Status</label>
            <Select
              value={nonTracking}
              onChange={(e) => setNonTracking(e.target.value)}
              className={styles.inputSelect}
              displayEmpty
            >
              <MenuItem value="">
                <em>Select</em>
              </MenuItem>
              <MenuItem value="Tracking">Tracking</MenuItem>
              <MenuItem value="Not Tracking">Not Tracking</MenuItem>
            </Select>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Segmentation</label>
            <Select
              multiple
              value={selectedSegmentations}
              onChange={(e) =>
                handleMultiSelectChange(
                  e as SelectChangeEvent<string[]>,
                  setSelectedSegmentations
                )
              }
              className={styles.inputSelect}
              renderValue={(selected) => `${selected.length} selected`}
              displayEmpty
            >
              {segmentations.map((seg) => (
                <MenuItem key={seg._id} value={seg._id}>
                  <Checkbox
                    checked={selectedSegmentations.indexOf(seg._id) > -1}
                  />
                  <ListItemText primary={seg.name} />
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>

        <div className={styles.searchFooter}>
          <div className={styles.submitButton}>
            <button className={styles.button} onClick={handleApply}>
              Submit
            </button>
          </div>
          <div className={styles.submitButtonClear}>
            <button className={styles.button} onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default AdvancedFilter;
