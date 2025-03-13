export interface User {
  id: number;
  email: string;
  username: string;
  name?: string;
  image?: string;
  token?: string; // For client-side auth state
}

export interface FullUser extends User {
  bio?: string;
  location?: string;
  following: number;
  followers: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
