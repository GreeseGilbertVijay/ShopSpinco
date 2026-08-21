'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, type User } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

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

  async function handleLogout() {
    await authLogout();
    router.push('/');
  }

  return (
    <div className="max-w-2xl p-8 text-left bg-white text-black rounded-lg">
      <h1 className="text-4xl font-bold text-black!">My Profile</h1>

      {status === 'loading' && <p className="text-black/80 mt-6">Loading profile...</p>}
      {status === 'error' && <p className="text-black/80 mt-6">Could not load your profile.</p>}

      {status === 'ready' && user && (
        <>
          <dl className="flex flex-col gap-4 mt-6 max-w-md">
            <div>
              <dt className="text-sm text-black/60">Name</dt>
              <dd className="text-lg">{user.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-black/60">Email</dt>
              <dd className="text-lg">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-black/60">Account Type</dt>
              <dd className="text-lg">{roleLabel}</dd>
            </div>
            <div>
              <dt className="text-sm text-black/60">Member Since</dt>
              <dd className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-block mt-8 px-8 py-2.5 bg-[#fd0000] text-white rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none"
          >
            Log Out
          </button>
        </>
      )}
    </div>
  );
}
