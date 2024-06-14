'use client'
import { TileLayer, LayersControl } from 'react-leaflet';

const MapLayers = () => {
    return <LayersControl >
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
}

export default MapLayers;