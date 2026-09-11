export default function Avatar({ name, className = '' }: { name: string; className?: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full bg-accent-subtle text-accent-hover font-semibold ${className}`}
    >
      {initials}
    </div>
  );
}
