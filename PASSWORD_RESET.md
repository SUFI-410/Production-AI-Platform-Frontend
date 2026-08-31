# Password recovery frontend

Public pages:
- `/forgot-password`: email and existing Turnstile verification.
- `/reset-password#token=...`: new password and confirmation; does not redirect
  already-signed-in users away from recovery.

Login includes **Forgot password?**. The signed-in header includes a key icon
labelled **Reset password** (with visible text on larger screens).

The confirmation page removes the token fragment from browser history and retains
it only in component memory. Reopening the email link is required after refresh.
It does not put reset tokens in browser storage. Successful reset clears local
authentication, query data, chat history and preflight workspace selection; it
does not delete server-side documents. Customers sign in with the new password.

Backend must be deployed, migrated and configured for SMTP before release. Never
add SMTP credentials to frontend environment variables. Continue using the normal
`VITE_API_URL` and `VITE_TURNSTILE_SITE_KEY`.

## Validation

```powershell
npm ci
npm run build
npm run lint
npx playwright install chromium
npm run test:password-reset
git diff --check
```

The browser tests start a local Vite server on port 4173, use a 360px viewport,
and mock email APIs and Turnstile. They never contact the production backend or
send real email. Run real-device and real-email verification separately after
deployment. CI installs Chromium and runs these tests automatically.

See backend `PASSWORD_RESET.md` for configuration, migration, limitations and
the live acceptance checklist.
