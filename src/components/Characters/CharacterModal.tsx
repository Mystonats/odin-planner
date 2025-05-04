import React, { useState, useEffect } from 'react';
import { Character, CharacterType } from '../../types/Character';
import { useCharacters } from '../../contexts/CharacterContext';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  character?: Character;
}

const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  character,
}) => {
  const { addCharacter, updateCharacter } = useCharacters();
  
  // Form state
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<CharacterType>('sub'); // Default to sub
  const [level, setLevel] = useState<number>(1);
  const [characterClass, setCharacterClass] = useState<string>('Warrior');
  const [color, setColor] = useState<string>('#4c9be8'); // Default blue
  
  // Available character classes
  const characterClasses = [
    'Dark Wizard', 'Archmage', 'Priest', 'Paladin', 'Assassin', 'Sniper', 'Defender', 'Berserker'
  ];
  
  // Color options
  const colorOptions = [
    { name: 'Blue', value: '#4c9be8' },
    { name: 'Red', value: '#e74c3c' },
    { name: 'Green', value: '#2ecc71' },
    { name: 'Purple', value: '#9b59b6' },
    { name: 'Orange', value: '#e67e22' },
    { name: 'Teal', value: '#1abc9c' },
  ];
  
  // Initialize form with character data if editing
  useEffect(() => {
    if (character) {
      setName(character.name);
      setType(character.type);
      setLevel(character.level);
      setCharacterClass(character.class);
      setColor(character.color);
    } else {
      // Reset form for new character
      setName('');
      setType('sub');
      setLevel(1);
      setCharacterClass('Warrior');
      setColor('#4c9be8');
    }
  }, [character]);
  
  // Save character
  const handleSave = () => {
    if (!name || !characterClass) {
      alert('Please fill out all required fields');
      return;
    }
    
    const characterData = {
      name,
      type,
      level,
      class: characterClass,
      color,
      enabled: true,
    };
    
    try {
      if (character) {
        // Update existing character
        updateCharacter(character.id, characterData);
      } else {
        // Create new character
        addCharacter(characterData);
      }
      
      onClose();
    } catch (error) {
      alert((error as Error).message);
    }
  };
  
  if (!isOpen) return null;
  
  const modalTitle = character ? 'Edit Character' : 'Add New Character';
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">{modalTitle}</h2>
        
        <div className="space-y-4">
          {/* Character Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Character Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary"
              required
            />
          </div>
          
          {/* Character Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Character Type
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="main"
                  checked={type === 'main'}
                  onChange={() => setType('main')}
                  className="h-4 w-4 focus:ring-secondary border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Main Character</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="sub"
                  checked={type === 'sub'}
                  onChange={() => setType('sub')}
                  className="h-4 w-4 focus:ring-secondary border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Sub Character</span>
              </label>
            </div>
          </div>
          
          {/* Character Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
          
          {/* Character Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={characterClass}
              onChange={(e) => setCharacterClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              {characterClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color (for calendar events)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map(colorOption => (
                <label
                  key={colorOption.value}
                  className={`flex items-center p-2 border rounded-md cursor-pointer ${
                    color === colorOption.value 
                      ? 'border-secondary bg-gray-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    value={colorOption.value}
                    checked={color === colorOption.value}
                    onChange={() => setColor(colorOption.value)}
                    className="sr-only"
                  />
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: colorOption.value }}
                  />
                  <span className="text-sm">{colorOption.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-dark"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterModal;