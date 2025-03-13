import {NextResponse} from 'next/server';
import {getUserIdFromToken} from '@/lib/server/db-access';
import {db} from '@/lib/db';
import {PostWithExtras} from '@/types';

export async function GET(req: Request) {
  try {
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

    // Parse the URL to get query parameters
    const url = new URL(req.url);
    const feedType = url.searchParams.get('feed') || 'global';

    let query: string;
    let queryParams: any[] = [];

    if (feedType === 'following') {
      // Fetch posts from users that the current user follows
      query = `
        SELECT 
          p.id, p.content, p.image, p.video, p.authorId, p.createdAt, p.updatedAt,
          p.likesCount, p.commentsCount,
          u.username as authorUsername, u.name as authorName, u.image as authorImage
        FROM posts p
        INNER JOIN users u ON p.authorId = u.id
        INNER JOIN follows f ON p.authorId = f.followingId
        WHERE f.followerId = ?
        ORDER BY p.createdAt DESC
        LIMIT 50
      `;
      queryParams = [userId];
    } else {
      // Fetch all posts (global feed)
      query = `
        SELECT 
          p.id, p.content, p.image, p.video, p.authorId, p.createdAt, p.updatedAt,
          p.likesCount, p.commentsCount,
          u.username as authorUsername, u.name as authorName, u.image as authorImage
        FROM posts p
        INNER JOIN users u ON p.authorId = u.id
        ORDER BY p.createdAt DESC
        LIMIT 50
      `;
    }

    const [rows] = await db.query(query, queryParams);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET POSTS ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}

export async function POST(req: Request) {
  try {
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

    // Get post data from request
    const body = await req.json();
    const {content, image, video} = body;

    if (!content && !image && !video) {
      return NextResponse.json(
        {success: false, error: 'Post must have content, image, or video'},
        {status: 400}
      );
    }

    // Insert post into database
    const [result] = await db.query(
      'INSERT INTO posts (authorId, content, image, video) VALUES (?, ?, ?, ?)',
      [userId, content || null, image || null, video || null]
    );

    const insertId = (result as any).insertId;

    // Get the newly created post
    const [posts] = await db.query(
      'SELECT id, authorId, content, image, video, createdAt, updatedAt, likesCount, commentsCount FROM posts WHERE id = ?',
      [insertId]
    );

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        {success: false, error: 'Failed to create post'},
        {status: 500}
      );
    }

    return NextResponse.json({
      success: true,
      post: posts[0],
    });
  } catch (error) {
    console.error('CREATE POST ERROR:', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}
