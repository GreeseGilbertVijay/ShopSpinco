import dns from 'dns';
import mongoose from 'mongoose';

// Node's resolver can fail to pick up the system DNS servers on Windows,
// falling back to 127.0.0.1 which can't resolve mongodb.net hostnames.
dns.setServers(['8.8.8.8', '1.1.1.1']);

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
async function connectWithRetry(maxAttempts = 10, baseDelayMs = 2000): Promise<typeof mongoose> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log('MongoDB connected');
      return conn;
    } catch (err) {
      const isLastAttempt = attempt === maxAttempts;
      console.warn(`MongoDB connect attempt ${attempt}/${maxAttempts} failed: ${(err as Error).message}`);
      if (isLastAttempt) {
        throw err;
      }
      const delayMs = Math.min(baseDelayMs * attempt, 15000);
      await wait(delayMs);
    }
  }

  throw new Error('Unreachable');
}

// Cache the connection promise on `global` so dev hot-reload and repeated
// Route Handler invocations reuse the same connection instead of opening a new one each time.
export default function connectDB(): Promise<typeof mongoose> {
  if (!global._mongooseConnectPromise) {
    global._mongooseConnectPromise = connectWithRetry();
  }
  return global._mongooseConnectPromise;
}
