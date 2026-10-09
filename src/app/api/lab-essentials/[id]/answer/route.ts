import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import LabEssentialsEntry from '@/models/LabEssentialsEntry';
import { getOrCreateLabEssentialsSession } from '@/models/LabEssentialsSession';
import { LAB_ESSENTIALS_QUESTIONS, MARKS_PER_QUESTION, sanitizeQuestion } from '@/lib/labEssentialsQuiz';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Public: record an answer for the participant's own current question. The quiz is
// self-paced once the host starts it, so the response tells the client which question to
// move straight on to (or that they've finished).
export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { questionIndex, selectedOption } = await req.json();

  await connectDB();
  const [entry, session] = await Promise.all([
    LabEssentialsEntry.findById(id).catch(() => null),
    getOrCreateLabEssentialsSession(),
  ]);
  if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });

  const totalQuestions = LAB_ESSENTIALS_QUESTIONS.length;
  const ownQuestion = entry.answers.length;
  if (session.currentQuestion >= totalQuestions || ownQuestion >= totalQuestions) {
    return NextResponse.json({ completed: true, currentQuestion: ownQuestion });
  }
  if (session.currentQuestion < 0) {
    return NextResponse.json({ message: 'The quiz has not started yet' }, { status: 409 });
  }

  // Reject stale/out-of-order submissions (e.g. a double submit or a second tab) and hand
  // the client the question it should actually be on.
  if (questionIndex !== ownQuestion) {
    return NextResponse.json(
      {
        message: 'Question mismatch',
        currentQuestion: ownQuestion,
        question: sanitizeQuestion(ownQuestion),
      },
      { status: 409 }
    );
  }

  const question = LAB_ESSENTIALS_QUESTIONS[questionIndex];
  if (!question) {
    return NextResponse.json({ message: 'Invalid question index' }, { status: 400 });
  }

  const normalizedSelection = typeof selectedOption === 'number' ? selectedOption : null;
  const correct = normalizedSelection !== null && normalizedSelection === question.correctIndex;
  const marks = correct ? MARKS_PER_QUESTION : 0;
  // Timed server-side from when THIS participant's client actually loaded the question
  // (stamped on GET). Falls back to their previous answer's save time for the rare case a
  // submit arrives without ever having resynced first.
  const seenAt =
    entry.currentQuestionSeenFor === ownQuestion && entry.currentQuestionSeenAt
      ? entry.currentQuestionSeenAt
      : entry.updatedAt;
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
  const completed = entry.answers.length >= totalQuestions;
  if (completed) {
    entry.status = 'completed';
    entry.completedAt = new Date();
  }
  await entry.save();

  return NextResponse.json({ completed, currentQuestion: entry.answers.length });
}
