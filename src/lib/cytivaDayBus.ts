import { EventEmitter } from 'events';

// Server-only in-memory event bus so every connected participant's SSE stream (see
// /api/cytiva-day/stream) gets the "the host advanced the question" event at the same
// instant, instead of each client discovering it on its own independent poll timer.
// Cached on globalThis so Next's dev-mode module reloading doesn't spawn a new emitter
// (and orphan existing SSE subscribers) on every edit, the same way the DB connection is cached.
declare global {
  // eslint-disable-next-line no-var
  var __cytivaDayBus: EventEmitter | undefined;
}

const bus = globalThis.__cytivaDayBus ?? new EventEmitter();
bus.setMaxListeners(0);
globalThis.__cytivaDayBus = bus;

export const CYTIVA_DAY_ADVANCE_EVENT = 'advance';

export interface CytivaDayAdvanceEvent {
  currentQuestion: number;
}

export default bus;
