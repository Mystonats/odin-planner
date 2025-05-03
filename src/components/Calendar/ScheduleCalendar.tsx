import React, { useState, useMemo } from 'react';
import { Calendar, Views, SlotInfo } from 'react-big-calendar';
import { format, isAfter, differenceInDays, addDays, isSameDay, startOfDay, endOfDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '../../contexts/EventContext';
import { useCharacters } from '../../contexts/CharacterContext';
import { Activity } from '../../types/Activity';
import { localizer } from '../../utils/calendarLocalizer';
import EventModal from '../Events/EventModal';
import { activityTypes } from '../../data/activityTypes';

interface ScheduleCalendarProps {
  selectedCharacterId: string | null;
}

interface CalendarEvent extends Omit<Activity, 'type' | 'characterId' | 'isGlobal' | 'recurrence'> {
  resource?: {
    type: Activity['type'];
    characterId: string | null;
    isGlobal: boolean;
    color: string;
    originalId: string; // Track the original event ID for recurring events
  };
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ selectedCharacterId }) => {
  // Use processedEvents instead of events
  const { processedEvents, getEventById } = useEvents();
  const { getCharacterById } = useCharacters();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<string>(Views.WEEK);
  
  // Event creation modal state
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Activity | null>(null);
  
  // Filter events based on selected character
  const filteredEvents = useMemo(() => {
    return processedEvents.filter(event => {
      // If viewing global events, only show global events
      if (selectedCharacterId === null) {
        return event.isGlobal;
      }
      
      // If viewing character events, show global events + character events
      return event.isGlobal || event.characterId === selectedCharacterId;
    });
  }, [processedEvents, selectedCharacterId]);
  
  // Format events for the calendar
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    filteredEvents.forEach(event => {
      // Parse dates from string if needed (for loaded events from localStorage)
      const start = typeof event.start === 'string' ? new Date(event.start) : new Date(event.start);
      const end = typeof event.end === 'string' ? new Date(event.end) : new Date(event.end);
      
      // Get original ID (for recurring events)
      const originalId = event.id.includes('_daily_') || event.id.includes('_weekly_')
        ? event.id.split('_')[0]
        : event.id;
      
      // Determine color based on activity type and character
      let color;
      
      if (event.isGlobal) {
        // For global events, use the color from activityTypes
        const activityInfo = activityTypes.find(a => a.id === event.type);
        color = activityInfo?.color || '#4c9be8';
      } else if (event.color) {
        // If the event already has a color specified, use that
        color = event.color;
      } else {
        // For character events, use the activity type color
        const activityInfo = activityTypes.find(a => a.id === event.type);
        color = activityInfo?.color || '#4c9be8';
      }
      
      // Get the day portions of the start and end dates
      const startDay = startOfDay(start);
      const endDay = startOfDay(end);
      
      // Calculate day difference differently to handle overnight events correctly
      const daysDifference = differenceInDays(endDay, startDay);
      
      // Handle overnight and multi-day events
      if (!isSameDay(start, end)) {
        // If the event spans multiple days or is overnight
        
        // First day (from start time to midnight)
        const firstDayEnd = endOfDay(start);
        
        events.push({
          id: `${event.id}_day_0`,
          title: event.title,
          start,
          end: firstDayEnd,
          notes: event.notes,
          resource: {
            type: event.type,
            characterId: event.characterId,
            isGlobal: event.isGlobal,
            color,
            originalId
          }
        });
        
        // Middle days (if event spans more than 2 days)
        for (let i = 1; i < daysDifference; i++) {
          const dayStart = startOfDay(addDays(start, i));
          const dayEnd = endOfDay(addDays(start, i));
          
          events.push({
            id: `${event.id}_day_${i}`,
            title: event.title,
            start: dayStart,
            end: dayEnd,
            notes: event.notes,
            resource: {
              type: event.type,
              characterId: event.characterId,
              isGlobal: event.isGlobal,
              color,
              originalId
            }
          });
        }
        
        // Last day (from midnight to end time)
        // Only add if there's actually time left on the last day
        if (end.getHours() > 0 || end.getMinutes() > 0) {
          const lastDayStart = startOfDay(end);
          
          events.push({
            id: `${event.id}_day_${daysDifference}`,
            title: event.title,
            start: lastDayStart,
            end,
            notes: event.notes,
            resource: {
              type: event.type,
              characterId: event.characterId,
              isGlobal: event.isGlobal,
              color,
              originalId
            }
          });
        }
      } else {
        // Single-day event
        events.push({
          id: event.id,
          title: event.title,
          start,
          end,
          notes: event.notes,
          resource: {
            type: event.type,
            characterId: event.characterId,
            isGlobal: event.isGlobal,
            color,
            originalId
          }
        });
      }
    });
    
    return events;
  }, [filteredEvents]);
  
  // Handle calendar slot selection (for creating new events)
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    // Only allow creating events for characters, not global
    if (selectedCharacterId !== null) {
      setSelectedSlot(slotInfo);
      setShowEventModal(true);
    }
  };
  
  // Handle event selection (for editing/viewing events)
  const handleSelectEvent = (event: CalendarEvent) => {
    // Get original event (not the recurring instance)
    let originalId = event.id;
    
    // Extract original ID from day-split or recurring events
    if (event.resource?.originalId) {
      originalId = event.resource.originalId;
    } else if (event.id.includes('_day_')) {
      originalId = event.id.split('_day_')[0];
    } else if (event.id.includes('_daily_')) {
      originalId = event.id.split('_daily_')[0];
    } else if (event.id.includes('_weekly_')) {
      originalId = event.id.split('_weekly_')[0];
    }
    
    const originalEvent = getEventById(originalId);
    
    if (originalEvent) {
      setSelectedEvent(originalEvent);
      setShowEventModal(true);
    }
  };
  
  // Custom event styles
  const eventStyleGetter = (event: CalendarEvent) => {
    const isGlobal = event.resource?.isGlobal;
    const color = event.resource?.color || '#4c9be8';
    
    return {
      style: {
        backgroundColor: color,
        borderRadius: '4px',
        opacity: 0.9,
        color: '#fff',
        border: '0px',
        display: 'block',
        fontWeight: isGlobal ? 'bold' : 'normal',
      }
    };
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };
  
  // Custom toolbar for mobile responsiveness
  const CustomToolbar = (toolbar: any) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
      setSelectedDate(new Date());
    };
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem' 
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          marginBottom: '0.5rem' 
        }}>
          <button
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#344055',
              color: 'white',
              borderRadius: '0.25rem',
              border: 'none'
            }}
            onClick={() => toolbar.onNavigate('PREV')}
          >
            &lt;
          </button>
          <button
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#344055',
              color: 'white',
              borderRadius: '0.25rem',
              border: 'none'
            }}
            onClick={goToToday}
          >
            Today
          </button>
          <button
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#344055',
              color: 'white',
              borderRadius: '0.25rem',
              border: 'none'
            }}
            onClick={() => toolbar.onNavigate('NEXT')}
          >
            &gt;
          </button>
        </div>
        
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          {format(toolbar.date, 'MMMM yyyy')}
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginTop: '0.5rem' 
        }}>
          <button
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: view === 'day' ? '#dca54c' : '#e5e7eb',
              color: view === 'day' ? 'white' : 'black',
              borderRadius: '0.25rem',
              border: 'none'
            }}
            onClick={() => setView(Views.DAY)}
          >
            Day
          </button>
          <button
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: view === 'week' ? '#dca54c' : '#e5e7eb',
              color: view === 'week' ? 'white' : 'black',
              borderRadius: '0.25rem',
              border: 'none'
            }}
            onClick={() => setView(Views.WEEK)}
          >
            Week
          </button>
          <button
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: view === 'month' ? '#dca54c' : '#e5e7eb',
              color: view === 'month' ? 'white' : 'black',
              borderRadius: '0.25rem',
              border: 'none'
            }}
            onClick={() => setView(Views.MONTH)}
          >
            Month
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div style={{ height: '100%', backgroundColor: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 220px)' }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        view={view}
        onView={(newView) => setView(newView)}
        date={selectedDate}
        onNavigate={(date) => setSelectedDate(date)}
        selectable={selectedCharacterId !== null}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar,
        }}
        popup
        step={15}
        timeslots={4}
      />
      
      {/* Event creation/editing modal */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={handleCloseModal}
          event={selectedEvent}
          slotInfo={selectedSlot}
          characterId={selectedCharacterId}
        />
      )}
    </div>
  );
};

export default ScheduleCalendar;