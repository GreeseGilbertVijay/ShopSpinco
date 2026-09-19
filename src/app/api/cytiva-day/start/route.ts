import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import CytivaDayEntry from '@/models/CytivaDayEntry';
import { sanitizeQuestion } from '@/lib/cytivaDayQuiz';

// Public: start a new Cytiva Day quiz attempt
export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ message: 'name is required' }, { status: 400 });
  }

  await connectDB();
  const entry = await CytivaDayEntry.create({ name: name.trim() });

  return NextResponse.json(
    { id: entry._id.toString(), question: sanitizeQuestion(0) },
    { status: 201 }
  );
}
