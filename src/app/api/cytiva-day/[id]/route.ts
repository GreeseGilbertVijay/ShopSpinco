import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import CytivaDayEntry from '@/models/CytivaDayEntry';
import { CYTIVA_DAY_QUESTIONS, MARKS_PER_QUESTION, sanitizeQuestion } from '@/lib/cytivaDayQuiz';
import { AuthError, requireSuperAdmin } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Public: resync quiz state (used on question page load / refresh)
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  await connectDB();

  const entry = await CytivaDayEntry.findById(id).catch(() => null);
  if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });

  const currentQuestionElapsedSeconds =
    entry.status === 'in-progress'
      ? Math.max(Math.floor((Date.now() - entry.currentQuestionStartedAt.getTime()) / 1000), 0)
      : 0;

  return NextResponse.json({
    name: entry.name,
    status: entry.status,
    currentQuestion: entry.currentQuestion,
    currentQuestionElapsedSeconds,
    totalScore: entry.totalScore,
    totalQuestions: CYTIVA_DAY_QUESTIONS.length,
    marksPerQuestion: MARKS_PER_QUESTION,
    question: entry.status === 'in-progress' ? sanitizeQuestion(entry.currentQuestion) : null,
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
