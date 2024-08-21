import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import db from '../../../../server/models';

export async function POST(req) {
  const { email, password, displayName } = await req.json();

  try {
    // Check if user already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const newUser = await db.User.create({
      email,
      password: hashedPassword,
      displayName,
    });

    // Remove password from the response
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}