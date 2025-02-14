'use client';

import { DailyForecastData, TemperatureUnit } from '../types/weather';
import { formatTemperature } from '../services/weather';

interface DailyForecastProps {
  forecast: DailyForecastData;
  unit: TemperatureUnit;
}

export function DailyForecast({ forecast, unit }: DailyForecastProps) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
      {forecast.daily.slice(0, 8).map((day) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayMonth = date.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric'
        });
        
        return (
          <div 
            key={day.dt} 
            className="flex flex-col items-center text-center"
          >
            <p className="font-medium">{dayName}</p>
            <p className="text-sm text-muted-foreground">{dayMonth}</p>
            <img
              src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
              alt={day.weather[0].description}
              width={50}
              height={50}
            />
            <p className="text-sm">
              {formatTemperature(day.temp.max, unit)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatTemperature(day.temp.min, unit)}
            </p>
          </div>
        );
      })}
    </div>
  );
} 