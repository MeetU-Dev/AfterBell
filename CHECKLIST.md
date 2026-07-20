# AfterBell – Verification & Email Checklist

## What was checked

### Backend
- **Auth** (`server/controllers/auth.js`): Register (teen + parent), login, GET/POST verify-parent, GET /me. Email normalized to lowercase for register and login.
- **Email** (`server/utils/email.js`): Nodemailer; sends only when `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` are set in env.
- **Parent** (`server/controllers/parent.js`): GET /parent/teens, DELETE /parent/teens/:teenId (unlink).
- **Config**: `server/config/config.env` loaded via `dotenv` in `server.js`; optional SMTP vars documented.

### Frontend
- **AuthContext**: Login, register, logout; fetches `/api/v1/auth/me` on load when token exists; stores `verifiedByParent` for teens.
- **SignUpPage**: Student/Parent toggle; parent email required for teens; shows `parentVerifyUrl` in dev when SMTP not set.
- **VerifyParentPage**: Reads `?token=...`, GET verify-parent/:token, POST verify-parent; saves token and redirects to parent dashboard.
- **TeenVerifyBanner**: Shown for teens when `verifiedByParent !== true` (dismissible).
- **ParentDashboardPage**: Lists linked teens, completed skills, Refresh button, Remove (unlink) per teen.

### Flow
1. Teen signs up with parent email → backend creates teen, sends email if SMTP set, else returns `parentVerifyUrl` in response.
2. Parent opens link → VerifyParentPage → parent sets password and approves → teen marked verified, parent logged in.
3. Parent dashboard shows linked teens; parent can unlink. Teen sees banner until verified.

---

## Enabling real verification email (your mail)

To send real verification emails to the parent address:

1. Open **`server/config/config.env`**.
2. Uncomment and set SMTP variables. Example for Gmail (use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password):

   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=AfterBell <your-email@gmail.com>
   ```

3. Restart the server (`npm run dev` in `server/`).

If you share the **SMTP provider** (e.g. Gmail, SendGrid, Mailtrap) and whether you prefer to use your own address or a test one, the exact values can be tailored (e.g. SendGrid host/port, or Mailtrap for dev-only testing).
