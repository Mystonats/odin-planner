import React from 'react';
import { format } from 'date-fns';

interface CustomDayHeaderProps {
  date: Date;
  label: string;
  drilldownView?: string;
  isOffRange?: boolean;
  onDrillDown?: () => void;
}

const CustomDayHeader: React.FC<CustomDayHeaderProps> = ({
  date,
  label,
  isOffRange,
  drilldownView,
  onDrillDown
}) => {
  // Check if it's today's date
  const isToday = new Date().toDateString() === date.toDateString();
  
  // Format the day number
  const dayNumber = format(date, 'd');
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '8px 4px',
        cursor: drilldownView ? 'pointer' : 'default',
        opacity: isOffRange ? 0.5 : 1,
      }}
      onClick={onDrillDown}
    >
      {/* Day name (Mon, Tue, etc.) */}
      <span
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#86868b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
        }}
      >
        {label}
      </span>
      
      {/* Day number with circle for today */}
      <div
        style={{
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: isToday ? '#0071e3' : 'transparent',
          color: isToday ? '#ffffff' : '#1d1d1f',
          fontWeight: isToday ? 600 : 400,
          fontSize: '15px',
        }}
      >
        {dayNumber}
      </div>
    </div>
  );
};

export default CustomDayHeader;