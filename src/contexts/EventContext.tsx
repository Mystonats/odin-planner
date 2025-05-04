import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Activity } from '../types/Activity';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { globalEvents } from '../data/globalEvents';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isSameDay, addWeeks, isBefore } from 'date-fns';
import { activityTypes } from '../data/activityTypes';
import { useCharacters } from './CharacterContext';

interface EventContextType {
  events: Activity[];
  processedEvents: Activity[]; // New property for expanded recurring events
  addEvent: (event: Omit<Activity, 'id'>) => string;
  addSharedEvent: (event: Omit<Activity, 'id'>, characterIds: string[]) => void;
  updateEvent: (id: string, updates: Partial<Activity>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => Activity | undefined;
  resetGlobalEvents: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Initialize with global events
const initialEvents: Activity[] = [...globalEvents];

// Number of days to generate recurring events for (before and after today)
const RECURRENCE_DAYS = 60;

export function EventProvider({ children }: { children: ReactNode }) {
  const { currentAccountId, getCharacterById, getAllCharacters } = useCharacters();
  const [events, setEvents] = useLocalStorage<Activity[]>('odin-events', initialEvents);

  // Process recurring events to expand them into specific dates
  const processedEvents = useMemo(() => {
    // Today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start date (60 days before today)
    const startDate = addDays(today, -RECURRENCE_DAYS / 2);
    
    // End date (60 days after today)
    const endDate = addDays(today, RECURRENCE_DAYS / 2);
    
    // All events that will be displayed on the calendar
    const result: Activity[] = [];
    
    // Process each event
    events.forEach(event => {
      // Always include the original event
      // Ensure the event has its activity type color if no color is specified
      const eventWithColor = {...event};
      
      if (!eventWithColor.color) {
        // Set color based on activity type
        const activityInfo = activityTypes.find(a => a.id === event.type);
        if (activityInfo) {
          eventWithColor.color = activityInfo.color;
        }
      }
      
      result.push(eventWithColor);
      
      // Skip if event doesn't have recurrence or is set to 'none'
      if (!event.recurrence || event.recurrence === 'none') {
        return;
      }
      
      // Get the start and end dates/times from the original event
      const originalStart = new Date(event.start);
      const originalEnd = new Date(event.end);
      
      // Duration in milliseconds between start and end
      const duration = originalEnd.getTime() - originalStart.getTime();
      
      // Hours, minutes, seconds from the original event
      const hours = originalStart.getHours();
      const minutes = originalStart.getMinutes();
      const seconds = originalStart.getSeconds();
      
      // For daily recurrence
      if (event.recurrence === 'daily') {
        // First day to display (either the day after the original event or the start date, whichever is later)
        let currentDay = new Date(Math.max(addDays(originalStart, 1).getTime(), startDate.getTime()));
        
        // Generate recurring events for each day in the range
        while (isBefore(currentDay, endDate)) {
          // Create a new Date object for this occurrence
          const recurrenceStart = new Date(currentDay);
          recurrenceStart.setHours(hours, minutes, seconds, 0);
          
          const recurrenceEnd = new Date(recurrenceStart.getTime() + duration);
          
          // Create a recurring instance of the event with the same color
          result.push({
            ...event,
            id: `${event.id}_daily_${recurrenceStart.toISOString()}`,
            start: recurrenceStart,
            end: recurrenceEnd,
            // Ensure the color is preserved in the recurring instance
            color: eventWithColor.color
          });
          
          // Move to the next day
          currentDay = addDays(currentDay, 1);
        }
      }
      // For weekly recurrence
      else if (event.recurrence === 'weekly') {
        // First week to display
        let currentDay = new Date(originalStart);
        const dayOfWeek = currentDay.getDay(); // Get day of week (0-6)
        
        // Move to the first occurrence that's within or after the start date
        while (isBefore(currentDay, startDate)) {
          currentDay = addWeeks(currentDay, 1);
        }
        
        // Generate recurring events for each week in the range
        while (isBefore(currentDay, endDate)) {
          // Skip the original date
          if (!isSameDay(currentDay, originalStart)) {
            // Create a new Date object for this occurrence
            const recurrenceStart = new Date(currentDay);
            recurrenceStart.setHours(hours, minutes, seconds, 0);
            
            const recurrenceEnd = new Date(recurrenceStart.getTime() + duration);
            
            // Create a recurring instance of the event with the same color
            result.push({
              ...event,
              id: `${event.id}_weekly_${recurrenceStart.toISOString()}`,
              start: recurrenceStart,
              end: recurrenceEnd,
              // Ensure the color is preserved in the recurring instance
              color: eventWithColor.color
            });
          }
          
          // Move to the next week
          currentDay = addWeeks(currentDay, 1);
        }
      }
    });
    
    return result;
  }, [events]);

  // Add a new event
  const addEvent = (event: Omit<Activity, 'id'>) => {
    // Ensure the event has a color based on its activity type if no color is specified
    const completeEvent = {...event};
    if (!completeEvent.color) {
      const activityInfo = activityTypes.find(a => a.id === event.type);
      if (activityInfo) {
        completeEvent.color = activityInfo.color;
      }
    }
    
    const id = uuidv4();
    setEvents([...events, { ...completeEvent, id }]);
    return id;
  };
  
  // Add a shared event to multiple characters
  const addSharedEvent = (eventBase: Omit<Activity, 'id'>, characterIds: string[]) => {
    // Skip if no characters selected
    if (characterIds.length === 0) return;
    
    // Get activity type info for color
    const activityInfo = activityTypes.find(a => a.id === eventBase.type);
    
    // Create events for each selected character
    const newEvents = characterIds.map(characterId => {
      return {
        ...eventBase,
        id: uuidv4(),
        characterId,
        color: eventBase.color || activityInfo?.color,
      } as Activity;
    });
    
    setEvents([...events, ...newEvents]);
  };

  // Update an existing event
  const updateEvent = (id: string, updates: Partial<Activity>) => {
    // Ensure color is set for the update if activity type is changing
    const updatesWithColor = {...updates};
    if (updates.type && !updates.color) {
      const activityInfo = activityTypes.find(a => a.id === updates.type);
      if (activityInfo) {
        updatesWithColor.color = activityInfo.color;
      }
    }
    
    setEvents(
      events.map(event => 
        event.id === id ? { ...event, ...updatesWithColor } : event
      )
    );
  };

  // Delete an event
  const deleteEvent = (id: string) => {
    // Don't allow deleting global events
    const eventToDelete = events.find(e => e.id === id);
    if (eventToDelete?.isGlobal) {
      throw new Error('Cannot delete global events');
    }
    
    setEvents(events.filter(event => event.id !== id));
  };

  // Get an event by ID
  const getEventById = (id: string) => {
    // Strip the recurrence suffix if present
    const baseId = id.includes('_daily_') || id.includes('_weekly_')
      ? id.split('_')[0]
      : id;
      
    return events.find(event => event.id === baseId);
  };

  // Reset global events (useful if schedule changes)
  const resetGlobalEvents = () => {
    // Remove all existing global events
    const userEvents = events.filter(event => !event.isGlobal);
    
    // Add back the default global events
    setEvents([...userEvents, ...globalEvents]);
  };

  return (
    <EventContext.Provider
      value={{
        events,
        processedEvents,
        addEvent,
        addSharedEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        resetGlobalEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}