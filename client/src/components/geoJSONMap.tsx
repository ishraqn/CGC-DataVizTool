import React, { useEffect, useState } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import { GeoJsonObject, Feature, Geometry } from "geojson";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useToggle } from "../contexts/useToggle";
import { ColorResult, RGBColor } from "react-color";
import {
    hexToRgb,
    generateColorGradient,
    getColor,
    extractValuesFromGeoJSON,
    convertColorToString,
} from "../utils/colourUtils";
import "./geoJSONMap.css";
// Defining a custom interface for GeoJSON features with additional properties.
interface GeoJSONFeature extends Feature<Geometry> {
    properties: { [key: string]: unknown };
}

// Props for our GeoJSONMap component, expecting geoJsonData.
interface GeoJSONMapProps {
    geoJsonData: GeoJsonObject | null;
}

const GeoJSONMap: React.FC<GeoJSONMapProps> = ({ geoJsonData }) => {
    const [mapKey, setMapKey] = useState(Date.now());
    const [colorGradient, setColorGradient] = useState<{
        [key: number]: string;
    }>({});
    const [allValues, setValues] = useState<number[]>([]);
    const [steps, setSteps] = useState<number>(5); // State for steps
    const {primaryColorPicker, secondaryColorPicker, featureVisibility} = useToggle();

    // Effect to initialize color gradient and data values
    useEffect(() => {
        if (geoJsonData) {
            setValues(extractValuesFromGeoJSON(geoJsonData));
            const rgbColor = hexToRgb(primaryColorPicker);
            const rgbColor_2 = hexToRgb(secondaryColorPicker);
            setColorGradient(generateColorGradient(steps, rgbColor, rgbColor_2));
        }
    }, [geoJsonData, primaryColorPicker, secondaryColorPicker, steps]);

    const defaultStyle = {
        fillColor: "#98AFC7",
        weight: 1,
        color: "white",
        fillOpacity: 0.5,
    };

    const geoJsonStyle = (feature: any) => {
        const currValue = feature.properties.totalSamples as number;
        const fillColorIndex = getColor(currValue, allValues, steps); // Call getColor function to get the fill color
        if (!featureVisibility[feature.properties.CARUID]) {
            return {
                fillOpacity: 0,
                weight: 0,
                color: "white",
                fillColor: colorGradient[fillColorIndex],
            };
        }

        return {
            fillColor: colorGradient[fillColorIndex] || "white",
            weight: 0.7,
            color: "black",
            fillOpacity: 1,
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
            if (data && "features" in data) {
                const visibleFeatures = data.features.filter(
                    (feature) =>
                        feature.properties &&
                        featureVisibility[feature.properties.CARUID]
                );
                const geoJsonLayer = L.geoJSON(
                    visibleFeatures as GeoJsonObject
                );
                const bounds = geoJsonLayer.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds);
                    map.setMaxBounds(bounds);
                    map.setMinZoom(1);
                }
            }
            if (map.tap) map.tap.disable();
        }, [data, map, featureVisibility]);

        return null;
    };

    useEffect(() => {
        setMapKey(Date.now());
    }, [geoJsonData]);

    return (
        <>
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
