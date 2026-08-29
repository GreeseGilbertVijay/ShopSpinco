'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, type User } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

export default function MyProfile() {
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    getMe()
      .then((data) => {
        if (!data) {
          router.replace('/login');
          return;
        }
        setUser(data);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roleLabel = user?.role === 'superAdmin' ? 'Admin' : 'Customer';
  const initials = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase();

  async function handleLogout() {
    await authLogout();
    router.push('/');
  }

  return (
    <div className="max-w-4xl w-full p-4 sm:p-8 text-left">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900! mb-6">My Profile</h1>

      {status === 'loading' && (
        <Card className="p-6 sm:p-8 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="skeleton w-16 h-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-3 w-56" />
            </div>
          </div>
        </Card>
      )}

      {status === 'error' && (
        <EmptyState title="Could not load your profile" description="Please refresh the page or try again shortly." />
      )}

      {status === 'ready' && user && (
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-subtle text-accent-hover text-2xl font-semibold shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900!">{user.name || 'Unnamed user'}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <Badge tone={user.role === 'superAdmin' ? 'accent' : 'neutral'} className="ml-auto">
              {roleLabel}
            </Badge>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-base text-gray-900 mt-0.5">{user.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-base text-gray-900 mt-0.5">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Account Type</dt>
              <dd className="text-base text-gray-900 mt-0.5">{roleLabel}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Member Since</dt>
              <dd className="text-base text-gray-900 mt-0.5">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleLogout}
            className={buttonClasses({ variant: 'danger', className: 'mt-8' })}
          >
            Log Out
          </button>
        </Card>
      )}
    </div>
  );
}
