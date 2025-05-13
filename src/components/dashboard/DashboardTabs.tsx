
import React from 'react';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasUnacknowledgedAlerts: boolean;
  lastUpdated: number | null;
  isLoading: boolean;
  handleRefresh: () => Promise<void>;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  setActiveTab,
  hasUnacknowledgedAlerts,
  lastUpdated,
  isLoading,
  handleRefresh
}) => {
  return (
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
  );
};

export default DashboardTabs;
