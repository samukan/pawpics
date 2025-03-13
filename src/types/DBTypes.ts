import {RowDataPacket} from 'mysql2';

export interface User extends RowDataPacket {
  id: number;
  email: string;
  username: string;
  name: string | null;
  description?: string | null;
  bio?: string | null;
  image?: string | null;
  location?: string | null;
  following?: number;
  followers?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post extends RowDataPacket {
  id: number;
  authorId: number;
  content?: string | null;
  image?: string | null;
  video?: string | null;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface PostWithExtras extends Post {
  authorUsername: string;
  authorName?: string | null;
  authorImage?: string | null;
  isLiked?: boolean;
}

export interface Comment extends RowDataPacket {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithAuthor extends Comment {
  authorUsername: string;
  authorName?: string | null;
  authorImage?: string | null;
}

// Type for follows table result
export interface Follow extends RowDataPacket {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
}

// Type for like table result
export interface Like extends RowDataPacket {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
}

// Common query result for counts
export interface CountResult extends RowDataPacket {
  followers: number;
  following?: number;
  count?: number;
}
