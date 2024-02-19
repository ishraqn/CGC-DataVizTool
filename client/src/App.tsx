import React, { useEffect, useState } from 'react';
import GeoJSONMap from './components/geoJSONMap';
import FileUploadForm from './components/uploadForm'
import './App.css';

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
    <div className="App full-width">
      <header className="App-header">
        <h1>CGC DEV TEAM</h1>
        <main>
          <p>🎊Message from the backend: {message}</p>
        </main>
      </header>
      {geoJsonData && <GeoJSONMap geoJsonData={geoJsonData} />}
      <FileUploadForm />
      <div>
                <h2>Last Uploaded File Details:</h2>
                {fileUploads && (
                    <ul>
                        <li>Name: {fileUploads.name}</li>
                        <li>Path: {fileUploads.path}</li>
                        <li>Size: {fileUploads.size} bytes</li>
                        <li>Type: {fileUploads.type}</li>
                        <li>Last Modified: {fileUploads.lastModifiedDate}</li>
                    </ul>
                )}
            </div>
    </div>
  );
}

export default App;