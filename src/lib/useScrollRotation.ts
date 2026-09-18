'use client';

import { useEffect, useRef } from 'react';

const IDLE_SPEED = 0.05;
const SCROLL_FACTOR = 0.15;
const BOOST_DECAY = 0.9;
const MAX_BOOST = 3;

export function useScrollRotation<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const rotation = useRef(0);
  const lastScrollY = useRef(0);
  const scrollBoost = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;
      const next = scrollBoost.current - delta * SCROLL_FACTOR;
      scrollBoost.current = Math.max(-MAX_BOOST, Math.min(MAX_BOOST, next));
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    let frameId: number;
    function tick() {
      rotation.current += IDLE_SPEED + scrollBoost.current;
      scrollBoost.current *= BOOST_DECAY;
      if (Math.abs(scrollBoost.current) < 0.001) scrollBoost.current = 0;
      if (ref.current) {
        ref.current.style.transform = `rotate(${rotation.current}deg)`;
        // exposed so descendants (e.g. tile content) can counter-rotate and
        // stay upright no matter how far the ring has spun
        ref.current.style.setProperty('--spin', `${rotation.current}deg`);
      }
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return ref;
}
