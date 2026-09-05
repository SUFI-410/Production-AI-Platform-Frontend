import apiClient from "../client";
import type {
  BillingStatus,
  CheckoutRequest,
  CheckoutResponse,
} from "./types";

export async function createCheckout(
  request: CheckoutRequest,
): Promise<CheckoutResponse> {
  const response = await apiClient.post<CheckoutResponse>(
    "/billing/checkout",
    request,
  );

  return response.data;
}

export async function getBillingStatus(): Promise<BillingStatus> {
  const response = await apiClient.get<BillingStatus>("/billing/status");
  return response.data;
}
