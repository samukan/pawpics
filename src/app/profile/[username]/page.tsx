'use client';

import {useState, useEffect} from 'react';
import {useAuth} from '@/components/AuthProvider';
import {useParams} from 'next/navigation';
import {Card, CardContent} from '@/components/ui/card';
import {Avatar, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Separator} from '@/components/ui/separator';
import {PostWithExtras} from '@/types';
import PostCard from '@/components/PostCard';
import {Mail, Link2} from 'lucide-react';
import {toast} from 'react-hot-toast';

interface ProfileUser {
  id: number;
  username: string;
  name?: string;
  email: string;
  bio?: string;
  image?: string;
  location?: string;
  following: number;
  followers: number;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const {user: currentUser, token} = useAuth();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<PostWithExtras[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfileUser = async () => {
      if (!token) return;

      try {
        const response = await fetch(`/api/user/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfileUser(data.user);
          setFollowerCount(data.user.followers);
        } else {
          console.error('Failed to fetch profile');
          toast.error('Could not load profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const fetchPosts = async () => {
      if (!token) return;

      try {
        const response = await fetch(`/api/user/${username}/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        } else {
          console.error('Failed to fetch posts');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    const checkFollowStatus = async () => {
      if (!token || isOwnProfile) return;

      try {
        const response = await fetch(`/api/user/${username}/follow`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.following);
          setFollowerCount(data.followerCount);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProfileUser(),
        fetchPosts(),
        checkFollowStatus(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [username, token, isOwnProfile]);

  const handleFollow = async () => {
    if (!token) {
      toast.error('You must be logged in to follow users');
      return;
    }

    setFollowLoading(true);
    try {
      const response = await fetch(`/api/user/${username}/follow`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        setFollowerCount(data.followerCount);
        toast.success(
          data.following ? `Following ${username}` : `Unfollowed ${username}`
        );
      } else {
        toast.error('Failed to update follow status');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 animate-pulse">
              <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-800"></div>
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-4 animate-pulse"
            >
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
        <p>
          The user you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-2">
              <AvatarImage
                src={profileUser.image || '/avatar.png'}
                alt={profileUser.username}
              />
            </Avatar>

            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <h1 className="text-2xl font-bold">
                  {profileUser.name || profileUser.username}
                </h1>
                <p className="text-muted-foreground">@{profileUser.username}</p>
              </div>

              {profileUser.bio && <p className="text-sm">{profileUser.bio}</p>}

              {!isOwnProfile && (
                <Button
                  onClick={handleFollow}
                  disabled={followLoading}
                  variant={isFollowing ? 'outline' : 'default'}
                >
                  {followLoading
                    ? 'Processing...'
                    : isFollowing
                    ? 'Unfollow'
                    : 'Follow'}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-around text-center">
              <div>
                <p className="font-medium">{posts.length}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="font-medium">{followerCount}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="font-medium">{profileUser.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{profileUser.email}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Link2 className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">
                  localhost:3000/{profileUser.username}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  dbUserId={currentUser?.id || null}
                  onPostDeleted={(postId) => {
                    setPosts(posts.filter((p) => p.id !== postId));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No posts yet.</p>
              {isOwnProfile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Share your first post to get started!
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
