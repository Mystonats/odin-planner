import { createContext, useContext, ReactNode, useEffect } from 'react';
import { Character } from '../types/Character';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

interface Account {
  id: string;
  name: string;
  characters: Character[];
}

interface CharacterContextType {
  accounts: Account[];
  currentAccountId: string;
  characters: Character[]; // Characters in the current account
  mainCharacter: Character | null;
  subCharacters: Character[];
  addAccount: (name: string) => void;
  deleteAccount: (id: string) => void;
  updateAccountName: (id: string, name: string) => void;
  switchAccount: (id: string) => void;
  addCharacter: (character: Omit<Character, 'id'>) => string;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  getCharacterById: (id: string) => Character | undefined;
  getAllCharacters: () => Character[]; // Get characters from all accounts
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

// Initial account data with default accounts
const initialAccounts: Account[] = [
  {
    id: uuidv4(),
    name: 'Account 1',
    characters: [
      {
        id: uuidv4(),
        name: 'Main Character',
        type: 'main',
        level: 1,
        class: 'Dark Wizard',
        color: '#4c9be8',
        enabled: true,
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Account 2',
    characters: [
      {
        id: uuidv4(),
        name: 'Main Character 2',
        type: 'main',
        level: 1,
        class: 'Berserker',
        color: '#e74c3c',
        enabled: true,
      },
    ],
  },
];

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useLocalStorage<Account[]>('odin-accounts', initialAccounts);
  const [currentAccountId, setCurrentAccountId] = useLocalStorage<string>('odin-current-account', accounts[0].id);
  
  // Get the current account
  const currentAccount = accounts.find(account => account.id === currentAccountId) || accounts[0];
  
  // Current account's characters
  const characters = currentAccount.characters;
  
  // Computed properties for current account
  const mainCharacter = characters.find(char => char.type === 'main') || null;
  const subCharacters = characters.filter(char => char.type === 'sub');

  // Effect to ensure current account exists (in case it was deleted)
  useEffect(() => {
    if (!accounts.some(account => account.id === currentAccountId)) {
      setCurrentAccountId(accounts[0]?.id || '');
    }
  }, [accounts, currentAccountId, setCurrentAccountId]);

  // Account management
  const addAccount = (name: string) => {
    const newAccount: Account = {
      id: uuidv4(),
      name,
      characters: [
        {
          id: uuidv4(),
          name: 'Main Character',
          type: 'main',
          level: 1,
          class: 'Dark Wizard',
          color: '#4c9be8',
          enabled: true,
        }
      ]
    };
    setAccounts([...accounts, newAccount]);
  };

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) {
      throw new Error('Cannot delete the only account');
    }
    
    setAccounts(accounts.filter(account => account.id !== id));
    
    // Switch to first account if the current account is being deleted
    if (currentAccountId === id) {
      setCurrentAccountId(accounts.find(account => account.id !== id)?.id || '');
    }
  };

  const updateAccountName = (id: string, name: string) => {
    setAccounts(
      accounts.map(account => 
        account.id === id ? { ...account, name } : account
      )
    );
  };

  const switchAccount = (id: string) => {
    if (accounts.some(account => account.id === id)) {
      setCurrentAccountId(id);
    }
  };

  // Add a new character to current account
  const addCharacter = (character: Omit<Character, 'id'>) => {
    const id = uuidv4();
    
    // If adding a main character, ensure only one exists in this account
    if (character.type === 'main' && mainCharacter) {
      throw new Error('A main character already exists in this account');
    }
    
    // Limit to 4 sub characters per account
    if (character.type === 'sub' && subCharacters.length >= 4) {
      throw new Error('Maximum of 4 sub-characters allowed per account');
    }
    
    const updatedAccounts = accounts.map(account => {
      if (account.id === currentAccountId) {
        return {
          ...account,
          characters: [...account.characters, { ...character, id }]
        };
      }
      return account;
    });
    
    setAccounts(updatedAccounts);
    return id;
  };

  // Update an existing character in current account
  const updateCharacter = (id: string, updates: Partial<Character>) => {
    // Prevent changing a character type from main to sub if it's the only main
    if (
      updates.type === 'sub' && 
      characters.find(c => c.id === id)?.type === 'main' && 
      characters.filter(c => c.type === 'main').length <= 1
    ) {
      throw new Error('At least one main character is required per account');
    }
    
    const updatedAccounts = accounts.map(account => {
      if (account.id === currentAccountId) {
        return {
          ...account,
          characters: account.characters.map(char => 
            char.id === id ? { ...char, ...updates } : char
          )
        };
      }
      return account;
    });
    
    setAccounts(updatedAccounts);
  };

  // Delete a character from current account
  const deleteCharacter = (id: string) => {
    // Prevent deleting the only main character
    if (
      characters.find(c => c.id === id)?.type === 'main' && 
      characters.filter(c => c.type === 'main').length <= 1
    ) {
      throw new Error('At least one main character is required per account');
    }
    
    const updatedAccounts = accounts.map(account => {
      if (account.id === currentAccountId) {
        return {
          ...account,
          characters: account.characters.filter(char => char.id !== id)
        };
      }
      return account;
    });
    
    setAccounts(updatedAccounts);
  };

  // Get a character by ID from the current account
  const getCharacterById = (id: string) => {
    return characters.find(char => char.id === id);
  };
  
  // Get all characters from all accounts
  const getAllCharacters = () => {
    return accounts.flatMap(account => account.characters);
  };

  return (
    <CharacterContext.Provider
      value={{
        accounts,
        currentAccountId,
        characters,
        mainCharacter,
        subCharacters,
        addAccount,
        deleteAccount,
        updateAccountName,
        switchAccount,
        addCharacter,
        updateCharacter,
        deleteCharacter,
        getCharacterById,
        getAllCharacters,
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