'use client';

import { useState } from 'react';
import ProductForm from '@/components/ProductForm';
import { createProduct, type ProductInput } from '@/lib/api';
import FormActionBar from '@/components/ui/FormActionBar';

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
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-8 text-left">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900! mb-6">Create Product</h1>
      <ProductForm
        key={formKey}
        onSubmit={handleSubmit}
        submitLabel="Create Product"
        status={status}
        error={error}
        successMessage="Product created."
        hideSubmit
      />
      <FormActionBar
        formId="product-form"
        submitLabel="Create Product"
        status={status}
        successMessage="Product created."
        errorMessage={error}
        cancelHref="/dashboard/products"
      />
    </div>
  );
}
