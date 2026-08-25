'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts, type Product } from '@/lib/api';

const viewProductBtn =
  'box-border w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-black/20 bg-transparent text-black rounded-md cursor-pointer text-sm no-underline transition-all hover:border-[#f29a4e] hover:bg-[#f29a4e]/10 active:translate-y-0';

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
    <div className="text-left bg-white rounded-lg overflow-hidden">
      <div className="relative w-full h-[300px]">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="/Cryodry%20Banner%20Image.jpg"
          alt="Shop Banner"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl font-bold text-white">Shop</h1>
        </div>
      </div>

      <div className="p-8">
        {status === 'loading' && (
          <div className="grid gap-6 mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="border border-black/10 rounded-xl overflow-hidden animate-pulse" key={i}>
                <div className="w-full aspect-square bg-black/5" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-4 w-2/3 bg-black/10 rounded" />
                  <div className="h-3 w-full bg-black/5 rounded" />
                  <div className="h-3 w-4/5 bg-black/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && <p className="text-black/60 mt-8">Could not load products. Is the backend running?</p>}
        {status === 'ready' && products.length === 0 && <p className="text-black/60 mt-8">No products yet.</p>}

        {status === 'ready' && products.length > 0 && (
          <div className="grid gap-6 mt-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                className="group border border-black/10 rounded-xl overflow-hidden bg-black/[0.03] flex flex-col transition-all hover:border-black/25 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                key={product._id}
              >
                <Link className="block text-inherit no-underline px-5 pt-5" href={`/shop/${product._id}`}>
                  <h3 className="text-lg font-semibold text-black">{product.name}</h3>
                </Link>
                <Link className="block text-inherit no-underline px-5 mt-3" href={`/shop/${product._id}`}>
                  <div className="w-full aspect-square bg-black/5 overflow-hidden rounded-lg">
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
                  <p className="text-black/60 text-sm leading-relaxed line-clamp-2">{product.description}</p>

                  <div className="flex gap-2 mt-4">
                    <Link href={`/shop/${product._id}`} className={viewProductBtn}>
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
