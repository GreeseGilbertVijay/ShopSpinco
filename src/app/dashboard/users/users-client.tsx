'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUsers, ApiError, type User } from '@/lib/api';

export default function UsersClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [filter, setFilter] = useState(searchParams.get('role') || 'all');

  function handleFilterChange(value: string) {
    setFilter(value);
    const query = value === 'all' ? '' : `?role=${encodeURIComponent(value)}`;
    router.replace(`${pathname}${query}`);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to loading before the refetch below settles
    setStatus('loading');
    getUsers(filter === 'all' ? undefined : filter)
      .then((data) => {
        setUsers(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          router.replace('/login');
          return;
        }
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const tabCls = (value: string) =>
    `px-[0.9rem] py-[0.55rem] rounded-md border border-black/15 cursor-pointer transition-all ${
      filter === value ? 'bg-[#f29a4e] text-black' : 'bg-transparent text-black hover:bg-black/10'
    }`;

  return (
    <div className="max-w-6xl p-8 text-left bg-white text-black rounded-lg">
      <Link href="/dashboard" className="inline-block mb-4 text-inherit no-underline">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-4xl font-bold text-black!">Users</h1>

      <div className="flex items-center gap-3 mt-4">
        <button type="button" className={tabCls('all')} onClick={() => handleFilterChange('all')}>
          All Users
        </button>
        <button type="button" className={tabCls('customer')} onClick={() => handleFilterChange('customer')}>
          Customers
        </button>
        <button type="button" className={tabCls('superAdmin')} onClick={() => handleFilterChange('superAdmin')}>
          Admins
        </button>
      </div>

      {status === 'loading' && <p className="text-black/80 mt-6">Loading users...</p>}
      {status === 'error' && <p className="text-black/80 mt-6">Could not load users.</p>}
      {status === 'ready' && users.length === 0 && <p className="text-black/80 mt-6">No users found.</p>}

      {status === 'ready' && users.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse whitespace-nowrap">
            <thead>
              <tr>
                {['Name', 'Email', 'Role', 'Verified', 'Registered'].map((h) => (
                  <th key={h} className="px-3.5 py-2.5 border border-black/15 text-left text-sm font-semibold bg-[#f29a4e]/10">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{user.name || '—'}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{user.email}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{user.role}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">
                    {user.role === 'superAdmin' || user.isVerified ? 'Yes' : 'No'}
                  </td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{new Date(user.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
