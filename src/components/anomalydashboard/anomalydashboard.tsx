"use client"

import { useState, useEffect, useCallback } from "react"
import { AlertTriangle,  LocateFixed , MapPin, CreditCard, Navigation, X, ArrowUp, ArrowDown } from "lucide-react"
import { environment } from '../../environments/env.api';
import { httpsPost, httpsGet } from "@/utils/Communication"
import { useSnackbar } from "@/hooks/snackBar"; // <-- Import the hook
import './AnomalyDashboard.css';

// --- Type Definitions ---
interface AnomalyItem {
  exception_id: string;
  shipment_id: string;
  SIN: string;
  unique_code: string;
  shipper: {
    parent_name: string;
    name: string;
  };
  carrier: {
    parent_name: string;
    name: string;
  };
  driver: {
    name: string;
    mobile: string;
    vehicle_number: string;
  };
  delivery_location: string;
  estimated_distance: number;
  actual_distance: number;
  last_ping_gps: string;
  last_ping_gps_time: string;
  last_ping_fastag: string;
  last_ping_fastag_time: string;
  avg_speed: number;
}

interface NoZoneItem {
  location: string;
  geo_point: {
    type: string;
    coordinates: number[];
  };
  driver_name: string;
  driver_mobile: string;
  carrier_parent_name: string;
  carrier_name: string;
  start_time: string;
  end_time: string | null;
  materials: string[];
}

interface AnomalyDataState<T> {
  count: number;
  ids: string[];
  data: T[];
}

interface AnomalyDashboardData {
  highSpeed: AnomalyDataState<AnomalyItem>;
  distance: AnomalyDataState<AnomalyItem>;
  tollPlaza: AnomalyDataState<AnomalyItem>;
  noZone: AnomalyDataState<NoZoneItem>;
}

type AnomalyType = "highSpeed" | "distance" | "tollPlaza" | "noZone";
type SortDirection = 'ascending' | 'descending';

export const convertToIST = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'N/A';
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string');
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    return date.toLocaleString('en-IN', options);
  } catch (error) {
    console.error('Time conversion failed:', error);
    return 'N/A';
  }
};

const AnomalyDashboard = () => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyType | null>(null)
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  const [anomalyData, setAnomalyData] = useState<AnomalyDashboardData>({
    highSpeed: { count: 0, ids: [], data: [] },
    distance: { count: 0, ids: [], data: [] },
    tollPlaza: { count: 0, ids: [], data: [] },
    noZone: { count: 0, ids: [], data: [] },
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: SortDirection }>({ key: null, direction: 'ascending' });
  const [modalError, setModalError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  // Get the showMessage function from the useSnackbar hook
  const { showMessage } = useSnackbar();

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await httpsGet("stats/anomalies", 1)
      if (response.statusCode !== 200) {
        throw new Error("Failed to fetch initial anomaly data.")
      }
      const data = response.data?.[0] || {}

      setAnomalyData({
        highSpeed: {
          count: data.high_speed?.count || 0,
          ids: data.high_speed?.ids || [],
          data: [],
        },
        distance: {
          count: data.distance?.count || 0,
          ids: data.distance?.ids || [],
          data: [],
        },
        tollPlaza: {
          count: data.toll_plaza?.count || 0,
          ids: data.toll_plaza?.ids || [],
          data: [],
        },
        noZone: {
          count: data.no_zone?.count || 0,
          ids: data.no_zone?.ids || [],
          data: [],
        },
      })
    } catch (err) {
      console.error("Error fetching initial anomaly counts:", err)
      setError("Failed to load dashboard data.")
    } finally {
      setIsLoading(false)
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchModalData = async (type: AnomalyType) => {
    if (selectedAnomaly === type && anomalyData[type].data.length > 0) {
      return
    }

    setModalLoading(true)
    setModalError(null);
    setSelectedAnomaly(type)

    const idsToFetch = anomalyData[type].ids;

    if (!idsToFetch || idsToFetch.length === 0) {
      setModalLoading(false);
      setModalError("No data available for this anomaly type.");
      return;
    }

    try {
      let response;
      let payload;
      
      // Determine the correct payload key based on the anomaly type
      if (type === "noZone") {
        payload = { alert_ids: idsToFetch };
        response = await httpsPost("alert/details", payload, {}, 1);
      } else {
        payload = { anomaly_ids: idsToFetch };
        response = await httpsPost("anomaly/details", payload, {}, 1);
      }

      if (response.statusCode !== 200) {
        throw new Error(`Failed to fetch details for ${type} anomaly.`)
      }

      const data = response.data || [];
      if (data.length === 0) {
        setModalError("No data available for this anomaly type.");
      }

      setAnomalyData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          data: data,
        },
      }))
    } catch (err) {
      console.error(`Error fetching ${type} anomaly details:`, err)
      setModalError(`Failed to load ${type} data.`);
    } finally {
      setModalLoading(false)
    }
  }

  const handleAcknowledge = async (type: AnomalyType, anomalyItem: AnomalyItem, remarkText: string) => {
    const key = `${type}-${anomalyItem.exception_id}`;
    if (!remarkText || remarkText.trim() === "") {
      console.log("Please fill in the remarks before acknowledging.")
      setValidationErrors(prev => ({ ...prev, [key]: true }));
      return;
    }

    setValidationErrors(prev => ({ ...prev, [key]: false }));

    try {
      const response = await httpsPost("shipment/anomaly_acknowledgement", { exception_id: anomalyItem.exception_id, remarks: remarkText }, {}, 0)
      if (response.statusCode !== 200) {
        throw new Error("Failed to acknowledge anomaly.")
      }

      setAnomalyData((prev) => {
        const dataToFilter = prev[type].data as AnomalyItem[];
        const newData = dataToFilter.filter(item => item.exception_id !== anomalyItem.exception_id);

        return {
          ...prev,
          [type]: {
            ...prev[type],
            count: prev[type].count - 1,
            data: newData,
          },
        };
      });

      // Use the showMessage function from the hook
      showMessage(`Shipment ${anomalyItem.SIN} Acknowledged.`, "success");

      console.log(`Acknowledged ${type} anomaly with ID ${anomalyItem.exception_id} with remarks: "${remarkText}"`);

      setRemarks(prev => {
        const newRemarks = { ...prev };
        delete newRemarks[key];
        return newRemarks;
      });
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });

    } catch (error) {
      console.error("Error acknowledging anomaly:", error)
    }
  }

  const handleRemarksChange = (key: string, value: string) => {
    setRemarks((prev) => ({ ...prev, [key]: value }));
    if (validationErrors[key]) {
      setValidationErrors(prev => ({ ...prev, [key]: false }));
    }
  }

  const requestSort = (key: string, type: AnomalyType) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedData = [...anomalyData[type].data].sort((a: any, b: any) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setAnomalyData(prev => ({
      ...prev,
      [type]: { ...prev[type], data: sortedData }
    }));
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string, currentKey: string | null) => {
    if (currentKey !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="icon-up" /> : <ArrowDown className="icon-down" />;
  };

  const anomalyCards = [
    {
      id: "highSpeed",
      title: "GPS Issue",
      count: anomalyData.highSpeed.count,
      icon: LocateFixed,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      id: "distance",
      title: "Distance",
      count: anomalyData.distance.count,
      icon: Navigation,
      color: "#EF4444",
      bgColor: "#FEF2F2",
    },
    {
      id: "tollPlaza",
      title: "Toll Plaza",
      count: anomalyData.tollPlaza.count,
      icon: CreditCard,
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      id: "noZone",
      title: "No Zone",
      count: anomalyData.noZone.count,
      icon: MapPin,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
  ]

  const fixedColumnWidths = {
    standard: {
      sno: 50,
      sin: 150,
      remarks: 250,
      deliveryLocation: 250
    },
    noZone: {
      sno: 50,
      location: 250,
      material: 150
    }
  };

  const calculateStickyWidth = (type: "standard" | "noZone") => {
    const widths = fixedColumnWidths[type];
    return Object.values(widths).reduce((sum, width) => sum + width, 0);
  };

  const renderTable = (type: AnomalyType) => {
    const data = anomalyData[type].data;
    const isNoZoneTable = type === 'noZone';
    const stickyWidth = calculateStickyWidth(isNoZoneTable ? "noZone" : "standard");

    if (modalLoading) {
      return (
        <div className="modal-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    if (modalError) {
      return (
        <div className="modal-error">
          <AlertTriangle className="error-icon" />
          <p>{modalError}</p>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="modal-empty">
          <p>No data available for this anomaly type.</p>
        </div>
      );
    }

    const tableHeaders = {
      standard: [
        { label: "Est. Distance (km)", key: "estimated_distance", sortable: true },
        { label: "Actual Distance (km)", key: "actual_distance", sortable: true },
        { label: "Last Ping GPS", key: "last_ping_gps", sortable: true },
        { label: "Last Ping GPS Time", key: "last_ping_gps_time", sortable: true },
        { label: "Last Ping FASTag", key: "last_ping_fastag", sortable: true },
        { label: "Last Ping FASTag Time", key: "last_ping_fastag_time", sortable: true },
        { label: "Avg Speed (km/h)", key: "avg_speed", sortable: true },
        { label: "Action", key: "action", sortable: false },
      ],
      noZone: [
        { label: "Driver Name", key: "driver_name", sortable: true },
        { label: "Driver Mobile", key: "driver_mobile", sortable: false },
        { label: "Carrier Name", key: "carrier_name", sortable: true },
        { label: "Start Time", key: "start_time", sortable: true },
        { label: "End Time", key: "end_time", sortable: true },
      ]
    };
    const headers = isNoZoneTable ? tableHeaders.noZone : tableHeaders.standard;

    if (isNoZoneTable) {
      return (
        <div className="anomaly-table-wrapper">
          <table className="anomaly-table no-zone-table">
            <thead>
              <tr>
                <th className="sticky-block" style={{ width: stickyWidth, minWidth: stickyWidth }}>
                  <div className="flex">
                    <div className="inner-cell-header" style={{ width: fixedColumnWidths.noZone.sno }}>
                      S.No
                    </div>
                    <div className="inner-cell-header" style={{ width: fixedColumnWidths.noZone.location }}>
                      <button onClick={() => requestSort('location', type)} className="sort-button">
                        Location {getSortIcon('location', sortConfig.key)}
                      </button>
                    </div>
                    <div className="inner-cell-header" style={{ width: fixedColumnWidths.noZone.material }}>
                      <button onClick={() => requestSort('materials', type)} className="sort-button">
                        Material {getSortIcon('materials', sortConfig.key)}
                      </button>
                    </div>
                  </div>
                </th>
                {headers.map((header) => (
                  <th key={header.key}>
                    {header.sortable ? (
                      <button onClick={() => requestSort(header.key, type)} className="sort-button">
                        {header.label}
                        {getSortIcon(header.key, sortConfig.key)}
                      </button>
                    ) : (
                      header.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const noZoneItem = item as NoZoneItem;
                return (
                  <tr key={noZoneItem.location + index}>
                    <td className="sticky-block" style={{ width: stickyWidth, minWidth: stickyWidth }}>
                      <div className="flex">
                        <div className="inner-cell-body" style={{ width: fixedColumnWidths.noZone.sno }}>
                          {index + 1}
                        </div>
                        <div className="inner-cell-body" style={{ width: fixedColumnWidths.noZone.location }}>
                          <div className="truncate-text" title={noZoneItem.location}>
                            <p>{noZoneItem.location}</p>
                          </div>
                        </div>
                        <div className="inner-cell-body" style={{ width: fixedColumnWidths.noZone.material }}>
                          <p>{noZoneItem.materials.join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="pill pill-blue">
                        {noZoneItem.driver_name}
                      </span>
                    </td>
                    <td>
                        {noZoneItem.driver_mobile}
                    </td>
                    <td>
                      <p className="bold-text">{noZoneItem.carrier_name} - {noZoneItem.carrier_parent_name}</p>
                    </td>
                    <td>
                      <span className="pill pill-green">
                        {new Date(noZoneItem.start_time).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${noZoneItem.end_time === null ? "pill-red" : "pill-gray"}`}>
                        {noZoneItem.end_time === null ? "Still in No Zone" : new Date(noZoneItem.end_time).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <div className="anomaly-table-wrapper">
        <table className="anomaly-table">
          <thead>
            <tr>
              <th className="sticky-block" style={{ width: stickyWidth, minWidth: stickyWidth }}>
                <div className="flex">
                  <div className="inner-cell-header" style={{ width: fixedColumnWidths.standard.sno }}>
                    S.No
                  </div>
                  <div className="inner-cell-header" style={{ width: fixedColumnWidths.standard.sin }}>
                    <button onClick={() => requestSort('SIN', type)} className="sort-button">
                      SIN {getSortIcon('SIN', sortConfig.key)}
                    </button>
                  </div>
                  <div className="inner-cell-header" style={{ width: fixedColumnWidths.standard.remarks }}>
                    Remarks
                  </div>
                  <div className="inner-cell-header" style={{ width: fixedColumnWidths.standard.deliveryLocation }}>
                    <button onClick={() => requestSort('delivery_location', type)} className="sort-button">
                      Delivery Location {getSortIcon('delivery_location', sortConfig.key)}
                    </button>
                  </div>
                </div>
              </th>
              {headers.map((header) => (
                <th key={header.key}>
                  {header.sortable ? (
                    <button onClick={() => requestSort(header.key, type)} className="sort-button">
                      {header.label}
                      {getSortIcon(header.key, sortConfig.key)}
                    </button>
                  ) : (
                    header.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const anomalyItem = item as AnomalyItem;
              const key = `${type}-${anomalyItem.exception_id || anomalyItem.SIN}`;
              return (
                <tr key={key}>
                  <td className="sticky-block" style={{ width: stickyWidth, minWidth: stickyWidth }}>
                    <div className="flex">
                      <div className="inner-cell-body" style={{ width: fixedColumnWidths.standard.sno }}>
                        {index + 1}
                      </div>
                      <div className="inner-cell-body" style={{ width: fixedColumnWidths.standard.sin }}>
                        <a href={`${environment.TRACKER_URL}${anomalyItem.unique_code}`} target="_blank" rel="noopener noreferrer" className="link-sin">
                          {anomalyItem.SIN}
                        </a>
                      </div>
                      <div className="inner-cell-body" style={{ width: fixedColumnWidths.standard.remarks, flexDirection: 'column' }}>
                        <textarea
                          placeholder="Enter remarks..."
                          value={remarks[key] || ""}
                          onChange={(e) => handleRemarksChange(key, e.target.value)}
                          className={`remarks-textarea ${validationErrors[key] ? 'error-border' : ''}`}
                        />
                        {validationErrors[key] && (
                            <p className="remark-error-text">* Remarks required</p>
                        )}
                      </div>
                      <div className="inner-cell-body" style={{ width: fixedColumnWidths.standard.deliveryLocation }}>
                        <div className="truncate-text" title={anomalyItem.delivery_location}>
                          <p className="bold-text">{anomalyItem.delivery_location}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="pill pill-green">
                      {(anomalyItem.estimated_distance / 1000).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className="pill pill-red">
                      {(anomalyItem.actual_distance / 1000).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <div className="truncate-text" title={anomalyItem.last_ping_gps}>
                      <p className="bold-text">{anomalyItem.last_ping_gps}</p>
                    </div>
                  </td>
                  
                    <td>
                      <div className="truncate-text" title={anomalyItem.last_ping_gps_time}>
                <p className="bold-text">
                       {convertToIST(anomalyItem.last_ping_gps_time)}
                 </p>
                    </div>
                         </td>
                  
                  <td>
                    <span className="bold-text">{anomalyItem.last_ping_fastag}</span>
                  </td>
                  <td>
                      <div className="truncate-text" title={anomalyItem.last_ping_fastag_time}>
                <p className="bold-text">
                       {convertToIST(anomalyItem.last_ping_fastag_time)}
                 </p>
                    </div>
                         </td>
                  <td>
                    <span className="pill pill-gray-light">
                      {anomalyItem.avg_speed}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleAcknowledge(type, anomalyItem, remarks[key])}
                      className="btn btn-primary"
                    >
                      Acknowledge
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )
  };

  const renderModal = (type: AnomalyType, title: string, icon: any) => {
    const Icon = icon;

    return (
      <div
        className={`modal-overlay ${selectedAnomaly === type ? "modal-open" : ""}`}
        onClick={() => setSelectedAnomaly(null)}
      >
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <div className="modal-icon-wrapper">
                <Icon className="modal-icon" />
              </div>
              <div>
                <h2 className="modal-title">{title}</h2>
              </div>
            </div>
            <button
              onClick={() => {
    setSelectedAnomaly(null);
    setValidationErrors({});
    setRemarks({});
  }}
              className="modal-close-btn"
            >
              <X className="modal-close-icon" />
            </button>
          </div>

          {/* Table */}
          <div className="modal-table-container">
            {renderTable(type)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Main Content */}
      <div className="dashboard-main-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertTriangle className="error-icon" />
            {error}
          </div>
        ) : (
          <div className="card-grid">
            {anomalyCards.map((card) => {
              const Icon = card.icon
              const hasAnomaly = card.count > 0

              return (
                <div
                  key={card.id}
                  onClick={() => fetchModalData(card.id as AnomalyType)}
                  className="card-group"
                >
                  <div className="card">
                    <div className="card-content">
                      <div className="card-header">
                        <div>
                          <h3 className="card-title">
                            {card.title}
                          </h3>
                          <p className="card-subtitle">
                            Click to view details
                          </p>
                        </div>
                        <div
                          className="card-icon-container"
                          style={{
                            backgroundColor: hasAnomaly ? card.bgColor : '#F8FAFC',
                            border: `2px solid ${hasAnomaly ? card.color : '#E2E8F0'}`
                          }}
                        >
                          <Icon
                            className="card-icon"
                            style={{ color: hasAnomaly ? card.color : '#64748B' }}
                          />
                        </div>
                      </div>

                      <div className="card-body">
                        <div className="card-count">
                          {card.count}
                        </div>
                        <div className="card-status-group">
                          {hasAnomaly && <AlertTriangle className="alert-icon" />}
                          <span
                            className="status-pill"
                            style={{
                              backgroundColor: hasAnomaly ? '#FEF2F2' : '#F0FDF4',
                              color: hasAnomaly ? '#DC2626' : '#16A34A'
                            }}
                          >
                            {hasAnomaly ? 'Alert' : 'Normal'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedAnomaly && renderModal(selectedAnomaly, anomalyCards.find(card => card.id === selectedAnomaly)?.title || "", anomalyCards.find(card => card.id === selectedAnomaly)?.icon)}
    </div>
  )
}

export default AnomalyDashboard;