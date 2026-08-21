'use client';

import { useState } from 'react';
import ProductForm from '@/components/ProductForm';
import { createProduct, type ProductInput } from '@/lib/api';

export default function CreateProduct() {
  const [formKey, setFormKey] = useState(0);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(product: ProductInput) {
    setStatus('submitting');
    setError('');
    try {
      await createProduct(product);
      setStatus('success');
      setFormKey((k) => k + 1);
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  }

  return (
    <div className="max-w-7xl p-8 pr-48 text-left bg-white text-black rounded-lg relative">
      <button
        type="submit"
        form="product-form"
        disabled={status === 'submitting'}
        className="fixed top-24 right-16 z-50 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer text-base font-medium shadow-[0_6px_14px_rgba(0,0,0,0.35)] transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(242,154,78,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {status === 'submitting' ? 'Saving...' : 'Create Product'}
      </button>

      <h1 className="text-4xl font-bold text-black!">Create Product</h1>
      <ProductForm
        key={formKey}
        onSubmit={handleSubmit}
        submitLabel="Create Product"
        status={status}
        error={error}
        successMessage="Product created."
        hideSubmit
      />
    </div>
  );
}
