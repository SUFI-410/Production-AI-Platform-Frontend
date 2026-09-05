import { useQuery } from "@tanstack/react-query";
import { getBillingStatus } from "../api/billing/billing";

export const BILLING_STATUS_QUERY_KEY = ["billing-status"] as const;

export function useBillingStatus(organizationId: string | null) {
  return useQuery({
    queryKey: [...BILLING_STATUS_QUERY_KEY, organizationId],
    queryFn: getBillingStatus,
    enabled: organizationId !== null,
    retry: false,
    refetchInterval: 30_000,
  });
}
