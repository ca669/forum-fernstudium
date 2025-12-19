import { User } from './User';

export interface Post {
    id: number;
    title: string;
    content: string;
    author: User;
    createdAt: string;
}
