// AppRouter.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import config from './config/config';
import HomePage from './pages/home';
import ScoreBoard from './pages/scoreBoard';
import LoginPage from './pages/login';
import ScorersTable from './pages/scorersTable/scorersTable';
import SelectCardPage from './pages/scorersTable/selectCard';
import CardSelectPlayerPage from './pages/scorersTable/cardSelectPlayer';

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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/scoreboard/:sport/:placardId" element={<ScoreBoard />} />
            <Route path="/scorersTable/:sport/:placardId" element={<ScorersTable />} />
            <Route
                path="/scorersTable/:sport/:placardId/selectCard/:teamTag"
                element={<SelectCardPage />}
            />
            <Route
                path="/scorersTable/:sport/:placardId/selectCard/:teamTag/:cardType/cardSelectPlayer"
                element={<CardSelectPlayerPage />}
            />
        </Routes>
    </BrowserRouter>
);

export default AppRouter;
