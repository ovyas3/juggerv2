'use client'

import LeftDrawer from "../Drawer/Drawer";
import L from 'leaflet';
import { Box, Grid, Button, ButtonBase, CardMedia, IconButton, useMediaQuery } from "@mui/material";
import Footer from "../Footer/footer";
import { MapContainer, Marker, Popup, Polyline } from 'react-leaflet';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import React, { useEffect, useRef, useState } from "react";
import './tripTracker.css'
import { httpsGet } from "../../utils/Communication";
import pickupIcon from '@/assets/pickup_icon.svg'
import dropIcon from '@/assets/drop_icon.svg'
import wagonIcon from '@/assets/wagons_icon.svg'
import currentTrainLocationIcon from '@/assets/current_train_location_icon.svg'
import arrowUpIcon from '@/assets/arrowUp.svg'
import arrowDownIcon from '@/assets/arrowDown.svg'
import mapViewIcon from '@/assets/map_view_icon.svg'
import haltIcon from '@/assets/halt_icon.svg';
import mapPlaceHolder from '@/assets/mapPlaceHolder.svg';
import mapPathIcon from '@/assets/mapPath.svg';
import { statusBuilder } from '../MapView/StatusBuilder/StatusBuilder';
// import { RenderMarkers } from '../MapView/RenderMarkers/RenderMarkers';
import { FNRDetailsCard } from '../MapView/FnrDetailsCard/FnrDetailsCard';
import { ActivityTimeLineChart } from '../MapView/ActivityTimeLineChart/ActivityTimeLineChart';
import { TripTrackerNavbar } from '../MapView/TripTrackerNavbar/TripTrackerNavbar';
import Image from 'next/image';
import MapLayers from "../../MapsHelper/MapLayers";


const renderMarkers = (tracking_data: any[], customIcon: L.Icon): JSX.Element[] => {
  return tracking_data.map((point, index) => (
    <Marker key={index} position={[point.geo_point.coordinates[1], point.geo_point.coordinates[0]]} icon={customIcon}>
      <Popup>
          {point.currentStatus}
      </Popup>
    </Marker>
  ));
};

const TripTracker = (params: any) => {
  const center: [number, number] = [24.2654256,78.9145218];
  const mapRef = useRef<any>()
  // get unique code from route params
  // const queryParameters = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  // const unique_code = queryParameters ? queryParameters.get("unique_code") : null;
  // console.log("uniqueCode", params);
  const unique_code = params.uniqueCode;
  // console.log("unique_code", `${unique_code}`);
  // console.log(unique_code);
  const [loadMap, setLoadMap] = useState(false);
  const [fnr_data, setFnrData] = useState({});
  const [firstTrackingDetails, setFirstTrackingDetails] = useState({});
  const [lastTrackingDetails, setLastTrackingDetails] = useState({});
  const [tracking_data, setTrackingData] = useState<any>([]);
  const [trackingLine, setTrackingLine] = useState<[number, number][]>([]);
  const [showDetails, setShowDetails] = useState(true);
  const customIcon = new L.Icon({
    iconUrl: haltIcon,
    iconSize: [14, 14], // Size of the icon
    iconAnchor: [7, 14], // Anchor point of the icon, usually half of the size
    popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
  });
  useEffect(() => {
    const fetchData = async () => {
      const response = await httpsGet(
        `tracker?unique_code=${unique_code}`
      );
      
      const {
        rakeData,
        tracks,
      } = response.data;
      setFnrData(rakeData);
      setTrackingData(tracks);
      setFirstTrackingDetails(tracks[0]);
      setLastTrackingDetails(tracks[tracks.length - 1]);
    };
    fetchData();
  }, [unique_code]);

  useEffect(() => {
    setTrackingLine(tracking_data.map((e: {geo_point: {coordinates: [number, number]}}) => [e.geo_point.coordinates[1],e.geo_point.coordinates[0]]))
    if (mapRef.current && trackingLine.length > 0) {
      const bounds = L.latLngBounds(trackingLine);
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
            height: mobile ? "90vh" : "100vh",
        }}
      > 
        {loadMap ?
          <MapContainer className="map" center={center} zoom={5} style={{ minHeight: '100%', width: '100%', padding: '0px', zIndex: 0, position: "fixed" }} attributionControl={false} ref={mapRef}>
                <MapLayers />
                {/* <Polygon pathOptions={{ color: 'blue' }} positions={pickupgeofence_decoded} /> */}
                {renderMarkers(tracking_data, customIcon)}
                {trackingLine.length && <Polyline pathOptions={{ color:'red'}} positions={trackingLine} />}
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
                Click the button to see the vehicle on the map.
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
            width: mobile ? "100%" : "25%",
            display: "flex",
            alignItems: "center",
            background: "#F0F3F9",
            backgroundColor: "#F8F8F8",
            p: 0,
            flexDirection: "column",
            zIndex: 10,
            position: mobile ? "absolute" : 'fixed',
            // borderRadius: "10px 10px 0px 0px",
            marginLeft: mobile ? '0px' : '0px',
            marginTop: mobile ? '0px' : '41px',
        
          }}

          className="tracking_details"
        >
        <FNRDetailsCard className="fnr_details_mobile"  fnr_data={fnr_data} firstTrackingDetails={firstTrackingDetails} lastTrackingDetails={lastTrackingDetails} />
        <ActivityTimeLineChart className="tracking_details_mobile" trackingDetails={tracking_data} />
        </Box>)}
      </Box>
      {/* {mobile ? <Footer /> : <LeftDrawer />} */}
    </>
  );
};

export default TripTracker;
