'use client'
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, LayersControl, Popup, GeoJSON, Polyline } from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-cluster";
import './MapLayers.css';
import { httpsGet, httpsPost } from "@/utils/Communication";
import getBoundary from "./IndianClaimed";
import coordsOfTracks from "./IndianTracks";
import { useWindowSize } from "@/utils/hooks";
import { MagnifyingGlass } from 'react-loader-spinner';
import pickupIcon from '../../assets/pickup_icon.svg'
import dropIcon from '@/assets/drop_icon.svg'
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Paper from "@mui/material/Paper";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InputLabel from '@mui/material/InputLabel';
import captiveRakeIndicator from '@/assets/captive_rakes.svg'
import { environment } from '@/environments/env.api'

import IdleIcon from "@/assets/idle_icon.svg";
import InactiveIcon from "@/assets/inactive_icon.svg";
import { countTracking, getCaptiveIndianRakes, trackingByFoisGpsHook } from '@/utils/hooks'

import { Icon, divIcon, point } from "leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Grid,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import SideDrawer from "@/components/Drawer/Drawer";
import Header from "@/components/Header/header";

import { DateTime } from "luxon";
import service from "@/utils/timeService";
import { statusBuilder } from "./StatusBuilder/StatusBuilder";
import Image from "next/image";
import TripTracker from './TripTracker';

// Custom Icons
const customIcon = L.icon({
  iconUrl: "assets/train_on_map_icon_idle.svg",
  iconSize: [38, 38], // adjust icon size as needed
  iconAnchor: [19, 38], // adjust anchor point as needed
  popupAnchor: [0, -38] // adjust popup anchor as needed
});

const customIconDelivered = L.icon({
  iconUrl: "/assets/train_on_map_icon_in_transit.svg",
  iconSize: [38, 38], // adjust icon size as needed
  iconAnchor: [19, 38], // adjust anchor point as needed
  popupAnchor: [0, -38] // adjust popup anchor as needed
});

const customIconIdle = L.icon({
  iconUrl: "/assets/train_on_map_icon.svg",
  iconSize: [38, 38], // adjust icon size as needed
  iconAnchor: [19, 38], // adjust anchor point as needed
  popupAnchor: [0, -38] // adjust popup anchor as needed
});

const createClusterCustomIconInTransit = function (cluster: any) {
  return divIcon({
    html: `<span class="cluster-icon-in-transit">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};
const createClusterCustomIconIdle = function (cluster: any) {
  return divIcon({
    html: `<span class="cluster-icon-idle">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};

const createClusterCustomIconDelivered = function (cluster: any) {
  return divIcon({
    html: `<span class="cluster-icon-delivered">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
}

const colorOfStatus = (status: string) => {
  switch (status) {
    case 'In Transit':
      return 'warning';
    case 'Delivered':
      return 'success';
    default:
      return 'info';
  }
}

const rakeTypes = [
  'Captive Rakes',
  'Indian Railway Rakes'
];


const MenuProps = {
  PaperProps: {
    style: {
      minWidth: '7%',
      width: '7%',
      marginTop: '4px',
      border: '1px solid grey'
    },
  },
};

interface ShipmentCardProps {
  index: number;
  shipment: any;
  handleShipmentSelection: (shipment: any) => void;
  handleNavigation: (unique_code: string) => void;
}

const ShipmentCard: React.FC<ShipmentCardProps> = ({
  index,
  shipment,
  handleShipmentSelection,
  handleNavigation
}) => {
  const gpsFOIS = (shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0
    && shipment.trip_tracker?.last_location?.fois) // Checking FOIS tracking
    || (shipment.trip_tracker?.last_location?.gps?.coordinates.length > 0
      && shipment.trip_tracker?.last_location?.gps); // Checking FOIS tracking
  const isTracking = gpsFOIS && gpsFOIS.coordinates.length > 0 ? true : false;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.stopPropagation();
    window.open(`${environment.PROD_BASE_URL}tracker?unique_code=${shipment.unique_code}`, '_blank');
  };

  return <Card style={{
    borderRadius: '10px',
    // marginTop: index == 0 ? '24px' : '15px',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '10px',
  }} className="cardHover" variant="outlined"
    onClick={(e) => {
      e.stopPropagation();
      handleShipmentSelection(shipment)
    }
    }
  >
    <div className={isTracking ? 'tracking-indication' : 'non-tracking-indication'}>
      {isTracking ? 'Tracking' : 'Non Tracking'}
    </div>
    <CardContent style={{ padding: '20px 20px 24px 20px' }}>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        <Grid container className="shipment-list-top">
          <Grid item xs={8}>
            <Image height={12} width={12} alt="loc" src={dropIcon} /> {shipment.trip_tracker?.fois_last_location || shipment.trip_tracker?.gps_last_location || shipment.status || 'In Plant'}
          </Grid>
          <Grid item xs={4} sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }}>
            {/* <Chip label="In Transit" variant="outlined" color="info" /> */}
            <Chip label={statusBuilder(shipment.status)} variant="outlined" color={colorOfStatus(statusBuilder(shipment.status))} id="chip-label" />
          </Grid>
        </Grid>
      </Typography>
      <Typography variant="h6" component="div" id="shipment-list-fnr" sx={{ fontFamily: '"Inter", sans-serif !important' }}>
        # {shipment.all_FNRs ? <a onClick={handleLinkClick} style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}>
          {shipment.all_FNRs[0]}
        </a> : 'N/A'}
        <span className="extraFnr-indicator">
          <span className="fnr-count">{shipment.all_FNRs && shipment.all_FNRs.length > 1 ? `+${shipment.all_FNRs.length - 1} more` : ''}</span>
          <span className="more-fnr-indicator">
            {shipment.all_FNRs && shipment.all_FNRs.length > 1 ? shipment.all_FNRs.slice(1).map((item: any, index: number) => {
              return <div key={index} className="each-fnr">{item}</div>
            }) : ''}
          </span>
        </span>
      </Typography>
      <Typography variant="body2" component="div">
        <Grid container >
          {/* <Grid item xs={12}>
            <Typography variant="body2" component="div" id="shipment-list-bottom">
              <Image height={10} alt="pickup" src={pickupIcon} /> - {shipment.pickup_location?.name} ({shipment.pickup_location?.code})
            </Typography>
          </Grid> */}
          <Grid item xs={12}>
            <Typography variant="body2" component="div" id="shipment-list-bottom">
              <Image height={10} alt="drop" src={dropIcon} /> - {shipment.delivery_location?.name} ({shipment.delivery_location?.code})
            </Typography>
          </Grid>
          <Grid item xs={12} sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }}>
            {shipment.is_captive && <div><img src={captiveRakeIndicator.src} /></div>}
          </Grid>
        </Grid>
      </Typography>
    </CardContent>
  </Card>
}

type StatusKey = 'OB' | 'ITNS' | 'Delivered' | 'none' | 'AVE';

const statusMapping: Record<StatusKey, string[]> = {
  OB: ['', 'OB'],
  ITNS: ['Delivered', '', 'OB'],
  Delivered: ['Delivered'],
  none: [''],
  AVE: ['AVE']
};

interface TrackingStatus {
  tracking: number;
  notTracking: number;
}
interface captive_rakes {
  captive: number;
  indian: number;
}
interface rakeType {
  captive: boolean;
  indian: boolean;
}

// Main Component for Map Layers
const MapLayers = () => {
  const mobile = !useMediaQuery("(min-width:800px)");
  const isMobile = useWindowSize(600);
  const [map, setMap] = useState<L.Map | null>(null);
  const center: [number, number] = [24.2654256, 78.9145218];
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [allShipments, setAllShipments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [inTransitCount, setInTransitCount] = useState<number>(0);
  const [idleCount, setIdleCount] = useState<number>(0);
  const [deliveryCount, setDeliveryCount] = useState<number>(0);
  const [idleShipments, setIdleShipments] = useState<any[]>([]);
  const [inTransitShipments, setInTransitShipments] = useState<any[]>([]);
  const [deliveredShipments, setDeliveredShipments] = useState<any[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<any[]>([]);
  const [searcedShipments, setSearchedShipments] = useState<any[]>([]);
  const [showSearched, setShowSearched] = useState<boolean>(false);
  const [showFiltered, setShowFiltered] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(true);
  const [isTotal, setIsTotal] = useState(true)
  const [showIdle, setShowIdle] = useState<boolean>(true);
  const [showInTransit, setShowInTransit] = useState<boolean>(true);
  const [showDelivered, setShowDelivered] = useState<boolean>(true);
  const [selectedFromDate, setSelectedFromDate] = React.useState<dayjs.Dayjs | null>(dayjs());
  const [selectedToDate, setSelectedToDate] = React.useState<dayjs.Dayjs | null>(dayjs());
  const [openFromDatePicker, setOpenFromDatePicker] = useState(false);
  const [openToDatePicker, setOpenToDatePicker] = useState(false);
  const [trackingNonTracking, setTrackingNonTracking] = useState<TrackingStatus>({ tracking: 0, notTracking: 0 });
  const [rakeType, setRakeType] = useState(['Captive Rakes', 'Indian Railway Rakes'])
  const [showRakeTypeFiltered, setShowRakeTypeFiltered] = useState(false)
  const [rakeTypeFilteredShipments, setRakeTypeFilteredShipments] = useState<any[]>([])
  const [isTracking, setIsTracking] = useState(0)
  const [filteredShipmentsBackup, setFilteredShipmentsBackup] = useState<any[]>([])

  const [selectedType, setSelectedType] = useState('FNR No.')
  const [searchInput, setSearchInput] = useState('')
  const router = useRouter();

  const [inPlantCaptive, setInPlantCaptive] = useState<captive_rakes>({ captive: 0, indian: 0 });
  const [inTransitCaptive, setInTransitCaptive] = useState<captive_rakes>({ captive: 0, indian: 0 });
  const [deliveredCaptive, setDeliveredCaptive] = useState<captive_rakes>({ captive: 0, indian: 0 });
  const [totalCaptive, setTotalCaptive] = useState<captive_rakes>({ captive: 0, indian: 0 });

  const [headingFilters, setHeadingFilters] = useState('');
  const [headingColors, setHeadingColors] = useState('');

  const [showSearchFNR, setShowSearchFNR] = useState(false)
  const [trackingByFoisGps, setTrackingByFoisGps] = useState<any>({ foiscount: 0, gpscount: 0 });
  const [trackingAvailed, setTrackingAvailed] = useState<any>(false);
  const [shipmentMapView, setShipmentMapView] = useState<any>([]);
  const [trackingTypeSelected, setTrackingTypeSelected] = useState<any>({ fois: false, gps: false });
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [hiddenTrackingInfo, setHiddenTrackingInfo] = useState<any>(false);

  const handleNavigation = (unique_code: string) => {
    setTimeout(() => {
      router.push(`/tracker?unique_code=${unique_code}`);
    }, 0);
  };


  const filterTypes = ["FNR No.", "Dest. Code"]

  function handleChange(event: any) {
    const type = event.target.value
    if (type !== selectedType) {
      setSelectedType(event.target.value)
      setSearchInput('')
    }
  }

  useEffect(() => {
    if (rakeType.length === 1) {
      let data
      let isCaptive = rakeType[0]
      if (showSearched) {
        data = searcedShipments.filter((val) => {
          if (isCaptive === 'Captive Rakes')
            return val.is_captive === true
          else
            return val.is_captive === false
        })
        setRakeTypeFilteredShipments(data)
      } else if (showFiltered) {
        data = filteredShipments.filter((val) => {
          if (isCaptive === 'Captive Rakes')
            return val.is_captive === true
          else
            return val.is_captive === false
        })
        setRakeTypeFilteredShipments(data)
      } else if (showAll) {
        data = allShipments.filter((val) => {
          if (isCaptive === 'Captive Rakes')
            return val.is_captive === true
          else
            return val.is_captive === false
        }
        )
        setRakeTypeFilteredShipments(data)
      }
      setShowRakeTypeFiltered(true)
    } else {
      setShowRakeTypeFiltered(false)
    }
  }, [rakeType, allShipments, searcedShipments, filteredShipments])

  useEffect(() => {
    setShowSearched(false)
    setSearchInput('')
  }, [allShipments, filteredShipments])

  function handleSearchInput(event: any) {
    const searchQuery = event.target.value;
    setSearchInput(searchQuery);
    setShowSearched(true);
    setShowRakeTypeFiltered(false)
    if (selectedType === "FNR No.") {
      if (showFiltered) {
        const filteredData = filteredShipments.filter((shipment) => {
          const data = shipment.all_FNRs.filter((fnr: String) =>
            fnr.toLowerCase().includes(searchQuery.toLowerCase())
          )
          return Boolean(data.length)
        }
        );
        setSearchedShipments(filteredData);
        setShowSearched(true);
      } else if (showAll) {
        const filteredData = allShipments.filter((shipment) => {
          const data = shipment?.all_FNRs?.filter((fnr: String) =>
            fnr.toLowerCase().includes(searchQuery.toLowerCase())
          )
          return Boolean(data.length)
        }
        );
        setSearchedShipments(filteredData);
        setShowSearched(true);
      }
      else {
        const filteredData = rakeTypeFilteredShipments.filter((shipment) => {
          const data = shipment?.all_FNRs?.filter((fnr: String) =>
            fnr.toLowerCase().includes(searchQuery.toLowerCase())
          )
          return Boolean(data.length)
        }
        );
        setSearchedShipments(filteredData);
        setShowSearched(true);
      }
    } else if (selectedType === "Dest. Code") {
      setShowSearched(true);
      if (showFiltered) {
        const filteredData = filteredShipments.filter((shipment) =>
          shipment?.delivery_location?.code
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
        setSearchedShipments(filteredData);
        setShowSearched(true);
      } else if (showAll) {
        const filteredData = allShipments.filter((shipment) =>
          shipment?.delivery_location?.code
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
        setSearchedShipments(filteredData);
        setShowSearched(true);
      } else {
        const filteredData = rakeTypeFilteredShipments.filter((shipment) =>
          shipment?.delivery_location?.code
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
        setSearchedShipments(filteredData);
        setShowSearched(true)
      }
    }
  }

  const geoJSONStyle: L.PathOptions = {
    color: 'black', // Set the color of train tracks
    weight: 3, // Set the thickness of the tracks
    opacity: 1, // Set the opacity
    fill: false, // Ensure the line is not filled
    dashArray: '2, 10', // Set the dash pattern to mimic railroad ties
    lineCap: 'square' as 'square', // This should be a LineCapShape
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

  const getTrackingShipment = (shipments: any[]) => {
    const shipmentData = shipments.sort((a: any, b: any) => {
      return a.created_at - b.created_at;
    }).map((shipment: any) => {
      return {
        _id: shipment && shipment._id,
        FNR: shipment && shipment.all_FNRs ? shipment.all_FNRs.join(', ') : '',
        pickup: shipment && shipment.pickup_location && shipment.pickup_location.name ? shipment.pickup_location.name + ' (' + shipment.pickup_location.code + ')' : '',
        delivery: shipment && shipment.delivery_location && shipment.delivery_location.name ? shipment.delivery_location.name + ' (' + shipment.delivery_location.code + ')' : '',
        status: shipment && shipment.status ? shipment.status : '',
        gps: shipment && (shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0 && shipment.trip_tracker?.last_location?.fois || shipment.trip_tracker?.last_location?.gps?.coordinates.length > 0 && shipment.trip_tracker?.last_location?.gps),
        tripTracker: shipment && shipment?.trip_tracker?.fois_last_location,
      }
    }).filter((shipment: any) => shipment.gps && shipment.gps.coordinates.length > 0);
    return shipmentData;
  }

  const filterShipments = (status: StatusKey, event: any) => {
    let filteredShipments: any[] = [];
    setIsTracking(0)
    if (status === 'AVE' || status === 'OB') {
      setHiddenTrackingInfo(false);
      setHeadingFilters('In Plant');
      setHeadingColors('#3790CC')
      filteredShipments = originalData.filter((shipment: any) => shipment.status === 'AVE' || shipment.status === 'OB');
      setTrackingNonTracking(countTracking(filteredShipments));
      setTrackingByFoisGps(trackingByFoisGpsHook(filteredShipments))
      setShipmentMapView(filteredShipments);
      setTrackingTypeSelected({ fois: false, gps: false });
      const idle = getTrackingShipment(filteredShipments);
      setIdleShipments(idle);
    } else if (status === 'ITNS') {
      setHiddenTrackingInfo(false);
      setHeadingFilters('In Transit');
      setHeadingColors('#F6981D')
      filteredShipments = originalData.filter((shipment: any) => shipment.status !== 'Delivered' && shipment.status !== '');
      setTrackingNonTracking(countTracking(filteredShipments));
      setTrackingByFoisGps(trackingByFoisGpsHook(filteredShipments))
      setShipmentMapView(filteredShipments);
      setTrackingTypeSelected({ fois: false, gps: false });
      const inTransit = getTrackingShipment(filteredShipments);
      setInTransitShipments(inTransit);
    } else if (status === 'Delivered') {
      setHeadingFilters('In Delivered');
      setHeadingColors('#40BE8A')
      filteredShipments = originalData.filter((shipment: any) => shipment.status === 'Delivered');
      setTrackingNonTracking(countTracking(filteredShipments));
      setTrackingByFoisGps(trackingByFoisGpsHook(filteredShipments))
      setShipmentMapView(filteredShipments);
      setTrackingTypeSelected({ fois: false, gps: false });
      const delivered = getTrackingShipment(filteredShipments);
      setDeliveredShipments(delivered);
    }

    setShowIdle(status === 'OB');
    setShowInTransit(status === 'ITNS');
    setShowDelivered(status === 'Delivered');
    setShowAll(false);
    setShowFiltered(true);
    const filteredWithTracking = filteredShipments.map((shipment) => {
      const gpsFois = shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0
        && shipment.trip_tracker?.last_location?.fois
        || shipment.trip_tracker?.last_location?.gps?.coordinates.length > 0
        && shipment.trip_tracker?.last_location?.gps;
      const isTracking = gpsFois && gpsFois.coordinates && gpsFois.coordinates.length > 0;
      return { ...shipment, isTracking }
    }
    )
    setFilteredShipments(filteredWithTracking);
    setFilteredShipmentsBackup(filteredWithTracking)
    map?.flyTo(center, 5, { duration: 1 });
  }

  const handleFromDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedFromDate(date);
  };

  const handleToDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedToDate(date);
  };

  const getShipments = async () => {
    const payload = {
      from: service.getEpoch(selectedFromDate),
      to: service.getEpoch(selectedToDate),
    };
    setIsTracking(0)
    const shipments = await httpsPost('/shipment_map_view', payload);
    const inTransit = shipments.filter((shipment: any) => (shipment.status !== 'Delivered' && shipment.status !== ''));
    const idle = shipments.filter((shipment: any) => (shipment.status === 'AVE' || shipment.status === ''));
    const delivered = shipments.filter((shipment: any) => (shipment.status === 'Delivered'));
    setTotalCount(shipments.length);
    setInTransitCount(inTransit.length);
    setIdleCount(idle.length);
    setDeliveryCount(delivered.length);

    setInTransitCaptive(getCaptiveIndianRakes(inTransit));
    setDeliveredCaptive(getCaptiveIndianRakes(delivered));
    setInPlantCaptive(getCaptiveIndianRakes(idle));
    setTotalCaptive(getCaptiveIndianRakes(shipments));

    setHeadingFilters('In Transit');
    setHeadingColors('#F6981D');
    setTrackingByFoisGps(trackingByFoisGpsHook(inTransit));
    setShipmentMapView(inTransit);
    setTrackingTypeSelected({ fois: false, gps: false });

    const inTransitShips = getTrackingShipment(inTransit);
    const idleShips = getTrackingShipment(idle);
    const deliveredShips = getTrackingShipment(delivered);
    setInTransitShipments(inTransitShips);
    setIdleShipments(idleShips);
    setDeliveredShipments(deliveredShips);
    setShowAll(true);
    setShowFiltered(false);
    setShowIdle(true);
    setShowInTransit(true);
    setShowDelivered(true);
    setTrackingNonTracking(countTracking(inTransit))

    const allShipmentsWithTracking = [...inTransit].map((shipment) => {
      const gpsFois = shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0
        && shipment.trip_tracker?.last_location?.fois
        || shipment.trip_tracker?.last_location?.gps?.coordinates.length > 0
        && shipment.trip_tracker?.last_location?.gps;
      const isTracking = gpsFois && gpsFois.coordinates && gpsFois.coordinates.length > 0;
      return { ...shipment, isTracking }
    })
    setOriginalData(allShipmentsWithTracking)
    setAllShipments(allShipmentsWithTracking)
  }

  useEffect(() => {
    if (map) {
      addIndiaBoundaries();
    }
  }, [map]);

  useEffect(() => {
    const toTime = dayjs();
    const fromTime = toTime.subtract(7, 'day');
    setSelectedFromDate(fromTime);
    setSelectedToDate(toTime);
  }, []);

  useEffect(() => {
    if (selectedFromDate && selectedToDate) {
      getShipments();
    }
  }, [selectedFromDate, selectedToDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (target && target.nodeType === Node.ELEMENT_NODE) {
        if (!(target as Element).closest('.table-rows-container')) {
          setSelectedShipment(null);
          if (selectedMarkerRef.current) {
            selectedMarkerRef.current.closePopup();
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleShipmentSelection = (shipment: any) => {
    if (selectedShipment && selectedShipment._id === shipment._id) {
      setSelectedShipment(null);
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.closePopup();
      }
      map?.flyTo(center, 5, { duration: 1 });
    } else {
      setSelectedShipment(shipment);
      focusOnShipment(shipment);
    }
  };

  const handleTrackingNonTracking = (isTracking: any) => {
    if (!isTracking) {
      setIdleShipments([]);
      setInTransitShipments([]);
      setDeliveredShipments([]);
      setTrackingAvailed(false);
      setHiddenTrackingInfo(false);
    }
    setIsTracking(isTracking ? 1 : 2)
    let trackingData;
    if (isTotal) {
      if (isTracking) { trackingData = allShipments.filter((shipment) => shipment.isTracking) }
      else
        trackingData = allShipments.filter((shipment) => !shipment.isTracking)
    } else {
      if (isTracking) {
        trackingData = filteredShipmentsBackup.filter((shipment) => shipment.isTracking);

      }
      else { trackingData = filteredShipmentsBackup.filter((shipment) => !shipment.isTracking); }
    }
    if (isTracking) {
      setIdleShipments(getTrackingShipment(trackingData));
      // setDeliveredShipments(getTrackingShipment(trackingData));
      setInTransitShipments(getTrackingShipment(trackingData));
      setTrackingAvailed(true);
      setHiddenTrackingInfo(true);
    }
    setTrackingTypeSelected({ fois: false, gps: false });

    setFilteredShipments(trackingData);
    setShowAll(false);
    setShowFiltered(true);

  }

  const focusOnShipment = (shipment: any) => {
    const gpsFois = shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0
      && shipment.trip_tracker?.last_location?.fois
      || shipment.trip_tracker?.last_location?.gps?.coordinates.length > 0
      && shipment.trip_tracker?.last_location?.gps;
    if (map && gpsFois && gpsFois.coordinates.length > 0) {
      const point = L.latLng(gpsFois.coordinates[1], gpsFois.coordinates[0]);
      map.flyTo(point, 13, { duration: 1 });

      setTimeout(() => {
        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.openPopup();
        }
      }, 1250);
    } else {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.closePopup();
      }
      map?.flyTo(center, 5, { duration: 1 });
    }
  };

  const handleTrackingFoisGps = (track: string) => {
    let trackingShipements;
    if (track === 'FOIS') {

      setTrackingTypeSelected((prevState: any) => {
        const newFoisValue = !prevState.fois;
        if (!newFoisValue) {
          setFilteredShipments(shipmentMapView);
        } else {
          trackingShipements = shipmentMapView.filter((shipment: any) => { return shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0 });
          setFilteredShipments(trackingShipements);
          setIdleShipments(getTrackingShipment(trackingShipements));
          setInTransitShipments(getTrackingShipment(trackingShipements));
          // setDeliveredShipments(getTrackingShipment(trackingShipements));

        }
        return { ...prevState, fois: newFoisValue, gps: false }
      });
    } else {

      setTrackingTypeSelected((prevState: any) => {
        const newGpsValue = !prevState.gps;
        if (!newGpsValue) {
          setFilteredShipments(shipmentMapView);
        } else {
          trackingShipements = shipmentMapView.filter((shipment: any) => { return shipment.trip_tracker?.last_location?.gps?.coordinates.length > 0 }).filter((shipment: any) => { return !(shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0) });
          setFilteredShipments(trackingShipements);
          setIdleShipments(getTrackingShipment(trackingShipements));
          setInTransitShipments(getTrackingShipment(trackingShipements));
          // setDeliveredShipments(getTrackingShipment(trackingShipements));
        }
        return { ...prevState, gps: newGpsValue, fois: false }
      });
    }
  }

  return (
    <div>
      <div className="shipment-map-container">
        {isMobile ? <SideDrawer /> : null}
        <div style={{ width: '100%', overflow: 'hidden' }}>
          {isMobile ? <Header title="Shipments Map View" isMapHelper={false} isShipmentMapView={true}></Header> : <MobileHeader />}
          <div style={{ paddingInline: 24, paddingTop: 24, paddingBottom: 65, position: 'relative' }}>
            <MapContainer className="map" id="shipment-map" center={center} zoom={5.4} style={{ minHeight: '105%', width: '101%', padding: '0px', zIndex: '0', position: 'fixed' }} attributionControl={false} ref={setMap} >
              <div className={"layersControl"} style={{ marginTop: '10px' }} >
                <LayersControl>
                  <LayersControl.BaseLayer checked name="Street View">
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Satellite View">
                    <TileLayer
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
              </div>
              <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIconIdle}>
                {showIdle && idleShipments.length && idleShipments.map((shipment, index) => {
                  return <Marker key={index} position={[shipment.gps.coordinates[1], shipment.gps.coordinates[0]]} icon={customIconIdle} ref={(el) => {
                    if (selectedShipment && selectedShipment._id === shipment._id) {
                      selectedMarkerRef.current = el;
                    }
                  }}>
                    <Popup>
                      <Typography variant="h6" component="div">
                        # {shipment.FNR}
                      </Typography>
                      <Typography variant="body2" component="div">
                        <Grid container>
                          {/* <Grid item xs={12}>
                                <Typography variant="body2" component="div">
                                  <Image height={10} alt="pickup" src={pickupIcon} /> - {shipment.pickup}
                                </Typography>
                              </Grid> */}
                          <Grid item xs={12}>
                            <Typography variant="body2" component="div" sx={{ display: 'flex' }}>
                              <div className='dropLabel'>D</div><div><Image height={10} alt="drop" src={dropIcon} /> - {shipment.delivery}</div>
                            </Typography>
                            <Typography sx={{ fontSize: '12px' }}>{shipment?.tripTracker}</Typography>
                          </Grid>
                        </Grid>
                      </Typography>
                    </Popup>
                  </Marker>
                })
                }
              </MarkerClusterGroup>
              <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIconInTransit}>
                {showInTransit && inTransitShipments.length && inTransitShipments.map((shipment, index) => {
                  return <Marker key={index} position={[shipment.gps.coordinates[1], shipment.gps.coordinates[0]]} icon={customIcon} ref={(el) => {
                    if (selectedShipment && selectedShipment._id === shipment._id) {
                      selectedMarkerRef.current = el;
                    }
                  }}>
                    <Popup>
                      <Typography variant="h6" component="div">
                        # {shipment.FNR}
                      </Typography>
                      <Typography variant="body2" component="div">
                        <Grid container>
                          {/* <Grid item xs={12}>
                                <Typography variant="body2" component="div">
                                  <Image height={10} alt="pickup" src={pickupIcon} /> - {shipment.pickup}
                                </Typography>
                              </Grid> */}
                          <Grid item xs={12}>
                            <Typography variant="body2" component="div" sx={{ display: 'flex' }}>
                              <div className='dropLabel'>D</div><div><Image height={10} alt="drop" src={dropIcon} /> - {shipment.delivery}</div>
                            </Typography>
                            <Typography sx={{ fontSize: '12px' }}>{shipment?.tripTracker}</Typography>
                          </Grid>
                        </Grid>
                      </Typography>
                    </Popup>
                  </Marker>
                })
                }
              </MarkerClusterGroup>
              {/* <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIconDelivered}>
                {showDelivered && deliveredShipments.length && deliveredShipments.map((shipment, index) => {
                  return <Marker key={index} position={[shipment.gps.coordinates[1], shipment.gps.coordinates[0]]} icon={customIconDelivered} ref={(el) => {
                    if (selectedShipment && selectedShipment._id === shipment._id) {
                      selectedMarkerRef.current = el;
                    }
                  }}>
                    <Popup>
                      <Typography variant="h6" component="div">
                        # {shipment.FNR}
                      </Typography>
                      <Typography variant="body2" component="div">
                        <Grid container>
                          <Grid item xs={12}>
                                <Typography variant="body2" component="div">
                                  <Image height={10} alt="pickup" src={pickupIcon} /> - {shipment.pickup}
                                </Typography>
                              </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" component="div" sx={{ display: 'flex' }}>
                              <div className='dropLabel'>D</div><div><Image height={10} alt="drop" src={dropIcon} /> - {shipment.delivery}</div>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Typography>
                    </Popup>
                  </Marker>
                })
                }
              </MarkerClusterGroup> */}
            </MapContainer>
            <Box sx={{
              position: 'absolute',
              top: '20%',
              right: '5%',
              width: '20%',
              height: '20%',
              zIndex: '1',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
            }}>
              InTransit: 20
            </Box>
            <Box sx={{
              marginLeft: '70px',
              width: '25%',
              backgroundColor: '#f6f8f8',
              position: 'absolute',
              left: '0',
              height: '100vh',
              padding: '10px',
              boxShadow: '0px 00px 10px 0px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
            }}
            >
              <Box className="date-range-container-heads" style={{width: '345px'}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    value={selectedFromDate}
                    onChange={handleFromDateChange}
                    format="DD/MM/YYYY"
                    open={openFromDatePicker}
                    onOpen={() => setOpenFromDatePicker(true)}
                    onClose={() => setOpenFromDatePicker(false)}
                    slotProps={{ textField: { placeholder: 'DD/MM/YYYY', onClick: () => setOpenFromDatePicker(!openFromDatePicker) }, }}
                    disableFuture={true}
                    sx={{
                      '& .MuiInputBase-input::placeholder': {
                        fontSize: '14px',
                        fontFamily: '"Inter", sans-serif !important',
                        fontWeight: '500',
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '14px',
                        height: '36px',
                        padding: '8px',
                        width: '180px',
                        boxSizing: 'border-box',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#E9E9EB',
                        },
                      },
                      '& .MuiButtonBase-root': {
                        height: '36px',
                        padding: '8px',
                        width: '36px',
                        boxSizing: 'border-box',
                      },
                    }}
                  />
                </LocalizationProvider>
                <div className="date-range-divider">
                  <SwapHorizIcon />
                </div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To"
                    value={selectedToDate}
                    onChange={handleToDateChange}
                    format="DD/MM/YYYY"
                    open={openToDatePicker}
                    onOpen={() => setOpenToDatePicker(true)}
                    onClose={() => setOpenToDatePicker(false)}
                    slotProps={{ textField: { placeholder: 'DD/MM/YYYY', onClick: () => setOpenToDatePicker(!openToDatePicker) }, }}
                    disableFuture={true}
                    sx={{
                      '& .MuiInputBase-input::placeholder': {
                        fontSize: '14px',
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '14px',
                        height: '36px',
                        padding: '8px',
                        width: '180px',
                        boxSizing: 'border-box',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#E9E9EB',
                        },
                      },
                      '& .MuiButtonBase-root': {
                        height: '36px',
                        padding: '8px',
                        width: '36px',
                        boxSizing: 'border-box',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>

              <Box className="shipment-heads">
                {/* <div className='shipment-head-fixed'>
                  <div style={{ backgroundColor: '#333333', position: 'relative' }} className='fixedHeadings'>Total {totalCount}
                    <div style={{ position: 'absolute', bottom: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: '500', textWrap: 'nowrap', }} >Indian Railway Rakes : {totalCaptive.indian}</div>
                      <div style={{ fontSize: '10px', fontWeight: '500', textWrap: 'nowrap' }}>Captive Rakes : {totalCaptive.captive}</div>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#40BE8A', position: 'relative' }} className='fixedHeadings'>Delivered {deliveryCount}
                    <div style={{ position: 'absolute', bottom: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: '500', textWrap: 'nowrap' }} >Indian Railway Rakes : {deliveredCaptive.indian}</div>
                      <div style={{ fontSize: '10px', fontWeight: '500', textWrap: 'nowrap' }}>Captive Rakes : {deliveredCaptive.captive}</div>
                    </div>
                  </div>
                </div> */}
                <div className='shipment-head-fixed'>
                  <div style={{ backgroundColor: '#3790CC', position: 'relative', cursor: 'pointer' }} className='fixedHeadings' onClick={(e) => {
                    filterShipments('AVE', e)
                    setIsTotal(false)
                  }} >In Plant {idleCount}
                    <div style={{ position: 'absolute', bottom: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: '500', textWrap: 'nowrap' }} >Indian Railway Rakes : {inPlantCaptive.indian}</div>
                      <div style={{ fontSize: '10px', fontWeight: '500', textWrap: 'nowrap' }}>Captive Rakes : {inPlantCaptive.captive}</div>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F6981D', position: 'relative', cursor: 'pointer' }} className='fixedHeadings' onClick={(e) => {
                    filterShipments('ITNS', e);
                    setIsTotal(false)
                  }}>In Transit {inTransitCount}
                    <div style={{ position: 'absolute', bottom: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: '500', textWrap: 'nowrap' }} >Indian Railway Rakes : {inTransitCaptive.indian}</div>
                      <div style={{ fontSize: '10px', fontWeight: '500', textWrap: 'nowrap' }}>Captive Rakes : {inTransitCaptive.captive}</div>
                    </div>
                  </div>
                </div>
              </Box>
              <Box className="tracking-nonTracking-status">
                <div className="tracking-status-wrapper">
                  <div className="search-fnr" onClick={() => { setShowSearchFNR(true) }} >Search FNR</div>
                  <Typography className="heading" style={{ backgroundColor: showSearchFNR ? '#F7EFE5' : headingColors, color: showSearchFNR ? 'black' : 'white' }} onClick={() => { setShowSearchFNR(false) }} >{headingFilters}</Typography>
                  <div className="content-wrapper" style={{ backgroundColor: headingColors, display: showSearchFNR ? 'none' : 'block' }}>
                    <div className="content-box">
                      <div style={{ backgroundColor: 'white', margin: '0px 2px 2px 2px', borderRadius: '4px', }} >

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div className={isTracking === 1 ? "tracking_firstSection active-tracking" : "tracking_firstSection"} id="tracking" onClick={() => handleTrackingNonTracking(true)}>
                            <Image src={IdleIcon} alt="" className="Image_idleIcon" width={32} height={32} />
                            <div className="">
                              <div style={{ fontWeight: 600, fontSize: 16 }}>{trackingNonTracking.tracking}</div>
                              <div style={{ fontSize: 12 }}>Tracking</div>
                            </div>
                          </div>
                          <div className={isTracking === 2 ? "tracking_secondSection active-nontracking" : "tracking_secondSection"} id="nonTracking" onClick={() => handleTrackingNonTracking(false)}>
                            <Image src={InactiveIcon} alt="" className="Image_idleIcon" width={32} height={32} />
                            <div className="">
                              <div style={{ fontWeight: 600, fontSize: 16 }}>{trackingNonTracking.notTracking}</div>
                              <div style={{ fontSize: 12 }}>Non Tracking</div>
                            </div>
                          </div>
                        </div>

                        <div className='rake_heading_title' style={{ display: hiddenTrackingInfo ? 'flex' : 'none' }} >Tracking Information</div>
                        <div className='rake_head_container' style={{ display: hiddenTrackingInfo ? 'flex' : 'none' }}>
                          <div className='rake_head indian_rake' onClick={() => {handleTrackingFoisGps('FOIS')}} style={{ cursor:'pointer', backgroundColor: trackingTypeSelected.fois ? '#B3A492' : '#EEE7DA' }}>
                            <div>Tracking By FOIS</div>
                            <div>{trackingByFoisGps.foiscount}</div>
                          </div>
                          <div className='rake_head indian_rake' onClick={() => {handleTrackingFoisGps('GPS')}} style={{ cursor: 'pointer', backgroundColor: trackingTypeSelected.gps ? '#B3A492' : '#EEE7DA' }}>
                            <div>Tracking By GPS</div>
                            <div>{trackingByFoisGps.gpscount}</div>
                          </div>
                        </div>


                      </div>
                    </div>
                  </div>
                  <div style={{ display: showSearchFNR ? 'block' : 'none' }}>
                    <div className='search-wrapper'>
                      <Select
                        labelId="demo-multiple-checkbox-label"
                        id="demo-multiple-checkbox"
                        value={selectedType}
                        className='status_select'
                        onChange={handleChange}
                        style={{ height: '28px', background: 'lightgray', width: "105px" }}
                        sx={{
                          '&.MuiPaper-root': {
                            border: '1px solid black'
                          }
                        }}
                        input={<OutlinedInput
                          sx={{
                            width: '120px',
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid #E9E9EB'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid #E9E9EB'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid #E9E9EB'
                            }
                          }}
                        />}
                        MenuProps={MenuProps}
                      >
                        {filterTypes.map((name) => (
                          <MenuItem key={name} value={name} sx={{ padding: 0, paddingLeft: '8px' }} >
                            <ListItemText primary={name} primaryTypographyProps={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }} />
                          </MenuItem>
                        ))}
                      </Select><input placeholder="search" value={searchInput} onInput={handleSearchInput} className='search-input' />
                    </div>
                  </div>
                </div>
              </Box>
              <Box sx={{
              }} className="shipment-details-container">
                {showFiltered && !showSearched && !showRakeTypeFiltered && filteredShipments.map((shipment, index) => {
                  return <ShipmentCard key={index} index={index} shipment={shipment} handleShipmentSelection={handleShipmentSelection} handleNavigation={handleNavigation} />
                })}
                {showAll && !showSearched && !showRakeTypeFiltered && allShipments.map((shipment, index) => {
                  return <ShipmentCard key={index} index={index} shipment={shipment} handleShipmentSelection={handleShipmentSelection} handleNavigation={handleNavigation} />
                })}
                {showSearched && !showRakeTypeFiltered && searcedShipments.map((shipment, index) => {
                  return <ShipmentCard key={index} index={index} shipment={shipment} handleShipmentSelection={handleShipmentSelection} handleNavigation={handleNavigation} />
                })}
                {showRakeTypeFiltered && rakeTypeFilteredShipments.map((shipment, index) => {
                  return <ShipmentCard key={index} index={index} shipment={shipment} handleShipmentSelection={handleShipmentSelection} handleNavigation={handleNavigation} />
                })}
              </Box>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapLayers;