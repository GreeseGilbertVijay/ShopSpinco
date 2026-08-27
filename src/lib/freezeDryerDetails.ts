import type { FreezeDryerDetails } from '@/models/Quote';

export const FREEZE_DRYER_LIST_FIELDS = [
  'organizationSegment',
  'primaryApplication',
  'sampleProductType',
  'intendedPurpose',
  'currentSetup',
  'expectedUsage',
  'purchaseTimeline',
  'primaryApplicationField',
] as const;

export function cleanFreezeDryerDetails(details: unknown): FreezeDryerDetails | undefined {
  if (!details || typeof details !== 'object') return undefined;
  const raw = details as Record<string, unknown>;

  const cleaned = {} as FreezeDryerDetails;
  for (const field of FREEZE_DRYER_LIST_FIELDS) {
    const values = Array.isArray(raw[field]) ? (raw[field] as unknown[]) : [];
    cleaned[field] = [...new Set(values.map((v) => String(v).trim()).filter(Boolean))];
  }
  cleaned.comments = typeof raw.comments === 'string' ? raw.comments.trim() : '';

  const hasContent = FREEZE_DRYER_LIST_FIELDS.some((f) => cleaned[f].length > 0) || cleaned.comments;
  return hasContent ? cleaned : undefined;
}

export function formatFreezeDryerDetails(details?: FreezeDryerDetails | null): string {
  if (!details) return '';
  const lines = FREEZE_DRYER_LIST_FIELDS.filter((f) => details[f]?.length > 0).map(
    (f) => `${f}: ${details[f].join(', ')}`
  );
  if (details.comments) lines.push(`comments: ${details.comments}`);
  return lines.join('\n');
}
