import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import { User, UserCredentials } from '../types/User';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: UserCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Beim Starten der App: Prüfen ob User eingeloggt ist
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/me');
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: UserCredentials) => {
        const response = await api.post('/login', credentials);

        if (response.data.user) {
            setUser(response.data.user);
        } else {
            await checkAuth();
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
            setUser(null);
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
    );
}

// Custom Hook für einfachen Zugriff
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
