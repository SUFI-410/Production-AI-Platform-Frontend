import { expect, test } from "@playwright/test";

const token = "a".repeat(43);

test.beforeEach(async ({ page }) => {
  // Mock third parties; these tests never send email or call production APIs.
  await page.addInitScript(() => {
    window.turnstile = {
      render: (_element, options) => {
        setTimeout(() => options.callback("fake-verification"), 0);
        return "test-widget";
      },
      reset: () => {},
      remove: () => {},
    };
  });
});

test("login links to recovery; response fits mobile", async ({ page }) => {
  await page.route("**/auth/password-reset/request", async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      email: "owner@example.com", turnstile_token: "fake-verification",
    });
    await route.fulfill({ json: { message: "If an active account matches that email, a reset link will be sent." } });
  });
  await page.goto("/auth");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await page.getByLabel("Account email").fill("owner@example.com");
  await page.getByRole("button", { name: "Email reset link" }).click();
  await expect(page.getByRole("status")).toContainText("If an active account");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("mismatch does not submit; successful reset clears session", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("invoice-preflight-auth", JSON.stringify({
      version: 1, state: { accessToken: "old-session", user: null },
    }));
  });
  let requests = 0;
  await page.route("**/auth/password-reset/confirm", async (route) => {
    requests += 1;
    expect(route.request().postDataJSON()).toEqual({ token, password: "MyNewPassword123!" });
    await route.fulfill({ json: { message: "Password updated. Sign in with your new password." } });
  });
  await page.goto(`/reset-password#token=${token}`);
  await expect(page).toHaveURL(/\/reset-password$/);
  await page.getByLabel("New password", { exact: true }).fill("MyNewPassword123!");
  await page.getByLabel("Confirm new password").fill("DifferentPassword123!");
  await page.getByRole("button", { name: "Reset password", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("The passwords do not match.");
  expect(requests).toBe(0);
  await page.getByLabel("Confirm new password").fill("MyNewPassword123!");
  await page.getByRole("button", { name: "Reset password", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Password updated");
  expect(requests).toBe(1);
  const stored = await page.evaluate(() => localStorage.getItem("invoice-preflight-auth"));
  expect(JSON.parse(stored ?? "{}").state.accessToken).toBeNull();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("missing and expired links offer recovery", async ({ page }) => {
  await page.goto("/reset-password");
  await expect(page.getByRole("alert")).toContainText("missing or invalid");
  await page.route("**/auth/password-reset/confirm", (route) => route.fulfill({
    status: 400, json: { detail: "This reset link is invalid or expired. Please request a new link." },
  }));
  await page.goto(`/reset-password#token=${token}`);
  await page.getByLabel("New password", { exact: true }).fill("MyNewPassword123!");
  await page.getByLabel("Confirm new password").fill("MyNewPassword123!");
  await page.getByRole("button", { name: "Reset password", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("invalid or expired");
  await expect(page.getByRole("link", { name: "Request a new reset link" })).toBeVisible();
});

test("service unavailable and rate limit errors", async ({ page }) => {
  for (const status of [503, 429]) {
    await page.route("**/auth/password-reset/request", (route) => route.fulfill({
      status, json: { detail: status === 503 ? "Password recovery is temporarily unavailable." : "Too many attempts. Please wait 15 minutes and try again." },
    }));
    await page.goto("/forgot-password");
    await page.getByLabel("Account email").fill("owner@example.com");
    await page.getByRole("button", { name: "Email reset link" }).click();
    await expect(page.getByRole("alert")).toContainText(status === 503 ? "unavailable" : "15 minutes");
    await page.unroute("**/auth/password-reset/request");
  }
});
