import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type LabEssentialsStatus = 'in-progress' | 'completed';

export interface LabEssentialsAnswer {
  question: number;
  selectedOption: number | null;
  correct: boolean;
  marks: number;
  timeTakenSeconds: number;
}

export interface ILabEssentialsEntry extends Document {
  name: string;
  status: LabEssentialsStatus;
  answers: LabEssentialsAnswer[];
  totalScore: number;
  totalTimeSeconds: number;
  // Which live question index currentQuestionSeenAt was stamped for, and when this
  // participant's own client actually loaded it — not when the host advanced the
  // question globally, so a slow page load doesn't eat into their answer time.
  currentQuestionSeenFor: number | null;
  currentQuestionSeenAt: Date | null;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<LabEssentialsAnswer>(
  {
    question: { type: Number, required: true },
    selectedOption: { type: Number, default: null },
    correct: { type: Boolean, required: true },
    marks: { type: Number, required: true },
    timeTakenSeconds: { type: Number, required: true },
  },
  { _id: false }
);

const labEssentialsEntrySchema = new Schema<ILabEssentialsEntry>(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    answers: { type: [answerSchema], default: [] },
    totalScore: { type: Number, default: 0 },
    totalTimeSeconds: { type: Number, default: 0 },
    currentQuestionSeenFor: { type: Number, default: null },
    currentQuestionSeenAt: { type: Date, default: null },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default (mongoose.models.LabEssentialsEntry as Model<ILabEssentialsEntry>) ||
  mongoose.model<ILabEssentialsEntry>('LabEssentialsEntry', labEssentialsEntrySchema);
