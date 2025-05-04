export type ActivityType = 'dailyDungeon' | 'weeklyDungeon' | 'fieldBoss' | 'valhallaWar' | 'custom';
export type RecurrenceType = 'daily' | 'weekly' | 'none';

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  start: Date | string;
  end: Date | string;
  characterId: string | null;
  isGlobal: boolean;
  notes?: string;
  recurrence?: RecurrenceType;
  color?: string;
}