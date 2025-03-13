export interface Post {
  id: number;
  authorId: number;
  content?: string;
  image?: string;
  video?: string; // Added video field
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface PostWithExtras extends Post {
  authorUsername: string;
  authorName?: string;
  authorImage?: string;
  isLiked?: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithAuthor extends Comment {
  authorUsername: string;
  authorName?: string;
  authorImage?: string;
}
