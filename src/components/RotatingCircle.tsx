'use client';

import type { ReactNode } from 'react';
import { useScrollRotation } from '@/lib/useScrollRotation';

export default function RotatingCircle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useScrollRotation<HTMLDivElement>();

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
