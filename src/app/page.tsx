'use client';

import {useState, useEffect, useCallback} from 'react';
import {useAuth} from '@/components/AuthProvider';
import PostCard from '@/components/PostCard';
import CreatePost from '@/components/CreatePost';
import {PostWithExtras} from '@/types';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {RefreshCw} from 'lucide-react';

export default function HomePage() {
  const {user, token} = useAuth();
  const [posts, setPosts] = useState<PostWithExtras[]>([]);
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('global');
  const [loading, setLoading] = useState(false);

  // Reset state when token changes
  useEffect(() => {
    if (!token) {
      setPosts([]);
      setDbUserId(null);
    }
  }, [token]);

  // Fetch posts based on the selected feed
  const fetchPosts = useCallback(
    async (feedType = activeTab) => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/posts?feed=${feedType}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    },
    [token, activeTab]
  );

  const fetchDbUserId = useCallback(async () => {
    if (!user || !token) return;

    try {
      const response = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDbUserId(data.user.id);
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  }, [user, token]);

  // Fetch initial data
  useEffect(() => {
    if (token) {
      fetchPosts();
      fetchDbUserId();
    }
  }, [token, fetchPosts, fetchDbUserId]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    fetchPosts(value);
  };

  const addNewPost = (newPost: PostWithExtras) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handlePostDeleted = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  const handleRefresh = () => {
    fetchPosts(activeTab);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <CreatePost onPostCreated={addNewPost} />

      <div className="flex items-center justify-between">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="ghost"
          size="icon"
          className="ml-2"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading && posts.length === 0 ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                </div>
              </div>
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              dbUserId={dbUserId}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed rounded-lg">
          {activeTab === 'following' ? (
            <>
              <p className="text-muted-foreground">
                No posts from people you follow yet.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Follow some users or switch to the global feed to see posts.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              No posts available. Be the first to post!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
