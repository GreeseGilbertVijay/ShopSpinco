import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import CytivaDayEntry from '@/models/CytivaDayEntry';
import { AuthError, requireSuperAdmin } from '@/lib/auth';
import { CYTIVA_DAY_QUESTIONS } from '@/lib/cytivaDayQuiz';

// Admin only: list all Cytiva Day quiz attempts (live submissions + leaderboard source)
export async function GET(req: NextRequest) {
  try {
    requireSuperAdmin(req);
    await connectDB();
    const entries = await CytivaDayEntry.find().sort({ startedAt: -1 });
    return NextResponse.json({ entries, totalQuestions: CYTIVA_DAY_QUESTIONS.length });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
