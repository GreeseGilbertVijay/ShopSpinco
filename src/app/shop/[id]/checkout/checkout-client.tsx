'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct, submitQuote, type QuoteSelection, type FreezeDryerDetails } from '@/lib/api';
import { INDIAN_STATES } from '@/data/indianStates';
import { useCheckoutSelection } from '@/components/CheckoutSelectionProvider';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';

const inputCls =
  'px-3 py-2.5 rounded-md border border-black/15 bg-transparent text-black placeholder-black/40 focus:outline-none focus:border-[#f29a4e]';
const sectionHeadingCls = 'sm:col-span-2 text-lg font-semibold text-black! mt-2';
const hintCls = 'sm:col-span-2 text-sm text-black/60 -mt-1 mb-1';
const checkboxGroupCls = 'sm:col-span-2 flex flex-col gap-1.5';
const checkboxLabelCls = 'text-sm font-medium text-black/80';

type FreezeDryerListField = keyof Omit<FreezeDryerDetails, 'comments'>;

const FREEZE_DRYER_QUESTIONS: { key: FreezeDryerListField; label: string; options: string[] }[] = [
  {
    key: 'organizationSegment',
    label: '1. Organization Segment',
    options: [
      'Pharmaceutical',
      'Biopharmaceutical',
      'Biotechnology',
      'CRO',
      'CDMO',
      'Research Institute',
      'University',
      'Food & Nutraceutical',
      'Other',
    ],
  },
  {
    key: 'primaryApplication',
    label: '2. Primary Application',
    options: ['Formulation Development', 'Process Development', 'R&D', 'Scale-up', 'Small-scale Production', 'Other'],
  },
  {
    key: 'sampleProductType',
    label: '3. Sample / Product Type',
    options: ['Biologics', 'Vaccines', 'Pharmaceuticals', 'Proteins & Peptides', 'Microorganisms', 'Food & Nutraceuticals', 'Other'],
  },
  {
    key: 'intendedPurpose',
    label: '4. Intended Purpose',
    options: ['Research', 'Method or Cycle Development', 'Process Optimization', 'Scale-up', 'Small-scale Production'],
  },
  {
    key: 'currentSetup',
    label: '5. Current Freeze-Drying Setup',
    options: ['First Freeze Dryer', 'Existing Freeze Dryer', 'Replacement or Upgrade'],
  },
  {
    key: 'expectedUsage',
    label: '6. Expected Usage',
    options: ['Occasional', 'Regular', 'High-frequency'],
  },
  {
    key: 'purchaseTimeline',
    label: '7. Purchase Timeline',
    options: ['Immediate', '0–3 Months', '3–6 Months', '6–12 Months', 'Exploring Options'],
  },
];

function emptyFreezeDryerDetails(): FreezeDryerDetails {
  return {
    organizationSegment: [],
    primaryApplication: [],
    sampleProductType: [],
    intendedPurpose: [],
    currentSetup: [],
    expectedUsage: [],
    purchaseTimeline: [],
    comments: '',
  };
}

export default function CheckoutClient({ id }: { id: string }) {
  const router = useRouter();
  const { consume } = useCheckoutSelection();
  const pending = consume(id);

  const [productName, setProductName] = useState(pending?.productName || '');
  const [productImage, setProductImage] = useState('');
  const [productSku, setProductSku] = useState('');
  const [selections, setSelections] = useState<QuoteSelection[] | null>(pending?.selections || null);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>(pending ? 'ready' : 'loading');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    role: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [freezeDryerDetails, setFreezeDryerDetails] = useState<FreezeDryerDetails>(emptyFreezeDryerDetails());
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (pending) return;
    getProduct(id)
      .then((product) => {
        setProductName(product.name);
        setProductImage(product.imageUrl || product.images?.[0] || '');
        setProductSku(product.sku || '');
        setSelections((product.variationGroups || []).map((g) => ({ group: g.name, option: g.options[0]?.label || '' })));
        setLoadStatus('ready');
      })
      .catch(() => setLoadStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!pending) return;
    getProduct(id)
      .then((product) => {
        setProductImage(product.imageUrl || product.images?.[0] || '');
        setProductSku(product.sku || '');
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isFreezeDryer = productSku.toLowerCase().includes('freeze dryer');

  if (loadStatus === 'loading') return <div className="max-w-[960px] mx-auto p-8"><p>Loading...</p></div>;
  if (loadStatus === 'error') {
    return (
      <div className="max-w-[960px] mx-auto p-8">
        <p>Product not found.</p>
        <Link href="/">Back to shop</Link>
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function setFreezeDryerField(key: FreezeDryerListField, next: string[]) {
    setFreezeDryerDetails((prev) => ({ ...prev, [key]: next }));
  }

  function handleFreezeDryerCommentsChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setFreezeDryerDetails({ ...freezeDryerDetails, comments: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    setProgress(0);
    requestAnimationFrame(() => setProgress(90));
    try {
      await submitQuote({
        productId: id,
        selections,
        ...form,
        ...(isFreezeDryer ? { freezeDryerDetails } : {}),
      });
      setProgress(100);
      setStatus('success');
      await new Promise((resolve) => setTimeout(resolve, 900));
      router.push('/thank-you');
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
      setProgress(0);
    }
  }

  return (
    <div className="max-w-7xl p-4 sm:p-8 text-left bg-white text-black rounded-lg">
      {(status === 'submitting' || status === 'success') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d0e12]/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 px-8 text-center">
            <img src="/logo.png" alt="ShopSpinco" className={`w-16 h-16 rounded-full ${status === 'submitting' ? 'animate-pulse' : ''}`} />

            <div className="w-64">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-[#f29a4e] rounded-full ease-out ${
                    status === 'success' ? 'transition-all duration-300' : 'transition-all duration-[1400ms]'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/40 tabular-nums">{progress}%</p>
            </div>

            <p className="text-white/85 text-sm font-medium">
              {status === 'success' ? (
                <span className="inline-flex items-center gap-2 text-[#4ade80]">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Email sent!
                </span>
              ) : (
                'Sending your request...'
              )}
            </p>
          </div>
        </div>
      )}

      <Link href={`/shop/${id}`} className="inline-block mb-4 text-inherit no-underline">
        &larr; Back to product
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold text-black! mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-2 items-start">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl order-2 lg:order-1">
          <input className={inputCls} name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} required />
          <input className={inputCls} name="lastName" placeholder="Last name (optional)" value={form.lastName} onChange={handleChange} />
          <input className={inputCls} name="email" type="email" placeholder="Your email" value={form.email} onChange={handleChange} required />
          <input
            className={inputCls}
            name="phone"
            type="tel"
            inputMode="numeric"
            placeholder="Phone number (10 digits)"
            value={form.phone}
            onChange={handleChange}
            pattern="[0-9]{10}"
            maxLength={10}
            title="Enter a 10-digit phone number"
            required
          />
          <input className={inputCls} name="companyName" placeholder="Company name" value={form.companyName} onChange={handleChange} required />
          <input className={inputCls} name="role" placeholder="Role" value={form.role} onChange={handleChange} required />
          <input
            className={`${inputCls} sm:col-span-2`}
            name="streetAddress"
            placeholder="Street address"
            value={form.streetAddress}
            onChange={handleChange}
            required
          />
          <input className={inputCls} name="city" placeholder="Town/City" value={form.city} onChange={handleChange} required />
          <input
            className={inputCls}
            name="state"
            list="indian-states"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            autoComplete="off"
            required
          />
          <datalist id="indian-states">
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state} />
            ))}
          </datalist>
          <input
            className={inputCls}
            name="pincode"
            type="text"
            inputMode="numeric"
            placeholder="Pincode (6 digits)"
            value={form.pincode}
            onChange={handleChange}
            pattern="[0-9]{6}"
            maxLength={6}
            title="Enter a 6-digit pincode"
            required
          />

          {isFreezeDryer && (
            <>
              <h2 className={sectionHeadingCls}>Freeze Dryer Requirements</h2>
              <p className={hintCls}>Help us tailor your quote — select all that apply.</p>

              {FREEZE_DRYER_QUESTIONS.map((question) => (
                <div className={checkboxGroupCls} key={question.key}>
                  <span className={checkboxLabelCls}>{question.label}</span>
                  <MultiSelectDropdown
                    options={question.options}
                    selected={freezeDryerDetails[question.key]}
                    onChange={(next) => setFreezeDryerField(question.key, next)}
                    placeholder="Select all that apply"
                  />
                </div>
              ))}

              <div className={checkboxGroupCls}>
                <span className={checkboxLabelCls}>8. Requirement / Comments</span>
                <textarea
                  className={inputCls}
                  placeholder="Tell us more about your requirement"
                  value={freezeDryerDetails.comments}
                  onChange={handleFreezeDryerCommentsChange}
                  rows={3}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="sm:col-span-2 inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Quote Request'}
          </button>
          {status === 'error' && <p className="error sm:col-span-2">{error}</p>}
        </form>

        <div className="order-1 p-4 lg:order-2 lg:sticky lg:top-8 border border-black/10 rounded-xl overflow-hidden bg-black/[0.03]">
          <div className="w-full aspect-square bg-black/5">
            {productImage && <img className="w-full h-full object-cover" src={productImage} alt={productName} />}
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-black!">{productName}</h2>

            {selections && selections.length > 0 && (
              <div className="mt-3 flex flex-col divide-y divide-black/10 border-t border-black/10">
                {selections.map((s) => (
                  <div className="flex flex-row items-center justify-between gap-3 py-2 text-sm" key={s.group}>
                    <span className="text-black/50">{s.group}</span>
                    <span className="text-black/90 text-right">{s.option}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
