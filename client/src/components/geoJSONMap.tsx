import React, { useEffect } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import { GeoJsonObject, Feature, Geometry } from 'geojson';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import "./geoJSONMap.css";


interface GeoJSONFeature extends Feature<Geometry> {
  properties: { [key: string]: unknown };
}

interface GeoJSONMapProps {
  geoJsonData: GeoJsonObject | null;
}

const GeoJSONMap: React.FC<GeoJSONMapProps> = ({ geoJsonData }) => {
  const geoJsonStyle = {
    fillColor: "#F2F3F3",
    weight: 2,
    color: '#46554F',
    fillOpacity: 1,
  };
  
  const onEachFeature = (feature: GeoJSONFeature, layer: L.Layer) => {
    if (feature.properties) {
      layer.bindPopup(Object.keys(feature.properties).map(key => 
        `<strong>${key}</strong>: ${feature.properties[key]}`).join('<br />'));
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

  return (
    <MapContainer 
      center={[45.4211, -75.6903]} 
      zoom={1} 
      zoomControl={true}
      keyboard={false}
      preferCanvas={false}
      inertia={false}
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
