# Database Configuration

## Production & Development
- **Provider:** PostgreSQL 15
- **Connection:** Via docker-compose service `home-db`
- **Schema:** `prisma/schema.prisma` with `provider = "postgresql"`
- **Persistence:** Docker volume `home_db_data`

## Local Development Setup

1. Start the database:
```bash
docker-compose up -d home-db
```

2. Run migrations:
```bash
npx prisma db push
```

3. (Optional) Seed demo data:
```bash
npm run db:seed
```

## Schema Management

The schema is **PostgreSQL only**. No SQLite support.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
