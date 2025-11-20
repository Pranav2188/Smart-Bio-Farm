/**
 * Weather Service - Fetches real-time weather data from OpenWeatherMap API
 */

/**
 * Get current weather data for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} apiKey - OpenWeatherMap API key
 * @returns {Promise<Object|null>} Weather data or null if error
 */
export const getWeather = async (lat, lon, apiKey) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      city: data.name,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      windSpeed: data.wind.speed
    };
  } catch (err) {
    console.error("Error fetching weather:", err);
    return null;
  }
};

/**
 * Get user's current location
 * @returns {Promise<Object>} Coordinates {lat, lon} or default location
 */
export const getUserLocation = () => {
  return new Promise((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Default to Mumbai, India
          resolve({ lat: 19.0760, lon: 72.8777 });
        }
      );
    } else {
      // Default to Mumbai, India
      resolve({ lat: 19.0760, lon: 72.8777 });
    }
  });
};

/**
 * Get weather icon URL
 * @param {string} iconCode - OpenWeatherMap icon code
 * @returns {string} Icon URL
 */
export const getWeatherIconUrl = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};
