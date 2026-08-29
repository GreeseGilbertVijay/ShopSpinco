'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getProducts, deleteProduct, type Product } from '@/lib/api';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { buttonClasses } from '@/components/ui/Button';
import { inputClassName } from '@/components/ui/Input';
import { SkeletonBlock } from '@/components/ui/Skeleton';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !term || product.name.toLowerCase().includes(term);
      const matchesDate = !dateFilter || new Date(product.createdAt).toISOString().slice(0, 10) === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [products, search, dateFilter]);

  const hasActiveFilters = search.trim() !== '' || dateFilter !== '';

  function clearFilters() {
    setSearch('');
    setDateFilter('');
  }

  function loadProducts() {
    getProducts()
      .then((data) => {
        setProducts(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }

  useEffect(loadProducts, []);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete._id);
    setDeleteError('');
    try {
      await deleteProduct(pendingDelete._id);
      setProducts((prev) => prev.filter((p) => p._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (err) {
      setDeleteError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-8 text-left">
      <Link href="/dashboard" className="inline-flex items-center gap-1 mb-4 text-sm text-gray-500 no-underline hover:text-gray-900 transition-colors">
        &larr; Back to dashboard
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900!">Products</h1>
        <Link href="/dashboard/create-product" className={buttonClasses()}>
          + Create Product
        </Link>
      </div>

      {status === 'ready' && products.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClassName} flex-1 min-w-[220px]`}
          />
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={inputClassName} />
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className={buttonClasses({ variant: 'ghost' })}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {status === 'loading' && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl" key={i}>
              <div className="skeleton w-12 h-12 rounded-lg" />
              <SkeletonBlock className="h-4 flex-1" />
            </div>
          ))}
        </div>
      )}
      {status === 'error' && <EmptyState title="Could not load products" description="Please try again shortly." />}
      {status === 'ready' && products.length === 0 && (
        <EmptyState
          title="No products yet"
          description="Create your first product to get started."
          action={
            <Link href="/dashboard/create-product" className={buttonClasses()}>
              + Create Product
            </Link>
          }
        />
      )}
      {status === 'ready' && products.length > 0 && filteredProducts.length === 0 && (
        <EmptyState title="No products match your filters" />
      )}

      <div className="flex flex-col gap-3">
        {filteredProducts.map((product) => (
          <Card className="flex items-center gap-4 p-3 transition-colors hover:border-gray-300" key={product._id}>
            {product.imageUrl ? (
              <img className="w-12 h-12 object-cover rounded-lg" src={product.imageUrl} alt={product.name} />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100" />
            )}
            <span className="flex-1 font-semibold text-gray-900">{product.name}</span>
            <div className="flex gap-2">
              <Link href={`/dashboard/edit-product/${product._id}`} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
                Edit
              </Link>
              <button
                type="button"
                className={buttonClasses({ variant: 'danger', size: 'sm' })}
                onClick={() => {
                  setPendingDelete(product);
                  setDeleteError('');
                }}
                disabled={deletingId === product._id}
              >
                {deletingId === product._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete product"
        message={pendingDelete ? `Delete "${pendingDelete.name}"? This can't be undone.` : ''}
        confirmLabel="Delete"
        confirming={Boolean(deletingId)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      {deleteError && <p className="error mt-3">{deleteError}</p>}
    </div>
  );
}
