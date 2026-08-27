import Link from 'next/link';
import type { CSSProperties } from 'react';

const CONFETTI_COLORS = ['#f29a4e', '#dc8639', '#4caf50', '#4c9aef', '#e75480', '#ffd166'];

function seededRandom(seed: number) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

function makeConfetti(count: number, sideStart: number, sideRange: number, keyPrefix: string) {
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
      color: CONFETTI_COLORS[Math.floor(r4 * CONFETTI_COLORS.length)],
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

      <div className="relative z-10 max-w-[960px] mx-auto p-8 text-center bg-white text-black rounded-lg flex flex-col items-center">
        <h1 className="text-4xl font-bold text-black!">Thank you!</h1>
        <p className="text-black/80">
          Your quote request has been sent. We&apos;ve emailed you a confirmation and will be in touch shortly.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}
