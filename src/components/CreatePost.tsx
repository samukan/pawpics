// src/components/CreatePost.tsx
'use client';
import {useState} from 'react';
import {Card, CardContent} from './ui/card';
import {Avatar, AvatarImage} from './ui/avatar';
import {Textarea} from './ui/textarea';
import {Loader2Icon, SendIcon, ImageIcon, X} from 'lucide-react';
import {Button} from './ui/button';
import toast from 'react-hot-toast';
import {useAuth} from '@/components/AuthProvider';
import MediaUploader from './MediaUploader';
import {PostWithExtras} from '@/types';
import Image from 'next/image';

interface CreatePostProps {
  onPostCreated?: (post: PostWithExtras) => void;
}

function CreatePost({onPostCreated}: CreatePostProps) {
  const {user} = useAuth();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | ''>('');
  const [isPosting, setIsPosting] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);

  const handleMediaUploaded = (ufsUrl: string, type: string) => {
    setMediaUrl(ufsUrl);
    setMediaType(type.includes('image') ? 'image' : 'video');
    setShowMediaUploader(false); // Hide the uploader after successful upload
  };

  const clearMedia = () => {
    setMediaUrl('');
    setMediaType('');
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaUrl) return;

    setIsPosting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          image: mediaType === 'image' ? mediaUrl : undefined,
          video: mediaType === 'video' ? mediaUrl : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to create post');
      } else if (data.post) {
        const newPost: PostWithExtras = {
          id: data.post.id,
          content: data.post.content,
          image: mediaType === 'image' ? mediaUrl : undefined,
          video: mediaType === 'video' ? mediaUrl : undefined,
          authorId: data.post.authorId,
          authorUsername: user?.username || 'anonymous',
          authorName: user?.name || user?.username || 'anonymous',
          authorImage: user?.image || '/avatar.png',
          createdAt: data.post.createdAt,
          updatedAt: '',
          likesCount: 0,
          commentsCount: 0,
        };

        if (onPostCreated) {
          onPostCreated(newPost);
        }

        setContent('');
        setMediaUrl('');
        setMediaType('');
        setShowMediaUploader(false);
        toast.success('Post created successfully');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={user?.image || '/avatar.png'}
                alt="User avatar"
              />
            </Avatar>

            <div className="flex-1 space-y-4">
              {/* Text input always visible */}
              <Textarea
                placeholder="What's on your mind?"
                className="min-h-[100px] resize-none focus-visible:ring-1"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPosting}
              />

              {/* Media preview section */}
              {mediaUrl && (
                <div className="relative rounded-md overflow-hidden bg-muted">
                  {mediaType === 'video' ? (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full max-h-[300px] object-contain"
                    />
                  ) : (
                    <div className="relative h-[300px] w-full">
                      <Image
                        src={mediaUrl}
                        alt="Uploaded media"
                        fill
                        sizes="(max-width: 768px) 100vw, 500px"
                        className="object-contain"
                        unoptimized={mediaUrl.includes('utfs.io')} // Add unoptimized prop for uploadthing images
                      />
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                    onClick={clearMedia}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Media uploader section */}
              {showMediaUploader ? (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Upload Media</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMediaUploader(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <MediaUploader
                    onMediaUploaded={handleMediaUploaded}
                    mediaUrl={mediaUrl}
                    onClear={clearMedia}
                  />
                </div>
              ) : (
                !mediaUrl && (
                  <Button
                    variant="outline"
                    className="text-sm flex items-center gap-2 w-full"
                    onClick={() => setShowMediaUploader(true)}
                  >
                    <ImageIcon className="h-4 w-4" />
                    Add Image or Video
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={(!content.trim() && !mediaUrl) || isPosting}
              className="flex items-center gap-2"
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendIcon className="size-4" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatePost;
