'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkCls = 'no-underline text-inherit transition-colors hover:text-[#f29a4e]';
  const isLoggedIn = Boolean(user);

  return (
    <nav className="fixed top-[10px] inset-x-0 z-50 h-16 flex items-center justify-between mx-[5%] px-2 bg-white border-[5px] border-solid border-[#f5f5f5] rounded-[50px]">
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-l no-underline text-inherit"
        onClick={() => setMenuOpen(false)}
      >
        <img src="/logo.png" alt="Spinco" className="h-8 w-auto" />
        Shop
      </Link>

      <div className="hidden md:flex items-center gap-6">
        <Link className={linkCls} href="/">
          Shop
        </Link>
        {user?.role === 'superAdmin' && (
          <Link className={linkCls} href="/dashboard">
            Dashboard
          </Link>
        )}
        {isLoggedIn ? (
          <Link className={`${linkCls} flex items-center`} href="/profile" aria-label="My Profile" title="My Profile">
            <ProfileIcon />
          </Link>
        ) : (
          <>
            <Link className={linkCls} href="/login">
              Log In
            </Link>
            <Link className={linkCls} href="/register">
              Register
            </Link>
          </>
        )}
      </div>

      <button
        type="button"
        className="md:hidden inline-flex items-center justify-center w-9 h-9 -mr-1.5 bg-transparent border-0 text-inherit cursor-pointer"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 flex flex-col gap-1 px-4 py-3 bg-white border-b border-black/15 shadow-[0_8px_16px_rgba(0,0,0,0.35)] z-50 text-left">
          <Link className={`${linkCls} py-2`} href="/" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          {user?.role === 'superAdmin' && (
            <Link className={`${linkCls} py-2`} href="/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          )}
          {isLoggedIn ? (
            <Link className={`${linkCls} py-2 flex items-center gap-2`} href="/profile" onClick={() => setMenuOpen(false)}>
              <ProfileIcon />
              My Profile
            </Link>
          ) : (
            <>
              <Link className={`${linkCls} py-2`} href="/login" onClick={() => setMenuOpen(false)}>
                Log In
              </Link>
              <Link className={`${linkCls} py-2`} href="/register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
