export type CharacterType = 'main' | 'sub';

export interface Character {
  id: string;
  name: string;
  type: CharacterType;
  level: number;
  class: string;
  color: string; // For display in calendar
  enabled: boolean;
}