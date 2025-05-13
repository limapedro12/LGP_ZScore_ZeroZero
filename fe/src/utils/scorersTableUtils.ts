import apiManager from '../api/apiManager';

export type EventCategory =   'basketballScore'
                            | 'volleyballScore'
                            | 'futsalScore'
                            | 'foul'
                            | 'timeout'
                            | 'possession'
                            | 'card'
                            | 'substitution';

export type Sport = 'futsal' | 'volleyball' | 'basketball';

export type TeamTag = 'home' | 'away';

interface EventIconInfo {
  iconPath: string;
}

const eventIcons: Record<EventCategory, EventIconInfo> = {
    basketballScore: { iconPath: '/icons/basketball-score-icon.png' },
    volleyballScore: { iconPath: '/icons/volleyball-score-icon.png' },
    futsalScore: { iconPath: '/icons/futsal-score-icon.png' },
    foul: { iconPath: '/icons/foul-icon.png' },
    timeout: { iconPath: '/icons/timeout-icon.png' },
    possession: { iconPath: '/icons/basketball-possession-icon.png' },
    card: { iconPath: '/icons/yellow-red-together-card-icon.png' },
    substitution: { iconPath: '/icons/sub-icon.png' },
};

/**
 * Gets the icon path for a given event category.
 * @param category The event category.
 * @returns The path to the event icon, or undefined if not found.
 */
export function getEventIconPath(category: EventCategory): string | undefined {
    const iconInfo = eventIcons[category];
    if (iconInfo) {
        return iconInfo.iconPath;
    }
    console.warn(`Icon not found for event category: ${category}`);
    return undefined;
}

export interface SportEventConfig {
    eventName: string;
    eventCategory: EventCategory;

    onEventAction?: (
        teamTag: TeamTag,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigate?: any,
        sport?: Sport,
        placardId?: string
    ) => void;
}

const sportEventConfigurations: Record<Sport, SportEventConfig[]> = {
    futsal: [
        {
            eventName: 'Golo',
            eventCategory: 'futsalScore',
            onEventAction: (teamTag, navigate, sport, placardId) => {
                if (navigate && sport && placardId) {
                    navigate(`/scorersTable/${sport}/${placardId}/playerSelection/${teamTag}`, {
                        state: { eventCategory: 'futsalScore' },
                    });
                } else {
                    console.warn('Navigation details missing for futsal score event');
                }
            },
        },
        {
            eventName: 'Falta',
            eventCategory: 'foul',
            onEventAction: (teamTag) => console.log(`Futsal Falta - Team: ${teamTag}`),
        },
        {
            eventName: 'Cartão',
            eventCategory: 'card',
            onEventAction: (teamTag, navigate, sport, placardId) => {
                if (navigate && sport && placardId) {
                    navigate(`/scorersTable/${sport}/${placardId}/selectCard/${teamTag}`);
                } else {
                    console.warn('Navigation details missing for card event');
                }
            },
        },
        {
            eventName: 'Tempo',
            eventCategory: 'timeout',
            onEventAction: (teamTag, navigate, sport, placardId) => {
                if (teamTag && sport && placardId) {
                    apiManager.startTimeout(placardId, sport, teamTag);
                } else {
                    console.warn('Navigation details missing for timeout event');
                }
            },
        },
    ],
    volleyball: [
        {
            eventName: 'Ponto',
            eventCategory: 'volleyballScore',
            onEventAction: (teamTag, navigate, sport, placardId) => {
                if (navigate && sport && placardId) {
                    navigate(`/scorersTable/${sport}/${placardId}/playerSelection/${teamTag}`, {
                        state: { eventCategory: 'volleyballScore' },
                    });
                } else {
                    console.warn('Navigation details missing for volleyball score event');
                }
            },
        },
        {
            eventName: 'Substituição',
            eventCategory: 'substitution',
            onEventAction: (teamTag) => console.log(`Volleyball Substituição - Team: ${teamTag}`),
        },
        {
            eventName: 'Cartão',
            eventCategory: 'card',
            onEventAction: (teamTag, navigate, sport, placardId) => {
                if (navigate && sport && placardId) {
                    navigate(`/scorersTable/${sport}/${placardId}/selectCard/${teamTag}`);
                } else {
                    console.warn('Navigation details missing for card event');
                }
            },
        },
        {
            eventName: 'Tempo',
            eventCategory: 'timeout',
            onEventAction: (teamTag, navigate, sport, placardId) => {
                if (teamTag && sport && placardId) {
                    apiManager.startTimeout(placardId, sport, teamTag);
                } else {
                    console.warn('Navigation details missing for timeout event');
                }
            },
        },
    ],
    basketball: [
        {
            eventName: 'Cesto',
            eventCategory: 'basketballScore',
            onEventAction: (teamTag, navigate, sport, placardId) => {
                if (navigate && sport && placardId) {
                    navigate(`/scorersTable/${sport}/${placardId}/pointValueSelection/${teamTag}`, {
                        state: { eventCategory: 'basketballScore' },
                    });
                } else {
                    console.warn('Navigation details missing for basketball score event');
                }
            },
        },
        {
            eventName: 'Falta',
            eventCategory: 'foul',
            onEventAction: (teamTag) => console.log(`Basketball Falta - Team: ${teamTag}`),
        },
        {
            eventName: 'Tempo',
            eventCategory: 'timeout',
            onEventAction: (teamTag, navigate, sport, placardId) => {
                if (teamTag && sport && placardId) {
                    apiManager.startTimeout(placardId, sport, teamTag);
                } else {
                    console.warn('Navigation details missing for timeout event');
                }
            },
        },
        {
            eventName: 'Posse',
            eventCategory: 'possession',
            onEventAction: (teamTag) => console.log(`Basketball Posse - Team: ${teamTag}`),
        },
    ],
};

/**
   * Gets the event configurations for a given sport.
   * @param sport The sport.
   * @returns An array of SportEventConfig for the specified sport, or an empty array if the sport is not found.
   */
export function getSportEvents(sport: Sport): SportEventConfig[] {
    return sportEventConfigurations[sport] || [];
}
