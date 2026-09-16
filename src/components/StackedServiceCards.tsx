'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Avatar from './Avatar';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

// Depth offsets for the cards waiting behind the active one.
const CARD_GAP = 18;
const SCALE_STEP = 0.045;
// How far and how sharply the active card tilts away as it exits.
const EXIT_LIFT_RATIO = 0.9;
const EXIT_ROTATION = -42;
// Scroll distance per card, as a fraction of viewport height. Lower this to
// shorten the pinned section so it releases into the next section sooner.
const SCROLL_HEIGHT_PER_CARD = 0.6;
// How far through the last card's exit animation the user must scroll before
// the section unpins into what follows — 1 requires a full exit, 0.5 releases
// at the halfway point so the next section starts coming in sooner.
const LAST_CARD_RELEASE_FRACTION = 0.05;

// Ported from scroll-card-deck: scroll progress is split into one segment per
// card. Each card is either past (exited), present (mid-exit, interpolated by
// segment progress) or future (stacked behind, easing forward as its turn nears).
export default function StackedServiceCards({ services }: { services: Service[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const n = services.length;

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current.filter((c): c is HTMLDivElement => Boolean(c));
    if (!section || cards.length === 0) return;

    const segmentSize = 1 / n;
    // Physical scroll is sized for (n - 1) full card segments plus a partial
    // last segment, so pixels-per-card stay unchanged for every card except
    // the last, which only needs to reach LAST_CARD_RELEASE_FRACTION.
    const totalSegments = n - 1 + LAST_CARD_RELEASE_FRACTION;

    cards.forEach((card, index) => {
      gsap.set(card, {
        xPercent: -50,
        yPercent: -50,
        y: index * CARD_GAP,
        scale: 1 - index * SCALE_STEP,
        rotationX: 0,
      });
    });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * totalSegments * SCROLL_HEIGHT_PER_CARD}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      onUpdate: (self) => {
        const progress = Math.min(self.progress * (totalSegments / n), 1);
        const activeIndex = Math.min(Math.floor(progress / segmentSize), n - 1);
        const segmentProgress = Math.min(
          (progress - activeIndex * segmentSize) / segmentSize,
          1
        );

        cards.forEach((card, index) => {
          if (index < activeIndex) {
            gsap.set(card, {
              y: -window.innerHeight * EXIT_LIFT_RATIO,
              rotationX: EXIT_ROTATION,
              scale: 1,
            });
          } else if (index === activeIndex) {
            gsap.set(card, {
              y: gsap.utils.interpolate(0, -window.innerHeight * EXIT_LIFT_RATIO, segmentProgress),
              rotationX: gsap.utils.interpolate(0, EXIT_ROTATION, segmentProgress),
              scale: 1,
            });
          } else {
            const behindIndex = index - activeIndex;
            const y = behindIndex * CARD_GAP - segmentProgress * CARD_GAP;
            const scale = 1 - (behindIndex - segmentProgress) * SCALE_STEP;
            gsap.set(card, { y, rotationX: 0, scale });
          }
        });
      },
    });

    const onLoadOrResize = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoadOrResize);
    window.addEventListener('resize', onLoadOrResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener('load', onLoadOrResize);
      window.removeEventListener('resize', onLoadOrResize);
      trigger.kill();
    };
  }, [n]);

  return (
    <div ref={sectionRef} className="relative h-screen overflow-hidden" style={{ perspective: 1000 }}>
      {services.map((service, i) => (
        <div
          key={service.number}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="absolute top-1/2 left-1/2 w-[min(90vw,900px)]"
          style={{ willChange: 'transform', transformOrigin: 'bottom center', zIndex: n - i }}
        >
          <div
            className={`relative rounded-3xl p-8 sm:p-12 text-white shadow-lifted flex flex-col ${service.bg}`}
            style={{ minHeight: 480 }}
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
                {service.tiles.map((tileLabel, tileIndex) => (
                  <div
                    key={tileLabel}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/10 border border-white/15 flex items-end p-2 shadow-lifted"
                    style={{
                      marginLeft: tileIndex === 0 ? 0 : -28,
                      transform: `translateY(-${tileIndex * 14}px)`,
                      zIndex: tileIndex + 1,
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
  );
}
