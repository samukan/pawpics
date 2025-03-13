import {User, FullUser} from './User';
import {Post, PostWithExtras, CommentWithAuthor} from './Post';
import {Notification} from './Notification';

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AuthResponse extends ApiResponse {
  token?: string;
  user?: User;
}

export interface PostResponse extends ApiResponse {
  post?: Post;
}

export interface CreatePostResponse extends PostResponse {
  post?: Post;
}

export interface GetPostsResponse extends ApiResponse {
  posts: PostWithExtras[];
}

export interface CommentResponse extends ApiResponse {
  comment?: CommentWithAuthor;
}

export interface NotificationsResponse extends ApiResponse {
  notifications: Notification[];
}

export interface UserProfileResponse extends ApiResponse {
  user: FullUser;
  posts: PostWithExtras[];
  isFollowing?: boolean;
}

// New interfaces for resolving type errors

export interface LikeResponse extends ApiResponse {
  liked: boolean;
  likesCount?: number;
}

export interface CommentListResponse extends ApiResponse {
  comments: CommentWithAuthor[];
}

export interface CountResult {
  count: number;
}

export interface FileUploadResponse {
  name: string;
  url: string;
  size: number;
  key: string;
  serverData?: Record<string, unknown>;
}

export interface FileUploadError {
  code: string;
  message: string;
  data?: Record<string, unknown>;
}

export type UploadReadyState = {
  ready: boolean;
  permittedFileInfo?: {
    maxFileSize: number;
    maxFileCount: number;
  };
};
