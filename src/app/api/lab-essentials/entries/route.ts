import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import LabEssentialsEntry from '@/models/LabEssentialsEntry';
import { AuthError, requireQuizHost } from '@/lib/auth';
import { LAB_ESSENTIALS_QUESTIONS } from '@/lib/labEssentialsQuiz';

// Admin only: list all Lab Essentials Technical Seminar quiz attempts (live submissions + leaderboard source)
export async function GET(req: NextRequest) {
  try {
    requireQuizHost(req);
    await connectDB();
    const entries = await LabEssentialsEntry.find().sort({ startedAt: -1 });
    return NextResponse.json({ entries, totalQuestions: LAB_ESSENTIALS_QUESTIONS.length });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
