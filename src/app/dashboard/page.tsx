import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="p-8 text-left bg-white text-black rounded-lg">
      <h1 className="text-4xl font-bold text-black!">Dashboard</h1>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/create-product"
          className="inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none"
        >
          + Create Product
        </Link>
        <Link
          href="/dashboard/products"
          className="inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none"
        >
          View Products
        </Link>
        <Link
          href="/dashboard/submissions"
          className="inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none"
        >
          View Submissions
        </Link>
        <Link
          href="/dashboard/users?role=customer"
          className="inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none"
        >
          View Customers
        </Link>
        <Link
          href="/dashboard/users"
          className="inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none"
        >
          View All Users
        </Link>
      </div>
    </div>
  );
}
