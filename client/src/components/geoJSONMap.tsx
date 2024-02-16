/**-------***-------***-------***-------***-------
 ** Overview: 
 * The `GeoJSONMap` React component, in TypeScript using `react-leaflet`, displays a map from GeoJSON data. 
 * It styles features, shows popups with their properties, and adjusts the map view to fit the GeoJSON boundaries. 
 * A `FitBounds` component within it calculates and sets these boundaries based on the GeoJSON data provided as a prop.
 * -------***-------***-------***-------***-------*/

import React, { useEffect } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import { GeoJsonObject, Feature, Geometry } from 'geojson';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; 

// Defining a custom interface for GeoJSON features with additional properties.
interface GeoJSONFeature extends Feature<Geometry> {
  properties: { [key: string]: unknown };
}

// Props for our GeoJSONMap component, expecting geoJsonData.
interface GeoJSONMapProps {
  geoJsonData: GeoJsonObject | null;
  pointData: GeoJsonObject | null;
}



// The main component to render our map and GeoJSON data. 
const GeoJSONMap: React.FC<GeoJSONMapProps> = ({ geoJsonData, pointData }) => {
  // Custom styles for our GeoJSON features - let's make it look nice and clear!
  const geoJsonStyle = {
    fillColor: "beige",
    weight: 1,
    color: 'black',
    fillOpacity: 0.5,
  };
  
  // // Function to create popups for each feature on our map.
  const onEachFeature = (feature: GeoJSONFeature, layer: L.Layer) => {
    // Adding popups with property details, if available.
    if (feature.properties) {
      layer.bindPopup(Object.keys(feature.properties).map(key => 
        `<strong>${key}</strong>: ${feature.properties[key]}`).join('<br />'));
    }
  };

  const pointStyle = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
  
  const onEachPoint = (feature: GeoJSONFeature, layer: L.Layer) => {
    layer.bindPopup(Object.keys(feature.properties).map(key => 
      `<strong>${key}</strong>: ${feature.properties[key]}`).join('<br />'));
  };

  // A component to automatically adjust the map view to fit all our GeoJSON features.
  const FitBounds = ({ data }: { data: GeoJsonObject }) => {
    const map = useMap();

    useEffect(() => {
      // Creating a layer from our GeoJSON data to calculate bounds.
      const geoJsonLayer = L.geoJSON(data);
      const bounds = geoJsonLayer.getBounds();
      // Adjusting the map view and setting limits.
      map.fitBounds(bounds);
      map.setMaxBounds(bounds);
      map.setMinZoom(map.getZoom());
      // Disabling tap if it's available for better mobile support.
      if (map.tap) map.tap.disable();
    }, [data, map]);

    return null;
  };

  return (
    <MapContainer 
      center={[45.4211, -75.6903]} 
      zoom={1}
      style={{ height: '400px', width: '100vw' }}
      zoomControl={false}
      keyboard={false}
    >
      {geoJsonData && (
        <>
      {geoJsonData && <GeoJSON data={geoJsonData} style={geoJsonStyle} onEachFeature={onEachFeature} />}
      {<FitBounds data={geoJsonData} />}
        </>
      )}
      {pointData && (
          <GeoJSON
            data={pointData}
            pointToLayer={(feature, latlng) => L.circleMarker(latlng, pointStyle)}
            onEachFeature={onEachPoint}
          />
        )}

    </MapContainer>
  );
};

export default GeoJSONMap;