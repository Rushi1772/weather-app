import React, { useEffect, useState } from "react";

const DEFAULT_CITY = "Waterloo";

const features = [
  {
    text: "Live weather search with OpenWeather API",
    icon: "🌐",
  },
  {
    text: "5-day forecast cards",
    icon: "📅",
  },
  {
    text: "Responsive layout for desktop and mobile",
    icon: "📱",
  },
  {
    text: "Clean UI suitable for portfolio demos",
    icon: "🎨",
  },
];

function WeatherIcon({ condition, large = false }) {
  const text = (condition || "").toLowerCase();
  const sizeClass = large ? "text-6xl" : "text-3xl";

  if (text.includes("cloud")) return <span className={sizeClass}>☁️</span>;
  if (text.includes("rain") || text.includes("drizzle")) {
    return <span className={sizeClass}>🌧️</span>;
  }
  if (text.includes("thunder")) return <span className={sizeClass}>⛈️</span>;
  if (text.includes("snow")) return <span className={sizeClass}>❄️</span>;
  if (text.includes("mist") || text.includes("fog") || text.includes("haze")) {
    return <span className={sizeClass}>🌫️</span>;
  }
  if (text.includes("clear")) return <span className={sizeClass}>☀️</span>;
  return <span className={sizeClass}>🌤️</span>;
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ForecastCard({ item, unitLabel }) {
  const date = new Date(item.dt_txt);
  const day = date.toLocaleDateString(undefined, { weekday: "short" });
  const temp = Math.round(item.main.temp);
  const condition = item.weather?.[0]?.main || "";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{day}</p>
      <div className="my-3 flex justify-center">
        <WeatherIcon condition={condition} />
      </div>
      <p className="text-lg font-semibold text-slate-900">
        {temp}
        {unitLabel}
      </p>
      <p className="mt-1 text-sm text-slate-500">{condition}</p>
    </div>
  );
}

export default function App() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [query, setQuery] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric");

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || "";

  const unitLabel = unit === "metric" ? "°C" : "°F";
  const windLabel = unit === "metric" ? "m/s" : "mph";

  function extractDailyForecast(list) {
    const dailyMap = new Map();

    for (const item of list) {
      const [date, time] = item.dt_txt.split(" ");
      if (!dailyMap.has(date) && time === "12:00:00") {
        dailyMap.set(date, item);
      }
    }

    if (dailyMap.size < 5) {
      for (const item of list) {
        const [date] = item.dt_txt.split(" ");
        if (!dailyMap.has(date)) {
          dailyMap.set(date, item);
        }
        if (dailyMap.size === 5) break;
      }
    }

    return Array.from(dailyMap.values()).slice(0, 5);
  }

  async function fetchWeatherData(targetCity) {
    if (!apiKey) {
      setError("Missing API key. Add VITE_OPENWEATHER_API_KEY to your .env file.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          targetCity
        )}&appid=${apiKey}&units=${unit}&lang=en`
      );

      const currentData = await currentRes.json();

      if (!currentRes.ok) {
        throw new Error(currentData.message || "City not found.");
      }

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          targetCity
        )}&appid=${apiKey}&units=${unit}&lang=en`
      );

      const forecastData = await forecastRes.json();

      if (!forecastRes.ok) {
        throw new Error(forecastData.message || "Forecast not available.");
      }

      setWeather(currentData);
      setForecast(extractDailyForecast(forecastData.list));
      setCity(currentData.name || targetCity);
    } catch (err) {
      setWeather(null);
      setForecast([]);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeatherData(DEFAULT_CITY);
  }, [unit]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    fetchWeatherData(query.trim());
  }

  const temp = weather?.main?.temp;
  const feelsLike = weather?.main?.feels_like;
  const humidity = weather?.main?.humidity;
  const wind = weather?.wind?.speed;
  const pressure = weather?.main?.pressure;
  const visibility = weather?.visibility
    ? `${(weather.visibility / 1000).toFixed(1)} km`
    : "N/A";
  const condition = weather?.weather?.[0]?.main;
  const description = weather?.weather?.[0]?.description;
  const country = weather?.sys?.country;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-sky-100 p-5 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-600">
              Portfolio Project
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Weather App
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Real-time weather and 5-day forecast with a clean, responsive interface.
            </p>
          </div>

          <button
            onClick={() =>
              setUnit((prev) => (prev === "metric" ? "imperial" : "metric"))
            }
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:opacity-95"
          >
            Switch to {unit === "metric" ? "°F" : "°C"}
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mb-8 grid gap-3 rounded-[28px] border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur md:grid-cols-[1fr_auto]"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, e.g. Toronto, Karachi, Mumbai"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-blue-500"
          />
          <button
            type="submit"
            className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        {loading && (
          <div className="rounded-[28px] border border-white/60 bg-white/80 p-8 text-center shadow-lg">
            <p className="text-lg font-medium text-slate-700">
              Loading weather data...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="mb-6 rounded-[28px] border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && weather && !error && (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.25fr,0.75fr]">
              <div className="rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                      Current Conditions
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                      {city}
                      {country ? `, ${country}` : ""}
                    </h2>
                    <p className="mt-2 text-lg capitalize text-slate-600">
                      {description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <WeatherIcon condition={condition} large />
                    <div>
                      <p className="text-5xl font-bold text-slate-900 md:text-6xl">
                        {Math.round(temp)}
                        {unitLabel}
                      </p>
                      <p className="mt-1 text-slate-500">
                        Feels like {Math.round(feelsLike)}
                        {unitLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/60 bg-slate-900 p-6 text-white shadow-xl">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                  App Highlights
                </p>

                <div className="mt-5 space-y-4">
                  {features.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-4 rounded-xl bg-white/10 px-4 py-3 transition-all duration-300 hover:bg-white/20 hover:scale-[1.02]"
                    >
                      <span className="text-xl transition-transform duration-300 group-hover:scale-125">
                        {item.icon}
                      </span>
                      <p className="text-sm text-slate-200 transition-colors duration-300 group-hover:text-white">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Humidity" value={`${humidity}%`} />
              <StatCard label="Wind Speed" value={`${wind} ${windLabel}`} />
              <StatCard label="Pressure" value={`${pressure} hPa`} />
              <StatCard label="Visibility" value={visibility} />
              <StatCard label="Condition" value={condition || "N/A"} />
            </section>

            <section className="mt-8 rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Forecast
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  5-Day Outlook
                </h3>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {forecast.map((item) => (
                  <ForecastCard
                    key={item.dt}
                    item={item}
                    unitLabel={unitLabel}
                  />
                ))}
              </div>
            </section>

            <footer className="mt-10 text-center text-sm text-slate-500">
              <p>Built with React • OpenWeather API • Portfolio Project</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}