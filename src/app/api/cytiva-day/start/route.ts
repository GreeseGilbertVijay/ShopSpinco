import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import CytivaDayEntry from '@/models/CytivaDayEntry';
import { getOrCreateCytivaDaySession } from '@/models/CytivaDaySession';
import { CYTIVA_DAY_QUESTIONS } from '@/lib/cytivaDayQuiz';

// Public: start a new Cytiva Day quiz attempt. The quiz is host-controlled and live —
// a new participant joins wherever the group currently is, not necessarily question 1.
export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ message: 'name is required' }, { status: 400 });
  }

  await connectDB();
  const [entry, session] = await Promise.all([
    CytivaDayEntry.create({ name: name.trim() }),
    getOrCreateCytivaDaySession(),
  ]);

  const completed = session.currentQuestion >= CYTIVA_DAY_QUESTIONS.length;
  if (completed) {
    entry.status = 'completed';
    entry.completedAt = new Date();
    await entry.save();
  }

  return NextResponse.json(
    { id: entry._id.toString(), currentQuestion: session.currentQuestion, completed },
    { status: 201 }
  );
}
