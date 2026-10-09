import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import LabEssentialsEntry from '@/models/LabEssentialsEntry';
import { getOrCreateLabEssentialsSession } from '@/models/LabEssentialsSession';
import { LAB_ESSENTIALS_QUESTIONS } from '@/lib/labEssentialsQuiz';
import { AuthError, requireQuizHost } from '@/lib/auth';

// Admin only: live view of the quiz for host controls — whether it's waiting, open or ended,
// and how many participants have joined / finished. Participants move through the questions
// at their own pace, so there is no single "current question" to show.
export async function GET(req: NextRequest) {
  try {
    requireQuizHost(req);
    await connectDB();

    const session = await getOrCreateLabEssentialsSession();
    const totalQuestions = LAB_ESSENTIALS_QUESTIONS.length;
    const completed = session.currentQuestion >= totalQuestions;

    const [totalParticipants, completedCount] = await Promise.all([
      LabEssentialsEntry.countDocuments({}),
      LabEssentialsEntry.countDocuments({ status: 'completed' }),
    ]);

    return NextResponse.json({
      currentQuestion: session.currentQuestion < 0 ? -1 : session.currentQuestion,
      totalQuestions,
      completed,
      totalParticipants,
      completedCount,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
