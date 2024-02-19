/**-------***-------***-------***-------***-------
 ** Overview: 
 * The `GeoJSONMap` React component, in TypeScript using `react-leaflet`, displays a map from GeoJSON data. 
 * It styles features, shows popups with their properties, and adjusts the map view to fit the GeoJSON boundaries. 
 * A `FitBounds` component within it calculates and sets these boundaries based on the GeoJSON data provided as a prop.
 * -------***-------***-------***-------***-------*/

 import React, { useEffect, useState } from 'react';
 import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
 import { GeoJsonObject, Feature, Geometry } from 'geojson';
 import 'leaflet/dist/leaflet.css';
 import L from 'leaflet';
 import {generateColorGradient, getColor } from '../utils/geoJSONUtils';
 
 // Defining a custom interface for GeoJSON features with additional properties.
 interface GeoJSONFeature extends Feature<Geometry> {
   properties: { [key: string]: unknown };
 }
 
 // Props for our GeoJSONMap component, expecting geoJsonData.
 interface GeoJSONMapProps {
   geoJsonData: GeoJsonObject | null;
 }
 
 const GeoJSONMap: React.FC<GeoJSONMapProps> = ({ geoJsonData }) => {
   const [colorGradient, setColorGradient] = useState<{ [key: number]: string }>({});
   const [values, setValues] = useState<number[]>([]);
   // Effect to initialize color gradient and data values
   useEffect(() => {
     if (geoJsonData) {
       const tempValues: number[] = [];
       (geoJsonData as any).features.forEach((feature: any) => {
        tempValues.push(feature.properties.CARUID % 10);
       }); setValues(tempValues);

       const initialColorGradient = generateColorGradient();
       setColorGradient(initialColorGradient);
     }
   }, [geoJsonData]);
 
   const geoJsonStyle = (feature: any) => {
    const value = feature.properties.CARUID % 10;
    const fillColorIndex = getColor(value, values); // Call getColor function to get the fill color
    return {
      fillColor: colorGradient[fillColorIndex] || 'gray',
      weight: 1,
      color: 'white',
      fillOpacity: 0.5,
     };
   };
   
   // Function to create popups for each feature on our map.
   const onEachFeature = (feature: GeoJSONFeature, layer: L.Layer) => {
     // Adding popups with property details, if available.
     if (feature.properties) {
       layer.bindPopup(Object.keys(feature.properties).map(key => 
         `<strong>${key}</strong>: ${feature.properties[key]}`).join('<br />'));
     }
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
           <GeoJSON data={geoJsonData} style={geoJsonStyle} onEachFeature={onEachFeature} />
           <FitBounds data={geoJsonData} />
         </>
       )}
     </MapContainer>
   );
 };
 
 export default GeoJSONMap;
 