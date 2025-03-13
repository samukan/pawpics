import {NextResponse} from 'next/server';
import bcrypt from 'bcrypt';
import {db} from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {email, username, password, name} = body;

    // Check if email or username already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (
      Array.isArray(existingUsers) &&
      existingUsers.some((user: any) => user.email === email)
    ) {
      return new NextResponse('Email already in use', {status: 400});
    }

    if (
      Array.isArray(existingUsers) &&
      existingUsers.some((user: any) => user.username === username)
    ) {
      return new NextResponse('Username already taken', {status: 400});
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const [result] = await db.query(
      'INSERT INTO users (email, username, password, name) VALUES (?, ?, ?, ?)',
      [email, username, hashedPassword, name]
    );

    // Fetch the newly created user
    const [newUsers] = await db.query(
      'SELECT id, email, username, name FROM users WHERE email = ?',
      [email]
    );

    const newUser = Array.isArray(newUsers) ? newUsers[0] : null;

    if (!newUser) {
      return new NextResponse('Failed to create user', {status: 500});
    }

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
        },
        message: 'User created successfully',
      },
      {status: 201}
    );
  } catch (error) {
    console.error('SIGNUP ERROR', error);
    return new NextResponse('Internal Server Error', {status: 500});
  }
}
