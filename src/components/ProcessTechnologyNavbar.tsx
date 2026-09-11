'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ubuntu } from 'next/font/google';

const ubuntu = Ubuntu({ subsets: ['latin'], weight: ['500'] });

const NAV_LINKS = [
  { href: 'https://spincotech.com/', label: 'Home' },
  { href: 'https://spincotech.com/about-us/', label: 'About Us' },
  { href: 'https://spincotech.com/solutions/', label: 'Solutions' },
  { href: 'https://spincotech.com/cuttingedge/', label: 'CuttingEdge' },
   { href: 'https://spincotech.com/news-and-events/', label: 'News & Events' },
  { href: 'https://shop.spincotech.com/', label: 'Shop' },
];

export default function ProcessTechnologyNavbar() {
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

  return (
    <nav
      className={`${ubuntu.className} font-medium text-base fixed top-[10px] inset-x-0 z-50 h-16 flex items-center justify-between mx-[15%] px-1 bg-white border-[5px] border-solid border-gray-100 rounded-[50px] transition-shadow duration-300 ${
        scrolled ? 'shadow-elevated' : 'shadow-none'
      }`}
    >
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-l no-underline text-gray-900!"
        onClick={() => setMenuOpen(false)}
      >
        <img src="/Spincotech-Logo.png" alt="Spinco" className="h-14 w-auto" />
      </Link>

      <div className="hidden md:flex items-center gap-[12px]">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="relative no-underline text-[16px] font-medium text-[#1a1a1a] hover:opacity-70 transition-opacity py-1"
          >
            {link.label}
          </a>
        ))}
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
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="no-underline text-[16px] font-medium text-[#1a1a1a] hover:opacity-70 transition-opacity py-2"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
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
