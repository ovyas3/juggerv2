"use client";

import { MapContainer, TileLayer, Marker, LayersControl, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Import Leaflet for creating custom icons
import styles from "./page.module.css";
import Header from "@/components/Header/header";
import SideDrawer from "@/components/Drawer/Drawer";
import Image from "next/image";
import rakesLoaded from "@/assets/rakes_loaded.svg";
import captiveRakes from '@/assets/cr.svg'
import emptyRakes from "@/assets/empty_rakes_icon.svg";
import { useEffect, useState } from "react";
import { httpsGet } from '@/utils/Communication';
import { useRouter } from 'next/navigation';


interface RakeLocation {
  coords: [number, number]; // Tuple type for Leaflet position
  type: "loaded" | "empty" | "captive";
  title: string;
  updatedAt: string;
}

export default  function Dashboard() {
  const center: [number, number] = [24.2654256, 78.9145218];
  const [map, setMap] = useState<L.Map | null>(null);
  const router = useRouter()
  const [coordsData, setCoordsData] = useState([])

  async function getCoords() {
    const response = await httpsGet('get/captive_rake_locations',0,router)
    if(response.statusCode === 200) {
      const coords = response.data?.filter((val:any)=> val.geo_point.coordinates[0] !== 0 && val.geo_point.coordinates[1] !== 0)

      setCoordsData(coords)
    }
  }

  useEffect(()=>{
   getCoords()
  },[])

  const rakeLocations: RakeLocation[] = [
    { coords: [24.5, 78.9], type: "loaded", title: "Loaded Rake 1", updatedAt: "2024-11-20" },
    { coords: [24.3, 78.7], type: "empty", title: "Empty Rake 2", updatedAt: "2024-11-21" },
    { coords: [24.1, 78.8], type: "captive", title: "Captive Rake 3", updatedAt: "2024-11-22" },
  ];

  const summaryData = [
    { plant: "JBSK", from: 12, towards: 8, others: 0 },
    { plant: "JSPP", from: 16, towards: 9, others: 2 },
    { plant: "PJPD", from: 10, towards: 2, others: 4 },
    { plant: "Barbil", from: 4, towards: 1, others: 6 },
  ];
  // Define custom icons
  const loadedIcon = new L.Icon({
    iconUrl: rakesLoaded.src,
    iconSize: [32, 32], // Adjust size as needed
    iconAnchor: [16, 32], // Center the icon
    popupAnchor: [0, -32], // Adjust popup position
  });

  const emptyIcon = new L.Icon({
    iconUrl: emptyRakes.src,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const captiveIcon = new L.Icon({
    iconUrl: captiveRakes.src,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const getIcon = (type: RakeLocation["type"]) => {
    switch (type) {
      case "loaded":
        return loadedIcon;
      case "empty":
        return emptyIcon;
      case "captive":
        return captiveIcon;
      default:
        return loadedIcon;
    }
  };

  return (
    <div className="">
      <Header title={"Captive Rake Map View"} />
      <SideDrawer />
      <div>
        <div className={styles.container}>
          <div className={styles.leftPanel}>
          <div className={styles.rakesStatus}>
            <h2>Rakes Status</h2>
            <div className={styles.statusItems}>
              <div className={styles.statusItem}>
                <span className={styles.icon}>
                  <Image src={rakesLoaded} alt=""/>
                </span>
                <div className={styles.labelCont}>
                <span className={styles.label} style={{color:'#334FFC'}}>Total</span>
                <span className={styles.value}>50</span>
                </div>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.icon}>
                <Image src={captiveRakes} alt=""/>
                </span>
                <div className={styles.labelCont}>
                <span className={styles.label} style={{color:'#18BE8A'}}>Loaded</span>
                <span className={styles.value}>32</span>
                </div>
              </div>
              <div className={styles.statusItem}>
              <Image src={emptyRakes} alt=""/>
              <div className={styles.labelCont}>
              <span className={styles.label} style={{color:'#E6667B'}}>Empty</span>
                <span className={styles.value}>18</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rakesArrival}>
            <h2>Rakes Arrival</h2>
            <div className={styles.arrivalItems}>
              <div className={styles.arrivalItem}>
                <span className={styles.value}>20</span>
                <span className={styles.label}>T+1</span>
              </div>
              <div className={styles.arrivalItem}>
                <span className={styles.value}>06</span>
                <span className={styles.label}>T+2</span>
              </div>
              <div className={styles.arrivalItem}>
                <span className={styles.value}>06</span>
                <span className={styles.label}>&gt;T+3</span>
              </div>
            </div>
          </div>

          <div className={styles.rakesPlacementRegion}>
            <h2>Rakes Placement Region</h2>
            <div className={styles.placementItems}>
              <div className={styles.placementItem}>
                <span className={styles.value}>12</span>
                <span className={styles.label}>Loading</span>
              </div>
              <div className={styles.placementItem}>
                <span className={styles.value}>08</span>
                <span className={styles.label}>Unloading</span>
              </div>
            </div>
          </div>

          <div className={styles.plantRakesSummary}>
            <h2>Plant Rakes Summary</h2>
            <table className={styles.summaryTable}>
              <thead>
                <tr>
                  <th style={{color:'#18BE8A'}}>Plant</th>
                  <th>From</th>
                  <th>Towards</th>
                  <th>Others</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.map((row, index) => (
                  <tr key={index}>
                    <td style={{fontWeight:'bold',color:''}}>{row.plant}</td>
                    <td>{row.from}</td>
                    <td>{row.towards}</td>
                    <td>{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
          <div className={styles.rightPanel}>
            <MapContainer
              className="map"
              id="map-helpers"
              center={center}
              zoom={5}
              style={{ minHeight: "100%", width: "100%", padding: "0px", zIndex: "0", position: "fixed" }}
              attributionControl={false}
              ref={setMap}
            >
              <LayersControl>
                <LayersControl.BaseLayer checked name="Street View">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite View">
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>

              {/* Add markers with custom icons */}
              {coordsData.map((rake:any, index) => (
                <Marker
                  key={index}
                  position={rake.geo_point?.coordinates?.reverse()} // No TypeScript error due to explicit tuple type
                  icon={loadedIcon}
                >
                  <Popup>
                    <h3>Rake Name: {rake.title}</h3>
                    <p>Loading Status{rake.loading_status}</p>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
