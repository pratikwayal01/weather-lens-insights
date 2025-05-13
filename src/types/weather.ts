
export interface WeatherData {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

export interface WindData {
  speed: number;
  deg: number;
}

export interface CloudsData {
  all: number;
}

export interface SysData {
  type: number;
  id: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface CityWeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: WeatherData[];
  base: string;
  main: MainData;
  visibility: number;
  wind: WindData;
  clouds: CloudsData;
  dt: number;
  sys: SysData;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ProcessedWeatherData {
  city: string;
  timestamp: number;
  date: string;
  time: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  main: string;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

export interface DailySummary {
  city: string;
  date: string;
  avg_temp: number;
  min_temp: number;
  max_temp: number;
  dominant_condition: string;
  condition_count: Record<string, number>;
  humidity: number;
  wind_speed: number;
  records: ProcessedWeatherData[];
}

export interface AlertConfig {
  enabled: boolean;
  high_temp: number;
  low_temp: number;
  consecutive_readings: number;
  weather_condition: string;
}

export interface Alert {
  id: string;
  city: string;
  timestamp: number;
  type: 'high_temp' | 'low_temp' | 'weather_condition';
  message: string;
  value: number | string;
  threshold: number | string;
  acknowledged: boolean;
}

export interface CityInfo {
  name: string;
  id: string;
  lat: number;
  lon: number;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface AppConfig {
  apiKey: string;
  updateInterval: number; // in minutes
  temperatureUnit: TemperatureUnit;
  cities: CityInfo[];
  alerts: Record<string, AlertConfig>; // city id -> alert config
}
