import React, { useState } from 'react';
import { CharacterProvider } from './contexts/CharacterContext';
import { EventProvider } from './contexts/EventContext';
import Layout from './components/Layout/Layout';
import CharacterList from './components/Characters/CharacterList';
import EventList from './components/Events/EventList';
import CalendarLegend from './components/Calendar/CalendarLegend';
import ScheduleCalendar from './components/Calendar/ScheduleCalendar';
import EventModal from './components/Events/EventModal';
import AccountSwitcher from './components/Accounts/AccountSwitcher';
import { Activity } from './types/Activity';

const App: React.FC = () => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Activity | null>(null);
  
  // Handle event selection from event list
  const handleSelectEvent = (event: Activity) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };
  
  // Handle event modal close
  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };
  
  return (
    <CharacterProvider>
      <EventProvider>
        <Layout>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar section */}
            <div className="w-full lg:w-1/4 space-y-6">
              {/* Account switcher component */}
              <AccountSwitcher />
              
              {/* Character list component */}
              <CharacterList
                onSelectCharacter={setSelectedCharacterId}
                selectedCharacterId={selectedCharacterId}
              />
              
              {/* Event list component */}
              <EventList
                selectedCharacterId={selectedCharacterId}
                onSelectEvent={handleSelectEvent}
              />
              
              {/* Legend for calendar colors */}
              <CalendarLegend
                selectedCharacterId={selectedCharacterId}
              />
            </div>
            
            {/* Main calendar section */}
            <div className="w-full lg:w-3/4">
              <ScheduleCalendar
                selectedCharacterId={selectedCharacterId}
              />
            </div>
          </div>
          
          {/* Event modal */}
          {showEventModal && (
            <EventModal
              isOpen={showEventModal}
              onClose={handleCloseEventModal}
              event={selectedEvent}
              slotInfo={null}
              characterId={selectedCharacterId}
            />
          )}
        </Layout>
      </EventProvider>
    </CharacterProvider>
  );
};

export default App;