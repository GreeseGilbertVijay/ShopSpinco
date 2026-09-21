import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import CytivaDayEntry from '@/models/CytivaDayEntry';
import { getOrCreateCytivaDaySession } from '@/models/CytivaDaySession';
import { CYTIVA_DAY_QUESTIONS } from '@/lib/cytivaDayQuiz';
import { AuthError, requireSuperAdmin } from '@/lib/auth';

// Admin only: advance the live quiz to the next question, or end it from the last question.
// This is the "Next Question" / "Finish Quiz" button on the dashboard.
export async function POST(req: NextRequest) {
  try {
    requireSuperAdmin(req);
    await connectDB();

    const totalQuestions = CYTIVA_DAY_QUESTIONS.length;
    const session = await getOrCreateCytivaDaySession();

    if (session.currentQuestion < totalQuestions) {
      session.currentQuestion += 1;
      session.currentQuestionStartedAt = new Date();
      await session.save();
    }

    const completed = session.currentQuestion >= totalQuestions;
    if (completed) {
      await CytivaDayEntry.updateMany(
        { status: { $ne: 'completed' } },
        { $set: { status: 'completed', completedAt: new Date() } }
      );
    }

    return NextResponse.json({ currentQuestion: session.currentQuestion, completed });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
