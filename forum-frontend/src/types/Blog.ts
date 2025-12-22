// ------ Blog Posts ------
export interface NewPost {
    title: string;
    body: string;
    status: 'draft' | 'published';
    studyProgramId?: number;
}

export interface Post {
    id: number;
    title: string;
    body: string;
    author: string;
    studyProgram?: string;
    createdAt: string;
}

export interface PostDetail extends Post {
    comments: Comment[];
}

// ------ Kommentare ---------
export interface Comment {
    id: number;
    text: string;
    author: string;
}

export interface NewComment {
    text: string;
    postId: number;
}

// ------ Studiengang ------
export interface StudyProgram {
    id: number;
    name: string;
}
