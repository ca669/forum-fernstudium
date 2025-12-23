export interface User {
    id: string;
    username: string;
    role: 'user' | 'mod' | 'admin';
}

export interface UserCredentials {
    username: string;
    password: string;
}
