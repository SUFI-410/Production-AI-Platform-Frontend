import axios from "axios";
import { initializePaddle } from "@paddle/paddle-js";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  createCheckout,
  type BillingInterval,
  type BillingPlanCode,
} from "../../api";

const PLAN_CODES = [
  "starter",
  "professional",
  "business",
] as const;

const BILLING_INTERVALS = [
  "monthly",
  "annual",
] as const;

type CheckoutPlanCode =
  (typeof PLAN_CODES)[number];

type CheckoutInterval =
  (typeof BILLING_INTERVALS)[number];

function isCheckoutPlanCode(
  value: string,
): value is CheckoutPlanCode {
  return PLAN_CODES.includes(
    value as CheckoutPlanCode,
  );
}

function isCheckoutInterval(
  value: string,
): value is CheckoutInterval {
  return BILLING_INTERVALS.includes(
    value as CheckoutInterval,
  );
}

function getErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (error.code === "ERR_NETWORK") {
      return (
        "Unable to reach the billing API. " +
        "Make sure the backend is running."
      );
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to start secure checkout.";
}

function CheckoutPage() {
  const [searchParams] = useSearchParams();

  const token =
    import.meta.env.VITE_PADDLE_CLIENT_TOKEN;

  const environment =
    import.meta.env.VITE_PADDLE_ENVIRONMENT ??
    "sandbox";

  const planParam =
    searchParams.get("plan")?.trim() ?? "";

  const intervalParam =
    searchParams.get("interval")?.trim() ?? "";

  const hasValidSelection =
    isCheckoutPlanCode(planParam) &&
    isCheckoutInterval(intervalParam);

  const configurationError = !token
    ? "Paddle checkout is not configured."
    : !hasValidSelection
      ? "Invalid checkout selection."
      : null;

  const [error, setError] = useState<
    string | null
  >(configurationError);

  const startedRef = useRef(false);

  useEffect(() => {
    if (
      configurationError !== null ||
      startedRef.current
    ) {
      return;
    }

    startedRef.current = true;

    async function startCheckout() {
      try {
        const paddle =
          await initializePaddle({
            token,
            environment:
              environment === "sandbox"
                ? "sandbox"
                : "production",
          });

        if (!paddle) {
          throw new Error(
            "Paddle failed to initialize.",
          );
        }

        const checkout =
          await createCheckout({
            plan_code:
              planParam as BillingPlanCode,
            billing_interval:
              intervalParam as BillingInterval,
          });

        paddle.Checkout.open({
          transactionId:
            checkout.transaction_id,
          settings: {
            displayMode: "overlay",
            theme: "dark",
            locale: "en",
            successUrl:
              `${window.location.origin}/invoice-preflight`,
          },
        });
      } catch (checkoutError) {
        setError(
          getErrorMessage(checkoutError),
        );
      }
    }

    void startCheckout();
  }, [
    configurationError,
    environment,
    intervalParam,
    planParam,
    token,
  ]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-black/20">
          <h1 className="text-2xl font-semibold">
            Secure checkout
          </h1>

          {error ? (
            <>
              <p
                className="mt-4 text-sm leading-6 text-destructive"
                role="alert"
              >
                {error}
              </p>

              <Link
                className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold transition hover:bg-background"
                to="/"
              >
                Return to Invoice Preflight
              </Link>
            </>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Preparing your secure payment checkout...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default CheckoutPage;
