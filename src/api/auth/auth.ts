import apiClient from "../client";

export async function requestPasswordReset(email: string, turnstileToken: string) {
  const response = await apiClient.post<{ message: string }>(
    "/auth/password-reset/request",
    { email, turnstile_token: turnstileToken },
  );
  return response.data;
}

export async function confirmPasswordReset(token: string, password: string) {
  const response = await apiClient.post<{ message: string }>(
    "/auth/password-reset/confirm", { token, password },
  );
  return response.data;
}

import type {
  CurrentUser,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from "./types";

export async function login(
  request: LoginRequest,
): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>(
    "/auth/login",
    request,
  );

  return response.data;
}

export async function register(
  request: RegisterRequest,
): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>(
    "/auth/register",
    request,
  );

  return response.data;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await apiClient.get<CurrentUser>(
    "/auth/me",
  );

  return response.data;
}
