'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentWeather, getUserLocation, getWeatherByZip, formatTemperature, getWindDirection, convertTemperature } from '../services/weather';
import { WeatherData, WeatherError, ForecastData, DailyForecastData, TemperatureUnit } from '../types/weather';
import { Skeleton } from '@/components/ui/skeleton';
import { LocationSearch } from './LocationSearch';
import { ForecastChart } from './ForecastChart';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wind, Droplets, Gauge } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DailyForecast } from './DailyForecast';

// Local storage keys
const STORAGE_KEYS = {
  UNIT: 'weather-unit-preference',
  LOCATION: 'weather-location-preference'
} as const;

interface LocationPreference {
  zipCode: string;
  name: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [daily, setDaily] = useState<DailyForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEYS.UNIT) as TemperatureUnit) || 'fahrenheit';
    }
    return 'fahrenheit';
  });

  // Save unit preference when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNIT, unit);
  }, [unit]);

  const saveLocationPreference = (zipCode: string, name: string) => {
    const preference: LocationPreference = { zipCode, name };
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(preference));
  };

  const getLocationPreference = (): LocationPreference | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.LOCATION);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  const fetchWeatherByLocation = async () => {
    try {
      setLoading(true);
      const location = await getUserLocation();
      const data = await getCurrentWeather(location.lat, location.lon);
      
      if ('message' in data) {
        setError(data.message);
      } else {
        setWeather(data.current);
        setForecast(data.forecast || null);
        setDaily(data.daily || null);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleZipCodeSearch = async (zipCode: string) => {
    try {
      setLoading(true);
      const data = await getWeatherByZip(zipCode);
      
      if ('message' in data) {
        setError(data.message);
      } else {
        setWeather(data.current);
        setForecast(data.forecast || null);
        setDaily(data.daily || null);
        setError(null);
        // Save location preference after successful fetch
        saveLocationPreference(zipCode, data.current.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  // Initial load - check for saved location or use geolocation
  useEffect(() => {
    const loadWeather = async () => {
      const savedLocation = getLocationPreference();
      if (savedLocation) {
        await handleZipCodeSearch(savedLocation.zipCode);
      } else {
        await fetchWeatherByLocation();
      }
    };

    loadWeather();
  }, []);

  const handleRefresh = () => {
    const savedLocation = getLocationPreference();
    if (savedLocation) {
      handleZipCodeSearch(savedLocation.zipCode);
    } else if (weather) {
      fetchWeatherByLocation();
    }
  };

  const toggleUnit = () => {
    setUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Weather</CardTitle>
          <LocationSearch onLocationSelect={handleZipCodeSearch} />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Weather</CardTitle>
          <LocationSearch onLocationSelect={handleZipCodeSearch} />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Weather in {weather.name}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium"
            onClick={toggleUnit}
          >
            °{unit === 'celsius' ? 'C' : 'F'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <LocationSearch onLocationSelect={handleZipCodeSearch} />
        </div>
      </div>

      {/* Main Temperature Display */}
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-start gap-4">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              width={64}
              height={64}
              className="-mt-2 -ml-2"
            />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-semibold">
                  {Math.round(convertTemperature(weather.main.temp, unit))}°F
                </span>
                <span className="text-xl text-muted-foreground">
                  {weather.weather[0].description}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">
                Feels like {formatTemperature(weather.main.feels_like, unit)}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <p className="text-sm">
              H: {formatTemperature(weather.main.temp_max, unit)}{' '}
              L: {formatTemperature(weather.main.temp_min, unit)}
            </p>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center gap-2">
              <Wind className="h-4 w-4" /> Wind
            </p>
            <p className="text-sm text-muted-foreground">
              {Math.round(weather.wind.speed * 3.6)} km/h {getWindDirection(weather.wind.deg)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-4 w-4" /> Humidity
            </p>
            <p className="text-sm text-muted-foreground">
              {weather.main.humidity}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4" /> Pressure
            </p>
            <p className="text-sm text-muted-foreground">
              {weather.main.pressure} hPa
            </p>
          </div>
        </div>

        {forecast && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">24-Hour Forecast</h3>
            <ForecastChart forecast={forecast} unit={unit} />
          </div>
        )}

        {daily && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">8-Day Forecast</h3>
            <DailyForecast forecast={daily} unit={unit} />
          </div>
        )}
      </div>
    </Card>
  );
} 