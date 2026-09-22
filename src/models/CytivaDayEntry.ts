import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type CytivaDayStatus = 'in-progress' | 'completed';

export interface CytivaDayAnswer {
  question: number;
  selectedOption: number | null;
  correct: boolean;
  marks: number;
  timeTakenSeconds: number;
}

export interface ICytivaDayEntry extends Document {
  name: string;
  status: CytivaDayStatus;
  answers: CytivaDayAnswer[];
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

const answerSchema = new Schema<CytivaDayAnswer>(
  {
    question: { type: Number, required: true },
    selectedOption: { type: Number, default: null },
    correct: { type: Boolean, required: true },
    marks: { type: Number, required: true },
    timeTakenSeconds: { type: Number, required: true },
  },
  { _id: false }
);

const cytivaDayEntrySchema = new Schema<ICytivaDayEntry>(
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

export default (mongoose.models.CytivaDayEntry as Model<ICytivaDayEntry>) ||
  mongoose.model<ICytivaDayEntry>('CytivaDayEntry', cytivaDayEntrySchema);
