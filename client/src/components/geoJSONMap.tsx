import React, { useEffect, useState, useRef } from "react";
import { MapContainer, GeoJSON, useMap, TileLayer, ZoomControl } from "react-leaflet";
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
import TitleComponent from "./TitleComponent";
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

    const [steps, setSteps] = useState<number>(500); // State for steps
    const {primaryColorPicker, secondaryColorPicker, featureVisibility, autoColourRange, setFeatureColors, currentFileTitle, toggleLegendVisibility, toggleTileLayer, uploadedFiles, setLegendLabels} = useToggle();
    const featureColorMapRef = useRef({});

    // Effect to initialize color gradient and data values
    useEffect(() => {
        if (geoJsonData) {
            setValues(extractValuesFromGeoJSON(geoJsonData));
            const primaryRGB = hexToRgb(primaryColorPicker);
            const secondaryRGB = hexToRgb(secondaryColorPicker);
            setColorGradient(generateColorGradient(steps, primaryRGB, secondaryRGB, autoColourRange));
        }
    }, [geoJsonData, primaryColorPicker, secondaryColorPicker, autoColourRange, steps]);

    useEffect(() => {
        if(geoJsonData && geoJsonData.type === "FeatureCollection") {
            const featureColorMap = {};
            geoJsonData.features.forEach((feature: GeoJSONFeature) => {
                const currValue = feature.properties.totalSamples as number;
                const fillColorIndex = getColor(currValue, allValues, steps);
                const fillColor = colorGradient[fillColorIndex] || "#98AFC7";
                featureColorMap[feature.properties.CARUID] = fillColor;
            });
            setFeatureColors(featureColorMap);
            featureColorMapRef.current = featureColorMap;
        }
    }, [colorGradient, steps, allValues, geoJsonData]);

    const Legend = ({ colorGradient, allValues }) => {
        const map = useMap();
    
        useEffect(() => {
        const legend = L.control({ position: "bottomright" });
    
        legend.onAdd = function () {
            const div = L.DomUtil.create("div", "info legend");
            const labels = [];

            const featuresColorMap = Object.values(featureColorMapRef.current).map((item, index) => {return [item, allValues[index]]});
            const featuresWithValues = featuresColorMap.sort((a, b) => a[1] - b[1]).filter(item => item[1] !== 0);
            
            const numberOfLegendItems = 10;
            const maxValue = Math.max(...featuresWithValues.map(item => item[1]));
            const minValue = Math.min(...featuresWithValues.map(item => item[1]));
            const interval = (maxValue - minValue) / numberOfLegendItems;
            const labelsArray = [];
            const initValueColor = getColor(0, allValues, steps);
            labelsArray.push({lower: 0, upper: "", color: initValueColor});

            labels.push(
                `<div style="display: flex; align-items: center;">` + 
                `<i style="background:${initValueColor}; width:18px; height:18px; display:inline-block; margin-right:4px; border: 1px solid #ccc; border-radius: 4px;"></i> ` +
                `<span style="color: black; font-weight: bold;">${0}</span>` + `</div>`
            );

            for (let i = 0; i < numberOfLegendItems; i++) {
              const threshold = minValue + i * interval;
            const upperBound = threshold + interval;
            const colorIndex = getColor(upperBound - 1, allValues, steps);
            const color = colorGradient[colorIndex];

            if (!isNaN(threshold) && !isNaN(upperBound)) {
                const labelToPush = {
                    lower: threshold.toFixed(0),
                    upper: upperBound.toFixed(0),
                    color: color,
                };
                labels.push(
                    `<div style="display: flex; align-items: center;">` + 
                    `<i style="background:${color}; width:18px; height:18px; display:inline-block; margin-right:4px; border: 1px solid #ccc; border-radius: 4px;"></i> ` +
                    `<span style="color: black; font-weight: bold;">${threshold.toFixed(0)} &ndash; ${upperBound.toFixed(0)}</span>` + `</div>`
                );
                labelsArray.push(labelToPush);
            }
        }
            setLegendLabels(labelsArray);
            div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "10px"; 
            div.style.border = "2px solid #ccc"; 
            div.style.borderRadius = "5px"; 
        
            div.innerHTML = labels.join('<br>');
            return div;
        };

        if (toggleLegendVisibility) {
            legend.addTo(map);
        } else {
            legend.remove();
        }

        return () => {
            legend.remove();
        };
        }, [map, colorGradient, allValues, steps, toggleLegendVisibility]);

        return null;
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
            fillOpacity: toggleTileLayer ? 0.4 : 1,
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
                zoomControl={false}
                keyboard={false}
                preferCanvas={false}
                inertia={false}
            >
                <ZoomControl position="bottomleft" />
                {toggleTileLayer && (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
                        OpenStreetMap</a> contributors'
                    />
                )}
                <Legend colorGradient={colorGradient} allValues={allValues} />
                {geoJsonData && (
                    <>
                        {uploadedFiles.length > 0 && <TitleComponent title = {currentFileTitle}/>}
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
