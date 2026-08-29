'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUsers, ApiError, type User } from '@/lib/api';
import { TableContainer, Table, Thead, Th, Tr, Td } from '@/components/ui/Table';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonBlock } from '@/components/ui/Skeleton';

const FILTER_TABS = [
  { key: 'all', label: 'All Users' },
  { key: 'customer', label: 'Customers' },
  { key: 'superAdmin', label: 'Admins' },
];

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

  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-8 text-left">
      <Link href="/dashboard" className="inline-flex items-center gap-1 mb-4 text-sm text-gray-500 no-underline hover:text-gray-900 transition-colors">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900! mb-6">Users</h1>

      <Tabs tabs={FILTER_TABS} active={filter} onChange={handleFilterChange} className="mb-6" />

      {status === 'loading' && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock className="h-10 w-full" key={i} />
          ))}
        </div>
      )}
      {status === 'error' && <EmptyState title="Could not load users" description="Please try again shortly." />}
      {status === 'ready' && users.length === 0 && <EmptyState title="No users found" />}

      {status === 'ready' && users.length > 0 && (
        <TableContainer>
          <Table className="whitespace-nowrap">
            <Thead>
              <tr>
                {['Name', 'Email', 'Role', 'Verified', 'Registered'].map((h) => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </Thead>
            <tbody>
              {users.map((user) => (
                <Tr key={user._id}>
                  <Td>{user.name || '—'}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge tone={user.role === 'superAdmin' ? 'accent' : 'neutral'}>{user.role}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={user.role === 'superAdmin' || user.isVerified ? 'success' : 'neutral'}>
                      {user.role === 'superAdmin' || user.isVerified ? 'Yes' : 'No'}
                    </Badge>
                  </Td>
                  <Td>{new Date(user.createdAt).toLocaleString()}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
