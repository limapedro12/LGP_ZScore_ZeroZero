import React from 'react';
import '../styles/login.scss';
import LoginButton from '../components/loginButton';

const LoginPage: React.FC = () => (
    <div className="login-container">
        <h2>zscore</h2>
        <LoginButton />
    </div>
);

export default LoginPage;
