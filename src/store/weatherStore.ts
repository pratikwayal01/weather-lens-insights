import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProcessedWeatherData, DailySummary, Alert, AppConfig, CityInfo } from '@/types/weather';
import { CITIES, calculateDailySummary, checkForAlerts } from '@/utils/weatherUtils';

// Define the maximum number of records to keep per city
const MAX_RECORDS_PER_CITY = 100;
const MAX_ALERTS = 50;

interface WeatherStore {
  // Configuration
  config: AppConfig;
  updateConfig: (config: Partial<AppConfig>) => void;
  updateCityAlertConfig: (cityId: string, config: Partial<Record<string, any>>) => void;
  
  // Weather data
  weatherData: Record<string, ProcessedWeatherData[]>; // city id -> weather data array
  addWeatherData: (cityId: string, data: ProcessedWeatherData) => void;
  clearWeatherData: (cityId?: string) => void;
  
  // Daily summaries
  dailySummaries: Record<string, Record<string, DailySummary>>; // city id -> date -> summary
  updateDailySummaries: () => void;
  
  // Alerts
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAlerts: () => void;
  
  // Selected city
  selectedCityId: string;
  setSelectedCityId: (cityId: string) => void;
  
  // API status
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  lastUpdated: number | null;
  setLastUpdated: (timestamp: number) => void;
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      // Default configuration
      config: {
        apiKey: '', // User needs to provide their own API key
        updateInterval: 5, // Default to 5 minutes
        temperatureUnit: 'celsius',
        cities: CITIES,
        alerts: CITIES.reduce((acc, city) => {
          acc[city.id] = {
            enabled: true,
            high_temp: 35,
            low_temp: 10,
            consecutive_readings: 2,
            weather_condition: ''
          };
          return acc;
        }, {} as Record<string, any>)
      },
      updateConfig: (config) => set((state) => ({
        config: { ...state.config, ...config }
      })),
      updateCityAlertConfig: (cityId, config) => set((state) => ({
        config: {
          ...state.config,
          alerts: {
            ...state.config.alerts,
            [cityId]: {
              ...state.config.alerts[cityId],
              ...config
            }
          }
        }
      })),
      
      // Weather data
      weatherData: {},
      addWeatherData: (cityId, data) => set((state) => {
        const currentCityData = state.weatherData[cityId] || [];
        const newCityData = [data, ...currentCityData].slice(0, MAX_RECORDS_PER_CITY);
        
        // Check for alerts
        const alertConfig = state.config.alerts[cityId];
        if (alertConfig && alertConfig.enabled && currentCityData.length > 0) {
          const alert = checkForAlerts(data, currentCityData, alertConfig);
          if (alert) {
            setTimeout(() => get().addAlert(alert), 0);
          }
        }
        
        return {
          weatherData: {
            ...state.weatherData,
            [cityId]: newCityData
          },
          lastUpdated: Date.now()
        };
      }),
      clearWeatherData: (cityId) => set((state) => {
        if (cityId) {
          const { [cityId]: _, ...rest } = state.weatherData;
          return { weatherData: rest };
        }
        return { weatherData: {} };
      }),
      
      // Daily summaries
      dailySummaries: {},
      updateDailySummaries: () => set((state) => {
        const { weatherData } = state;
        const newDailySummaries: Record<string, Record<string, DailySummary>> = {};
        
        // Process data for each city
        Object.keys(weatherData).forEach(cityId => {
          const cityData = weatherData[cityId] || [];
          newDailySummaries[cityId] = {};
          
          // Group data by date
          const dataByDate: Record<string, ProcessedWeatherData[]> = {};
          cityData.forEach(data => {
            if (!dataByDate[data.date]) {
              dataByDate[data.date] = [];
            }
            dataByDate[data.date].push(data);
          });
          
          // Calculate summaries for each date
          Object.keys(dataByDate).forEach(date => {
            const summary = calculateDailySummary(dataByDate[date]);
            if (summary) {
              newDailySummaries[cityId][date] = summary;
            }
          });
        });
        
        return { dailySummaries: newDailySummaries };
      }),
      
      // Alerts
      alerts: [],
      addAlert: (alert) => set((state) => ({
        alerts: [alert, ...state.alerts].slice(0, MAX_ALERTS)
      })),
      acknowledgeAlert: (alertId) => set((state) => ({
        alerts: state.alerts.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      })),
      clearAlerts: () => set({ alerts: [] }),
      
      // Selected city
      selectedCityId: CITIES[0].id,
      setSelectedCityId: (cityId) => set({ selectedCityId: cityId }),
      
      // API status
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      lastUpdated: null,
      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp })
    }),
    {
      name: 'weather-monitor-storage'
    }
  )
);
