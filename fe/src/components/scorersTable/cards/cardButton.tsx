import React from 'react';
import { Button, Image } from 'react-bootstrap';
import { Sport, getCardIconPath, CardTypeForSport } from '../../../utils/cardUtils';

interface CardButtonProps<S extends Sport> {
  cardName: string;
  cardType: CardTypeForSport<S>;
  sport: S;
  onCardSelect: (cardType: CardTypeForSport<S>) => void;
  disabled?: boolean;
  selectedCardType?: CardTypeForSport<S>;
}

const CardButton = <S extends Sport>({
    cardName,
    cardType,
    sport,
    onCardSelect,
    disabled = false,
    selectedCardType,
}: CardButtonProps<S>) => {
    const iconPath = getCardIconPath(sport, cardType);

    const buttonClasses = `rounded-circle border border-2 border-dark d-flex 
    align-items-center justify-content-center p-0`;

    const iconStyle: React.CSSProperties = {
        height: '28px',
        width: '28px',
        objectFit: 'contain',
    };

    const buttonSize = '48px';
    const buttonInlineStyle: React.CSSProperties = {
        width: buttonSize,
        height: buttonSize,
        padding: '8px',
    };

    const isSelected = selectedCardType === cardType;

    return (
        <div className="d-flex align-items-center justify-content-between my-1 py-2 px-3 w-100">
            <span className="card-name text-white me-3 fs-5 fw-bold">
                {cardName}
            </span>
            <Button
                variant={isSelected ? 'secondary' : 'light'}
                onClick={() => onCardSelect(cardType)}
                className={buttonClasses}
                disabled={disabled}
                aria-label={`Select ${cardName} card`}
                style={buttonInlineStyle}
            >
                {iconPath ? (
                    <Image src={iconPath} alt={`${cardName} icon`} style={iconStyle} />
                ) : (
                    <span className="fw-bold fs-6" style={iconStyle}>?</span>
                )}
            </Button>
        </div>
    );
};

export default CardButton;
