// AppRouter.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import config from './config/config';
import HomePage from './pages/home';
import CardsPolling from './pages/cardsPolling';
import ScoreBoard from './pages/scoreBoard';

/**
 * AppRouter component
 * This component is responsible for routing the application
 * It uses the BrowserRouter component from react-router-dom to wrap the Routes and Route components
 * @returns {JSX.Element} AppRouter component
 */
const AppRouter = () => (
    <BrowserRouter basename={`${config.APP_BASE_ROUTE || ''}`}>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scoreboard/:gameType/:gameId" element={<ScoreBoard />} />
            <Route path="/cards/:sport/:placardId" element={<CardsPolling />} />
        </Routes>
    </BrowserRouter>
);

export default AppRouter;
