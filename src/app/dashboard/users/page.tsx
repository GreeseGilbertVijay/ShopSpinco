import { Suspense } from 'react';
import UsersClient from './users-client';

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl p-8"><p>Loading...</p></div>}>
      <UsersClient />
    </Suspense>
  );
}
