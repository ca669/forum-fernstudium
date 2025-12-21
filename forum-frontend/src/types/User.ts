export interface User {
    id: string;
    username: string;
    role: 'user' | 'moderator' | 'admin';
}

export interface UserCredentials {
    username: string;
    password: string;
}