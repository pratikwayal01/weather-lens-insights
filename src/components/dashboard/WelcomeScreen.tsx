
import React from 'react';
import { Settings } from 'lucide-react';
import SettingsForm from '../SettingsForm';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="text-center py-10">
      <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium mb-2">API Key Required</h3>
      <p className="text-gray-500 mb-4">
        Please provide your OpenWeatherMap API key in the settings below to start monitoring the weather.
      </p>
      <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-yellow-800 mb-1">How to get an API key:</h4>
        <ol className="list-decimal pl-5 text-sm text-yellow-700">
          <li>Go to <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OpenWeatherMap.org</a> and create a free account</li>
          <li>After signing up, go to "API keys" section in your account</li>
          <li>Copy your API key (or create a new one)</li>
          <li>Paste it in the settings below</li>
          <li>Note: New API keys may take up to 2 hours to activate</li>
        </ol>
      </div>
      <SettingsForm />
    </div>
  );
};

export default WelcomeScreen;
