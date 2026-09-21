import { Suspense } from 'react';
import WaitingClient from './waiting-client';

function WaitingSkeleton() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 shadow-lifted p-6 sm:p-8 flex flex-col items-center gap-3">
        <div className="skeleton h-6 w-2/3 rounded-md" />
        <div className="skeleton h-4 w-4/5 rounded-md" />
      </div>
    </div>
  );
}

export default function CytivaDayWaitingPage() {
  return (
    <Suspense fallback={<WaitingSkeleton />}>
      <WaitingClient />
    </Suspense>
  );
}
