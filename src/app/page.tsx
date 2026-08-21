import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-[960px] mx-auto p-8 text-left bg-white text-black rounded-lg">
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl font-bold text-black!">ShopSpinco</h1>
        <p className="text-black/80">Quality freeze-dried products, made simple.</p>
        <Link
          href="/shop"
          className="inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none"
        >
          Shop Now
        </Link>
      </section>
    </div>
  );
}
