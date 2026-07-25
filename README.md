# LeadDesk Mini

A small full-stack lead-capture tool built for the Digital Heroes Full Stack Development internship task.

**Live site:** https://leaddesk-mini-orcin.vercel.app
**Admin panel:** https://leaddesk-mini-orcin.vercel.app/admin (requires login)
**Admin login:** https://leaddesk-mini-orcin.vercel.app/login

## Test credentials

- **Username:** admin
- **Password:** (shared separately with the reviewer / see submission notes)

## What it does

- Public landing page with a lead capture form (name, email, budget range, message)
- Client-side and server-side validation on every field
- Submitted leads are stored in MongoDB Atlas
- An admin view (`/admin`) lists all leads with:
  - Debounced search by name or email
  - A status toggle per lead (New / Contacted / Closed)
- The admin panel is protected by real authentication — no hardcoded credentials, no client-side-only checks

## Tech stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API routes (serverless functions)
- **Database:** MongoDB Atlas, via Mongoose
- **Auth:** bcrypt password hashing + JWT sessions in an HTTP-only cookie
- **Deployment:** Vercel

## Data model

### Lead

| Field       | Type   | Notes                                              |
|-------------|--------|-----------------------------------------------------|
| name        | String | required                                            |
| email       | String | required, validated with a regex, stored lowercase  |
| budgetRange | String | required, one of `<$1k`, `$1k-$5k`, `$5k-$10k`, `$10k+` |
| message     | String | required                                            |
| status      | String | one of `New`, `Contacted`, `Closed`, defaults to `New` |
| createdAt   | Date   | added automatically by Mongoose timestamps          |

### Admin

| Field        | Type   | Notes                                  |
|--------------|--------|------------------------------------------|
| username     | String | required, unique, stored lowercase       |
| passwordHash | String | bcrypt hash — the plain password is never stored |

## Auth approach

The admin panel is protected end to end, not just hidden behind a client-side check:

1. **Password storage:** admin passwords are hashed with `bcrypt` (10 salt rounds) before being saved. The plain password is never written to the database.
2. **Login (`POST /api/auth/login`):** looks up the admin by username, compares the submitted password against the stored hash with `bcrypt.compare`, and — if it matches — issues a signed JWT containing the admin's id and username, valid for 7 days.
3. **Session cookie:** the JWT is set as an **HTTP-only** cookie (`admin_token`), so it can't be read or stolen by client-side JavaScript (protects against XSS). `secure` is enabled in production, so the cookie only travels over HTTPS.
4. **Route protection (`src/middleware.js`):** every request to `/admin/*` is intercepted by Next.js middleware before the page ever renders. It reads the `admin_token` cookie and verifies the JWT's signature with `jose`. No valid token → redirected straight to `/login`. This means the admin page is never even sent to an unauthenticated browser, not just visually hidden.
5. **Logout (`POST /api/auth/logout`):** clears the cookie by overwriting it with an immediately-expired one.
6. **Creating an admin:** there's a one-time seed script (`scripts/createAdmin.mjs`) that hashes a password and inserts an admin document directly — this is intentionally separate from the app itself, since there's no public "sign up as admin" flow (that would defeat the point of restricting access).

## API routes

- `POST /api/leads` — create a new lead (validates all fields before saving)
- `GET /api/leads?search=term` — list all leads, optionally filtered by name/email
- `PATCH /api/leads/[id]` — update a lead's status
- `POST /api/auth/login` — verify admin credentials, issue session cookie
- `POST /api/auth/logout` — clear session cookie

## Running locally

```bash
npm install
```

Create a `.env.local` file with:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
```

Then:

```bash
npm run dev
```

Visit `http://localhost:3000` for the form, and `http://localhost:3000/admin` for the admin panel (you'll be redirected to `/login` first).

To create an admin account locally, edit the username/password at the top of `scripts/createAdmin.mjs`, then run:

```bash
$env:MONGODB_URI="your_connection_string"; node scripts/createAdmin.mjs
```

## Notes / assumptions

- Budget ranges are a fixed set of options rather than free text, to keep the data clean and easy to filter on later.
- There's no public admin sign-up — admins are created via the one-time seed script, which matches how a real internal tool would typically be bootstrapped.
- Sessions last 7 days; there's no "remember me" toggle since this is a small internal tool, not a consumer product.

---
Built for Digital Heroes Training Task — [digitalheroesco.com](https://digitalheroesco.com)