export type BillingPlanCode =
  | "starter"
  | "professional"
  | "business";

export type BillingInterval =
  | "monthly"
  | "annual";

export interface CheckoutRequest {
  plan_code: BillingPlanCode;
  billing_interval: BillingInterval;
}

export interface CheckoutResponse {
  transaction_id: string;
  checkout_url: string;
}

export interface BillingStatus {
  organization_id: string;
  subscription_id: string;
  plan_code: string;
  plan_name: string;
  subscription_status: string;
  access_mode: string;
  billing_interval: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  invoice_checks_used: number;
  invoice_checks_limit: number;
  invoice_checks_grace: number;
  can_run_invoice_check: boolean;
  usage_period_start: string | null;
  usage_period_end: string | null;
  documents_used: number;
  documents_limit: number;
  can_upload_document: boolean;
  users_used: number;
  users_limit: number;
  api_access: boolean;
  audit_logs: boolean;
}
