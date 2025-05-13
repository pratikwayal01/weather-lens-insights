
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWeatherStore } from '@/store/weatherStore';
import { CityInfo } from '@/types/weather';

const CitySelector: React.FC = () => {
  const { config, selectedCityId, setSelectedCityId } = useWeatherStore();
  const { cities } = config;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {cities.map((city: CityInfo) => (
        <Button
          key={city.id}
          variant={selectedCityId === city.id ? "default" : "outline"}
          onClick={() => setSelectedCityId(city.id)}
          className="px-4 py-2"
        >
          {city.name}
        </Button>
      ))}
    </div>
  );
};

export default CitySelector;
