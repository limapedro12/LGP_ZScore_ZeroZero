import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TeamLogosRow from '../../components/scorersTable/preGameSetup/teamLogos';
import apiManager, { ApiTeam, ApiGame, ApiPlayer } from '../../api/apiManager';
import '../../styles/preGameSetup.scss';

export default function PreGameSetupPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { sport, placardId } = useParams<{ sport: string, placardId: string }>();

    const [homeTeam, setHomeTeam] = useState<ApiTeam | null>(null);
    const [awayTeam, setAwayTeam] = useState<ApiTeam | null>(null);
    const [homePlayers, setHomePlayers] = useState<ApiPlayer[]>([]);
    const [awayPlayers, setAwayPlayers] = useState<ApiPlayer[]>([]);

    useEffect(() => {
        const fetchTeams = async () => {
            if (!sport || !placardId) {
                console.error('Invalid state passed to PreGameSetupPage:', location.state);
                navigate('/gameList');
                return;
            }
            try {
                const placardInfo: ApiGame = await apiManager.getPlacardInfo(placardId, sport);
                const home = await apiManager.getTeamInfo(placardInfo.firstTeamId);
                const away = await apiManager.getTeamInfo(placardInfo.secondTeamId);
                setHomeTeam(home);
                setAwayTeam(away);


                const homePlayersData = await apiManager.getTeamLineup(placardId, home.id);
                const awayPlayersData = await apiManager.getTeamLineup(placardId, away.id);

                if (Array.isArray(homePlayersData) && Array.isArray(awayPlayersData)) {
                    setHomePlayers(homePlayersData);
                    setAwayPlayers(awayPlayersData);
                    console.log('Home Players:', homePlayers);
                    console.log('Away Players:', awayPlayers);
                }

            } catch (error) {
                console.error('Error fetching team information:', error);
                navigate('/gameList');
            }
        };
        fetchTeams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sport, placardId, navigate, location.state]);

    useEffect(() => {
        if (homePlayers.length > 0 || awayPlayers.length > 0) {
            console.log('Home Players:', homePlayers);
            console.log('Away Players:', awayPlayers);
        }
    }, [homePlayers, awayPlayers]);

    if (!homeTeam || !awayTeam) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <TeamLogosRow homeTeam={homeTeam} awayTeam={awayTeam} />
        </div>
    );
}
