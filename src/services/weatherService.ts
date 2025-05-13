
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
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is missing or empty');
    }

    const { lat, lon } = cityInfo;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    console.log(`Fetching weather for ${cityInfo.name} with API key: ${apiKey.substring(0, 5)}...`);
    
    const response = await fetch(url);
    
    if (response.status === 401) {
      const responseData = await response.json();
      console.error('API Key Error:', responseData);
      throw new Error('Invalid API key. Please check your OpenWeatherMap API key in the settings and ensure it is active.');
    }
    
    if (!response.ok) {
      throw new Error(`Error fetching weather data: ${response.statusText}`);
    }
    
    const data: CityWeatherResponse = await response.json();
    return processWeatherData(data, useCelsius);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to fetch weather for ${cityInfo.name}:`, error);
    
    // Show more detailed error message
    if (errorMessage.includes('API key')) {
      toast({
        title: "API Key Error",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error fetching weather data",
        description: `Could not fetch data for ${cityInfo.name}. ${errorMessage}`,
        variant: "destructive",
      });
    }
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
    if (!apiKey || apiKey.trim() === '') {
      toast({
        title: "API Key Missing",
        description: "Please enter your OpenWeatherMap API key in the settings.",
        variant: "destructive",
      });
      return {};
    }

    // Check if API key format is valid (to catch common mistakes)
    if (apiKey.length < 20) {
      toast({
        title: "Invalid API Key Format",
        description: "The API key appears to be too short. Please check your OpenWeatherMap API key.",
        variant: "destructive",
      });
      return {};
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch weather for all cities:', error);
    toast({
      title: "Error fetching weather data",
      description: `Could not fetch data for all cities. ${errorMessage}`,
      variant: "destructive",
    });
    return {};
  }
};
