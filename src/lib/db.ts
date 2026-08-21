import dns from 'dns';
import mongoose from 'mongoose';

// Node's resolver can fail to pick up the system DNS servers on Windows,
// falling back to 127.0.0.1 which can't resolve mongodb.net hostnames.
// Scoped to local Windows dev only: production hosts (e.g. Cloudways) often
// firewall outbound DNS to arbitrary IPs, so forcing 8.8.8.8/1.1.1.1 there
// breaks lookups instead of fixing them.
if (process.platform === 'win32' && process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

declare global {
  var _mongooseConnectPromise: Promise<typeof mongoose> | undefined;
}

// This network intermittently drops/corrupts the TLS handshake with Atlas
// (an IPv6-only path through a NAT64 gateway), which surfaces as
// "tlsv1 alert internal error". It's transient - most retries within a
// few seconds succeed - so keep retrying instead of giving up on attempt 1.
// Scoped to dev: in production a stuck/unreachable Mongo (e.g. an IP not
// yet allowlisted in Atlas) must fail well within the reverse proxy's
// read timeout, or every request hangs until the proxy kills the
// connection (502 "prematurely closed connection").
const isProd = process.env.NODE_ENV === 'production';
const DEFAULT_MAX_ATTEMPTS = isProd ? 3 : 10;
const DEFAULT_BASE_DELAY_MS = isProd ? 1000 : 2000;
const MAX_BACKOFF_MS = isProd ? 5000 : 15000;
const SERVER_SELECTION_TIMEOUT_MS = isProd ? 8000 : 10000;

async function connectWithRetry(
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  baseDelayMs = DEFAULT_BASE_DELAY_MS
): Promise<typeof mongoose> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      });
      console.log('MongoDB connected');
      return conn;
    } catch (err) {
      const isLastAttempt = attempt === maxAttempts;
      console.warn(`MongoDB connect attempt ${attempt}/${maxAttempts} failed: ${(err as Error).message}`);
      if (isLastAttempt) {
        throw err;
      }
      const delayMs = Math.min(baseDelayMs * attempt, MAX_BACKOFF_MS);
      await wait(delayMs);
    }
  }

  throw new Error('Unreachable');
}

// Cache the connection promise on `global` so dev hot-reload and repeated
// Route Handler invocations reuse the same connection instead of opening a new one each time.
export default function connectDB(): Promise<typeof mongoose> {
  if (!global._mongooseConnectPromise) {
    global._mongooseConnectPromise = connectWithRetry().catch((err) => {
      // Don't cache a failed attempt forever - let the next request retry.
      global._mongooseConnectPromise = undefined;
      throw err;
    });
  }
  return global._mongooseConnectPromise;
}
