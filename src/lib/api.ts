export interface VariationOption {
  label: string;
  imageUrl: string;
}

export interface VariationGroup {
  name: string;
  options: VariationOption[];
}

export interface ProductTab {
  name: string;
  content: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description: string;
  imageUrl: string;
  images: string[];
  variationGroups: VariationGroup[];
  tabs: ProductTab[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  sku?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  variationGroups?: VariationGroup[];
  tabs?: ProductTab[];
}

export interface QuoteSelection {
  group: string;
  option: string;
}

export interface FreezeDryerDetails {
  organizationSegment: string[];
  primaryApplication: string[];
  sampleProductType: string[];
  intendedPurpose: string[];
  currentSetup: string[];
  expectedUsage: string[];
  purchaseTimeline: string[];
  comments: string;
}

export interface QuoteInput {
  productId: string;
  selections: QuoteSelection[] | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  role: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  freezeDryerDetails?: FreezeDryerDetails;
}

export interface Quote extends QuoteInput {
  _id: string;
  productName: string;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'superAdmin' | 'customer';
  isVerified: boolean;
  createdAt: string;
}

interface ApiErrorOptions {
  status?: number;
  unverified?: boolean;
}

export class ApiError extends Error {
  status?: number;
  unverified?: boolean;

  constructor(message: string, opts: ApiErrorOptions = {}) {
    super(message);
    this.status = opts.status;
    this.unverified = opts.unverified;
  }
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return data.message || fallback;
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch('/api/products');
  if (!res.ok) throw new ApiError('Failed to load products', { status: res.status });
  return res.json();
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new ApiError('Failed to load product', { status: res.status });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message || 'Login failed', { status: res.status, unverified: data.unverified });
  }
  return res.json() as Promise<{ email: string; role: string; name: string }>;
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Registration failed'), { status: res.status });
  return res.json() as Promise<{ email: string; message: string }>;
}

export async function verifyOtp(email: string, otp: string) {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Verification failed'), { status: res.status });
  return res.json() as Promise<{ email: string; role: string; name: string }>;
}

export async function resendOtp(email: string) {
  const res = await fetch('/api/auth/resend-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Failed to resend code'), { status: res.status });
  return res.json() as Promise<{ message: string }>;
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function getMe(): Promise<User> {
  const res = await fetch('/api/auth/me');
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Session expired', { status: res.status });
  }
  if (!res.ok) throw new ApiError('Failed to load profile', { status: res.status });
  return res.json();
}

export async function getUsers(role?: string): Promise<User[]> {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  const res = await fetch(`/api/auth/users${query}`);
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Session expired', { status: res.status });
  }
  if (!res.ok) throw new ApiError('Failed to load users', { status: res.status });
  return res.json();
}

export async function createProduct(product: ProductInput): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Failed to create product'), { status: res.status });
  return res.json();
}

export async function updateProduct(id: string, product: ProductInput): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Failed to update product'), { status: res.status });
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Failed to delete product'), { status: res.status });
  return res.json();
}

export async function submitQuote(quote: QuoteInput): Promise<Quote> {
  const res = await fetch('/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quote),
  });
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Failed to submit quote request'), { status: res.status });
  return res.json();
}

export async function getQuotes(): Promise<Quote[]> {
  const res = await fetch('/api/quotes');
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Session expired', { status: res.status });
  }
  if (!res.ok) throw new ApiError('Failed to load submissions', { status: res.status });
  return res.json();
}

export async function exportQuotes({ from, to }: { from?: string; to?: string } = {}): Promise<Blob> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await fetch(`/api/quotes/export${query}`);
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Session expired', { status: res.status });
  }
  if (!res.ok) throw new ApiError('Failed to export submissions', { status: res.status });
  return res.blob();
}
