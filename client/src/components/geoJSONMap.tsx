import React, { useEffect, useState } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import { GeoJsonObject, Feature, Geometry } from "geojson";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./geoJSONMap.css";
import {generateColorGradient, getColor, extractValuesFromGeoJSON } from '../utils/geoJSONUtils';


interface GeoJSONFeature extends Feature<Geometry> {
    properties: { [key: string]: unknown };
}

interface GeoJSONMapProps {
    geoJsonData: GeoJsonObject | null;
}

const GeoJSONMap: React.FC<GeoJSONMapProps> = ({ geoJsonData }) => {
  const [mapKey, setMapKey] = useState(Date.now());
  const [colorGradient, setColorGradient] = useState<{ [key: number]: string }>({});
  const [allValues, setValues] = useState<number[]>([]);
  const [steps, setSteps] = useState<number>(15); // State for steps

  // Effect to initialize color gradient and data values
  useEffect(() => {
    if (geoJsonData) {
      setValues(extractValuesFromGeoJSON(geoJsonData));
      setColorGradient(generateColorGradient(steps));
    }
  }, [geoJsonData]);

  const geoJsonStyle = (feature: any) => {
   const currValue = feature.properties.totalSamples as number; //temporarily using CARUID in place of data
   const fillColorIndex = getColor(currValue, allValues, steps); // Call getColor function to get the fill color

   return {
     fillColor: colorGradient[fillColorIndex] || 'gray',
     weight: 1,
     color: 'white',
     fillOpacity: 0.5,
    };
  };

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
    );
};

export default GeoJSONMap;
