import {NextResponse} from 'next/server';
import {getUserIdFromToken} from '@/lib/server/db-access';
import {db} from '@/lib/db';

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

    // Get comments with author information
    const [comments] = await db.query(
      `SELECT 
        c.id, c.postId, c.userId, c.content, c.createdAt, c.updatedAt,
        u.username as authorUsername, u.name as authorName, u.image as authorImage
      FROM comments c
      INNER JOIN users u ON c.userId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt DESC`,
      [postId]
    );

    return NextResponse.json({
      success: true,
      comments: comments || [],
    });
  } catch (error) {
    console.error('GET COMMENTS ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}

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

    // Get the content from the request body
    const body = await req.json();
    const {content} = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        {success: false, error: 'Comment content is required'},
        {status: 400}
      );
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Add the comment
      const [result] = await connection.query(
        'INSERT INTO comments (postId, userId, content) VALUES (?, ?, ?)',
        [postId, userId, content.trim()]
      );

      const commentId = (result as any).insertId;

      // Update comment count in the post
      await connection.query(
        'UPDATE posts SET commentsCount = commentsCount + 1 WHERE id = ?',
        [postId]
      );

      await connection.commit();

      // Get the newly created comment with author info
      const [comments] = await db.query(
        `SELECT 
          c.id, c.postId, c.userId, c.content, c.createdAt, c.updatedAt,
          u.username as authorUsername, u.name as authorName, u.image as authorImage
        FROM comments c
        INNER JOIN users u ON c.userId = u.id
        WHERE c.id = ?`,
        [commentId]
      );

      if (!Array.isArray(comments) || comments.length === 0) {
        return NextResponse.json(
          {success: false, error: 'Failed to retrieve comment'},
          {status: 500}
        );
      }

      return NextResponse.json({
        success: true,
        comment: comments[0],
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('ADD COMMENT ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}
