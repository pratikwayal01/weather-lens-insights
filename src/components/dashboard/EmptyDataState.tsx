
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface EmptyDataStateProps {
  cityName: string;
}

const EmptyDataState: React.FC<EmptyDataStateProps> = ({ cityName }) => {
  return (
    <div className="text-center py-10">
      <p className="mb-4">No weather data available for {cityName}. Click Refresh to fetch data.</p>
      <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 flex items-center mb-1">
          <AlertTriangle className="h-4 w-4 mr-1" /> API Key Issue?
        </h4>
        <p className="text-sm text-yellow-700 mb-2">
          If you're seeing this message after clicking Refresh, your API key may be invalid or not yet activated.
        </p>
        <ul className="list-disc pl-5 text-sm text-yellow-700">
          <li>New OpenWeatherMap API keys can take up to 2 hours to activate</li>
          <li>Verify that you've copied the correct key from your OpenWeatherMap account</li>
          <li>Check the settings tab to update your API key</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptyDataState;
