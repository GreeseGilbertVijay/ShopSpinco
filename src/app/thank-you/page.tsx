import Link from 'next/link';

export default function ThankYou() {
  return (
    <div className="max-w-[960px] p-8 text-left bg-white text-black rounded-lg">
      <h1 className="text-4xl font-bold text-black!">Thank you!</h1>
      <p className="text-black/80">
        Your quote request has been sent. We&apos;ve emailed you a confirmation and will be in touch shortly.
      </p>
      <Link
        href="/"
        className="inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none"
      >
        Back to shop
      </Link>
    </div>
  );
}
