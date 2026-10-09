// Creates (or updates) a superAdmin account - or, with --admin, a quiz-only admin - in the "shopusers" collection.
// Usage: npm run create-superadmin -- <email> <password> [name]
//        npm run create-admin -- <email> <password> [name]
import dns from 'dns';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Same Windows DNS workaround as src/lib/db.ts.
if (process.platform === 'win32') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const args = process.argv.slice(2);
const role = args.includes('--admin') ? 'admin' : 'superAdmin';
const [email, password, name = ''] = args.filter((a) => a !== '--admin');
if (!email || !password) {
  console.error('Usage: npm run create-superadmin -- <email> <password> [name]');
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

const normalizedEmail = email.toLowerCase().trim();
const passwordHash = await bcrypt.hash(password, 10);
const now = new Date();

const result = await mongoose.connection.db.collection('shopusers').updateOne(
  { email: normalizedEmail },
  {
    $set: { passwordHash, role, isVerified: true, updatedAt: now },
    $setOnInsert: { name: name.trim(), email: normalizedEmail, resetAttempts: 0, createdAt: now },
    $unset: { otpCode: '', otpExpiresAt: '', resetCode: '', resetExpiresAt: '' },
  },
  { upsert: true }
);

console.log(result.upsertedCount ? `Created ${role} ${normalizedEmail}` : `Updated ${normalizedEmail} to ${role}`);
await mongoose.disconnect();
