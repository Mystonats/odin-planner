import { ActivityType } from '../types/Activity';

export interface ActivityTypeInfo {
  id: ActivityType;
  name: string;
  defaultDuration: number; // in minutes
  color: string;
  description: string;
}

export const activityTypes: ActivityTypeInfo[] = [
  {
    id: 'dailyDungeon',
    name: 'Daily Dungeon',
    defaultDuration: 60, // 1 hour
    color: '#4c9be8',
    description: 'Complete daily dungeon for rewards (limit: 2 per character)'
  },
  {
    id: 'weeklyDungeon',
    name: 'Weekly Dungeon',
    defaultDuration: 480, // 8 hours
    color: '#9b59b6',
    description: 'Complete weekly dungeon for significant rewards'
  },
  {
    id: 'fieldBoss',
    name: 'Field Boss',
    defaultDuration: 60, // 1 hour
    color: '#9c3939', // accent color
    description: 'Challenge powerful world bosses for valuable loot'
  },
  {
    id: 'valhallaWar',
    name: 'Valhalla War',
    defaultDuration: 15, // 15 minutes
    color: '#dca54c', // secondary color
    description: 'Participate in the faction-based Valhalla War event'
  },
  {
    id: 'custom',
    name: 'Custom Activity',
    defaultDuration: 60,
    color: '#7cb342',
    description: 'Custom planned activity'
  }
];