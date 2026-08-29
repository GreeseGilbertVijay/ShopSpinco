export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="w-full aspect-square skeleton" />
      <div className="p-5 flex flex-col gap-3">
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td className="px-4 py-3" key={i}>
          <SkeletonBlock className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
