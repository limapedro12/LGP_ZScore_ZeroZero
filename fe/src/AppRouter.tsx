import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import config from './config/config';
import HomePage from './pages/home';
import ScoreBoard from './pages/scoreBoard';
import LoginPage from './pages/login';
import GameList from './pages/gameList';
import ScorersTable from './pages/scorersTable/scorersTable';
import SelectCardPage from './pages/scorersTable/selectCard';
import GameOptions from './pages/gameOptions';
import PlayerSelectionPage from './pages/scorersTable/playerSelection';
import PointValueSelection from './pages/scorersTable/pointValueSelection';
import SelectView from './pages/selectView';
import TimeAdjustment from './pages/scorersTable/timeAdjustment';
import ShotClockAdjustment from './pages/scorersTable/shotClockAdjustment';

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
            <Route path="/gameList" element={<GameList />} />
            <Route path="/scorersTable/:sport/:placardId" element={<ScorersTable />} />
            <Route path="/gameOptions/:sport/:id" element={<GameOptions />} />
            <Route path="/scorersTable/:sport/:placardId/selectCard/:teamTag" element={<SelectCardPage />} />
            <Route path="/scorersTable/:sport/:placardId/playerSelection/:teamTag" element={<PlayerSelectionPage />} />
            <Route path="/scorersTable/:sport/:placardId/clockAdjustment" element={<TimeAdjustment />} />
            <Route path="/scorersTable/:sport/:placardId/shotClockAdjustment" element={<ShotClockAdjustment />} />
            <Route path="/scorersTable/:sport/:placardId/pointValueSelection/:teamTag" element={<PointValueSelection />} />
            <Route path="/selectView" element={<SelectView />} />
        </Routes>
    </BrowserRouter>
);

export default AppRouter;
