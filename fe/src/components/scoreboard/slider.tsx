import React, { useState, useEffect } from 'react';
import CardSlider from './cards/cardSlider';
import ScoreHistorySlider from './scores/scoreHistorySlider';
import PlayerScoreSlider from './scores/playerScoreSlider';
import SquadSlider from './scores/squadSlider';
import { Sport } from '../../utils/cardUtils';

interface SliderProps {
  sport: Sport;
  placardId: string;
  team: 'home' | 'away';
}

const Slider: React.FC<SliderProps> = ({ sport, placardId, team }) => {
    const [currentSliderIndex, setCurrentSliderIndex] = useState(0);
    const [waitingForSquadComplete, setWaitingForSquadComplete] = useState(false);

    const handleSquadComplete = () => {
        if (waitingForSquadComplete) {
            setWaitingForSquadComplete(false);
            setCurrentSliderIndex((prevIndex) => (prevIndex + 1) % sliderItems.length);
        }
    };

    const sliderItems: React.ReactNode[] = [
        <CardSlider sport={sport} team={team} placardId={placardId} key="card-slider-item" />,
        <ScoreHistorySlider sport={sport} team={team} placardId={placardId} key="score-history-item" />,
        <PlayerScoreSlider sport={sport} team={team} placardId={placardId} key="player-score-item" />,
        <SquadSlider team={team} onComplete={handleSquadComplete} key="squad-slider-item" />,
    ];

    useEffect(() => {
        if (sliderItems.length > 0) {
            const interval = setInterval(() => {
                if (currentSliderIndex === 3) {
                    setWaitingForSquadComplete(true);
                } else {
                    setCurrentSliderIndex((prevIndex) => (prevIndex + 1) % sliderItems.length);
                }
            }, 10000);
            return () => clearInterval(interval);
        }

        return undefined;
    }, [sliderItems.length, currentSliderIndex]);

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
