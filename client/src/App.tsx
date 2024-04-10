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
	const { uploadedFiles, currentFileIndex, setCurrentFileIndex, featureColors, featureVisibility, titlesById } = useToggle();
	const [previousFileIndex, setPreviousFileIndex] = useState(-1);

	const getCurrentSelectedFile = async () => {
		const fileId = uploadedFiles[currentFileIndex]
			? uploadedFiles[currentFileIndex].id
			: undefined;
		if (!fileId) {
			console.error(
				"No file ID found for selected file:",
				uploadedFiles[currentFileIndex]
			);
		} else {
			return await fetch(`/api/v1/${fileId}`);
		}
	};

	useEffect(() => {
		// Initial data loading based on whether aggregated data should be used
		const fetchData = async () => {
			try {
				if (uploadedFiles.length == 0) {
					const response = await fetch(
						"/api/v1/data-folder/default-simplified.geojson"
					);
					if (!response.ok) {
						throw new Error(`HTTP error! Status: ${response.status}`);
					} else {
						const data = await response.json();
						setMapData(data);
					}
				}
			} catch (error) {
				console.error("Failed to load data:", error);
			}
		};

		fetchData();
	}, [uploadedFiles.length]);

	useEffect(() => {
		const loadUploadedFile = async () => {
			if (uploadedFiles.length == 1) {
				setCurrentFileIndex(0);
			} else {
				setCurrentFileIndex(uploadedFiles.length - 1);
			}
			if (uploadedFiles.length > 0) {
				let response, data;
				try {
					response = await getCurrentSelectedFile();
					if (response && !response.ok) {
						throw new Error(`HTTP error! Status: ${response.status}`);
					} else if (response) {
						data = await response.json();
						setMapData(data);
					}
				} catch (error) {
					console.error("Failed to load aggregated data:", error);
				}
			}
		};
		loadUploadedFile();
	}, [currentFileIndex, uploadedFiles]);

	useEffect(() => {
		// Update map data when a file is selected from the sidebar
		if (previousFileIndex != currentFileIndex) {
			const updateSelectedFile = async () => {
				if (uploadedFiles[currentFileIndex]) {
					let response, data;
					try {
						response = await getCurrentSelectedFile();
						if (response && !response.ok) {
							throw new Error(`HTTP error! Status: ${response.status}`);
						} else if (response) {
							data = await response.json();
							setMapData(data);
							setPreviousFileIndex(currentFileIndex);
						}
					} catch (error) {
						console.error(
							`Failed to load GeoJSON data for ${uploadedFiles[currentFileIndex].name}:`,
							error
						);
					}
				}
			};
			updateSelectedFile();
		}
	}, [uploadedFiles[currentFileIndex]]);

	const handleDownload = async () => {
		try {
			const selectedFile = uploadedFiles[currentFileIndex];
			const customTitle = titlesById[selectedFile.id.toString()] !== undefined ? titlesById[selectedFile.id.toString()] : selectedFile.title;
			const response = await fetch("/api/v1/map/render-map", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ filePath: selectedFile.path, fillColors: featureColors, visibileFeatures: featureVisibility, title: customTitle}),
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
