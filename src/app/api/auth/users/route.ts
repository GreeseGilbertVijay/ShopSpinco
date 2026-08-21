import { NextResponse, type NextRequest } from 'next/server';
import type { QueryFilter } from 'mongoose';
import connectDB from '@/lib/db';
import User, { type IUser } from '@/models/User';
import { AuthError, requireSuperAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    requireSuperAdmin(req);
    await connectDB();
    const role = req.nextUrl.searchParams.get('role');
    const filter: QueryFilter<IUser> = {};
    if (role === 'superAdmin' || role === 'customer') filter.role = role;
    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
