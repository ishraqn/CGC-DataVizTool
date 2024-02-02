import React, { useEffect, useState } from 'react';
import GeoJSONMap from './components/geoJSONMap';
import './App.css';

const App: React.FC = () => {
  const [message, setMessage] = useState('');
  const [count, setCount] = useState(0);
  const [geoJsonData, setGeoJsonData] = useState(null); 

  useEffect(() => {
    fetch('/api/init')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  useEffect(() => {
    fetch('/api/v1/data-folder/default-2024-02-02T19-04-55.958Z.geojson') // Hardcoded for now 
      .then(response => response.json())
      .then(data => {
        setGeoJsonData(data);
      })
      .catch(error => console.error('Failed to load GeoJSON data:', error));
  }, []);

  return (
    <div className="App full-width">
      <header className="App-header">
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount(count + 1)}>
            count is {count}
          </button>
        </div>
        <main>
          <p>🎊Message from the backend: {message}</p>
        </main>
      </header>
      {geoJsonData && <GeoJSONMap geoJsonData={geoJsonData} />}
    </div>
  );
}

export default App;