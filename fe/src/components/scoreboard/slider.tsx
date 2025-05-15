import React from 'react';
import CardSlider from './cards/cardSlider';
import ScoreHistorySlider from './scores/scoreHistorySlider';
import PlayerScoreSlider from './scores/playerScoreSlider';
import SquadSlider from './scores/squadSlider';
import { Sport } from '../../utils/cardUtils';

interface SliderProps {
  sport: Sport;
  placardId: string;
  team: 'home' | 'away';
  sliderIndex?: number;
}

const Slider: React.FC<SliderProps> = ({ sport, placardId, team, sliderIndex = 0 }) => {

    const sliderItems: React.ReactNode[] = [
        <CardSlider sport={sport} team={team} placardId={placardId} key="card-slider-item" />,
        <ScoreHistorySlider sport={sport} team={team} placardId={placardId} key="score-history-item" />,
        <PlayerScoreSlider sport={sport} team={team} placardId={placardId} key="player-score-item" />,
        <SquadSlider team={team} key="squad-slider-item" />,
    ];

    if (sliderItems.length === 0) {
        return null;
    }

    return (
        <div className="w-100 h-100 d-flex justify-content-center align-items-center">
            {sliderItems[sliderIndex]}
        </div>
    );
};

export default Slider;
