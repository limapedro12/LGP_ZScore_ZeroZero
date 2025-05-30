import React, { useEffect, useState, useCallback } from 'react';
import CardSlider from './cards/cardSlider';
import ScoreHistorySlider from './scores/scoreHistorySlider';
import PlayerScoreSlider from './scores/playerScoreSlider';
import SquadSlider from './scores/squadSlider';
import FoulSlider from './fouls/foulSlider';
import apiManager, { SliderData, Sport as ApiSports } from '../../api/apiManager';
import { Sport as CardSports } from '../../utils/cardUtils';


const SCORE_TYPES: Record<string, string> = {
    'p': 'Pontos',
    'g': 'Golos',
    'default': 'Pontos',
};


interface SliderProps {
  sport: ApiSports;
  placardId: string;
  team: 'home' | 'away';
  teamColor?: string;
  sliderData: SliderData;
}

const  Slider: React.FC<SliderProps> = ({ sport, placardId, team, teamColor, sliderData }) => {
    const [scoreType, setScoreType] = useState<string>(SCORE_TYPES.default);
    const [currentIndex, setCurrentIndex] = useState(0);


    const teamLineup = team === 'home' ? sliderData.data.home.lineup : sliderData.data.away.lineup;


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

        ...(sliderData.hasData.players ?
            [
                <SquadSlider
                    team={team} key="squad-slider-item" teamColor={teamColor} players={teamLineup}
                />] : []),

        ...(sliderData.hasData.cards ? [
            <CardSlider
                sport={sport as CardSports}
                team={team} placardId={placardId} players={teamLineup} teamColor={teamColor} key="card-slider-item"
            />] : []),

        ...(sliderData.hasData.scores ?
            [<ScoreHistorySlider sport={sport} team={team} placardId={placardId} typeOfScore={scoreType} key="score-history-item" />] : []),

        ...((sliderData.hasData.scores && sliderData.hasData.players) ?
            [
                <PlayerScoreSlider
                    sport={sport} team={team} placardId={placardId}
                    teamColor={teamColor} typeOfScore={scoreType} key="player-score-item"
                />] : []),
        ...(sliderData.hasData.fouls ?
            [
                <FoulSlider
                    sport={sport}
                    team={team}
                    placardId={placardId}
                    players={teamLineup}
                    teamColor={teamColor}
                    key="foul-slider-item"
                />] : []),
    ];


    useEffect(() => {
        if (currentIndex >= sliderItems.length && sliderItems.length > 0) {
            setCurrentIndex(0);
        }
    }, [sliderItems.length, currentIndex]);

    useEffect(() => {
        if (sliderItems.length <= 1) {
            return () => {};
        }

        const interval = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % sliderItems.length);
        }, 10000);

        return () => window.clearInterval(interval);
    }, [sliderItems.length]);

    if (sliderItems.length === 0) {
        return null;
    }

    return (
        <div className="w-100 h-100 d-flex justify-content-center align-items-center">
            {sliderItems[currentIndex]}
        </div>
    );
};

export default Slider;
