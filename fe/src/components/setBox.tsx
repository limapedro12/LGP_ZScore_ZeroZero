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
            console.log('scoreData', scoreData);
            setPeriods(scoreData.periods || []);
            if ('currentPeriod' in scoreData && typeof scoreData.currentPeriod === 'number') {
                setCurrentPeriod(scoreData.currentPeriod);
            } else if (scoreData.periods && scoreData.periods.length > 0) {
                const lastActive = [...scoreData.periods].reverse().find((p) => p.homePoints > 0 || p.awayPoints > 0);
                setCurrentPeriod(lastActive?.period ?? 1);
            }
            setCurrentServer(scoreData.currentServer);
        }
    }, [scoreData]);

    useEffect(() => {
        const homeWins = periods.filter((p) => p.winner === 'home').length;
        const awayWins = periods.filter((p) => p.winner === 'away').length;
        setWins({ home: homeWins, away: awayWins });
    }, [periods]);


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
                        {`SET ${currentPeriod ?? 1}`}
                    </span>
                    {currentServer === 'away' && <div className="arrow arrow-right" />}
                </div>
            </div>
            <div className="set-box">
                <table>
                    <tbody>
                        {periods.slice(0, periods.length - 1).map((set) => {
                            const isFinished = currentPeriod !== undefined && set.period < currentPeriod;
                            return (
                                <tr key={set.period}>
                                    <td className="set-home">
                                        {isFinished ? set.homePoints : '-'}
                                    </td>
                                    <td className="set-label">
                                        {`SET ${set.period}`}
                                    </td>
                                    <td className="set-away">
                                        {isFinished ? set.awayPoints : '-'}
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
