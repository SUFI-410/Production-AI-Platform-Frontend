import { useMutation } from "@tanstack/react-query";

import {
  evaluateInvoicePreflight,
  uploadDocument,
} from "../api";

export function useUploadDocument() {
  return useMutation({
    mutationFn: uploadDocument,
  });
}

export function useEvaluateInvoicePreflight() {
  return useMutation({
    mutationFn: evaluateInvoicePreflight,
  });
}
