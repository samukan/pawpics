'use client';
import {HomeIcon, UserIcon} from 'lucide-react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {ModeToggle} from '@/components/DarkMode';
import {useAuth} from '@/components/AuthProvider';

function DesktopNavbar() {
  const {user, signOut} = useAuth();

  return (
    <div className="hidden md:flex items-center space-x-4">
      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <ModeToggle />
      {user ? (
        <>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href={`/profile/${user.username}`}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={signOut}
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button variant="default" asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      )}
    </div>
  );
}

export default DesktopNavbar;
