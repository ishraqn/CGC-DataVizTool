import React, { useEffect, useState } from "react";
import GeoJSONMap from "./components/geoJSONMap";
import FileUploadForm from "./components/uploadForm";
import "./App.css";
import {} from "leaflet";
import Sidebar from "./components/sidebar";

const App: React.FC = () => {
    const [mapData, setMapData] = useState(null);
    const [uploadCount, setUploadCount] = useState(0);

    useEffect(() => {
        const hasAggregatedData =
            localStorage.getItem("hasAggregatedData") === "true";

        if (hasAggregatedData) {
            fetch("/api/v1/geo/geo-aggregate-data")
                .then((response) => response.json())
                .then((data) => {
                    setMapData(data);
                })
                .catch((error) =>
                    console.error("Failed to load aggregated data:", error)
                );
        } else {
            fetch("/api/v1/data-folder/default-simplified.geojson")
                .then((response) => response.json())
                .then((data) => {
                    setMapData(data);
                })
                .catch((error) =>
                    console.error("Failed to load GeoJSON data:", error)
                );
        }
    }, []);

    useEffect(() => {
        fetch("/api/v1/geo/geo-aggregate-data")
            .then(async (response) => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 404) {
                    const defaultResponse = await fetch("/api/v1/data-folder/default-simplified.geojson");
                    const defaultData = await defaultResponse.json();
                    setMapData(defaultData);
                    localStorage.setItem("hasAggregatedData", "false");
                    return null;
                } else {
                    throw new Error(`Server error: ${response.status}`);
                }
            })
            .then((data) => {
                if (data) {
                    setMapData(data);
                    localStorage.setItem("hasAggregatedData", "true");
                }
            })
            .catch((error) => {
                console.error("Failed to load data:", error);
            });
    }, [uploadCount]);

    return (
        <div className="App noise">
            <h1> CGC Data Visualization</h1>
            <Sidebar />
            {mapData && (
                <div className="map-frame">
                    <GeoJSONMap geoJsonData={mapData}/>
                </div>
            )}
            <FileUploadForm
                onUploadSuccess={() => setUploadCount((prev) => prev + 1)}
            />{" "}
            {/* had to add the form so that file can be uploaded for visulation, needs to be styled */}
        </div>
    );
};

export default App;
