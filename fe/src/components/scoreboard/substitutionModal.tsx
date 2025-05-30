import React, { useEffect, useState } from 'react';
import PlayerJersey from '../playerJersey';
import { Modal, Row, Col } from 'react-bootstrap';
import '../../styles/substitutionModal.scss';
import apimanager, { Substitution, ApiPlayer } from '../../api/apiManager';

interface SubstitutionModalProps {
    show: boolean;
    onHide: () => void;
    substitution: Substitution | null;
    teamColor?: string;
}
const SubstitutionModal: React.FC<SubstitutionModalProps> = ({ show, onHide, substitution, teamColor }) => {

    const [playerIn, setPlayerIn] = useState<ApiPlayer | null>(null);
    const [playerOut, setPlayerOut] = useState<ApiPlayer | null>(null);

    useEffect(() => {
        if (substitution) {
            apimanager.getPlayerInfo(substitution.playerInId)
                .then((player) => setPlayerIn(player))
                .catch((error) => console.error('Error fetching player in:', error));

            apimanager.getPlayerInfo(substitution.playerOutId)
                .then((player) => setPlayerOut(player))
                .catch((error) => console.error('Error fetching player out:', error));
        }
    }, [substitution]);
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            dialogClassName="substitution-modal"
            contentClassName="substitution-modal-content"
            backdropClassName="substitution-modal-backdrop"
        >
            <Modal.Body>
                <div className="substitution-content">
                    <Row className="align-items-center player-in mb-4 w-100 gx-0 justify-content-center">
                        <Col
                            className="d-flex justify-content-between align-items-center player-row-content"
                            style={{ width: '90%' }}
                        >
                            {playerIn && (
                                <>
                                    <span className="player-name">
                                        {playerIn.name}
                                    </span>
                                    <PlayerJersey number={parseInt(playerIn.number, 10)} color={teamColor || '#27ae60'} />
                                </>
                            )}
                        </Col>
                    </Row>
                    <div className="divider-with-triangle w-100 d-flex flex-column align-items-center my-2">
                        <span className="triangle-green mb-2" />
                        <div className="substitution-divider" />
                        <span className="triangle-red mt-2" />
                    </div>
                    <Row className="align-items-center player-out w-100 gx-0 justify-content-center">
                        <Col
                            className="d-flex justify-content-between align-items-center player-row-content"
                            style={{ width: '90%' }}
                        >
                            {playerOut && (
                                <>
                                    <span className="player-name">
                                        {playerOut.name}
                                    </span>
                                    <PlayerJersey number={parseInt(playerOut.number, 10)} color={teamColor || '#c0392b'} />
                                </>
                            )}
                        </Col>
                    </Row>
                </div>
            </Modal.Body>
        </Modal>
    );
};
export default SubstitutionModal;
