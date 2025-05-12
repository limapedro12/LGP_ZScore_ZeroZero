import React, { ReactNode } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

interface BaseSliderProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const BaseSlider: React.FC<BaseSliderProps> = ({ title, children, className = '' }) => (
    <Container fluid className={`slider-component d-flex flex-column h-100 mt-2 ${className}`}>
        <Row className="slider-title-row mb-3">
            <Col className="text-center">
                <h3 className="slider-title m-0">
                    {title}
                </h3>
            </Col>
        </Row>
        <Row className="flex-grow-1">
            <Col className="d-flex flex-column align-items-center justify-content-start">
                <div className="content-container w-100">
                    {children}
                </div>
            </Col>
        </Row>
    </Container>
);

export default BaseSlider;
