'use client';

export default function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className = '',
}: {
  tabs: { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-1 border-b border-gray-200 ${className}`}>
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.key}
          className={`px-4 py-2.5 -mb-px border-0 border-b-2 bg-transparent cursor-pointer text-sm font-medium transition-colors ${
            active === tab.key
              ? 'border-accent text-gray-900!'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
