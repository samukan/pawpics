'use client';

import {User} from '@/types'; // Using your existing type
import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {useRouter} from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (token: string, userData?: User) => void;
  signOut: () => void;
  token: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
  token: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // This effect runs once on component mount to initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      // If no token, ensure we mark loading as complete
      setLoading(false);
    }
  }, []);

  // This effect runs whenever the token changes to fetch user data
  useEffect(() => {
    if (!token) {
      setUser(null);
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
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            // Invalid response but successful HTTP status
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } else {
          // API reported error (e.g., 401 Unauthorized)
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user details', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]); // This effect depends on the token

  const signIn = (newToken: string, userData?: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);

    if (userData) {
      setUser(userData);
    }

    router.refresh();
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/signin');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{user, loading, signIn, signOut, token}}>
      {children}
    </AuthContext.Provider>
  );
}
