import type { ReactNode } from 'react';

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-2 py-16 px-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/60 ${className}`}
    >
      {icon && <div className="text-gray-300">{icon}</div>}
      <p className="text-gray-900 font-medium">{title}</p>
      {description && <p className="text-gray-500 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
