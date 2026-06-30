Database files for Content AI deployment

1. schema.sql — Full PostgreSQL schema (same as server/src/db/schema.sql)
2. Run migrations: cd server && npm run db:migrate
   (migrate.ts applies schema.sql and seeds default admin)

Docker quick start:
  docker compose up -d
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/content_ai
