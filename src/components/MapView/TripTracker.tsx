'use client'
import './tripTracker.css'
import { Icon, latLngBounds } from 'leaflet';
import { Box, Grid, Button, IconButton, useMediaQuery, CardContent, CardMedia, ButtonBase, FormControlLabel, FormGroup, Switch } from "@mui/material";
import { MapContainer, Marker, Popup, Polyline, LayersControl, TileLayer } from 'react-leaflet';
import React, { useEffect, useRef, useState } from "react";
import pickupIcon from '../../assets/pickup_icon.svg'
import dropIcon from '../../assets/drop_icon.svg'
import wagonIcon from '../../assets/wagons_icon.svg'
import currentTrainLocationIcon from '../../assets/current_train_location_icon.svg'
import arrowUpIcon from '../../assets/arrowUp.svg'
import arrowDownIcon from '../../assets/arrowDown.svg'
import mapViewIcon from '../../assets/map_view_icon.svg'
import haltIcon from '../../assets/halt_icon.svg';
import mapPlaceHolder from '../../assets/mapPlaceholder.svg';
import mapPathIcon from '../../assets/mapPath.svg';
import TripTrackerNavbar from './TripTrackerNavbar/TripTrackerNavbar';
import Image from 'next/image';
import { FNRDetailsCard } from './FnrDetailsCard/FnrDetailsCard';
import { ActivityTimeLineChart } from './ActivityTimeLineChart/ActivityTimeLineChart';
import { statusBuilder } from './StatusBuilder/StatusBuilder';
import 'leaflet/dist/leaflet.css';
import service from '@/utils/timeService';
import polyline from '@mapbox/polyline';

const renderMarkers = (tracking_data: any[], customIcon: Icon): JSX.Element[] => {
  return tracking_data.map((point, index) => (
    <Marker key={index} position={[point.geo_point.coordinates[1], point.geo_point.coordinates[0]]} icon={customIcon}>
      <Popup>
          Current Status: {point.currentStatus.split(/ on /i)[0]}
          <br />
          <hr />
          Updated At: { service.utcToist(point.time_stamp, 'dd-MM-yyyy HH:mm') }
      </Popup>
    </Marker>
  ));
};

const TripTracker = (params: any) => {
  const center: [number, number] = [24.2654256,78.9145218];
  const mapRef = useRef<any>()
  const trip_tracker_data = params.trip_tracker_data;
  const [loadMap, setLoadMap] = useState(false);
  const [fnr_data, setFnrData] = useState({});
  const [tracking_data, setTrackingData] = useState<any>([]);
  const [trackingLine, setTrackingLine] = useState<[number, number][]>([]);
  const [showDetails, setShowDetails] = useState(true);
  const [showFoisTracks, setShowFoisTracks] = useState(false);
  const [showGPSTracks, setShowGPSTracks] = useState(false);
  const [buttonEnabledFois, setButtonEnabledFois] = useState(false);
  const [buttonEnabledGPS, setButtonEnabledGPS] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [currentLocation, setCurrentLocation] = useState<any>({});
  const [track, setTrack] = useState<any>([])
  const [newGPSTrack, setNewGPSTrack] = useState<any>([]);
  const handleFoisCheck = (e: any) => {
    setShowFoisTracks(e.target.checked);
  }
  const handleGPSCheck = (e: any) => {
    setShowGPSTracks(e.target.checked);
  }
  const customIcon = new Icon({
    iconUrl: '/assets/halt_icon.svg',
    iconSize: [14, 14], // Size of the icon
    iconAnchor: [7, 14], // Anchor point of the icon, usually half of the size
    popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
  });
  const currentTrainLocation = new Icon({
    iconUrl: '/assets/current_train_location_icon.svg',
    iconSize: [30, 30], // Size of the icon
    iconAnchor: [15, 30], // Anchor point of the icon, usually half of the size
    popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
  });
  const fetchData = () => {  
    const {
      rakeData,
      tracks,
    } = trip_tracker_data || {};
    setFnrData(rakeData);
    
    const tripTrackerLine = rakeData && rakeData.trip_tracker ?  rakeData.trip_tracker.polyline || '' : '';
    const decodedCoordinates = polyline.decode(tripTrackerLine) || [];
    setTrack(decodedCoordinates);

    const tripTrackerLine1 = rakeData ? rakeData.polyline || '' : '';
    const decodeline = polyline.decode(tripTrackerLine1) || [];
    setNewGPSTrack(decodeline);
    // remove tracks if currentStatus is empty or its misisng geo_point ir if geo_point.coordinates is empty or if its length is less than 2 or if geo_point.coordinates ==[0, 0]
    const tracksWithStatus = tracks.filter((track: any) => {
      if (!track.currentStatus || track.currentStatus === '') {
        return false;
      }
      return true;
    });
    const filteredTracks = tracksWithStatus.filter((track: any) => {
      if (!track.geo_point || !track.geo_point.coordinates || track.geo_point.coordinates.length < 2 || track.geo_point.coordinates[0] === 0 || track.geo_point.coordinates[1] === 0) {
        return false;
      }
      return true;
    });
    console.log({tracksWithStatus, filteredTracks})
    setTrackingData(filteredTracks);
    setActivityData(tracksWithStatus);
    const lastLocation = filteredTracks[0];
    setCurrentLocation(lastLocation);
    if (filteredTracks.length > 0) {
      setButtonEnabledFois(true);
    }

    const trip_tracker_gps = rakeData.trip_tracker ? rakeData.trip_tracker.gps_updated_at : false;
    if (trip_tracker_gps) {
      setButtonEnabledGPS(true);
    }
    // setFirstTrackingDetails(tracks[0]);
    // setLastTrackingDetails(tracks[tracks.length - 1]);
  };
  useEffect(() => {
    fetchData();
  }, [trip_tracker_data]);

  useEffect(() => {
    setTrackingLine(tracking_data.map((e: {geo_point: {coordinates: [number, number]}}) => [e.geo_point.coordinates[1],e.geo_point.coordinates[0]]))
    if (mapRef.current && trackingLine.length > 0) {
      const bounds = latLngBounds(trackingLine);
      mapRef.current.fitBounds(bounds);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMap])

  const mobile = !useMediaQuery("(min-width:800px)");
  return (
    <>
      <TripTrackerNavbar />
      <Box
        sx={{
            marginTop: mobile ? "150px" : "75px",
            height: mobile ? "90vh" : "100vh",
        }}
      > 
        {loadMap ?
          <MapContainer className="map" center={center} zoom={5} style={{ minHeight: '100%', width: '100%', padding: '0px', zIndex: 0, position: "fixed" }} attributionControl={false} ref={mapRef}>
                <LayersControl >
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
                {/* <Polygon pathOptions={{ color: 'blue' }} positions={pickupgeofence_decoded} /> */}
                { showFoisTracks &&  renderMarkers(tracking_data, customIcon)}
                { showGPSTracks &&  track.length && <Polyline pathOptions={{ color:'red'}} positions={track} />}
                { showFoisTracks &&  trackingLine.length && <Polyline pathOptions={{ color:'red'}} positions={trackingLine} />}
                { showFoisTracks && <Marker position={[currentLocation.geo_point.coordinates[1], currentLocation.geo_point.coordinates[0]]} icon={currentTrainLocation}>
                  <Popup>
                      Current Status: {currentLocation.currentStatus.split(/ on /i)[0]}
                      <br />
                      <hr />
                      Updated At: { service.utcToist(currentLocation.time_stamp, 'dd-MM-yyyy HH:mm') }
                  </Popup>
                </Marker>}
          </MapContainer>
          :
          <Box
            sx={{
              height: mobile ? "90vh" : "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",    
              alignItems: "center",
              background: "#F0F3F9",
              p: 1,
              width: '100%',
              zIndex: 0,
              position: mobile ? "relative" : "fixed",
            }}
            style={{
              backgroundImage: `url(${mapPlaceHolder})`,
            }}
          >
            <Grid style={{
              height: mobile ? '26px' : '70px',
              fontSize: '14px',
              display: "flex",
              marginBottom: mobile ? "30px" : "23px",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }} container spacing={1} justifyContent={"center"}>
              <Grid style={{
                display: 'flex',
                marginLeft: '300px',
                alignItems: 'center',
                justifyContent: 'center',
              }} item xs={12}>
                {/* <CardMedia
                  component={"img"}
                  src={mapPathIcon}
                  style={{
                    height: mobile ? '32px' : '64px',
                    width: mobile ? '32px' : '64px',
                  }}
                ></CardMedia> */}
                <Image
                    src={ mapPathIcon }
                    alt="Map Path Icon"
                    width={30}
                    height={30}
                  />
              </Grid>
              <Grid style={{
                textAlign: 'center',
                marginLeft: mobile ? "0px" : "300px",
                fontSize: mobile ? '1em' : '1.5em',
                color: '#42454E',
              }} item xs={8}>
                Click the button to see the Train on the map.
              </Grid>
            </Grid>
            <Button style={{
              height: mobile ? '26px' : '50px',
              width: mobile ? '130px': '150px',
              fontSize: '14px',
              display: "flex",
              marginLeft: mobile ? "0px" : "300px",
              marginBottom: mobile ? "200px" : "0px",
              justifyContent: "space-between",
              alignContent: "center",
              alignItems: "center",
            }} variant="contained" onClick={() => setLoadMap(true)}>
              {/* <CardMedia
              component={"img"}
              src={mapViewIcon}
              style={{
                height: mobile ? '24px' : '30px',
                width: mobile ? '24px' : '30px',
              }}
              ></CardMedia> */}
              <Image
                  src={ mapViewIcon }
                  alt="Map Path Icon"
                  width={30}
                  height={30}
              />
              Map View
            </Button>
          </Box>
        }
        {loadMap && <FormGroup className='mapButtons'>
          <FormControlLabel
            disabled={!buttonEnabledGPS}
            control={<Switch checked={showGPSTracks} onChange={handleGPSCheck} />}
            label="Show GPS Pings"
            labelPlacement="start"
          />
          <FormControlLabel
            disabled={!buttonEnabledFois}
            control={<Switch checked={showFoisTracks} onChange={handleFoisCheck} />}
            label="Show FOIS Pings"
            labelPlacement="start"
          />
        </FormGroup>}
        {mobile && <Box
        sx={{
          zIndex: 10,
          height: '40px',
          width: "100%",
          display: "flex",
          alignItems: "center",
          position: 'absolute',
          top: showDetails ? '46.5%' : '88%',
        }}
        >
          <IconButton style={{
            height: '65px',
            width: '110px',
            zIndex: 13,
            left: '39%',
          }}
          onClick={() => setShowDetails(!showDetails)}
          >
            {/* <CardMedia
              component={"img"}
              src={showDetails ? arrowDownIcon : arrowUpIcon}
              sx={{
                justifyContent: "center",
              }}
            /> */}
            <Image
              src={ showDetails ? arrowDownIcon : arrowUpIcon }
              alt="Map Path Icon"
              width={10}
              height={10}
            />
          </IconButton>
        </Box>}
        {(!mobile || showDetails) && (<Box
          sx={{
            top: mobile ? "50%" : "4%",
            minHeight: mobile ? "70%" : "92%",
            marginBottom: '10vh',
            width: mobile ? "100%" : "28%",
            display: "flex",
            alignItems: "center",
            background: "#F0F3F9",
            backgroundColor: "#F8F8F8",
            p: 0,
            flexDirection: "column",
            zIndex: 10,
            position: mobile ? "absolute" : 'fixed',
            marginTop: mobile ? '0px' : '20px',
          }}
          className="tracking_details"
        >
        <FNRDetailsCard className="fnr_details_mobile"  fnr_data={fnr_data} />
        <ActivityTimeLineChart className="tracking_details_mobile" trackingDetails={activityData} />
        </Box>)}
      </Box>
      {/* {mobile ? <Footer /> : <LeftDrawer />} */}
    </>
  );
};

export default TripTracker;
