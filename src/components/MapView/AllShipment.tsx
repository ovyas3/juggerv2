'use client'
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
  iconUrl: "/assets/train_on_map_icon_in_transit.svg",
  iconSize: [38, 38], // adjust icon size as needed
  iconAnchor: [19, 38], // adjust anchor point as needed
  popupAnchor: [0, -38] // adjust popup anchor as needed
});

const customIconDelivered = L.icon({
  iconUrl: "/assets/train_on_map_icon_in_delivered.svg",
  iconSize: [38, 38], // adjust icon size as needed
  iconAnchor: [19, 38], // adjust anchor point as needed
  popupAnchor: [0, -38] // adjust popup anchor as needed
});

const customIconIdle = L.icon({
  iconUrl: "/assets/train_on_map_icon_idle.svg",
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

const ShipmentCard = ({ index, shipment }: {index: number, shipment: any}) => {
  return <Card style={{
    padding: '5px',
    borderRadius: '10px',
    marginTop: index == 0 ? '40px' :'15px',
  }} className="cardHover" variant="outlined" >
    <CardContent >
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        <Grid container sx={{
          padding: '5px',
          borderRadius: '5px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Grid item xs={8}>
            <Image height={12} width={12} alt="loc" src={dropIcon} /> {shipment.trip_tracker?.fois_last_location || shipment.trip_tracker?.gps_last_location || shipment.status || 'In Plant' }
          </Grid>
          <Grid item xs={4}>
            {/* <Chip label="In Transit" variant="outlined" color="info" /> */}
            <Chip label={statusBuilder(shipment.status)} variant="outlined" color={colorOfStatus(statusBuilder(shipment.status))} />
          </Grid>
        </Grid>
      </Typography>
      <Typography variant="h6" component="div">
        # {shipment.all_FNRs ? shipment.all_FNRs[0]: 'N/A'}
      </Typography>
      <Typography variant="body2" component="div">
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body2" component="div">
              <Image height={10} alt="pickup" src={pickupIcon} /> - {shipment.pickup_location?.name} ({shipment.pickup_location?.code})
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" component="div">
            <Image height={10} alt="drop" src={dropIcon} /> - {shipment.delivery_location?.name} ({shipment.delivery_location?.code})
            </Typography>
          </Grid>
        </Grid>
      </Typography>
    </CardContent>
  </Card>
}

// Main Component for Map Layers
const MapLayers = () => {
    const mobile = !useMediaQuery("(min-width:800px)");
    const isMobile = useWindowSize(600);
    const [map, setMap] = useState<L.Map | null>(null);
    const center: [number, number] = [24.2654256,78.9145218];
    const selectedMarkerRef = useRef<L.Marker | null>(null);
    const [allShipments, setAllShipments] = useState<any[]>([]);
    const [shipments, setShipments] = useState<any[]>([]);
    const [inTransitCount, setInTransitCount] = useState<number>(0);
    const [idleCount, setIdleCount] = useState<number>(0);
    const [deliveryCount, setDeliveryCount] = useState<number>(0);
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
          FNR: shipment.all_FNRs.join(', '),
          pickup: shipment.pickup_location.name + ' (' + shipment.pickup_location.code + ')',
          delivery: shipment.delivery_location.name + ' (' + shipment.delivery_location.code + ')',
          status: shipment.status,
          gps: shipment.trip_tracker?.last_location?.fois ||  shipment.pickup_location?.geo_point
        }
      }).filter((shipment: any) => shipment.gps && shipment.gps.coordinates.length > 0);

      return shipmentData;
    }

    const filterShipments = (status: string) => {
      const filtered = allShipments.filter((shipment: any) => {
        switch (status) {
          case 'OB':
            return shipment.status == '' || shipment.status == 'OB';
          case 'ITNS':
            return shipment.status != 'Delivered' && shipment.status != '' && shipment.status != 'OB';
          case 'Delivered':
            return shipment.status == 'Delivered';
          default:
            return true;
        }
      });
      const ships = getTrackingShipment(filtered);
      setShipments(ships);
    }

    const getShipments = async () => {
      const shipments = await httpsPost('/shipment_map_view', {});
      const inTransit = shipments.filter((shipment: any) => (shipment.status !== 'Delivered' && shipment.status !== ''));
      const idle = shipments.filter((shipment: any) => (shipment.status === ''));
      const delivered = shipments.filter((shipment: any) => (shipment.status === 'Delivered'));
      setInTransitCount(inTransit.length);
      setIdleCount(idle.length);
      setDeliveryCount(delivered.length);
      setAllShipments([...inTransit, ...idle, ...delivered]);
      const ships = getTrackingShipment(shipments);
      setShipments(ships);
    }

    useEffect(() => {
      if (map) {
        addIndiaBoundaries();
      }
      getShipments();
    }, [map]);

    return (
      <div>
        <div className="map-container">
          {isMobile ? <SideDrawer /> : null}
          <div style={{ width: '100%', overflow: 'hidden' }}>
            {isMobile ? <Header title="Shipments Map View" isMapHelper={false}></Header> : <MobileHeader />}
            <div style={{ paddingInline: 24, paddingTop: 24, paddingBottom: 65,  position:'relative' }}>
              <MapContainer className="map" center={center} zoom={5.4} style={{ minHeight: '105%',width: '101%', padding: '0px', zIndex: '0', position: 'fixed' }} attributionControl={false} ref={setMap} >
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
                <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIconInTransit}>
                {
                  shipments.length && shipments.map((shipment, index) => {
                      return <Marker key={index} position={[shipment.gps.coordinates[1], shipment.gps.coordinates[0]]} icon={shipment.status == '' ? customIconIdle : customIcon}>
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
                overflowY: 'scroll',
              }} >
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  padding: '5px',
                  borderRadius: '5px',
                  backgroundColor: 'white',
                  marginBottom: '10px',
                  marginTop: '30px',
                  height: '100px',
                  position: 'sticky',
                }}>
                  <Paper sx={{
                    padding: '10px',
                    borderRadius: '5px',
                    color: 'white',
                    backgroundColor: '#3790cc',
                  }} onClick={() => filterShipments('OB')}  elevation={3} color="info">
                    <Typography variant="h6" color="info" component="div">
                      In Plant
                    </Typography>
                    <Typography variant="h6" color="info" component="div">
                      {idleCount}
                    </Typography>
                  </Paper>
                  <Paper sx={{
                    padding: '10px',
                    borderRadius: '5px',
                    color: 'white',
                    backgroundColor: '#FF981A',
                  }} onClick={() => filterShipments('ITNS')} elevation={3} color="info">
                    <Typography variant="h6" component="div">
                      In Transit
                    </Typography>
                    <Typography variant="h6" component="div">
                      {inTransitCount}
                    </Typography>
                  </Paper>
                  <Paper sx={{
                    padding: '10px',
                    borderRadius: '5px',
                    color: 'white',
                    backgroundColor: '#18BE8A',
                  }} onClick={() => filterShipments('Delivered')}  elevation={3} color="info">
                    <Typography variant="h6" component="div">
                      Delivered
                    </Typography>
                    <Typography variant="h6" component="div">
                      {deliveryCount}
                    </Typography>
                  </Paper>
                </Box>
                {allShipments.map((item, index) => {
                  return <ShipmentCard key={index} index={index} shipment={item} />
                })}
              </Box>
            </div>
          </div>
        </div>
      </div>
    );
}

export default MapLayers;