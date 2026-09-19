import { Suspense } from 'react';
import QuestionClient from './question-client';

function QuestionSkeleton() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-xl rounded-xl border border-gray-200 shadow-lifted p-6 sm:p-8 flex flex-col gap-4">
        <div className="skeleton h-4 w-1/3 rounded-md" />
        <div className="skeleton h-1.5 w-full rounded-full" />
        <div className="skeleton h-8 w-full rounded-md" />
        <div className="flex flex-col gap-3 mt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="skeleton h-12 w-full rounded-lg" key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function CytivaDayQuestionPage({ params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  return (
    <Suspense fallback={<QuestionSkeleton />}>
      <QuestionClient pageIndex={index} />
    </Suspense>
  );
}
