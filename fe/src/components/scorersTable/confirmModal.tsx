import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../../styles/confirmModal.scss';

interface ConfirmModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    show,
    onConfirm,
    onCancel,
    title = 'Confirmar Alterações?',
    confirmText = 'SIM',
    cancelText = 'NÃO',
}) => (
    <Modal show={show} onHide={onCancel} centered contentClassName="confirm-modal-content">
        <Modal.Body className="text-center">
            <h2 className="confirm-modal-title">
                {title}
            </h2>
            <div className="d-flex justify-content-center gap-4 mt-4">
                <Button
                    className="confirm-modal-confirm-btn"
                    variant="success"
                    onClick={onConfirm}
                >
                    {confirmText}
                </Button>
                <Button
                    className="confirm-modal-cancel-btn"
                    variant="danger"
                    onClick={onCancel}
                >
                    {cancelText}
                </Button>
            </div>
        </Modal.Body>
    </Modal>
);

export default ConfirmModal;
