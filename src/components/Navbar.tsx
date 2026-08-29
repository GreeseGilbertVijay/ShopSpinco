'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ubuntu } from 'next/font/google';
import { useAuth } from './AuthProvider';

const ubuntu = Ubuntu({ subsets: ['latin'], weight: ['500'] });

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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function linkCls(href: string) {
    const active = href === '/' ? pathname === '/' : pathname?.startsWith(href);
    return `relative no-underline transition-colors py-1 ${
      active ? 'text-gray-900! font-semibold' : 'text-gray-600 hover:text-gray-900'
    } after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-accent after:origin-left after:transition-transform ${
      active ? 'after:scale-x-100' : 'after:scale-x-0'
    }`;
  }

  const isLoggedIn = Boolean(user);

  return (
    <nav
      className={`${ubuntu.className} font-medium text-base fixed top-[10px] inset-x-0 z-50 h-16 flex items-center justify-between mx-[5%] px-2 bg-white border-[5px] border-solid border-gray-100 rounded-[50px] transition-shadow duration-300 ${
        scrolled ? 'shadow-elevated' : 'shadow-none'
      }`}
    >
      <Link
        href="https://spincotech.com/"
        className="flex items-center gap-2 font-bold text-l no-underline text-gray-900!"
        onClick={() => setMenuOpen(false)}
      >
        <img src="/logo.png" alt="Spinco" className="h-8 w-auto" />
        Shop
      </Link>

      <div className="hidden md:flex items-center gap-6">
        <Link className={linkCls('/')} href="/">
          Shop
        </Link>
        {user?.role === 'superAdmin' && (
          <Link className={linkCls('/dashboard')} href="/dashboard">
            Dashboard
          </Link>
        )}
        {isLoggedIn ? (
          <Link className={`${linkCls('/profile')} flex items-center`} href="/profile" aria-label="My Profile" title="My Profile">
            <ProfileIcon />
          </Link>
        ) : (
          <>
            <Link className={linkCls('/login')} href="/login">
              Log In
            </Link>
            <Link className={linkCls('/register')} href="/register">
              Register
            </Link>
          </>
        )}
        <Link
          href="https://spincotech.com/contact-us/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white no-underline text-sm font-medium transition-all hover:bg-black hover:-translate-y-0.5 hover:shadow-elevated"
        >
          Contact
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <button
        type="button"
        className="md:hidden inline-flex items-center justify-center w-9 h-9 -mr-1.5 bg-transparent border-0 text-gray-900 cursor-pointer"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 flex flex-col gap-1 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-lifted z-50 text-left">
          <Link className={`${linkCls('/')} py-2`} href="/" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          {user?.role === 'superAdmin' && (
            <Link className={`${linkCls('/dashboard')} py-2`} href="/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          )}
          {isLoggedIn ? (
            <Link className={`${linkCls('/profile')} py-2 flex items-center gap-2`} href="/profile" onClick={() => setMenuOpen(false)}>
              <ProfileIcon />
              My Profile
            </Link>
          ) : (
            <>
              <Link className={`${linkCls('/login')} py-2`} href="/login" onClick={() => setMenuOpen(false)}>
                Log In
              </Link>
              <Link className={`${linkCls('/register')} py-2`} href="/register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
          <Link
            href="https://spincotech.com/contact-us/"
            className="inline-flex items-center justify-center gap-1.5 mt-1 px-4 py-2.5 rounded-full bg-gray-900 text-white no-underline text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Contact
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </nav>
  );
}
