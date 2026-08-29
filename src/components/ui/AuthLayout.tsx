import type { ReactNode } from 'react';

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="my-4 sm:my-8 mx-auto max-w-5xl w-full rounded-xl shadow-lifted">
      <div className="grid grid-cols-1 sm:grid-cols-2 items-stretch bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="relative hidden sm:block h-[80vh]">
          <img src="/Spinco%20Company.jpeg" alt="Spinco" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <img src="/logo.png" alt="Spinco" className="h-9 w-auto mb-3" />
            <p className="text-white/85 text-sm max-w-xs">Quality freeze-dried products, made simple.</p>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto lg:overflow-visible">
          <div className="w-full max-w-md text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900!">{title}</h1>
            {subtitle && <p className="text-gray-500 mt-1 mb-6 sm:mb-8">{subtitle}</p>}
            {children}
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
