import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Timer } from 'lucide-react';

interface TimeDisplayProps {
  timeTaken: number; // in minutes
}

const formatTimeTaken = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeTaken }) => {
  if (timeTaken <= 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
          <Clock className="h-6 w-6 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Transit Time</p>
            <p className="font-bold text-2xl text-indigo-800">{formatTimeTaken(timeTaken)}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-indigo-600">
              <Timer className="h-4 w-4" />
              <span>From loading charge creation to offloading</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeDisplay;