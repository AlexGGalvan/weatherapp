import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [city, setCity] = useState(''); 
  const [weatherData, setWeatherData] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLat(latitude);
          setLon(longitude);

          fetchWeather(latitude, longitude);
          fetchWeatherHistory(latitude, longitude);
        },
        (error) => {
          setError('Error getting location. Make sure to allow location access.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await axios.get(`http://98.82.178.89/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
        },
      });
      setWeatherData(response.data);
      setError('');
    } catch (err) {
      setError('Error fetching weather data');
      setWeatherData(null);
    }
  };

  const fetchWeatherHistory = async (latitude, longitude) => {
    try {
      const response = await axios.get(`http://98.82.178.89/weather/history`, {
        params: {
          lat: latitude,
          lon: longitude,
        },
      });
      setWeatherHistory(response.data);
    } catch (err) {
      setError('Error fetching historical weather data');
    }
  };

  const fetchCityCoordinates = async (cityName) => {
    try {
      const response = await axios.get(`http://98.82.178.89/geo/city`, {
        params: {
          city: cityName,
        },
      });

      const { lat, lon } = response.data;
      setLat(lat);
      setLon(lon);
      return { lat, lon };
    } catch (err) {
      setError('Error fetching city coordinates');
      return null;
    }
  };

  const handleGetWeather = async () => {
    let latitude = lat;
    let longitude = lon;

    if (city) {
      const coordinates = await fetchCityCoordinates(city);
      if (coordinates) {
        latitude = coordinates.lat;
        longitude = coordinates.lon;
      }
    }

    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
      fetchWeatherHistory(latitude, longitude);
    } else {
      setError('Latitude and Longitude are not available.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Weather App</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Today's Weather</h2>
            
            <div>
              <label className="block text-gray-700">City:</label>
              <input 
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                className="mt-1 block w-full px-3 py-2 bg-gray-200 rounded-md"
              />
            </div>

            <button 
              onClick={handleGetWeather} 
              className="mt-6 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
              Get Weather
            </button>

            {weatherData && (
              <div className="mt-4">
                <p className="text-xl text-gray-700">Temperature: {weatherData.current.temp} °C</p>
                <p className="text-xl text-gray-700">Weather: {weatherData.current.weather[0].description}</p>
                <p className="text-xl text-gray-700">Humidity: {weatherData.current.humidity}%</p>
                <p className="text-xl text-gray-700">Wind Speed: {weatherData.current.wind_speed} m/s</p>
                <p className="text-xl text-gray-700">City: {weatherData.timezone.split('/')[1]}</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Historical Weather (Last 5 Days)</h2>
            {weatherHistory.length > 0 ? (
              <ul className="space-y-4">
                {weatherHistory.map((day, index) => (
                  <li key={index} className="border-b pb-4">
                    <p className="text-gray-700"><strong>{day.date}:</strong> {day.temp} °C, {day.weather}</p>
                    <p className="text-sm text-gray-500">Humidity: {day.humidity}% | Wind Speed: {day.wind_speed} m/s</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No historical data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
