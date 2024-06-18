'use client'
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, Popup, GeoJSON, Polyline } from 'react-leaflet';
import './MapLayers.css';
import getBoundary from "./IndianClaimed";
import { useWindowSize } from "@/utils/hooks";
import { MagnifyingGlass } from 'react-loader-spinner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../Header/header';
import pickupIcon from '../../assets/pickup_icon.svg'
import dropIcon from '../../assets/drop_icon.svg'
import wagonIcon from '../../assets/wagons_icon.svg'
import currentTrainLocationIcon from '../../assets/current_train_location_icon.svg'
import { Box, FormGroup } from '@mui/material';
import { Grid } from 'react-loader-spinner';
import TripTrackerNavbar from './TripTrackerNavbar/TripTrackerNavbar';

const TripTrackerLayer = () => {
    const isMobile = useWindowSize(600);
    const [map, setMap] = useState<L.Map | null>(null);
    const center: [number, number] = [24.2654256,78.9145218];
    const zoom = 5;
    const [loading, setLoading] = useState(true);
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

        setLoading(false);
    }

    useEffect(() => {
        addIndiaBoundaries();
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
          <div className="map-container">
            <div style={{ width: '100%', overflow: 'hidden' }}>
             <TripTrackerNavbar />
              <div style={{ paddingInline: 24, paddingTop: 24, paddingBottom: 65,  position:'relative' }}>
                <Box
                  sx={{
                      marginTop: !isMobile ? "150px" : "120px",
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
                  <MapContainer className="map" center={center} zoom={5} style={{ minHeight: '105%',width: '101%', padding: '0px', zIndex: '0', position: 'fixed' }} attributionControl={false} ref={setMap} >
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
                </Box>
              </div>
            </div>
          </div>
        </div>
      );
}

export default TripTrackerLayer;