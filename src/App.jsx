import React, { useEffect, useState } from "react";

const DEFAULT_CITY = "Waterloo";

function getWeatherIcon(condition) {
  const text = (condition || "").toLowerCase();

  if (text.includes("cloud")) return "☁️";
  if (text.includes("rain") || text.includes("drizzle")) return "🌧️";
  if (text.includes("thunder")) return "⛈️";
  if (text.includes("snow")) return "❄️";
  if (text.includes("mist") || text.includes("fog") || text.includes("haze")) return "🌫️";
  if (text.includes("clear")) return "☀️";
  return "🌤️";
}

function App() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [query, setQuery] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || "";

  async function fetchWeather(targetCity) {
    if (!apiKey) {
      setError("Missing API key. Add VITE_OPENWEATHER_API_KEY to your .env file.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          targetCity
        )}&appid=${apiKey}&units=metric`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "City not found.");
      }

      setWeather(data);
      setCity(targetCity);
    } catch (err) {
      setWeather(null);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather(DEFAULT_CITY);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    fetchWeather(query.trim());
  }

  const temp = weather?.main?.temp;
  const feelsLike = weather?.main?.feels_like;
  const humidity = weather?.main?.humidity;
  const wind = weather?.wind?.speed;
  const condition = weather?.weather?.[0]?.main;
  const description = weather?.weather?.[0]?.description;
  const country = weather?.sys?.country;
  const icon = getWeatherIcon(condition);

  return (
    <div className="app">
      <div className="weather-card">
        <h1>Weather App</h1>
        <p className="subtitle">Simple React weather project for your portfolio</p>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            placeholder="Enter city name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {loading && <p className="message">Loading weather...</p>}

        {error && !loading && <p className="error">{error}</p>}

        {weather && !loading && !error && (
          <div className="weather-info">
            <div className="top-section">
              <div>
                <h2>
                  {city}
                  {country ? `, ${country}` : ""}
                </h2>
                <p className="description">{description}</p>
              </div>
              <div className="icon">{icon}</div>
            </div>

            <div className="temperature">{Math.round(temp)}°C</div>
            <p className="feels-like">Feels like {Math.round(feelsLike)}°C</p>

            <div className="stats">
              <div className="stat-box">
                <span className="label">Humidity</span>
                <span className="value">{humidity}%</span>
              </div>
              <div className="stat-box">
                <span className="label">Wind</span>
                <span className="value">{wind} m/s</span>
              </div>
              <div className="stat-box">
                <span className="label">Condition</span>
                <span className="value">{condition}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;