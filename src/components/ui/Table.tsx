import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export function TableContainer({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`overflow-auto border border-gray-200 rounded-xl ${className}`} {...props} />;
}

export function Table({ className = '', ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={`w-full border-collapse text-sm ${className}`} {...props} />;
}

export function Thead({ className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`bg-gray-50 sticky top-0 z-10 ${className}`} {...props} />;
}

export function Th({ className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap ${className}`}
      {...props}
    />
  );
}

export function Td({ className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3 border-b border-gray-100 text-gray-700 ${className}`} {...props} />;
}

export function Tr({ className = '', ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`even:bg-gray-50/60 hover:bg-accent-subtle/40 transition-colors ${className}`} {...props} />;
}
