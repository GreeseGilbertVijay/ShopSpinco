import { Suspense } from 'react';
import VerifyOtpClient from './verify-otp-client';

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-8"><p>Loading...</p></div>}>
      <VerifyOtpClient />
    </Suspense>
  );
}
