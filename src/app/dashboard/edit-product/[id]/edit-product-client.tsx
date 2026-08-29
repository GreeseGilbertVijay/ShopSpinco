'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductForm from '@/components/ProductForm';
import { getProduct, updateProduct, type Product, type ProductInput } from '@/lib/api';
import FormActionBar from '@/components/ui/FormActionBar';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClasses } from '@/components/ui/Button';

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

  if (loadStatus === 'loading') {
    return (
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-8">
        <div className="skeleton h-9 w-1/3 rounded-md mb-6" />
        <div className="skeleton h-64 w-full rounded-xl" />
      </div>
    );
  }
  if (loadStatus === 'error' || !product) {
    return (
      <div className="max-w-3xl mx-auto w-full p-4 sm:p-8">
        <EmptyState
          title="Product not found"
          action={
            <Link href="/dashboard" className={buttonClasses({ variant: 'secondary' })}>
              Back to dashboard
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-8 text-left">
      <Link href="/dashboard" className="inline-flex items-center gap-1 mb-4 text-sm text-gray-500 no-underline hover:text-gray-900 transition-colors">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900! mb-6">Edit Product</h1>
      <ProductForm
        initialValues={product}
        onSubmit={handleSubmit}
        submitLabel="Update Product"
        status={status}
        error={error}
        successMessage="Product updated."
        hideSubmit
      />
      <FormActionBar
        formId="product-form"
        submitLabel="Update Product"
        status={status}
        successMessage="Product updated."
        errorMessage={error}
        cancelHref="/dashboard/products"
      />
    </div>
  );
}
