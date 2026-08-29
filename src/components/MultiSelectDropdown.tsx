'use client';

import { useEffect, useRef, useState } from 'react';

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  className = '',
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function toggleOption(option: string) {
    onChange(selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]);
  }

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-left text-gray-900 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
      >
        <span className={`truncate ${selected.length === 0 ? 'text-gray-400' : ''}`}>
          {selected.length === 0 ? placeholder : selected.join(', ')}
        </span>
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
          className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-elevated py-1"
        >
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <label
                key={option}
                role="option"
                aria-selected={isSelected}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
              >
                <span className="relative inline-flex items-center justify-center w-4 h-4 shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOption(option)}
                    className="appearance-none w-4 h-4 rounded-sm border border-gray-400 bg-white checked:bg-white checked:border-accent focus:outline-none"
                  />
                  {isSelected && (
                    <svg
                      className="pointer-events-none absolute inset-0 m-auto text-accent-hover"
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
                {option}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
