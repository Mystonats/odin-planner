import React, { createContext, useContext, ReactNode } from 'react';
import { Character } from '../types/Character';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

interface CharacterContextType {
  characters: Character[];
  mainCharacter: Character | null;
  subCharacters: Character[];
  addCharacter: (character: Omit<Character, 'id'>) => string;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  getCharacterById: (id: string) => Character | undefined;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

// Initial character data with a main character
const initialCharacters: Character[] = [
  {
    id: uuidv4(),
    name: 'Main Character',
    type: 'main',
    level: 1,
    class: 'Dark Wizard',
    color: '#4c9be8',
    enabled: true,
  },
];

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [characters, setCharacters] = useLocalStorage<Character[]>('odin-characters', initialCharacters);
  
  // Computed properties
  const mainCharacter = characters.find(char => char.type === 'main') || null;
  const subCharacters = characters.filter(char => char.type === 'sub');

  // Add a new character
  const addCharacter = (character: Omit<Character, 'id'>) => {
    const id = uuidv4();
    
    // If adding a main character, ensure only one exists
    if (character.type === 'main' && mainCharacter) {
      throw new Error('A main character already exists');
    }
    
    // Limit to 2 sub characters
    if (character.type === 'sub' && subCharacters.length >= 2) {
      throw new Error('Maximum of 2 sub-characters allowed');
    }
    
    setCharacters([...characters, { ...character, id }]);
    return id;
  };

  // Update an existing character
  const updateCharacter = (id: string, updates: Partial<Character>) => {
    // Prevent changing a character type from main to sub if it's the only main
    if (
      updates.type === 'sub' && 
      characters.find(c => c.id === id)?.type === 'main' && 
      characters.filter(c => c.type === 'main').length <= 1
    ) {
      throw new Error('At least one main character is required');
    }
    
    setCharacters(
      characters.map(char => 
        char.id === id ? { ...char, ...updates } : char
      )
    );
  };

  // Delete a character
  const deleteCharacter = (id: string) => {
    // Prevent deleting the only main character
    if (
      characters.find(c => c.id === id)?.type === 'main' && 
      characters.filter(c => c.type === 'main').length <= 1
    ) {
      throw new Error('At least one main character is required');
    }
    
    setCharacters(characters.filter(char => char.id !== id));
  };

  // Get a character by ID
  const getCharacterById = (id: string) => {
    return characters.find(char => char.id === id);
  };

  return (
    <CharacterContext.Provider
      value={{
        characters,
        mainCharacter,
        subCharacters,
        addCharacter,
        updateCharacter,
        deleteCharacter,
        getCharacterById,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacters() {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacters must be used within a CharacterProvider');
  }
  return context;
}