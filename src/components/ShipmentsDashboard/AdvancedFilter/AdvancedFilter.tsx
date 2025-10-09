import React, { useState, useMemo,useEffect } from "react";
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
import {  LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { httpsGet, httpsPost } from "@/utils/Communication";
import {MultiSelect} from "../../UI/MultiSelect/MultiSelect";
// --- Interfaces ---
interface Organisation {
  _id: string;
  name: string;
}
interface AdvancedFilterProps {
  // ... existing props
  limit?: number; // Add this line
  skip?: number;  // Add this line
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

  pickLocations: Location[];
  segmentations?: Segmentation[];
  deliverLocations: Location[];
  shipStatus: ShipStatus[];
  odcFilter: boolean;
  onApply: (filters: Partial<FilterPayload>) => void;
  onClear: () => void;
  onClose: () => void;
}

interface FilterPayload {
  organizations: string[];
  materials: string[];
  invoice_no: string;
  limit: number; // Add this line
  skip: number; 
  lr_no: string;
  SIN: string;
  status: string[];
  project_code: string;
  ppd_no: string;
  pickups: string[];
  carriers: string[];
  from: string | number; // Change from: string to from: string | number
  to: string | number; 
  commercial_invoice: boolean | null;
  deliveries: string[];
  odc: boolean;
  // from: string;
  // to: string;
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
  odcFilter,
  limit,
  skip,
}) => {
  console.log("Materials Array received in AdvancedFilter:", materialsArray);
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
  // const [fromDate, setFromDate] = useState<Date | null>(null);
  // const [toDate, setToDate] = useState<Date | null>(null);
  const [transVehicle, setTransVehicle] = useState("");
  const [saleOrder, setSaleOrder] = useState("");
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [fetchedSegmentations, setFetchedSegmentations] = useState<Segmentation[]>([]);
  const [selectedSegmentations, setSelectedSegmentations] = useState<string[]>(
    []
  );
  const [nonTracking, setNonTracking] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [mobile, setMobile] = useState("");
  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
  useEffect(() => {
    const fetchFilterOptions = async () => {
      // setIsFetchingFilters(true);
      
      // Pass the selected organization ID as a query parameter if available
      const query = selectedOrganisation ? { organization: selectedOrganisation } : {};

      try {
        const response = await httpsGet("order/get_filters", 4); // Assuming '5' is the correct API tier

        if (!response.ok) {
          throw new Error(`Failed to fetch filter options: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.data) {
          // 1. Segmentation
          if (data.data.segmentations) setFetchedSegmentations(data.data.segmentations);
          
          // 2. Materials
       
        }

      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        // setIsFetchingFilters(false);
      }
    };

    fetchFilterOptions();
    
    // Rerun if the selectedOrganisation changes to fetch specific materials/locations for that org
  }, 
  // [selectedOrganisation]

  [] ); 
  // Shipment Status options: value = ABBR sent to backend, name = Full text shown in UI
const SHIP_STATUS: { value: string; name: string }[] = [
  { value: "PNDG", name: "Pending" },
  { value: "ASGND", name: "Assigned" },
  { value: "ACPTD", name: "Accepted" },
  { value: "TWP", name: "Towards Pickup" },
  { value: "ATPU", name: "At Pickup" },
  { value: "ITNS", name: "In Transit" },
  { value: "ABTR", name: "About to Reach" },
  { value: "ATDL", name: "At Delivery" },
  { value: "CMPL", name: "Completed" },
  { value: "CANC", name: "Cancelled" },
];

// Helpful for rendering selected names (if you want to show names in chips, etc.)
const STATUS_NAME_BY_VALUE = Object.fromEntries(
  SHIP_STATUS.map(s => [s.value, s.name])
);

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
  const materialOptions = useMemo(
    () =>
      materialsArray.map((m) => ({
        id: m._id,
        label: m.name,
        selected: selectedMaterials.includes(m._id),
      })),
    [materialsArray, selectedMaterials]
  );
  
  const carrierOptions = useMemo(
    () =>
      allCarriers.map((c) => ({
        id: c._id,
        label: `${c.parent_name} - ${c.name}`,
        selected: selectedCarriers.includes(c._id),
      })),
    [allCarriers, selectedCarriers]
  );
  
  const pickupOptions = useMemo(
    () =>
      pickLocations.map((loc) => ({
        id: loc._id,
        label: `${loc.name} - ${loc.area}`,
        selected: selectedPickups.includes(loc._id),
      })),
    [pickLocations, selectedPickups]
  );
  
  const deliveryOptions = useMemo(
    () =>
      deliverLocations.map((loc) => ({
        id: loc._id,
        label: `${loc.name} - ${loc.area}`,
        selected: selectedDeliveries.includes(loc._id),
      })),
    [deliverLocations, selectedDeliveries]
  );
  const onMaterialsChange = (opts: { id: string; selected: boolean }[]) =>
    setSelectedMaterials(opts.filter(o => o.selected).map(o => o.id));
  
  const onCarriersChange = (opts: { id: string; selected: boolean }[]) =>
    setSelectedCarriers(opts.filter(o => o.selected).map(o => o.id));
  
  const onPickupsChange = (opts: { id: string; selected: boolean }[]) =>
    setSelectedPickups(opts.filter(o => o.selected).map(o => o.id));
  
  const onDeliveriesChange = (opts: { id: string; selected: boolean }[]) =>
    setSelectedDeliveries(opts.filter(o => o.selected).map(o => o.id));
  
  // Add this mapping to your component file, outside the main function
const statusMapping: Record<string, string> = {
  "Pending": "PNDG",
  "Assigned": "ASN",
  "Accepted": "ACPT",
  "Towards Pickup": "SP",
  "At Pickup": "AP",
  "In Transit": "ITNS",
  "About to Reach": "ABTR",
  "At Delivery": "ALD",
  "Completed": "CPTD",
  "Cancelled": "CNCL",
};

  // --- Event Handlers ---
  // const handleApply = () => {
  //   const filters: Partial<FilterPayload> = {
  //     organizations: selectedOrganisation ? [selectedOrganisation] : undefined,
  //     materials: selectedMaterials.length > 0 ? selectedMaterials : undefined,
  //     invoice_no: invoiceNo || undefined,
  //     lr_no: lrNumber || undefined,
  //     SIN: shipmentSin || undefined,
  //     status: shipmentStatusValue.length > 0 ? shipmentStatusValue : undefined,
  //     project_code: projectCode || undefined,
  //     ppd_no: ppdNo || undefined,
  //     pickups: selectedPickups.length > 0 ? selectedPickups : undefined,
  //     carriers: selectedCarriers.length > 0 ? selectedCarriers : undefined,
  //     commercial_invoice:
  //       commercialInvoice === "" ? undefined : commercialInvoice === "true",
  //     deliveries:
  //       selectedDeliveries.length > 0 ? selectedDeliveries : undefined,
  //     from: fromDate?.toISOString() || undefined,
  //     to: toDate?.toISOString() || undefined,
  //     trans_vehicle: transVehicle === "Trans" ? true : undefined,
  //     sale_order: saleOrder || undefined,
  //     purchase_order: purchaseOrder || undefined,
  //     segmentations:
  //       selectedSegmentations.length > 0 ? selectedSegmentations : undefined,
  //     nonTracking:
  //       nonTracking === "" ? undefined : nonTracking === "Not Tracking",
  //     vehicle_no: vehicleNo || undefined,
  //     mobile: mobile || undefined,
  //   };

  //   // Create a new object with only the defined properties
  //   const cleanFilters = Object.fromEntries(
  //     Object.entries(filters).filter(([, v]) => v !== undefined)
  //   ) as Partial<FilterPayload>;

  //   onApply(cleanFilters);
  // };
 // ... (rest of your component code)

const handleApply = async () => {
  // Construct the payload based on selected filters
  const mappedStatus = shipmentStatusValue.map(statusName => statusMapping[statusName]);
  const payload: Partial<FilterPayload> = {
      organizations: selectedOrganisation ? [selectedOrganisation] : undefined,
      limit, // Add limit from props
      skip,
      materials: selectedMaterials.length > 0 ? selectedMaterials : undefined,
      invoice_no: invoiceNo || undefined,
      lr_no: lrNumber || undefined,
      SIN: shipmentSin || undefined,
      // status: shipmentStatusValue.length > 0 ? shipmentStatusValue : undefined,
      status: mappedStatus.length > 0 ? mappedStatus : undefined,
      project_code: projectCode || undefined,
      ppd_no: ppdNo || undefined,
      pickups: selectedPickups.length > 0 ? selectedPickups : undefined,
      carriers: selectedCarriers.length > 0 ? selectedCarriers : undefined,
      commercial_invoice: commercialInvoice === "" ? undefined : commercialInvoice === "true",
      deliveries: selectedDeliveries.length > 0 ? selectedDeliveries : undefined,
      // Convert Day.js objects to ISO string or Unix timestamp (milliseconds) for the API
      from: fromDate ? fromDate.unix() * 1000 : undefined, // Unix timestamp in milliseconds
      to: toDate ? toDate.endOf('day').unix() * 1000 : undefined, // End of the day for 'to' date
      trans_vehicle: transVehicle === "Trans" ? true : undefined,
      sale_order: saleOrder || undefined,
      purchase_order: purchaseOrder || undefined,
      segmentations: selectedSegmentations.length > 0 ? selectedSegmentations : undefined,
      nonTracking: nonTracking === "" ? undefined : nonTracking === "Not Tracking",
      vehicle_no: vehicleNo || undefined,
      mobile: mobile || undefined,
      odc: odcFilter,
      // You may need to add limit, skip, and other default values here
      // limit: 25,
      // skip: 0,
      // odc: false,
  };

  // Remove undefined properties to send a clean payload
  const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
  );

  console.log("Payload being sent:", cleanPayload);

  const API_URL = 'https://dev-api.instavans.com/api/thor/v2/shipment/many';

  try {
    const response = await httpsPost("shipment/many", cleanPayload, {}, 5);
    if (response.statusCode === 200) { // Assuming a successful response structure
      console.log("API response received successfully. Calling onApply with payload.");
      onApply(cleanPayload); // <--- THIS IS THE CRITICAL FIX
    }

      if (!response.ok) {
          // Handle HTTP errors
          const errorText = await response.text();
          throw new Error(`API call failed with status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("API response received:", data);

      // Pass the received data to the onApply prop for the parent component to handle
      onApply(cleanPayload); 
  } catch (error) {
      console.error("Error applying filters:", error);
      // You could also set a state to show an error message to the user
  }
  onClose();
};

// ... (rest of your component code)

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
            {/* <Select
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
            </Select> */}
            <MultiSelect
  label="Select materials"
  options={materialOptions}
  onChange={onMaterialsChange}
/>

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
              {/* {shipStatus.map((status) => ( */}
              {SHIP_STATUS.map((status) => (
                <MenuItem key={status.value} value={status.name} className={styles.carrierMenuItem}>
                  <Checkbox
                    checked={shipmentStatusValue.indexOf(status.name) > -1}
                    className={styles.smallCheckbox}
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
            {/* <Select
              multiple
              value={selectedPickups}
              onChange={(e) =>
                handleMultiSelectChange(
                  e as SelectChangeEvent<string[]>,
                  setSelectedPickups
                )
              }
              // className={styles.inputSelect}
              className={`${styles.inputSelect} ${styles.pickupSelected}`}
              renderValue={(selected) => `${selected.length} selected`}
              displayEmpty
              MenuProps={{
                classes: {
                  paper: styles.carrierDropdownPaper,
                },
              }}
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
                <MenuItem key={loc._id} value={loc._id} className={styles.carrierMenuItem}>
                  <Checkbox checked={selectedPickups.indexOf(loc._id) > -1}
                     className={styles.smallCheckbox} />
                  <ListItemText primary={`${loc.name} - ${loc.area}`}   classes={{
                      primary: styles.carrierMenuItemText,
                    }} />
                </MenuItem>
              ))}
            </Select> */}
            <MultiSelect
  label="Select pickup locations"
  options={pickupOptions}
  onChange={onPickupsChange}
/>

          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Delivery Locations</label>
            {/* <Select
              multiple
              value={selectedDeliveries}
              onChange={(e) =>
                handleMultiSelectChange(
                  e as SelectChangeEvent<string[]>,
                  setSelectedDeliveries
                )
              }
              // className={styles.inputSelect}
              className={`${styles.inputSelect} ${styles.deliverySelected}`}
              renderValue={(selected) => `${selected.length} selected`}
              displayEmpty
              MenuProps={{
                classes: {
                  paper: styles.carrierDropdownPaper,
                },
              }}
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
                <MenuItem key={loc._id} value={loc._id} className={styles.carrierMenuItem}>
                  <Checkbox
                     className={styles.smallCheckbox}
                    checked={selectedDeliveries.indexOf(loc._id) > -1}
                  />
                  <ListItemText primary={`${loc.name} - ${loc.area}`}   classes={{
                      primary: styles.carrierMenuItemText,
                    }}/>
                </MenuItem>
              ))}
            </Select> */}
            <MultiSelect
  label="Select delivery locations"
  options={deliveryOptions}
  onChange={onDeliveriesChange}
/>

          </div>

          <div className={styles.filterSection}>
            <label className={styles.label}>Carriers</label>
            {/* <Select
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
              MenuProps={{
                classes: {
                  paper: styles.carrierDropdownPaper,
                },
              }}
              MenuProps={{
                classes: {
                  paper: styles.carrierDropdownPaper,
                },
              }}
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
                <MenuItem key={carrier._id} value={carrier._id} className={styles.carrierMenuItem}>
                <MenuItem key={carrier._id} value={carrier._id} className={styles.carrierMenuItem}>
                  <Checkbox
                    checked={selectedCarriers.indexOf(carrier._id) > -1}
                    className={styles.smallCheckbox}
                    className={styles.smallCheckbox}
                  />
                  <ListItemText
                    primary={`${carrier.parent_name} - ${carrier.name}`}
                    classes={{
                      primary: styles.carrierMenuItemText,
                    }}
                  />
                </MenuItem>
              ))}
            </Select> */}
            <MultiSelect
  label="Select carriers"
  options={carrierOptions}
  onChange={onCarriersChange}
/>

          </div>

          <div className={styles.filterSection}>
          <label className={styles.label}>From</label>
  <DatePicker
    value={fromDate}
    onChange={setFromDate}
    className={styles.inputField} // You can reuse your existing CSS class
    format="DD/MM/YYYY" // Ant Design uses different format tokens
  />
            {/* <label className={styles.label}>From</label>
            <DatePicker
              value={fromDate}
                format="dd/MM/yyyy"
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
                    slotProps={{
                      textField: {
                          className: styles.input,
                          size: 'small',
                          InputProps: {
                              endAdornment: (
                                  <InputAdornment position="end">
                                      <CalendarTodayIcon className={styles.dateIcon} />
                                  </InputAdornment>
                              ),
                          },
                      },
                  }}
                    }}
                    slotProps={{
                      textField: {
                          className: styles.input,
                          size: 'small',
                          InputProps: {
                              endAdornment: (
                                  <InputAdornment position="end">
                                      <CalendarTodayIcon className={styles.dateIcon} />
                                  </InputAdornment>
                              ),
                          },
                      },
                  }}
                  />
                ),
              }}
            /> */}
          </div>

          <div className={styles.filterSection}>
          <label className={styles.label}>To</label>
  <DatePicker
    value={toDate}
    onChange={setToDate}
    className={styles.inputField}
    format="DD/MM/YYYY"
    disabledDate={(current) => {
      // If fromDate is null, no dates should be disabled.
      if (!fromDate) {
        return false;
      }
      // If fromDate is not null, disable dates before fromDate.
      return current < fromDate;
    }}
  />
            {/* <label className={styles.label}>To</label>
            <DatePicker
              format="dd/MM/yyyy"
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
              slotProps={{
                textField: {
                    className: styles.input,
                    size: 'small',
                    InputProps: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <CalendarTodayIcon className={styles.dateIcon} />
                            </InputAdornment>
                        ),
                    },
                },
            }}
            /> */}
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
                Select
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
                Select
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
              Select
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
              {fetchedSegmentations.map((seg) => (
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
