import apiClient from "../client";
import type {
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
