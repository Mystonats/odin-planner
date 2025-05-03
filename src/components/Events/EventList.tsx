import React from 'react';
import { format, isSameDay } from 'date-fns';
import { useEvents } from '../../contexts/EventContext';
import { useCharacters } from '../../contexts/CharacterContext';
import { Activity } from '../../types/Activity';

interface EventListProps {
  selectedCharacterId: string | null;
  onSelectEvent: (event: Activity) => void;
}

const EventList: React.FC<EventListProps> = ({ selectedCharacterId, onSelectEvent }) => {
  // Use processedEvents instead of events
  const { processedEvents, getEventById } = useEvents();
  const { getCharacterById } = useCharacters();
  
  // Get today's events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter events for today that are either global or for the selected character
  const todaysEvents = processedEvents.filter(event => {
    const eventDate = new Date(event.start);
    
    const isToday = isSameDay(eventDate, today);
    
    // Only show relevant events
    if (selectedCharacterId === null) {
      return isToday && event.isGlobal;
    }
    
    return isToday && (event.isGlobal || event.characterId === selectedCharacterId);
  });
  
  // Sort events by start time
  const sortedEvents = [...todaysEvents].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
  
  if (sortedEvents.length === 0) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
        padding: '16px' 
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Today's Schedule</h3>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No events scheduled for today</p>
      </div>
    );
  }
  
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
      padding: '16px' 
    }}>
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: 600, 
        marginBottom: '0.75rem', 
        borderBottom: '1px solid #e5e7eb', 
        paddingBottom: '0.5rem' 
      }}>Today's Schedule</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sortedEvents.map(event => {
          const start = new Date(event.start);
          const end = new Date(event.end);
          
          // Determine event color
          let color = event.color || '#4c9be8';
          if (event.characterId) {
            const character = getCharacterById(event.characterId);
            if (character) {
              color = character.color;
            }
          }
          
          // Get original event ID (without date suffix for recurring events)
          const originalId = event.id.includes('_daily_') || event.id.includes('_weekly_')
            ? event.id.split('_')[0]
            : event.id;
          
          return (
            <div
              key={event.id}
              style={{ 
                padding: '0.75rem', 
                borderLeft: `4px solid ${color}`, 
                backgroundColor: '#f9fafb', 
                borderTopRightRadius: '0.375rem', 
                borderBottomRightRadius: '0.375rem', 
                cursor: 'pointer' 
              }}
              onClick={() => {
                // Get the original event (not the recurring instance)
                const originalEvent = getEventById(originalId);
                if (originalEvent) {
                  onSelectEvent(originalEvent);
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ fontWeight: 500 }}>{event.title}</h4>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                </span>
              </div>
              
              {event.characterId && (
                <div style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.25rem' }}>
                  Character: {getCharacterById(event.characterId)?.name || 'Unknown'}
                </div>
              )}
              
              {event.isGlobal && (
                <div style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.25rem', fontWeight: 600 }}>
                  Server Event
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventList;