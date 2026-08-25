import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { CheckoutSelectionProvider } from '@/components/CheckoutSelectionProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ShopSpinco',
  description: 'Quality freeze-dried products, made simple.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CheckoutSelectionProvider>
            <div className="app-shell">
              <Navbar />
              <main className="flex-1 flex flex-col pt-[74px]">{children}</main>
              <Footer />
            </div>
          </CheckoutSelectionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
