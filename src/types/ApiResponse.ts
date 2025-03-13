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
