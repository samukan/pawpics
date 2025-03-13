import {NextResponse} from 'next/server';
import {getUserIdFromToken} from '@/lib/server/db-access';
import {db} from '@/lib/db';
import {User, Follow, CountResult} from '@/types/DBTypes';

export async function POST(
  req: Request,
  context: {params: {username: string}}
) {
  try {
    // Get username from URL parameters
    const params = await Promise.resolve(context.params);
    const username = params.username;

    // Get current user from token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {success: false, error: 'Unauthorized'},
        {status: 401}
      );
    }

    const token = authHeader.split(' ')[1];
    const followerId = await getUserIdFromToken(token);

    if (!followerId) {
      return NextResponse.json(
        {success: false, error: 'Invalid token'},
        {status: 401}
      );
    }

    // Find user to follow by username
    const [users] = await db.query<User>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return NextResponse.json(
        {success: false, error: 'User not found'},
        {status: 404}
      );
    }

    const followingId = users[0].id;

    // Check if user is trying to follow themselves
    if (followerId === followingId) {
      return NextResponse.json(
        {success: false, error: 'Cannot follow yourself'},
        {status: 400}
      );
    }

    // Check if already following
    const [follows] = await db.query<Follow>(
      'SELECT * FROM follows WHERE followerId = ? AND followingId = ?',
      [followerId, followingId]
    );

    const alreadyFollowing = follows.length > 0;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      if (alreadyFollowing) {
        // Unfollow
        await connection.query(
          'DELETE FROM follows WHERE followerId = ? AND followingId = ?',
          [followerId, followingId]
        );
      } else {
        // Follow
        await connection.query(
          'INSERT INTO follows (followerId, followingId) VALUES (?, ?)',
          [followerId, followingId]
        );
      }

      // Get updated follower counts
      const [followerCounts] = await connection.query<CountResult>(
        'SELECT COUNT(*) as followers FROM follows WHERE followingId = ?',
        [followingId]
      );

      // Safely extract the follower count
      const followerCount =
        followerCounts.length > 0
          ? Number(followerCounts[0].followers) || 0
          : 0;

      await connection.commit();

      return NextResponse.json({
        success: true,
        following: !alreadyFollowing,
        followerCount,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('FOLLOW ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}

// Check if the current user follows a specific user
export async function GET(req: Request, context: {params: {username: string}}) {
  try {
    const params = await Promise.resolve(context.params);
    const username = params.username;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {success: false, error: 'Unauthorized'},
        {status: 401}
      );
    }

    const token = authHeader.split(' ')[1];
    const followerId = await getUserIdFromToken(token);

    if (!followerId) {
      return NextResponse.json(
        {success: false, error: 'Invalid token'},
        {status: 401}
      );
    }

    // Find user by username
    const [users] = await db.query<User>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return NextResponse.json(
        {success: false, error: 'User not found'},
        {status: 404}
      );
    }

    const followingId = users[0].id;

    // Check if following
    const [follows] = await db.query<Follow>(
      'SELECT * FROM follows WHERE followerId = ? AND followingId = ?',
      [followerId, followingId]
    );

    const isFollowing = follows.length > 0;

    // Get follower count
    const [followerCounts] = await db.query<CountResult>(
      'SELECT COUNT(*) as followers FROM follows WHERE followingId = ?',
      [followingId]
    );

    const followerCount =
      followerCounts.length > 0 ? Number(followerCounts[0].followers) || 0 : 0;

    return NextResponse.json({
      success: true,
      following: isFollowing,
      followerCount,
    });
  } catch (error) {
    console.error('CHECK FOLLOW ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}
