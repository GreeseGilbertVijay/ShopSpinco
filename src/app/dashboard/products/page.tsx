'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getProducts, deleteProduct, type Product } from '@/lib/api';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setDeletingId(product._id);
    try {
      await deleteProduct(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      window.alert((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-8 text-left bg-white text-black rounded-lg">
      <Link href="/dashboard" className="inline-block mb-4 text-inherit no-underline">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-4xl font-bold text-black!">Products</h1>
      <Link
        href="/dashboard/create-product"
        className="inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none"
      >
        + Create Product
      </Link>

      {status === 'ready' && products.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2.5 rounded-md border border-black/15 bg-transparent text-black placeholder-black/40 focus:outline-none focus:border-[#f29a4e] flex-1 min-w-[220px]"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2.5 rounded-md border border-black/15 bg-transparent text-black placeholder-black/40 focus:outline-none focus:border-[#f29a4e]"
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-[0.9rem] py-[0.55rem] rounded-md border border-black/15 bg-transparent text-black cursor-pointer transition-all hover:bg-black/10"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {status === 'loading' && <p className="text-black/80">Loading products...</p>}
      {status === 'error' && <p className="text-black/80">Could not load products.</p>}
      {status === 'ready' && products.length === 0 && <p className="text-black/80">No products yet.</p>}
      {status === 'ready' && products.length > 0 && filteredProducts.length === 0 && (
        <p className="text-black/80 mt-6">No products match your filters.</p>
      )}

      <div className="flex flex-col gap-3 mt-6">
        {filteredProducts.map((product) => (
          <div className="flex items-center gap-4 p-3 border border-black/15 rounded-lg" key={product._id}>
            {product.imageUrl && <img className="w-12 h-12 object-cover rounded" src={product.imageUrl} alt={product.name} />}
            <span className="flex-1 font-semibold">{product.name}</span>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/edit-product/${product._id}`}
                className="px-[0.9rem] py-[0.4rem] rounded-md border border-[#f29a4e] bg-transparent text-black no-underline cursor-pointer transition-all hover:bg-[#f29a4e] hover:-translate-y-0.5 active:translate-y-0"
              >
                Edit
              </Link>
              <button
                type="button"
                className="px-[0.7rem] py-[0.4rem] rounded-md border border-[#ff6b6b] bg-transparent text-[#ff6b6b] cursor-pointer whitespace-nowrap transition-all hover:bg-[#ff6b6b] hover:text-black hover:-translate-y-0.5 active:translate-y-0"
                onClick={() => handleDelete(product)}
                disabled={deletingId === product._id}
              >
                {deletingId === product._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
