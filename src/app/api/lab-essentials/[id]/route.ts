import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import LabEssentialsEntry from '@/models/LabEssentialsEntry';
import { getOrCreateLabEssentialsSession } from '@/models/LabEssentialsSession';
import { LAB_ESSENTIALS_QUESTIONS, MARKS_PER_QUESTION, sanitizeQuestion } from '@/lib/labEssentialsQuiz';
import { AuthError, requireQuizHost } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Public: resync quiz state (used on question page load / refresh and while waiting for the host
// to start). Once started, each participant is on their own next unanswered question.
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  await connectDB();

  const entry = await LabEssentialsEntry.findById(id).catch(() => null);
  if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });

  const session = await getOrCreateLabEssentialsSession();
  const totalQuestions = LAB_ESSENTIALS_QUESTIONS.length;
  const globallyCompleted = session.currentQuestion >= totalQuestions;

  if (session.currentQuestion < 0) {
    const totalParticipants = await LabEssentialsEntry.countDocuments({});
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

  // Self-paced: each participant's question is simply the next one they haven't answered.
  const ownQuestion = entry.answers.length;
  const finished = globallyCompleted || ownQuestion >= totalQuestions;

  // Reconcile anyone who has answered everything, or who was still mid-quiz when the host
  // ended it, but hasn't been marked completed yet.
  if (finished && entry.status !== 'completed') {
    entry.status = 'completed';
    entry.completedAt = new Date();
    await entry.save();
  }

  if (finished) {
    return NextResponse.json({
      name: entry.name,
      status: 'completed',
      currentQuestion: ownQuestion,
      currentQuestionElapsedSeconds: 0,
      totalScore: entry.totalScore,
      totalQuestions,
      marksPerQuestion: MARKS_PER_QUESTION,
      question: null,
      waiting: false,
    });
  }

  // Stamp the moment THIS participant's client actually reached their current question,
  // the first time we see them here for it — so their timer (and later their scored
  // answer time) starts from their own page load.
  if (entry.currentQuestionSeenFor !== ownQuestion || !entry.currentQuestionSeenAt) {
    entry.currentQuestionSeenFor = ownQuestion;
    entry.currentQuestionSeenAt = new Date();
    await entry.save();
  }

  const currentQuestionElapsedSeconds = Math.max(
    Math.floor((Date.now() - entry.currentQuestionSeenAt!.getTime()) / 1000),
    0
  );

  return NextResponse.json({
    name: entry.name,
    status: 'in-progress',
    currentQuestion: ownQuestion,
    currentQuestionElapsedSeconds,
    totalScore: entry.totalScore,
    totalQuestions,
    marksPerQuestion: MARKS_PER_QUESTION,
    question: sanitizeQuestion(ownQuestion),
    waiting: false,
  });
}

// Admin only: delete a quiz attempt
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    requireQuizHost(req);
    const { id } = await params;
    await connectDB();
    const entry = await LabEssentialsEntry.findByIdAndDelete(id);
    if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    return NextResponse.json({ message: 'Entry deleted' });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
