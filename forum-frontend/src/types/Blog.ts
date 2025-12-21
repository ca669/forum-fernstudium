export interface Post {
    id: number;
    title: string;
    body: string;
    author: string;
    createdAt: string;
}

export interface Comment {
    id: number;
    text: string;
    postId: number;
    author: string;
}
