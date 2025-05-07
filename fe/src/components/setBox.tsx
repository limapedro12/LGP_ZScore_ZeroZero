import React, { useEffect, useState } from 'react';
import { ScoreResponse, PeriodScore }  from '../api/apiManager';
import '../styles/setBox.scss';

interface SetBoxProps {
    scoreData?: ScoreResponse | null;
}

const SetBox: React.FC<SetBoxProps> = ({ scoreData }) => {
    const [periods, setPeriods] = useState<PeriodScore[]>([]);
    const [currentPeriod, setCurrentPeriod] = useState<number | undefined>(undefined);
    const [wins, setWins] = useState<{ home: number, away: number }>({ home: 0, away: 0 });
    const [currentServer, setCurrentServer] = useState<'home' | 'away' | null>(null);

    useEffect(() => {
        if (scoreData) {
            setPeriods(scoreData.periods || []);
            if ('currentPeriod' in scoreData && typeof scoreData.currentPeriod === 'number') {
                setCurrentPeriod(scoreData.currentPeriod);
            } else if (scoreData.periods && scoreData.periods.length > 0) {
                const lastActive = [...scoreData.periods].reverse().find((p) => p.homePoints > 0 || p.awayPoints > 0);
                setCurrentPeriod(lastActive?.period ?? undefined);
            }
            setCurrentServer(scoreData.currentServer);
        }
    }, [scoreData]);

    useEffect(() => {
        const homeWins = periods.filter((p) => p.winner === 'home').length;
        const awayWins = periods.filter((p) => p.winner === 'away').length;
        setWins({ home: homeWins, away: awayWins });
    }, [periods]);


    const renderPoints = (points: number, isFinished: boolean) => {
        if (isFinished) {
            return points;
        }
        if (points > 0) {
            return points;
        }
        return '-';
    };

    return (
        <>
            <div className="row justify-content-center">
                <div className="col-12 d-flex justify-content-center align-items-center">
                    <div className="sets-results mb-2">
                        <span className="sets-home">
                            {wins.home}
                        </span>
                        <span className="sets-separator"> - </span>
                        <span className="sets-away">
                            {wins.away}
                        </span>
                    </div>
                </div>
            </div>
            <div className="current-period-outer">
                <div className="current-period-box d-flex align-items-center justify-content-center position-relative">
                    {currentServer === 'home' && <div className="arrow arrow-left" />}
                    <span className="current-period">
                        {currentPeriod !== undefined ? `SET ${currentPeriod}` : 'SET 0'}
                    </span>
                    {currentServer === 'away' && <div className="arrow arrow-right" />}
                </div>
            </div>
            <div className="set-box">
                <table>
                    <tbody>
                        {periods.map((set) => {
                            const isFinished = currentPeriod !== undefined && set.period < currentPeriod;
                            return (
                                <tr key={set.period} className={currentPeriod === set.period ? 'active-set' : ''}>
                                    <td className="set-home">
                                        {renderPoints(set.homePoints, isFinished)}
                                    </td>
                                    <td className="set-label">
                                        {`SET ${set.period}`}
                                    </td>
                                    <td className="set-away">
                                        {renderPoints(set.awayPoints, isFinished)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default SetBox;
