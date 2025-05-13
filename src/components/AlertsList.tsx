
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatDistance } from 'date-fns';
import { useWeatherStore } from '@/store/weatherStore';
import { Alert } from '@/types/weather';
import { AlertTriangle } from 'lucide-react';

const AlertItem: React.FC<{ alert: Alert }> = ({ alert }) => {
  const { acknowledgeAlert } = useWeatherStore();
  const timeAgo = formatDistance(new Date(alert.timestamp * 1000), new Date(), { addSuffix: true });
  
  const getAlertTypeClass = (type: string): string => {
    switch (type) {
      case 'high_temp': return 'border-red-500 bg-red-50';
      case 'low_temp': return 'border-blue-500 bg-blue-50';
      case 'weather_condition': return 'border-amber-500 bg-amber-50';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className={`border-l-4 p-3 mb-2 rounded-r ${getAlertTypeClass(alert.type)} ${alert.acknowledged ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-sm">{alert.city}</p>
            <p className="text-sm text-gray-700">{alert.message}</p>
            <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
          </div>
        </div>
        {!alert.acknowledged && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => acknowledgeAlert(alert.id)}
            className="h-7 px-2 text-xs"
          >
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
};

const AlertsList: React.FC = () => {
  const { alerts, clearAlerts } = useWeatherStore();
  
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
        <p>No alerts to display</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Alerts ({alerts.length})</h3>
        <Button variant="outline" size="sm" onClick={clearAlerts}>
          Clear All
        </Button>
      </div>
      <ScrollArea className="h-[400px] pr-4">
        {alerts.map(alert => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </ScrollArea>
    </div>
  );
};

export default AlertsList;
