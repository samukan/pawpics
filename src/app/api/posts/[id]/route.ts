import {NextResponse} from 'next/server';
import {getUserIdFromToken} from '@/lib/server/db-access';
import {db} from '@/lib/db';

export async function DELETE(req: Request, context: {params: {id: string}}) {
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

    // Check if the post exists and belongs to the user
    const [posts] = await db.query(
      'SELECT * FROM posts WHERE id = ? AND authorId = ?',
      [postId, userId]
    );

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Post not found or you do not have permission to delete it',
        },
        {status: 404}
      );
    }

    // Delete the post
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Delete associated likes
      await connection.query('DELETE FROM likes WHERE postId = ?', [postId]);

      // Delete associated comments
      await connection.query('DELETE FROM comments WHERE postId = ?', [postId]);

      // Delete the post itself
      await connection.query('DELETE FROM posts WHERE id = ?', [postId]);

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('DELETE POST ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}

export async function GET(req: Request, context: {params: {id: string}}) {
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

    // Get post details with author information
    const [posts] = await db.query(
      `SELECT 
        p.id, p.content, p.image, p.authorId, p.createdAt, p.updatedAt,
        p.likesCount, p.commentsCount,
        u.username as authorUsername, u.name as authorName, u.image as authorImage
      FROM posts p
      INNER JOIN users u ON p.authorId = u.id
      WHERE p.id = ?`,
      [postId]
    );

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        {success: false, error: 'Post not found'},
        {status: 404}
      );
    }

    return NextResponse.json({
      success: true,
      post: posts[0],
    });
  } catch (error) {
    console.error('GET POST ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}
