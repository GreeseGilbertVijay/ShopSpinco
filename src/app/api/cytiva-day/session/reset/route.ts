import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import CytivaDaySessionModel from '@/models/CytivaDaySession';
import { AuthError, requireSuperAdmin } from '@/lib/auth';

// Admin only: send the live quiz back to the waiting room (not started). Does not touch
// any participant entries or scores — this only recovers a session stuck at "completed"
// (e.g. from a rehearsal run), it does not start a fresh event. The host uses "Start Quiz"
// on the dashboard to move everyone from the waiting room to question 1 again.
export async function POST(req: NextRequest) {
  try {
    requireSuperAdmin(req);
    await connectDB();

    await CytivaDaySessionModel.updateOne(
      { key: 'cytiva-day' },
      { $set: { currentQuestion: -1, currentQuestionStartedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ currentQuestion: -1 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
