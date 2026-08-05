import {
  useEffect,
  useRef,
} from "react";

interface TurnstileRenderOptions {
  sitekey: string;
  action: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
}

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID =
  "cloudflare-turnstile-script";

const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const TURNSTILE_ACTION =
  "turnstile-spin-v2";

let turnstileScriptPromise:
  | Promise<TurnstileApi>
  | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise =
    new Promise<TurnstileApi>(
      (resolve, reject) => {
        const resolveTurnstile = () => {
          if (window.turnstile) {
            resolve(window.turnstile);
            return;
          }

          reject(
            new Error(
              "Cloudflare Turnstile did not initialize.",
            ),
          );
        };

        const rejectTurnstile = () => {
          turnstileScriptPromise = null;

          reject(
            new Error(
              "Cloudflare Turnstile could not be loaded.",
            ),
          );
        };

        const existingScript =
          document.getElementById(
            TURNSTILE_SCRIPT_ID,
          );

        if (existingScript) {
          existingScript.addEventListener(
            "load",
            resolveTurnstile,
            { once: true },
          );

          existingScript.addEventListener(
            "error",
            rejectTurnstile,
            { once: true },
          );

          return;
        }

        const script =
          document.createElement("script");

        script.id = TURNSTILE_SCRIPT_ID;
        script.src = TURNSTILE_SCRIPT_URL;
        script.async = true;
        script.defer = true;

        script.addEventListener(
          "load",
          resolveTurnstile,
          { once: true },
        );

        script.addEventListener(
          "error",
          rejectTurnstile,
          { once: true },
        );

        document.head.appendChild(script);
      },
    );

  return turnstileScriptPromise;
}

interface TurnstileWidgetProps {
  siteKey: string;
  resetKey: number;
  onTokenChange: (token: string | null) => void;
  onError: () => void;
}

export function TurnstileWidget({
  siteKey,
  resetKey,
  onTokenChange,
  onError,
}: TurnstileWidgetProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const widgetIdRef =
    useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadTurnstile()
      .then((turnstile) => {
        if (
          cancelled ||
          !containerRef.current
        ) {
          return;
        }

        widgetIdRef.current =
          turnstile.render(
            containerRef.current,
            {
              sitekey: siteKey,
              action: TURNSTILE_ACTION,
              callback: (token) => {
                onTokenChange(token);
              },
              "expired-callback": () => {
                onTokenChange(null);
              },
              "error-callback": () => {
                onTokenChange(null);
                onError();
              },
            },
          );
      })
      .catch(() => {
        if (!cancelled) {
          onTokenChange(null);
          onError();
        }
      });

    return () => {
      cancelled = true;

      const widgetId =
        widgetIdRef.current;

      if (
        widgetId &&
        window.turnstile
      ) {
        window.turnstile.remove(
          widgetId,
        );
      }

      widgetIdRef.current = null;
    };
  }, [
    onError,
    onTokenChange,
    siteKey,
  ]);

  useEffect(() => {
    const widgetId =
      widgetIdRef.current;

    if (
      resetKey > 0 &&
      widgetId &&
      window.turnstile
    ) {
      window.turnstile.reset(
        widgetId,
      );
    }
  }, [resetKey]);

  return (
    <div
      ref={containerRef}
      className="cf-turnstile"
      data-action={TURNSTILE_ACTION}
      data-sitekey={siteKey}
    />
  );
}
