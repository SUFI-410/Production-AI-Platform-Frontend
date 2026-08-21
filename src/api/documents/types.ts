export type BusinessDocumentType =
  | "contract"
  | "sow"
  | "purchase_order"
  | "billing_instructions"
  | "invoice"
  | "supporting_evidence"
  | "other";

export interface TenantDocument {
  id: string;
  organization_id: string;
  uploaded_by_user_id: string | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  document_type: BusinessDocumentType;
  status: string;
  created_at: string;
  updated_at: string;
}
