import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import CytivaDayEntry from '@/models/CytivaDayEntry';
import { getOrCreateCytivaDaySession } from '@/models/CytivaDaySession';
import { CYTIVA_DAY_QUESTIONS } from '@/lib/cytivaDayQuiz';
import { AuthError, requireSuperAdmin } from '@/lib/auth';

// Admin only: live view of the current question for host controls (answer counts, per-option
// breakdown, elapsed time)
export async function GET(req: NextRequest) {
  try {
    requireSuperAdmin(req);
    await connectDB();

    const session = await getOrCreateCytivaDaySession();
    const totalQuestions = CYTIVA_DAY_QUESTIONS.length;
    const completed = session.currentQuestion >= totalQuestions;

    if (completed) {
      const totalParticipants = await CytivaDayEntry.countDocuments({});
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

    const question = CYTIVA_DAY_QUESTIONS[session.currentQuestion];
    const [answeredEntries, totalParticipants] = await Promise.all([
      CytivaDayEntry.find(
        { answers: { $elemMatch: { question: session.currentQuestion } } },
        { answers: 1 }
      ),
      CytivaDayEntry.countDocuments({}),
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
