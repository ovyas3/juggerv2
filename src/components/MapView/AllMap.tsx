'use client'
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, LayersControl, Popup, GeoJSON, Polyline } from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-cluster";
import './MapLayers.css';
import { httpsGet } from "@/utils/Communication";
import getBoundary from "./IndianClaimed";
import coordsOfTracks from "./IndianTracks";
import { useWindowSize } from "@/utils/hooks";
import { MagnifyingGlass } from 'react-loader-spinner';

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Tooltip } from '@mui/material';

import { Icon, divIcon, point } from "leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { makeStyles } from "@mui/material";
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

import Image from "next/image";
import IdleIcon from "@/assets/idle_icon.svg";
import InactiveIcon from "@/assets/inactive_icon.svg";

import { DateTime } from "luxon";
import service from "@/utils/timeService";
import { all } from "axios";

// Custom Icons
const customIcon = L.icon({
  iconUrl: "/assets/train_on_map_icon_in_transit.svg",
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

const createClusterCustomIconTracking = function (cluster: any) {
  return divIcon({
    html: `<span class="cluster-icon-tracking-mapshelper">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};
const createClusterCustomIconIdle = function (cluster: any) {
  return divIcon({
    html: `<span class="cluster-icon-idle-mapshelper">${cluster.getChildCount()}</span>`,
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
    const [allRakesBackUp, setAllRakesBackUp] = useState<any>([]);
    const [showRoute, setShowRoute] = useState(false);
    const [route, setRoute] = useState([]);
    const [currentLocation, setCurrentLocation] = useState<any>([]);
    const [showStations, setShowStations] = useState(false);
    const [showRouteFor, setShowRouteFor] = useState<any>(null);
    const [allStations, setAllStations] = useState([]);
    const [allIdleRakes, setAllIdleRakes] = useState<any>([]);
    const [allNonTrackingRakes, setAllNonTrackingRakes] = useState<any>([]);
    const [showAllRakes, setShowAllRakes] = useState(false);
    const [allRakesPositions, setAllRakesPositions] = useState<any>([]);
    const [list, setList] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRake, setSelectedRake] = useState<any>(null);
    const selectedMarkerRef = useRef<L.Marker | null>(null);
    const [selectedType,setSelectedType] = useState('total')

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
        // setLoading(true);
        const res = await httpsGet('get/maps/captive_rakes', 0);
        const data = res.data;
        data.map((data: any) => {
          if (data && data.rake_updates && data.rake_id) {
            const isDuplicate = Object.values(coords).flat().some((item: any) => item.rake_id === data.rake_id);

            if (!isDuplicate) {
              if (!coords[data.name]) {
                coords[data.name] = [];
              }

              coords[data.name].push(
                {
                  "rake_id": data.rake_id,
                  "geo_point": data.rake_updates.geo_point,
                  "time_stamp": {
                    "$date": data.rake_updates.gps_updated_at
                  }
                }
              );
            }
          }
          if (!allRakes.some((item: any) => item.rake_id === data.rake_id)) {
            const gpsUpdateTime = DateTime.fromJSDate(new Date(data.rake_updates.gps_updated_at));
            const currentTime = DateTime.local();
            const diff = currentTime.diff(gpsUpdateTime, ['hours', 'minutes']);
            const diffInHours = Math.floor(diff.hours);
            const diffInMinutes = Math.floor(diff.minutes) % 60;
            const hours = isNaN(diffInHours) ? 'N/A' : `${diffInHours} hr`;
            const minutes = isNaN(diffInMinutes) ? '' : `${diffInMinutes} min`;
            const timeSinceUpdate = `${hours} ${minutes}`;

            allRakes.push({
              "rake_id": data.rake_id,
              "name": data.name,
              "hours": timeSinceUpdate,
              "fnr_no": data.shipment ? data.shipment.FNR : 'N/A',
            });
          }

        });
        const allRakesFiltered = allRakes.filter((rake: any) => rake.rake_id !== undefined);
        setAllRakes(allRakesFiltered);
        setAllRakesBackUp(allRakesFiltered)
        setCoords(coords);
      } catch (error) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
  }

    function handleFilter(type: string) {
      map?.flyTo(center, 5, { duration: 1 });
      if (type === 'total') {
        setAllRakes(allRakesBackUp);
        setSelectedType('total');
      } else if (type === 'tracking') {
        const filteredData = allRakesBackUp.filter((rake: { name: any }) => {
          const lastTimeStamp = allRakesPositions.find(
            (val: { data: { title: any } }) => val.data.title === rake.name
          );
          if (lastTimeStamp) {
            return true;
          }
          return false;
        });
        setAllRakes(filteredData);
        setSelectedType('tracking');
      } else if (type === 'idle&non-tracking') {
        const rakeIds = allIdleRakes.map(
          (item: { rake_id: any }) => item.rake_id
        );
      
        const filteredDataIdle = allRakesBackUp.filter(
          (item: { rake_id: unknown }) => {
            return rakeIds.includes(item.rake_id);
          }
        );
      
        const filteredDataNonTracking = allRakesBackUp.filter(
          (rake: { hours: string }) => {
            return rake.hours && parseFloat(rake.hours.split("h")[0]) > 24;
          }
        );
      
        const combinedData = [...filteredDataIdle, ...filteredDataNonTracking];
      
        setAllRakes(combinedData);
        setSelectedType('idle&non-tracking');
      } else if (type === 'idle') {
        const rakeIds = allIdleRakes.map(
          (item: { rake_id: any }) => item.rake_id
        );
        const filteredData = allRakesBackUp.filter(
          (item: { rake_id: unknown }) => {
            return rakeIds.includes(item.rake_id);
          }
        );
        setAllRakes(filteredData);
        setSelectedType('idle');
      } else if (type === 'non-tracking') {
        const filteredData = allRakesBackUp.filter(
          (rake: { hours: string }) => {
            return rake.hours && parseFloat(rake.hours.split("h")[0]) > 24;
          }
        );
        setAllRakes(filteredData);
        setSelectedType('non-tracking');
      }
    }

    const handleApiByWagonNo = (name: string) => {
      if (!showRoute) {
        const coordsData = coords[name];
        if (coordsData.length) {
          const sortedData = coordsData.sort((a: any, b: any) => new Date(b.time_stamp.$date).getTime() - new Date(a.time_stamp.$date).getTime());
          const lastCords = sortedData[0];
          const date = service.utcToist(lastCords.time_stamp.$date, 'dd/MM/yyyy');
          const time = service.utcToistTime(lastCords.time_stamp.$date, 'HH:mm');

          const formattedDateTime = `${date} ${time}`;
          setRoute(sortedData.map((item: any) => [item.geo_point.coordinates[1], item.geo_point.coordinates[0]]))
          setCurrentLocation([{
            data: {
              title: name,
              // ts: DateTime.fromJSDate(new Date(lastCords.time_stamp.$date)).toFormat('dd/MM/yyyy HH:mm')
              ts: formattedDateTime
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
      let allIdleRakes = []; 
      for (let key in coords) {
        const sortedData = coords[key].sort((a:any, b:any) => a.time_stamp - b.time_stamp);
        const lastCords = sortedData[0];
        const date = service.utcToist(lastCords.time_stamp.$date, 'dd/MM/yyyy');
        const time = service.utcToistTime(lastCords.time_stamp.$date, 'HH:mm');

        const formattedDateTime = `${date} ${time}`;
       if(lastCords.geo_point && lastCords.geo_point.coordinates && lastCords.geo_point.coordinates[0] && lastCords.geo_point.coordinates[1] && lastCords.time_stamp && lastCords.time_stamp.$date) {
        if (service.differenceToday(lastCords.time_stamp.$date, 0, 'hours') < -3 && service.differenceToday(lastCords.time_stamp.$date, 0, 'hours') > -24) {
          allIdleRakes.push({
            rake_id: coords[key][0].rake_id,
            data: {
              title: key,
              ts: formattedDateTime
            },
            coords: [lastCords.geo_point.coordinates[1], lastCords.geo_point.coordinates[0]]
          });
        } else if (service.differenceToday(lastCords.time_stamp.$date, 0, 'hours') > -3) {
          allLocations.push({
            rake_id: coords[key][0].rake_id,
            data: {
              title: key,
              ts: formattedDateTime
            },
            coords: [lastCords.geo_point.coordinates[1], lastCords.geo_point.coordinates[0]]
          });
        } 
       }
      }
      const allRakesData = [];
      for (const rake of allRakes) {
        const lastTimeStamp = allLocations.find(loc => loc.data.title === rake.name);
        const tracking = lastTimeStamp ? true : false;
        allRakesData.push({ 
          id: rake.rake_id,
          ts: lastTimeStamp && lastTimeStamp.data ? lastTimeStamp.data.ts : '',
          title: rake.rake_id,
          value: '16',
          color: '#334FFC',
          accent_color: '#334FFC1F',
          text_color: '#131722',
          tracking: tracking,
        });
      }

      setAllRakesPositions(allLocations);
      setAllIdleRakes(allIdleRakes);
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

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (target && target.nodeType === Node.ELEMENT_NODE) {
          if (!(target as Element).closest('.table-rows-container')) {
            setSelectedRake(null);
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

    const handleRakeSelection = (rake: any) => {
      if (selectedRake && selectedRake.rake_id === rake.rake_id) {
        // Deselecting the current rake
        setSelectedRake(null);
        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.closePopup();
        }
      } else {
        // Selecting a new rake
        setSelectedRake(rake);
        focusOnRake(rake);
      }
    };
    
    const focusOnRake = (rake: any) => {
      if (rake && parseFloat(rake.hours.split('h')[0]) > 24) {
        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.closePopup();
        }
        map?.flyTo(center, 5, { duration: 1 });
        return;
      }
      if (rake && map) {
        const rakeData = coords[rake.name];
        if (rakeData && rakeData.length > 0) {
          const bounds = L.latLngBounds(rakeData.map((item: any) => [
            item.geo_point.coordinates[1],
            item.geo_point.coordinates[0]
          ]));
          map.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
          
          setShowAllRakes(true);
          setTimeout(() => {
            if (selectedMarkerRef.current) {
              selectedMarkerRef.current.openPopup();
            }
          }, 1250);
        }
        else {
          map?.flyTo(center, 5, { duration: 1 });
        }
      }
    };

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
        <div className="map-container">
          {isMobile ? <SideDrawer /> : null}
          <div style={{ width: '100%', overflow: 'hidden' }}>
            {isMobile ? <Header title="Captive Rakes Map View" isMapHelper={true}></Header> : <MobileHeader />}
            <div style={{
              paddingTop: isMobile ? 12 : 24, 
              paddingBottom: isMobile ? 32 : 65,  
              position:'relative',
            }}>
              <Box
                sx={{
                    marginTop: mobile ? "150px" : "",
                    height: "90vh",
                    width: "100%",
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 0,
                    justifyContent: 'center',
                    alignItems: "center",
                    alignContent: 'space-around',
                }}
              >
                <FormGroup className='mapButtons'>
                  <FormControlLabel
                    control={<Switch checked={showTracks} onChange={() => setShowTracks(!showTracks)} />}
                    label="Show All Tracks"
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    control={<Switch checked={showAllRakes} onChange={() => setShowAllRakes(!showAllRakes)} />}
                    label="Show All Rakes"
                    labelPlacement="start"
                  />
                </FormGroup>
                <Grid className="mapshelper-sidebar-container" >
                  <Grid>
                    <div className="tracking-details-container">
                        <div className="tracking-heading">
                        Tracking Status
                        </div>
                        <hr />
                        <div style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginTop:'12px'
                        }}>
                          <div className="tracking-status" onClick={()=>handleFilter('total')} style={selectedType==='total'? {background:"rgba(51, 79, 252, 0.1)"}:{}}>
                            <div className="tracking-number">
                              {list.length}
                            </div>
                            <Tooltip title="Items being tracked or managed within the system" arrow placement="bottom">
                              <div className="tracking-text" style={{ color: '#334FFC', cursor: 'pointer' }}>
                                Total
                              </div>
                            </Tooltip>
                          </div>
                          <div className="tracking-status" onClick={()=>handleFilter('tracking')} style={selectedType==='tracking'? {background:"rgba(24, 190, 138, 0.1)"}:{}}>
                            <div className="tracking-number">
                              {allRakesPositions.length}
                            </div>
                            <Tooltip title="Items currently being actively tracked or monitored" arrow placement="bottom">
                            <div className="tracking-text" style={{color: '#18BE8A', cursor: 'pointer' }}>
                              Tracking
                            </div>
                            </Tooltip>
                          </div>
                          {/* <div className="tracking-status" onClick={()=>handleFilter('idle')} style={selectedType==='idle'? {background:"rgba(255, 152, 26, 0.1)"}:{}}>
                     
                            <div className="tracking-number">
                              {allIdleRakes.length}
                            </div>
                            <Tooltip title="Items that are not moving or are stationary for a significant period" arrow placement="bottom">
                              <div className="tracking-text" style={{ color: '#FF981A', cursor: 'pointer' }}>
                                Idle
                              </div>
                            </Tooltip>

                          </div> */}
                          <div className="tracking-status" onClick={()=>handleFilter('idle&non-tracking')} style={selectedType==='idle&non-tracking' || selectedType==='idle' || selectedType==='non-tracking'? {background:"rgba(230, 102, 123, 0.1)"}:{}}>
                            <div className="tracking-number">
                              {/* {list.length - allRakesPositions.length - allIdleRakes.length} */}
                              {list.length - allRakesPositions.length}
                            </div>
                            <Tooltip title="Items that are not currently being tracked or monitored" arrow placement="bottom">
                              <div className="tracking-text" style={{ color: '#E6667B', cursor: 'pointer' }}>
                                Non Tracking
                              </div>
                            </Tooltip>
                          </div>
                        </div>
                    </div>

                    <div className="idle-non-tracking-container">
                      <div className="idle-non-tracking-indicator-container" onClick={()=>handleFilter('idle')} style={selectedType==='idle'? {background:"#FF98001F"}:{}}>
                        <Image src={IdleIcon} alt="Idle Icon" width={32} height={32} />
                        <div className="idle-non-tracking-indicator-item">
                          <div className="idle-non-tracking-indicator-number">
                            {allIdleRakes.length}
                          </div>
                          <Tooltip title="Items that are not moving or are stationary for a significant period" arrow placement="bottom">
                            <div className="idle-non-tracking-indicator-text">
                              {"Idle ( 3 - 24 hrs)"}
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="idle-non-tracking-indicator-container" onClick={()=>handleFilter('non-tracking')} style={selectedType==='non-tracking'? {background:"#E6667B1F"}:{}}>
                        <Image src={InactiveIcon} alt="Idle Icon" width={32} height={32} />
                        <div className="idle-non-tracking-indicator-item">
                          <div className="idle-non-tracking-indicator-number">
                            {list.length - allRakesPositions.length - allIdleRakes.length}
                          </div>
                          <Tooltip title="Items that have been inactive for more than 24 hours" arrow placement="bottom">
                            <div className="idle-non-tracking-indicator-text">
                              {"Inactive ( > 24 hrs)"}
                            </div>
                          </Tooltip>
                      </div>
                    </div>
                     
                    </div>

                    <div className="tracking-table-container">
                      <div className="tracking-heading">
                       Captive Rakes
                      </div>
                      <TableContainer
                        component={Paper}
                        className="table-mapview-container"
                      >
                      <Table sx={{ minWidth: '100%', borderRadius: '0px 0px 12px 12px' }} aria-label="simple table" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell align="left" className="table-heads">S.No</TableCell>
                            <TableCell align="left" className="table-heads">Rake Name</TableCell>
                            <TableCell align="center" className="table-heads" style={{lineHeight: '16px'}}>Last Updated <br/> <span style={{fontSize: '10px', color:'#7C7E8C', fontWeight: '500', textAlign: 'center' }}>(hr & min)</span></TableCell>
                            <TableCell align="left" className="table-heads">FNR No.</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        {allRakes && allRakes.map((rake: any, index: number) => (
                          <TableRow
                          key={index}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 }, backgroundColor: selectedRake && selectedRake.rake_id === rake.rake_id ? '#F0F3F9' : 'inherit' }}
                          className='table-rows-container'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRakeSelection(rake);
                          }}
                          >
                            <TableCell align="left" className="captive-rake-rows" style={{fontWeight: selectedRake && selectedRake.rake_id === rake.rake_id ? "bold" : 'inherit'}}>{index + 1}.</TableCell>
                            <TableCell align="left" className="captive-rake-rows" style={{fontWeight: selectedRake && selectedRake.rake_id === rake.rake_id ? "bold" : 'inherit'}}>{rake.name}</TableCell>
                            <TableCell align="center" className="captive-rake-rows" style={{fontWeight: selectedRake && selectedRake.rake_id === rake.rake_id ? "bold" : 'inherit'}}>
                            {rake.hours && parseFloat(rake.hours.split('h')[0]) < 24 ? rake.hours : 'N/A'}
                            </TableCell>
                            <TableCell align="left" className="captive-rake-rows" style={{fontWeight: selectedRake && selectedRake.rake_id === rake.rake_id ? "bold" : 'inherit'}}>{rake.fnr_no}</TableCell>
                          </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      </TableContainer>
                    </div>
                      
                       {/* {
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
                         } */}
                  </Grid> 
                </Grid>
                <MapContainer className="map" id="map-helpers" center={center} zoom={5} style={{ minHeight: '105%',width: '101%', padding: '0px', zIndex: '0', position: 'fixed' }} attributionControl={false} ref={setMap} >
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
                      <h3 style={{marginTop: '1em', marginBottom: "1em"}}>Rake Name: {cr.data.title}</h3>
                      <h4 style={{marginTop: '1em', marginBottom: "1em"}}>Last Updated At: {cr.data.ts}</h4>
                    </Popup>
                  </Marker>)}
                  {showAllRakes &&
                  <>
                  <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIconTracking}>
                  {/* Mapping through the markers */}
                    {showAllRakes && ['total','tracking'].includes(selectedType) && allRakesPositions.map((rake:any, index: number) => <Marker key={index} position={rake.coords} icon={customIcon} ref={(el) => {
                      if (selectedRake && selectedRake.name === rake.data.title) {
                        selectedMarkerRef.current = el;
                      }
                      }}>
                      <Popup>
                        <h3 style={{marginTop: '1em', marginBottom: "1em"}}>Rake Name: {rake.data.title}</h3>
                        <hr></hr>
                        <h4 style={{marginTop: '1em', marginBottom: "1em"}}>Last Updated At: {rake.data.ts}</h4>
                      </Popup>
                    </Marker>)}
                  </MarkerClusterGroup>
                  <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIconIdle}>
                  {/* Mapping through the markers */}
                    {showAllRakes && ['total','idle'].includes(selectedType) && allIdleRakes.map((rake:any, index: number) => <Marker key={index} position={rake.coords} icon={customIconIdle} ref={(el) => {
                      if (selectedRake && selectedRake.name === rake.data.title) {
                        selectedMarkerRef.current = el;
                      }
                      }}>
                      <Popup>
                        <h3 style={{marginTop: '1em', marginBottom: "1em"}}>Rake Name: {rake.data.title}</h3>
                        <hr></hr>
                        <h4 style={{marginTop: '1em', marginBottom: "1em"}}>Last Updated At: {rake.data.ts}</h4>
                      </Popup>
                    </Marker>)}
                  </MarkerClusterGroup>
                  </>
                  }
          
                </MapContainer>
              </Box>
            </div>
          </div>
        </div>
      </div>
    );
}

export default MapLayers;