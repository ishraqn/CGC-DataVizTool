import React, { useEffect, useState } from 'react';
import GeoJSONMap from './components/geoJSONMap';
// import FileUploadForm from './components/uploadForm'
import './App.css';
import {  } from 'leaflet';
import Sidebar from './components/sidebar';

const App: React.FC = () => {
  const [message, setMessage] = useState('');
  const [fileUploads, setFileUploads] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null); 

  useEffect(() => {
    console.log('Fetching data from the backend...');
    fetch('/api/v1/dev')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  useEffect(() => {
    fetch('/api/v1/data-folder/default-simplified.geojson') // Hardcoded for now 
      .then(response => response.json())
      .then(data => {
        setGeoJsonData(data);
      })
      .catch(error => console.error('Failed to load GeoJSON data:', error));
  }, []);

  useEffect(() => {
    fetch("/api/v1/last-upload-file")
        .then((response) => response.json())
        .then((data) => {
            setFileUploads(data);
        })
        .catch((error) =>
            console.error("Failed to load last file upload:", error)
        );
}, []);

  return (
    <div className="App noise">
      <h1> CGC Data Visualization</h1>
      <Sidebar/>
      {geoJsonData && (
      <div className="map-frame">
        <GeoJSONMap geoJsonData={geoJsonData} />
      </div>
      )}
    </div>
  );
}

export default App;