import React, { useEffect, useState } from 'react';
import PlayerJersey from '../playerJersey';
import { Modal } from 'react-bootstrap';
import '../../styles/substitutionModal.scss';
import apimanager, { Substitution, ApiPlayer } from '../../api/apiManager';

interface SubstitutionModalProps {
    show: boolean;
    onHide: () => void;
    substitution: Substitution | null;
}
const SubstitutionModal: React.FC<SubstitutionModalProps> = ({ show, onHide, substitution }) => {

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
                    <div className="player-in d-flex align-items-center mb-4">
                        <span className="triangle-green me-3" />
                        {playerIn && (
                            <>
                                <PlayerJersey number={parseInt(playerIn.number, 10)} color="#27ae60" />
                                <span className="player-name ms-3">
                                    {playerIn.name}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="player-out d-flex align-items-center">
                        <span className="triangle-red me-3" />
                        {playerOut && (
                            <>
                                <PlayerJersey number={parseInt(playerOut.number, 10)} color="#c0392b" />
                                <span className="player-name ms-3">
                                    {playerOut.name}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};
export default SubstitutionModal;
