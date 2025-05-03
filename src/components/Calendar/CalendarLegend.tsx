import React from 'react';
import { activityTypes } from '../../data/activityTypes';
import { useCharacters } from '../../contexts/CharacterContext';

interface CalendarLegendProps {
  selectedCharacterId: string | null;
}

const CalendarLegend: React.FC<CalendarLegendProps> = ({ selectedCharacterId }) => {
  const { getCharacterById } = useCharacters();
  
  // Get character if one is selected
  const selectedCharacter = selectedCharacterId 
    ? getCharacterById(selectedCharacterId) 
    : null;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3 border-b pb-2">Legend</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Global events */}
        <div className="text-sm">
          <h4 className="font-medium mb-2">Global Events</h4>
          {activityTypes
            .filter(type => ['fieldBoss', 'valhallaWar'].includes(type.id))
            .map(type => (
              <div key={type.id} className="flex items-center mb-2">
                <div 
                  className="w-4 h-4 rounded mr-2" 
                  style={{ backgroundColor: type.color }}
                />
                <span>{type.name}</span>
              </div>
            ))
          }
        </div>
        
        {/* Character activities */}
        {selectedCharacter && (
          <div className="text-sm">
            <h4 className="font-medium mb-2">Character Activities</h4>
            {activityTypes
              .filter(type => ['dailyDungeon', 'weeklyDungeon', 'custom'].includes(type.id))
              .map(type => (
                <div key={type.id} className="flex items-center mb-2">
                  <div 
                    className="w-4 h-4 rounded mr-2" 
                    style={{ backgroundColor: type.color }}
                  />
                  <span>{type.name}</span>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarLegend;