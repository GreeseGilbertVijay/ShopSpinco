import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Singleton: there is exactly one live Cytiva Day quiz session, host-controlled from the
// admin dashboard. `currentQuestion` is the question every participant is synchronized to:
// -1 means the host hasn't started it yet (participants sit in a waiting room), 0..N-1 is
// a live question index, and N (CYTIVA_DAY_QUESTIONS.length) means the host has ended it.
const SINGLETON_KEY = 'cytiva-day';

export interface ICytivaDaySession extends Document {
  key: string;
  currentQuestion: number;
  currentQuestionStartedAt: Date;
}

const cytivaDaySessionSchema = new Schema<ICytivaDaySession>(
  {
    key: { type: String, default: SINGLETON_KEY, unique: true },
    currentQuestion: { type: Number, default: -1 },
    currentQuestionStartedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CytivaDaySessionModel =
  (mongoose.models.CytivaDaySession as Model<ICytivaDaySession>) ||
  mongoose.model<ICytivaDaySession>('CytivaDaySession', cytivaDaySessionSchema);

export async function getOrCreateCytivaDaySession() {
  return CytivaDaySessionModel.findOneAndUpdate(
    { key: SINGLETON_KEY },
    { $setOnInsert: { key: SINGLETON_KEY, currentQuestion: -1, currentQuestionStartedAt: new Date() } },
    { new: true, upsert: true }
  );
}

export default CytivaDaySessionModel;
