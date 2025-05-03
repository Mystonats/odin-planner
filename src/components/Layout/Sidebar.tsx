import React from 'react';
import { useCharacters } from '../../contexts/CharacterContext';

interface SidebarProps {
  onSelectCharacter: (id: string | null) => void;
  selectedCharacterId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectCharacter, selectedCharacterId }) => {
  const { mainCharacter, subCharacters } = useCharacters();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h2 className="text-xl font-semibold mb-4 text-primary border-b pb-2">Characters</h2>
      
      <div className="space-y-4">
        {/* Show global events option */}
        <div 
          className={`p-3 rounded-md cursor-pointer transition ${
            selectedCharacterId === null 
              ? 'bg-secondary text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => onSelectCharacter(null)}
        >
          <h3 className="font-medium">Global Events</h3>
          <p className="text-sm">View all server events</p>
        </div>
        
        {/* Main character */}
        {mainCharacter && (
          <div 
            className={`p-3 rounded-md cursor-pointer transition ${
              selectedCharacterId === mainCharacter.id 
                ? 'bg-secondary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => onSelectCharacter(mainCharacter.id)}
            style={{ borderLeft: `4px solid ${mainCharacter.color}` }}
          >
            <h3 className="font-medium">{mainCharacter.name}</h3>
            <p className="text-sm">Lv.{mainCharacter.level} {mainCharacter.class}</p>
          </div>
        )}
        
        {/* Sub characters */}
        {subCharacters.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs uppercase text-gray-500 font-medium">Sub Characters</h3>
            {subCharacters.map((char) => (
              <div 
                key={char.id}
                className={`p-3 rounded-md cursor-pointer transition ${
                  selectedCharacterId === char.id 
                    ? 'bg-secondary text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => onSelectCharacter(char.id)}
                style={{ borderLeft: `4px solid ${char.color}` }}
              >
                <h3 className="font-medium">{char.name}</h3>
                <p className="text-sm">Lv.{char.level} {char.class}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Add character button for less than 3 total characters */}
        {mainCharacter && subCharacters.length < 2 && (
          <button
            className="w-full mt-4 p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
            onClick={() => {/* Open character creation modal */}}
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Sub Character</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;