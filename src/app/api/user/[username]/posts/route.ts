import {NextResponse} from 'next/server';
import {getUserIdFromToken} from '@/lib/server/db-access';
import {db} from '@/lib/db';
import {RowDataPacket} from 'mysql2';

// Define a type that extends RowDataPacket for posts
interface PostRow extends RowDataPacket {
  id: number;
  content?: string;
  image?: string;
  video?: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  authorUsername: string;
  authorName?: string;
  authorImage?: string;
}

export async function GET(req: Request, context: {params: {username: string}}) {
  try {
    // Get username from URL parameters
    const params = await Promise.resolve(context.params);
    const username = params.username;

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

    // Fetch user's posts
    const [rows] = await db.query<PostRow[]>(
      `SELECT 
        p.id, p.content, p.image, p.video, p.authorId, p.createdAt, p.updatedAt,
        p.likesCount, p.commentsCount,
        u.username as authorUsername, u.name as authorName, u.image as authorImage
      FROM posts p
      INNER JOIN users u ON p.authorId = u.id
      WHERE u.username = ?
      ORDER BY p.createdAt DESC`,
      [username]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET USER POSTS ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}
