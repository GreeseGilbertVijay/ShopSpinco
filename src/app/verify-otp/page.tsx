import { Suspense } from 'react';
import VerifyOtpClient from './verify-otp-client';

function VerifyOtpSkeleton() {
  return (
    <div className="my-4 sm:my-8 mx-auto max-w-5xl w-full rounded-xl shadow-lifted overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 items-stretch bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="hidden sm:block h-[80vh] skeleton" />
        <div className="p-6 sm:p-8 lg:p-12 flex flex-col gap-4">
          <div className="skeleton h-9 w-2/3 rounded-md" />
          <div className="skeleton h-4 w-full rounded-md" />
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="skeleton w-12 h-14 rounded-lg" key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpSkeleton />}>
      <VerifyOtpClient />
    </Suspense>
  );
}
