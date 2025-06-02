import React from 'react';

interface PlayerJerseyProps {
  number?: number;
  color?: string;
  hideIcon?: boolean;
}

const PlayerJersey: React.FC<PlayerJerseyProps> = ({ number, color = '#273E7C', hideIcon = false }) => {
    const hexToRgb = (hex: string): { r: number, g: number, b: number } => {
        const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;

        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

        return { r, g, b };
    };

    // Get RGB values from hex
    const rgb = hexToRgb(color);

    return (
        <div className="player-jersey-container d-flex justify-content-center align-items-center position-relative">
            {!hideIcon && (
                <>
                    <svg width="0" height="0">
                        <filter id={`color-${color.replace('#', '')}`} colorInterpolationFilters="sRGB">
                            <feColorMatrix
                                type="matrix"
                                values={`0 0 0 0 ${rgb.r}
                        0 0 0 0 ${rgb.g}
                        0 0 0 0 ${rgb.b}
                        0 0 0 1 0`}
                            />
                        </filter>
                    </svg>
                    <img
                        src={'/icons/tshirt-icon.svg'}
                        alt="Player Jersey"
                        className="img-fluid player-jersey-img"
                        style={{ filter: `url(#color-${color.replace('#', '')})` }}
                    />
                </>
            )}
            {number && number > 0 && (
                <div
                    className="player-jersey-number position-absolute top-50 start-50 translate-middle text-white fw-bold"
                    style={{ textShadow: '0 0 2px black, 0 0 2px black, 0 0 2px black, 0 0 2px black' }}
                >
                    {number}
                </div>
            )}
        </div>
    );
};

export default PlayerJersey;
