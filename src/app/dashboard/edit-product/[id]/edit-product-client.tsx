'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductForm from '@/components/ProductForm';
import { getProduct, updateProduct, type Product, type ProductInput } from '@/lib/api';

export default function EditProductClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    getProduct(id)
      .then((data) => {
        setProduct(data);
        setLoadStatus('ready');
      })
      .catch(() => setLoadStatus('error'));
  }, [id]);

  async function handleSubmit(update: ProductInput) {
    setStatus('submitting');
    setError('');
    try {
      await updateProduct(id, update);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  }

  if (loadStatus === 'loading') return <div className="max-w-[960px] mx-auto p-8"><p>Loading...</p></div>;
  if (loadStatus === 'error' || !product) {
    return (
      <div className="max-w-[960px] mx-auto p-8">
        <p>Product not found.</p>
        <Link href="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl p-8 text-left bg-white text-black rounded-lg relative">
      <div className="fixed top-24 right-16 z-50 flex flex-col items-end gap-2">
        <button
          type="submit"
          form="product-form"
          disabled={status === 'submitting'}
          className="px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.35)] transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(242,154,78,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {status === 'submitting' ? 'Saving...' : 'Update Product'}
        </button>
        {status === 'success' && (
          <p className="success m-0 text-sm bg-white px-3 py-1.5 rounded-md shadow-[0_4px_10px_rgba(0,0,0,0.25)]">
            Product updated.
          </p>
        )}
        {status === 'error' && (
          <p className="error m-0 text-sm bg-white px-3 py-1.5 rounded-md shadow-[0_4px_10px_rgba(0,0,0,0.25)] max-w-xs text-right">
            {error}
          </p>
        )}
      </div>

      <Link href="/dashboard" className="inline-block mb-4 text-inherit no-underline">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-4xl font-bold text-black!">Edit Product</h1>
      <ProductForm
        initialValues={product}
        onSubmit={handleSubmit}
        submitLabel="Update Product"
        status={status}
        error={error}
        successMessage="Product updated."
        hideSubmit
      />
    </div>
  );
}
