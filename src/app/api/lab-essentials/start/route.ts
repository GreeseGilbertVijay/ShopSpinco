import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import LabEssentialsEntry from '@/models/LabEssentialsEntry';
import { getOrCreateLabEssentialsSession } from '@/models/LabEssentialsSession';
import { LAB_ESSENTIALS_QUESTIONS } from '@/lib/labEssentialsQuiz';

// Public: start a new Lab Essentials Technical Seminar quiz attempt. The quiz is host-controlled and live —
// a new participant either joins the waiting room (if the host hasn't started yet) or
// wherever the group currently is. If the host has already ended it, no entry is created
// (this used to leave a 0-score "completed" entry behind for every latecomer and route
// them into the results page as if they'd played).
export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ message: 'name is required' }, { status: 400 });
  }

  await connectDB();
  const session = await getOrCreateLabEssentialsSession();

  if (session.currentQuestion >= LAB_ESSENTIALS_QUESTIONS.length) {
    return NextResponse.json({ ended: true });
  }

  const entry = await LabEssentialsEntry.create({ name: name.trim() });

  if (session.currentQuestion < 0) {
    return NextResponse.json({ id: entry._id.toString(), waiting: true }, { status: 201 });
  }

  return NextResponse.json(
    { id: entry._id.toString(), currentQuestion: session.currentQuestion },
    { status: 201 }
  );
}
