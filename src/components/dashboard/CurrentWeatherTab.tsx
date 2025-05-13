
import React from 'react';
import WeatherCard from '../WeatherCard';
import EmptyDataState from './EmptyDataState';
import { ProcessedWeatherData } from '@/types/weather';

interface CurrentWeatherTabProps {
  currentWeather: ProcessedWeatherData | undefined;
  cityWeatherData: ProcessedWeatherData[];
  cityName: string;
}

const CurrentWeatherTab: React.FC<CurrentWeatherTabProps> = ({ 
  currentWeather, 
  cityWeatherData, 
  cityName 
}) => {
  if (!currentWeather) {
    return <EmptyDataState cityName={cityName} />;
  }

  return (
    <>
      <h2 className="text-2xl font-bold">{cityName} - Current Weather</h2>
      <WeatherCard weatherData={currentWeather} className="max-w-md" />
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Recent Readings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cityWeatherData.slice(1, 4).map((data, index) => (
            <WeatherCard key={index} weatherData={data} />
          ))}
        </div>
      </div>
    </>
  );
};

export default CurrentWeatherTab;
