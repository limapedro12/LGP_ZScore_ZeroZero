import React, { useEffect, useState } from 'react';
import PlayerJersey from '../playerJersey';
import { Modal } from 'react-bootstrap';
import '../../styles/substitutionModal.scss';
import apimanager, { Substitution, ApiPlayer } from '../../api/apiManager';

interface SubstitutionModalProps {
    show: boolean;
    onHide: () => void;
    substitution: Substitution | null;
    teamColor?: string;
    logoUrl?: string;
}

const SubstitutionModal: React.FC<SubstitutionModalProps> = ({ show, onHide, substitution, teamColor, logoUrl }) => {
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
            dialogClassName="subst-modal-dialog"
            contentClassName="subst-modal-content"
            fullscreen
        >
            <div className="subst-modal-container">
                <div className="subst-modal-logo-section">
                    {logoUrl && (
                        <div className="subst-modal-logo-wrapper">
                            <img src={logoUrl} alt="Team Logo" className="subst-modal-logo" />
                        </div>
                    )}
                </div>
                <div className="subst-modal-content-section d-flex flex-column justify-content-center">
                    <div className="subst-modal-player subst-modal-player-in">
                        <div className="subst-modal-jersey p-2">
                            <PlayerJersey
                                number={playerIn?.number ? parseInt(playerIn.number, 10) : undefined}
                                color={teamColor || '#273E7C'}
                            />
                        </div>
                        <div className="subst-modal-info">
                            <h3 className="subst-modal-name">
                                {playerIn?.name || 'Player In'}
                            </h3>
                            <p className="subst-modal-position">
                                {playerIn?.position || ''}
                            </p>
                        </div>
                        <div className="subst-modal-status">
                            <span className="subst-modal-in-badge">ENTRA</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="divider-with-triangle w-100 d-flex flex-column align-items-center my-4">
                        <span className="triangle-green mb-2" />
                        <div className="substitution-divider" />
                        <span className="triangle-red mt-2" />
                    </div>

                    {/* Player Out */}
                    <div className="subst-modal-player subst-modal-player-out">
                        <div className="subst-modal-jersey p-2">
                            <PlayerJersey
                                number={playerOut?.number ? parseInt(playerOut.number, 10) : undefined}
                                color={teamColor || '#273E7C'}
                            />
                        </div>
                        <div className="subst-modal-info">
                            <h3 className="subst-modal-name">
                                {playerOut?.name || 'Player Out'}
                            </h3>
                            <p className="subst-modal-position">
                                {playerOut?.position || ''}
                            </p>
                        </div>
                        <div className="subst-modal-status">
                            <span className="subst-modal-out-badge">SAI</span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SubstitutionModal;
