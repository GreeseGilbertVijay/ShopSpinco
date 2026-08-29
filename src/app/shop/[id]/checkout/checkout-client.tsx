'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct, submitQuote, type QuoteSelection, type FreezeDryerDetails } from '@/lib/api';
import { INDIAN_STATES } from '@/data/indianStates';
import { useCheckoutSelection } from '@/components/CheckoutSelectionProvider';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import Card from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';
import { inputClassName, Textarea } from '@/components/ui/Input';
import { buttonClasses } from '@/components/ui/Button';

const inputCls = inputClassName;
const checkboxGroupCls = 'sm:col-span-2 flex flex-col gap-1.5';
const checkboxLabelCls = 'text-sm font-medium text-gray-800';

type FreezeDryerListField = keyof Omit<FreezeDryerDetails, 'comments'>;

const FREEZE_DRYER_QUESTIONS: { key: FreezeDryerListField; label: string; options: string[] }[] = [
  {
    key: 'primaryApplicationField',
    label: 'What is Primary Application Field',
    options: ['Food', 'Pharma', 'Agro', 'Diagnostics', 'Others'],
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
    primaryApplicationField: [],
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

  if (loadStatus === 'loading') {
    return (
      <div className="max-w-7xl p-8">
        <div className="skeleton h-6 w-40 rounded-md mb-4" />
        <div className="skeleton h-64 w-full rounded-xl" />
      </div>
    );
  }
  if (loadStatus === 'error') {
    return (
      <div className="max-w-7xl p-8">
        <p className="text-gray-700">Product not found.</p>
        <Link href="/" className="text-accent-hover no-underline hover:underline">
          Back to shop
        </Link>
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

    if (isFreezeDryer) {
      if (freezeDryerDetails.primaryApplicationField.length === 0) {
        setStatus('error');
        setError('Please select a Primary Application Field.');
        return;
      }
      if (!freezeDryerDetails.comments.trim()) {
        setStatus('error');
        setError('Please provide a brief explanation.');
        return;
      }
    }

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
    <div className="max-w-6xl p-4 sm:p-8 text-left bg-white">
      {(status === 'submitting' || status === 'success') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 px-8 text-center">
            <img src="/logo.png" alt="ShopSpinco" className={`w-16 h-16 rounded-full ${status === 'submitting' ? 'animate-pulse' : ''}`} />

            <div className="w-64">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-accent rounded-full ease-out ${
                    status === 'success' ? 'transition-all duration-300' : 'transition-all duration-[1400ms]'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/40 tabular-nums">{progress}%</p>
            </div>

            <p className="text-white/85 text-sm font-medium">
              {status === 'success' ? (
                <span className="inline-flex items-center gap-2 text-success">
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

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-4 text-sm text-gray-500">
        <Link href="/" className="no-underline text-gray-500 hover:text-gray-900 transition-colors">
          Shop
        </Link>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <Link href={`/shop/${id}`} className="no-underline text-gray-500 hover:text-gray-900 transition-colors truncate">
          {productName}
        </Link>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="text-gray-900 font-medium">Quote</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900! mb-6">Request a Quote</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 order-2 lg:order-1">
          <Card className="p-5 sm:p-6">
            <SectionHeading title="Your Details" subtitle="Who should we send this quote to?" className="mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inputCls} name="firstName" placeholder="First Name *" value={form.firstName} onChange={handleChange} required />
              <input className={inputCls} name="lastName" placeholder="Last Name *" value={form.lastName} onChange={handleChange} required />
              <input className={inputCls} name="email" type="email" placeholder="Your Email *" value={form.email} onChange={handleChange} required />
              <input
                className={inputCls}
                name="phone"
                type="tel"
                inputMode="numeric"
                placeholder="Phone Number (10 digits) *"
                value={form.phone}
                onChange={handleChange}
                pattern="[0-9]{10}"
                maxLength={10}
                title="Enter a 10-digit phone number"
                required
              />
              <input className={inputCls} name="companyName" placeholder="Company Name *" value={form.companyName} onChange={handleChange} required />
              <input className={inputCls} name="role" placeholder="Role *" value={form.role} onChange={handleChange} required />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Shipping address" className="mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className={`${inputCls} sm:col-span-2`}
                name="streetAddress"
                placeholder="Street Address *"
                value={form.streetAddress}
                onChange={handleChange}
                required
              />
              <input className={inputCls} name="city" placeholder="Town/City *" value={form.city} onChange={handleChange} required />
              <input
                className={inputCls}
                name="state"
                list="indian-states"
                placeholder="State *"
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
                placeholder="Pincode (6 digits) *"
                value={form.pincode}
                onChange={handleChange}
                pattern="[0-9]{6}"
                maxLength={6}
                title="Enter a 6-digit pincode"
                required
              />
            </div>
          </Card>

          {isFreezeDryer && (
            <Card className="p-5 sm:p-6">
              <SectionHeading
                title="Freeze dryer requirements"
                subtitle="Help us tailor your quote — select what applies."
                className="mb-4"
              />
              <div className="grid grid-cols-1 gap-4">
                {FREEZE_DRYER_QUESTIONS.map((question) => (
                  <div className={checkboxGroupCls} key={question.key}>
                    <span className={checkboxLabelCls}>{question.label} *</span>
                    <MultiSelectDropdown
                      options={question.options}
                      selected={freezeDryerDetails[question.key]}
                      onChange={(next) => setFreezeDryerField(question.key, next)}
                      placeholder="Select Options"
                    />
                  </div>
                ))}

                <div className={checkboxGroupCls}>
                  <span className={checkboxLabelCls}>Brief Explanation *</span>
                  <Textarea
                    placeholder="Tell us more about your requirement"
                    value={freezeDryerDetails.comments}
                    onChange={handleFreezeDryerCommentsChange}
                    rows={3}
                    required
                  />
                </div>
              </div>
            </Card>
          )}

          <button
            type="submit"
            className={buttonClasses({ variant: 'primary', size: 'lg', className: 'w-full sm:w-auto' })}
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Quote Request'}
          </button>
          {status === 'error' && <p className="error">{error}</p>}
        </form>

        <Card className="order-1 lg:order-2 lg:sticky lg:top-24 overflow-hidden">
          <div className="w-full aspect-square bg-gray-50">
            {productImage && <img className="w-full h-full object-cover" src={productImage} alt={productName} />}
          </div>
          <div className="p-5">
            <h2 className="text-lg font-semibold text-gray-900!">{productName}</h2>

            {selections && selections.length > 0 && (
              <div className="mt-3 flex flex-col divide-y divide-gray-100 border-t border-gray-100">
                {selections.map((s) => (
                  <div className="flex flex-row items-center justify-between gap-3 py-2 text-sm" key={s.group}>
                    <span className="text-gray-500">{s.group}</span>
                    <span className="text-gray-900 text-right">{s.option}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
