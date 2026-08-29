import { Suspense } from 'react';
import UsersClient from './users-client';

function UsersSkeleton() {
  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-8">
      <div className="skeleton h-9 w-32 rounded-md mb-6" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="skeleton h-10 w-full rounded-md" key={i} />
        ))}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersClient />
    </Suspense>
  );
}
