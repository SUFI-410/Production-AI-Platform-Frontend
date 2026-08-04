import apiClient from "../client";

import type {
  ChatRequest,
  ChatResponse,
} from "./types";

export async function sendMessage(
  request: ChatRequest,
): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>(
    "/chat",
    request,
  );

  return response.data;
}
