import type { NextRequest } from 'next/server';
import bus, { CYTIVA_DAY_ADVANCE_EVENT, type CytivaDayAdvanceEvent } from '@/lib/cytivaDayBus';

export const dynamic = 'force-dynamic';

// Public: server-sent events so every participant's screen advances at the same instant
// the host clicks Start Quiz / Next Question / Reset, instead of each client finding out
// on its own polling timer (which spreads 60 people's refreshes out over several seconds).
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  let onAdvance: (payload: CytivaDayAdvanceEvent) => void = () => {};
  let keepAlive: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(': connected\n\n'));

      onAdvance = (payload) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          // Connection already closed; the abort listener below will clean up.
        }
      };
      bus.on(CYTIVA_DAY_ADVANCE_EVENT, onAdvance);

      // Comment-only pings keep the connection alive through proxies that time out idle streams.
      keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(keepAlive);
        }
      }, 20000);

      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        bus.off(CYTIVA_DAY_ADVANCE_EVENT, onAdvance);
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      });
    },
    cancel() {
      clearInterval(keepAlive);
      bus.off(CYTIVA_DAY_ADVANCE_EVENT, onAdvance);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
