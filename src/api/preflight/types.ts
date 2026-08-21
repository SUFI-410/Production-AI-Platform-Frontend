export type FindingSeverity =
  | "PASS"
  | "WARNING"
  | "BLOCKER";

export type PaymentReadiness =
  | "READY"
  | "REVIEW_REQUIRED"
  | "BLOCKED";

export type PreflightField =
  | "billing_requirements"
  | "po_number"
  | "payment_terms"
  | "billing_entity"
  | "project_code"
  | "attachments"
  | "milestone_approval";

export interface PreflightFinding {
  severity: FindingSeverity;
  field: PreflightField;
  message: string;
}

export interface InvoicePreflightResult {
  payment_readiness: PaymentReadiness;
  findings: PreflightFinding[];
}

export interface EvaluatePreflightRequest {
  billing_document_ids: string[];
  invoice_document_id: string;
}
