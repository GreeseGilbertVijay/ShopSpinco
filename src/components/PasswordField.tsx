'use client';

import { useState, type InputHTMLAttributes } from 'react';

export default function PasswordField({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`${className} w-full pr-10`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute right-0 top-0 h-full px-3 flex items-center justify-center bg-transparent border-none text-black/50 cursor-pointer hover:text-black/80"
      >
        {visible ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.06 4.11M6.53 6.53C3.6 8.36 2 11.94 2 12s3.5 7 10 7a10.9 10.9 0 0 0 5.47-1.47M9.88 9.88a3 3 0 0 0 4.24 4.24" />
            <path d="M2 2l20 20" />
          </svg>
        )}
      </button>
    </div>
  );
}
