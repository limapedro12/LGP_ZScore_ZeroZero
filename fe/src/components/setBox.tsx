import React, { useEffect, useState } from 'react';
import { ScoreResponse, PeriodScore }  from '../api/apiManager';
import '../styles/setBox.scss';

interface SetBoxProps {
    scoreData?: ScoreResponse | null;
    timeoutActive?: boolean;
}

const SetBox: React.FC<SetBoxProps> = ({ scoreData, timeoutActive = false }) => {
    const [periods, setPeriods] = useState<PeriodScore[]>([]);
    const [currentPeriod, setCurrentPeriod] = useState<number>(1);
    const [wins, setWins] = useState<{ home: number, away: number }>({ home: 0, away: 0 });
    const [currentServer, setCurrentServer] = useState<'home' | 'away' | null>(null);

    useEffect(() => {
        if (scoreData) {
            setPeriods(scoreData.periods || []);

            if (scoreData.currentPeriod !== undefined) {
                setCurrentPeriod(scoreData.currentPeriod);
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
            {!timeoutActive && (
                <div className="row justify-content-center m-3">
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
            )}
            <div className="current-period-outer m-3">
                <div className="current-period-box">
                    {currentServer === 'home' && <div className="arrow arrow-left" />}
                    <span className="current-period">
                        {`SET ${currentPeriod}`}
                    </span>
                    {currentServer === 'away' && <div className="arrow arrow-right" />}
                </div>
            </div>
            <div className="set-box m-4">
                <table>
                    <tbody>
                        {periods.slice(0, periods.length - 1).map((set) => {
                            const isFinished = set.period < currentPeriod;
                            const homeWinner = set.winner === 'home';
                            const awayWinner = set.winner === 'away';

                            return (
                                <tr key={set.period}>
                                    <td className={`set-home ${homeWinner ? 'winner-score' : ''}`}>
                                        {isFinished ? set.homePoints : '-'}
                                    </td>
                                    <td className="set-label">
                                        {`SET ${set.period}`}
                                    </td>
                                    <td className={`set-away ${awayWinner ? 'winner-score' : ''}`}>
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
