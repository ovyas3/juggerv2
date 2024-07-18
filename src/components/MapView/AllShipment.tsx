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
    Chip,
    Grid,
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
  const gps = shipment.trip_tracker?.last_location?.fois || shipment.pickup_location?.geo_point;
  const isTracking = gps && gps.coordinates.length > 0 ? true : false;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.stopPropagation();
    handleNavigation(shipment.unique_code);
  };

  return <Card style={{
    borderRadius: '10px',
    marginTop: index == 0 ? '24px' :'15px',
    position: 'relative',
    overflow: 'hidden', 
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
    <CardContent style={{padding: '20px 20px 24px 20px'}}>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        <Grid container className="shipment-list-top">
          <Grid item xs={8}>
            <Image height={12} width={12} alt="loc" src={dropIcon} /> {shipment.trip_tracker?.fois_last_location || shipment.trip_tracker?.gps_last_location || shipment.status || 'In Plant' }
          </Grid>
          <Grid item xs={4} sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }}>
            {/* <Chip label="In Transit" variant="outlined" color="info" /> */}
            <Chip label={statusBuilder(shipment.status)} variant="outlined" color={colorOfStatus(statusBuilder(shipment.status))} id="chip-label"/>
          </Grid>
        </Grid>
      </Typography>
      <Typography variant="h6" component="div" id="shipment-list-fnr" sx={{fontFamily: '"Inter", sans-serif !important'}}>
      # {shipment.all_FNRs ?
          <a onClick={handleLinkClick} style={{ cursor: 'pointer' }}>
            {shipment.all_FNRs[0]}
          </a> : 'N/A'}
      </Typography>
      <Typography variant="body2" component="div">
        <Grid container >
          <Grid item xs={12}>
            <Typography variant="body2" component="div" id="shipment-list-bottom">
              <Image height={10} alt="pickup" src={pickupIcon} /> - {shipment.pickup_location?.name} ({shipment.pickup_location?.code})
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" component="div" id="shipment-list-bottom">
            <Image height={10} alt="drop" src={dropIcon} /> - {shipment.delivery_location?.name} ({shipment.delivery_location?.code})
            </Typography>
          </Grid>
        </Grid>
      </Typography>
    </CardContent>
  </Card>
}

type StatusKey = 'OB' | 'ITNS' | 'Delivered';

const statusMapping: Record<StatusKey, string[]> = {
  OB: ['', 'OB'],
  ITNS: ['Delivered', '', 'OB'],
  Delivered: ['Delivered']
};

// Main Component for Map Layers
const MapLayers = () => {
    const mobile = !useMediaQuery("(min-width:800px)");
    const isMobile = useWindowSize(600);
    const [map, setMap] = useState<L.Map | null>(null);
    const center: [number, number] = [24.2654256,78.9145218];
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
    const [showFiltered, setShowFiltered] = useState<boolean>(false);
    const [showAll, setShowAll] = useState<boolean>(true);
    const [showIdle, setShowIdle] = useState<boolean>(true);
    const [showInTransit, setShowInTransit] = useState<boolean>(true);
    const [showDelivered, setShowDelivered] = useState<boolean>(true);
    const [selectedFromDate, setSelectedFromDate] = React.useState<dayjs.Dayjs | null>(dayjs());
    const [selectedToDate, setSelectedToDate] = React.useState<dayjs.Dayjs | null>(dayjs());
    const [openFromDatePicker,setOpenFromDatePicker] = useState(false);
    const [openToDatePicker,setOpenToDatePicker] = useState(false);
    const router = useRouter();

    const handleNavigation = (unique_code: string) => {
      setTimeout(() => {
        router.push(`/tracker?unique_code=${unique_code}`);
      }, 0);
    };

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
      const shipmentData = shipments.sort((a : any, b: any) => {
        return a.created_at - b.created_at;
      }).map((shipment: any) => {
        return {
          _id: shipment && shipment._id,
          FNR: shipment && shipment.all_FNRs ? shipment.all_FNRs.join(', ') : '',
          pickup: shipment && shipment.pickup_location && shipment.pickup_location.name ? shipment.pickup_location.name + ' (' + shipment.pickup_location.code + ')' : '',
          delivery: shipment && shipment.delivery_location && shipment.delivery_location.name ? shipment.delivery_location.name + ' (' + shipment.delivery_location.code + ')' : '',
          status: shipment && shipment.status ? shipment.status : '',
          gps: shipment && shipment.trip_tracker?.last_location?.fois ||  shipment.pickup_location?.geo_point
        }
      }).filter((shipment: any) => shipment.gps && shipment.gps.coordinates.length > 0);
      return shipmentData;
    }

    const filterShipments = (status: StatusKey) => {
      let filteredShipments: any[] = [];
      if (status === 'OB') {
        filteredShipments = allShipments.filter((shipment: any) => shipment.status === '');
        const idle = getTrackingShipment(filteredShipments);
        setIdleShipments(idle);
      } else if (status === 'ITNS') {
        filteredShipments = allShipments.filter((shipment: any) => shipment.status !== 'Delivered' && shipment.status !== '');
        const inTransit = getTrackingShipment(filteredShipments);
        setInTransitShipments(inTransit);
      } else if (status === 'Delivered') {
        filteredShipments = allShipments.filter((shipment: any) => shipment.status === 'Delivered');
        const delivered = getTrackingShipment(filteredShipments);
        setDeliveredShipments(delivered);
      }
    
      setShowIdle(status === 'OB');
      setShowInTransit(status === 'ITNS');
      setShowDelivered(status === 'Delivered');
      setShowAll(false);
      setShowFiltered(true);
      setFilteredShipments(filteredShipments);
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
      const shipments = await httpsPost('/shipment_map_view', payload);
      const inTransit = shipments.filter((shipment: any) => (shipment.status !== 'Delivered' && shipment.status !== ''));
      const idle = shipments.filter((shipment: any) => (shipment.status === ''));
      const delivered = shipments.filter((shipment: any) => (shipment.status === 'Delivered'));
      setTotalCount(shipments.length);
      setInTransitCount(inTransit.length);
      setIdleCount(idle.length);
      setDeliveryCount(delivered.length);
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

      setAllShipments([...inTransit, ...idle, ...delivered]);
    }

    useEffect(() => {
      if (map) {
        addIndiaBoundaries();
      }
    }, [map]);

    useEffect(() => {
      const toTime = dayjs();
      const fromTime = toTime.subtract(30, 'day');
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
      if(selectedShipment && selectedShipment._id === shipment._id) {
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

    const focusOnShipment = (shipment: any) => {
      const gps = shipment.trip_tracker?.last_location?.fois || shipment.pickup_location?.geo_point;
      if (map && gps && gps.coordinates.length > 0) {
        const point = L.latLng(gps.coordinates[1], gps.coordinates[0]);
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

    return (
      <div>
        <div className="shipment-map-container">
          {isMobile ? <SideDrawer /> : null}
          <div style={{ width: '100%', overflow: 'hidden' }}>
            {isMobile ? <Header title="Shipments Map View" isMapHelper={false}></Header> : <MobileHeader />}
            <div style={{ paddingInline: 24, paddingTop: 24, paddingBottom: 65,  position:'relative' }}>
              <MapContainer className="map" id="shipment-map" center={center} zoom={5.4} style={{ minHeight: '105%',width: '101%', padding: '0px', zIndex: '0', position: 'fixed' }} attributionControl={false} ref={setMap} >
                <div className={"layersControl"} style={{marginTop:'10px'}} >
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
                { showIdle && idleShipments.length && idleShipments.map((shipment, index) => {
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
                              <Grid item xs={12}>
                                <Typography variant="body2" component="div">
                                  <Image height={10} alt="pickup" src={pickupIcon} /> - {shipment.pickup}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" component="div">
                                <Image height={10} alt="drop" src={dropIcon} /> - {shipment.delivery}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Typography>
                        </Popup>
                      </Marker>
                  })
                }
                </MarkerClusterGroup>
                <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIconInTransit}>
                { showInTransit && inTransitShipments.length && inTransitShipments.map((shipment, index) => {
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
                              <Grid item xs={12}>
                                <Typography variant="body2" component="div">
                                  <Image height={10} alt="pickup" src={pickupIcon} /> - {shipment.pickup}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" component="div">
                                <Image height={10} alt="drop" src={dropIcon} /> - {shipment.delivery}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Typography>
                        </Popup>
                      </Marker>
                  })
                }
                </MarkerClusterGroup>
                <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIconDelivered}>
                { showDelivered &&  deliveredShipments.length && deliveredShipments.map((shipment, index) => {
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
                                <Typography variant="body2" component="div">
                                <Image height={10} alt="drop" src={dropIcon} /> - {shipment.delivery}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Typography>
                        </Popup>
                      </Marker>
                  })
                }
                </MarkerClusterGroup>
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
                
              }} 
              >
                <Box className="date-range-container-heads">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                    label="From"
                    value={selectedFromDate}
                    onChange={handleFromDateChange}
                    format="DD/MM/YYYY"
                    open={openFromDatePicker}
                    onOpen={() => setOpenFromDatePicker(true)}
                    onClose={() => setOpenFromDatePicker(false)}
                    slotProps={{ textField: { placeholder: 'DD/MM/YYYY', onClick: () => setOpenFromDatePicker(!openFromDatePicker) },}}
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
                          width: '140px',
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
                      slotProps={{ textField: { placeholder: 'DD/MM/YYYY', onClick: () => setOpenToDatePicker(!openToDatePicker) },}}
                      disableFuture={true}
                      sx={{
                        '& .MuiInputBase-input::placeholder': {
                            fontSize: '14px',
                        },
                        '& .MuiInputBase-input': {
                            fontSize: '14px',
                            height: '36px',
                            padding: '8px',
                            width: '140px',
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
                <Paper className="shipment-head-lists"
                      onClick={() => {
                        getShipments();
                        map?.flyTo(center, 5, { duration: 1 });
                        }}  elevation={3} color="info">
                    <Typography variant="h6" color="info" component="div" className="shipment-head-list-texts">
                      Total
                    </Typography>
                    <Typography variant="h6" color="info" component="div" className="shipment-head-list-texts">
                      {totalCount}
                    </Typography>
                  </Paper>
                  <Paper className="shipment-head-lists"
                      onClick={() => filterShipments('OB')}  elevation={3} color="info">
                    <Typography variant="h6" color="info" component="div" className="shipment-head-list-texts">
                      In Plant
                    </Typography>
                    <Typography variant="h6" color="info" component="div" className="shipment-head-list-texts">
                      {idleCount}
                    </Typography>
                  </Paper>
                  <Paper className="shipment-head-lists" 
                      onClick={() => filterShipments('ITNS')} elevation={3} color="info">
                    <Typography variant="h6" component="div" className="shipment-head-list-texts">
                      In Transit
                    </Typography>
                    <Typography variant="h6" component="div" className="shipment-head-list-texts">
                      {inTransitCount}
                    </Typography>
                  </Paper>
                  <Paper className="shipment-head-lists" 
                      onClick={() => filterShipments('Delivered')}  elevation={3} color="info">
                    <Typography variant="h6" component="div" className="shipment-head-list-texts">
                      Delivered
                    </Typography>
                    <Typography variant="h6" component="div" className="shipment-head-list-texts">
                      {deliveryCount}
                    </Typography>
                  </Paper>
                </Box>
                <Box sx={{
                  maxHeight: 'calc(75vh - 60px)',
                  overflowY: 'scroll',
                }} className="shipment-details-container">
                  {showFiltered && filteredShipments.map((shipment, index) => {
                    return <ShipmentCard key={index} index={index} shipment={shipment} handleShipmentSelection={handleShipmentSelection}  handleNavigation={handleNavigation} />
                  })}
                  {showAll && allShipments.map((shipment, index) => {
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