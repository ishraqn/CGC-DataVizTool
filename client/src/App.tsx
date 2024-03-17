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
	const {
		uploadedFiles,
		currentFileIndex,
		isUploadedFileVisible,
		setCurrentFileIndex,
	} = useToggle();

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
				.catch((error) => console.error("Failed to load GeoJSON data:", error));
		}
	}, []);

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
					localStorage.setItem("hasAggregatedData", "true");
					setCurrentFileIndex(uploadedFiles.length - 1);
				})
				.catch((error) => {
					console.error("Failed to load aggregated data:", error);
					// If no aggregated data found or error occurs, fetch default data
				});
		} else {
			// If no files are uploaded, fetch default data
			fetch("/api/v1/data-folder/default-simplified.geojson")
				.then((response) => response.json())
				.then((defaultData) => {
					setMapData(defaultData);
					localStorage.setItem("hasAggregatedData", "false");
					setCurrentFileIndex(-1); // Reset current file index as no file is selected
				})
				.catch((defaultError) => {
					console.error("Failed to load default GeoJSON data:", defaultError);
				});
		}
	}, [setCurrentFileIndex, uploadedFiles]);

	useEffect(() => {
		// Update map data when a file is selected from the sidebar
		if (isUploadedFileVisible && uploadedFiles.length > 0 && uploadedFiles[currentFileIndex] != null) {
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
				})
		}
	}, [currentFileIndex, isUploadedFileVisible, uploadedFiles]);

	const handleDownload = async () => { 
		try {
			const selectedFile = uploadedFiles[currentFileIndex];
			const response = await fetch("/api/v1/map/render-map",{
				method: "POST", 
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({"filePath": selectedFile.path}),
			});
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			if (selectedFile.cleanName.trim().length > 0){
				a.download = selectedFile.cleanName + ".png";
			}
			else {
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
			<Sidebar handleDownload = {handleDownload} geoJsonData={mapData}/>
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
