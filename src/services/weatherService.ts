
import { CityWeatherResponse, ProcessedWeatherData, AppConfig, CityInfo } from '@/types/weather';
import { processWeatherData } from '@/utils/weatherUtils';
import { toast } from '@/hooks/use-toast';

// Fetch weather data for a specific city using coordinates
export const fetchCityWeather = async (
  cityInfo: CityInfo, 
  apiKey: string,
  useCelsius: boolean = true
): Promise<ProcessedWeatherData | null> => {
  try {
    const { lat, lon } = cityInfo;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching weather data: ${response.statusText}`);
    }
    
    const data: CityWeatherResponse = await response.json();
    return processWeatherData(data, useCelsius);
  } catch (error) {
    console.error(`Failed to fetch weather for ${cityInfo.name}:`, error);
    toast({
      title: "Error fetching weather data",
      description: `Could not fetch data for ${cityInfo.name}. Please check your API key or try again later.`,
      variant: "destructive",
    });
    return null;
  }
};

// Fetch weather data for all cities
export const fetchAllCitiesWeather = async (
  cities: CityInfo[],
  apiKey: string,
  useCelsius: boolean = true
): Promise<Record<string, ProcessedWeatherData>> => {
  try {
    const weatherPromises = cities.map(city => fetchCityWeather(city, apiKey, useCelsius));
    const weatherResults = await Promise.all(weatherPromises);
    
    // Filter out null results and create a record by city id
    return weatherResults.reduce((acc, result) => {
      if (result) {
        const cityId = cities.find(c => c.name === result.city)?.id || '';
        acc[cityId] = result;
      }
      return acc;
    }, {} as Record<string, ProcessedWeatherData>);
  } catch (error) {
    console.error('Failed to fetch weather for all cities:', error);
    toast({
      title: "Error fetching weather data",
      description: "Could not fetch data for all cities. Please check your API key or try again later.",
      variant: "destructive",
    });
    return {};
  }
};
