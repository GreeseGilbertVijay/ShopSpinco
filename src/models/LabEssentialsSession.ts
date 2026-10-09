import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Singleton: there is exactly one Lab Essentials Technical Seminar quiz session, opened and closed
// from the admin dashboard. `currentQuestion` is the session's phase, not a shared question:
// -1 means the host hasn't started it yet (participants sit in a waiting room),
// LAB_ESSENTIALS_LIVE (0) means it's open and each participant works through the questions at
// their own pace (their position is their own answers.length), and N
// (LAB_ESSENTIALS_QUESTIONS.length) means the host has ended it.
const SINGLETON_KEY = 'lab-essentials';
export const LAB_ESSENTIALS_LIVE = 0;

export interface ILabEssentialsSession extends Document {
  key: string;
  currentQuestion: number;
  currentQuestionStartedAt: Date;
}

const labEssentialsSessionSchema = new Schema<ILabEssentialsSession>(
  {
    key: { type: String, default: SINGLETON_KEY, unique: true },
    currentQuestion: { type: Number, default: -1 },
    currentQuestionStartedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const LabEssentialsSessionModel =
  (mongoose.models.LabEssentialsSession as Model<ILabEssentialsSession>) ||
  mongoose.model<ILabEssentialsSession>('LabEssentialsSession', labEssentialsSessionSchema);

export async function getOrCreateLabEssentialsSession() {
  return LabEssentialsSessionModel.findOneAndUpdate(
    { key: SINGLETON_KEY },
    { $setOnInsert: { key: SINGLETON_KEY, currentQuestion: -1, currentQuestionStartedAt: new Date() } },
    { new: true, upsert: true }
  );
}

export default LabEssentialsSessionModel;
