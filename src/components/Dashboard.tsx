
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useWeatherStore } from '@/store/weatherStore';
import { ProcessedWeatherData, DailySummary as DailySummaryType } from '@/types/weather';
import WeatherCard from './WeatherCard';
import CitySelector from './CitySelector';
import AlertsList from './AlertsList';
import DailySummary from './DailySummary';
import SettingsForm from './SettingsForm';
import AlertConfig from './AlertConfig';
import { fetchAllCitiesWeather } from '@/services/weatherService';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, Settings, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    config, 
    weatherData,
    dailySummaries,
    addWeatherData, 
    updateDailySummaries,
    selectedCityId,
    isLoading,
    setIsLoading,
    lastUpdated,
    alerts
  } = useWeatherStore();
  
  const [activeTab, setActiveTab] = useState('current');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  const selectedCity = config.cities.find(city => city.id === selectedCityId);
  const cityName = selectedCity?.name || 'Unknown City';
  const currentWeather = weatherData[selectedCityId]?.[0];
  const cityWeatherData = weatherData[selectedCityId] || [];
  const cityDailySummaries = dailySummaries[selectedCityId] || {};
  const summaryDates = Object.keys(cityDailySummaries).sort().reverse();
  const currentSummary = cityDailySummaries[selectedDate];
  const hasUnacknowledgedAlerts = alerts.some(alert => !alert.acknowledged);
  
  // Handle refresh of weather data
  const handleRefresh = async () => {
    if (!config.apiKey) {
      toast({
        title: "API key missing",
        description: "Please provide an OpenWeatherMap API key in the settings.",
        variant: "destructive"
      });
      setActiveTab('settings');
      return;
    }
    
    setIsLoading(true);
    try {
      const useCelsius = config.temperatureUnit === 'celsius';
      const newWeatherData = await fetchAllCitiesWeather(
        config.cities, 
        config.apiKey,
        useCelsius
      );
      
      // Add new weather data for each city
      Object.entries(newWeatherData).forEach(([cityId, data]) => {
        addWeatherData(cityId, data);
      });
      
      // Update daily summaries
      updateDailySummaries();
      
      toast({
        title: "Data updated",
        description: "Weather data has been refreshed successfully."
      });
    } catch (error) {
      console.error("Error refreshing weather data:", error);
      toast({
        title: "Refresh failed",
        description: "There was an error refreshing the weather data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up polling interval
  useEffect(() => {
    if (!config.apiKey) return;
    
    // Fetch data immediately if we don't have any
    if (!currentWeather) {
      handleRefresh();
    }
    
    // Set up interval for automatic updates
    const interval = setInterval(() => {
      handleRefresh();
    }, config.updateInterval * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [config.apiKey, config.updateInterval]);
  
  // Update daily summaries whenever weatherData changes
  useEffect(() => {
    updateDailySummaries();
  }, [weatherData]);
  
  // Update selected date whenever summaryDates changes
  useEffect(() => {
    if (summaryDates.length > 0 && !summaryDates.includes(selectedDate)) {
      setSelectedDate(summaryDates[0]);
    }
  }, [summaryDates]);

  // Display appropriate content based on whether data is available
  const renderContent = () => {
    // If no API key is set, show settings first
    if (!config.apiKey) {
      return (
        <div className="text-center py-10">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">API Key Required</h3>
          <p className="text-gray-500 mb-4">
            Please provide your OpenWeatherMap API key in the settings below to start monitoring the weather.
          </p>
          <SettingsForm />
        </div>
      );
    }
    
    // If loading for the first time with no data
    if (isLoading && !currentWeather) {
      return (
        <div className="text-center py-20">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <h3 className="text-lg font-medium">Loading weather data...</h3>
        </div>
      );
    }
    
    // If we have data to display
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="current">Current Weather</TabsTrigger>
            <TabsTrigger value="summary">Daily Summary</TabsTrigger>
            <TabsTrigger value="alerts" className="relative">
              Alerts
              {hasUnacknowledgedAlerts && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {format(new Date(lastUpdated), 'HH:mm:ss')}
              </span>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* City selector */}
        <CitySelector />
        
        {/* Content for each tab */}
        <TabsContent value="current" className="space-y-6">
          {currentWeather ? (
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
          ) : (
            <div className="text-center py-10">
              <p>No weather data available for {cityName}. Click Refresh to fetch data.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-6">
          <h2 className="text-2xl font-bold">{cityName} - Daily Summary</h2>
          
          {summaryDates.length > 0 ? (
            <>
              {/* Date selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {summaryDates.map(date => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? "default" : "outline"}
                    onClick={() => setSelectedDate(date)}
                    className="px-4 py-2"
                  >
                    {date}
                  </Button>
                ))}
              </div>
              
              {/* Summary content */}
              {currentSummary ? (
                <DailySummary summary={currentSummary} />
              ) : (
                <p>No summary data available for selected date.</p>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p>No daily summaries available yet. Weather data will be aggregated into daily summaries as more data is collected.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">{cityName} - Alert Settings</h2>
              <AlertConfig cityId={selectedCityId} cityName={cityName} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Alert History</h2>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <AlertsList />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <h2 className="text-2xl font-bold mb-4">Application Settings</h2>
          <SettingsForm />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Weather Monitoring System</h1>
        <p className="text-gray-500">
          Real-time weather data and analytics for major Indian metros
        </p>
      </header>
      
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
