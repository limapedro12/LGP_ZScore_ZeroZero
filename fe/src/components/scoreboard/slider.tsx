import React, { useState, useEffect } from 'react';
import CardSlider from './cards/cardSlider';
import ScoreHistorySlider from './scores/scoreHistorySlider';
import { Sport } from '../../utils/cardUtils';

interface SliderProps {
  sport: Sport;
  placardId: string;
  team: 'home' | 'away';
}

const Slider: React.FC<SliderProps> = ({ sport, placardId, team }) => {
    const sliderItems: React.ReactNode[] = [
        <CardSlider sport={sport} team={team} placardId={placardId} key="card-slider-item" />,
        <ScoreHistorySlider sport={sport} team={team} placardId={placardId} key="score-history-item" />,
    ];

    const [currentSliderIndex, setCurrentSliderIndex] = useState(0);

    useEffect(() => {
        if (sliderItems.length > 0) {
            const interval = setInterval(() => {
                setCurrentSliderIndex((prevIndex) => (prevIndex + 1) % sliderItems.length);
            }, 10000);
            return () => clearInterval(interval);
        }

        return undefined;
    }, [sliderItems.length]);

    if (sliderItems.length === 0) {
        return null;
    }

    return (
        <div className="w-100 h-100 d-flex justify-content-center align-items-center">
            {sliderItems[currentSliderIndex]}
        </div>
    );
};

export default Slider;
