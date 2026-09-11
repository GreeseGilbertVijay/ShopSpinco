'use client';

import { useEffect, useRef } from 'react';
import Avatar from './Avatar';

export type Service = {
  number: string;
  bg: string;
  title: string;
  description: string;
  quote: string;
  author: string;
  role: string;
  tiles: string[];
};

const STICKY_TOP = 96;
const CARD_HEIGHT = 520; // roughly matches the card's natural content height
const FAN_STEP = 40; // default, unscrolled offset between each waiting card in the stack
const FAN_SCALE = 0.03;
const PEEK_STEP = 20; // each card a new one overtakes stays stacked behind it, peeking by this much
const TRACK_STEP = 720; // scroll distance (px) each card takes to fully hand off — larger = slower

export default function StackedServiceCards({ services }: { services: Service[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const n = services.length;
  // reserved headroom so overtaken cards have room to peek above the front card instead of being clipped
  const peekRoom = (n - 1) * PEEK_STEP;

  useEffect(() => {
    let frameId: number;

    function update() {
      const track = trackRef.current;
      if (track) {
        const rect = track.getBoundingClientRect();
        const progress = Math.min(n - 1, Math.max(0, (STICKY_TOP - rect.top) / TRACK_STEP));

        services.forEach((_, i) => {
          const card = cardRefs.current[i];
          if (!card) return;

          // cards default to a fanned stack — 1 in front, 2/3/4 stepped behind it.
          // once a card is overtaken it doesn't fly off screen — it settles into a
          // stack behind the new front card, peeking out above it by PEEK_STEP per
          // section, staying fully visible instead of exiting the frame.
          const rel = i - progress;

          if (rel >= 1) {
            const translateY = peekRoom + rel * FAN_STEP;
            const scale = 1 - rel * FAN_SCALE;
            card.style.transform = `translateY(${translateY}px) scale(${scale})`;
            card.style.opacity = '1';
            card.style.zIndex = `${300 - Math.round(rel * 10)}`;
          } else if (rel >= 0) {
            const entrance = Math.min(1, (1 - rel) / 0.5);
            const remaining = 1 - entrance;
            const translateY = peekRoom + remaining * FAN_STEP;
            const scale = 1 - remaining * FAN_SCALE;
            card.style.transform = `translateY(${translateY}px) scale(${scale})`;
            card.style.opacity = '1';
            card.style.zIndex = `${300 - Math.round(rel * 10)}`;
          } else {
            // holds its spot just behind the new front card, then eases up into
            // the peek stack — bottom of the box arrives first, top stays behind
            // and visible, each further section tucking 20px higher than the last
            const translateY = peekRoom + rel * PEEK_STEP;
            card.style.transform = `translateY(${translateY}px)`;
            card.style.opacity = '1';
            card.style.zIndex = `${200 + Math.round(rel * 10)}`;
          }
        });
      }
      frameId = requestAnimationFrame(update);
    }
    frameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frameId);
  }, [services, n]);

  return (
    <div ref={trackRef} style={{ height: CARD_HEIGHT + (n - 1) * TRACK_STEP }}>
      <div
        className="sticky overflow-hidden"
        style={{ top: STICKY_TOP, height: CARD_HEIGHT + (n - 1) * FAN_STEP + peekRoom }}
      >
        <div className="relative h-full">
          {services.map((service, i) => (
            <div
              key={service.number}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute inset-x-0 top-0"
              style={{
                willChange: 'transform',
              }}
            >
              <div
                className={`rounded-3xl p-8 sm:p-12 text-white shadow-lifted flex flex-col ${service.bg}`}
                style={{ minHeight: CARD_HEIGHT }}
              >
                <div className="flex items-start justify-between gap-6 mb-6">
                  <h3 className="text-2xl sm:text-3xl font-bold max-w-xl m-0">{service.title}</h3>
                  <span className="text-sm text-white/50 shrink-0">({service.number})</span>
                </div>
                <p className="max-w-2xl text-white/80 leading-relaxed mb-10">{service.description}</p>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mt-auto">
                  <div className="max-w-sm">
                    <blockquote className="m-0 text-sm text-white/90 leading-relaxed mb-4">
                      &ldquo;{service.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <Avatar name={service.author} className="w-8 h-8 text-xs" />
                      <div className="text-xs text-white/70">
                        <div className="font-semibold text-white">{service.author}</div>
                        <div>{service.role}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end">
                    {service.tiles.map((tileLabel, i) => (
                      <div
                        key={tileLabel}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/10 border border-white/15 flex items-end p-2 shadow-lifted"
                        style={{
                          marginLeft: i === 0 ? 0 : -28,
                          transform: `translateY(-${i * 14}px)`,
                          zIndex: i + 1,
                        }}
                      >
                        <span className="text-[10px] font-medium text-white/70 leading-tight">{tileLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
