import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.js';

import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { AuthProvider } from './context/AuthContext.js';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <MantineProvider>
                <App />
            </MantineProvider>
        </AuthProvider>
    </StrictMode>
);
