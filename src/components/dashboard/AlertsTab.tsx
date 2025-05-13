
import React from 'react';
import AlertConfig from '../AlertConfig';
import AlertsList from '../AlertsList';

interface AlertsTabProps {
  selectedCityId: string;
  cityName: string;
}

const AlertsTab: React.FC<AlertsTabProps> = ({ selectedCityId, cityName }) => {
  return (
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
  );
};

export default AlertsTab;
