import { isAxiosError } from "axios";
import { useBillingStatus } from "../../hooks/useBillingStatus";

function label(value: string): string {
  return value.replace(/_/g, " ");
}

function date(value: string | null): string {
  if (!value) return "Not available";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Not available"
    : parsed.toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
      });
}

export default function BillingStatusPanel({ organizationId }: {
  organizationId: string | null;
}) {
  const query = useBillingStatus(organizationId);
  const billing = query.data;
  const missingSubscription = isAxiosError(query.error) && query.error.response?.status === 404;
  const metrics: Array<{ name: string; used: number; limit: number }> = billing ? [
    { name: "Invoice checks", used: billing.invoice_checks_used, limit: billing.invoice_checks_limit },
    { name: "Stored documents", used: billing.documents_used, limit: billing.documents_limit },
    { name: "Users", used: billing.users_used, limit: billing.users_limit },
  ] : [];

  return (
    <section aria-label="Plan and usage" className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-foreground">Plan and usage</h2>
        <button type="button" disabled={query.isFetching || organizationId === null}
          onClick={() => void query.refetch()}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50">
          {query.isFetching ? "Refreshing..." : "Refresh billing"}
        </button>
      </div>
      {query.isPending && <p role="status" className="mt-3 text-sm text-muted-foreground">Loading plan and usage...</p>}
      {query.isError && (
        <p role="alert" className="mt-3 text-sm text-amber-700 dark:text-amber-300">
          {missingSubscription
            ? "No subscription was found for this workspace. If you just completed checkout, refresh shortly."
            : billing
              ? "Unable to refresh billing. The values below may be out of date."
              : "Unable to load billing details. Please try Refresh billing."}
        </p>
      )}
      {billing && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">{billing.plan_name}</span>
            {billing.billing_interval && <span className="capitalize text-muted-foreground">{label(billing.billing_interval)}</span>}
            <span className="rounded-full border border-border px-2 py-1 capitalize text-foreground">{label(billing.subscription_status)}</span>
            <span className="text-muted-foreground">Access: {label(billing.access_mode)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Billing period (UTC): {date(billing.current_period_start)} – {date(billing.current_period_end)}
            {billing.cancel_at_period_end && " · Cancellation scheduled at period end"}
          </p>
          <dl className="grid gap-3 sm:grid-cols-3">
            {metrics.map(({ name, used, limit }) => (
              <div key={name} className="rounded-xl border border-border bg-muted/20 p-3">
                <dt className="text-xs text-muted-foreground">{name}</dt>
                <dd className="mt-1 text-xl font-semibold text-foreground">{used.toLocaleString()} / {limit.toLocaleString()}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-muted-foreground">
            Invoice-check period (UTC): {date(billing.usage_period_start)} – {date(billing.usage_period_end)}.
            {billing.invoice_checks_grace > 0 && ` Includes ${billing.invoice_checks_grace} additional grace checks beyond the plan allowance.`}
          </p>
          {!billing.can_run_invoice_check && <p className="text-sm text-amber-700 dark:text-amber-300">Invoice checks are unavailable under your current billing entitlement.</p>}
          {!billing.can_upload_document && <p className="text-sm text-amber-700 dark:text-amber-300">Document uploads are unavailable under your current billing entitlement. If storage is full, delete documents you no longer need.</p>}
        </div>
      )}
    </section>
  );
}
