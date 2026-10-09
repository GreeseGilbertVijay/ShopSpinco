import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import LabEssentialsEntry from '@/models/LabEssentialsEntry';
import { getOrCreateLabEssentialsSession, LAB_ESSENTIALS_LIVE } from '@/models/LabEssentialsSession';
import { LAB_ESSENTIALS_QUESTIONS } from '@/lib/labEssentialsQuiz';
import { AuthError, requireQuizHost } from '@/lib/auth';

// Admin only: advance the quiz by one step — "Start Quiz" opens it from the waiting room
// (participants then work through the questions at their own pace), and "End Quiz" closes
// it for everyone, sending anyone still mid-quiz to their score page.
export async function POST(req: NextRequest) {
  try {
    requireQuizHost(req);
    await connectDB();

    const totalQuestions = LAB_ESSENTIALS_QUESTIONS.length;
    const session = await getOrCreateLabEssentialsSession();

    if (session.currentQuestion < totalQuestions) {
      session.currentQuestion = session.currentQuestion < 0 ? LAB_ESSENTIALS_LIVE : totalQuestions;
      session.currentQuestionStartedAt = new Date();
      await session.save();
    }

    const completed = session.currentQuestion >= totalQuestions;
    if (completed) {
      await LabEssentialsEntry.updateMany(
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
