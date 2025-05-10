export type Sport = 'futsal' | 'volleyball';

export type FutsalCardType = 'yellow' | 'red';
export type VolleyballCardType = 'white' | 'yellow' | 'red' | 'yellowRedTogether' | 'yellowRedSeparately';

export type AnyCardType = FutsalCardType | VolleyballCardType;

export type CardTypeForSport<S extends Sport> = S extends 'futsal'
  ? FutsalCardType
  : S extends 'volleyball'
  ? VolleyballCardType
  : never;

interface CardInfo {
    name: string;
    iconPath: string;
}

export interface SportCard<S extends Sport> {
  name: string;
  type: CardTypeForSport<S>;
}

const sportCardRules: Record<Sport, Partial<Record<AnyCardType, CardInfo>>> = {
    futsal: {
        yellow: { name: 'Amarelo', iconPath: '/icons/yellow-card-icon.png' },
        red: { name: 'Vermelho', iconPath: '/icons/red-card-icon.png' },
    },
    volleyball: {
        white: { name: 'Branco', iconPath: '/icons/white-card-icon.png' },
        yellow: { name: 'Amarelo', iconPath: '/icons/yellow-card-icon.png' },
        red: { name: 'Vermelho', iconPath: '/icons/red-card-icon.png' },
        yellowRedTogether: { name: 'Expulsão', iconPath: '/icons/yellow-red-together-card-icon.png' },
        yellowRedSeparately: { name: 'Desqualificação', iconPath: '/icons/yellow-red-separately-card-icon.png' },
    },
};

/**
 * Gets the icon path for a given sport and card type.
 * @param sport The sport.
 * * @param cardType The type of card, specific to the sport.
 * @returns The path to the card icon, or undefined if not found.
 */
export function getCardIconPath<S extends Sport>(
    sport: S,
    cardType: CardTypeForSport<S> | string
): string | undefined {
    const rulesForSport = sportCardRules[sport];
    if (rulesForSport) {
        let internalCardType = cardType as AnyCardType;

        if (sport === 'volleyball') {
            if (cardType === 'yellow_red_together') {
                internalCardType = 'yellowRedTogether';
            } else if (cardType === 'yellow_red_separately') {
                internalCardType = 'yellowRedSeparately';
            }
        }

        const cardInfo = rulesForSport[internalCardType];
        if (cardInfo) {
            return cardInfo.iconPath;
        }
    }
    console.warn(`Card icon not found for sport: ${sport}, original card type: ${cardType}`);
    return undefined;
}

/**
 * Gets all available cards for a given sport.
 * @param sport The sport.
 * @returns An array of SportCard for the specified sport.
 */
export function getAvailableCardsForSport<S extends Sport>(sport: S): SportCard<S>[] {
    const rules = sportCardRules[sport];
    if (!rules) return [];

    const cards: SportCard<S>[] = [];
    for (const type in rules) {
        if (Object.prototype.hasOwnProperty.call(rules, type)) {
            const cardInfo = rules[type as AnyCardType];
            if (cardInfo) {
                cards.push({
                    name: cardInfo.name,
                    type: type as unknown as CardTypeForSport<S>,
                });
            }
        }
    }
    return cards;
}
