'use client';

import { ForecastData, TemperatureUnit } from '../types/weather';
import { convertTemperature } from '../services/weather';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface ForecastChartProps {
  forecast: ForecastData;
  unit: TemperatureUnit;
}

export function ForecastChart({ forecast, unit }: ForecastChartProps) {
  const chartData = forecast.list
    .slice(0, 8)
    .map((item) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      temp: Math.round(convertTemperature(item.main.temp, unit)),
    }));

  // Calculate min and max for better Y-axis range
  const temps = chartData.map(d => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const padding = Math.ceil((maxTemp - minTemp) * 0.2); // 20% padding
  const yAxisRange = [
    Math.floor(minTemp - padding),
    Math.ceil(maxTemp + padding)
  ];

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={true}
            vertical={false}
            stroke="var(--border)"
            opacity={0.2}
          />
          <XAxis
            dataKey="time"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}°`}
            domain={yAxisRange}
            padding={{ top: 0, bottom: 0 }}
            width={35}
            ticks={Array.from(
              { length: 5 },
              (_, i) => Math.round(yAxisRange[0] + (i * (yAxisRange[1] - yAxisRange[0]) / 4))
            )}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-1">
                      <p className="text-[0.70rem] uppercase text-muted-foreground">
                        {payload[0].payload.time}
                      </p>
                      <p className="font-bold">
                        {payload[0].value}°{unit === 'celsius' ? 'C' : 'F'}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="black"
            strokeWidth={1.5}
            dot={{
              r: 2,
              fill: 'var(--background)',
              stroke: 'var(--foreground)',
              strokeWidth: 1.5,
            }}
            activeDot={{
              r: 3,
              fill: 'var(--foreground)',
              stroke: 'var(--background)',
              strokeWidth: 1.5,
            }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 