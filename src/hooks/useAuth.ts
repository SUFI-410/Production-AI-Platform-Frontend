import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCurrentUser,
  login,
  register as registerUser,
} from "../api/auth/auth";
import type {
  CurrentUser,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from "../api/auth/types";
import { useAuthStore } from "../store/authStore";

export const currentUserQueryKey = [
  "auth",
  "current-user",
] as const;

async function completeAuthentication(
  tokenResponse: TokenResponse,
): Promise<CurrentUser> {
  const authStore = useAuthStore.getState();

  authStore.setAccessToken(
    tokenResponse.access_token,
  );

  try {
    const user = await getCurrentUser();

    authStore.setSession(
      tokenResponse.access_token,
      user,
    );

    return user;
  } catch (error) {
    authStore.clearSession();
    throw error;
  }
}

export function useCurrentUser() {
  const accessToken = useAuthStore(
    (state) => state.accessToken,
  );

  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
    enabled: accessToken !== null,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: LoginRequest,
    ) => {
      const tokenResponse = await login(request);

      return completeAuthentication(
        tokenResponse,
      );
    },
    onSuccess: (user) => {
      queryClient.setQueryData(
        currentUserQueryKey,
        user,
      );
    },
    retry: false,
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: RegisterRequest,
    ) => {
      const tokenResponse =
        await registerUser(request);

      return completeAuthentication(
        tokenResponse,
      );
    },
    onSuccess: (user) => {
      queryClient.setQueryData(
        currentUserQueryKey,
        user,
      );
    },
    retry: false,
  });
}
