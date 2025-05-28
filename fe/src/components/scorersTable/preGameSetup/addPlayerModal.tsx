import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface AddPlayerModalProps {
  show: boolean;
  onHide: () => void;
  positions: Record<string, string>;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ show, onHide, positions }) => {
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [position, setPosition] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="add-player-modal">
            <Modal.Header closeButton>
                <Modal.Title>Add Player</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="playerName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter player name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="playerNumber">
                        <Form.Label>Number</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            min={0}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="playerPosition">
                        <Form.Label>Position</Form.Label>
                        <div className="position-buttons-grid">
                            {Object.entries(positions).map(([name, acronym]) => (
                                <button
                                    key={acronym}
                                    type="button"
                                    className={`position-btn${position === acronym ? ' selected' : ''}`}
                                    onClick={() => setPosition(acronym)}
                                >
                                    {name}
                                    {' '}
                                    <span className="text-muted">
                                        (
                                        {acronym}
                                        )
                                    </span>
                                </button>
                            ))}
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-cancel" onClick={onHide} type="button">
                        Cancel
                    </Button>
                    <Button className="btn-primary" type="submit" disabled={!name || !number || !position}>
                        Add Player
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddPlayerModal;
