import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import CytivaDayEntry from '@/models/CytivaDayEntry';
import { getOrCreateCytivaDaySession } from '@/models/CytivaDaySession';
import { CYTIVA_DAY_QUESTIONS, MARKS_PER_QUESTION, sanitizeQuestion } from '@/lib/cytivaDayQuiz';
import { AuthError, requireSuperAdmin } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Public: resync quiz state (used on question page load / refresh and while waiting for the host)
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  await connectDB();

  const entry = await CytivaDayEntry.findById(id).catch(() => null);
  if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });

  const session = await getOrCreateCytivaDaySession();
  const totalQuestions = CYTIVA_DAY_QUESTIONS.length;
  const globallyCompleted = session.currentQuestion >= totalQuestions;

  if (session.currentQuestion < 0) {
    const totalParticipants = await CytivaDayEntry.countDocuments({});
    return NextResponse.json({
      name: entry.name,
      status: 'in-progress',
      currentQuestion: -1,
      currentQuestionElapsedSeconds: 0,
      totalScore: entry.totalScore,
      totalQuestions,
      marksPerQuestion: MARKS_PER_QUESTION,
      question: null,
      waiting: true,
      totalParticipants,
    });
  }

  // The host ending the quiz is a single global event — reconcile stragglers who hadn't
  // been marked completed yet (e.g. they were mid-question when the host finished).
  if (globallyCompleted && entry.status !== 'completed') {
    entry.status = 'completed';
    entry.completedAt = new Date();
    await entry.save();
  }

  if (globallyCompleted) {
    return NextResponse.json({
      name: entry.name,
      status: 'completed',
      currentQuestion: session.currentQuestion,
      currentQuestionElapsedSeconds: 0,
      totalScore: entry.totalScore,
      totalQuestions,
      marksPerQuestion: MARKS_PER_QUESTION,
      question: null,
      waiting: false,
    });
  }

  const hasAnsweredCurrent = entry.answers.some((a) => a.question === session.currentQuestion);

  // Stamp the moment THIS participant's client actually reached the current question,
  // the first time we see them here for it — so their timer (and later their scored
  // answer time) starts from their own page load, not from whenever the host clicked
  // "Next Question" globally. A slow connection shouldn't cost them answer time.
  if (!hasAnsweredCurrent && entry.currentQuestionSeenFor !== session.currentQuestion) {
    entry.currentQuestionSeenFor = session.currentQuestion;
    entry.currentQuestionSeenAt = new Date();
    await entry.save();
  }

  const seenAt =
    entry.currentQuestionSeenFor === session.currentQuestion && entry.currentQuestionSeenAt
      ? entry.currentQuestionSeenAt
      : session.currentQuestionStartedAt;
  const currentQuestionElapsedSeconds = Math.max(Math.floor((Date.now() - seenAt.getTime()) / 1000), 0);

  let answeredCount: number | undefined;
  let totalParticipants: number | undefined;
  if (hasAnsweredCurrent) {
    [answeredCount, totalParticipants] = await Promise.all([
      CytivaDayEntry.countDocuments({ answers: { $elemMatch: { question: session.currentQuestion } } }),
      CytivaDayEntry.countDocuments({}),
    ]);
  }

  return NextResponse.json({
    name: entry.name,
    status: 'in-progress',
    currentQuestion: session.currentQuestion,
    currentQuestionElapsedSeconds,
    totalScore: entry.totalScore,
    totalQuestions,
    marksPerQuestion: MARKS_PER_QUESTION,
    question: sanitizeQuestion(session.currentQuestion),
    waiting: hasAnsweredCurrent,
    answeredCount,
    totalParticipants,
  });
}

// Admin only: delete a quiz attempt
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    requireSuperAdmin(req);
    const { id } = await params;
    await connectDB();
    const entry = await CytivaDayEntry.findByIdAndDelete(id);
    if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    return NextResponse.json({ message: 'Entry deleted' });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
