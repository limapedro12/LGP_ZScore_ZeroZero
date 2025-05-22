import React, { useEffect, useState, useCallback } from 'react';
import CardSlider from './cards/cardSlider';
import ScoreHistorySlider from './scores/scoreHistorySlider';
import PlayerScoreSlider from './scores/playerScoreSlider';
import SquadSlider from './scores/squadSlider';
import { Sport } from '../../utils/cardUtils';
import apiManager from '../../api/apiManager';

const SCORE_TYPES: Record<string, string> = {
    'p': 'Pontos',
    'g': 'Golos',
    'default': 'Pontos',
};

interface SliderData {
  scores: boolean;
  players: boolean;
  cards: boolean;
}

interface SliderProps {
  sport: Sport;
  placardId: string;
  team: 'home' | 'away';
  sliderIndex?: number;
  onItemsCountChange?: (count: number) => void;
  teamColor?: string;
  teamId?: string;
  sliderData: SliderData;
}

const Slider: React.FC<SliderProps> = ({ sport, placardId, team, sliderIndex = 0, onItemsCountChange, teamColor, teamId, sliderData }) => {
    const [scoreType, setScoreType] = useState<string>(SCORE_TYPES.default);

    const fetchScoreType = useCallback(async () => {
        if (!sport) {
            setScoreType(SCORE_TYPES.default);
            return;
        }

        try {
            const response = await apiManager.getSportScoreType(sport);
            const typeCode = response.typeOfScore?.toLowerCase();

            setScoreType(typeCode && SCORE_TYPES[typeCode] ? SCORE_TYPES[typeCode] : SCORE_TYPES.default);
        } catch (error) {
            console.error('Error fetching score type:', error);
            setScoreType(SCORE_TYPES.default);
        }
    }, [sport]);

    useEffect(() => {
        fetchScoreType();
    }, [fetchScoreType]);


    const sliderItems: React.ReactNode[] = [
        ...(sliderData.cards ? [<CardSlider sport={sport} team={team} placardId={placardId} key="card-slider-item" />] : []),

        ...(sliderData.scores ?
            [<ScoreHistorySlider sport={sport} team={team} placardId={placardId} typeOfScore={scoreType} key="score-history-item" />] : []),

        ...((sliderData.scores && sliderData.players) ?
            [<PlayerScoreSlider sport={sport} team={team} placardId={placardId} typeOfScore={scoreType} key="player-score-item" />] : []),

        ...(sliderData.players ?
            [<SquadSlider team={team} key="squad-slider-item" teamColor={teamColor} teamId={teamId} placardId={placardId} />] : []),
    ];

    useEffect(() => {
        if (onItemsCountChange) {
            onItemsCountChange(sliderItems.length);
        }
    }, [sliderItems.length, onItemsCountChange]);

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
