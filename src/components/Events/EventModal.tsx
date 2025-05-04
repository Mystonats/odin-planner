import React, { useState, useEffect } from 'react';
import { format, addMinutes } from 'date-fns';
import { SlotInfo } from 'react-big-calendar';
import { Activity, ActivityType } from '../../types/Activity';
import { useEvents } from '../../contexts/EventContext';
import { useCharacters } from '../../contexts/CharacterContext';
import { activityTypes } from '../../data/activityTypes';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Activity | null;
  slotInfo: SlotInfo | null;
  characterId: string | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  slotInfo,
  characterId,
}) => {
  const { addEvent, addSharedEvent, updateEvent, deleteEvent } = useEvents();
  const { characters, getCharacterById } = useCharacters();
  
  // Modal state
  const [title, setTitle] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [activityType, setActivityType] = useState<ActivityType>('custom');
  const [notes, setNotes] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'none'>('none');
  
  // New states for character selection
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [isSharedEvent, setIsSharedEvent] = useState<boolean>(false);
  
  // New state for fixed vs custom time
  const [useFixedTime, setUseFixedTime] = useState<boolean>(false);
  
  // Flag to track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  
  // Initialize modal with event data or slot info
  useEffect(() => {
    setIsInitialLoad(true);
    
    if (event) {
      // Editing existing event
      setTitle(event.title);
      setStartDate(format(new Date(event.start), 'yyyy-MM-dd'));
      setStartTime(format(new Date(event.start), 'HH:mm'));
      setEndDate(format(new Date(event.end), 'yyyy-MM-dd'));
      setEndTime(format(new Date(event.end), 'HH:mm'));
      setActivityType(event.type);
      setNotes(event.notes || '');
      setIsRecurring(event.recurrence !== 'none' && !!event.recurrence);
      setRecurrenceType(event.recurrence || 'none');
      
      // For editing an event, we don't enable shared mode
      setIsSharedEvent(false);
      setSelectedCharacterIds([event.characterId || '']);
      
      // Determine if this is a fixed time activity
      const activityInfo = activityTypes.find(a => a.id === event.type);
      setUseFixedTime(event.type !== 'custom');
    } else if (slotInfo) {
      // Creating new event from selected time slot
      const start = new Date(slotInfo.start);
      const end = new Date(slotInfo.end);
      
      setTitle('');
      setStartDate(format(start, 'yyyy-MM-dd'));
      setStartTime(format(start, 'HH:mm'));
      setEndDate(format(end, 'yyyy-MM-dd'));
      setEndTime(format(end, 'HH:mm'));
      setActivityType('custom');
      setNotes('');
      setIsRecurring(false);
      setRecurrenceType('none');
      setUseFixedTime(false);
      
      // For new events, initialize with the selected character
      setIsSharedEvent(false);
      setSelectedCharacterIds(characterId ? [characterId] : []);
    } else {
      // Default values for new event without slot info
      const now = new Date();
      const defaultEnd = addMinutes(now, 60);
      
      setTitle('');
      setStartDate(format(now, 'yyyy-MM-dd'));
      setStartTime(format(now, 'HH:mm'));
      setEndDate(format(defaultEnd, 'yyyy-MM-dd'));
      setEndTime(format(defaultEnd, 'HH:mm'));
      setActivityType('custom');
      setNotes('');
      setIsRecurring(false);
      setRecurrenceType('none');
      setUseFixedTime(false);
      
      // For new events without slot info, initialize with the selected character
      setIsSharedEvent(false);
      setSelectedCharacterIds(characterId ? [characterId] : []);
    }
    
    // After setting initial values, mark initial load as complete
    setIsInitialLoad(false);
  }, [event, slotInfo, characterId]);
  
  // Get fixed time options for the selected activity type
  const getFixedTimeOptions = () => {
    const activityInfo = activityTypes.find(a => a.id === activityType);
    if (!activityInfo) return [];
    
    switch (activityType) {
      case 'dailyDungeon':
        return [
          { label: "1 Hour", value: 60 }
        ];
      case 'weeklyDungeon':
        return [
          { label: "8 Hours", value: 480 }
        ];
      default:
        return [
          { label: "30 Minutes", value: 30 },
          { label: "1 Hour", value: 60 },
          { label: "2 Hours", value: 120 }
        ];
    }
  };
  
  // Handle activity type change
  const handleActivityTypeChange = (type: ActivityType) => {
    setActivityType(type);
    
    // Set fixed/custom time based on activity type
    if (type === 'custom') {
      setUseFixedTime(false);
    } else {
      setUseFixedTime(true);
      
      // Update duration to the default for this activity type
      const activityInfo = activityTypes.find(a => a.id === type);
      if (activityInfo && startDate && startTime) {
        const start = new Date(`${startDate}T${startTime}`);
        const end = addMinutes(start, activityInfo.defaultDuration);
        
        setEndDate(format(end, 'yyyy-MM-dd'));
        setEndTime(format(end, 'HH:mm'));
      }
    }
  };
  
  // Handle fixed time selection
  const handleFixedTimeChange = (minutes: number) => {
    if (startDate && startTime) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = addMinutes(start, minutes);
      
      setEndDate(format(end, 'yyyy-MM-dd'));
      setEndTime(format(end, 'HH:mm'));
    }
  };
  
  // Handle character selection toggle
  const handleCharacterToggle = (id: string) => {
    if (selectedCharacterIds.includes(id)) {
      // Don't allow deselecting if it's the last character
      if (selectedCharacterIds.length > 1) {
        setSelectedCharacterIds(selectedCharacterIds.filter(charId => charId !== id));
      }
    } else {
      setSelectedCharacterIds([...selectedCharacterIds, id]);
    }
  };
  
  // Toggle shared event mode
  const handleSharedModeToggle = () => {
    setIsSharedEvent(!isSharedEvent);
    
    // If turning on shared mode and we have a character ID, initialize with that
    if (!isSharedEvent && characterId) {
      setSelectedCharacterIds([characterId]);
    }
  };
  
  // Save event
  const handleSave = () => {
    if (!title || !startDate || !startTime || !endDate || !endTime) {
      alert('Please fill out all required fields');
      return;
    }
    
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    if (end <= start) {
      alert('End time must be after start time');
      return;
    }
    
    // Get the activity type info to get the correct color
    const activityInfo = activityTypes.find(a => a.id === activityType);
    
    const eventData: Omit<Activity, 'id'> = {
      title,
      type: activityType,
      start,
      end,
      characterId: selectedCharacterIds[0] || null, // Use the first character by default
      isGlobal: false,
      notes,
      recurrence: isRecurring ? recurrenceType : 'none',
      // Explicitly use the activity color
      color: activityInfo?.color,
    };
    
    try {
      if (event) {
        // Update existing event - we don't support updating to shared events
        updateEvent(event.id, eventData);
      } else if (isSharedEvent && selectedCharacterIds.length > 0) {
        // Create shared events for multiple characters
        addSharedEvent(eventData, selectedCharacterIds);
      } else if (selectedCharacterIds.length > 0) {
        // Create event for a single character
        eventData.characterId = selectedCharacterIds[0];
        addEvent(eventData);
      } else {
        alert('Please select at least one character');
        return;
      }
      
      onClose();
    } catch (error) {
      alert((error as Error).message);
    }
  };
  
  // Delete event
  const handleDelete = () => {
    if (event && !event.isGlobal) {
      deleteEvent(event.id);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const character = characterId ? getCharacterById(characterId) : null;
  const isEditing = !!event;
  const modalTitle = isEditing ? 'Edit Activity' : 'Add New Activity';
  const fixedTimeOptions = getFixedTimeOptions();
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '28rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>{modalTitle}</h2>
        
        {/* Character Selection */}
        {!isEditing && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.5rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.375rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                id="shared-event-toggle"
                checked={isSharedEvent}
                onChange={handleSharedModeToggle}
                style={{ 
                  height: '1rem', 
                  width: '1rem', 
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  marginRight: '0.5rem'
                }}
              />
              <label 
                htmlFor="shared-event-toggle" 
                style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 500,
                  color: '#4b5563' 
                }}
              >
                Schedule for multiple characters
              </label>
            </div>
            
            {isSharedEvent ? (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Select characters for this activity:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {characters.map(char => (
                    <div 
                      key={char.id}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '0.5rem',
                        backgroundColor: selectedCharacterIds.includes(char.id) ? '#f3f4f6' : 'white',
                        borderLeft: `4px solid ${char.color}`,
                        borderRadius: '0.25rem'
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`char-${char.id}`}
                        checked={selectedCharacterIds.includes(char.id)}
                        onChange={() => handleCharacterToggle(char.id)}
                        style={{ 
                          height: '1rem', 
                          width: '1rem', 
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          marginRight: '0.5rem'
                        }}
                      />
                      <label 
                        htmlFor={`char-${char.id}`}
                        style={{ fontSize: '0.875rem', color: '#4b5563' }}
                      >
                        {char.name} (Lv.{char.level} {char.class})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : character ? (
              <div style={{ 
                marginTop: '0.5rem', 
                display: 'flex', 
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                borderLeft: `4px solid ${character.color}`,
                borderRadius: '0.25rem'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  {character.name} (Lv.{character.level} {character.class})
                </span>
              </div>
            ) : (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Select a character for this activity:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {characters.map(char => (
                    <div 
                      key={char.id}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '0.5rem',
                        backgroundColor: selectedCharacterIds.includes(char.id) ? '#f3f4f6' : 'white',
                        borderLeft: `4px solid ${char.color}`,
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedCharacterIds([char.id])}
                    >
                      <input
                        type="radio"
                        id={`char-radio-${char.id}`}
                        checked={selectedCharacterIds[0] === char.id}
                        onChange={() => setSelectedCharacterIds([char.id])}
                        style={{ 
                          height: '1rem', 
                          width: '1rem', 
                          border: '1px solid #d1d5db',
                          borderRadius: '50%',
                          marginRight: '0.5rem'
                        }}
                      />
                      <label 
                        htmlFor={`char-radio-${char.id}`}
                        style={{ fontSize: '0.875rem', color: '#4b5563' }}
                      >
                        {char.name} (Lv.{char.level} {char.class})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#4b5563', 
              marginBottom: '0.25rem' 
            }}>
              Activity Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem 0.75rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem',
                outline: 'none'
              }}
              required
            />
          </div>
          
          {/* Activity Type */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#4b5563', 
              marginBottom: '0.25rem' 
            }}>
              Activity Type
            </label>
            <select
              value={activityType}
              onChange={(e) => handleActivityTypeChange(e.target.value as ActivityType)}
              style={{ 
                width: '100%', 
                padding: '0.5rem 0.75rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem',
                outline: 'none'
              }}
            >
              {activityTypes
                .filter(type => !['fieldBoss', 'valhallaWar'].includes(type.id))
                .map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))
              }
            </select>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              {activityTypes.find(t => t.id === activityType)?.description}
            </p>
          </div>
          
          {/* Start Date/Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 500, 
                color: '#4b5563', 
                marginBottom: '0.25rem' 
              }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
                required
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 500, 
                color: '#4b5563', 
                marginBottom: '0.25rem' 
              }}>
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>
          
          {/* Duration Selection */}
          {activityType !== 'custom' && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 500, 
                color: '#4b5563', 
                marginBottom: '0.25rem' 
              }}>
                Duration
              </label>
              <select
                onChange={(e) => handleFixedTimeChange(parseInt(e.target.value))}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
                value={activityTypes.find(a => a.id === activityType)?.defaultDuration || 60}
              >
                {fixedTimeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* End Date/Time - Only show for custom activities */}
          {activityType === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 500, 
                  color: '#4b5563', 
                  marginBottom: '0.25rem' 
                }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem 0.75rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 500, 
                  color: '#4b5563', 
                  marginBottom: '0.25rem' 
                }}>
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem 0.75rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </div>
          )}
          
          {/* Recurrence */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                id="recurrence-toggle"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                style={{ 
                  height: '1rem', 
                  width: '1rem', 
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  marginRight: '0.5rem'
                }}
              />
              <label 
                htmlFor="recurrence-toggle" 
                style={{ 
                  fontSize: '0.875rem', 
                  color: '#4b5563' 
                }}
              >
                Repeating Activity
              </label>
            </div>
            
            {isRecurring && (
              <div style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value as 'daily' | 'weekly' | 'none')}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem 0.75rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                >
                  <option value="daily">Repeat Daily</option>
                  <option value="weekly">Repeat Weekly</option>
                </select>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#4b5563', 
              marginBottom: '0.25rem' 
            }}>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem 0.75rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem',
                outline: 'none',
                minHeight: '5rem'
              }}
              rows={3}
            />
          </div>
          
          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            paddingTop: '1rem', 
            borderTop: '1px solid #e5e7eb',
            marginTop: '0.5rem'
          }}>
            <div>
              {isEditing && !event?.isGlobal && (
                <button
                  onClick={handleDelete}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#ef4444', 
                    color: 'white', 
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  color: '#4b5563',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#344055',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;