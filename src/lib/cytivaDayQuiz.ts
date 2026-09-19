// Server-only: correct answers live here so they never reach the client bundle.
// Do not import this file from a 'use client' component.

export interface CytivaDayQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export const MARKS_PER_QUESTION = 10;

// TODO: replace with the real Cytiva Day questions and answers.
export const CYTIVA_DAY_QUESTIONS: CytivaDayQuestion[] = [
  {
    question: 'Placeholder question 1 — what does Cytiva primarily specialize in?',
    options: ['Bioprocessing technology', 'Aerospace engineering', 'Consumer electronics', 'Textile manufacturing'],
    correctIndex: 0,
  },
  {
    question: 'Placeholder question 2 — replace with a real question.',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: 0,
  },
  {
    question: 'Placeholder question 3 — replace with a real question.',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: 0,
  },
  {
    question: 'Placeholder question 4 — replace with a real question.',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: 0,
  },
  {
    question: 'Placeholder question 5 — replace with a real question.',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: 0,
  },
];

export interface CytivaDayQuestionView {
  index: number;
  total: number;
  question: string;
  options: string[];
}

export function sanitizeQuestion(index: number): CytivaDayQuestionView | null {
  const q = CYTIVA_DAY_QUESTIONS[index];
  if (!q) return null;
  return {
    index,
    total: CYTIVA_DAY_QUESTIONS.length,
    question: q.question,
    options: q.options,
  };
}
