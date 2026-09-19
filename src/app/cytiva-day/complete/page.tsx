import { Suspense } from 'react';
import CytivaDayCompleteClient from './complete-client';

function CompleteSkeleton() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 shadow-lifted p-6 sm:p-10 flex flex-col items-center gap-4">
        <div className="skeleton w-14 h-14 rounded-full" />
        <div className="skeleton h-8 w-2/3 rounded-md" />
        <div className="skeleton h-24 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function CytivaDayCompletePage() {
  return (
    <Suspense fallback={<CompleteSkeleton />}>
      <CytivaDayCompleteClient />
    </Suspense>
  );
}
