import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import LabEssentialsEntry from '@/models/LabEssentialsEntry';
import { getOrCreateLabEssentialsSession } from '@/models/LabEssentialsSession';
import { LAB_ESSENTIALS_QUESTIONS } from '@/lib/labEssentialsQuiz';
import { AuthError, requireQuizHost } from '@/lib/auth';

// Admin only: live view of the current question for host controls (answer counts, per-option
// breakdown, elapsed time)
export async function GET(req: NextRequest) {
  try {
    requireQuizHost(req);
    await connectDB();

    const session = await getOrCreateLabEssentialsSession();
    const totalQuestions = LAB_ESSENTIALS_QUESTIONS.length;
    const completed = session.currentQuestion >= totalQuestions;

    if (session.currentQuestion < 0) {
      const totalParticipants = await LabEssentialsEntry.countDocuments({});
      return NextResponse.json({
        currentQuestion: -1,
        totalQuestions,
        completed: false,
        question: null,
        currentQuestionElapsedSeconds: 0,
        answeredCount: 0,
        totalParticipants,
        optionCounts: [],
      });
    }

    if (completed) {
      const totalParticipants = await LabEssentialsEntry.countDocuments({});
      return NextResponse.json({
        currentQuestion: session.currentQuestion,
        totalQuestions,
        completed: true,
        question: null,
        currentQuestionElapsedSeconds: 0,
        answeredCount: 0,
        totalParticipants,
        optionCounts: [],
      });
    }

    const question = LAB_ESSENTIALS_QUESTIONS[session.currentQuestion];
    const [answeredEntries, totalParticipants] = await Promise.all([
      LabEssentialsEntry.find(
        { answers: { $elemMatch: { question: session.currentQuestion } } },
        { answers: 1 }
      ),
      LabEssentialsEntry.countDocuments({}),
    ]);

    const optionCounts = new Array(question.options.length).fill(0);
    for (const entry of answeredEntries) {
      const ans = entry.answers.find((a) => a.question === session.currentQuestion);
      if (ans && ans.selectedOption !== null && ans.selectedOption >= 0 && ans.selectedOption < optionCounts.length) {
        optionCounts[ans.selectedOption] += 1;
      }
    }

    return NextResponse.json({
      currentQuestion: session.currentQuestion,
      totalQuestions,
      completed: false,
      question: {
        index: session.currentQuestion,
        total: totalQuestions,
        question: question.question,
        options: question.options,
        correctIndex: question.correctIndex,
      },
      currentQuestionElapsedSeconds: Math.max(
        Math.floor((Date.now() - session.currentQuestionStartedAt.getTime()) / 1000),
        0
      ),
      answeredCount: answeredEntries.length,
      totalParticipants,
      optionCounts,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
