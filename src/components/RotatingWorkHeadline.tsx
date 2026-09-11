'use client';

import type { ReactNode } from 'react';
import { useScrollRotation } from '@/lib/useScrollRotation';

export default function RotatingWorkHeadline({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useScrollRotation<HTMLHeadingElement>();

  return (
    <h2 ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </h2>
  );
}
