'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct, type Product } from '@/lib/api';
import { useCheckoutSelection } from '@/components/CheckoutSelectionProvider';

export default function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { setPending } = useCheckoutSelection();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [selectionError, setSelectionError] = useState(false);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getProduct(id)
      .then((data) => {
        setProduct(data);
        setSelected({});
        setActiveTab(0);
        setActiveImage(0);
        setStatus('ready');
        setSelectionError(false);
      })
      .catch(() => setStatus('error'));
  }, [id]);

  const galleryImages = product
    ? [...new Set([product.imageUrl, ...(product.images || [])].filter(Boolean))]
    : [];

  useEffect(() => {
    if (galleryPaused || galleryImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImage((i) => (i + 1) % galleryImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [galleryPaused, galleryImages.length]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (status === 'loading') return <div className="max-w-[960px] mx-auto p-8"><p>Loading...</p></div>;
  if (status === 'error' || !product) {
    return (
      <div className="max-w-[960px] mx-auto p-8">
        <p>Product not found.</p>
        <Link href="/">Back to shop</Link>
      </div>
    );
  }

  const groups = product.variationGroups || [];
  const tabs = product.tabs || [];

  function goToPrevImage() {
    setActiveImage((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  }

  function goToNextImage() {
    setActiveImage((i) => (i + 1) % galleryImages.length);
  }

  function scrollThumbs(direction: -1 | 1) {
    thumbStripRef.current?.scrollBy({ left: direction * 160, behavior: 'smooth' });
  }

  function handleSelect(groupName: string, optionLabel: string) {
    setSelected({ ...selected, [groupName]: optionLabel });
    setSelectionError(false);
  }

  function handleGetQuote() {
    if (!product) return;
    const missingSelection = groups.some((g) => !selected[g.name]);
    if (missingSelection) {
      setSelectionError(true);
      return;
    }
    const selections = groups.map((g) => ({ group: g.name, option: selected[g.name] }));
    setPending({ productId: product._id, productName: product.name, selections });
    router.push(`/shop/${product._id}/checkout`);
  }

  return (
    <div className="max-w-7xl mx-auto p-8 text-left bg-white text-black rounded-lg">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 mb-6 text-black/70 no-underline text-sm transition-colors hover:text-black"
      >
        &larr; Back to shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-10 items-start">
        <div className="min-w-0 lg:sticky lg:top-8">
          <div
            className="relative border border-black/15 rounded-xl overflow-hidden bg-black/[0.03]"
            onMouseEnter={() => setGalleryPaused(true)}
            onMouseLeave={() => setGalleryPaused(false)}
          >
            {galleryImages.length > 0 && (
              <img
                className="w-full aspect-square object-cover"
                src={galleryImages[activeImage]}
                alt={product.name}
              />
            )}

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={goToPrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 text-black border-0 cursor-pointer transition-all hover:bg-white hover:scale-105"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={goToNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 text-black border-0 cursor-pointer transition-all hover:bg-white hover:scale-105"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {galleryImages.map((url, index) => (
                    <button
                      type="button"
                      key={url}
                      aria-label={`Go to image ${index + 1}`}
                      onClick={() => setActiveImage(index)}
                      className={`w-2 h-2 p-0 rounded-full border-0 cursor-pointer transition-all ${
                        activeImage === index ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2 pt-3 pb-1">
              <button
                type="button"
                aria-label="Scroll thumbnails left"
                onClick={() => scrollThumbs(-1)}
                className="flex-none inline-flex items-center justify-center w-7 h-7 rounded-full border border-black/15 bg-white text-black cursor-pointer transition-all hover:border-[#f29a4e] hover:text-[#f29a4e]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div ref={thumbStripRef} className="flex gap-2 overflow-x-auto scroll-smooth">
                {galleryImages.map((url, index) => (
                  <button
                    type="button"
                    key={url}
                    className={`flex-none w-16 h-16 p-0 rounded-md bg-transparent cursor-pointer overflow-hidden leading-none transition-all ${
                      activeImage === index
                        ? 'ring-2 ring-[#f29a4e]'
                        : 'ring-1 ring-black/15 opacity-70 hover:opacity-100 hover:ring-black/40'
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img className="w-full h-full object-cover block" src={url} alt={product.name} />
                  </button>
                ))}
              </div>

              <button
                type="button"
                aria-label="Scroll thumbnails right"
                onClick={() => scrollThumbs(1)}
                className="flex-none inline-flex items-center justify-center w-7 h-7 rounded-full border border-black/15 bg-white text-black cursor-pointer transition-all hover:border-[#f29a4e] hover:text-[#f29a4e]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-3xl md:text-4xl font-bold text-black! leading-tight">{product.name}</h1>
          {product.description && <p className="text-black/70 mt-2 leading-relaxed">{product.description}</p>}

          {groups.length > 0 && (
            <div className="mt-6 flex flex-col gap-4 border-t border-black/10 pt-6">
              {groups.map((group) => (
                <div className="flex items-center gap-4" key={group.name}>
                  <span className="w-28 shrink-0 text-sm font-semibold text-black/90">{group.name}</span>
                  <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 -mb-1">
                    {group.options.map((option) => (
                      <button
                        type="button"
                        key={option.label}
                        title={option.label}
                        className={`flex-none inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-inherit bg-transparent cursor-pointer text-sm whitespace-nowrap transition-all hover:border-[#f29a4e] hover:-translate-y-0.5 ${
                          selected[group.name] === option.label
                            ? 'border-[#f29a4e] bg-[#f29a4e]/15 text-black'
                            : 'border-black/15 text-black/80'
                        }`}
                        onClick={() => handleSelect(group.name, option.label)}
                      >
                        {option.imageUrl && <img className="w-6 h-6 object-cover rounded-full" src={option.imageUrl} alt="" />}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto mt-8 px-7 py-3 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base font-medium transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none"
            onClick={handleGetQuote}
          >
            Get Quote
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>

          {selectionError && <p className="mt-3 text-sm font-medium text-red-600">Please select the variations</p>}

          <div className="flex items-center gap-3 mt-5">
            <span className="text-sm text-black/60">Share:</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${product.name} - ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-black/15 text-black/70 no-underline transition-all hover:border-[#25D366] hover:text-[#25D366] hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12.003 2C6.478 2 2 6.478 2 12.003c0 1.87.51 3.622 1.396 5.123L2 22l4.995-1.354a9.94 9.94 0 0 0 5.008 1.354h.004c5.524 0 10.001-4.478 10.001-10.003C22 6.478 17.523 2 12.003 2zm0 18.152a8.13 8.13 0 0 1-4.147-1.14l-.297-.176-3.026.821.807-2.949-.193-.303a8.116 8.116 0 0 1-1.24-4.402c0-4.487 3.652-8.14 8.14-8.14 4.487 0 8.139 3.653 8.139 8.14 0 4.488-3.652 8.15-8.14 8.15z" />
              </svg>
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(`Check out this product: ${shareUrl}`)}`}
              aria-label="Share via Email"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-black/15 text-black/70 no-underline transition-all hover:border-[#f29a4e] hover:text-[#f29a4e] hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 6-10 7L2 6" />
              </svg>
            </a>
          </div>

          {product.sku && <p className="mt-3 text-sm text-black/50">SKU: {product.sku}</p>}
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="mt-12 border-t border-black/10 pt-8">
          <div className="flex flex-wrap gap-1 border-b border-black/15">
            {tabs.map((tab, index) => (
              <button
                type="button"
                key={tab.name}
                className={`px-[1.1rem] py-2.5 border-0 border-b-2 bg-transparent text-inherit cursor-pointer text-base transition-all hover:opacity-100 ${
                  activeTab === index ? 'opacity-100 border-b-[#f29a4e] font-semibold' : 'opacity-70 border-transparent'
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="py-5 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: tabs[activeTab]?.content || '' }} />
        </div>
      )}
    </div>
  );
}
