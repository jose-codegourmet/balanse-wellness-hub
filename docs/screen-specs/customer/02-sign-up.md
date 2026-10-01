# Customer Portal — Sign Up

```text
Create your account
[Continue with Google]
--- or ---
First name          Last name
Email
Contact number
Password
Confirm password
[Create Account]
Already have an account? [Log In]
```

Exact required profile fields remain subject to Coach Rex. No "book for someone else" option.

## First and last name (#343, #351)

- **First name** and **Last name** replace Full name. Both required, 1–50 chars, trimmed, side by side from `sm`. No other new fields (OQ-3).
- Mock **Continue with Google** prefills both from `given_name` / `family_name` when available, plus the (read-only) email. Google mode hides the password fields; the customer adds a contact number and accepts the policies, then submits. "Use email instead" returns to the email form.
- The form uses React Hook Form + `zodResolver` with colocated schema and defaults.
- Submit → `createCustomer({ firstName, lastName, email, contactNumber, attribution })` inside the `createCustomerAccount` server action. `attribution` comes from the HttpOnly `balanse_share_attr` cookie (`ref` / `src` / `via`, 30 days, last touch), written by `apps/web/src/proxy.ts` on public routes and read server-side. The cookie is cleared after sign-up.
- Success → `/portal/welcome?returnTo=<returnTo or /portal>` (onboarding, `16-onboarding.md`).
- `returnTo` is preserved through sign-up and login; only same-origin relative paths are allowed.
