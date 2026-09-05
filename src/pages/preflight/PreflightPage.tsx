import { isAxiosError } from "axios";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  FileText,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  BusinessDocumentType,
  FindingSeverity,
  InvoicePreflightResult,
  PaymentReadiness,
  TenantDocument,
} from "../../api";
import {
  useDeleteDocument,
  useEvaluateInvoicePreflight,
  useTenantDocuments,
  useUploadDocument,
} from "../../hooks/usePreflight";
import { useAuthStore } from "../../store/authStore";
import { usePreflightStore } from "../../store/preflightStore";

import BillingStatusPanel from "./BillingStatusPanel";

const BILLING_DOCUMENT_TYPES: Array<{
  label: string;
  value: BusinessDocumentType;
}> = [
  { label: "Contract", value: "contract" },
  { label: "Statement of work", value: "sow" },
  { label: "Purchase order", value: "purchase_order" },
  {
    label: "Billing instructions",
    value: "billing_instructions",
  },
];

const BILLING_DOCUMENT_TYPE_VALUES = new Set<BusinessDocumentType>(
  BILLING_DOCUMENT_TYPES.map((documentType) => documentType.value),
);

function canUseForPreflight(document: TenantDocument): boolean {
  return (
    document.document_type === "invoice" ||
    BILLING_DOCUMENT_TYPE_VALUES.has(document.document_type)
  );
}

const READINESS_STYLES: Record<
  PaymentReadiness,
  { label: string; className: string; icon: ReactNode }
> = {
  READY: {
    label: "Ready to send",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  REVIEW_REQUIRED: {
    label: "Review required",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  BLOCKED: {
    label: "Payment blocked",
    className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
    icon: <CircleAlert className="h-5 w-5" />,
  },
};

const FINDING_STYLES: Record<
  FindingSeverity,
  { label: string; className: string; icon: ReactNode }
> = {
  PASS: {
    label: "Pass",
    className: "border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  WARNING: {
    label: "Warning",
    className: "border-amber-500/25 bg-amber-500/5 text-amber-700 dark:text-amber-300",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  BLOCKER: {
    label: "Blocker",
    className: "border-red-500/25 bg-red-500/5 text-red-700 dark:text-red-300",
    icon: <CircleAlert className="h-4 w-4" />,
  },
};

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The request could not be completed.";
}

function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatField(field: string | undefined): string {
  if (!field) {
    return "Document";
  }

  if (field === "po_number") {
    return "PO Number";
  }

  return field
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface SelectedFileProps {
  document: TenantDocument;
  onRemove: () => void;
}

function SelectedDocument({ document, onRemove }: SelectedFileProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/70 p-3">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <FileText className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {document.original_filename}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatField(document.document_type)} | {formatBytes(document.size_bytes)}
        </p>
      </div>

      <button
        aria-label={`Remove ${document.original_filename} from this check`}
        className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        onClick={onRemove}
        title="Remove from this check"
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface UploadPanelProps {
  acceptLabel: string;
  description: string;
  disabled?: boolean;
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
  title: string;
}

function UploadPanel({
  acceptLabel,
  description,
  disabled = false,
  isUploading,
  onUpload,
  title,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) {
      await onUpload(file);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center">
      <input
        accept=".pdf,.md,application/pdf,text/markdown,text/plain"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(event) => void handleChange(event)}
        ref={inputRef}
        type="file"
      />

      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {isUploading ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : (
          <Upload className="h-5 w-5" />
        )}
      </div>

      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      <button
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {isUploading ? "Uploading..." : "Choose file"}
      </button>

      <p className="mt-2 text-[11px] text-muted-foreground">{acceptLabel}</p>
    </div>
  );
}

function ResultPanel({ result }: { result: InvoicePreflightResult }) {
  const readiness = READINESS_STYLES[result.payment_readiness];
  const blockerCount = result.findings.filter(
    (finding) => finding.severity === "BLOCKER",
  ).length;
  const warningCount = result.findings.filter(
    (finding) => finding.severity === "WARNING",
  ).length;
  const passCount = result.findings.filter(
    (finding) => finding.severity === "PASS",
  ).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Evaluation result
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Invoice readiness
          </h2>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${readiness.className}`}>
          {readiness.icon}
          {readiness.label}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-2xl font-semibold text-emerald-600">{passCount}</p>
          <p className="text-xs text-muted-foreground">Passed</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-2xl font-semibold text-amber-600">{warningCount}</p>
          <p className="text-xs text-muted-foreground">Warnings</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-2xl font-semibold text-red-600">{blockerCount}</p>
          <p className="text-xs text-muted-foreground">Blockers</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {result.findings.map((finding, index) => {
          const style = FINDING_STYLES[finding.severity];

          return (
            <article
              className="rounded-xl border border-border bg-background/70 p-4"
              key={`${finding.field}-${index}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${style.className}`}>
                  {style.icon}
                  {style.label}
                </span>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    {formatField(finding.field)}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {finding.message}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PreflightPage() {
  const user = useAuthStore((state) => state.user);
  const billingDocuments = usePreflightStore(
    (state) => state.billingDocuments,
  );
  const invoiceDocument = usePreflightStore(
    (state) => state.invoiceDocument,
  );
  const result = usePreflightStore((state) => state.result);
  const initializeOrganization = usePreflightStore(
    (state) => state.initializeOrganization,
  );
  const addBillingDocument = usePreflightStore(
    (state) => state.addBillingDocument,
  );
  const removeBillingDocument = usePreflightStore(
    (state) => state.removeBillingDocument,
  );
  const setInvoiceDocument = usePreflightStore(
    (state) => state.setInvoiceDocument,
  );
  const setResult = usePreflightStore((state) => state.setResult);
  const resetWorkspace = usePreflightStore(
    (state) => state.resetWorkspace,
  );

  const [billingDocumentType, setBillingDocumentType] =
    useState<BusinessDocumentType>("contract");
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const evaluateMutation = useEvaluateInvoicePreflight();
  const documentsQuery = useTenantDocuments(user?.organization_id ?? null);

  useEffect(() => {
    if (user) {
      initializeOrganization(user.organization_id);
    }
  }, [initializeOrganization, user]);

  useEffect(() => {
    if (!documentsQuery.data) {
      return;
    }

    const storedDocumentIds = new Set(
      documentsQuery.data.map((document) => document.id),
    );

    for (const document of billingDocuments) {
      if (!storedDocumentIds.has(document.id)) {
        removeBillingDocument(document.id);
      }
    }

    if (
      invoiceDocument &&
      !storedDocumentIds.has(invoiceDocument.id)
    ) {
      setInvoiceDocument(null);
    }
  }, [
    billingDocuments,
    documentsQuery.data,
    invoiceDocument,
    removeBillingDocument,
    setInvoiceDocument,
  ]);

  const uploadBillingDocument = async (file: File) => {
    setError(null);

    try {
      const document = await uploadMutation.mutateAsync({
        file,
        documentType: billingDocumentType,
      });
      addBillingDocument(document);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    }
  };

  const uploadInvoice = async (file: File) => {
    setError(null);

    try {
      const document = await uploadMutation.mutateAsync({
        file,
        documentType: "invoice",
      });
      setInvoiceDocument(document);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    }
  };

  const selectStoredDocument = (document: TenantDocument) => {
    setError(null);

    if (document.document_type === "invoice") {
      setInvoiceDocument(document);
      return;
    }

    if (BILLING_DOCUMENT_TYPE_VALUES.has(document.document_type)) {
      addBillingDocument(document);
    }
  };

  const deleteStoredDocument = async (document: TenantDocument) => {
    const confirmed = window.confirm(
      `Permanently delete ${document.original_filename}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await deleteMutation.mutateAsync(document.id);
      removeBillingDocument(document.id);

      if (invoiceDocument?.id === document.id) {
        setInvoiceDocument(null);
      }
    } catch (deletionError) {
      setError(getErrorMessage(deletionError));
    }
  };

  const evaluate = async () => {
    if (!invoiceDocument || billingDocuments.length === 0) {
      return;
    }

    setError(null);

    try {
      const nextResult = await evaluateMutation.mutateAsync({
        billing_document_ids: billingDocuments.map(
          (document) => document.id,
        ),
        invoice_document_id: invoiceDocument.id,
      });
      setResult(nextResult);
    } catch (evaluationError) {
      setError(getErrorMessage(evaluationError));
    }
  };

  const canEvaluate =
    billingDocuments.length > 0 &&
    invoiceDocument !== null &&
    !uploadMutation.isPending &&
    !deleteMutation.isPending &&
    !documentsQuery.isPending &&
    !evaluateMutation.isPending;

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-muted/10">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Deterministic payment-readiness checks
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Invoice Preflight
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Compare an invoice with customer billing requirements and catch payment-blocking errors before submission.
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
            disabled={
              billingDocuments.length === 0 &&
              invoiceDocument === null &&
              result === null
            }
            onClick={() => {
              resetWorkspace();
              setError(null);
            }}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            Start over
          </button>
        </div>

        <BillingStatusPanel organizationId={user?.organization_id ?? null} />

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1
              </span>
              <div>
                <h2 className="font-semibold text-foreground">
                  Customer billing requirements
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add one or more contracts, SOWs, purchase orders, or billing instructions.
                </p>
              </div>
            </div>

            <label className="mb-3 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Document type
              <select
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={uploadMutation.isPending}
                onChange={(event) =>
                  setBillingDocumentType(
                    event.target.value as BusinessDocumentType,
                  )
                }
                value={billingDocumentType}
              >
                {BILLING_DOCUMENT_TYPES.map((documentType) => (
                  <option key={documentType.value} value={documentType.value}>
                    {documentType.label}
                  </option>
                ))}
              </select>
            </label>

            <UploadPanel
              acceptLabel="PDF or Markdown"
              description="The document is stored securely within your organization."
              isUploading={uploadMutation.isPending}
              onUpload={uploadBillingDocument}
              title="Upload billing document"
            />

            {billingDocuments.length > 0 && (
              <div className="mt-4 space-y-2">
                {billingDocuments.map((document) => (
                  <SelectedDocument
                    document={document}
                    key={document.id}
                    onRemove={() => removeBillingDocument(document.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </span>
              <div>
                <h2 className="font-semibold text-foreground">
                  Invoice to evaluate
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload the final invoice you plan to send to the customer.
                </p>
              </div>
            </div>

            <UploadPanel
              acceptLabel="PDF or Markdown"
              description="Uploading a new invoice replaces the current invoice in this workspace."
              isUploading={uploadMutation.isPending}
              onUpload={uploadInvoice}
              title={invoiceDocument ? "Replace invoice" : "Upload invoice"}
            />

            {invoiceDocument && (
              <div className="mt-4">
                <SelectedDocument
                  document={invoiceDocument}
                  onRemove={() => setInvoiceDocument(null)}
                />
              </div>
            )}
          </section>
        </div>

        <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="font-semibold text-foreground">Stored documents</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select documents for the current check or permanently delete files your organization no longer needs.
            </p>
          </div>

          {documentsQuery.isPending && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading stored documents...
            </div>
          )}

          {documentsQuery.isError && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{getErrorMessage(documentsQuery.error)}</p>
            </div>
          )}

          {documentsQuery.data?.length === 0 && (
            <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              No stored documents yet.
            </p>
          )}

          {documentsQuery.data && documentsQuery.data.length > 0 && (
            <div className="mt-4 space-y-2">
              {documentsQuery.data.map((document) => {
                const isSelected =
                  invoiceDocument?.id === document.id ||
                  billingDocuments.some((item) => item.id === document.id);
                const isDeleting =
                  deleteMutation.isPending &&
                  deleteMutation.variables === document.id;

                return (
                  <div
                    className="flex flex-col gap-3 rounded-xl border border-border bg-background/70 p-3 sm:flex-row sm:items-center"
                    key={document.id}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {document.original_filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatField(document.document_type)} | {formatBytes(document.size_bytes)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canUseForPreflight(document) && (
                        <button
                          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isSelected || deleteMutation.isPending}
                          onClick={() => selectStoredDocument(document)}
                          type="button"
                        >
                          {isSelected ? "Selected" : "Use in check"}
                        </button>
                      )}

                      <button
                        aria-label={`Permanently delete ${document.original_filename}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={deleteMutation.isPending}
                        onClick={() => void deleteStoredDocument(document)}
                        type="button"
                      >
                        {isDeleting ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                3
              </span>
              <div>
                <h2 className="font-semibold text-foreground">
                  Run payment-readiness check
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Final PASS, WARNING, and BLOCKER decisions are made by deterministic application rules.
                </p>
              </div>
            </div>

            <button
              className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canEvaluate}
              onClick={() => void evaluate()}
              type="button"
            >
              {evaluateMutation.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <FileCheck2 className="h-4 w-4" />
              )}
              {evaluateMutation.isPending
                ? "Evaluating invoice..."
                : "Evaluate invoice"}
            </button>
          </div>
        </section>

        {result && (
          <div className="mt-5">
            <ResultPanel result={result} />
          </div>
        )}
      </div>
    </main>
  );
}

export default PreflightPage;
