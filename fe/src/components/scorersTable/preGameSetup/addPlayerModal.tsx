import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { ApiPlayer } from '../../../api/apiManager';

interface AddPlayerModalProps {
  show: boolean;
  onHide: () => void;
  positions: Record<string, string>;
  teamId: string;
  onPlayerAdded: (newPlayer: ApiPlayer) => void;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ show, onHide, positions, teamId, onPlayerAdded }) => {
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [position, setPosition] = useState('');

    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{1,50}$/u;
    const positionAcronymRegex = /^[A-Z]{1,10}$/;

    const isNameValid = nameRegex.test(name.trim());
    const isNumberValid = /^\d{1,2}$/.test(number) && Number(number) >= 0 && Number(number) <= 99;
    const isPositionValid = position && positionAcronymRegex.test(position);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isNameValid || !isNumberValid || !isPositionValid) {
            return;
        }

        const newPlayer: ApiPlayer = {
            id: `temp-${Date.now()}`,
            playerId: `temp-${Date.now()}`,
            isStarting: 'false',
            name: name.trim(),
            number: number,
            position: Object.keys(positions).find((key) => positions[key] === position) || '',
            // eslint-disable-next-line camelcase
            position_acronym: position,
            teamId: teamId,
            newPlayer: true,
        };

        onPlayerAdded(newPlayer);

        setName('');
        setNumber('');
        setPosition('');
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="add-player-modal">
            <Modal.Header closeButton>
                <Modal.Title>Adicionar Jogador</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="playerName">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduz o nome do jogador"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            isInvalid={!!name && !isNameValid}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            O nome deve ter 1-50 letras, espaços, hífens ou apóstrofos.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="playerNumber">
                        <Form.Label>Número</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Número"
                            value={number}
                            onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                            min={0}
                            max={99}
                            isInvalid={!!number && !isNumberValid}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            O número deve estar entre 0 e 99.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="playerPosition">
                        <Form.Label>Posição</Form.Label>
                        <div className="position-buttons-grid">
                            {Object.entries(positions).map(([name, acronym]) => (
                                <button
                                    key={acronym}
                                    type="button"
                                    className={`position-btn pregame-position-select-btn${position === acronym ? ' selected' : ''}`}
                                    onClick={() => setPosition(acronym)}
                                >
                                    {name}
                                    {' '}
                                    <span className="text-muted mx-1">
                                        (
                                        {acronym}
                                        )
                                    </span>
                                </button>
                            ))}
                        </div>
                        {!isPositionValid && position && (
                            <div className="invalid-feedback d-block">
                                Acrónimo da posição inválido.
                            </div>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-cancel" onClick={onHide} type="button">
                        Cancelar
                    </Button>
                    <Button
                        className="btn-primary"
                        type="submit"
                        disabled={!isNameValid || !isNumberValid || !isPositionValid}
                    >
                        Adicionar Jogador
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddPlayerModal;
