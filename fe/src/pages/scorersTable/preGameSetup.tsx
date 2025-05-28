import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import TeamLogosRow from '../../components/scorersTable/preGameSetup/teamLogos';
import TeamPlayers from '../../components/scorersTable/preGameSetup/teamPlayers';
import AddPlayerModal from '../../components/scorersTable/preGameSetup/addPlayerModal';
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
    const [playersPositions, setPlayersPositions] = useState<Record<string, string>>({});
    const [showAddPlayer, setShowAddPlayer] = useState(false);
    const [currentTeamForAddPlayer, setCurrentTeamForAddPlayer] = useState<'home' | 'away' | null>(null);
    const [allPlayersGame, setAllPlayersGame] = useState<ApiPlayer[]>([]);
    const [loading, setLoading] = useState(true);


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

                    setAllPlayersGame([...homePlayersData, ...awayPlayersData]);
                    setLoading(false);

                }

                const sportResponse = (await apiManager.getSportConfig(sport));
                const positions = sportResponse?.config?.positions || {};
                setPlayersPositions(positions);

            } catch (error) {
                console.error('Error fetching team information:', error);
                navigate('/gameList');
            }
        };
        fetchTeams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sport, placardId, navigate, location.state]);

    const handlePlayerAdded = (newPlayer: ApiPlayer) => {
        if (currentTeamForAddPlayer === 'home' && homeTeam) {
            const updatedHomePlayers = [...homePlayers, newPlayer];
            setHomePlayers(updatedHomePlayers);
        } else if (currentTeamForAddPlayer === 'away' && awayTeam) {
            const updatedAwayPlayers = [...awayPlayers, newPlayer];
            setAwayPlayers(updatedAwayPlayers);
        }

        setAllPlayersGame((prev) => [...prev, newPlayer]);
    };

    const showAddPlayerModal = (team: 'home' | 'away') => {
        setCurrentTeamForAddPlayer(team);
        setShowAddPlayer(true);
    };

    const handleSubmitRoster = async () => {
        try {
            setLoading(true);
            console.log('All players to be sent to backend:', allPlayersGame);

            await apiManager.updateLineup(placardId!, allPlayersGame);


            // Navigate to the scorers table
            navigate(`/scorersTable/${sport}/${placardId}`);
        } catch (error) {
            console.error('Error submitting team roster:', error);
        } finally {
            setLoading(false);
        }
    };

    if (
        !homeTeam ||
    !awayTeam ||
    Object.keys(playersPositions).length === 0 || loading
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
        <div className="pre-game-setup-container">
            <TeamLogosRow homeTeam={homeTeam} awayTeam={awayTeam} />

            <Container fluid>
                <Row>
                    <Col xs={12} md={6}>
                        <TeamPlayers
                            teamPlayers={homePlayers}
                            teamColor={homeTeam?.color}
                            onAddPlayer={() => showAddPlayerModal('home')}
                        />
                    </Col>
                    <Col xs={12} md={6}>
                        <TeamPlayers
                            teamPlayers={awayPlayers}
                            teamColor={awayTeam?.color}
                            onAddPlayer={() => showAddPlayerModal('away')}
                        />
                    </Col>
                </Row>

                <Row className="mt-5 mb-4">
                    <Col className="d-flex justify-content-center">
                        <Button
                            className="btn-lg submit-roster-btn"
                            onClick={handleSubmitRoster}
                            style={{
                                background: 'linear-gradient(135deg, #3a86ff 0%, #1e4c8a 100%)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(58, 134, 255, 0.2)',
                                padding: '0.75rem 2.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                            }}
                        >
                            Submit Team Roster
                        </Button>
                    </Col>
                </Row>
            </Container>

            {showAddPlayer && currentTeamForAddPlayer && (
                <AddPlayerModal
                    show={showAddPlayer}
                    onHide={() => setShowAddPlayer(false)}
                    positions={playersPositions}
                    teamId={currentTeamForAddPlayer === 'home' ? homeTeam.id : awayTeam.id}
                    onPlayerAdded={handlePlayerAdded}
                />
            )}
        </div>
    );
}
