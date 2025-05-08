import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // Assumindo que você usa react-router
import apiManager from '../api/apiManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt, faFutbol, faBasketballBall, faVolleyballBall, faPauseCircle, faExchangeAlt } from '@fortawesome/free-solid-svg-icons'; // Adicionando mais ícones

import '../styles/eventHistory.scss';

type Sport = 'futsal' | 'basketball' | 'volleyball';

interface Event {
  id: number | string; // ID pode ser string se concatenado com tipo
  timestamp: number;
  type: 'card' | 'foul' | 'score' | 'timeout' | 'substitution';
  description: string;
  team?: string; // ID ou nome da equipe. Ex: 'home', 'away', ou ID específico
  player?: string; // ID ou nome do jogador
  details?: any; // Para informações adicionais específicas do evento (ex: cardType, pointValue)
  icon?: React.ReactNode; // Para ícones específicos do evento
  teamLogo?: string; // URL para o logo da equipe
  playerNumber?: string | number; // Número do jogador
}

const tabs: Record<Sport, string[]> = {
  futsal:    ['recentes', 'golos', 'faltas', 'cartões', 'pausas'], // Adicionar 'substituições' se aplicável
  basketball:['recentes', 'golos', 'faltas', 'pausas'],
  volleyball:['recentes', 'pontos', 'cartões', 'pausas'],
};

const eventTypeToTabMap: Record<Event['type'], string> = {
  score: 'golos', // 'pontos' para volleyball será tratado na lógica de filtragem
  foul: 'faltas',
  card: 'cartões',
  timeout: 'pausas',
  substitution: 'substituições', // Se tiver uma aba para isso
};


const EventHistory: React.FC = () => {
  const { sport: sportParam, placardId: placardIdParam } = useParams<{ sport: Sport, placardId: string }>();

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('recentes');

  const sport = sportParam;
  const placardId = placardIdParam;

  const getEventIcon = (event: Event, currentSport: Sport): React.ReactNode => {
    // Ícones baseados no tipo de evento e esporte
    switch (event.type) {
      case 'score':
        if (currentSport === 'futsal') return <FontAwesomeIcon icon={faFutbol} />;
        if (currentSport === 'basketball') return <FontAwesomeIcon icon={faBasketballBall} />;
        if (currentSport === 'volleyball') return <FontAwesomeIcon icon={faVolleyballBall} />;
        return null;
      case 'card':
        // Para cartões, podemos usar uma div colorida como nas imagens
        return <div className={`card-display-icon ${event.details?.cardType?.toLowerCase()}`}></div>;
      case 'foul':
        // Adicionar um ícone genérico para falta ou específico se tiver
        return null; // Ex: <FontAwesomeIcon icon={someFoulIcon} />;
      case 'timeout':
        return <FontAwesomeIcon icon={faPauseCircle} />;
      case 'substitution':
        return <FontAwesomeIcon icon={faExchangeAlt} />; // Ícone de substituição
      default:
        return null;
    }
  };


  const normalizeEventData = useCallback((fetchedItems: any[], type: Event['type'], currentSport: Sport): Event[] => {
    if (!Array.isArray(fetchedItems)) {
        console.warn(`Dados para o tipo ${type} não são um array:`, fetchedItems);
        return [];
    }
    return fetchedItems.map((item: any, index: number) => {
      let description = '';
      let playerInfo = item.playerName || (item.playerId ? `Jogador ${item.playerId}` : '');
      let teamInfo = item.teamId || item.team; // 'home', 'away' ou ID

      switch (type) {
        case 'score':
          description = `${item.pointValue || 1} ${currentSport === 'volleyball' ? 'ponto(s)' : 'golo(s)'}`;
          if (playerInfo) description += ` por ${playerInfo}`;
          break;
        case 'card':
          description = `Cartão ${item.cardType || ''}`;
          if (playerInfo) description += ` para ${playerInfo}`;
          break;
        case 'foul':
          description = `Falta`;
          if (playerInfo) description += ` de ${playerInfo}`;
          if (item.period) description += ` (Período ${item.period})`;
          break;
        case 'timeout':
          description = `Pausa Técnica`;
          if (teamInfo) description += ` (${teamInfo})`;
          break;
        case 'substitution':
          description = `Substituição: Entra ${item.playerInName || item.playerInId}, Sai ${item.playerOutName || item.playerOutId}`;
          break;
        default:
          description = `Evento desconhecido`;
      }
      const eventId = item.id || item.eventId || `${type}-${item.timestamp}-${index}`; // ID único
      const eventTimestamp = parseInt(item.timestamp || item.recordedAt || Date.now(), 10);

      return {
        id: eventId,
        timestamp: eventTimestamp,
        type: type,
        description: description,
        team: teamInfo,
        player: playerInfo,
        details: item, // Armazena todos os detalhes originais
        icon: null, // O ícone será adicionado depois com base no esporte
        teamLogo: item.teamLogo,
        playerNumber: item.playerNumber,
      };
    });
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!placardId || !sport) {
      setError('ID do placar ou esporte não especificado.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [
        scoresResponse,
        foulsResponse,
        cardsResponse,
        timeoutsResponse,
        // substitutionsResponse, // Exemplo para substituições
      ] = await Promise.allSettled([
        apiManager.makeRequest('score', 'get', { placardId, sport }, 'GET'),
        apiManager.makeRequest('foul', 'list_game_fouls', { placardId, sport }, 'GET'), // Assumindo que 'foul' é o endpoint para faltas
        apiManager.getCards(placardId, sport),
        apiManager.getTimeoutEvents(placardId, sport),
        // apiManager.makeRequest('substitution', 'get', { placardId, sport }, 'GET'), // Exemplo
      ]);

      let allEvents: Event[] = [];

      if (scoresResponse.status === 'fulfilled' && scoresResponse.value && (scoresResponse.value as { points: any }).points) {
        allEvents = allEvents.concat(normalizeEventData((scoresResponse.value as { points: any }).points, 'score', sport));
      }
      if (foulsResponse.status === 'fulfilled' && foulsResponse.value && (foulsResponse.value as { data: any }).data) {
        allEvents = allEvents.concat(normalizeEventData((foulsResponse.value as { data: any }).data, 'foul', sport));
      }
      if (cardsResponse.status === 'fulfilled' && cardsResponse.value.cards) {
        allEvents = allEvents.concat(normalizeEventData(cardsResponse.value.cards, 'card', sport));
      }
      if (timeoutsResponse.status === 'fulfilled' && timeoutsResponse.value.events) {
        allEvents = allEvents.concat(normalizeEventData(timeoutsResponse.value.events, 'timeout', sport));
      }
      // if (substitutionsResponse.status === 'fulfilled' && substitutionsResponse.value.substitutions) { // Exemplo
      //   allEvents = allEvents.concat(normalizeEventData(substitutionsResponse.value.substitutions, 'substitution', sport));
      // }

      // Adicionar ícones após normalização e antes de ordenar
      allEvents = allEvents.map(event => ({
        ...event,
        icon: getEventIcon(event, sport),
      }));

      allEvents.sort((a, b) => b.timestamp - a.timestamp);
      setEvents(allEvents);

    } catch (e) {
      console.error("Erro ao buscar eventos:", e);
      setError('Falha ao carregar o histórico de eventos.');
    } finally {
      setLoading(false);
    }
  }, [placardId, sport, normalizeEventData]);

  useEffect(() => {
    if (placardId && sport) {
        fetchEvents();
        const intervalId = setInterval(fetchEvents, 30000); // Atualiza a cada 30 segundos
        return () => clearInterval(intervalId);
    }
  }, [fetchEvents, placardId, sport]);

  useEffect(() => {
    let currentFilteredEvents = events;
    if (activeTab !== 'recentes') {
      const tabToEventMap: Record<string, Event['type'] | undefined> = {
        'golos': 'score',
        'pontos': 'score',
        'faltas': 'foul',
        'cartões': 'card',
        'pausas': 'timeout',
        'substituições': 'substitution',
      };
      const eventType = tabToEventMap[activeTab];
      if (eventType) {
        currentFilteredEvents = events.filter(event => event.type === eventType);
      }
    }
    setFilteredEvents(currentFilteredEvents);
  }, [activeTab, events]);


  const handleEdit = (event: Event) => {
  };

  const handleDelete = async (event: Event) => {
  };

  if (!placardId || !sport) {
    return <div className="event-history-error">ID do placar ou esporte não fornecido.</div>;
  }
  if (loading) return <div className="event-history-loading">Carregando histórico de eventos...</div>;
  if (error) return <div className="event-history-error">Erro: {error}</div>;
  if (!tabs[sport]) return <div className="event-history-error">Esporte '{sport}' não suportado ou não definido.</div>;

  const formatDisplayTime = (timestamp: number): string => {
    // Esta função precisa ser ajustada para refletir o tempo de jogo (ex: 51')
    // Por agora, formata como HH:MM
    const date = new Date(timestamp);
    // Para simular o tempo de jogo, você precisaria do tempo de início da partida
    // e calcular a diferença. Exemplo simplificado:
    // const minutes = Math.floor((timestamp - gameStartTime) / 60000);
    // return `${minutes}'`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="event-history">
      <h2 className="event-history-title">Eventos</h2>
      <div className="tabs-container">
        {tabs[sport].map((tabName) => (
          <button
            key={tabName}
            className={`tab-button ${activeTab === tabName ? 'active' : ''}`}
            onClick={() => setActiveTab(tabName)}
          >
            {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
          </button>
        ))}
      </div>
      <ul className="events-list">
        {filteredEvents.length === 0 && <li className="event-item-empty">Nenhum evento para exibir nesta categoria.</li>}
        {filteredEvents.map((event) => (
          <li key={event.id} className={`event-item event-type-${event.type}`}>
            <div className="event-time">{formatDisplayTime(event.timestamp)}</div>
            <div className="event-icon-display">{event.icon}</div>
            <div className="event-details-main">
              <span className="event-description-text">{event.description}</span>
              {/* {event.player && <span className="event-player-name"> {event.player}</span>} */}
            </div>
            <div className="event-team-info">
              {event.playerNumber && <span className="player-number-badge">{event.playerNumber}</span>}
              {event.teamLogo && <img src={event.teamLogo} alt="Logo da Equipe" className="team-logo-display" />}
            </div>
            <div className="event-actions">
              <button onClick={() => handleEdit(event)} className="action-button edit-button" aria-label="Editar evento">
                <FontAwesomeIcon icon={faPencilAlt} />
              </button>
              <button onClick={() => handleDelete(event)} className="action-button delete-button" aria-label="Excluir evento">
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventHistory;
