'use client'
import './tripTracker.css'
import L from 'leaflet';
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

const statusBuilder = (status: string) => {
  if (!status) return "In Plant"
  if(status.toLowerCase() === "delivered") {
    return "Delivered";
  }
  return "In Transit"
}

const FNRDetailsCard = (props: any) => {
  const [fnrDetails, setFnrDetails] = useState<any>({
    FNR: "",
    status: "",
    no_of_wagons: 0,
    pickup: '',
    drop: '',
    trip_tracker: {},
  });

  useEffect(() => {
    const {
      FNR,
      status,
      no_of_wagons,
      pickup_location,
      delivery_location,
      trip_tracker,
    } = props.fnr_data;
    const pickup = pickup_location ? pickup_location.code +' - '+ pickup_location.name : '';
    const drop = delivery_location ? delivery_location.code +' - '+ delivery_location.name : '';
    setFnrDetails({
      FNR,
      status,
      no_of_wagons,
      pickup,
      drop,
      trip_tracker,
    });
  }, [props.fnr_data]);
  return (
    <React.Fragment>
      <CardContent className={props.className} >
        <Grid style={
          {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%',
                padding: '0px'

          }
        } container spacing={2}>
          <Grid item xs={6} >
            <Box style={
              {
                display: "flex",
                height: '24px',
                width: '100%',
                padding: '4px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5px',
                fontSize: '14px',
              }
            }>
              FNR No: #{fnrDetails.FNR}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box style={
            {
              display: "flex",
              backgroundColor: '#53F6AA',
              color: '#008E27',
              height: '24px',
              width: '85px',
              maxWidth: '100px',
              padding: '2px',
              float: "right",
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '5px',
              fontSize: '14px',
            }
          }>
          {statusBuilder(fnrDetails.status)}
          </Box>
          </Grid>
        </Grid>
        <hr></hr>
        <Grid container spacing={2} direction={"row"} color={"#42454E"} >
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={2}>
              <CardMedia
                component={"img"}
                src={pickupIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              />
            </Grid>
            <Grid item xs={10} fontSize={"10px"} >
                {fnrDetails.pickup}
            </Grid>
          </Grid>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={2}>
              <CardMedia
                component={"img"}
                src={dropIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              />
            </Grid>
            <Grid item xs={10} fontSize={"10px"} >
                {fnrDetails.drop}
            </Grid>
          </Grid>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={2}>
              <CardMedia
                component={"img"}
                src={wagonIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              />
            </Grid>
            <Grid item xs={10} fontSize={"10px"} >
                No of Wagons: <b>{fnrDetails.no_of_wagons}</b>
            </Grid>
          </Grid>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={2}>
              <CardMedia
                component={"img"}
                src={currentTrainLocationIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              />
            </Grid>
            <Grid item xs={10} fontSize={"10px"} >
                <b>Current Location: </b>
                  <br></br>
                  FOIS: <b> {fnrDetails.trip_tracker ? fnrDetails.trip_tracker.fois_last_location : 'N/A'} </b>
                  <br></br>
                  GPS: <b> {fnrDetails.trip_tracker ? fnrDetails.trip_tracker.gps_last_location : 'N/A'} </b>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </React.Fragment>
  )
};

const ActivityTimeLineChart = (props: any) => {
  // const dateConvertor = (date) => DateTime.fromISO(date).plus({minutes: 330}).toFormat("dd-MM-yyyy HH:mm");
  // const isMobile = props.mobile ? true : false;
  const numberOfStops = props.trackingDetails.length;
  const [startingPings, setStartingPings] = useState([]);
  const [endingPings, setEndingPings] = useState([]);
  const [showPings, setShowPings] = useState(false);
  const [lowPings, setLowPings] = useState(false);

  useEffect(() => {
    const data = props.trackingDetails;
    if (numberOfStops > 8) {
      setStartingPings(data.slice(0, 4))
      setEndingPings(data.slice(numberOfStops - 3, numberOfStops))
    } else {
      setLowPings(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfStops])
  const handleLoadMore = (e: any) => {
    e.preventDefault();
    setShowPings(!showPings);
  }
  return (<React.Fragment>
    <CardContent className={props.className} >
      <Grid style={
        {
              display: 'flex',
              marginTop: '-40px',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '80px',
              padding: '0px'
        }
      } container spacing={2}>
        <Grid item xs={12} style={
            {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }
          } >
          <Box style={
            {
              display: "flex",
              height: '24px',
              width: showPings ? '80%' :'100%',
              padding: '4px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '5px',
              fontSize: '14px',
            }
          }>
            List of stations it has stopped at
          </Box>
          {showPings && <Button variant="outlined" style={
            {
              display: "flex",
              height: '24px',
              width: '20%',
              padding: '4px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '5px',
              fontSize: '10px',
            }
          } onClick={handleLoadMore} >Show Less</Button>}
        </Grid>
      </Grid>
      <Grid container spacing={2} direction={"row"} color={"#42454E"} maxHeight={"70%"} justifyContent={"flex-start"} >
      {
          (lowPings || showPings) && props.trackingDetails.map((details: {currentStatus: string}, index: number) => {
            return (<Grid container spacing={2} item xs={12} key={index} >
              {/* <Grid justifyContent={"flex-end"} item xs={4} fontSize={"10px"} >
                {dateConvertor(details.created_at)}
              </Grid> */}
              <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={2}>
                <CardMedia
                  component={"img"}
                  src={pickupIcon}
                  sx={{
                    height: '10px',
                    width: '10px',
                    justifyContent: "center",
                  }}
                />
              </Grid>
              <Grid justifyContent={"flex-start"} item xs={10} fontSize={"10px"} >
                {details.currentStatus}
              </Grid>
            </Grid>)
          })
        }
        {
          (!showPings && startingPings.length) ? startingPings.map((details: { currentStatus: string } , index: number) => {
            return (<Grid container spacing={2} item xs={12} key={index} >
              {/* <Grid justifyContent={"flex-end"} item xs={4} fontSize={"10px"} >
                {dateConvertor(details.created_at)}
              </Grid> */}
              <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={2}>
                <CardMedia
                  component={"img"}
                  src={pickupIcon}
                  sx={{
                    height: '10px',
                    width: '10px',
                    justifyContent: "center",
                  }}
                />
              </Grid>
              <Grid justifyContent={"flex-start"} item xs={10} fontSize={"10px"} >
                {details.currentStatus}
              </Grid>
            </Grid>)
          }) : null
        }
        {!showPings && startingPings.length && endingPings.length ?
          <Grid item container spacing={2} display={"block"} xs={12} >
            <Grid item display={"flex"} margin-left={"20px"} justifyContent={"center"} height={'10px'}  alignItems={"center"} xs={10}>
                <CardMedia
                  component={"img"}
                  src={pickupIcon}
                  sx={{
                    height: '8px',
                    width: '8px',
                    justifyContent: "center",
                  }}
                />
            </Grid>
            <Grid item display={"flex"} justifyContent={"center"} height={'10px'}  alignItems={"center"} xs={10}>
                {/* <CardMedia
                  component={"img"}
                  src={pickupIcon}
                  sx={{
                    height: '8px',
                    width: '8px',
                    justifyContent: "center",
                  }}
                /> */}
                <ButtonBase style={{fontSize:'10px'}} onClick={handleLoadMore} >Load More</ButtonBase>
            </Grid>
            <Grid item display={"flex"} margin-left={"20px"} justifyContent={"center"} height={'10px'}  alignItems={"center"} xs={10}>
                <CardMedia
                  component={"img"}
                  src={pickupIcon}
                  sx={{
                    height: '8px',
                    width: '8px',
                    justifyContent: "center",
                  }}
                />
            </Grid>
          </Grid>
          :null}
        {
          (!showPings && endingPings.length) ? endingPings.map(( details: {currentStatus: string}, index: number) => {
            return (<Grid container spacing={2} item xs={12} key={index} >
              {/* <Grid justifyContent={"flex-end"} item xs={4} fontSize={"10px"} >
                {dateConvertor(details.created_at)}
              </Grid> */}
              <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={2}>
                <CardMedia
                  component={"img"}
                  src={pickupIcon}
                  sx={{
                    height: '10px',
                    width: '10px',
                    justifyContent: "center",
                  }}
                />
              </Grid>
              <Grid justifyContent={"flex-start"} item xs={10} fontSize={"10px"} >
                {details.currentStatus}
              </Grid>
            </Grid>)
          }) : null
        }
      </Grid>
    </CardContent>
  </React.Fragment>)
}

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
  // const mapRef = useRef<any>()
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
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
  const handleFoisCheck = (e: any) => {
    setShowFoisTracks(e.target.checked);
  }
  const handleGPSCheck = (e: any) => {
    setShowGPSTracks(e.target.checked);
  }
  const customIcon = new L.Icon({
    iconUrl: haltIcon,
    iconSize: [14, 14], // Size of the icon
    iconAnchor: [7, 14], // Anchor point of the icon, usually half of the size
    popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
  });
  const fetchData = () => {  
    const {
      rakeData,
      tracks,
    } = trip_tracker_data;
    setFnrData(rakeData);
    setTrackingData(tracks);
    if (tracks.length > 0) {
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

  // useEffect(() => {
  //   setTrackingLine(tracking_data.map((e: {geo_point: {coordinates: [number, number]}}) => [e.geo_point.coordinates[1],e.geo_point.coordinates[0]]))
  //   //@ts-ignore
  //   if (mapRef && mapRef.current && trackingLine.length > 0) {
  //     const bounds = L.latLngBounds(trackingLine);
  //     //@ts-ignore
  //     mapRef.current.fitBounds(bounds);
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [loadMap])

  const mobile = !useMediaQuery("(min-width:800px)");
  return (
    <>
      <TripTrackerNavbar />
      <Box
        sx={{
            height: mobile ? "90vh" : "100vh",
        }}
      > 
      <MapContainer className="map" center={center} zoom={5} style={{ minHeight: '105%',width: '101%', padding: '0px', zIndex: '0', position: 'fixed' }} attributionControl={false} ref={setMapRef} >
        <div className={"layersControl"} style={{marginTop:'60px'}} >
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
        </MapContainer>
        {loadMap && <FormGroup className='mapButtons'>
          <FormControlLabel
            disabled={!buttonEnabledGPS}
            control={<Switch checked={showGPSTracks} onChange={handleGPSCheck} />}
            label="Show GPS Tracks"
            labelPlacement="start"
          />
          <FormControlLabel
            disabled={!buttonEnabledFois}
            control={<Switch checked={showFoisTracks} onChange={handleFoisCheck} />}
            label="Show FOIS Tracks"
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
        <FNRDetailsCard className="fnr_details_mobile"  fnr_data={fnr_data} />
        <ActivityTimeLineChart className="tracking_details_mobile" trackingDetails={tracking_data} />
        </Box>)}
      </Box>
      {/* {mobile ? <Footer /> : <LeftDrawer />} */}
    </>
  );
};

export default TripTracker;
