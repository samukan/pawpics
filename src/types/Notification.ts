export interface Notification {
  id: number;
  userId: number;
  creatorId: number;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW';
  postId?: number;
  commentId?: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;

  // Derived properties from joins
  creatorName?: string;
  creatorUsername: string;
  creatorImage?: string;
  post?: {
    id: number;
    content?: string;
    image?: string;
  };
}
