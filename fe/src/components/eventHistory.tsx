import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import '../styles/eventHistory.scss';

type Sport = 'futsal' | 'basketball' | 'volleyball';

interface Event {
  id: number;
  timestamp: number; // aqui o atributo como número para facilitar o sort
  type: 'card' | 'foul' | 'score' | 'timeout';
  description: string;
  team?: string;
  player?: string;
}

const tabs: Record<Sport, string[]> = {
  futsal:    ['recentes', 'golos', 'faltas', 'cartões', 'pausas'],
  basketball:['recentes', 'golos', 'faltas', 'pausas'],
  volleyball:['recentes', 'pontos', 'cartões', 'pausas'],
};

const EventHistory: React.FC = () => {
  const { placardId, sport } = useParams<{ placardId: string; sport: Sport }>();
  const [activeTab, setActiveTab] = useState<string>('recentes');
  const [events, setEvents]   = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!placardId || !sport) {
      setError('Jogo ou desporto não especificado.');
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1) fetch em paralelo
      const [
        { cards },
        { data: fouls },
        { points: scores },
        { events: timeouts },
      ] = await Promise.all([
        apiManager.getCards(placardId, sport),                          // [{ eventId, timestamp, cardType, playerId }]
        apiManager.makeRequest<{ data: any[] }>('timeout', 'list_game_fouls', { placardId, sport }, 'GET'),
        apiManager.makeRequest<{ points: any[] }>('score', 'get',      { placardId, sport }, 'GET'),
        apiManager.getTimeoutEvents(placardId, sport),                 // { events: [...] }
      ]);

      // 2) normaliza cada tipo
      const normCards: Event[] = cards.map(c => ({
        id:          c.eventId,
        timestamp:   c.timestamp,
        type:        'card',
        description: `Cartão ${c.cardType}`,
        team:        undefined,
        player:      c.playerId,
      }));

      const normFouls: Event[] = fouls.map(f => ({
        id:          parseInt(f.eventId),
        timestamp:   parseInt(f.recordedAt || f.timestamp),
        type:        'foul',
        description: `Falta períodos ${f.period}`,
        team:        f.teamId,
        player:      f.playerId,
      }));

      const normScores: Event[] = scores.map(s => ({
        id:          parseInt(s.eventId),
        timestamp:   s.timestamp,
        type:        'score',
        description: `Ponto ${s.pointValue}`,
        team:        s.team,
        player:      s.playerId,
      }));

      const normTimeouts: Event[] = (timeouts||[]).map(t => ({
        id:        parseInt(t.eventId, 10),      // de string para number
        timestamp: Date.now(), // verificar por favor
        type:      'timeout',
        description:`Timeout (${t.team})`,
        team:      t.team!,
      }));
      

      // 3) junta e ordena
      const all = [...normCards, ...normFouls, ...normScores, ...normTimeouts]
        .sort((a, b) => b.timestamp - a.timestamp);

      setEvents(all);

    } catch (e) {
      console.error(e);
      setError('Erro ao carregar histórico de eventos.');
    } finally {
      setLoading(false);
    }
  }, [placardId, sport]);

  useEffect(() => {
    fetchEvents();
    const iv = setInterval(fetchEvents, 5000);
    return () => clearInterval(iv);
  }, [fetchEvents]);

  if (loading) return <div className="event-history">Carregando eventos...</div>;
  if (error)   return <div className="event-history error">{error}</div>;

  // filtra pelas tabs (mapeia o tipo para a label)
  const filtered = events.filter(e => {
    if (activeTab === 'recentes') return true;
    if (activeTab === 'golos'    && e.type === 'score')   return true;
    if (activeTab === 'faltas'   && e.type === 'foul')    return true;
    if (activeTab === 'cartões'  && e.type === 'card')    return true;
    if (activeTab === 'pausas'   && e.type === 'timeout') return true;
    if (activeTab === 'pontos'   && e.type === 'score')   return true; // volley chama "pontos"
    return false;
  });

  const handleDelete = async (evt: Event) => {
    try {
      switch (evt.type) {
        case 'card':
          if (!placardId || !sport) {
            setError('Dados do placard ou desporto em falta.');
            return;
          }          
          await apiManager.makeRequest('cards', 'remove', { placardId, sport, eventId: evt.id }, 'POST');
          break;
        case 'foul':
          if (!placardId || !sport) {
            setError('Dados do placard ou desporto em falta.');
            return;
          }          
          await apiManager.makeRequest('timeout', 'delete', { placardId, sport, eventId: evt.id }, 'POST');
          break;
        case 'score':
          if (!placardId || !sport) {
            setError('Dados do placard ou desporto em falta.');
            return;
          }          
          await apiManager.makeRequest('score',   'delete', { placardId, sport, eventId: evt.id }, 'POST');
          break;
        case 'timeout':
          if (!placardId || !sport) {
            setError('Dados do placard ou desporto em falta.');
            return;
          }          
          await apiManager.makeRequest('timeout', 'reset',  { placardId, sport }, 'POST');
          break;
      }
      setEvents(prev => prev.filter(e => e.id !== evt.id));
    } catch {
      setError('Erro ao excluir evento.');
    }
  };

  const handleEdit = async (evt: Event) => {
    if (!placardId || !sport) {
      setError('Jogo ou desporto não especificado.');
      return;
    }    
    try {
      let details;
      switch (evt.type) {
        case 'card':
          details = await apiManager.getEventDetails(placardId, sport, evt.id);
          break;
        // ... idêntico para foul/score/timeout
      }
      console.log('Editar:', details);
      // aqui abres modal/form com esses detalhes e depois fazes makeRequest('update', …)
    } catch {
      setError('Erro ao buscar detalhes do evento.');
    }
  };

  return (
    <div className="event-history">
      <h2>Eventos</h2>
      <div className="tabs">
      {sport && tabs[sport]?.map((tab: string) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab? 'active':''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="events-list">
        {filtered.map(evt => (
          <div key={`${evt.type}-${evt.id}`} className="event-item">
            <span className="event-time">{new Date(evt.timestamp).toLocaleTimeString()}</span>
            <span className="event-description">{evt.description}</span>
            <div className="event-actions">
              <button onClick={() => handleEdit(evt)}>Editar</button>
              <button onClick={() => handleDelete(evt)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventHistory;
