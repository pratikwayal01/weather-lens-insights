
import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold mb-1">Weather Monitoring System</h1>
      <p className="text-gray-500">
        Real-time weather data and analytics for major Indian metros
      </p>
    </header>
  );
};

export default DashboardHeader;
