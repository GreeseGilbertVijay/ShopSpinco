'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts, type Product } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { buttonClasses } from '@/components/ui/Button';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="text-left bg-white">
      <div className="relative w-full h-[420px] overflow-hidden">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="/Cryodry%20Banner%20Image.jpg"
          alt="Shop Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-white! m-0">Shop</h1>
          <p className="text-white/80 mt-3 max-w-xl text-base sm:text-lg">
            Browse our range and request a tailored quote for your business.
          </p>
          <a
            href="#products"
            className={buttonClasses({ variant: 'primary', size: 'lg', className: 'mt-7' })}
          >
            Browse Products
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
        </div>
      </div>

      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-8 py-12 scroll-mt-24">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900! m-0">All products</h2>
          <p className="text-sm text-gray-500 mt-1">Select a product to view details and request a quote.</p>
        </div>

        {status === 'loading' && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <EmptyState
            title="Could not load products"
            description="Something went wrong reaching the catalogue. Please check your connection and try again."
          />
        )}

        {status === 'ready' && products.length === 0 && (
          <EmptyState title="No products yet" description="Check back soon — new products are added regularly." />
        )}

        {status === 'ready' && products.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Card
                className="group overflow-hidden flex flex-col transition-all rounded-none! hover:border-gray-300 hover:-translate-y-1 hover:shadow-elevated"
                key={product._id}
              >
                <Link className="block text-inherit no-underline px-5 pt-5" href={`/shop/${product._id}`}>
                  <h3 className="text-lg font-semibold text-gray-900!">{product.name}</h3>
                </Link>
                <Link className="block text-inherit no-underline px-5 mt-3" href={`/shop/${product._id}`}>
                  <div className="w-full aspect-square bg-gray-50 overflow-hidden">
                    {product.imageUrl && (
                      <img
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={product.imageUrl}
                        alt={product.name}
                      />
                    )}
                  </div>
                </Link>
                <div className="p-5 flex flex-col gap-2 flex-1">
                  {product.sku && (
                    <div>
                      <Badge tone="neutral">{product.sku}</Badge>
                    </div>
                  )}
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{product.description}</p>

                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/shop/${product._id}`}
                      className={buttonClasses({
                        variant: 'primary',
                        className: 'w-full rounded-none! border border-accent! hover:bg-transparent!',
                      })}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
