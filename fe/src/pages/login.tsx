import React, { useState } from 'react';
import '../styles/login.scss';
import apiManager from '../api/apiManager';
import LoginButton from '../components/loginButton';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        apiManager.login(username, password).then(() => {
            window.location.href = '/gameList';
        });
    };

    return (
        <div className="login-container">
            <h2>zscore</h2>
            <form onSubmit={handleSubmit}>
                <div className="login-form">
                    <h3>Login</h3>
                    <label htmlFor="username">Email/Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Enter Email/Username"
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter Password"
                    />
                    <button type="submit">Login</button>
                    <LoginButton />
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
