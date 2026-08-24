import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import type { TenantDocument } from "../api/documents/types";
import type { InvoicePreflightResult } from "../api/preflight/types";

interface PreflightState {
  organizationId: string | null;
  billingDocuments: TenantDocument[];
  invoiceDocument: TenantDocument | null;
  result: InvoicePreflightResult | null;

  initializeOrganization: (
    organizationId: string,
  ) => void;

  addBillingDocument: (
    document: TenantDocument,
  ) => void;

  removeBillingDocument: (
    documentId: string,
  ) => void;

  setInvoiceDocument: (
    document: TenantDocument | null,
  ) => void;

  setResult: (
    result: InvoicePreflightResult | null,
  ) => void;

  resetWorkspace: () => void;
}

interface PreflightData {
  organizationId: string | null;
  billingDocuments: TenantDocument[];
  invoiceDocument: TenantDocument | null;
  result: InvoicePreflightResult | null;
}

function createInitialData(): PreflightData {
  return {
    organizationId: null,
    billingDocuments: [],
    invoiceDocument: null,
    result: null,
  };
}

export const usePreflightStore =
  create<PreflightState>()(
    persist(
      (set) => ({
        ...createInitialData(),

        initializeOrganization: (
          organizationId,
        ) => {
          set((state) => {
            if (
              state.organizationId ===
              organizationId
            ) {
              return state;
            }

            return {
              ...createInitialData(),
              organizationId,
            };
          });
        },

        addBillingDocument: (document) => {
          set((state) => ({
            billingDocuments: [
              ...state.billingDocuments.filter(
                (item) =>
                  item.id !== document.id,
              ),
              document,
            ],
            result: null,
          }));
        },

        removeBillingDocument: (
          documentId,
        ) => {
          set((state) => ({
            billingDocuments:
              state.billingDocuments.filter(
                (document) =>
                  document.id !== documentId,
              ),
            result: null,
          }));
        },

        setInvoiceDocument: (document) => {
          set({
            invoiceDocument: document,
            result: null,
          });
        },

        setResult: (result) => {
          set({ result });
        },

        resetWorkspace: () => {
          set((state) => ({
            ...createInitialData(),
            organizationId:
              state.organizationId,
          }));
        },
      }),
      {
        name: "invoice-preflight-workspace",
        version: 1,

        storage: createJSONStorage(
          () => sessionStorage,
        ),

        partialize: (state) => ({
          organizationId: state.organizationId,
          billingDocuments:
            state.billingDocuments,
          invoiceDocument:
            state.invoiceDocument,
          result: state.result,
        }),
      },
    ),
  );
