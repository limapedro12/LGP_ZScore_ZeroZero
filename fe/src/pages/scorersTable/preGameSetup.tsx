import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import TeamLogosRow from '../../components/scorersTable/preGameSetup/teamLogos';
import TeamPlayers from '../../components/scorersTable/preGameSetup/teamPlayers';
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

    if (
        !homeTeam ||
    !awayTeam ||
    homePlayers.length === 0 ||
    awayPlayers.length === 0
    ) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <Spinner animation="border" role="status" variant="primary" style={{ width: '4rem', height: '4rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <div style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#ffff' }}>Loading...</div>
            </div>
        );
    }
    return (
        <div>
            <TeamLogosRow homeTeam={homeTeam} awayTeam={awayTeam} />

            <Container fluid>
                <Row>
                    <Col xs={12} md={6}>
                        <TeamPlayers teamPlayers={homePlayers} teamColor={homeTeam?.color} />
                    </Col>
                    <Col xs={12} md={6}>
                        <TeamPlayers teamPlayers={awayPlayers} teamColor={awayTeam?.color} />
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
