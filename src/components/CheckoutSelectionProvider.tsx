'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { QuoteSelection } from '@/lib/api';

export interface PendingCheckout {
  productId: string;
  productName: string;
  selections: QuoteSelection[];
}

interface CheckoutSelectionContextValue {
  setPending: (value: PendingCheckout) => void;
  consume: (productId: string) => PendingCheckout | null;
}

const CheckoutSelectionContext = createContext<CheckoutSelectionContextValue | null>(null);

export function CheckoutSelectionProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingCheckout | null>(null);

  function consume(productId: string) {
    return pending?.productId === productId ? pending : null;
  }

  return (
    <CheckoutSelectionContext.Provider value={{ setPending, consume }}>{children}</CheckoutSelectionContext.Provider>
  );
}

export function useCheckoutSelection() {
  const ctx = useContext(CheckoutSelectionContext);
  if (!ctx) throw new Error('useCheckoutSelection must be used within CheckoutSelectionProvider');
  return ctx;
}
