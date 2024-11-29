"use client";

import { MapContainer, TileLayer, Marker, LayersControl, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Import Leaflet for creating custom icons
import Image from "next/image";
import rakesLoadedIcon from "@/assets/rakes_loaded.svg";
import captiveRakes from '@/assets/cr.svg'
import emptyRakesIcon from "@/assets/empty_rakes_icon.svg";
import { useEffect, useState, useMemo } from "react";
import { httpsGet, httpsPost } from '@/utils/Communication';
import { useRouter } from 'next/navigation';
import getBoundary from '@/components/MapView/IndianClaimed';
import timeService from '@/utils/timeService';
import { useMediaQuery, useTheme } from '@mui/material';
import { get } from 'http';
import styles from "./page.module.css";

interface SchemeData {
  count: number;
  _id: string[];
}

interface RakeTypeData {
  All: SchemeData;
  SFTO: SchemeData;
  GPWIS: SchemeData;
  BFNV: SchemeData;
  [key: string]: SchemeData;
}

interface RakeLocation {
  coords: [number, number]; // Tuple type for Leaflet position
  type: "loaded" | "empty" | "captive";
  title: string;
  updatedAt: string;
}

interface RakeStatusData {
  code: string;
  text: string;
  count: number;
  _ids: string[];
}

interface StatsData {
  "Today": {
    count: number;
    _id: string[];
  };
  "T+1": {
    count: number;
    _id: string[];
  };
  "T+2": {
    count: number;
    _id: string[];
  };
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
  const [stats, setStats] = useState<StatsData>({
    "Today": {
      count: 0,
      _id: []
    },
    "T+1": {
      count: 0,
      _id: []
    },
    "T+2": {
      count: 0,
      _id: []
    }
  });
  const [activeFilter, setActiveFilter] = useState<'total' | 'loaded' | 'empty'>('total');
  const [activeRakeFilter, setActiveRakeFilter] = useState<string>("All");
  const [rakeStatusData, setRakeStatusData] = useState<RakeStatusData[]>([]);
  const [rakeTypeData, setRakeTypeData] = useState<RakeTypeData>({
    All: {
      count: 0,
      _id: []
    },
    SFTO: {
      count: 0,
      _id: []
    },
    GPWIS: {
      count: 0,
      _id: []
    },
    BFNV: {
      count: 0,
      _id: []
    }
  });
  const [selectedArrival, setSelectedArrival] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [plantRakesSummary,setPlantRakesSummary] = useState<any>({from:{},to:{}})
  const [plantRakesSummaryPlants,setPlantRakesSummaryPlants] = useState<any>([])
  const [totalCRCount, setTotalCRCount] = useState(0)
  const [usedCRCount,setUsedCRCount] = useState(0)

  const handleRakeFilterClick = (filterType: string, ids: string[]) => {
    setActiveRakeFilter(filterType === activeRakeFilter ? "All" : filterType);
    getCoords(filterType, ids);
    getRakeStatusData(filterType);
    getRakeStats(filterType);
    getSchemeWiseCount(filterType);
  };

  const handleFilterClick = (filter: 'total' | 'loaded' | 'empty') => {
    setActiveFilter(filter === activeFilter ? 'total' : filter);
  };

  const handleArrivalClick = (period: string, ids: string[]) => {
    setSelectedArrival(selectedArrival === period ? null : period);
    if(ids.length) {
      getCoords(activeRakeFilter, ids);
    } else {
      setCoordsData([])
    }
  };

  const handleRowClick = (index: number, rowData: RakeStatusData) => {
    setSelectedRow(selectedRow === index ? null : index);
    getCoords(activeRakeFilter, rowData._ids);
  };

  const filteredCoords = useMemo(() => {
    return coordsData && coordsData.length > 0 && coordsData.filter((val: any) => {
      const matchesRakeType = activeRakeFilter === "All" || 
        (val?.scheme && val.scheme === activeRakeFilter);

      const matchesLoadingStatus = activeFilter === 'total' ||
        (activeFilter === 'loaded' && val.loading_status === "L") ||
        (activeFilter === 'empty' && val.loading_status !== "L");

      return matchesRakeType && matchesLoadingStatus;
    }) || [];
  }, [coordsData, activeFilter, activeRakeFilter]);

  const filteredCounts = useMemo(() => {
    const rakeFilteredData = coordsData && coordsData.length > 0 && coordsData.filter((val: any) => 
      activeRakeFilter === "All" || (val?.scheme && val.scheme === activeRakeFilter)
    ) || [];

    return {
      total: rakeFilteredData && rakeFilteredData.length,
      loaded: rakeFilteredData.filter((val: any) => val.loading_status === "L").length,
      empty: rakeFilteredData.filter((val: any) => val.loading_status !== "L").length
    };
  }, [coordsData, activeRakeFilter]);

  async function getCoords(scheme: string, ids: string[] = []) {
    try {
      const url ='get/captive_rake_locations';
      let payload = {};
      if (scheme !== "All") {
        payload = {
          scheme
        }
      }
      if(ids.length > 0) {
        payload = {
          ...payload,
          ids
        }
      }
      const response = await httpsPost(url, payload, router, 0, false);
      if (response?.statusCode === 200 && Array.isArray(response?.data.data)) {
        const coords = response.data.data && response.data.data.length > 0 && response.data.data.filter((val: any) => 
          val?.geo_point?.coordinates && 
          val.geo_point.coordinates[0] !== 0 && 
          val.geo_point.coordinates[1] !== 0
        );
        
        const loaded = coords && coords.length > 0 && coords.filter((val: any) => val.loading_status === "L") || [];
        const empty = coords && coords.length > 0 && coords.filter((val: any) => val.loading_status !== "L") || [];

        setCoordsData(coords);
        setLoadedRakes(loaded);
        setEmptyRakes(empty);
      } else {
        console.error('Invalid response format:', response);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  }

  async function getSchemeWiseCount(scheme: string) {
    try{
      const url = scheme === "All" ? 'get/schemeWiseCount' : `get/schemeWiseCount?scheme=${scheme}`;
      const response = await httpsGet(url, 0, router);
      const data = rakeTypeData
      if (response?.statusCode === 200) {
        if(response.data && response.data.length > 0) {
          // Process each scheme data
          response.data.forEach((item: { scheme: keyof RakeTypeData; count: number; ids: string[] }) => {
            if (item.scheme && data.hasOwnProperty(item.scheme)) {
              data[item.scheme] = {
                count: item.count || 0,
                _id: item.ids || []
              };
            }
          });
          if(scheme === 'All') {
            const total = response.data.reduce((acc: number, val: { count: number }) => acc + (val.count || 0), 0)
           data.All = {
            count: total,
            _id: response.data.reduce((acc: string[], val: { ids: string[] }) => [...acc, ...(val.ids || [])], [])
           };
          setTotalCRCount(total)
        }
        }
        setRakeTypeData(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getRakeStatusData(scheme: string) {
    try{
      const url = scheme === "All" ? 'get/statuCount' : `get/statuCount?scheme=${scheme}`;
      const response = await httpsGet(url, 0, router);
      if (response?.statusCode === 200) {
        const rakeStatusData = Object.entries(response.data || {}).map(([code, rake]: [string, any]) => ({
          code,
          text: rakeStatus[code] || code,
          count: rake.count as number,
          _ids: rake._ids
        }));
        setRakeStatusData(rakeStatusData);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getRakeStats(scheme: string) {
    try{
      const url = scheme === "All" ? 'get/tAndTplus' : `get/tAndTplus?scheme=${scheme}`;
      const response = await httpsGet(url, 0, router);
      if (response?.statusCode === 200) {
        const statsData = response.data || {};
        setStats(statsData);

        if(!statsData) {
          setStats({
            "Today": {
              count: 0,
              _id: []
            },
            "T+1": {
              count: 0,
              _id: []
            },
            "T+2": {
              count: 0,
              _id: []
            }
          })
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getPlantRakesSummary() {
    const queryParams =
      activeRakeFilter !== "All" ? `?scheme=${activeRakeFilter}` : "";
    const response = await httpsGet("get/ownOrOthers" + queryParams, 0, router);
    if (response.statusCode === 200) {
      const data = response.data || [];
      setPlantRakesSummary(data);
      if (activeRakeFilter === "All") {
        const plants = [
          ...new Set([
            ...Object.keys(data.from || {}),
            ...Object.keys(data.to || {}),
          ]),
        ];
        setPlantRakesSummaryPlants(plants);
        let totalSum = 0;
      
      Object.keys(data.from || {}).forEach((key) => {
        if (key !== "others") {
          totalSum += data.from[key]?.count;
        }
      });

      Object.keys(data.to || {}).forEach((key) => {
        if (key !== "others") {
          totalSum += data.to[key]?.count;
        }
      });

      setUsedCRCount(totalSum) 
      }
    }
  }

  function handlePlantRakesMapFilter(ids: string[] = []) {
    if (ids.length) {
      getCoords(activeRakeFilter, ids);
    } else {
      setCoordsData([]);
    }
  } 

  useEffect(()=>{
   getCoords('All', [])
   getRakeStatusData('All')
   getRakeStats('All')
   getSchemeWiseCount('All');
   getPlantRakesSummary()
  },[])


  useEffect(()=>{
    getPlantRakesSummary()
  },[activeRakeFilter])

  useEffect(() => {
    if (map) {
      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });
  
      const streetViewControl = document.querySelector('.leaflet-control-layers');
      
      if (streetViewControl && streetViewControl instanceof HTMLElement) {
        streetViewControl.style.top = '42px';  
        streetViewControl.style.right = '0px';  
      }
    }
  }, [map]);  
 
  useEffect(()=>{
   setSelectedRow(-1)
  },[selectedArrival])

  const customLoadedIcon = (stabled: any) => {
    const stabledClass = stabled ? styles.stabledBorder : "";

    return L.divIcon({
      className: "custom-div-icon",
      html: `<div class="${styles.markerDot} ${styles.loaded}  ${stabledClass}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8],
    });
  };



  const customEmptyIcon = (stabled: any) => {
    const stabledClass = stabled ? styles.stabledBorder : "";

    return L.divIcon({
      className: "custom-div-icon",
      html: `<div class="${styles.markerDot} ${styles.empty} ${stabledClass}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8],
    });
  };

  const legendItems = [
    {
      label: 'Loaded',
      class: `${styles.markerDot} ${styles.loaded}`,
    },
    {
      label: 'Empty',
      class: `${styles.markerDot} ${styles.empty}`,
    },  {
      label: 'Stabled(Loaded)',
      class: `${styles.markerDot} ${styles.loaded} ${styles.stabledBorder}`,
    },  {
      label: 'Stabled(Empty)',
      class: `${styles.markerDot} ${styles.empty} ${styles.stabledBorder}`,
    }
  ]

  const createTrainIcon = (isLoaded: boolean) => {
    const fillColor = isLoaded ? '#037f58' : '#e31f3f';
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
            <path d="M160-871.474v-6a1.957,1.957,0,0,1,.434-1.334,2.732,2.732,0,0,1,1.145-.758,6.5,6.5,0,0,1,1.618-.347q.908-.087,1.855-.087,1.042,0,1.966.087a6.186,6.186,0,0,1,1.611.347,2.453,2.453,0,0,1,1.082.758,2.086,2.086,0,0,1,.395,1.334v6a2.135,2.135,0,0,1-.639,1.571,2.135,2.135,0,0,1-1.571.64l.947.947V-868h-1.263l-1.263-1.263h-2.526L162.526-868h-1.263v-.316l.947-.947a2.135,2.135,0,0,1-1.571-.64A2.135,2.135,0,0,1,160-871.474Zm1.263-3.474h3.158v-1.895h-3.158Zm4.421,0h3.158v-1.895h-3.158Zm-2.842,3.789a.92.92,0,0,0,.679-.268.92.92,0,0,0,.268-.679.92.92,0,0,0-.268-.679.92.92,0,0,0-.679-.268.92.92,0,0,0-.679.268.92.92,0,0,0-.268.679A.92.92,0,0,0,162.842-871.158Zm4.421,0a.92.92,0,0,0,.679-.268.92.92,0,0,0,.268-.679A.921.921,0,0,0,167.263-871.158Z" transform="translate(-4069 6856.005)" 
            fill="${fillColor}"/>
          </g>
        </svg>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size],
      popupAnchor: [0, -size]
    });
  };

  const getIcon = (status: string,status_code: string) => {
    if (currentZoom > 9) {
      return createTrainIcon(status === "L");
    }
    const stabled = Boolean(status_code === 'ST')
    return status === "L" ? customLoadedIcon(stabled) : customEmptyIcon(stabled);
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
        <div className={styles.container}>
          <div
            className={`${styles.leftPanel} ${
              isCollapsed ? styles.collapsed : ""
            }`}
          >
            {mobile && (
              <>
                <div
                  className={styles.collapseHandle}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                ></div>
              </>
            )}

            <div className={styles.rakeTypeFilters}>
              <div
                className={`${styles.filterChip} ${
                  activeRakeFilter === "All" ? styles.active : ""
                }`}
                onClick={() =>
                  handleRakeFilterClick("All", rakeTypeData.All?._id)
                }
              >
                <span>All</span>
                <span className={styles.count}>
                  {rakeTypeData.All?.count || 0}
                </span>
              </div>
              <div
                className={`${styles.filterChip} ${
                  activeRakeFilter === "SFTO" ? styles.active : ""
                }`}
                onClick={() =>
                  handleRakeFilterClick("SFTO", rakeTypeData.SFTO?._id)
                }
              >
                <span>SFTO-BRN</span>
                <span className={styles.count}>
                  {rakeTypeData.SFTO?.count || 0}
                </span>
              </div>
              <div
                className={`${styles.filterChip} ${
                  activeRakeFilter === "BFNV" ? styles.active : ""
                }`}
                onClick={() =>
                  handleRakeFilterClick("BFNV", rakeTypeData.BFNV?._id)
                }
              >
                <span>SFTO-BFNV</span>
                <span className={styles.count}>
                  {rakeTypeData.BFNV?.count || 0}
                </span>
              </div>
              <div
                className={`${styles.filterChip} ${
                  activeRakeFilter === "GPWIS" ? styles.active : ""
                }`}
                onClick={() =>
                  handleRakeFilterClick("GPWIS", rakeTypeData.GPWIS?._id)
                }
              >
                <span>GPWIS</span>
                <span className={styles.count}>
                  {rakeTypeData.GPWIS?.count || 0}
                </span>
              </div>
            </div>

            <div className={styles.rakesStatus}>
              <h2>Captive Rakes Status</h2>
              <div className={styles.statusItems}>
                <div
                  className={`${styles.statusItem} ${styles.totalStatus} ${
                    activeFilter === "total" ? styles.activeTotal : ""
                  }`}
                  onClick={() => handleFilterClick("total")}
                >
                  <span
                    className={styles.icon}
                    style={{
                      backgroundColor: "#F8F8F8",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px",
                    }}
                  >
                    <Image src={rakesLoadedIcon} alt="" />
                  </span>
                  <div className={styles.labelCont}>
                    <span className={styles.label} style={{ color: "#334FFC" }}>
                      Total
                    </span>
                    <span className={styles.value}>{filteredCounts.total}</span>
                  </div>
                </div>
                <div
                  className={`${styles.statusItem} ${styles.loadedStatus} ${
                    activeFilter === "loaded" ? styles.activeLoaded : ""
                  }`}
                  onClick={() => handleFilterClick("loaded")}
                >
                  <span
                    className={styles.icon}
                    style={{
                      backgroundColor: "#F8F8F8",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px",
                    }}
                  >
                    <Image src={captiveRakes} alt="" />
                  </span>
                  <div className={styles.labelCont}>
                    <span className={styles.label} style={{ color: "#18BE8A" }}>
                      Loaded
                    </span>
                    <span className={styles.value}>
                      {filteredCounts.loaded}
                    </span>
                  </div>
                </div>
                <div
                  className={`${styles.statusItem} ${styles.emptyStatus} ${
                    activeFilter === "empty" ? styles.activeEmpty : ""
                  }`}
                  onClick={() => handleFilterClick("empty")}
                >
                  <Image src={emptyRakesIcon} alt="" />
                  <div className={styles.labelCont}>
                    <span className={styles.label} style={{ color: "#E6667B" }}>
                      Empty
                    </span>
                    <span className={styles.value}>{filteredCounts.empty}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.rakesArrival}>
              <div className={styles.arrivalHeader}>
                <h2>Rakes Arrival</h2>
                {selectedArrival && (
                  <button
                    className={styles.clearFilter}
                    onClick={() => {
                      getCoords(activeRakeFilter, []);
                      setSelectedArrival(null);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className={styles.arrivalItems}>
                <div
                  className={`${styles.arrivalItem} ${
                    selectedArrival === "Today" ? styles.selected : ""
                  }`}
                  onClick={() =>
                    handleArrivalClick("Today", stats["Today"]._id || [])
                  }
                >
                  <span className={styles.value}>
                    {stats["Today"]?.count || 0}
                  </span>
                  <span className={styles.label}>Today</span>
                </div>
                <div
                  className={`${styles.arrivalItem} ${
                    selectedArrival === "T+1" ? styles.selected : ""
                  }`}
                  onClick={() =>
                    handleArrivalClick("T+1", stats["T+1"]._id || [])
                  }
                >
                  <span className={styles.value}>
                    {stats["T+1"].count || 0}
                  </span>
                  <span className={styles.label}>T+1</span>
                </div>
                <div
                  className={`${styles.arrivalItem} ${
                    selectedArrival === "T+2" ? styles.selected : ""
                  }`}
                  onClick={() =>
                    handleArrivalClick("T+2", stats["T+2"]._id || [])
                  }
                >
                  <span className={styles.value}>
                    {stats["T+2"].count || 0}
                  </span>
                  <span className={styles.label}>&gt;T+2</span>
                </div>
              </div>
            </div>

            <div className={styles.rakeStatusInMovement}>
              <h2>Rake Status</h2>
              <div className={styles.rakeStatusTableWrapper}>
                <div className={styles.tableHeaderWrapper}>
                  <table className={styles.rakeStatusTable}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            width: "10%",
                            textAlign: "center",
                          }}
                        >
                          S.No
                        </th>
                        <th
                          style={{
                            width: "65%",
                            textAlign: "left",
                          }}
                        >
                          Code
                        </th>
                        <th
                          style={{
                            width: "25%",
                            textAlign: "center",
                          }}
                        >
                          Counts
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div className={styles.tableBodyWrapper}>
                  <table className={styles.rakeStatusTable}>
                    <tbody>
                      {rakeStatusData.map(
                        (row: RakeStatusData, index: number) => (
                          <tr
                            key={index}
                            style={
                              row.code === "ST"
                                ? { backgroundColor: "#f5f5f5" }
                                : { backgroundColor: "" }
                            }
                            className={
                              selectedRow === index ? styles.selected : ""
                            }
                            onClick={() => handleRowClick(index, row)}
                          >
                            <td
                              style={{
                                width: "10%",
                                textAlign: "center",
                                fontWeight: "bold",
                              }}
                            >
                              {index + 1}
                            </td>
                            <td
                              style={{
                                width: "65%",
                                textAlign: "left",
                              }}
                            >
                              {row.code} ({row.text})
                            </td>
                            <td
                              style={{
                                width: "25%",
                                textAlign: "center",
                              }}
                            >
                              {row.count}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* <div className={styles.rakesPlacementRegion}>
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
            </div> */}
            <div className={styles.plantRakesSummary}>
              <h2>Plant Rakes Summary</h2>

              <table className={styles.summaryTable}>
                <thead>
                  <tr>
                    <th style={{ color: "#18BE8A" }}>Category</th>
                    {plantRakesSummaryPlants
                      .filter((plant: any) => plant !== "others")
                      .concat("others")
                      .map((plant: any, index: any) => (
                        <th key={index} style={{ fontWeight: "bold" }}>
                          {plant}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>From</td>
                    {plantRakesSummaryPlants
                      .filter((plant: any) => plant !== "others")
                      .concat("others")
                      .map((plant: any, index: any) => (
                        <td key={index}>
                          <span
                            onClick={() => {
                              handlePlantRakesMapFilter(
                                plantRakesSummary.from[plant]?.ids
                              );
                              setSelectedArrival(null);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {plantRakesSummary.from[plant]?.count ?? 0}
                          </span>
                        </td>
                      ))}
                  </tr>
                  <tr>
                    <td>Towards</td>
                    {plantRakesSummaryPlants
                      .filter((plant: any) => plant !== "others")
                      .concat("others")
                      .map((plant: any, index: any) => (
                        <td key={index}>
                          <span
                            onClick={() => {
                              handlePlantRakesMapFilter(
                                plantRakesSummary.to[plant]?.ids
                              );
                              setSelectedArrival(null);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {plantRakesSummary.to[plant]?.count ?? 0}
                          </span>
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.captiveRakeCountBox}>
              <h2>Captive Rakes Utilization</h2>
              <div className={styles.countWrapper}>
                <p className={styles.infoCR}>Used Captive Rakes:</p>
                <p className={styles.usedCount}>{usedCRCount}</p>/
                <p className={styles.totalCount}>{totalCRCount}</p>
              </div>
              <div className={styles.usagePercentageWrapper}>
                <p className={styles.infoCR}>Utilization Percentage:</p>
                <p className={styles.usagePercentage}>
                  {((usedCRCount / totalCRCount) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
          <div className={styles.rightPanel}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  height: "32px",
                  display: "flex",
                  justifyContent: "space-evenly",
                  position: "absolute",
                  background: "white",
                  zIndex: 1000,
                  right: "10px",
                  top: "10px",
                  width: "350px",
                  borderRadius: "6px",
                  boxShadow: "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
                  color: "#42454E",
                }}
              >
                {legendItems.map((item: any) => {
                  return (
                    <div
                    key={item}
                      style={{
                        fontSize: "10px",
                        display: "flex",
                        alignItems: "center",
                        columnGap: "4px",
                      }}
                    >
                      <div className={item.class}></div>
                      <div>{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <MapContainer
              className="map"
              id="map-helpers"
              center={center}
              zoom={5}
              style={{
                height: "100%",
                width: "100%",
                padding: "0px",
                zIndex: "0",
              }}
              attributionControl={false}
              ref={setMap}
            >
              <LayersControl>
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>
              {filteredCoords.map((marker: any, index: number) => {
                const icon = getIcon(marker.loading_status, marker.stts_code);

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
                      <div
                        style={{
                          padding: "6px",
                          minWidth: "230px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#42454E",
                            display: "grid",
                            gap: "4px",
                          }}
                        >
                          <p style={{ margin: "2px 0" }}>
                            <strong>Rake ID:</strong>{" "}
                            {marker.rake?.rake_id || "N/A"}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            <strong>Rake Name:</strong>{" "}
                          {marker.rake?.name || "N/A"}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            <strong>Rake Status:</strong>{" "}
                            {marker.stts_code
                              ? rakeStatus[marker.stts_code]
                              : "N/A"}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            <strong>From Station:</strong>{" "}
                            {marker.from
                              ? `${marker.from.code} ${marker.from.name}`
                              : "N/A"}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            <strong>To Station:</strong>{" "}
                            {marker.to
                              ? `${marker.to.code} ${marker.to.name}`
                              : "N/A"}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            <strong>Current Station:</strong>{" "}
                            {marker.current_station
                              ? `${marker.current_station.code} ${marker.current_station.name}`
                              : "N/A"}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            <strong>Updated At FOIS:</strong>{" "}
                            {marker.updated_on
                              ? `${timeService.utcToist(
                                  marker.updated_on,
                                  "dd-MMM"
                                )} ${timeService.utcToistTime(
                                  marker.updated_on,
                                  "HH:mm"
                                )}`
                              : "N/A"}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            <strong>Data Fetched At:</strong>{" "}
                            {marker.updated_at
                              ? `${timeService.utcToist(
                                  marker.updated_at,
                                  "dd-MMM"
                                )} ${timeService.utcToistTime(
                                  marker.updated_at,
                                  "HH:mm"
                                )}`
                              : "N/A"}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            <strong>ETA:</strong>{" "}
                            {marker.expd_arvl_time
                              ? `${timeService.utcToist(
                                  marker.expd_arvl_time,
                                  "dd-MMM"
                                )} ${timeService.utcToistTime(
                                  marker.expd_arvl_time,
                                  "HH:mm"
                                )}`
                              : "N/A"}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            <strong>Commodity:</strong>{" "}
                            {marker.commodity && marker.commodity.length > 0
                              ? marker.commodity.join(", ")
                              : "N/A"}
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            <strong>Remaining Distance:</strong>{" "}
                            {marker.rmng_km ? marker.rmng_km : "N/A"} km
                          </p>
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
