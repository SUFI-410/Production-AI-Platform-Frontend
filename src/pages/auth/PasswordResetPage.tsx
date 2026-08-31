import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { confirmPasswordReset, requestPasswordReset } from "../../api/auth/auth";
import { TurnstileWidget } from "../../components/chat/TurnstileWidget";
import { Button } from "../../components/ui/button";
import { useAuthStore } from "../../store/authStore";
import { usePreflightStore } from "../../store/preflightStore";
import { useChatStore } from "../../store/chatStore";

const inputClass = "mt-2 h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm";

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (error.response?.status === 422) {
      return "Check your email or reset link, and use a password between 12 and 128 characters.";
    }
  }
  return "The request could not be completed. Check your connection and try again.";
}

export default function PasswordResetPage({ mode }: { mode: "request" | "confirm" }) {
  const location = useLocation();

  // A fragment-only navigation can reuse this route without reloading it.
  // Remount the form so it reads the new link and clears stale form/error state.
  return (
    <PasswordResetForm
      key={`${mode}:${location.key}:${location.hash}`}
      mode={mode}
    />
  );
}

function PasswordResetForm({ mode }: { mode: "request" | "confirm" }) {
  const isConfirm = mode === "confirm";
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [token, setToken] = useState(() =>
    isConfirm ? new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "" : "",
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [verificationError, setVerificationError] = useState(false);
  const [validationError, setValidationError] = useState("");
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? "";
  const validToken = /^[A-Za-z0-9_-]{43}$/.test(token);

  useEffect(() => {
    if (isConfirm && window.location.hash) {
      // Keep the recovery secret in component memory, not browser history/storage.
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
  }, [isConfirm]);

  const onVerification = useCallback((value: string | null) => {
    setTurnstileToken(value);
    setVerificationError(false);
  }, []);
  const onVerificationError = useCallback(() => {
    setTurnstileToken(null);
    setVerificationError(true);
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isConfirm) return confirmPasswordReset(token, password);
      return requestPasswordReset(email.trim(), turnstileToken ?? "");
    },
    retry: false,
    onSuccess: () => {
      if (isConfirm) {
        setToken("");
        setPassword("");
        setConfirmation("");
        useAuthStore.getState().clearSession();
        usePreflightStore.getState().resetWorkspace();
        useChatStore.setState({
          messages: [], conversations: [], conversationId: null,
          activeConversationId: null, input: "", error: null, isSubmitting: false,
        });
        sessionStorage.removeItem("invoice-preflight-workspace");
        sessionStorage.removeItem("production-ai-platform-chat");
        queryClient.clear();
      }
    },
    onSettled: () => {
      setTurnstileToken(null);
      setResetKey((value) => value + 1);
    },
  });

  return (
    <main className="min-h-dvh overflow-y-auto bg-background px-4 py-10 text-foreground">
      <section className="mx-auto w-full min-w-0 max-w-md rounded-2xl border border-border bg-card p-5 sm:p-8">
        <Link className="text-sm text-blue-300 hover:underline" to="/auth">Back to sign in</Link>
        <h1 className="mt-6 text-2xl font-semibold">
          {isConfirm ? "Choose a new password" : "Forgot your password?"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {isConfirm
            ? "Choose 12–128 characters. After resetting, sign in again on each device. Your documents stay in your workspace."
            : "Enter the email you use for Invoice Preflight. We will email you a link if it matches an active account."}
        </p>

        {mutation.isSuccess ? (
          <div className="mt-6 space-y-4" role="status">
            <p className="text-sm leading-6">{mutation.data.message}</p>
            <Link className="block text-sm text-blue-300 hover:underline" to="/auth">Return to sign in</Link>
          </div>
        ) : isConfirm && !validToken ? (
          <div className="mt-6 space-y-4" role="alert">
            <p>This link is missing or invalid. Reopen the link from your email or request a new one.</p>
            <Link className="text-blue-300 hover:underline" to="/forgot-password">Request a new reset link</Link>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={(event) => {
            event.preventDefault();
            if (mutation.isPending) return;
            setValidationError("");
            if (isConfirm && password !== confirmation) {
              setValidationError("The passwords do not match.");
              return;
            }
            mutation.mutate();
          }}>
            {isConfirm ? (
              <>
                <label className="block text-sm font-medium">
                  New password
                  <input className={inputClass} type="password" autoComplete="new-password"
                    minLength={12} maxLength={128} required disabled={mutation.isPending}
                    value={password} onChange={(event) => setPassword(event.target.value)} />
                </label>
                <label className="block text-sm font-medium">
                  Confirm new password
                  <input className={inputClass} type="password" autoComplete="new-password"
                    minLength={12} maxLength={128} required disabled={mutation.isPending}
                    value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
                </label>
                <p className="text-xs text-muted-foreground">Do not refresh this page while entering your password. If you do, reopen the email link.</p>
              </>
            ) : (
              <>
                <label className="block text-sm font-medium">
                  Account email
                  <input className={inputClass} type="email" autoComplete="email" required
                    maxLength={320} disabled={mutation.isPending} value={email}
                    onChange={(event) => setEmail(event.target.value)} />
                </label>
                {siteKey ? (
                  <div className="max-w-full overflow-x-auto">
                    <TurnstileWidget siteKey={siteKey} resetKey={resetKey}
                      onTokenChange={onVerification} onError={onVerificationError} />
                  </div>
                ) : <p role="alert">Human verification is unavailable. Please contact support.</p>}
                {verificationError && <p role="alert">Verification failed. Reload this page and try again.</p>}
              </>
            )}
            {validationError && <p role="alert" className="text-sm text-red-300">{validationError}</p>}
            {mutation.isError && (
              <div role="alert" className="space-y-2 text-sm text-red-300">
                <p>{errorMessage(mutation.error)}</p>
                {isConfirm && <Link className="block text-blue-300 hover:underline" to="/forgot-password">Request a new reset link</Link>}
              </div>
            )}
            <Button className="w-full" type="submit"
              disabled={mutation.isPending || (!isConfirm && !turnstileToken)}>
              {mutation.isPending ? "Please wait…" : isConfirm ? "Reset password" : "Email reset link"}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
