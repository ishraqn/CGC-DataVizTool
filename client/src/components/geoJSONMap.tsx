import React, { useEffect, useState } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import { GeoJsonObject, Feature, Geometry } from "geojson";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./geoJSONMap.css";

interface GeoJSONFeature extends Feature<Geometry> {
    properties: { [key: string]: unknown };
}

interface GeoJSONMapProps {
    geoJsonData: GeoJsonObject | null;
}

const GeoJSONMap: React.FC<GeoJSONMapProps> = ({ geoJsonData}) => {
    const [mapKey, setMapKey] = useState(Date.now());
    // temporary choropleth color function
    const getColor = (totalSamples: number) => {
        return totalSamples > 1000 ? "#122336" : 
               totalSamples > 900  ? "#12273d" : 
               totalSamples > 800  ? "#112a45" : 
               totalSamples > 700  ? "#13385e" : 
               totalSamples > 600  ? "#13385e" : 
               totalSamples > 500  ? "#1c4978" : 
               totalSamples > 400  ? "#204b78" : 
               totalSamples > 300  ? "#264f7a" : 
               totalSamples > 250  ? "#2b517a" :
               totalSamples > 200  ? "#2f537a" : 
               totalSamples > 150  ? "#33577d" :
               totalSamples > 100  ? "#3c638c" : 
               totalSamples > 80   ? "#42668c" :
               totalSamples > 60   ? "#4a6c91" : 
               totalSamples > 40   ? "#537294" : 
               totalSamples > 20   ? "#597694" : 
               totalSamples > 10   ? "#7091b3" : 
               totalSamples > 5    ? "#7895b3" : 
               totalSamples > 2    ? "#8299b0" : 
               totalSamples > 0    ? "#98afc7" : 
               "white"; // 0 samples / missing data
    };

    const geoJsonStyle = (feature: GeoJSONFeature) => ({
        fillColor: getColor(feature.properties.totalSamples as number),
        weight: 2,
        color: "#46554F",
        fillOpacity: 1,
    });

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
