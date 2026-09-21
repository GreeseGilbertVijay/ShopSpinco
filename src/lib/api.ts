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
  brochureUrl: string;
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
  brochureUrl?: string;
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
  primaryApplicationField: string[];
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

export async function getMe(): Promise<User | null> {
  const res = await fetch('/api/auth/me');
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

export async function deleteQuote(id: string) {
  const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Session expired', { status: res.status });
  }
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Failed to delete submission'), { status: res.status });
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

export interface CytivaDayQuestionView {
  index: number;
  total: number;
  question: string;
  options: string[];
}

export interface CytivaDayAnswer {
  question: number;
  selectedOption: number | null;
  correct: boolean;
  marks: number;
  timeTakenSeconds: number;
}

export interface CytivaDayEntry {
  _id: string;
  name: string;
  status: 'in-progress' | 'completed';
  answers: CytivaDayAnswer[];
  totalScore: number;
  totalTimeSeconds: number;
  startedAt: string;
  completedAt?: string;
}

export async function startCytivaDay(name: string): Promise<{ id: string; currentQuestion: number; completed: boolean }> {
  const res = await fetch('/api/cytiva-day/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Failed to start the quiz'), { status: res.status });
  return res.json();
}

export async function getCytivaDayEntryState(id: string): Promise<{
  name: string;
  status: 'in-progress' | 'completed';
  currentQuestion: number;
  currentQuestionElapsedSeconds: number;
  totalScore: number;
  totalQuestions: number;
  marksPerQuestion: number;
  question: CytivaDayQuestionView | null;
  waiting: boolean;
  answeredCount?: number;
  totalParticipants?: number;
}> {
  const res = await fetch(`/api/cytiva-day/${id}`);
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Failed to load quiz progress'), { status: res.status });
  return res.json();
}

export async function submitCytivaDayAnswer(
  id: string,
  payload: { questionIndex: number; selectedOption: number | null }
): Promise<{ waiting?: boolean; completed?: boolean; currentQuestion?: number; question?: CytivaDayQuestionView | null }> {
  const res = await fetch(`/api/cytiva-day/${id}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 409) {
    throw new ApiError(data.message || 'Failed to submit answer', { status: res.status });
  }
  return data;
}

export interface CytivaDaySessionState {
  currentQuestion: number;
  totalQuestions: number;
  completed: boolean;
  question: { index: number; total: number; question: string; options: string[]; correctIndex: number } | null;
  currentQuestionElapsedSeconds: number;
  answeredCount: number;
  totalParticipants: number;
  optionCounts: number[];
}

export async function getCytivaDaySession(): Promise<CytivaDaySessionState> {
  const res = await fetch('/api/cytiva-day/session');
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Session expired', { status: res.status });
  }
  if (!res.ok) throw new ApiError('Failed to load quiz session', { status: res.status });
  return res.json();
}

export async function advanceCytivaDaySession(): Promise<{ currentQuestion: number; completed: boolean }> {
  const res = await fetch('/api/cytiva-day/session/next', { method: 'POST' });
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Session expired', { status: res.status });
  }
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Failed to advance the question'), { status: res.status });
  return res.json();
}

export async function getCytivaDayEntries(): Promise<{ entries: CytivaDayEntry[]; totalQuestions: number }> {
  const res = await fetch('/api/cytiva-day/entries');
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Session expired', { status: res.status });
  }
  if (!res.ok) throw new ApiError('Failed to load quiz submissions', { status: res.status });
  return res.json();
}

export async function deleteCytivaDayEntry(id: string) {
  const res = await fetch(`/api/cytiva-day/${id}`, { method: 'DELETE' });
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Session expired', { status: res.status });
  }
  if (!res.ok) throw new ApiError(await parseErrorMessage(res, 'Failed to delete submission'), { status: res.status });
  return res.json();
}

export async function exportCytivaDayEntries(): Promise<Blob> {
  const res = await fetch('/api/cytiva-day/export');
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Session expired', { status: res.status });
  }
  if (!res.ok) throw new ApiError('Failed to export quiz submissions', { status: res.status });
  return res.blob();
}
