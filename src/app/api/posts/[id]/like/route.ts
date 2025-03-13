import {NextResponse} from 'next/server';
import {getUserIdFromToken} from '@/lib/server/db-access';
import {db} from '@/lib/db';

export async function POST(req: Request, context: {params: {id: string}}) {
  try {
    // Properly await params before accessing properties
    const params = await Promise.resolve(context.params);
    const postId = parseInt(params.id);

    if (isNaN(postId)) {
      return NextResponse.json(
        {success: false, error: 'Invalid post ID'},
        {status: 400}
      );
    }

    // Extract token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {success: false, error: 'Unauthorized'},
        {status: 401}
      );
    }

    const token = authHeader.split(' ')[1];
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json(
        {success: false, error: 'Invalid token'},
        {status: 401}
      );
    }

    // Check if the user has already liked the post
    const [likes] = await db.query(
      'SELECT * FROM likes WHERE postId = ? AND userId = ?',
      [postId, userId]
    );

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      let liked = false;
      if (Array.isArray(likes) && likes.length > 0) {
        // User has already liked the post, so unlike it
        await connection.query(
          'DELETE FROM likes WHERE postId = ? AND userId = ?',
          [postId, userId]
        );

        // Update post like count
        await connection.query(
          'UPDATE posts SET likesCount = GREATEST(likesCount - 1, 0) WHERE id = ?',
          [postId]
        );
      } else {
        // User hasn't liked the post yet, so like it
        await connection.query(
          'INSERT INTO likes (postId, userId) VALUES (?, ?)',
          [postId, userId]
        );

        // Update post like count
        await connection.query(
          'UPDATE posts SET likesCount = likesCount + 1 WHERE id = ?',
          [postId]
        );

        liked = true;
      }

      // Commit the transaction
      await connection.commit();

      // Get updated like count
      const [posts] = await db.query(
        'SELECT likesCount FROM posts WHERE id = ?',
        [postId]
      );

      const post = Array.isArray(posts) && posts.length > 0 ? posts[0] : null;

      return NextResponse.json({
        success: true,
        liked: liked,
        likesCount: post ? (post as any).likesCount : 0,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('TOGGLE LIKE ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}
