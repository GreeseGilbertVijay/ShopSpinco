import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { CheckoutSelectionProvider } from '@/components/CheckoutSelectionProvider';
import SiteChrome from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: 'ShopSpinco',
  description: 'Quality freeze-dried products, made simple.',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <AuthProvider>
          <CheckoutSelectionProvider>
            <div className="app-shell">
              <SiteChrome>{children}</SiteChrome>
            </div>
          </CheckoutSelectionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
