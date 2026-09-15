'use client';

import { useState } from 'react';
import Avatar from './Avatar';

export type FanTestimonial = {
  quote: string;
  author: string;
  role: string;
  dark: boolean;
  leftPercent: number;
  topPx: number;
  rotateDeg: number;
};

const SPREAD = 170;

function Stars() {
  return (
    <div className="flex gap-0.5 text-accent">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L1.5 7.7l5.9-.9L10 1.5Z" />
        </svg>
      ))}
    </div>
  );
}

export default function TrustedByFan({ testimonials }: { testimonials: FanTestimonial[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="hidden sm:block relative h-[420px]">
      {testimonials.map((t, i) => {
        const isHovered = hovered === i;
        const translateX = hovered === null || isHovered ? 0 : i < hovered ? -SPREAD : SPREAD;
        const rotate = isHovered ? 0 : t.rotateDeg;
        const scale = isHovered ? 1.06 : 1;
        const translateY = isHovered ? -14 : 0;

        return (
          <div
            key={t.author}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`absolute w-[280px] rounded-2xl p-6 transition-transform duration-300 ease-out ${
              isHovered ? 'shadow-2xl' : 'shadow-lifted'
            } ${t.dark ? 'bg-neutral-800 text-white' : 'bg-white text-gray-900'}`}
            style={{
              left: `${t.leftPercent}%`,
              top: t.topPx,
              zIndex: isHovered ? 50 : i + 1,
              transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Stars />
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  t.dark ? 'text-white/60' : 'text-gray-500'
                }`}
              >
                Contact Sales
              </span>
            </div>
            <p className={`text-sm leading-relaxed mb-6 line-clamp-6 ${t.dark ? 'text-white/85' : 'text-gray-700'}`}>
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <Avatar name={t.author} className={`w-9 h-9 text-xs ${t.dark ? 'bg-white/10! text-white!' : ''}`} />
              <div className="text-xs">
                <div className="font-semibold">{t.author}</div>
                <div className={t.dark ? 'text-white/60' : 'text-gray-500'}>{t.role}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
