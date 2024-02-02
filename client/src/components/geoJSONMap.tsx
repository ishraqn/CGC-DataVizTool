import React from 'react';
import { Feature, Geometry } from 'geojson';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJsonObject } from 'geojson';


interface GeoJSONFeature extends Feature<Geometry> {
  properties: { [key: string]: unknown };
}

// props type to accept GeoJSON data directly
interface GeoJSONMapProps {
  geoJsonData: GeoJsonObject | null;
}

const GeoJSONMap: React.FC<GeoJSONMapProps> = ({ geoJsonData }) => {
  // custom styles for the GeoJSON layer
  const geoJsonStyle = {
    color: "#4a83ec",
    weight: 1,
    fillColor: "#1a1d62",
    fillOpacity: 0.5,
  };

  // Function to create a popup for features
  const onEachFeature = (feature: GeoJSONFeature, layer: L.Layer) => {
    if (feature.properties) {
      layer.bindPopup(Object.keys(feature.properties).map(key => 
        `<strong>${key}</strong>: ${feature.properties[key]}`).join('<br />'));
    }
  };

  return (
    <MapContainer center={[45.4211, -75.6903]} zoom={4} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON data={geoJsonData} style={geoJsonStyle} onEachFeature={onEachFeature} />
    </MapContainer>
  );
};

export default GeoJSONMap;
