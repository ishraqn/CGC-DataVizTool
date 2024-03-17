import React, { useEffect, useState } from "react";
import GeoJSONMap from "./components/geoJSONMap";
import FileUploadForm from "./components/uploadForm";
import "./App.css";
import {} from "leaflet";
import Sidebar from "./components/sidebar";
import { useToggle } from "./contexts/useToggle";

const App: React.FC = () => {
	const [mapData, setMapData] = useState(null);
	const [uploadCount, setUploadCount] = useState(0);
	const [hasAggregatedData, setHasAggregatedData] = useState(false);
	const {
		uploadedFiles,
		currentFileIndex,
		isUploadedFileVisible,
		setCurrentFileIndex,
	} = useToggle();

	useEffect(() => {
		// Initial data loading based on whether aggregated data should be used
		const fetchData = async () => {
			try {
				let response, data;
				if (hasAggregatedData) {
					response = await fetch("/api/v1/geo/geo-aggregate-data");
					if (!response.ok) {
						throw new Error(`HTTP error! Status: ${response.status}`);
					}
					data = await response.json();
				} else {
					response = await fetch(
						"/api/v1/data-folder/default-simplified.geojson"
					);
					if (!response.ok) {
						throw new Error(`HTTP error! Status: ${response.status}`);
					}
					data = await response.json();
				}
				setMapData(data);
			} catch (error) {
				console.error("Failed to load data:", error);
			}
		};

		fetchData();
	}, [hasAggregatedData]);

	useEffect(() => {
		if (uploadedFiles.length > 0) {
			fetch("/api/v1/geo/geo-aggregate-data")
				.then((response) => {
					if (response.ok) {
						return response.json();
					} else if (response.status === 404) {
						throw new Error("No aggregated data found");
					} else {
						throw new Error(`Server error: ${response.status}`);
					}
				})
				.then((data) => {
					setMapData(data);
					setHasAggregatedData(true);
					setCurrentFileIndex(uploadedFiles.length - 1);
				})
				.catch((error) => {
					console.error("Failed to load aggregated data:", error);
					setHasAggregatedData(false);
				});
		} else {
			setHasAggregatedData(false);
			setCurrentFileIndex(-1);
		}
	}, [setCurrentFileIndex, uploadedFiles]);

	useEffect(() => {
		// Update map data when a file is selected from the sidebar
		if (
			isUploadedFileVisible &&
			uploadedFiles.length > 0 &&
			uploadedFiles[currentFileIndex] != null
		) {
			const selectedFile = uploadedFiles[currentFileIndex];
			const fileId = selectedFile ? selectedFile.id : undefined;
			if (!fileId) {
				console.error("No file ID found for selected file:", selectedFile);
				return;
			}
			fetch(`/api/v1/${fileId}`)
				.then((response) => {
					if (!response.ok) {
						throw new Error(`HTTP error! Status: ${response.status}`);
					}
					return response.json();
				})
				.then((geojsonData) => {
					setMapData(geojsonData);
				})
				.catch((error) => {
					console.error(
						`Failed to load GeoJSON data for ${selectedFile.name}:`,
						error
					);
				});
		}
	}, [currentFileIndex, isUploadedFileVisible, uploadedFiles]);

	const handleDownload = async () => {
		try {
			const selectedFile = uploadedFiles[currentFileIndex];
			const response = await fetch("/api/v1/map/render-map", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ filePath: selectedFile.path }),
			});
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			if (selectedFile.cleanName.trim().length > 0) {
				a.download = selectedFile.cleanName + ".png";
			} else {
				a.download = "default-map.png";
			}
			document.body.appendChild(a);
			a.click();
			a.remove();
		} catch (error) {
			console.error("Failed to download map image:", error);
		}
	};

	return (
		<div className="App noise">
			<h1> CGC Data Visualization</h1>
			<Sidebar handleDownload={handleDownload} geoJsonData={mapData} />
			{mapData && (
				<div className="map-frame">
					<GeoJSONMap geoJsonData={mapData} />
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
