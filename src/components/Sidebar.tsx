'use client';

import {useState, useEffect} from 'react';
import {Skeleton} from './ui/skeleton';
import {Avatar, AvatarImage} from './ui/avatar';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';
import {Separator} from './ui/separator';
import {Link2, Mail} from 'lucide-react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {useAuth} from '@/components/AuthProvider';

// Updated FullUser model
interface FullUser {
  id: number;
  email: string;
  username: string;
  name: string;
  bio?: string;
  image?: string;
  location?: string;
  following: number;
  followers: number;
}

export default function Sidebar() {
  const {user, token} = useAuth();
  const [fullUser, setFullUser] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Reset state when token changes
  useEffect(() => {
    if (!token) {
      setFullUser(null);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Only fetch if we have both a user and a token
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFullUser(data.user);
        } else {
          console.error('Failed to fetch user');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user, token]); // Depend on both user and token

  if (loading) {
    return (
      <div className="sticky top-20">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="w-full">
                <Skeleton className="h-0.5 w-full my-4" />
                <div className="flex justify-between">
                  <div>
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-0.5 w-full my-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !fullUser) {
    return <UnAuthenticatedSidebar />;
  }

  return (
    <div className="sticky top-20">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Link
              href={`/profile/${fullUser.username}`}
              className="flex flex-col items-center justify-center"
            >
              <Avatar className="w-20 h-20 border-2">
                <AvatarImage
                  src={fullUser.image || '/avatar.png'}
                  alt={fullUser.username}
                />
              </Avatar>

              <div className="mt-4 space-y-1">
                <h3 className="font-semibold">{fullUser.name}</h3>
                <p className="text-sm text-muted-foreground">
                  @{fullUser.username}
                </p>
              </div>
            </Link>

            {fullUser.bio && (
              <p className="mt-3 text-sm text-muted-foreground">
                {fullUser.bio}
              </p>
            )}

            <div className="w-full">
              <Separator className="my-4" />
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{fullUser.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="font-medium">{fullUser.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
              </div>
              <Separator className="my-4" />
            </div>

            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{fullUser.email}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Link2 className="w-4 h-4 mr-2 shrink-0" />
                <a
                  href={`http://localhost:3000/profile/${fullUser.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                >
                  localhost:3000/{fullUser.username}
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UnAuthenticatedSidebar() {
  return (
    <div className="sticky top-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Welcome to PawPics!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">
            Login to access your profile and connect with others.
          </p>
          <Button asChild className="w-full" variant="outline">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild className="w-full mt-2" variant="default">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
