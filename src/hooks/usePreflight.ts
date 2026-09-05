import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteDocument,
  evaluateInvoicePreflight,
  listDocuments,
  uploadDocument,
} from "../api";

import { BILLING_STATUS_QUERY_KEY } from "./useBillingStatus";

const DOCUMENT_QUERY_KEY = ["tenant-documents"] as const;

export function useTenantDocuments(organizationId: string | null) {
  return useQuery({
    queryKey: [...DOCUMENT_QUERY_KEY, organizationId],
    queryFn: listDocuments,
    enabled: organizationId !== null,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: BILLING_STATUS_QUERY_KEY });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: DOCUMENT_QUERY_KEY,
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: BILLING_STATUS_QUERY_KEY });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: DOCUMENT_QUERY_KEY,
      });
    },
  });
}

export function useEvaluateInvoicePreflight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: evaluateInvoicePreflight,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: BILLING_STATUS_QUERY_KEY });
    },
  });
}
