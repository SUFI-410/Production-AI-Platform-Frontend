import apiClient from "../client";

import type {
  EvaluatePreflightRequest,
  InvoicePreflightResult,
} from "./types";

export async function evaluateInvoicePreflight(
  request: EvaluatePreflightRequest,
): Promise<InvoicePreflightResult> {
  const response =
    await apiClient.post<InvoicePreflightResult>(
      "/invoice-preflight/evaluate",
      request,
      {
        timeout: 300000,
      },
    );

  return response.data;
}
