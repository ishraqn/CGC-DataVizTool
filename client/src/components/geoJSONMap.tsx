import React, { useEffect, useState } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import { GeoJsonObject, Feature, Geometry } from 'geojson';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ColorPickerComponent from './ColorPickerComponent';
import { ColorResult, RGBColor } from 'react-color';
import { generateColorGradient, getColor, extractValuesFromGeoJSON, convertColorToString } from '../utils/colourUtils';
import "./geoJSONMap.css";
import { useToggle } from '../contexts/useToggle';

// Defining a custom interface for GeoJSON features with additional properties.
interface GeoJSONFeature extends Feature<Geometry> {
  properties: { [key: string]: unknown };
}

// Props for our GeoJSONMap component, expecting geoJsonData.
interface GeoJSONMapProps {
  geoJsonData: GeoJsonObject | null;
}

const GeoJSONMap: React.FC<GeoJSONMapProps> = ({ geoJsonData }) => {
    const initialColor: RGBColor = { r: 152, g: 175, b: 199 };
    const [mapKey, setMapKey] = useState(Date.now());
    const [colorGradient, setColorGradient] = useState<{ [key: number]: string }>({});
    const [allValues, setValues] = useState<number[]>([]);
    const [steps, setSteps] = useState<number>(5); // State for steps
    const [color, setColor] = useState(initialColor);

    const { featureVisibility} = useToggle();

  // Effect to initialize color gradient and data values
  useEffect(() => {
    if (geoJsonData) {
      setValues(extractValuesFromGeoJSON(geoJsonData));
      setColorGradient(generateColorGradient(steps, convertColorToString(color)));
    }
    }, [geoJsonData, color]);

  const handleColorChange = (colorOrig: ColorResult) => {
    const newColor = colorOrig.rgb;
   setColor(newColor);
   setColorGradient(generateColorGradient(steps, convertColorToString(newColor)));
 };
 
 const defaultStyle = {
   fillColor: '#98AFC7',
   weight: 1,
   color: 'white',
   fillOpacity: 0.5,
  };

  const geoJsonStyle = (feature: any) => {
  const currValue = feature.properties.totalSamples as number;
  const fillColorIndex = getColor(currValue, allValues, steps); // Call getColor function to get the fill color

  if (!featureVisibility[feature.properties.CARUID]) {
    return { fillOpacity: 0, weight: 0, color: 'white', fillColor: 'gray' };
  }

  return {
    fillColor: colorGradient[fillColorIndex] || 'gray',
    weight: 1,
    color: 'white',
    fillOpacity: 0.5,
   };
 };

  // A component to automatically adjust the map view to fit all our GeoJSON features.
  
   const onEachFeature = (feature: GeoJSONFeature, layer: L.Layer) => {
       if (feature.properties) {
           layer.bindPopup(
               Object.keys(feature.properties)
                   .map(
                       (key) =>
                           `<strong>${key}</strong>: ${feature.properties[key]}`
                   )
                   .join("<br />")
           );
       }
   };

const FitBounds = ({ data }: { data: GeoJsonObject }) => {
   const map = useMap();

   useEffect(() => {
       const geoJsonLayer = L.geoJSON(data);
       const bounds = geoJsonLayer.getBounds();
       map.fitBounds(bounds);
       map.setMaxBounds(bounds);
       map.setMinZoom(map.getZoom());
       if (map.tap) map.tap.disable();
   }, [data, map]);

   return null;
};

useEffect(() => {
   setMapKey(Date.now());
}, [geoJsonData]);

return (
 <>
   <ColorPickerComponent
     onColorChange={(color: ColorResult): void => {
       handleColorChange(color);
     }}
   />
   <MapContainer
     key={mapKey}
     zoom={1}
     zoomControl={true}
     keyboard={false}
     preferCanvas={false}
     inertia={false}
   >
     {geoJsonData && (
       <>
         <GeoJSON
           data={geoJsonData}
           style={geoJsonStyle}
           onEachFeature={onEachFeature}
         />
         <FitBounds data={geoJsonData} />
       </>
     )}
   </MapContainer>
 </>
);
};

export default GeoJSONMap;