import React from 'react';

interface PlayerJerseyProps {
  number: number;
}

const PlayerJersey: React.FC<PlayerJerseyProps> = ({ number }) => (
    <div className="d-flex justify-content-center align-items-center position-relative w-50">
        <img
            src={'/icons/tshirt-icon.png'}
            alt="Player Jersey"
            className="img-fluid"
        />
        <div
            className="position-absolute top-50 start-50 translate-middle text-white fw-bold fs-auto"
        >
            {number}
        </div>
    </div>
);

export default PlayerJersey;
