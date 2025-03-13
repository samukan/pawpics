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

    // Check if the user has liked the post
    const [likes] = await db.query(
      'SELECT * FROM likes WHERE postId = ? AND userId = ?',
      [postId, userId]
    );

    const hasLiked = Array.isArray(likes) && likes.length > 0;

    return NextResponse.json({
      success: true,
      liked: hasLiked,
    });
  } catch (error) {
    console.error('CHECK USER LIKE ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}
