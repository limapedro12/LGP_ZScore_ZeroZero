import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import '../styles/eventHistory.scss';

interface Event {
  id: number;
  timestamp: string;
  type: string;
  description: string;
  team?: string;
  player?: string;
}

const EventHistory: React.FC = () => {
  const { placardId, sport } = useParams<{ placardId: string; sport: string }>();
  const [activeTab, setActiveTab] = useState<string>('recentes');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const tabs = {
    futsal: ['recentes', 'golos', 'faltas', 'cartões', 'pausas'],
    basketball: ['recentes', 'golos', 'faltas', 'pausas'],
    volleyball: ['recentes', 'pontos', 'cartões', 'pausas'],
  };

  useEffect(() => {
    const fetchEvents = async () => {
      if (!placardId || !sport) return;

      setLoading(true);
      try {
        const response = await apiManager.get(`/events/${placardId}/${sport}`);
        setEvents(response.data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [placardId, sport]);

  const filteredEvents = events.filter((event) => {
    if (activeTab === 'recentes') return true;
    return event.type.toLowerCase() === activeTab;
  });

  if (loading) {
    return <div className="event-history">Carregando eventos...</div>;
  }

  return (
    <div className="event-history">
      <h2>Eventos</h2>
      <div className="tabs">
        {tabs[sport]?.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="events-list">
        {filteredEvents.map((event) => (
          <div key={event.id} className="event-item">
            <span className="event-time">{event.timestamp}</span>
            <span className="event-description">{event.description}</span>
            <div className="event-actions">
              <button className="edit-button">Editar</button>
              <button className="delete-button">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventHistory;