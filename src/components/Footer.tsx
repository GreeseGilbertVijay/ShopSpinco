import Link from 'next/link';

const linkCls = 'no-underline text-gray-500 text-sm transition-colors hover:text-accent';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10 text-left">
        <div>
          <Link href="https://spincotech.com/" className="flex items-center gap-2 font-bold text-gray-900! no-underline">
            <img src="/logo.png" alt="Spinco" className="h-8 w-auto" />
            Shop
          </Link>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900! mb-3">Shop</h3>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            <li>
              <Link className={linkCls} href="/">
                Shop
              </Link>
            </li>
            <li>
              <Link className={linkCls} href="/login">
                Log in
              </Link>
            </li>
            <li>
              <Link className={linkCls} href="/register">
                Create Account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900! mb-3">Company</h3>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            <li>
              <a className={linkCls} href="https://spincotech.com/about-us/" target="_blank" rel="noopener noreferrer">
                About Spinco
              </a>
            </li>
            <li>
              <a className={linkCls} href="https://spincotech.com/contact-us/" target="_blank" rel="noopener noreferrer">
                Contact us
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 sm:px-8 py-5 text-center text-xs text-gray-400">
        © 2015 – {new Date().getFullYear()} Spincotech. All rights reserved.
      </div>
    </footer>
  );
}
