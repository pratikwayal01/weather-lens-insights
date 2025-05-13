
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { DailySummary as DailySummaryType } from '@/types/weather';
import { useWeatherStore } from '@/store/weatherStore';
import { formatTemperature } from '@/utils/weatherUtils';

interface DailySummaryProps {
  summary: DailySummaryType;
}

const DailySummary: React.FC<DailySummaryProps> = ({ summary }) => {
  const { config } = useWeatherStore();
  const { temperatureUnit } = config;
  
  // Prepare condition data for pie chart
  const conditionData = useMemo(() => {
    return Object.entries(summary.condition_count).map(([name, value]) => ({ name, value }));
  }, [summary.condition_count]);
  
  // Prepare temperature data for line chart
  const tempData = useMemo(() => {
    return summary.records.map(record => ({
      time: record.time.slice(0, 5), // Format: HH:MM
      temp: record.temp,
      feels_like: record.feels_like
    })).reverse(); // Display in chronological order
  }, [summary.records]);
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Daily Summary: {summary.city}</span>
          <span className="text-sm font-normal">{summary.date}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature overview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Temperature Overview</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Avg</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatTemperature(summary.avg_temp, temperatureUnit)}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Min</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatTemperature(summary.min_temp, temperatureUnit)}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Max</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatTemperature(summary.max_temp, temperatureUnit)}
                </p>
              </div>
            </div>
            
            {/* Dominant condition */}
            <div className="mt-4">
              <h4 className="text-sm font-medium">Dominant Condition</h4>
              <p className="text-xl font-bold">{summary.dominant_condition}</p>
              <p className="text-xs text-gray-500">
                Appeared in {summary.condition_count[summary.dominant_condition] || 0} out of {summary.records.length} readings
              </p>
            </div>
            
            {/* Additional stats */}
            <div className="mt-4 flex gap-6">
              <div>
                <h4 className="text-sm font-medium">Average Humidity</h4>
                <p className="text-xl">{summary.humidity}%</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Average Wind</h4>
                <p className="text-xl">{summary.wind_speed} m/s</p>
              </div>
            </div>
          </div>
          
          {/* Weather conditions pie chart */}
          <div>
            <h4 className="text-sm font-medium mb-2">Weather Conditions Distribution</h4>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {conditionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} readings`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Temperature chart spanning full width */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-medium mb-2">Temperature Trend</h4>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis 
                    label={{ 
                      value: temperatureUnit === 'celsius' ? '°C' : '°F', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }} 
                  />
                  <Tooltip formatter={(value) => [`${value}${temperatureUnit === 'celsius' ? '°C' : '°F'}`, '']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temp" 
                    name="Temperature" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="feels_like" 
                    name="Feels Like" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummary;
