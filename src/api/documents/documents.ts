import apiClient from "../client";

import type {
  BusinessDocumentType,
  TenantDocument,
} from "./types";

export interface UploadDocumentRequest {
  file: File;
  documentType: BusinessDocumentType;
}

type DocumentUploadResponse = Omit<
  TenantDocument,
  "document_type"
> & {
  document_type?: BusinessDocumentType;
};

export async function uploadDocument(
  request: UploadDocumentRequest,
): Promise<TenantDocument> {
  const formData = new FormData();

  formData.append(
    "file",
    request.file,
  );

  formData.append(
    "document_type",
    request.documentType,
  );

  const response =
    await apiClient.post<DocumentUploadResponse>(
      "/documents",
      formData,
      {
        timeout: 120000,
      },
    );

  return {
    ...response.data,
    document_type:
      response.data.document_type ??
      request.documentType,
  };
}
