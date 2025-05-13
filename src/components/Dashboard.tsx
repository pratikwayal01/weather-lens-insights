
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useWeatherStore } from '@/store/weatherStore';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { fetchAllCitiesWeather } from '@/services/weatherService';

// Imported components
import CitySelector from './CitySelector';
import SettingsForm from './SettingsForm';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardTabs from './dashboard/DashboardTabs';
import WelcomeScreen from './dashboard/WelcomeScreen';
import LoadingScreen from './dashboard/LoadingScreen';
import CurrentWeatherTab from './dashboard/CurrentWeatherTab';
import DailySummaryTab from './dashboard/DailySummaryTab';
import AlertsTab from './dashboard/AlertsTab';

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
        description: "Please provide an OpenWeatherMap API key in the settings. You need to create a free account at OpenWeatherMap.org to get an API key.",
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
      
      if (Object.keys(newWeatherData).length === 0) {
        toast({
          title: "API Key Issue",
          description: "No data was returned. Your API key may be invalid or not activated. Please check your OpenWeatherMap account.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Data updated",
          description: "Weather data has been refreshed successfully."
        });
      }
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
      return <WelcomeScreen />;
    }
    
    // If loading for the first time with no data
    if (isLoading && !currentWeather) {
      return <LoadingScreen />;
    }
    
    // If we have data to display
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <DashboardTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasUnacknowledgedAlerts={hasUnacknowledgedAlerts}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
          handleRefresh={handleRefresh}
        />
        
        {/* City selector */}
        <CitySelector />
        
        {/* Content for each tab */}
        <TabsContent value="current" className="space-y-6">
          <CurrentWeatherTab 
            currentWeather={currentWeather}
            cityWeatherData={cityWeatherData}
            cityName={cityName}
          />
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-6">
          <DailySummaryTab 
            cityName={cityName}
            summaryDates={summaryDates}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            currentSummary={currentSummary}
          />
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <AlertsTab 
            selectedCityId={selectedCityId}
            cityName={cityName}
          />
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
      <DashboardHeader />
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
