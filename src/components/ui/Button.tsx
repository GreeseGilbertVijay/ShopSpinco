'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium no-underline cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none active:translate-y-0';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-black shadow-card hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevated',
  secondary: 'bg-white text-gray-900 border border-gray-300 hover:border-accent hover:bg-accent-subtle',
  danger: 'bg-white text-danger border border-danger/30 hover:bg-danger-subtle hover:border-danger',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
        </svg>
      )}
      {children}
    </button>
  );
});

export default Button;
