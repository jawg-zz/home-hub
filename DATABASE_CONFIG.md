# Database Configuration

## Production (Dokploy)
- **Provider:** PostgreSQL 15
- **Connection:** Via docker-compose service `home-db`
- **Schema:** `prisma/schema.prisma` with `provider = "postgresql"`
- **Persistence:** Docker volume `home_db_data`

## Local Development
- **Provider:** SQLite (optional)
- **File:** `dev.db` (gitignored)
- **To use SQLite locally:** Temporarily change `provider = "sqlite"` in schema.prisma
- **Important:** Never commit SQLite schema changes - production requires PostgreSQL

## Schema Management
Always ensure `prisma/schema.prisma` has:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Before deploying to production.
