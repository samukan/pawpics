import {NextResponse} from 'next/server';
import {getUserIdFromToken} from '@/lib/server/db-access';
import {db} from '@/lib/db';
import {User} from '@/types/DBTypes';

export async function GET(req: Request) {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {success: false, error: 'Unauthorized'},
        {status: 401}
      );
    }

    const token = authHeader.split(' ')[1];

    // Get userId from token
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json(
        {success: false, error: 'Invalid token'},
        {status: 401}
      );
    }

    // Fetch user data
    const result = await db.query<User>(
      `SELECT 
        id, email, username, name, image, description as bio, location,
        (SELECT COUNT(*) FROM follows WHERE followerId = ?) as following,
        (SELECT COUNT(*) FROM follows WHERE followingId = ?) as followers
      FROM users WHERE id = ?`,
      [userId, userId, userId]
    );

    const users = result[0];

    if (users.length === 0) {
      return NextResponse.json(
        {success: false, error: 'User not found'},
        {status: 404}
      );
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('USER API ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}
