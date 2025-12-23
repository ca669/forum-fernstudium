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
    status: 'draft' | 'published';
    studyProgram?: string;
    createdAt: string;
}

export interface PostDetailed extends Post {
    comments: Comment[];
}

// ------ Kommentare ---------
export interface Comment {
    id: number;
    text: string;
    author: string;
    createdAt: string;
}

export interface NewComment {
    text: string;
}

// ------ Studiengang ------
export interface StudyProgram {
    id: number;
    name: string;
}
