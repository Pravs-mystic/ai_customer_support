import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import db from '../../../../server/models';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    return NextResponse.json({ isLoggedIn: false }, { status: 401 });
  }

  try {
    const decoded = verify(token.value, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.userId, {
      attributes: ['id', 'email', 'displayName', 'photoURL']
    });

    if (!user) {
      return NextResponse.json({ isLoggedIn: false }, { status: 401 });
    }

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ isLoggedIn: false }, { status: 401 });
  }
}