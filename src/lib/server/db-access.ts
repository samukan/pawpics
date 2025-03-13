import {db} from '@/lib/db';
import jwt from 'jsonwebtoken';

// For server-side use only
export async function getUserIdFromToken(
  token: string
): Promise<number | null> {
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: number;
    };
    return decoded.userId;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
