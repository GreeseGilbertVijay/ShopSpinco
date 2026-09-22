'use client';

import { useEffect, useRef } from 'react';

// Subscribes to the Cytiva Day SSE stream and calls `onAdvance` the instant the host moves
// the live question, so this client resyncs immediately instead of waiting for its own next
// poll tick — which is what let 60 participants' screens update at visibly different times.
export function useCytivaDayLiveSync(onAdvance: () => void) {
  const handlerRef = useRef(onAdvance);
  useEffect(() => {
    handlerRef.current = onAdvance;
  });

  useEffect(() => {
    const source = new EventSource('/api/cytiva-day/stream');
    source.onmessage = () => handlerRef.current();
    return () => source.close();
  }, []);
}
