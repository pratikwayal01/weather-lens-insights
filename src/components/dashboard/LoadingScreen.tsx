
import React from 'react';
import { RefreshCw } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="text-center py-20">
      <RefreshCw className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
      <h3 className="text-lg font-medium">Loading weather data...</h3>
    </div>
  );
};

export default LoadingScreen;
