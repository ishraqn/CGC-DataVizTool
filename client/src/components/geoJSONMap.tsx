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

const GeoJSONMap: React.FC<GeoJSONMapProps> = ({ geoJsonData }) => {
    const [mapKey, setMapKey] = useState(Date.now());
    // temporary choropleth color function
    const getColor = (totalSamples: number) => {
        return totalSamples > 28
            ? "#29394a"
            : totalSamples > 26
            ? "#304152"
            : totalSamples > 24
            ? "#38495b"
            : totalSamples > 22
            ? "#405264"
            : totalSamples > 20
            ? "#485a6d"
            : totalSamples > 18
            ? "#506376"
            : totalSamples > 16
            ? "#586b7f"
            : totalSamples > 14
            ? "#607488"
            : totalSamples > 12
            ? "#687c91"
            : totalSamples > 10
            ? "#70849a"
            : totalSamples > 8
            ? "#788da3"
            : totalSamples > 6
            ? "#8095ac"
            : totalSamples > 4
            ? "#889eb5"
            : totalSamples > 2
            ? "#90a6be"
            : totalSamples > 0
            ? "#98afc7"
            : "white"; // missing/0
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
