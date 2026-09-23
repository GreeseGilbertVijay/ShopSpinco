'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type Service = {
  number: string;
  bg: string;
  badge: string;
  glow: string;
  dot: string;
  title: string;
  description: string;
  highlights: string[];
  logos: { file: string; href?: string }[];
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
          className="absolute top-[42%] left-1/2 w-[min(95vw,1200px)]"
          style={{ willChange: 'transform', transformOrigin: 'bottom center', zIndex: n - i }}
        >
          <div
            className={`relative overflow-hidden rounded-[2rem] p-8 sm:p-12 border border-black/5 shadow-lifted flex flex-col ${service.bg}`}
            style={{ minHeight: 480 }}
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-60 ${service.glow}`}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -bottom-24 -left-16 w-56 h-56 rounded-full blur-3xl opacity-40 ${service.glow}`}
            />

            <div className="relative flex items-start justify-between gap-6 mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold max-w-xl m-0 text-gray-900">{service.title}</h3>
              <span
                className={`inline-flex items-center justify-center w-11 h-11 rounded-full text-sm font-semibold shrink-0 ${service.badge}`}
              >
                {service.number}
              </span>
            </div>
            <p className="relative max-w-2xl text-gray-600 leading-relaxed mb-4">{service.description}</p>

            <ul className="relative flex flex-col gap-2 max-w-2xl mb-10">
              {service.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-gray-700 text-sm sm:text-base leading-relaxed">
                  <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${service.dot}`} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="relative flex justify-end mt-auto">
              <div className="flex items-center gap-4 flex-wrap justify-end">
                {service.logos.map((logo) => {
                  const Wrapper = logo.href ? 'a' : 'div';
                  return (
                    <Wrapper
                      key={logo.file}
                      {...(logo.href ? { href: logo.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl bg-white border border-black/5 flex items-center justify-center p-3 shadow-elevated transition-transform group-hover:-translate-y-0.5">
                        <img
                          src={`/Process-Technology/${encodeURIComponent(logo.file)}`}
                          alt={logo.file.replace(/\.png$/i, '')}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <span
                        className={`block w-8 h-0.5 rounded-full ${service.dot} opacity-70 transition-opacity group-hover:opacity-100`}
                      />
                    </Wrapper>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
