import Link from 'next/link';
import type { CSSProperties } from 'react';
import Card from '@/components/ui/Card';
import { buttonClasses } from '@/components/ui/buttonClasses';

const CONFETTI_COLORS = [
  '#f29a4e',
  '#dc8639',
  '#4caf50',
  '#4c9aef',
  '#e75480',
  '#ffd166',
];

function seededRandom(seed: number) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

function makeConfetti(
  count: number,
  sideStart: number,
  sideRange: number,
  keyPrefix: string
) {
  return Array.from({ length: count }, (_, i) => {
    const r1 = seededRandom(i * 7 + sideStart + 1);
    const r2 = seededRandom(i * 13 + sideStart + 2);
    const r3 = seededRandom(i * 17 + sideStart + 3);
    const r4 = seededRandom(i * 23 + sideStart + 4);
    const r5 = seededRandom(i * 29 + sideStart + 5);
    const r6 = seededRandom(i * 31 + sideStart + 6);

    return {
      key: `${keyPrefix}-${i}`,
      left: sideStart + r1 * sideRange,
      delay: r2 * 6,
      duration: 5 + r3 * 4,
      color:
        CONFETTI_COLORS[
          Math.floor(r4 * CONFETTI_COLORS.length)
        ],
      drift: (r5 - 0.5) * 140,
      size: 6 + r6 * 6,
      rotate: 180 + r5 * 540,
    };
  });
}

const confettiPieces = [
  ...makeConfetti(14, 0, 30, 'l'),
  ...makeConfetti(14, 70, 30, 'r'),
];

export default function ThankYou() {
  return (
    <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confettiPieces.map((piece) => (
          <span
            key={piece.key}
            className="confetti-piece"
            style={
              {
                left: `${piece.left}%`,
                width: `${piece.size}px`,
                height: `${piece.size * 1.6}px`,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                '--confetti-drift': `${piece.drift}px`,
                '--confetti-spin': `${piece.rotate}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <Card className="relative z-10 max-w-lg mx-auto p-8 sm:p-10 text-center flex flex-col items-center shadow-lifted">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-subtle text-success mb-4">
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900! mb-1">
          Thank you!
        </h1>

        <p className="text-gray-600">
          Your quote request has been sent. We&apos;ve emailed you a
          confirmation and will be in touch shortly.
        </p>

        <div className="w-full mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3 text-left text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-subtle text-accent-hover text-xs font-semibold shrink-0">
              1
            </span>
            Our team reviews your request
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-subtle text-accent-hover text-xs font-semibold shrink-0">
              2
            </span>
            We prepare a tailored quote
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-subtle text-accent-hover text-xs font-semibold shrink-0">
              3
            </span>
            You&apos;ll hear back from us by email
          </div>
        </div>

        <Link
          href="/"
          className={buttonClasses({
            variant: 'primary',
            className: 'mt-7',
          })}
        >
          Back to shop
        </Link>
      </Card>
    </div>
  );
}