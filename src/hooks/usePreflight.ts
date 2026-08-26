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
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: DOCUMENT_QUERY_KEY,
      });
    },
  });
}

export function useEvaluateInvoicePreflight() {
  return useMutation({
    mutationFn: evaluateInvoicePreflight,
  });
}
