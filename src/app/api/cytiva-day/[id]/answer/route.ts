import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import CytivaDayEntry from '@/models/CytivaDayEntry';
import { getOrCreateCytivaDaySession } from '@/models/CytivaDaySession';
import { CYTIVA_DAY_QUESTIONS, MARKS_PER_QUESTION, sanitizeQuestion } from '@/lib/cytivaDayQuiz';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Public: record an answer for the live (host-controlled) question. The participant does not
// advance on their own — they wait until the host moves everyone to the next question.
export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { questionIndex, selectedOption } = await req.json();

  await connectDB();
  const [entry, session] = await Promise.all([
    CytivaDayEntry.findById(id).catch(() => null),
    getOrCreateCytivaDaySession(),
  ]);
  if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });

  const totalQuestions = CYTIVA_DAY_QUESTIONS.length;
  if (session.currentQuestion >= totalQuestions) {
    return NextResponse.json({ completed: true, currentQuestion: session.currentQuestion });
  }

  // Reject stale/out-of-order submissions (e.g. the host already moved on) and hand the
  // client the question it should actually be on.
  if (questionIndex !== session.currentQuestion) {
    return NextResponse.json(
      {
        message: 'Question mismatch',
        currentQuestion: session.currentQuestion,
        question: sanitizeQuestion(session.currentQuestion),
      },
      { status: 409 }
    );
  }

  const alreadyAnswered = entry.answers.some((a) => a.question === session.currentQuestion);
  if (alreadyAnswered) {
    return NextResponse.json({ waiting: true, currentQuestion: session.currentQuestion });
  }

  const question = CYTIVA_DAY_QUESTIONS[questionIndex];
  if (!question) {
    return NextResponse.json({ message: 'Invalid question index' }, { status: 400 });
  }

  const normalizedSelection = typeof selectedOption === 'number' ? selectedOption : null;
  const correct = normalizedSelection !== null && normalizedSelection === question.correctIndex;
  const marks = correct ? MARKS_PER_QUESTION : 0;
  // Timed server-side from when THIS participant's client actually loaded the question
  // (stamped on GET), not from whenever the host advanced it globally — a slow page load
  // shouldn't inflate their answer time. Falls back to the global timestamp for the rare
  // case a submit arrives without ever having resynced first.
  const seenAt =
    entry.currentQuestionSeenFor === session.currentQuestion && entry.currentQuestionSeenAt
      ? entry.currentQuestionSeenAt
      : session.currentQuestionStartedAt;
  const safeTime = Math.max(Math.floor((Date.now() - seenAt.getTime()) / 1000), 0);

  entry.answers.push({
    question: questionIndex,
    selectedOption: normalizedSelection,
    correct,
    marks,
    timeTakenSeconds: safeTime,
  });
  entry.totalScore += marks;
  entry.totalTimeSeconds += safeTime;
  await entry.save();

  return NextResponse.json({ waiting: true, currentQuestion: session.currentQuestion });
}
