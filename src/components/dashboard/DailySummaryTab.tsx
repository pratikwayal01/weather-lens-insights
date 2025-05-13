
import React from 'react';
import { Button } from '@/components/ui/button';
import DailySummary from '../DailySummary';
import { DailySummary as DailySummaryType } from '@/types/weather';

interface DailySummaryTabProps {
  cityName: string;
  summaryDates: string[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentSummary: DailySummaryType | undefined;
}

const DailySummaryTab: React.FC<DailySummaryTabProps> = ({
  cityName,
  summaryDates,
  selectedDate,
  setSelectedDate,
  currentSummary
}) => {
  return (
    <>
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
    </>
  );
};

export default DailySummaryTab;
