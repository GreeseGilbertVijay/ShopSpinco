'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

export const inputClassName =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ icon, className = '', ...props }, ref) {
  if (icon) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</span>
        <input ref={ref} className={`${inputClassName} pl-10 ${className}`} {...props} />
      </div>
    );
  }
  return <input ref={ref} className={`${inputClassName} ${className}`} {...props} />;
});

export default Input;

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = '', ...props },
  ref
) {
  return <textarea ref={ref} className={`${inputClassName} resize-y ${className}`} {...props} />;
});
