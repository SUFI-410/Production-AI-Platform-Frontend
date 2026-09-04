import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";

const PILOT_REQUEST_URL =
  "https://www.linkedin.com/in/sufyan-naeem-19a338277/";

const checks = [
  "Purchase-order number",
  "Payment terms",
  "Billing entity",
  "Required attachments",
];

const plans = [
  {
    name: "Starter",
    code: "starter",
    monthlyPrice: "$149",
    annualPrice: "$1,490",
    description:
      "For smaller finance teams standardizing invoice checks.",
    features: [
      "250 invoice checks / month",
      "Up to 3 users",
      "Up to 50 reference documents",
      "PASS, WARNING, and BLOCKER decisions",
      "Evidence-backed invoice review",
    ],
    featured: false,
  },
  {
    name: "Professional",
    code: "professional",
    monthlyPrice: "$399",
    annualPrice: "$3,990",
    description:
      "For growing teams that need more scale and automation.",
    features: [
      "1,000 invoice checks / month",
      "Up to 10 users",
      "Up to 500 reference documents",
      "API access",
      "Detailed audit trail",
      "Up to 2 integrations",
    ],
    featured: true,
  },
  {
    name: "Business",
    code: "business",
    monthlyPrice: "$799",
    annualPrice: "$7,990",
    description:
      "For established finance operations with higher volume.",
    features: [
      "5,000 invoice checks / month",
      "Up to 25 users",
      "Up to 2,500 reference documents",
      "API and detailed audit trail",
      "Up to 5 integrations",
      "SSO support",
    ],
    featured: false,
  },
] as const;

function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
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
                Payment readiness for B2B invoices
              </p>
            </div>
          </div>

          <Link
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:bg-card"
            to="/auth"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.2),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.13),transparent_34%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-blue-200">
              <ShieldCheck
                aria-hidden="true"
                className="size-3.5"
              />
              Private pilot for B2B service companies
            </span>

            <h1 className="mt-7 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">
              Catch payment-blocking invoice errors before
              submission.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Compare an invoice with contracts, SOWs,
              purchase orders, and customer billing
              instructions. Receive clear PASS, WARNING,
              and BLOCKER decisions with supporting evidence.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                href={PILOT_REQUEST_URL}
                rel="noreferrer"
                target="_blank"
              >
                Request a private pilot
                <ArrowRight
                  aria-hidden="true"
                  className="size-4"
                />
              </a>

              <Link
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold transition hover:bg-card"
                to="/auth"
              >
                Existing customer sign in
              </Link>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Guided onboarding &middot; Organization-isolated
              documents &middot; No public self-registration
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Example evaluation
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Invoice readiness
                </h2>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                <TriangleAlert
                  aria-hidden="true"
                  className="size-3.5"
                />
                Payment blocked
              </span>
            </div>

            <div className="mt-7 space-y-3">
              {checks.map((check, index) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/60 px-4 py-3"
                  key={check}
                >
                  <span className="text-sm font-medium">
                    {check}
                  </span>

                  <span
                    className={
                      index === 1
                        ? "text-xs font-semibold text-amber-300"
                        : "text-xs font-semibold text-red-300"
                    }
                  >
                    {index === 1 ? "WARNING" : "BLOCKER"}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-6 text-muted-foreground">
              Each result explains the mismatch and points
              to the customer requirement used for the decision.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-300">
            A controlled pre-submission workflow
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Move invoice review before the customer rejection.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-card p-6">
            <ScanSearch
              aria-hidden="true"
              className="size-6 text-blue-400"
            />

            <h3 className="mt-5 font-semibold">
              1. Add requirements
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Upload the relevant contract, SOW, purchase
              order, or billing instructions.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6">
            <FileCheck2
              aria-hidden="true"
              className="size-6 text-cyan-400"
            />

            <h3 className="mt-5 font-semibold">
              2. Evaluate the invoice
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Compare the final invoice with the selected
              customer requirements before sending it.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6">
            <CheckCircle2
              aria-hidden="true"
              className="size-6 text-emerald-400"
            />

            <h3 className="mt-5 font-semibold">
              3. Resolve blockers
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Correct missing POs, entity mismatches,
              payment terms, and required attachments.
            </p>
          </article>
        </div>
      </section>

      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-blue-300">
              Pricing
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Choose the capacity your finance team needs.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Monthly and annual billing are available.
              Annual plans include two months of savings.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.featured
                    ? "border-primary bg-card shadow-xl shadow-primary/10"
                    : "border-border bg-card"
                }`}
                key={plan.code}
              >
                {plan.featured ? (
                  <span className="absolute right-5 top-5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-blue-300">
                    Most popular
                  </span>
                ) : null}

                <div>
                  <h3 className="text-xl font-semibold">
                    {plan.name}
                  </h3>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-7">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Monthly
                  </p>

                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-4xl font-semibold tracking-tight">
                      {plan.monthlyPrice}
                    </span>

                    <span className="pb-1 text-sm text-muted-foreground">
                      /month
                    </span>
                  </div>

                  <Link
                    className={`mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold transition ${
                      plan.featured
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "border border-border hover:bg-background"
                    }`}
                    to={`/auth?plan=${plan.code}&interval=monthly`}
                  >
                    Choose monthly
                  </Link>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Annual
                  </p>

                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-semibold tracking-tight">
                      {plan.annualPrice}
                    </span>

                    <span className="pb-1 text-sm text-muted-foreground">
                      /year
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-emerald-400">
                    Two months free
                  </p>

                  <Link
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold transition hover:bg-background"
                    to={`/auth?plan=${plan.code}&interval=annual`}
                  >
                    Choose annual
                  </Link>
                </div>

                <div className="mt-7 border-t border-border pt-6">
                  <p className="text-sm font-semibold">
                    Included
                  </p>

                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                        key={feature}
                      >
                        <Check
                          aria-hidden="true"
                          className="mt-1 size-4 shrink-0 text-emerald-400"
                        />

                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-muted-foreground">
            Higher-volume organizations requiring more than
            5,500 invoice checks per month can contact us for
            custom Enterprise capacity.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-blue-400">
            <LockKeyhole
              aria-hidden="true"
              className="size-6"
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Private by default during the pilot
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              Workspaces are activated through signed,
              expiring invitations. Documents and evaluations
              remain isolated to the authenticated organization.
              Public visitors cannot create unlimited accounts.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          See how Invoice Preflight fits your billing workflow.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          The private pilot includes guided onboarding and a
          review of your current invoice-preparation process.
        </p>

        <a
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          href={PILOT_REQUEST_URL}
          rel="noreferrer"
          target="_blank"
        >
          Request a private pilot

          <ArrowRight
            aria-hidden="true"
            className="size-4"
          />
        </a>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>Invoice Preflight</p>
          <p>Built by Sufyan Naeem for B2B finance teams.</p>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;
