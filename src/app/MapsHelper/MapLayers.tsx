"use client"

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, LayersControl, Popup, GeoJSON, Polyline } from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-cluster";
import './MapLayers.css';
import { httpGet } from "../..//utils/Communication";

import deliveryIcon from '../../assets/deliveryIcon.svg';

import getBoundary from "./IndianClaimed";
import coordsOfTracks from "./IndianTracks";

import {MagnifyingGlass} from 'react-loader-spinner';

import { Icon, divIcon, point } from "leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
    Box,
    Grid,
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

// Custom Icons
const customIcon = L.icon({
  iconUrl: "/assets/train_on_map_icon.svg",
  iconSize: [38, 38], // adjust icon size as needed
  iconAnchor: [19, 38], // adjust anchor point as needed
  popupAnchor: [0, -38] // adjust popup anchor as needed
});


const useWindowSize = (width: number): Boolean => {
  const [isWide, setIsWide] = useState(window.innerWidth >= width);

  useEffect(() => {
    const handleResize = () => {
      setIsWide(window.innerWidth >= width);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [width]);

  return isWide;
};

const createClusterCustomIconInTransit = function (cluster: any) {
  return divIcon({
    html: `<span class="cluster-icon-in-transit">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};


// Main Component for Map Layers
const MapLayers = () => {
    const mobile = !useMediaQuery("(min-width:800px)");
    const isMobile = useWindowSize(600);
    const [map, setMap] = useState<L.Map | null>(null);
    const center: [number, number] = [24.2654256,78.9145218];
    const [showTracks, setShowTracks] = useState<boolean>(false);
    const [coords, setCoords] = useState<any>({});
    const [allRakes, setAllRakes] = useState<any>([]);
    const [showRoute, setShowRoute] = useState(false);
    const [route, setRoute] = useState([]);
    const [currentLocation, setCurrentLocation] = useState<any>([]);
    const [showStations, setShowStations] = useState(false);
    const [showRouteFor, setShowRouteFor] = useState<any>(null);
    const [allStations, setAllStations] = useState([]);
    const [showAllRakes, setShowAllRakes] = useState(false);
    const [allRakesPositions, setAllRakesPositions] = useState<any>([]);
    const [list, setList] = useState<any>([]);
    const [loading, setLoading] = useState(true);

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

    const getRakeShipmentDatas = async () => {
      try {
        setLoading(true);
        const res = await httpGet('v1/all_captive_shipment_details', 1);
        res.map((data: any) => {
          if (data && data.rake_updates) {
            if (!coords[data.name]) {
              coords[data.name] = [];
            }
            coords[data.name].push(
              {
                "rake_id": data.rake_id,
                "geo_point": data.rake_updates.geo_point,
                "time_stamp": {
                  "$date": data.rake_updates.updated_at
                }
              }
            );
          }
          if (!allRakes.some((item: any) => item.rake_id === data.rake_id)) {
            allRakes.push({
              "rake_id": data.rake_id,
              "name": data.name,
            });
          }
        });
        setAllRakes(allRakes);
        setCoords(coords);
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setLoading(false);
      }
  }

    const handleApiByWagonNo = (name: string) => {
      if (!showRoute) {
        const coordsData = coords[name];
        if (coordsData.length) {
          const sortedData = coordsData.sort((a: any, b: any) => new Date(b.time_stamp.$date).getTime() - new Date(a.time_stamp.$date).getTime());
          const lastCords = sortedData[0]
          setRoute(sortedData.map((item: any) => [item.geo_point.coordinates[1], item.geo_point.coordinates[0]]))
          setCurrentLocation([{
            data: {
              title: name,
              ts: DateTime.fromJSDate(new Date(lastCords.time_stamp.$date)).toFormat('dd/MM/yyyy HH:mm')
            },
            coords: [lastCords.geo_point.coordinates[1], lastCords.geo_point.coordinates[0]]
          }]);
          setShowRouteFor(name);
        }
      }
      else {
        setRoute([]);
        setCurrentLocation([]);
        setShowRouteFor(null);
      }
      setShowRoute(!showRoute);
      setShowAllRakes(false);
    }

    const allLastLocationForAll = () => {
      let allLocations = [];
      for (let key in coords) {
        const sortedData = coords[key].sort((a:any, b:any) => a.time_stamp - b.time_stamp);
        const lastCords = sortedData[0];
        allLocations.push({
          data: {
            title: key,
            ts: DateTime.fromJSDate(new Date(lastCords.time_stamp.$date)).toFormat('dd/MM/yyyy HH:mm')
          },
          coords: [lastCords.geo_point.coordinates[1], lastCords.geo_point.coordinates[0]]
        });
      }
      const allRakesData = [];
      for (const rake of allRakes) {
        const lastTimeStamp = allLocations.find(loc => loc.data.title === rake.name);
        const tracking = lastTimeStamp ? true : false;
        allRakesData.push({ 
          id: rake.rake_id,
          ts: lastTimeStamp && lastTimeStamp.data ? lastTimeStamp.data.ts : '',
          title: rake.name,
          value: '16',
          color: '#334FFC',
          accent_color: '#334FFC1F',
          text_color: '#131722',
          tracking: tracking,
        });
      }
      setAllRakesPositions(allLocations);
      setShowAllRakes(true);
      setList(allRakesData);
    }

    useEffect(() => {
      getRakeShipmentDatas();
    }, []);

    useEffect(() => {
      addIndiaBoundaries();
      setTimeout(() => {
        allLastLocationForAll();
      } , 300);
    }, [map]);

    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <MagnifyingGlass
             visible={true}
             height="100"
             width="100"
             ariaLabel="magnifying-glass-loading"
             wrapperStyle={{}}
             wrapperClass="magnifying-glass-wrapper"
             glassColor="#c0efff"
             color="#e15b64"
             />
        </div>
      );
    }

    return (
      <div>
        <SideDrawer />
      <Box
        sx={{
            marginTop: mobile ? "150px" : "56px",
            height: "90vh",
            p: 0,
            display: "flex",
            flexDirection: "column",
            zIndex: 0,
            justifyContent: 'center',
            alignItems: "center",
            alignContent: 'space-around',
            background:'red',
            position:'relative'
        }}
      >
        <Grid style={{
        position: 'absolute',
        height:'90%',
        width: '350px',
        background: 'white',
        left: '70px',
        top: '3%',
        overflowX: 'auto',
        zIndex:10
      }}  >
        <Grid>
          <h3 style={{marginLeft:'10px', marginTop: '1em', marginBottom: '1em'}}>Filters</h3>
          {/* //add a slider for toggle */}
      
          {/* show all tracks------------- */}
          <div style={{ borderBottom: '0.1px solid lightgrey',margin:'5px'}}>
            <FormControl component="fieldset">
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={showTracks} onChange={() => setShowTracks(!showTracks)} />}
                  label="Show All Tracks"
                  labelPlacement="start"
                />
              </FormGroup>
              <FormGroup>
                  <FormControlLabel
                    control={<Switch checked={showAllRakes} onChange={() => setShowAllRakes(!showAllRakes)} />}
                    label="Show All Rakes"
                    labelPlacement="start"
                  />
                </FormGroup>
            </FormControl>
          </div>
          {/* list----------- */} 
          <div style={{ borderBottom: '0.1px solid lightgrey',margin:'5px'}}>
              <div style={{margin:'5px'}}>Total Rakes: {list.length}</div>
              <div style={{margin:'5px'}}>Currently Tracking: {allRakesPositions.length}</div>
          </div>
          {
             list.length && list.map((item: any, index: number)=>{
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: item.tracking ? "#F1F1F1" : "lightgray",
                      marginInline: "5px",
                      marginBlock: "7px",
                      padding: "3px 13px",
                      borderRadius: "5px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "15px",
                      overflowX: "auto",
                    }}
                  >
                    <div className="details">
                      <div>
                        <b>Rake ID:</b> {item.title}
                      </div>
                    </div>
                    <FormControlLabel
                      disabled={!item.tracking}
                      control={
                        <Switch
                          checked={showRouteFor === item.title}
                          onChange={() => handleApiByWagonNo(item.title)}
                        />
                      }
                      label="Show Route"
                      labelPlacement="start"
                    />
                  </div>
                );
              })
            }
        </Grid>
      </Grid>
      <MapContainer className="map" center={center} zoom={5} style={{ minHeight: '100%', width: '100%', padding: '0px', zIndex: 0, position: "fixed" }} attributionControl={false} ref={setMap} >
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
          {showTracks && <GeoJSON data={coordsOfTracks} style={geoJSONStyle} />}
          {showRoute && route.length && <Polyline pathOptions={{ color:'blue' }} positions={route} />}
          {currentLocation.length && currentLocation.map((cr:any, index: number) => <Marker key={index} position={cr.coords} icon={customIcon}>
                <Popup>
                  <h3 style={{marginTop: '1em', marginBottom: "1em"}}>Rake ID: {cr.data.title}</h3>
                  <h4 style={{marginTop: '1em', marginBottom: "1em"}}>Last Updated At: {cr.data.ts}</h4>
                </Popup>
              </Marker>)}
          {showAllRakes && <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIconInTransit}
          >
            {/* Mapping through the markers */}
            {showAllRakes && allRakesPositions.map((rake:any, index: number) => <Marker key={index} position={rake.coords} icon={customIcon}>
            <Popup>
              <h3 style={{marginTop: '1em', marginBottom: "1em"}}>Rake ID: {rake.data.title}</h3>
              <hr></hr>
              <h4 style={{marginTop: '1em', marginBottom: "1em"}}>Last Updated At: {rake.data.ts}</h4>
            </Popup>
          </Marker>)}
            
          </MarkerClusterGroup>}
            
      </MapContainer>
      </Box>
      </div>
    );
}



export default MapLayers;