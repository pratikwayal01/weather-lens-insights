import { CityWeatherResponse, ProcessedWeatherData, CityInfo } from '@/types/weather';
import { processWeatherData } from '@/utils/weatherUtils';
import { toast } from '@/hooks/use-toast';
import { useWeatherStore } from '@/store/weatherStore';

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
    const units = useCelsius ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    
    console.log(`Fetching weather for ${cityInfo.name}...`);
    
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

// Fetch weather data for all cities and update the store
export const fetchAllCitiesWeather = async (
  cities: CityInfo[],
  apiKey: string,
  useCelsius: boolean = true
): Promise<boolean> => {
  try {
    if (!apiKey || apiKey.trim() === '') {
      toast({
        title: "API Key Missing",
        description: "Please enter your OpenWeatherMap API key in the settings.",
        variant: "destructive",
      });
      return false;
    }

    // Check if API key format is valid (to catch common mistakes)
    if (apiKey.length < 20) {
      toast({
        title: "Invalid API Key Format",
        description: "The API key appears to be too short. Please check your OpenWeatherMap API key.",
        variant: "destructive",
      });
      return false;
    }

    // Set loading state
    const store = useWeatherStore.getState();
    store.setIsLoading(true);
    
    let successCount = 0;
    // Process cities one by one to properly add to the store
    for (const city of cities) {
      const weatherData = await fetchCityWeather(city, apiKey, useCelsius);
      if (weatherData) {
        // Add directly to the store
        store.addWeatherData(city.id, weatherData);
        successCount++;
      }
    }
    
    // Update daily summaries with new data
    store.updateDailySummaries();
    
    // Update last fetched timestamp and loading state
    store.setLastUpdated(Date.now());
    store.setIsLoading(false);
    
    if (successCount > 0) {
      toast({
        title: "Weather Updated",
        description: `Successfully updated weather data for ${successCount} ${successCount === 1 ? 'city' : 'cities'}.`,
      });
      return true;
    } else {
      toast({
        title: "No Data Retrieved",
        description: "Could not fetch weather data for any city. Please check your settings and try again.",
        variant: "destructive",
      });
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch weather for all cities:', error);
    toast({
      title: "Error fetching weather data",
      description: `Could not fetch data for all cities. ${errorMessage}`,
      variant: "destructive",
    });
    
    // Reset loading state
    useWeatherStore.getState().setIsLoading(false);
    return false;
  }
};