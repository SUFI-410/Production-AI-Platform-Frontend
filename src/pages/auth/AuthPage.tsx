import axios from "axios";
import {
  ArrowRight,
  CircleCheck,
  FileCheck2,
  LoaderCircle,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Button } from "../../components/ui/button";
import {
  useLogin,
  useRegister,
} from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";

type AuthMode = "login" | "register";

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }
  }

  return fallback;
}

const inputClassName = [
  "h-11 w-full rounded-lg border border-input",
  "bg-background/70 px-3 text-sm text-foreground",
  "outline-none transition",
  "placeholder:text-muted-foreground",
  "focus:border-primary focus:ring-2",
  "focus:ring-primary/20",
].join(" ");

function AuthPage() {
  const navigate = useNavigate();

  const accessToken = useAuthStore(
    (state) => state.accessToken,
  );

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [mode, setMode] =
    useState<AuthMode>("login");

  const [
    organizationName,
    setOrganizationName,
  ] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  if (accessToken !== null) {
    return <Navigate replace to="/" />;
  }

  const isRegistering = mode === "register";

  const isSubmitting =
    loginMutation.isPending ||
    registerMutation.isPending;

  const activeError = isRegistering
    ? registerMutation.error
    : loginMutation.error;

  const errorMessage =
    activeError === null
      ? null
      : getErrorMessage(
          activeError,
          isRegistering
            ? "Unable to create your workspace."
            : "Unable to sign in.",
        );

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    loginMutation.reset();
    registerMutation.reset();
  }

  function handleSuccess() {
    navigate("/", {
      replace: true,
    });
  }

  return (
    <main className="relative min-h-screen overflow-y-auto bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_32%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <FileCheck2
                aria-hidden="true"
                className="size-5"
              />
            </span>

            <div>
              <p className="font-semibold tracking-tight">
                Invoice Preflight
              </p>

              <p className="text-xs text-muted-foreground">
                Production AI Platform
              </p>
            </div>
          </div>

          <div className="my-16 max-w-xl lg:my-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-blue-200">
              <ShieldCheck
                aria-hidden="true"
                className="size-3.5"
              />
              Payment-readiness control
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              Catch invoice blockers before your customer does.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Compare invoices against contracts,
              SOWs, purchase orders, and billing
              instructions before submission.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur">
                <ScanSearch
                  aria-hidden="true"
                  className="size-5 text-blue-400"
                />

                <p className="mt-3 text-sm font-medium">
                  Evidence-backed extraction
                </p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Every extracted billing fact must
                  point to verified source text.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur">
                <CircleCheck
                  aria-hidden="true"
                  className="size-5 text-emerald-400"
                />

                <p className="mt-3 text-sm font-medium">
                  Deterministic decisions
                </p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Python—not the language model—decides
                  PASS, WARNING, or BLOCKER.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Built for B2B service companies managing
            customer-specific billing requirements.
          </p>
        </section>

        <section className="flex items-center justify-center border-t border-border bg-card/35 px-6 py-12 backdrop-blur-sm lg:border-l lg:border-t-0 lg:px-12">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="flex rounded-lg bg-background p-1">
                <button
                  className={[
                    "flex-1 rounded-md px-3 py-2",
                    "text-sm font-medium transition",
                    mode === "login"
                      ? "bg-card text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  onClick={() => {
                    switchMode("login");
                  }}
                  type="button"
                >
                  Sign in
                </button>

                <button
                  className={[
                    "flex-1 rounded-md px-3 py-2",
                    "text-sm font-medium transition",
                    mode === "register"
                      ? "bg-card text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  onClick={() => {
                    switchMode("register");
                  }}
                  type="button"
                >
                  Create workspace
                </button>
              </div>

              <div className="mt-7">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-blue-400">
                  <LockKeyhole
                    aria-hidden="true"
                    className="size-5"
                  />
                </div>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                  {isRegistering
                    ? "Create your workspace"
                    : "Welcome back"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {isRegistering
                    ? "Set up a secure organization workspace for invoice preflight."
                    : "Sign in to review invoices and payment-readiness findings."}
                </p>
              </div>

              <form
                className="mt-7 space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();

                  if (isRegistering) {
                    registerMutation.mutate(
                      {
                        organization_name:
                          organizationName,
                        email,
                        password,
                      },
                      {
                        onSuccess: handleSuccess,
                      },
                    );

                    return;
                  }

                  loginMutation.mutate(
                    {
                      email,
                      password,
                    },
                    {
                      onSuccess: handleSuccess,
                    },
                  );
                }}
              >
                {isRegistering ? (
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">
                      Organization name
                    </span>

                    <input
                      autoComplete="organization"
                      className={inputClassName}
                      disabled={isSubmitting}
                      maxLength={255}
                      minLength={2}
                      onChange={(event) => {
                        setOrganizationName(
                          event.target.value,
                        );
                      }}
                      placeholder="Acme Services"
                      required
                      type="text"
                      value={organizationName}
                    />
                  </label>
                ) : null}

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Work email
                  </span>

                  <input
                    autoComplete="email"
                    className={inputClassName}
                    disabled={isSubmitting}
                    onChange={(event) => {
                      setEmail(event.target.value);
                    }}
                    placeholder="you@company.com"
                    required
                    type="email"
                    value={email}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Password
                  </span>

                  <input
                    autoComplete={
                      isRegistering
                        ? "new-password"
                        : "current-password"
                    }
                    className={inputClassName}
                    disabled={isSubmitting}
                    maxLength={128}
                    minLength={
                      isRegistering ? 12 : 1
                    }
                    onChange={(event) => {
                      setPassword(event.target.value);
                    }}
                    placeholder={
                      isRegistering
                        ? "At least 12 characters"
                        : "Enter your password"
                    }
                    required
                    type="password"
                    value={password}
                  />
                </label>

                {errorMessage !== null ? (
                  <div
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200"
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                ) : null}

                <Button
                  className="h-11 w-full gap-2"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                      Please wait
                    </>
                  ) : (
                    <>
                      {isRegistering
                        ? "Create workspace"
                        : "Sign in"}
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4"
                      />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                Your documents remain isolated to your
                authenticated organization.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthPage;
