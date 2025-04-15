/**
 * Function to format time in MM:SS format
 * @param seconds - The number of seconds to format
 * @returns {string} - The formatted time string in MM:SS format
 */
export const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return [
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0'),
    ].join(':');
};

/**
 * Formats the period display based on game type
 * @param gameType - The type of game (e.g., basketball, futsal)
 * @param period - The current period number
 * @returns {string} - The formatted period string
 */
export const gameTypesFormat = (gameType: string, period: number): string => {
    const gameTypeLower = gameType.toLowerCase();
    switch (gameTypeLower) {
        case 'basketball':
            return `${period}Q`;
        default:
            return `${period}P`;
    }
};
