# Content AI — Go live deployment guide

This package includes the full app source, PostgreSQL schema, and Docker database setup.

## What's included

| Part | Path |
|------|------|
| Frontend (marketing + account) | `/src`, `index.html`, `vite.config.ts` |
| Admin portal | `/admin` |
| API server | `/server` |
| Database schema | `/server/src/db/schema.sql` |
| DB migrate script | `/server/src/db/migrate.ts` |
| Docker Postgres | `/docker-compose.yml` |
| Env templates | `.env.example`, `/server/.env.example` |

Secrets (`.env` files) are **not** included — copy from `.env.example` on the server.

---

## 1. Server requirements

- Node.js 20+
- PostgreSQL 16+ (or use included `docker-compose.yml`)
- A domain with HTTPS (recommended for OAuth social publish)

---

## 2. Database setup

### Option A — Docker (easiest)

```bash
docker compose up -d
cd server
cp .env.example .env
# Edit .env → DATABASE_URL=postgresql://postgres:postgres@localhost:5432/content_ai
npm install
npm run db:migrate
```

### Option B — Managed Postgres (Railway, Supabase, RDS, etc.)

1. Create a database named `content_ai`
2. Set `DATABASE_URL` in `server/.env`
3. Run:

```bash
cd server
npm install
npm run db:migrate
```

Optional — seed public blog posts:

```bash
npm run db:seed:blog
```

---

## 3. Environment variables

### Root `.env` (frontend build)

```bash
cp .env.example .env
```

| Variable | Example |
|----------|---------|
| `VITE_SITE_URL` | `https://yourdomain.com` |

### `server/.env` (API)

```bash
cd server
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `3001`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random string (required) |
| `APP_URL` | Public frontend URL |
| `API_URL` | Public API URL (for OAuth callbacks) |
| `CORS_ORIGIN` | Frontend origin(s), comma-separated |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin user (created on migrate) |
| `SMTP_*` | Email for verification codes |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | Social add-ons |
| `X_CLIENT_ID` / `X_CLIENT_SECRET` | Social add-ons |
| `META_APP_ID` / `META_APP_SECRET` | Facebook / Instagram add-ons |
| Stripe / Razorpay keys | Billing (if used) |

**OAuth callback URL** (register in each developer app):

```
https://YOUR-API-DOMAIN/api/social-content/addons/oauth/callback
```

---

## 4. Install & build

From project root:

```bash
npm install
npm install --prefix server
npm install --prefix admin

# Migrate database
npm run db:migrate

# Production builds
npm run build
npm run build --prefix admin   # if admin has build script
```

Serve API:

```bash
cd server
NODE_ENV=production npm start
```

Serve frontend static files from `/dist` and admin from `/admin/dist` behind nginx or your host.

---

## 5. Production checklist

- [ ] Strong `JWT_SECRET` set
- [ ] `VITE_SITE_URL` matches live domain
- [ ] `APP_URL` and `CORS_ORIGIN` match frontend
- [ ] `API_URL` set for social OAuth callbacks
- [ ] HTTPS enabled
- [ ] `npm run db:migrate` completed on production DB
- [ ] SMTP configured for sign-up / password emails
- [ ] Social OAuth apps created (LinkedIn, X, Meta) if using live publish
- [ ] Stripe/Razorpay live keys if accepting payments

---

## 6. Default admin (after migrate)

If `ADMIN_EMAIL` is set in `server/.env`, migrate creates an admin user. Sign in at `/admin` with that email and `ADMIN_PASSWORD`.

Change the password after first login.

---

## Support

Re-run migrations after updates:

```bash
cd server && npm run db:migrate
```

Database schema is idempotent (`IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`).
