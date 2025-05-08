import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // Assumindo que você usa react-router
import apiManager from '../api/apiManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt, faFutbol, faBasketballBall, faVolleyballBall, faPauseCircle, faExchangeAlt } from '@fortawesome/free-solid-svg-icons'; // Adicionando mais ícones
import { useNavigate } from 'react-router-dom'; // Adicionar para navegação programática
import { EndpointType, ActionType } from '../api/apiManager'; // Corrigido: Importar de apiManager

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
  const navigate = useNavigate(); // Hook para navegação

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('recentes');

  const sport = sportParam as Sport; // Fazer cast para Sport se tiver a certeza que é um dos tipos
  const placardId = placardIdParam;

  const getEventIcon = useCallback((event: Event, currentSport: Sport): React.ReactNode => {
    // Ícones baseados no tipo de evento e esporte
    switch (event.type) {
      case 'score':
        if (currentSport === 'futsal') return <FontAwesomeIcon icon={faFutbol} />;
        if (currentSport === 'basketball') return <FontAwesomeIcon icon={faBasketballBall} />;
        if (currentSport === 'volleyball') return <FontAwesomeIcon icon={faVolleyballBall} />;
        return null;
      case 'card':
        return <div className={`card-display-icon ${event.details?.cardType?.toLowerCase()}`}></div>;
      case 'foul':
        return null; // Adicionar ícone se desejado
      case 'timeout':
        return <FontAwesomeIcon icon={faPauseCircle} />;
      case 'substitution':
        return <FontAwesomeIcon icon={faExchangeAlt} />;
      default:
        return null;
    }
  }, []);

  const normalizeEventData = useCallback((fetchedItems: any[], type: Event['type'], currentSport: Sport): Event[] => {
    if (!Array.isArray(fetchedItems)) {
        console.warn(`Dados para o tipo ${type} não são um array:`, fetchedItems);
        return [];
    }
    return fetchedItems.map((item: any, index: number) => {
      let description = '';
      let playerInfo = item.playerName || (item.playerId ? `Jogador ${item.playerId}` : '');
      let teamInfo = item.teamId || item.team;

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
      // É crucial que item.eventId (ou item.id) seja o ID que o backend espera.
      const eventId = item.eventId || item.id || `${type}-${item.timestamp}-${index}-${Math.random().toString(36).substring(7)}`;
      const eventTimestamp = parseInt(item.timestamp || item.recordedAt || Date.now(), 10);

      return {
        id: eventId,
        timestamp: eventTimestamp,
        type: type,
        description: description,
        team: teamInfo,
        player: playerInfo,
        details: item,
        icon: null,
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
        cardsData,
        timeoutEventsData,
      ] = await Promise.allSettled([
        apiManager.makeRequest('score', 'get', { placardId, sport }, 'GET'),
        apiManager.makeRequest('foul', 'list_game_fouls', { placardId, sport }, 'GET'),
        apiManager.getCards(placardId, sport),
        apiManager.getTimeoutEvents(placardId, sport),
      ]);

      let allEvents: Event[] = [];

      if (scoresResponse.status === 'fulfilled' && scoresResponse.value && (scoresResponse.value as { points: any[] }).points) {
        allEvents = allEvents.concat(normalizeEventData((scoresResponse.value as { points: any[] }).points, 'score', sport));
      } else if (scoresResponse.status === 'rejected') {
        console.error('Erro ao buscar scores:', scoresResponse.reason);
      }

      if (foulsResponse.status === 'fulfilled' && foulsResponse.value && (foulsResponse.value as { data: any[] }).data) {
        allEvents = allEvents.concat(normalizeEventData((foulsResponse.value as { data: any[] }).data, 'foul', sport));
      } else if (foulsResponse.status === 'rejected') {
        console.error('Erro ao buscar fouls:', foulsResponse.reason);
      }

      if (cardsData.status === 'fulfilled' && cardsData.value.cards) {
        allEvents = allEvents.concat(normalizeEventData(cardsData.value.cards, 'card', sport));
      } else if (cardsData.status === 'rejected') {
        console.error('Erro ao buscar cards:', cardsData.reason);
      }

      if (timeoutEventsData.status === 'fulfilled' && timeoutEventsData.value.events) {
        allEvents = allEvents.concat(normalizeEventData(timeoutEventsData.value.events, 'timeout', sport));
      } else if (timeoutEventsData.status === 'rejected') {
        console.error('Erro ao buscar timeouts:', timeoutEventsData.reason);
      }

      allEvents = allEvents.map(event => ({
        ...event,
        icon: getEventIcon(event, sport),
      }));

      allEvents.sort((a, b) => b.timestamp - a.timestamp);
      setEvents(allEvents);

    } catch (e) {
      console.error("Erro geral ao buscar eventos:", e);
      setError('Falha ao carregar o histórico de eventos.');
    } finally {
      setLoading(false);
    }
  }, [placardId, sport, normalizeEventData, getEventIcon]);

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
    console.log('Iniciar edição para o evento:', event);
    // A navegação para a view de edição específica ocorreria aqui.
    // Exemplo: navigate(`/scoreboard/${sport}/${placardId}/event/${event.type}/${event.id}/edit`, { state: { eventDetails: event.details } });
    // A view de edição conteria o formulário e a lógica para chamar apiManager.makeRequest com a ação 'update'.
    alert(`Edição para "${event.description}" iniciada.\nImplementar navegação para formulário de edição específico.`);
    // Não faremos a chamada 'update' aqui, pois os dados editados viriam do formulário na view de edição.
  };

  const handleDelete = async (event: Event) => {
    if (window.confirm(`Tem certeza que deseja excluir este evento: ${event.description}?`)) {
      try {
        let endpointType: EndpointType;
        let action: ActionType;
        // Certifique-se que event.id é o identificador que o backend espera (geralmente eventId da API)
        let params: any = { placardId, sport, eventId: event.id };

        switch (event.type) {
            case 'score':
                endpointType = 'score';
                action = 'delete'; // Conforme score.php
                break;
            case 'foul':
                endpointType = 'foul';
                action = 'delete'; // Conforme foul.php
                break;
            case 'card':
                endpointType = 'cards'; // Endpoint é /events/card
                action = 'remove';    // Ação em card.php para apagar é 'remove'
                break;
            case 'timeout':
                endpointType = 'timeout';
                action = 'delete';    // timeout.php tem ação 'delete' que espera eventId
                // Se o backend para timeout->delete espera 'team', precisaria ser adicionado.
                // params.team = event.team; // Exemplo se necessário
                break;
            case 'substitution':
                console.warn(`A lógica de exclusão para 'substitution' não está implementada no backend.`);
                alert('A exclusão de substituições ainda não é suportada.');
                return;
            default:
                // Para garantir que todos os tipos de evento são tratados:
                const exhaustiveCheck: never = event.type;
                console.error(`Tipo de evento desconhecido para exclusão: ${exhaustiveCheck}`);
                alert(`Não é possível excluir o tipo de evento: ${exhaustiveCheck}`);
                return;
        }

        console.log(`A tentar excluir evento: type=${endpointType}, action=${action}, params=`, params);
        await apiManager.makeRequest(endpointType, action, params, 'POST'); // Assumindo POST para todas as exclusões
        
        setEvents(prevEvents => prevEvents.filter(e => e.id !== event.id));
        alert('Evento excluído com sucesso!');
        // Considerar chamar fetchEvents() se houver lógica complexa no backend que possa afetar outros dados.

      } catch (err) {
        console.error('Erro ao excluir evento:', err);
        let errorMessage = 'Falha ao excluir o evento.';
        if (err instanceof Error) {
            errorMessage += ` Detalhes: ${err.message}`;
        } else if (typeof err === 'object' && err !== null && 'message' in err) {
            errorMessage += ` Detalhes: ${(err as {message: string}).message}`;
        }
        alert(errorMessage);
      }
    }
  };

  if (!placardId || !sport) {
    return <div className="event-history-error">ID do placar ou esporte não fornecido.</div>;
  }
  if (loading) return <div className="event-history-loading">Carregando histórico de eventos...</div>;
  if (error) return <div className="event-history-error">Erro: {error}</div>;
  if (!tabs[sport]) return <div className="event-history-error">Esporte '{sport}' não suportado ou não definido.</div>;
    // Verificar e alterar a função abaixo; é apenas uma função de teste
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
