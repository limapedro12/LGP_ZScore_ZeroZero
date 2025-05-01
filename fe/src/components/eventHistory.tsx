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

// 1) Definir tipo Sport
type Sport = 'futsal' | 'basketball' | 'volleyball';

// 2) Tabs de acordo com Sport
const tabs: Record<Sport, string[]> = {
    futsal: ['recentes', 'golos', 'faltas', 'cartões', 'pausas'],
    basketball: ['recentes', 'golos', 'faltas', 'pausas'],
    volleyball: ['recentes', 'pontos', 'cartões', 'pausas'],
};

const EventHistory: React.FC = () => {
    // 3) Utilizar sport como Sport no useParams
    const { placardId, sport } = useParams<{ placardId: string; sport: Sport }>();

    const [activeTab, setActiveTab] = useState<string>('recentes');
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!placardId || !sport) {
                setError('Jogo ou desporto não especificado.');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await apiManager.getEvents(placardId, sport);
                setEvents(response.events || []);
            } catch (err) {
                console.error('Erro ao buscar eventos:', err);
                setError('Erro ao carregar eventos.');
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

    const handleEdit = async (eventId: number) => {
        try {
            const eventDetails = await apiManager.getEventDetails(placardId!, sport!, eventId);
            console.log('Detalhes do evento para edição:', eventDetails);
            // Lógica de edição futura
        } catch (err) {
            console.error('Erro ao buscar detalhes do evento:', err);
            setError('Erro ao buscar detalhes do evento.');
        }
    };

    const handleDelete = async (eventId: number) => {
        try {
            if (placardId && sport) {
                await apiManager.makeRequest('api', 'delete', { placardId, sport, eventId }, 'POST');
                setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
            } else {
                throw new Error('Jogo ou desporto não especificado.');
            }
        } catch (err) {
            console.error('Erro ao excluir evento:', err);
            setError('Erro ao excluir evento.');
        }
    };

    if (loading) {
        return <div className="event-history">Carregando eventos...</div>;
    }

    if (error) {
        return <div className="event-history error">{error}</div>;
    }

    return (
        <div className="event-history">
            <h2>Eventos</h2>
            <div className="tabs">
                {sport && Object.keys(tabs).includes(sport) &&
                    tabs[sport].map((tab) => (
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
                            <button className="edit-button" onClick={() => handleEdit(event.id)}>Editar</button>
                            <button className="delete-button" onClick={() => handleDelete(event.id)}>Excluir</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventHistory;
