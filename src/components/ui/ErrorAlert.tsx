"use client";

type ErrorAlertProps = {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
};

export function ErrorAlert({ title, message, actionLabel, onAction, disabled }: ErrorAlertProps) {
  return (
    <div role="alert" className="flex flex-col gap-4 rounded-xl border border-accent/20 bg-accent/5 p-5 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-start gap-3">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="mt-0.5 size-5 shrink-0 text-accent">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" />
        </svg>
        <div>
          <p className="m-0 font-medium text-ink">{title}</p>
          <p className="mb-0 mt-1 text-sm text-muted">{message}</p>
        </div>
      </div>
      <button type="button" onClick={onAction} disabled={disabled} className="secondary-button shrink-0 disabled:opacity-50">
        {actionLabel}
      </button>
    </div>
  );
}
