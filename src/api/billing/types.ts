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
