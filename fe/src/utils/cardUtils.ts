export type Sport = 'futsal' | 'volleyball';

export type FutsalCardType = 'yellow' | 'red';
export type VolleyballCardType = 'white' | 'yellow' | 'red' | 'yellowRedTogether' | 'yellowRedSeparately';

export type AnyCardType = FutsalCardType | VolleyballCardType;

export type CardTypeForSport<S extends Sport> = S extends 'futsal'
  ? FutsalCardType
  : S extends 'volleyball'
  ? VolleyballCardType
  : S

interface CardInfo {
  iconPath: string;
}

const sportCardRules: Record<Sport, Partial<Record<AnyCardType, CardInfo>>> = {
    futsal: {
        yellow: { iconPath: '/icons/yellow-card-icon.png' },
        red: { iconPath: '/icons/red-card-icon.png' },
    },
    volleyball: {
        white: { iconPath: '/icons/white-card-icon.png' },
        yellow: { iconPath: '/icons/yellow-card-icon.png' }, // Assuming same icons for now
        red: { iconPath: '/icons/red-card-icon.png' },
        yellowRedTogether: { iconPath: '/icons/yellow-red-together-card-icon.png' },
        yellowRedSeparately: { iconPath: '/icons/yellow-red-separately-card-icon.png' },
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
