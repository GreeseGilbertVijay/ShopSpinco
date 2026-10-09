// Server-only: correct answers live here so they never reach the client bundle.
// Do not import this file from a 'use client' component.

export interface LabEssentialsQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export const MARKS_PER_QUESTION = 10;

export const LAB_ESSENTIALS_QUESTIONS: LabEssentialsQuestion[] = [
  {
    question: 'What is the maximum weighing capacity of the Shimadzu AP225WD balance?',
    options: ['120 g', '320 g', '220 g', '520 g'],
    correctIndex: 2,
  },
  {
    question: 'What is the readability of the Shimadzu AP225WD?',
    options: ['0.1 mg', '0.01 mg', '1 mg', '0.001 mg'],
    correctIndex: 1,
  },
  {
    question: 'Which Balance is Auto door balance from below?',
    options: ['AP 225WD', 'AP 224X', 'AP 124Y', 'AP 225WD-AD'],
    correctIndex: 3,
  },
  {
    question: 'Increasing column length generally results in:',
    options: ['Lower resolution', 'Higher efficiency and resolution', 'Lower pressure', 'Shorter analysis time'],
    correctIndex: 1,
  },
  {
    question: 'What is the USP code for C8 columns?',
    options: ['L7', 'L1', 'L8', 'L17'],
    correctIndex: 0,
  },
  {
    question: 'The purpose of end-capping is to:',
    options: ['Increase column length', 'Reduce silanol activity', 'Increase particle size', 'Reduce flow rate'],
    correctIndex: 1,
  },
  {
    question: 'Which vial is recommended for compounds that degrade upon exposure to light?',
    options: ['Clear glass vial', 'Polypropylene vial', 'Amber vial', 'Crimp vial'],
    correctIndex: 2,
  },
  {
    question: 'Which parameter indicates the centrifugal force applied to a sample?',
    options: ['RPM only', 'RCF (×g)', 'Temperature only', 'Rotor diameter only'],
    correctIndex: 1,
  },
  {
    question: 'What terminology Gyrozen use for their freeze dryers?',
    options: ['HyperVac', 'HyperDry', 'HyperCentrifuge', 'HyperCool'],
    correctIndex: 3,
  },
  {
    question: 'Which water quality is generally associated with Type I laboratory water?',
    options: ['Highest purity laboratory-grade water', 'Tap water', 'Drinking water', 'Softened water'],
    correctIndex: 0,
  },
  {
    question: 'Which model of Aquinity WPS from below has EDI filter in it?',
    options: ['Aquinity P10', 'Aquinity P70', 'Aquinity Astacus', 'Aquinity E70'],
    correctIndex: 3,
  },
  {
    question: 'What does ELSD stand for?',
    options: [
      'Electro-Luminescence Sample Detector',
      'Evaporative Light Scattering Detector',
      'Enhanced Liquid Separation Detector',
      'Electronic Light Spectrum Detector',
    ],
    correctIndex: 1,
  },
  {
    question: 'Which type of compounds can be particularly useful to detect using ELSD?',
    options: [
      'Compounds with weak or no UV chromophore',
      'Only strongly UV-absorbing compounds',
      'Only radioactive compounds',
      'Only gases',
    ],
    correctIndex: 0,
  },
  {
    question: 'What is a key feature of Sonica ultrasonic Sonicators regarding operating noise?',
    options: [
      'Requires an external soundproof room',
      'Completely noiseless during operation',
      'Designed for low-noise operation',
      'Produces very high mechanical noise',
    ],
    correctIndex: 2,
  },
  {
    question: 'Which gases can commonly be supplied by laboratory gas generators?',
    options: ['Nitrogen', 'Hydrogen', 'Zero/clean air', 'All of the above'],
    correctIndex: 3,
  },
];

export interface LabEssentialsQuestionView {
  index: number;
  total: number;
  question: string;
  options: string[];
}

export function sanitizeQuestion(index: number): LabEssentialsQuestionView | null {
  const q = LAB_ESSENTIALS_QUESTIONS[index];
  if (!q) return null;
  return {
    index,
    total: LAB_ESSENTIALS_QUESTIONS.length,
    question: q.question,
    options: q.options,
  };
}
