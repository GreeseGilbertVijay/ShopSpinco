import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Cloudways (and most cloud hosts) can take a long time to fail a blocked
      // outbound SMTP connection instead of erroring immediately - cap it so a
      // bad network path surfaces as a fast, diagnosable error rather than a hang.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

// Verifies the SMTP config can actually authenticate and connect - use this from a
// diagnostic route/script rather than guessing why emails aren't arriving.
export async function verifyMailConfig(): Promise<void> {
  await getTransporter().verify();
}

// nodemailer errors carry the real diagnosis (ETIMEDOUT = port likely blocked by the
// host's firewall, EAUTH/535 = bad credentials, ECONNREFUSED = wrong host/port) on
// fields that Error.message alone drops - surface them so logs are actually useful.
export function describeMailError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { message?: string; code?: string; command?: string; responseCode?: number; response?: string };
    return [e.message, e.code && `code=${e.code}`, e.responseCode && `responseCode=${e.responseCode}`, e.command && `command=${e.command}`, e.response]
      .filter(Boolean)
      .join(' | ');
  }
  return String(err);
}

export interface SendMailOptions {
  to?: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: Buffer }[];
}

export async function sendMail({ to, subject, text, attachments }: SendMailOptions) {
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    attachments,
  });
}
