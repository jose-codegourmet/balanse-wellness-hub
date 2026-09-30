# Admin Portal — Staff Account Settings

```text
MY ACCOUNT MENU
My profile                         active staff only
Studio settings                    existing granular settings permission

MY PROFILE (/my-profile)
Sign-in email                      read-only; Super Admin managed
Active role                         read-only
Schedule updates                   on/off
Daily operations summary           on/off
Security alerts                    on/off
```

`/settings` remains the admin settings destination. Business profile, public
content, payment, and policy configuration retain their existing granular
permission checks.

`/my-profile` is a self-service page for every active staff account, including
custom roles that have no other admin screen permission. It intentionally does
not allow staff to change role or sign-in identity. Those are managed through
the staff directory by authorized administrators.

The notification form is a mock-session preference only. It uses the admin form
kit and must not call `/api/*`, Supabase, or a backend mutation until that work
is explicitly authorized.
