import React, { useState } from 'react';
import { useCharacters } from '../../contexts/CharacterContext';
import CharacterModal from './CharacterModal';

interface CharacterListProps {
  onSelectCharacter: (id: string | null) => void;
  selectedCharacterId: string | null;
}

const CharacterList: React.FC<CharacterListProps> = ({
  onSelectCharacter,
  selectedCharacterId,
}) => {
  const { characters, mainCharacter, subCharacters, deleteCharacter } = useCharacters();
  
  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  
  // Open edit modal for a character
  const handleEditCharacter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCharacter(id);
    setShowModal(true);
  };
  
  // Open create modal for a new character
  const handleAddCharacter = () => {
    setSelectedCharacter(null);
    setShowModal(true);
  };
  
  // Handle character deletion
  const handleDeleteCharacter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this character?')) {
      try {
        deleteCharacter(id);
        // If the deleted character was selected, reset selection
        if (selectedCharacterId === id) {
          onSelectCharacter(null);
        }
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };
  
  return (
    <>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#344055' }}>Characters</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Show global events option */}
          <div 
            style={{ 
              padding: '12px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              backgroundColor: selectedCharacterId === null ? '#dca54c' : '#f3f4f6', 
              color: selectedCharacterId === null ? 'white' : 'black' 
            }}
            onClick={() => onSelectCharacter(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <div>
                <h3 style={{ fontWeight: 500 }}>Global Events</h3>
                <p style={{ fontSize: '12px' }}>View all server events</p>
              </div>
            </div>
          </div>
          
          {/* Main character */}
          {mainCharacter && (
            <div 
              style={{ 
                padding: '12px', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                backgroundColor: selectedCharacterId === mainCharacter.id ? '#dca54c' : '#f3f4f6', 
                color: selectedCharacterId === mainCharacter.id ? 'white' : 'black',
                borderLeft: `4px solid ${mainCharacter.color}`
              }}
              onClick={() => onSelectCharacter(mainCharacter.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontWeight: 500 }}>{mainCharacter.name}</h3>
                  <p style={{ fontSize: '12px' }}>Lv.{mainCharacter.level} {mainCharacter.class}</p>
                </div>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={(e) => handleEditCharacter(mainCharacter.id, e)}
                    style={{ 
                      padding: '4px', 
                      borderRadius: '9999px', 
                      color: selectedCharacterId === mainCharacter.id ? 'white' : '#4b5563',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none'
                    }}
                    title="Edit Character"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 21H21M3 17.0001L17 3.00006C17.8284 2.17163 19.1716 2.17163 20 3.00006C20.8284 3.82849 20.8284 5.17163 20 6.00006L6 20.0001H3V17.0001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Sub characters */}
          {subCharacters.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 500, marginBottom: '8px' }}>Sub Characters</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {subCharacters.map((char) => (
                  <div 
                    key={char.id}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      backgroundColor: selectedCharacterId === char.id ? '#dca54c' : '#f3f4f6', 
                      color: selectedCharacterId === char.id ? 'white' : 'black',
                      borderLeft: `4px solid ${char.color}`
                    }}
                    onClick={() => onSelectCharacter(char.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontWeight: 500 }}>{char.name}</h3>
                        <p style={{ fontSize: '12px' }}>Lv.{char.level} {char.class}</p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={(e) => handleEditCharacter(char.id, e)}
                          style={{ 
                            padding: '4px', 
                            borderRadius: '9999px', 
                            color: selectedCharacterId === char.id ? 'white' : '#4b5563',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none'
                          }}
                          title="Edit Character"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 21H21M3 17.0001L17 3.00006C17.8284 2.17163 19.1716 2.17163 20 3.00006C20.8284 3.82849 20.8284 5.17163 20 6.00006L6 20.0001H3V17.0001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        
                        <button
                          onClick={(e) => handleDeleteCharacter(char.id, e)}
                          style={{ 
                            padding: '4px', 
                            borderRadius: '9999px', 
                            color: selectedCharacterId === char.id ? 'white' : '#4b5563',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none'
                          }}
                          title="Delete Character"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 7H20M10 11V17M14 11V17M5 7L6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19L19 7M9 7V4C9 3.4 9.4 3 10 3H14C14.6 3 15 3.4 15 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add character button for less than 3 total characters */}
          {characters.length < 5 && (
            <button
              onClick={handleAddCharacter}
              style={{ 
                width: '100%', 
                marginTop: '16px', 
                padding: '8px', 
                border: '2px dashed #d1d5db', 
                borderRadius: '6px', 
                color: '#6b7280', 
                cursor: 'pointer',
                background: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                  <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Add Character</span>
              </div>
            </button>
          )}
        </div>
      </div>
      
      {/* Character modal */}
      {showModal && (
        <CharacterModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          character={selectedCharacter ? characters.find(c => c.id === selectedCharacter) : undefined}
        />
      )}
    </>
  );
};

export default CharacterList;