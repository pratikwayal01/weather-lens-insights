
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessedWeatherData } from '@/types/weather';
import { cn } from '@/lib/utils';
import { getWeatherIconUrl, formatTemperature } from '@/utils/weatherUtils';
import { useWeatherStore } from '@/store/weatherStore';

interface WeatherCardProps {
  weatherData: ProcessedWeatherData;
  className?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData, className }) => {
  const { config } = useWeatherStore();
  const { temperatureUnit } = config;
  
  const getWeatherClass = (condition: string): string => {
    const lowerCondition = condition.toLowerCase();
    switch (lowerCondition) {
      case 'clear': return 'bg-gradient-to-br from-amber-100 to-amber-300 text-amber-900';
      case 'clouds': return 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900';
      case 'rain': return 'bg-gradient-to-br from-blue-100 to-blue-300 text-blue-900';
      case 'snow': return 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900';
      case 'thunderstorm': return 'bg-gradient-to-br from-indigo-200 to-indigo-400 text-indigo-900';
      case 'drizzle': return 'bg-gradient-to-br from-sky-100 to-sky-300 text-sky-900';
      case 'mist': 
      case 'haze':
      case 'fog':
        return 'bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900';
      default: return 'bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900';
    }
  };

  return (
    <Card className={cn('overflow-hidden shadow-lg', getWeatherClass(weatherData.main), className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{weatherData.city}</span>
          <span className="text-sm font-normal">{weatherData.time}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-4xl font-bold">
              {formatTemperature(weatherData.temp, temperatureUnit)}
            </div>
            <div className="text-sm">
              Feels like: {formatTemperature(weatherData.feels_like, temperatureUnit)}
            </div>
            <div className="mt-2 text-sm capitalize">
              {weatherData.description}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <img 
              src={getWeatherIconUrl(weatherData.icon)} 
              alt={weatherData.description}
              className="w-16 h-16"
            />
            <div className="text-xs flex gap-2 mt-1">
              <span>H: {formatTemperature(weatherData.temp_max, temperatureUnit)}</span>
              <span>L: {formatTemperature(weatherData.temp_min, temperatureUnit)}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4 text-xs">
          <div>Humidity: {weatherData.humidity}%</div>
          <div>Wind: {weatherData.wind_speed} m/s</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
