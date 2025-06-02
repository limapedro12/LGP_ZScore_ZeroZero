import React, { useEffect, useState } from 'react';
import apiManager from '../api/apiManager';
import '../styles/loginButton.scss';

const LoginButton: React.FC = () => {
    const [username, setUsername] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const checkLoginStatus = async () => {
        try {
            const response = await apiManager.checkLoginStatus();
            if (response && response.username) {
                setUsername(response.username);
            } else {
                setUsername('');
            }
        } catch (error) {
            console.error('Error checking login status:', error);
            setUsername('');
        }
    };

    const handleExternalLogin = () => {
        const origin = window.location.origin;
        console.log('Origin:', origin);
        if (!origin || origin === 'null') {
            return;
        }
        const redirectUri = encodeURIComponent(origin);
        const externalLoginUrl = `https://www.zerozero.pt/redir_zzlive_login.php?callback_uri=${redirectUri}`;
        try {
            window.location.href = externalLoginUrl;
        } catch (error) {
            console.error('Error during external login:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await apiManager.logout();
            setUsername('');
            window.location.href = '/gameList';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isMenuOpen &&
                menuRef.current && !menuRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('oauth_token_zz');
        if (token) {
            const checkToken = async () => {
                const response = await apiManager.checkToken(token);
                if (response) {
                    console.log('Token response:', response);
                    if (response.success) {
                        window.location.href = '/gameList';
                    }
                }
            };
            checkToken();
        }
    });
    checkLoginStatus();
    // Show the username and a menu to logout
    if (username && username !== '') {
        return (
            <div className="logout-button">
                <button
                    onClick={() => {
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    className="username-button"
                >
                    {username}
                </button>
                {isMenuOpen && (
                    <div className="menu" ref={menuRef}>
                        <ul>
                            <li
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    handleLogout();
                                }}
                            >
                                Logout
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div className="login-button">
                <button onClick={handleExternalLogin}>
                    <img src="https://zerozero.live/static/media/logo48x48.82f90bea.svg" alt="Login Icon" />
                    Iniciar sessão com zerozero
                </button>
            </div>
        );
    }
};

export default LoginButton;
