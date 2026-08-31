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
