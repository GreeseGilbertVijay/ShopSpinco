import { NextResponse, type NextRequest } from 'next/server';
import { AuthError, requireSuperAdmin } from '@/lib/auth';
import { sendMail, verifyMailConfig, describeMailError } from '@/lib/mail';

// Admin only: diagnose SMTP config directly on the deployed host (e.g. after updating
// SMTP_* env vars in Cloudways) instead of guessing from a silently-failed email.
// GET checks the connection/auth only; POST also sends a real test email to ADMIN_EMAIL.
export async function GET(req: NextRequest) {
  try {
    requireSuperAdmin(req);
    await verifyMailConfig();
    return NextResponse.json({ ok: true, message: 'SMTP connection and authentication succeeded' });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ ok: false, error: describeMailError(err) }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireSuperAdmin(req);
    const to = process.env.ADMIN_EMAIL || session.email;
    await sendMail({
      to,
      subject: 'ShopSpinco SMTP test',
      text: `This is a test email confirming SMTP is working, sent at ${new Date().toISOString()}.`,
    });
    return NextResponse.json({ ok: true, message: `Test email sent to ${to}` });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ ok: false, error: describeMailError(err) }, { status: 502 });
  }
}
