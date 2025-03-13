import {NextResponse} from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {db} from '@/lib/db';
import {RowDataPacket} from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  username: string;
  name?: string;
  image?: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {email, password} = body;

    // Käytetään yksittäisen rivin tyyppiä generics-parametrina
    const [users] = await db.query<UserRow>(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        {success: false, error: 'Invalid credentials'},
        {status: 401}
      );
    }

    const user = users[0]; // Käytetään taulukon ensimmäistä riviä

    // Verrataan salasanaa
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        {success: false, error: 'Invalid credentials'},
        {status: 401}
      );
    }

    // Luodaan JWT-token
    const token = jwt.sign(
      {userId: user.id, email: user.email},
      process.env.JWT_SECRET || 'fallback_secret',
      {expiresIn: '7d'}
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('SIGNIN ERROR', error);
    return NextResponse.json(
      {success: false, error: 'Internal Server Error'},
      {status: 500}
    );
  }
}
