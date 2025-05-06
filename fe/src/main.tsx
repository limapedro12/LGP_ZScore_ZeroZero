import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from 'react-bootstrap';
ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
    .render(
        <ThemeProvider
            breakpoints={['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs']}
            minBreakpoint="xxs"
        >
            <App />
        </ThemeProvider>
    );
