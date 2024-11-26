"use client";

import { MapContainer, TileLayer, Marker, LayersControl, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Import Leaflet for creating custom icons
import styles from "./page.module.css";
import Image from "next/image";
import rakesLoadedIcon from "@/assets/rakes_loaded.svg";
import captiveRakes from '@/assets/cr.svg'
import emptyRakesIcon from "@/assets/empty_rakes_icon.svg";
import { useEffect, useState, useMemo } from "react";
import { httpsGet } from '@/utils/Communication';
import { useRouter } from 'next/navigation';
import getBoundary from '@/components/MapView/IndianClaimed';
import timeService from '@/utils/timeService';
import { useMediaQuery, useTheme } from '@mui/material';

interface RakeLocation {
  coords: [number, number]; // Tuple type for Leaflet position
  type: "loaded" | "empty" | "captive";
  title: string;
  updatedAt: string;
}

const rakeStatus: any = {
  AR: "Available for Release",
  FD: "Forwarded",
  DP: "Departed",
  ST: "Stabled",
  RL: "Released",
  RD: "Ready for Departure",
  BP: "Brake Power Certificate Issued",
  CL: "Cleared",
  MT: "Empty",
  LD: "Loaded",
  OT: "On Transit",
  SH: "Shunted",
  UC: "Under Clearance",
  UI: "Under Inspection",
  UP: "Under Placement",
  RR: "Ready for Release",
  HO: "Hold",
  CW: "Charged Wagon",
  PL: "Placed",
  AB: "Abandoned",
};

export default function CaptiveRakeMapView() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const center: [number, number] = !mobile ? [22.5937, 84.9629] : [16.2197, 80.9629];
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const [currentZoom, setCurrentZoom] = useState(5);
  const router = useRouter()
  const [coordsData, setCoordsData] = useState<any[]>([]);
  const [loadedRakes, setLoadedRakes] = useState<any>([]);
  const [emptyRakes, setEmptyRakes] = useState<any>([]);
  const [summaryData, setSummaryData] = useState([
    { plant: "JBSK", from: 10, towards: 6, others: 0 },
    { plant: "JSPP", from: 12, towards: 4, others: 2 },
    { plant: "PJPD", from: 10, towards: 1, others: 2 },
    { plant: "Barbil", from: 2, towards: 1, others: 4 },
  ]);
  const [stats, setStats] = useState({
    "T+1": 0,
    "T+2": 0,
    "T+3": 0,
  });
  const [activeFilter, setActiveFilter] = useState<'total' | 'loaded' | 'empty'>('total');
  const [activeRakeFilter, setActiveRakeFilter] = useState<string>("All");
  const [rakeStatusData, setRakeStatusData] = useState([
    { code: 'AR', text: 'Available for Release', count: 16 },
    { code: 'ST', text: 'Stabled', count: 4 },
    { code: 'RD', text: 'Ready for Departure', count: 6 },
    { code: 'FD', text: 'Forwarded', count: 14 },
    { code: 'DP', text: 'Departed', count: 12 },
    { code: 'RL', text: 'Released', count: 5 },
    { code: 'BP', text: 'Brake Power Certificate Issued', count: 7 },
    { code: 'CL', text: 'Cleared', count: 2 },
  ]);
  const [rakeTypeData, setRakeTypeData] = useState({
    "All": 0,
    "SFTO": 0,
    "GPWIS": 0,
    "BFNV": 0
  });

  const handleRakeFilterClick = (filterType: string) => {
    setActiveRakeFilter(filterType === activeRakeFilter ? "All" : filterType);
  };

  const handleFilterClick = (filter: 'total' | 'loaded' | 'empty') => {
    setActiveFilter(filter === activeFilter ? 'total' : filter);
  };

  const filteredCoords = useMemo(() => {
    return coordsData.filter((val: any) => {
      const matchesRakeType = activeRakeFilter === "All" || 
        (val.rake?.name && val.rake.name.includes(activeRakeFilter));

      const matchesLoadingStatus = activeFilter === 'total' ||
        (activeFilter === 'loaded' && val.loading_status === "L") ||
        (activeFilter === 'empty' && val.loading_status !== "L");

      return matchesRakeType && matchesLoadingStatus;
    });
  }, [coordsData, activeFilter, activeRakeFilter]);

  const filteredCounts = useMemo(() => {
    const rakeFilteredData = coordsData.filter((val: any) => 
      activeRakeFilter === "All" || (val.rake?.name && val.rake.name.includes(activeRakeFilter))
    );

    return {
      total: rakeFilteredData.length,
      loaded: rakeFilteredData.filter((val: any) => val.loading_status === "L").length,
      empty: rakeFilteredData.filter((val: any) => val.loading_status !== "L").length
    };
  }, [coordsData, activeRakeFilter]);

  const getFilteredStatusCounts = useMemo(() => {
    const statusCounts: { [key: string]: number } = {};
    
    rakeStatusData.forEach(status => {
      statusCounts[status.code] = 0;
    });

    filteredCoords.forEach((item: any) => {
      if (item.rake?.status) {
        statusCounts[item.rake.status] = (statusCounts[item.rake.status] || 0) + 1;
      }
    });

    return rakeStatusData.map(status => ({
      ...status,
      count: statusCounts[status.code] || 0
    }));
  }, [filteredCoords, rakeStatusData]);

  async function getCoords() {
    try {
      const response = await httpsGet('get/captive_rake_locations', 0, router);
      if (response?.statusCode === 200 && Array.isArray(response?.data.data)) {
        const coords = response.data.data && response.data.data.length > 0 && response.data.data.filter((val: any) => 
          val?.geo_point?.coordinates && 
          val.geo_point.coordinates[0] !== 0 && 
          val.geo_point.coordinates[1] !== 0
        );
        
        const loaded = coords && coords.length > 0 && coords.filter((val: any) => val.loading_status === "L") || [];
        const empty = coords && coords.length > 0 && coords.filter((val: any) => val.loading_status !== "L") || [];

        const stats = response.data.stats || {
          "T+1": 0,
          "T+2": 0,
          "T+3": 0
        };

        const rakeStatusData = Object.entries(response.data.stts_code || {}).map(([code, count]) => ({
          code,
          text: rakeStatus[code] || code,
          count: count as number
        }));

        const rakeTypeCounts = coords && coords.length > 0 && coords.reduce((acc: any, val: any) => {
          const rakeScheme = val.rake?.scheme || '';
          if (rakeScheme == "SFTO") acc.SFTO++;
          if (rakeScheme == "GPWIS") acc.GPWIS++;
          if (rakeScheme == "BFNV") acc.BFNV++;
          return acc;
        }, {
          All: coords.length,
          SFTO: 0,
          GPWIS: 0,
          BFNV: 0
        }) || {
          All: 0,
          SFTO: 0,
          GPWIS: 0,
          BFNV: 0
        };
        
        setCoordsData(coords);
        setLoadedRakes(loaded);
        setEmptyRakes(empty);
        setStats(stats);
        // setRakeStatusData(rakeStatusData);
        setRakeTypeData(rakeTypeCounts);
      } else {
        console.error('Invalid response format:', response);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  }

  useEffect(()=>{
   getCoords()
  },[])

  useEffect(() => {
    if (map) {
      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });
    }
  }, [map]);

  const rakeLocations: RakeLocation[] = [
    { coords: [24.5, 78.9], type: "loaded", title: "Loaded Rake 1", updatedAt: "2024-11-20" },
    { coords: [24.3, 78.7], type: "empty", title: "Empty Rake 2", updatedAt: "2024-11-21" },
    { coords: [24.1, 78.8], type: "captive", title: "Captive Rake 3", updatedAt: "2024-11-22" },
  ];

  const customLoadedIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="${styles.markerDot} ${styles.loaded}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });

  const customEmptyIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="${styles.markerDot} ${styles.empty}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });

  const createTrainIcon = (isLoaded: boolean) => {
    const fillColor = isLoaded ? '#18BE8A' : '#E6667B';
    const size = 26; // Desired size
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" style="transform: scale(1.75);">
          <defs>
            <filter id="shadow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
              <feOffset dy="2" input="SourceAlpha"/>
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feFlood flood-opacity="0.161"/>
              <feComposite operator="in" in2="blur"/>
              <feComposite in="SourceGraphic"/>
            </filter>
          </defs>
          <g transform="translate(3920 -5968)">
            <g transform="matrix(1, 0, 0, 1, -3920, 5968)" filter="url(#shadow)">
              <rect width="20" height="20" rx="6" transform="translate(6 4)" fill="#fff"/>
            </g>
            <path d="M160-871.474v-6a1.957,1.957,0,0,1,.434-1.334,2.732,2.732,0,0,1,1.145-.758,6.5,6.5,0,0,1,1.618-.347q.908-.087,1.855-.087,1.042,0,1.966.087a6.186,6.186,0,0,1,1.611.347,2.453,2.453,0,0,1,1.082.758,2.086,2.086,0,0,1,.395,1.334v6a2.135,2.135,0,0,1-.639,1.571,2.135,2.135,0,0,1-1.571.64l.947.947V-868h-1.263l-1.263-1.263h-2.526L162.526-868h-1.263v-.316l.947-.947a2.135,2.135,0,0,1-1.571-.64A2.135,2.135,0,0,1,160-871.474Zm1.263-3.474h3.158v-1.895h-3.158Zm4.421,0h3.158v-1.895h-3.158Zm-2.842,3.789a.92.92,0,0,0,.679-.268.92.92,0,0,0,.268-.679.92.92,0,0,0-.268-.679.92.92,0,0,0-.679-.268.92.92,0,0,0-.679.268.92.92,0,0,0-.268.679A.92.92,0,0,0,162.842-871.158Zm4.421,0a.92.92,0,0,0,.679-.268.92.92,0,0,0,.268-.679.92.92,0,0,0-.268-.679.921.921,0,0,0-.679-.268.92.92,0,0,0-.679.268.92.92,0,0,0-.268.679A.92.92,0,0,0,167.263-871.158Z" transform="translate(-4069 6856.005)" 
            fill="${fillColor}"/>
          </g>
        </svg>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size],
      popupAnchor: [0, -size]
    });
  };

  const getIcon = (status: string) => {
    if (currentZoom > 9) {
      return createTrainIcon(status === "L");
    }
    return status === "L" ? customLoadedIcon : customEmptyIcon;
  };

  const boundaryStyle = (feature: any) => {
    switch (feature.properties.boundary) {
      case 'claimed':
        return {
          color: "#C2B3BF", weight: 2
        };
      default:
        return {
          color: "", weight: 0
        };
    }
  }

  const addIndiaBoundaries = () => {
    const b = getBoundary();
    if (map instanceof L.Map) {
      L.geoJSON(b, {
        style: boundaryStyle
      }).addTo(map);
    } else {
      console.error('map is not a Leaflet map object');
    }
  }

  useEffect(() => {
    addIndiaBoundaries();
  }, [map]);

  return (
    <div>
      <div>
        <div 
          className={styles.container}
        >
          <div className={`${styles.leftPanel} ${isCollapsed ? styles.collapsed : ''}`}>
            {mobile && (
              <>
                <div 
                  className={styles.collapseHandle}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                </div>
              </>
            )}

            <div className={styles.rakeTypeFilters}>
              <div 
                className={`${styles.filterChip} ${activeRakeFilter === "All" ? styles.active : ""}`}
                onClick={() => handleRakeFilterClick("All")}
              >
                <span>All</span>
                <span className={styles.count}>{rakeTypeData.All || 0}</span>
              </div>
              <div 
                className={`${styles.filterChip} ${activeRakeFilter === "SFTO" ? styles.active : ""}`}
                onClick={() => handleRakeFilterClick("SFTO")}
              >
                <span>SFTO</span>
                <span className={styles.count}>{rakeTypeData.SFTO || 0}</span>
              </div>
              <div 
                className={`${styles.filterChip} ${activeRakeFilter === "BFNV" ? styles.active : ""}`}
                onClick={() => handleRakeFilterClick("BFNV")}
              >
                <span>BFNV</span>
                <span className={styles.count}>{rakeTypeData.BFNV || 0}</span>
              </div>
              <div 
                className={`${styles.filterChip} ${activeRakeFilter === "GPWIS" ? styles.active : ""}`}
                onClick={() => handleRakeFilterClick("GPWIS")}
              >
                <span>GPWIS</span>
                <span className={styles.count}>{rakeTypeData.GPWIS || 0}</span>
              </div>
            </div>

            <div className={styles.rakesStatus}>
              <h2>Captive Rakes Status</h2>
              <div className={styles.statusItems}>
                <div 
                  className={`${styles.statusItem} ${styles.totalStatus} ${activeFilter === 'total' ? styles.activeTotal : ''}`}
                  onClick={() => handleFilterClick('total')}
                >
                  <span className={styles.icon} style={{ 
                    backgroundColor: '#F8F8F8',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px'
                  }}>
                    <Image src={rakesLoadedIcon} alt=""/>
                  </span>
                  <div className={styles.labelCont}>
                  <span className={styles.label} style={{color: '#334FFC'}}>Total</span>
                  <span className={styles.value}>
                    {filteredCounts.total}
                  </span>
                  </div>
                </div>
                <div 
                  className={`${styles.statusItem} ${styles.loadedStatus} ${activeFilter === 'loaded' ? styles.activeLoaded : ''}`}
                  onClick={() => handleFilterClick('loaded')}
                >
                  <span className={styles.icon} style={{ 
                    backgroundColor: '#F8F8F8',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px'
                  }}>
                    <Image src={captiveRakes} alt=""/>
                  </span>
                  <div className={styles.labelCont}>
                  <span className={styles.label} style={{color: '#18BE8A'}}>Loaded</span>
                  <span className={styles.value}>
                    {filteredCounts.loaded}
                  </span>
                  </div>
                </div>
                <div 
                  className={`${styles.statusItem} ${styles.emptyStatus} ${activeFilter === 'empty' ? styles.activeEmpty : ''}`}
                  onClick={() => handleFilterClick('empty')}
                >
                  <Image src={emptyRakesIcon} alt=""/>
                  <div className={styles.labelCont}>
                  <span className={styles.label} style={{color: '#E6667B'}}>Empty</span>
                  <span className={styles.value}>
                    {filteredCounts.empty}
                  </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.rakesArrival}>
              <h2>Rakes Arrival</h2>
              <div className={styles.arrivalItems}>
                <div className={styles.arrivalItem}>
                  <span className={styles.value}>{stats["T+1"]}</span>
                  <span className={styles.label}>T+1</span>
                </div>
                <div className={styles.arrivalItem}>
                  <span className={styles.value}>{stats["T+2"]}</span>
                  <span className={styles.label}>T+2</span>
                </div>
                <div className={styles.arrivalItem}>
                  <span className={styles.value}>{stats["T+3"]}</span>
                  <span className={styles.label}>&gt;T+3</span>
                </div>
              </div>
            </div>

            <div className={styles.rakeStatusInMovement}>
              <h2>Statuses of Rakes in Movement</h2>
              <table className={styles.summaryTable}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Code</th>
                    <th>Counts</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredStatusCounts.map((row, index) => (
                    <tr key={index}>
                      <td style={{fontWeight:'bold', color:''}}>{index + 1}</td>
                      <td>{row.code} ({row.text})</td>
                      <td>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.rakesPlacementRegion}>
              <h2>Rakes Placement Region</h2>
              <div className={styles.placementItems}>
                <div className={styles.placementItem}>
                  <span className={styles.value}>12</span>
                  <span className={styles.label}>Loading</span>
                </div>
                <div className={styles.placementItem} style={{
                  paddingRight: '24px',
                }}>
                  <span className={styles.value}>08</span>
                  <span className={styles.label}>Unloading</span>
                </div>
                <div className={styles.placementItem}>
                </div>
              </div>
            </div>

            <div className={styles.plantRakesSummary}>
              <h2>Plant Rakes Summary</h2>
              <table className={styles.summaryTable}>
                <thead>
                  <tr>
                    <th style={{color:'#18BE8A'}}>Plant</th>
                    <th>From</th>
                    <th>Towards</th>
                    <th>Others</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((row, index) => (
                    <tr key={index}>
                      <td style={{fontWeight:'bold',color:''}}>{row.plant}</td>
                      <td>{row.from}</td>
                      <td>{row.towards}</td>
                      <td>{row.others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.rightPanel}>
            <MapContainer
              className="map"
              id="map-helpers"
              center={center}
              zoom={5}
              style={{ 
                height: "100%", 
                width: "100%", 
                padding: "0px", 
                zIndex: "0" 
              }}
              attributionControl={false}
              ref={setMap}
            >
              <LayersControl>
                <LayersControl.BaseLayer checked name="Street View">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite View">
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>

              {filteredCoords.map((marker: any, index: number) => {
                const icon = getIcon(marker.loading_status);
                return (
                  <Marker
                    key={index}
                    position={[
                      marker.geo_point.coordinates[1],
                      marker.geo_point.coordinates[0],
                    ]}
                    icon={icon}
                  >
                    <Popup>
                      <div style={{
                        padding: '6px',
                        minWidth: '230px'
                      }}>
                        <div style={{
                          fontSize: '13px',
                          color: '#42454E',
                          display: 'grid',
                          gap: '4px'
                        }}>
                          <p style={{ margin: '2px 0' }}><strong>Rake ID:</strong> {marker.rake?.rake_id || 'N/A'}</p>
                          <p style={{ margin: '2px 0' }}><strong>Rake Name:</strong> {marker.rake?.name || 'N/A'}</p>
                          <p style={{ margin: '2px 0' }}><strong>Rake Status:</strong> {marker.stts_code ? rakeStatus[marker.stts_code] : 'N/A'}</p>
                          <p style={{ margin: '2px 0' }}><strong>From Station:</strong> {marker.from ? `${marker.from.code} ${marker.from.name}` : 'N/A'}</p>
                          <p style={{ margin: '2px 0' }}><strong>To Station:</strong> {marker.to ? `${marker.to.code} ${marker.to.name}` : 'N/A'}</p>
                          <p style={{ margin: '2px 0' }}><strong>Current Station:</strong> {marker.current_station ? `${marker.current_station.code} ${marker.current_station.name}` : 'N/A'}</p>
                          <p style={{ margin: '2px 0' }}><strong>Updated At FOIS:</strong> {marker.updated_on ? `${timeService.utcToist(marker.updated_on, 'dd-MMM')} ${timeService.utcToistTime(marker.updated_on, 'HH:mm')}` : 'N/A'}</p>
                          <p style={{ margin: '2px 0' }}><strong>Data Fetched At:</strong> {marker.updated_at ? `${timeService.utcToist(marker.updated_at, 'dd-MMM')} ${timeService.utcToistTime(marker.updated_at, 'HH:mm')}` : 'N/A'}</p>
                          <p style={{ margin: '2px 0' }}><strong>ETA:</strong> {marker.expd_arvl_time ? `${timeService.utcToist(marker.expd_arvl_time, 'dd-MMM')} ${timeService.utcToistTime(marker.expd_arvl_time, 'HH:mm')}` : 'N/A'}</p>
                          <p style={{ margin: '2px 0' }}><strong>Commodity:</strong> {marker.commodity && marker.commodity.length > 0 ? marker.commodity.join(', ') : 'N/A'}</p>
                          <p style={{ margin: '2px 0' }}><strong>Remaining Distance:</strong> {marker.rmng_km ? marker.rmng_km : 'N/A'} km</p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
