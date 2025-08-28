"use client"

import { useState, useEffect, useCallback, memo, useMemo } from "react"
import { AlertTriangle, LocateFixed, MapPin, CreditCard, Navigation, X, ArrowUp, ArrowDown } from "lucide-react"
import { environment } from '../../environments/env.api';
import { httpsPost, httpsGet } from "@/utils/Communication"
import { useSnackbar } from "@/hooks/snackBar";
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
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyType | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyDashboardData>({
    highSpeed: { count: 0, ids: [], data: [] },
    distance: { count: 0, ids: [], data: [] },
    tollPlaza: { count: 0, ids: [], data: [] },
    noZone: { count: 0, ids: [], data: [] },
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const { showMessage } = useSnackbar();

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await httpsGet("stats/anomalies", 1);
      if (response.statusCode !== 200) {
        throw new Error("Failed to fetch initial anomaly data.");
      }
      const data = response.data?.[0] || {};

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
      });
    } catch (err) {
      console.error("Error fetching initial anomaly counts:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    setSelectedAnomaly(null);
  }, [anomalyData.highSpeed.ids, anomalyData.distance.ids, anomalyData.tollPlaza.ids, anomalyData.noZone.ids]);

  const fetchModalData = async (type: AnomalyType) => {
    if (selectedAnomaly === type && anomalyData[type].data.length > 0) {
      return;
    }

    setModalLoading(true);
    setModalError(null);
    setSelectedAnomaly(type);

    const idsToFetch = anomalyData[type].ids;

    if (!idsToFetch || idsToFetch.length === 0) {
      setModalLoading(false);
      setModalError("No data available for this anomaly type.");
      return;
    }

    try {
      let response;
      let payload;

      if (type === "noZone") {
        payload = { alert_ids: idsToFetch };
        response = await httpsPost("alert/details", payload, {}, 1);
      } else {
        payload = { anomaly_ids: idsToFetch };
        response = await httpsPost("anomaly/details", payload, {}, 1);
      }

      if (response.statusCode !== 200) {
        throw new Error(`Failed to fetch details for ${type} anomaly.`);
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
      }));
    } catch (err) {
      console.error(`Error fetching ${type} anomaly details:`, err);
      setModalError(`Failed to load ${type} data.`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAcknowledge = async (type: AnomalyType, anomalyItem: AnomalyItem, remarkText: string) => {
    try {
      const response = await httpsPost("shipment/anomaly_acknowledgement", { exception_id: anomalyItem.exception_id, remarks: remarkText }, {}, 0);
      if (response.statusCode !== 200) {
        throw new Error("Failed to acknowledge anomaly.");
      }

      setAnomalyData((prev) => {
        const dataToFilter = prev[type].data as AnomalyItem[];
        const newData = dataToFilter.filter(item => item.exception_id !== anomalyItem.exception_id);

        return {
          ...prev,
          [type]: {
            ...prev[type],
            count: newData.length,
            data: newData,
          },
        };
      });

      showMessage(`Shipment ${anomalyItem.SIN} Acknowledged.`, "success");
    } catch (error) {
      console.error("Error acknowledging anomaly:", error);
      showMessage(`Failed to acknowledge shipment ${anomalyItem.SIN}.`, "error");
    }
  };

  const sortData = (data: any[], key: string | null, direction: SortDirection) => {
    if (!key) return data;

    return [...data].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (valA === null || valA === undefined) return direction === 'ascending' ? 1 : -1;
      if (valB === null || valB === undefined) return direction === 'ascending' ? -1 : 1;

      if (key.includes('distance') || key.includes('speed')) {
        const numA = Number(valA);
        const numB = Number(valB);
        return direction === 'ascending' ? numA - numB : numB - numA;
      }
      if (key.includes('_time') || key === 'start_time' || key === 'end_time') {
        const dateA = Date.parse(valA) || 0;
        const dateB = Date.parse(valB) || 0;
        return direction === 'ascending' ? dateA - dateB : dateB - dateA;
      }
      if (key === 'materials') {
        const strA = Array.isArray(valA) ? valA.join(', ') : '';
        const strB = Array.isArray(valB) ? valB.join(', ') : '';
        return direction === 'ascending' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }

      if (valA < valB) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (valA > valB) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key: string, currentKey: string | null, direction: SortDirection) => {
    if (currentKey !== key) {
      return null;
    }
    return direction === 'ascending' ? <ArrowUp className="icon-up" /> : <ArrowDown className="icon-down" />;
  };

  const renderModal = (type: AnomalyType, title: string, icon: any) => {
    const Icon = icon;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        setSelectedAnomaly(null);
      }
    };

    return (
      <div
        className={`modal-overlay ${selectedAnomaly === type ? "modal-open" : ""}`}
        onClick={() => setSelectedAnomaly(null)}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
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
              }}
              className="modal-close-btn"
              aria-label="Close modal"
            >
              <X className="modal-close-icon" />
            </button>
          </div>
          <div className="modal-table-container">
            {type === 'noZone' ? (
              <NoZoneAnomalyTable
                data={anomalyData.noZone.data}
                modalLoading={modalLoading}
                modalError={modalError}
                sortData={sortData}
                getSortIcon={getSortIcon}
              />
            ) : (
              <StandardAnomalyTable
                data={anomalyData[type].data as AnomalyItem[]}
                type={type}
                modalLoading={modalLoading}
                modalError={modalError}
                handleAcknowledge={handleAcknowledge}
                sortData={sortData}
                getSortIcon={getSortIcon}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  interface StandardTableProps {
    data: AnomalyItem[];
    type: AnomalyType;
    modalLoading: boolean;
    modalError: string | null;
    handleAcknowledge: (type: AnomalyType, anomalyItem: AnomalyItem, remarkText: string) => void;
    sortData: (data: any[], key: string | null, direction: SortDirection) => any[];
    getSortIcon: (key: string, currentKey: string | null, direction: SortDirection) => JSX.Element | null;
  }
  
  const StandardAnomalyTable = memo(({
    data,
    type,
    modalLoading,
    modalError,
    handleAcknowledge,
    sortData,
    getSortIcon,
  }: StandardTableProps) => {
    const [localSortConfig, setLocalSortConfig] = useState<{ key: string | null, direction: SortDirection }>({ key: null, direction: 'ascending' });
    const [remarks, setRemarks] = useState<Record<string, string>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
    const [ackLoading, setAckLoading] = useState<Record<string, boolean>>({});

    const sortedData = useMemo(() => sortData(data, localSortConfig.key, localSortConfig.direction), [data, localSortConfig, sortData]);

    const requestLocalSort = (key: string) => {
      let direction: SortDirection = 'ascending';
      if (localSortConfig.key === key && localSortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setLocalSortConfig({ key, direction });
    };

    const handleRemarksChange = (key: string, value: string) => {
      setRemarks((prev) => ({ ...prev, [key]: value }));
      if (validationErrors[key]) {
        setValidationErrors(prev => ({ ...prev, [key]: false }));
      }
    };

    const onAcknowledgeClick = async (anomalyItem: AnomalyItem) => {
      const key = `${type}-${anomalyItem.exception_id}`;
      if (!remarks[key] || remarks[key].trim() === "") {
        setValidationErrors(prev => ({ ...prev, [key]: true }));
        return;
      }
      
      setAckLoading(prev => ({ ...prev, [anomalyItem.exception_id]: true }));
      setValidationErrors(prev => ({ ...prev, [key]: false }));
      
      try {
        await handleAcknowledge(type, anomalyItem, remarks[key]);
        setRemarks(prev => {
          const newRemarks = { ...prev };
          delete newRemarks[key];
          return newRemarks;
        });
      } finally {
        setAckLoading(prev => ({ ...prev, [anomalyItem.exception_id]: false }));
      }
    };

    if (modalLoading) return <div className="modal-loading"><div className="spinner"></div><p>Loading...</p></div>;
    if (modalError) return <div className="modal-error"><AlertTriangle className="error-icon" /><p>{modalError}</p></div>;
    if (data.length === 0) return <div className="modal-empty"><p>No data available for this anomaly type.</p></div>;

    const headers = [
      { label: "Est. Distance (km)", key: "estimated_distance", sortable: true },
      { label: "Actual Distance (km)", key: "actual_distance", sortable: true },
      { label: "Last Ping GPS", key: "last_ping_gps", sortable: true },
      { label: "Last Ping GPS Time", key: "last_ping_gps_time", sortable: true },
      { label: "Last Ping FASTag", key: "last_ping_fastag", sortable: true },
      { label: "Last Ping FASTag Time", key: "last_ping_fastag_time", sortable: true },
      { label: "Avg Speed (km/h)", key: "avg_speed", sortable: true },
      { label: "Action", key: "action", sortable: false },
    ];

    return (
      <div className="anomaly-table-wrapper">
        <table className="anomaly-table">
          <thead>
            <tr>
              <th className="sticky-block">
                <div className="sticky-flex">
                  <div className="inner-cell-header" style={{ width: 'var(--col-sno-width)' }}>S.No</div>
                  <div className="inner-cell-header" style={{ width: 'var(--col-sin-width)' }}>
                    <button onClick={() => requestLocalSort('SIN')} className="sort-button">
                      SIN {getSortIcon('SIN', localSortConfig.key, localSortConfig.direction)}
                    </button>
                  </div>
                  <div className="inner-cell-header" style={{ width: 'var(--col-remarks-width)' }}>Remarks</div>
                  <div className="inner-cell-header" style={{ width: 'var(--col-delivery-width)' }}>
                    <button onClick={() => requestLocalSort('delivery_location')} className="sort-button">
                      Delivery Location {getSortIcon('delivery_location', localSortConfig.key, localSortConfig.direction)}
                    </button>
                  </div>
                </div>
              </th>
              {headers.map((header) => (
                <th key={header.key}>
                  {header.sortable ? (
                    <button onClick={() => requestLocalSort(header.key)} className="sort-button">
                      {header.label}
                      {getSortIcon(header.key, localSortConfig.key, localSortConfig.direction)}
                    </button>
                  ) : (
                    header.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((anomalyItem, index) => {
              const key = `${type}-${anomalyItem.exception_id}`;
              const isAcknowledging = ackLoading[anomalyItem.exception_id];
              const trackerLink = (environment.TRACKER_URL && anomalyItem.unique_code) ? `${environment.TRACKER_URL}${anomalyItem.unique_code}` : null;
              
              return (
                <tr key={key}>
                  <td className="sticky-block">
                    <div className="sticky-flex">
                      <div className="inner-cell-body" style={{ width: 'var(--col-sno-width)' }}>{index + 1}</div>
                      <div className="inner-cell-body" style={{ width: 'var(--col-sin-width)' }}>
                        {trackerLink ? (
                          <a href={trackerLink} target="_blank" rel="noopener noreferrer" className="link-sin">
                            {anomalyItem.SIN}
                          </a>
                        ) : (
                          <p className="no-link-sin">{anomalyItem.SIN}</p>
                        )}
                      </div>
                      <div className="inner-cell-body" style={{ width: 'var(--col-remarks-width)', flexDirection: 'column' }}>
                        <textarea
                          placeholder="Enter remarks..."
                          value={remarks[key] || ""}
                          onChange={(e) => handleRemarksChange(key, e.target.value)}
                          className={`remarks-textarea ${validationErrors[key] ? 'error-border' : ''}`}
                        />
                        {validationErrors[key] && (<p className="remark-error-text">* Remarks required</p>)}
                      </div>
                      <div className="inner-cell-body" style={{ width: 'var(--col-delivery-width)' }}>
                        <div className="truncate-text" title={anomalyItem.delivery_location}>
                          <p className="bold-text">{anomalyItem.delivery_location}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span className="pill pill-green">{(anomalyItem.estimated_distance / 1000).toFixed(2)}</span></td>
                  <td><span className="pill pill-red">{(anomalyItem.actual_distance / 1000).toFixed(2)}</span></td>
                  <td><div className="truncate-text" title={anomalyItem.last_ping_gps}><p className="bold-text">{anomalyItem.last_ping_gps}</p></div></td>
                  <td><div className="truncate-text" title={anomalyItem.last_ping_gps_time}><p className="bold-text">{convertToIST(anomalyItem.last_ping_gps_time)}</p></div></td>
                  <td><span className="bold-text">{anomalyItem.last_ping_fastag}</span></td>
                  <td><div className="truncate-text" title={anomalyItem.last_ping_fastag_time}><p className="bold-text">{convertToIST(anomalyItem.last_ping_fastag_time)}</p></div></td>
                  <td><span className="pill pill-gray-light">{anomalyItem.avg_speed.toFixed(1)}</span></td>
                  <td>
                    <button
                      onClick={() => onAcknowledgeClick(anomalyItem)}
                      className="btn btn-primary"
                      disabled={isAcknowledging}
                    >
                      {isAcknowledging ? 'Acknowledging...' : 'Acknowledge'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  });
  
  StandardAnomalyTable.displayName = 'StandardAnomalyTable';
  
  interface NoZoneTableProps {
    data: NoZoneItem[];
    modalLoading: boolean;
    modalError: string | null;
    sortData: (data: any[], key: string | null, direction: SortDirection) => any[];
    getSortIcon: (key: string, currentKey: string | null, direction: SortDirection) => JSX.Element | null;
  }
  
  const NoZoneAnomalyTable = memo(({
    data,
    modalLoading,
    modalError,
    sortData,
    getSortIcon,
  }: NoZoneTableProps) => {
    const [localSortConfig, setLocalSortConfig] = useState<{ key: string | null, direction: SortDirection }>({ key: null, direction: 'ascending' });
    const sortedData = useMemo(() => sortData(data, localSortConfig.key, localSortConfig.direction), [data, localSortConfig, sortData]);

    const requestLocalSort = (key: string) => {
      let direction: SortDirection = 'ascending';
      if (localSortConfig.key === key && localSortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setLocalSortConfig({ key, direction });
    };

    if (modalLoading) return <div className="modal-loading"><div className="spinner"></div><p>Loading...</p></div>;
    if (modalError) return <div className="modal-error"><AlertTriangle className="error-icon" /><p>{modalError}</p></div>;
    if (data.length === 0) return <div className="modal-empty"><p>No data available for this anomaly type.</p></div>;

    const headers = [
      { label: "Driver Name", key: "driver_name", sortable: true },
      { label: "Driver Mobile", key: "driver_mobile", sortable: false },
      { label: "Carrier Name", key: "carrier_name", sortable: true },
      { label: "Start Time", key: "start_time", sortable: true },
      { label: "End Time", key: "end_time", sortable: true },
    ];

    return (
      <div className="anomaly-table-wrapper">
        <table className="anomaly-table no-zone-table">
          <thead>
            <tr>
              <th className="sticky-block">
                <div className="sticky-flex">
                  <div className="inner-cell-header" style={{ width: 'var(--col-sno-width)' }}>S.No</div>
                  <div className="inner-cell-header" style={{ width: 'var(--col-location-width)' }}>
                    <button onClick={() => requestLocalSort('location')} className="sort-button">
                      Location {getSortIcon('location', localSortConfig.key, localSortConfig.direction)}
                    </button>
                  </div>
                  <div className="inner-cell-header" style={{ width: 'var(--col-material-width)' }}>
                    <button onClick={() => requestLocalSort('materials')} className="sort-button">
                      Material {getSortIcon('materials', localSortConfig.key, localSortConfig.direction)}
                    </button>
                  </div>
                </div>
              </th>
              {headers.map((header) => (
                <th key={header.key}>
                  {header.sortable ? (
                    <button onClick={() => requestLocalSort(header.key)} className="sort-button">
                      {header.label}
                      {getSortIcon(header.key, localSortConfig.key, localSortConfig.direction)}
                    </button>
                  ) : (
                    header.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((noZoneItem, index) => {
              const uniqueKey = `${noZoneItem.location}-${noZoneItem.driver_mobile}-${noZoneItem.start_time}`;
              return (
                <tr key={uniqueKey}>
                  <td className="sticky-block">
                    <div className="sticky-flex">
                      <div className="inner-cell-body" style={{ width: 'var(--col-sno-width)' }}>{index + 1}</div>
                      <div className="inner-cell-body" style={{ width: 'var(--col-location-width)' }}>
                        <div className="truncate-text" title={noZoneItem.location}><p>{noZoneItem.location}</p></div>
                      </div>
                      <div className="inner-cell-body" style={{ width: 'var(--col-material-width)' }}>
                        <p>{noZoneItem.materials.join(', ')}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="pill pill-blue">{noZoneItem.driver_name}</span></td>
                  <td>{noZoneItem.driver_mobile}</td>
                  <td><p className="bold-text">{noZoneItem.carrier_name} - {noZoneItem.carrier_parent_name}</p></td>
                  <td><span className="pill pill-green">{convertToIST(noZoneItem.start_time)}</span></td>
                  <td><span className={`pill ${noZoneItem.end_time === null ? "pill-red" : "pill-gray"}`}>{noZoneItem.end_time === null ? "Still in No Zone" : convertToIST(noZoneItem.end_time)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  });
  
  NoZoneAnomalyTable.displayName = 'NoZoneAnomalyTable';

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
  ];

  return (
    <div className="dashboard-container">
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
              const Icon = card.icon;
              const hasAnomaly = card.count > 0;

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
              );
            })}
          </div>
        )}
      </div>
      {selectedAnomaly && renderModal(selectedAnomaly, anomalyCards.find(card => card.id === selectedAnomaly)?.title || "", anomalyCards.find(card => card.id === selectedAnomaly)?.icon)}
    </div>
  );
};

export default AnomalyDashboard;