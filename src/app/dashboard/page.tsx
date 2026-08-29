import Link from 'next/link';
import Card from '@/components/ui/Card';

const actions = [
  {
    href: '/dashboard/create-product',
    title: 'Create Product',
    description: 'Add a new product to the catalogue.',
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    href: '/dashboard/products',
    title: 'View Products',
    description: 'Browse, edit and remove products.',
    icon: <path d="M4 7h16M4 12h16M4 17h10" />,
  },
  {
    href: '/dashboard/submissions',
    title: 'View Submissions',
    description: 'Review quote requests from customers.',
    icon: <path d="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />,
  },
  {
    href: '/dashboard/users?role=customer',
    title: 'View Customers',
    description: 'See registered customer accounts.',
    icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 4a3 3 0 0 0 0-6M23 21v-2a4 4 0 0 0-3-3.87" />,
  },
  {
    href: '/dashboard/users',
    title: 'View All Users',
    description: 'Manage every account in the system.',
    icon: <path d="M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
  },
];

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-8 text-left">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900! mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage products, quote submissions and users.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="no-underline text-inherit block">
            <Card className="p-5 h-full flex flex-col gap-3 transition-all hover:border-gray-300 hover:-translate-y-1 hover:shadow-elevated">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-subtle text-accent-hover">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {action.icon}
                </svg>
              </span>
              <div>
                <p className="font-semibold text-gray-900!">{action.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{action.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
