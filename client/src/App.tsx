import React, { useEffect, useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [message, setMessage] = useState('');

  // const baseUrl: string = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  useEffect(() => {
    fetch(`/init`)
        .then((response) => response.json())
        .then((data) => setMessage(data.message))
        .catch((error) => console.error('Error fetching data:', error));
}, []);

  return (
    <div className="App">
      <main>
        <p>🎊Message from the backend: {message}</p>
        </main>
    </div>
  );
};

export default App;
