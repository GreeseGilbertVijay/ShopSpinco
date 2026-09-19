import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import CytivaDayEntry from '@/models/CytivaDayEntry';
import { CYTIVA_DAY_QUESTIONS, MARKS_PER_QUESTION, sanitizeQuestion } from '@/lib/cytivaDayQuiz';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Public: submit an answer for the current question and advance the attempt
export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { questionIndex, selectedOption, timeTakenSeconds } = await req.json();

  await connectDB();
  const entry = await CytivaDayEntry.findById(id).catch(() => null);
  if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });

  if (entry.status === 'completed') {
    return NextResponse.json({ completed: true, nextQuestion: null, totalScore: entry.totalScore });
  }

  // Reject stale/out-of-order submissions (e.g. a back button or replayed request)
  // and hand the client the state it should actually be on.
  if (questionIndex !== entry.currentQuestion) {
    return NextResponse.json(
      {
        message: 'Question mismatch',
        currentQuestion: entry.currentQuestion,
        question: sanitizeQuestion(entry.currentQuestion),
      },
      { status: 409 }
    );
  }

  const question = CYTIVA_DAY_QUESTIONS[questionIndex];
  if (!question) {
    return NextResponse.json({ message: 'Invalid question index' }, { status: 400 });
  }

  const normalizedSelection = typeof selectedOption === 'number' ? selectedOption : null;
  const correct = normalizedSelection !== null && normalizedSelection === question.correctIndex;
  const marks = correct ? MARKS_PER_QUESTION : 0;
  const safeTime = typeof timeTakenSeconds === 'number' && timeTakenSeconds >= 0 ? timeTakenSeconds : 0;

  entry.answers.push({
    question: questionIndex,
    selectedOption: normalizedSelection,
    correct,
    marks,
    timeTakenSeconds: safeTime,
  });
  entry.totalScore += marks;
  entry.totalTimeSeconds += safeTime;
  entry.currentQuestion += 1;

  const completed = entry.currentQuestion >= CYTIVA_DAY_QUESTIONS.length;
  if (completed) {
    entry.status = 'completed';
    entry.completedAt = new Date();
  }

  await entry.save();

  return NextResponse.json({
    completed,
    nextQuestion: completed ? null : sanitizeQuestion(entry.currentQuestion),
    totalScore: completed ? entry.totalScore : undefined,
  });
}
