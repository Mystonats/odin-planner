import { Activity } from '../types/Activity';

// Current date for initializing events
const today = new Date();
today.setHours(0, 0, 0, 0);

// Helper function to create a date at a specific hour and minute
const createDateTime = (hour: number, minute: number, durationMinutes: number): { start: Date, end: Date } => {
  const start = new Date(today);
  start.setHours(hour, minute, 0, 0);
  
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);
  
  return { start, end };
};

// Define fixed global events
export const globalEvents: Activity[] = [
  // Field Boss events
  {
    id: 'field-boss-afternoon',
    title: 'Field Boss',
    type: 'fieldBoss',
    ...createDateTime(14, 0, 60), // 2PM to 3PM
    characterId: null,
    isGlobal: true,
    recurrence: 'daily',
    color: '#9c3939', // accent color
  },
  {
    id: 'field-boss-night',
    title: 'Field Boss',
    type: 'fieldBoss',
    ...createDateTime(22, 0, 60), // 10PM to 11PM
    characterId: null,
    isGlobal: true,
    recurrence: 'daily',
    color: '#9c3939', // accent color
  },
  
  // Valhalla War events
  {
    id: 'valhalla-war-afternoon',
    title: 'Valhalla War',
    type: 'valhallaWar',
    ...createDateTime(15, 0, 15), // 3PM to 3:15PM
    characterId: null,
    isGlobal: true,
    recurrence: 'daily',
    color: '#dca54c', // secondary color
  },
  {
    id: 'valhalla-war-evening',
    title: 'Valhalla War',
    type: 'valhallaWar',
    ...createDateTime(20, 0, 15), // 8PM to 8:15PM
    characterId: null,
    isGlobal: true,
    recurrence: 'daily',
    color: '#dca54c', // secondary color
  },
  {
    id: 'valhalla-war-night',
    title: 'Valhalla War',
    type: 'valhallaWar',
    ...createDateTime(23, 0, 15), // 11PM to 11:15PM
    characterId: null,
    isGlobal: true,
    recurrence: 'daily',
    color: '#dca54c', // secondary color
  },
];