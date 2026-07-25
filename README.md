# LeadDesk Mini

A small full-stack lead-capture tool built for the Digital Heroes Full Stack Development internship task.

**Live site:** https://leaddesk-mini-orcin.vercel.app
**Admin panel:** https://leaddesk-mini-orcin.vercel.app/admin

## What it does

- Public landing page with a lead capture form (name, email, budget range, message)
- Client-side and server-side validation on every field
- Submitted leads are stored in MongoDB Atlas
- An admin view (`/admin`) lists all leads with:
  - Debounced search by name or email
  - A status toggle per lead (New / Contacted / Closed)

## Tech stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API routes (serverless functions)
- **Database:** MongoDB Atlas, via Mongoose
- **Deployment:** Vercel

## Data model

Each lead document has:

| Field       | Type   | Notes                                              |
|-------------|--------|-----------------------------------------------------|
| name        | String | required                                            |
| email       | String | required, validated with a regex, stored lowercase  |
| budgetRange | String | required, one of `<$1k`, `$1k-$5k`, `$5k-$10k`, `$10k+` |
| message     | String | required                                            |
| status      | String | one of `New`, `Contacted`, `Closed`, defaults to `New` |
| createdAt   | Date   | added automatically by Mongoose timestamps          |

## API routes

- `POST /api/leads` — create a new lead (validates all fields before saving)
- `GET /api/leads?search=term` — list all leads, optionally filtered by name/email
- `PATCH /api/leads/[id]` — update a lead's status

## Running locally

```bash
npm install
```

Create a `.env.local` file with:

```
MONGODB_URI=your_mongodb_connection_string
```

Then:

```bash
npm run dev
```

Visit `http://localhost:3000` for the form, and `http://localhost:3000/admin` for the admin panel.

## Notes / assumptions

- Budget ranges are a fixed set of options rather than free text, to keep the data clean and easy to filter on later.
- The admin panel currently has no authentication — that's addressed in Task B.

---
Built for Digital Heroes Training Task — [digitalheroesco.com](https://digitalheroesco.com)