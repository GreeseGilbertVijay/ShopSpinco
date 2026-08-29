import type { ReactNode } from 'react';

type Tone = 'accent' | 'success' | 'danger' | 'neutral';

const tones: Record<Tone, string> = {
  accent: 'bg-accent-subtle text-accent-hover border-accent/30',
  success: 'bg-success-subtle text-success border-success/30',
  danger: 'bg-danger-subtle text-danger border-danger/30',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function Badge({
  tone = 'neutral',
  className = '',
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
