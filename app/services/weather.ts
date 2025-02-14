import { WeatherData, WeatherError, ForecastData, DailyForecastData, TemperatureUnit } from '../types/weather';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ONE_CALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

interface CachedWeather {
  data: WeatherData;
  forecast?: ForecastData;
  daily?: DailyForecastData;
  timestamp: number;
}

const weatherCache = new Map<string, CachedWeather>();

function getCachedWeather(key: string): CachedWeather | null {
  const cached = weatherCache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    weatherCache.delete(key);
    return null;
  }

  return cached;
}

function cacheWeather(key: string, data: WeatherData, forecast?: ForecastData, daily?: DailyForecastData) {
  weatherCache.set(key, {
    data,
    forecast,
    daily,
    timestamp: Date.now(),
  });
}

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return (celsius * 9/5) + 32;
  }
  return celsius;
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const temp = convertTemperature(celsius, unit);
  return `${Math.round(temp)}°${unit === 'celsius' ? 'C' : 'F'}`;
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

async function getDailyForecast(lat: number, lon: number): Promise<DailyForecastData | WeatherError> {
  try {
    const response = await fetch(
      `${ONE_CALL_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&exclude=current,minutely,hourly,alerts`
    );

    if (!response.ok) {
      throw new Error('Daily forecast not available');
    }

    return await response.json();
  } catch (error) {
    return { message: error instanceof Error ? error.message : 'Failed to fetch daily forecast' };
  }
}

export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<{ current: WeatherData; forecast?: ForecastData; daily?: DailyForecastData } | WeatherError> {
  const cacheKey = `${lat},${lon}`;
  const cached = getCachedWeather(cacheKey);
  if (cached) return { 
    current: cached.data, 
    forecast: cached.forecast,
    daily: cached.daily 
  };

  try {
    const [weatherResponse, forecastResponse, dailyResponse] = await Promise.all([
      fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      ),
      fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      ),
      getDailyForecast(lat, lon)
    ]);
    
    if (!weatherResponse.ok || !forecastResponse.ok) {
      throw new Error('Weather data not available');
    }

    const [weatherData, forecastData] = await Promise.all([
      weatherResponse.json(),
      forecastResponse.json()
    ]);

    const dailyData = 'message' in dailyResponse ? undefined : dailyResponse;
    cacheWeather(cacheKey, weatherData, forecastData, dailyData);
    
    return { 
      current: weatherData, 
      forecast: forecastData,
      daily: dailyData
    };
  } catch (error) {
    return { message: error instanceof Error ? error.message : 'Failed to fetch weather data' };
  }
}

export async function getWeatherByZip(
  zipCode: string,
  countryCode: string = 'US'
): Promise<{ current: WeatherData; forecast?: ForecastData; daily?: DailyForecastData } | WeatherError> {
  const cacheKey = `zip:${zipCode},${countryCode}`;
  const cached = getCachedWeather(cacheKey);
  if (cached) return { 
    current: cached.data, 
    forecast: cached.forecast,
    daily: cached.daily 
  };

  try {
    // First get coordinates from zip code
    const geoResponse = await fetch(
      `http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},${countryCode}&appid=${API_KEY}`
    );

    if (!geoResponse.ok) {
      throw new Error('Location not found');
    }

    const { lat, lon } = await geoResponse.json();
    return getCurrentWeather(lat, lon);
  } catch (error) {
    return { message: error instanceof Error ? error.message : 'Failed to fetch weather data' };
  }
}

export async function getUserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          reject(new Error('Unable to retrieve your location'));
        }
      );
    }
  });
} 