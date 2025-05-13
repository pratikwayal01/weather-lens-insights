
import { CityWeatherResponse, ProcessedWeatherData, DailySummary, Alert, AlertConfig } from '@/types/weather';
import { format, parseISO } from 'date-fns';

export const CITIES = [
  { name: 'Delhi', id: 'delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', id: 'mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Chennai', id: 'chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Bangalore', id: 'bangalore', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata', id: 'kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Hyderabad', id: 'hyderabad', lat: 17.3850, lon: 78.4867 }
];

// Convert Kelvin to Celsius
export const kelvinToCelsius = (kelvin: number): number => {
  return Math.round((kelvin - 273.15) * 10) / 10;
};

// Convert Kelvin to Fahrenheit
export const kelvinToFahrenheit = (kelvin: number): number => {
  return Math.round(((kelvin - 273.15) * 9/5 + 32) * 10) / 10;
};

// Process raw weather data from API
export const processWeatherData = (data: CityWeatherResponse, useCelsius = true): ProcessedWeatherData => {
  const tempConversion = useCelsius ? kelvinToCelsius : kelvinToFahrenheit;
  
  const date = new Date(data.dt * 1000);
  
  return {
    city: data.name,
    timestamp: data.dt,
    date: format(date, 'yyyy-MM-dd'),
    time: format(date, 'HH:mm:ss'),
    temp: tempConversion(data.main.temp),
    feels_like: tempConversion(data.main.feels_like),
    temp_min: tempConversion(data.main.temp_min),
    temp_max: tempConversion(data.main.temp_max),
    main: data.weather[0].main,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed
  };
};

// Calculate daily summary from a list of weather records
export const calculateDailySummary = (records: ProcessedWeatherData[]): DailySummary | null => {
  if (!records || records.length === 0) return null;
  
  const city = records[0].city;
  const date = records[0].date;
  
  // Calculate temperature aggregates
  let totalTemp = 0;
  let minTemp = records[0].temp;
  let maxTemp = records[0].temp;
  let totalHumidity = 0;
  let totalWindSpeed = 0;
  
  // Count occurrences of each weather condition
  const conditionCount: Record<string, number> = {};
  
  records.forEach(record => {
    // Temperature stats
    totalTemp += record.temp;
    minTemp = Math.min(minTemp, record.temp);
    maxTemp = Math.max(maxTemp, record.temp);
    
    // Additional parameters
    totalHumidity += record.humidity;
    totalWindSpeed += record.wind_speed;
    
    // Count weather conditions
    const condition = record.main;
    conditionCount[condition] = (conditionCount[condition] || 0) + 1;
  });
  
  // Find the dominant weather condition
  let dominantCondition = '';
  let maxCount = 0;
  
  Object.entries(conditionCount).forEach(([condition, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantCondition = condition;
    }
  });
  
  return {
    city,
    date,
    avg_temp: Math.round((totalTemp / records.length) * 10) / 10,
    min_temp: minTemp,
    max_temp: maxTemp,
    dominant_condition: dominantCondition,
    condition_count: conditionCount,
    humidity: Math.round((totalHumidity / records.length) * 10) / 10,
    wind_speed: Math.round((totalWindSpeed / records.length) * 10) / 10,
    records
  };
};

// Check if the weather data should trigger an alert based on alert configuration
export const checkForAlerts = (
  currentData: ProcessedWeatherData, 
  previousData: ProcessedWeatherData[], 
  alertConfig: AlertConfig
): Alert | null => {
  if (!alertConfig.enabled) return null;
  
  // Check for high temperature alert
  if (currentData.temp > alertConfig.high_temp) {
    // Check if we have enough consecutive readings
    if (previousData.length >= alertConfig.consecutive_readings - 1) {
      const consecutiveHighTemp = previousData
        .slice(0, alertConfig.consecutive_readings - 1)
        .every(data => data.temp > alertConfig.high_temp);
      
      if (consecutiveHighTemp) {
        return {
          id: `${currentData.city}-high-temp-${currentData.timestamp}`,
          city: currentData.city,
          timestamp: currentData.timestamp,
          type: 'high_temp',
          message: `High temperature alert: ${currentData.temp}°C exceeds threshold of ${alertConfig.high_temp}°C for ${alertConfig.consecutive_readings} consecutive readings`,
          value: currentData.temp,
          threshold: alertConfig.high_temp,
          acknowledged: false
        };
      }
    }
  }
  
  // Check for low temperature alert
  if (currentData.temp < alertConfig.low_temp) {
    // Check if we have enough consecutive readings
    if (previousData.length >= alertConfig.consecutive_readings - 1) {
      const consecutiveLowTemp = previousData
        .slice(0, alertConfig.consecutive_readings - 1)
        .every(data => data.temp < alertConfig.low_temp);
      
      if (consecutiveLowTemp) {
        return {
          id: `${currentData.city}-low-temp-${currentData.timestamp}`,
          city: currentData.city,
          timestamp: currentData.timestamp,
          type: 'low_temp',
          message: `Low temperature alert: ${currentData.temp}°C below threshold of ${alertConfig.low_temp}°C for ${alertConfig.consecutive_readings} consecutive readings`,
          value: currentData.temp,
          threshold: alertConfig.low_temp,
          acknowledged: false
        };
      }
    }
  }
  
  // Check for specific weather condition
  if (alertConfig.weather_condition && currentData.main === alertConfig.weather_condition) {
    return {
      id: `${currentData.city}-condition-${currentData.timestamp}`,
      city: currentData.city,
      timestamp: currentData.timestamp,
      type: 'weather_condition',
      message: `Weather condition alert: ${currentData.main} condition detected`,
      value: currentData.main,
      threshold: alertConfig.weather_condition,
      acknowledged: false
    };
  }
  
  return null;
};

// Get the color for a weather condition
export const getWeatherColor = (condition: string): string => {
  const conditionLower = condition.toLowerCase();
  switch (conditionLower) {
    case 'clear':
      return 'weather-clear';
    case 'clouds':
      return 'weather-clouds';
    case 'rain':
      return 'weather-rain';
    case 'snow':
      return 'weather-snow';
    case 'thunderstorm':
      return 'weather-thunderstorm';
    case 'drizzle':
      return 'weather-drizzle';
    case 'mist':
    case 'fog':
    case 'haze':
      return 'weather-mist';
    default:
      return 'weather-clear';
  }
};

// Format temperature based on unit
export const formatTemperature = (temp: number, unit: 'celsius' | 'fahrenheit'): string => {
  const symbol = unit === 'celsius' ? '°C' : '°F';
  return `${temp}${symbol}`;
};

// Get weather icon URL from OpenWeatherMap
export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};
