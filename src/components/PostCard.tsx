// src/components/PostCard.tsx
'use client';

import {useState, useEffect} from 'react';
import {Card, CardContent, CardFooter, CardHeader} from './ui/card';
import {Avatar, AvatarImage} from './ui/avatar';
import {Button} from './ui/button';
import {Textarea} from './ui/textarea';
import {
  HeartIcon,
  MessageCircleIcon,
  SendIcon,
  Loader2Icon,
} from 'lucide-react';
import {formatDistanceToNow} from 'date-fns';
import {toast} from 'react-hot-toast';
import {DeleteAlertDialog} from './DeleteAlertDialog';
import Link from 'next/link';
import Image from 'next/image';
import {useAuth} from '@/components/AuthProvider';
import {PostWithExtras, CommentWithAuthor} from '@/types';
import {ImageModal} from './ImageModal';

interface PostCardProps {
  post: PostWithExtras;
  dbUserId: number | null;
  onPostDeleted?: (postId: number) => void;
}

function PostCard({post, dbUserId, onPostDeleted}: PostCardProps) {
  const {user, token} = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(post.likesCount || 0);
  const timeAgo = formatDistanceToNow(new Date(post.createdAt));
  // New state for image modal
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    setOptimisticLikes(post.likesCount || 0);
  }, [post.likesCount]);

  useEffect(() => {
    if (!token) {
      setHasLiked(false);
      setComments([]);
      setShowComments(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user || !token) return;

    const checkIfLiked = async () => {
      try {
        const response = await fetch(`/api/posts/${post.id}/userlike`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHasLiked(data.liked);
        }
      } catch (error) {
        console.error('Error checking like:', error);
      }
    };

    checkIfLiked();
  }, [user, post.id, token]); // Added token as a dependency

  const handleLike = async () => {
    if (!user || !token) {
      toast.error('You must be logged in to like');
      return;
    }

    setIsLiking(true);
    const previousLikes = optimisticLikes; // Store the previous value
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasLiked(data.liked);
        setOptimisticLikes(
          data.liked ? optimisticLikes + 1 : optimisticLikes - 1
        );
      } else {
        toast.error('Failed to toggle like');
        setOptimisticLikes(previousLikes); // Revert on error
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to toggle like');
      setOptimisticLikes(previousLikes); // Revert on error
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !token) {
      toast.error('You must be logged in to comment');
      return;
    }

    setIsCommenting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({content: newComment}),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.comment, ...comments]);
        setNewComment('');
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const toggleComments = async () => {
    setShowComments(!showComments);
    if (showComments) return;

    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      } else {
        toast.error('Failed to load comments');
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Post deleted successfully');
        onPostDeleted?.(post.id);
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0 flex flex-row items-start space-x-4">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={post.authorImage || '/avatar.png'}
            alt={post.authorUsername}
          />
        </Avatar>
        <div className="flex-1">
          <Link
            href={`/profile/${post.authorUsername}`}
            className="font-medium hover:underline"
          >
            {post.authorName || post.authorUsername}
          </Link>
          <p className="text-xs text-muted-foreground">{timeAgo} ago</p>
        </div>

        {dbUserId === post.authorId && (
          <DeleteAlertDialog
            isDeleting={isDeleting}
            onDelete={handleDeletePost}
          />
        )}
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.image && (
          <div
            className="mt-3 rounded-md overflow-hidden relative aspect-video cursor-pointer"
            onClick={() => setImageModalOpen(true)}
          >
            <Image
              src={post.image}
              alt="Post image"
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover hover:opacity-95 transition-opacity"
              priority={false}
              unoptimized={post.image.includes('utfs.io')}
            />
          </div>
        )}
        {post.video && (
          <div className="mt-3 rounded-md overflow-hidden">
            <video
              src={post.video}
              controls
              className="w-full object-cover"
              preload="metadata"
            />
          </div>
        )}

        {/* Image modal component */}
        {post.image && (
          <ImageModal
            isOpen={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
            imageUrl={post.image}
            alt={`Post by ${post.authorUsername}`}
          />
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col">
        <div className="flex items-center space-x-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
            onClick={handleLike}
            disabled={isLiking}
          >
            <HeartIcon
              className={`h-4 w-4 ${
                hasLiked ? 'fill-red-500 text-red-500' : ''
              }`}
            />
            <span>{optimisticLikes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
            onClick={toggleComments}
          >
            <MessageCircleIcon className="h-4 w-4" />
            <span>{post.commentsCount || 0}</span>
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 w-full">
            <div className="flex space-x-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] flex-1"
              />
              <Button
                onClick={handleAddComment}
                disabled={isCommenting || !newComment.trim()}
                className="self-end"
              >
                {isCommenting ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </Button>
            </div>

            {isLoadingComments ? (
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex animate-pulse space-x-2">
                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/4 rounded bg-muted"></div>
                      <div className="h-3 rounded bg-muted"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={comment.authorImage || '/avatar.png'}
                        alt={comment.authorUsername}
                      />
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted p-2 rounded-md">
                        <Link
                          href={`/profile/${comment.authorUsername}`}
                          className="font-medium text-sm hover:underline"
                        >
                          {comment.authorName || comment.authorUsername}
                        </Link>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default PostCard;
