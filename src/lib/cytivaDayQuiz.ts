// Server-only: correct answers live here so they never reach the client bundle.
// Do not import this file from a 'use client' component.

export interface CytivaDayQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export const MARKS_PER_QUESTION = 10;

export const CYTIVA_DAY_QUESTIONS: CytivaDayQuestion[] = [
  {
    question:
      'I watch what happens at a surface\nWhere tiny changes leave a trace\nWith light and waves, I sense the shift\nA little sliver that detects the drift',
    options: ['SPR Sensor Chip', 'Optical Biosensor', 'Plasmonic Sensor', 'Refractive Index Sensor'],
    correctIndex: 0,
  },
  {
    question:
      "I capture what your senses perceive,\nTurn signals into patterns you can see.\nI'm not a picture, but I show what you feel—\nWhat am I, making sensations real?",
    options: ['Sensogram', 'Sensory Map', 'Sensory Profile', 'Sensory image'],
    correctIndex: 0,
  },
  {
    question:
      'I keep something still and in one place,\nPreventing movement at a steady pace.\nUsed when motion must be controlled—\nWhat am I?',
    options: ['Immobilization', 'Restraint', 'Confinement', 'Fixation'],
    correctIndex: 0,
  },
  {
    question:
      'I guide samples where signals appear,\nWith controlled movement, I bring reactions near.\nIn surface sensing, I play my role—\nWhat am I?',
    options: ['SPR Flow Cell', 'SPR Sample Cell', 'Microfluidic Flow Cell', 'Reaction Flowcell'],
    correctIndex: 0,
  },
  {
    question:
      "I bend but don't escape,\nWhen light hits me at the right angle.\nI keep the light inside,\nWhat am I?",
    options: ['Refraction', 'Total Internal Reflection (TIR)', 'Light Confinement', 'Optical Trapping'],
    correctIndex: 1,
  },
  {
    question:
      'I start strong, then slowly fade,\nStep by step, my strength is made.\nEach new sample comes from the last—\nWhat am I?',
    options: ['Concentration Gradient', 'Dilution Cascade', 'Serial Dilutions', 'Sample transfer'],
    correctIndex: 2,
  },
  {
    question:
      "I wash away what's been held tight,\nWith a flowing liquid, I set it free.\nFrom a surface or column, I help it leave—\nWhat am I?",
    options: ['Elutions', 'Desorption', 'Washing', 'Collections'],
    correctIndex: 0,
  },
  {
    question:
      "I push and move a liquid along,\nKeeping the flow steady and strong.\nYou may not see me, but I'm at work—\nWhat am I?",
    options: ['Pump', 'Flow mechanism', 'Syringe', 'Pressure gauge'],
    correctIndex: 0,
  },
  {
    question:
      'I collect samples one by one,\nAt set times, my job is done.\nI work on my own without a hand—\nWhat am I?',
    options: ['Sample dispenser', 'Automated fraction collector', 'Robotic Arm', 'Vacuum pump'],
    correctIndex: 1,
  },
  {
    question:
      'I separate molecules by their size,\nSmall ones wander, while big ones fly.\nThrough tiny pores, they take different ways—\nWhat am I?',
    options: ['Membrane', 'MWCO centricons', 'Dialysis', 'Size Exclusion Chromatography'],
    correctIndex: 3,
  },
  {
    question:
      "I rise on a graph as samples flow,\nEach signal tells what's there below.\nTall or small, I help identify—\nWhat am I?",
    options: ['Sequencing peaks', 'Chromatogram peaks', 'Analyte signals', 'Detectors'],
    correctIndex: 1,
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
