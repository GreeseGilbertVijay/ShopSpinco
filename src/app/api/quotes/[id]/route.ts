import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Quote from '@/models/Quote';
import { AuthError, requireSuperAdmin } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Admin only: delete a submission
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    requireSuperAdmin(req);
    const { id } = await params;
    await connectDB();
    const quote = await Quote.findByIdAndDelete(id);
    if (!quote) return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
    return NextResponse.json({ message: 'Submission deleted' });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
