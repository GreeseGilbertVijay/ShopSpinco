import Link from 'next/link';
import { buttonClasses } from './Button';

export default function FormActionBar({
  formId,
  submitLabel,
  submittingLabel = 'Saving...',
  status,
  successMessage,
  errorMessage,
  cancelHref,
}: {
  formId: string;
  submitLabel: string;
  submittingLabel?: string;
  status: 'idle' | 'submitting' | 'success' | 'error';
  successMessage?: string;
  errorMessage?: string;
  cancelHref?: string;
}) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 mt-8 -mx-4 sm:-mx-8 border-t border-gray-200 bg-white/90 backdrop-blur px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm">
        {status === 'success' && successMessage && <span className="success">{successMessage}</span>}
        {status === 'error' && errorMessage && <span className="error">{errorMessage}</span>}
      </div>
      <div className="flex items-center gap-3 ml-auto">
        {cancelHref && (
          <Link href={cancelHref} className={buttonClasses({ variant: 'secondary' })}>
            Cancel
          </Link>
        )}
        <button type="submit" form={formId} disabled={status === 'submitting'} className={buttonClasses({ size: 'lg' })}>
          {status === 'submitting' ? submittingLabel : submitLabel}
        </button>
      </div>
    </div>
  );
}
